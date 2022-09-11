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
import { isClient, setSnackbarMessage } from '../utils/gatsby-frontend-helpers';

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

function Form({ googleFormData, onSubmit, className = null, showAdminUrl = false, isAdmin = false }) {
    const intl = useIntl();
    const [isFormSubmitted, setIsFormSubmitted] = useState(false);
    const [isFormValid, setIsFormValid] = useState(isAdmin);
    const { loadData } = googleFormData;
    const classes = useStyles();
    const [links, setLinks] = useState(['']);
    // console.log(isFormValid);

    const urlSecret = useMemo(() => {
        if (isClient()) {
            const url = new URL(window.location.href);
            return url.searchParams.get('secret');
        }

        return '';
    }, []);

    const secret = useMemo(() => {
        if (urlSecret) {
            return urlSecret;
        }

        return uuid();
    }, [urlSecret]);

    const url = useMemo(() => {
        if (isClient()) {
            return window.location.href.replace(window.location.search, '');
        }

        return '';
    }, []);

    const urlWithSecret = `${url}?secret=${secret}`;
    const adminUrl = urlWithSecret.replace('/form?', '/admin?');

    const formBody = useMemo(() => {
        return loadData[1][1].map((data) => {
            const formName = data[1];
            const formType = data[3];
            const formCode = data[4][0][0];
            const isMandatory = Boolean(data[4][0][2]);
            const mock = 'test@test.com';

            let extraProps = {
                style: { margin: '5px 0' },
            };

            if (['links', 'secret', 'disable'].includes(formName)) {
                extraProps = {
                    ...extraProps,
                    // these fields are hidden, so no need for translation
                    label: formName,
                    ...formName === 'links' && { value: links.join('\n') },
                    ...formName === 'secret' && { value: secret },
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

            console.log({ formType, formName, formCode });
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
                            {...extraProps}
                            {...isAdmin && { value: mock, style: { display: 'none' } }}
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
                        {...extraProps}
                        {...isAdmin && { value: mock, style: { display: 'none' } }}
                    />
                );
            } else if (formType === CHECK_BOX_TYPE) {
                return (
                    <Checkbox
                        key={formCode}
                        name={`entry.${formCode}`}
                        {...extraProps}
                        checked={isAdmin}
                        {...isAdmin && { value: formName }}
                    />
                );
            }
        });
    }, [loadData, links, secret, intl, isFormSubmitted, isAdmin]);

    const onIframeLoad = useCallback(() => {
        // https://stackoverflow.com/a/8558731
        if (isFormSubmitted) {
            setSnackbarMessage('your_data_submitted', SUCCESS_MESSAGE_TYPE);
            // window.location = urlWithSecret;
            window.location = window.location.href;
        }
    }, [isFormSubmitted]);

    const onFormSubmit = useCallback((e) => {
        // debugger;
        // const data = Object.fromEntries(new FormData(e.target).entries());
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
        event.target.setCustomValidity('');
        if (!event.target.checkValidity()) {
            event.target.setCustomValidity(intl.formatMessage({ id: 'this_doesnt_look_like_a_link' }));
        }

        setIsFormValid(event.target.reportValidity());
    }, [intl, setIsFormValid]);

    return (
        <div>
            <FormControl className={classNames(className, classes.formWrapper)}>
                <iframe
                    title="hidden_iframe"
                    name="hidden_iframe"
                    id="hidden_iframe"
                    style={{ display: 'none' }}
                    onLoad={onIframeLoad}
                    // src={`https://docs.google.com/forms/d/e/${GOOGLE_FORM_ID}/viewform?embedded=true`}
                />
                {!isAdmin && (
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
                                    required
                                    inputProps={{ inputMode: 'text', pattern: '(?:https?):\\/\\/(\\w+:?\\w*)?(\\S+)(:\\d+)?(\\/|\\/([\\w#!:.?+=&%!\\-\\/]))?' }}
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
                )}
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
                        disabled={!isFormValid}
                    >
                        {intl.formatMessage({ id: isAdmin ? 'unsubscribe' : 'submit' })}
                    </Button>
                </form>
            </FormControl>
            {showAdminUrl && urlSecret !== null && (
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
