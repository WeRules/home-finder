/* global GOOGLE_FORM_ID */
import { useCallback, useMemo, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { Button, FormControl, TextareaAutosize, TextField, Tooltip, Typography, Checkbox } from '@material-ui/core';
import PropTypes from 'prop-types';
import { useIntl } from 'gatsby-plugin-react-intl';
import { makeStyles } from '@material-ui/core/styles';
import copy from 'clipboard-copy';
import classNames from "classnames";

// Constants
import { SUCCESS_MESSAGE_TYPE } from '../utils/constants';

// Utils
import { setSnackbarMessage } from '../utils/gatsby-frontend-helpers';

const useStyles = makeStyles((theme) => ({
    copyBlockWrapper: {
        marginTop: '20px',
    },
    copyWrapper: {
        display: 'flex',
    },
    copyButton: {
        marginLeft: '10px',
        display: 'block',
    },
    submitButton: {
        marginTop: '20px',
        display: 'block',
    },
    addLinksButton: {
        marginTop: '10px',
        display: 'block',
    },
    linkInput: {
        display: 'flex',
    },
    paragraph: {
        marginBottom: '10px',
    },
    formWrapper: {
        display: 'flex',
    }
}));

const SHORT_ANSWER_TYPE = 0;
const LONG_ANSWER_TYPE = 1;
const CHECK_BOX_TYPE = 4;

function Form({ googleFormData, onSubmit, className = null }) {
    const intl = useIntl();
    const [isFormSubmitted, setIsFormSubmitted] = useState(false);
    const [isFormValid, setIsFormValid] = useState(false);
    const { loadData } = googleFormData;
    const classes = useStyles();
    const [links, setLinks] = useState(['']);
    console.log(isFormValid);

    const urlSecret = useMemo(() => {
        const url = new URL(window.location.href);
        return url.searchParams.get('secret');
    }, []);

    const secret = useMemo(() => {
        if (urlSecret) {
            return urlSecret;
        }

        return uuid();
    }, [urlSecret]);

    const url = window.location.href.replace(window.location.search, '');
    const urlWithSecret = `${url}?secret=${secret}`;
    const adminUrl = urlWithSecret.replace('/form?', '/admin?');

    const formBody = useMemo(() => {
        return loadData[1][1].map((data) => {
            const formName = data[1];
            const formType = data[3];
            const formCode = data[4][0][0];
            const isMandatory = Boolean(data[4][0][2]);

            let extraProps = {
                style: { margin: '5px 0' },
            };

            if (['links', 'secret', 'enable'].includes(formName)) {
                extraProps = {
                    ...extraProps,
                    // these fields are hidden, so no need for translation
                    label: formName,
                    ...formName === 'links' && { value: links.join('\n') },
                    ...formName === 'links' && { value: secret },
                    style: { display: 'none' },
                };
            } else {
                extraProps = {
                    ...extraProps,
                    label: intl.formatMessage({ id: formName }),
                };
            }

            if (isMandatory) {
                extraProps = {
                    ...extraProps,
                    required: true,
                };
            }

            // console.log({formType});
            if (formType === SHORT_ANSWER_TYPE) {
                return (
                    <Tooltip
                        key={formCode}
                        placement="bottom-start"
                        title={intl.formatMessage({ id: 'fill_your_email_notification' })}
                    >
                        <TextField
                            name={`entry.${formCode}`}
                            disabled={isFormSubmitted}
                            fullWidth
                            type={formName === 'email' ? 'email' : 'text'}
                            // eslint-disable-next-line react/jsx-props-no-spreading
                            {...extraProps}
                        />
                    </Tooltip>
                );
            } else if (formType === LONG_ANSWER_TYPE) {
                return (
                    <TextareaAutosize
                        key={formCode}
                        name={`entry.${formCode}`}
                        disabled={isFormSubmitted}
                        // type="text"
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...extraProps}
                    />
                );
            } else if (formType === CHECK_BOX_TYPE) {
                return (
                    <Checkbox key={formCode} {...extraProps} checked />
                );
            }
        });
    }, [loadData, links, secret, intl, isFormSubmitted]);

    const onIframeLoad = useCallback(() => {
        // https://stackoverflow.com/a/8558731
        if (isFormSubmitted) {
            setSnackbarMessage('your_data_submitted', SUCCESS_MESSAGE_TYPE);
            window.location = urlWithSecret;
            // window.location = window.location.href;
        }
    }, [isFormSubmitted, urlWithSecret]);

    const onFormSubmit = useCallback(() => {
        setIsFormSubmitted(true);
        onSubmit();
    }, [onSubmit, setIsFormSubmitted]);

    const onAddNewLink = useCallback((index) => (event) => {
        links[index] = event.target.value;
        setLinks([...links]);
    }, [setLinks, links]);

    const onAddNewLinkField = useCallback(() => {
        links.push('');
        setLinks([...links]);
    }, [setLinks, links]);

    const handleCopySpecialURL = useCallback(() => {
        copy(adminUrl);
    }, [adminUrl]);

    const handleLinkOnBlur = useCallback((event) => {
        console.log('bluuur');
        setIsFormValid(event.target.reportValidity());
    }, [setIsFormValid]);

    const handleLinkOnInvalid = useCallback((event) => {
        // if (!event.target.checkValidity())
        event.target.setCustomValidity(intl.formatMessage({ id: 'this_doesnt_look_like_a_link' }));
        event.target.blur();
    }, [intl]);

    return (
        <div>
            <FormControl className={classNames(className, classes.formWrapper)}>
                <iframe
                    title="hidden_iframe"
                    name="hidden_iframe"
                    id="hidden_iframe"
                    style={{ display: 'none' }}
                    onLoad={onIframeLoad}
                />
                <div>
                    {links.map((v, i) => (
                        <Tooltip
                            key={i}
                            placement="bottom-start"
                            title={intl.formatMessage({ id: 'fill_here_links_sites' })}
                        >
                            <TextField
                                name={`links.${i}`}
                                type="text"
                                label={intl.formatMessage({ id: 'link' })}
                                value={links[i]}
                                onChange={onAddNewLink(i)}
                                className={classes.linkInput}
                                disabled={isFormSubmitted}
                                fullWidth
                                // TODO move this logic to when adding new links or submitting the form
                                inputProps={{ inputMode: 'text', pattern: '(?:https?):\\/\\/(\\w+:?\\w*)?(\\S+)(:\\d+)?(\\/|\\/([\\w#!:.?+=&%!\\-\\/]))?' }}
                                onInvalid={handleLinkOnInvalid}
                                onBlur={handleLinkOnBlur}
                            />
                        </Tooltip>
                    ))}
                    <Tooltip
                        placement="bottom-start"
                        title={intl.formatMessage({ id: 'add_more_links' })}
                    >
                        <Button
                            className={classes.addLinksButton}
                            variant="contained"
                            color="default"
                            type="submit"
                            onClick={onAddNewLinkField}
                        >
                            ➕
                        </Button>
                    </Tooltip>
                </div>
                <form
                    action={`https://docs.google.com/forms/d/e/${GOOGLE_FORM_ID}/formResponse`}
                    method="post"
                    onSubmit={onFormSubmit}
                    target="hidden_iframe"
                >
                    {formBody}
                    <Button
                        className={classes.submitButton}
                        variant="contained"
                        color="default"
                        type="submit"
                        key="submit-button"
                    >
                        {intl.formatMessage({ id: 'submit' })}
                    </Button>
                </form>
            </FormControl>
            {urlSecret !== null && (
                <div className={classes.copyBlockWrapper}>
                    <Typography
                        className={classes.paragraph}
                        color="textPrimary"
                        variant="body1"
                    >
                        {intl.formatMessage({ id: 'this_is_your_secret_url' })}
                    </Typography>
                    <div className={classes.copyWrapper}>
                        <TextField value={adminUrl} fullWidth />
                        <Button
                            className={classes.copyButton}
                            variant="contained"
                            color="default"
                            onClick={handleCopySpecialURL}
                        >
                            {intl.formatMessage({ id: 'copy' })}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

Form.propTypes = {
    googleFormData: PropTypes.object.isRequired,
    onSubmit: PropTypes.func.isRequired,
    className: PropTypes.string,
};

export default Form;
