/* global GOOGLE_FORM_ID */
import { useCallback, useMemo, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { Button, FormControl, TextareaAutosize, TextField, Tooltip } from '@material-ui/core';
import PropTypes from 'prop-types';
import { useIntl } from 'gatsby-plugin-react-intl';
import { makeStyles } from '@material-ui/core/styles';

// Constants
import { SUCCESS_MESSAGE_TYPE } from '../utils/constants';

// Utils
import { setSnackbarMessage } from '../utils/gatsby-frontend-helpers';

const useStyles = makeStyles((theme) => ({
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
    }
}));

const SHORT_ANSWER_TYPE = 0;
const LONG_ANSWER_TYPE = 1;

function Form({ googleFormData, onSubmit, className = null }) {
    const intl = useIntl();
    const [isFormSubmitted, setIsFormSubmitted] = useState(false);
    const { loadData } = googleFormData;
    const classes = useStyles();
    const [links, setLinks] = useState(['']);

    const formBody = useMemo(() => {
        return loadData[1][1].map((data) => {
            const formName = data[1];
            const formType = data[3];
            const formCode = data[4][0][0];
            const isMandatory = Boolean(data[4][0][2]);

            let extraProps = {
                style: { margin: '5px 0' },
                // fullWidth: true,
            };

            if (['links', 'secret'].includes(formName)) {
                extraProps = {
                    ...extraProps,
                    // these fields are hidden, so no need for translation
                    label: formName,
                    value: formName === 'links' ? links.join('\n') : uuid(),
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

            if (formType === SHORT_ANSWER_TYPE) {
                return (
                    <Tooltip
                        key={formCode}
                        placement="bottom-start"
                        title={intl.formatMessage({ id: 'fill_your_email_notification' })}
                    >
                        <TextField
                            name={`entry.${formCode}`}
                            type="text"
                            disabled={isFormSubmitted}
                            // eslint-disable-next-line react/jsx-props-no-spreading
                            {...extraProps}
                        />
                    </Tooltip>
                );
            } else {
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
            }
        });
    }, [intl, loadData, links, isFormSubmitted]);

    const onIframeLoad = useCallback(() => {
        // https://stackoverflow.com/a/8558731
        if (isFormSubmitted) {
            setSnackbarMessage('your_comment_submitted', SUCCESS_MESSAGE_TYPE);
            window.location = window.location.href;
        }
    }, [isFormSubmitted]);

    const onFormSubmit = useCallback(() => {
        setIsFormSubmitted(true);
        onSubmit();
    }, [onSubmit, setIsFormSubmitted]);

    const onAddNewLink = useCallback((index) => (event) => {
        links[index] = event.target.value;
        setLinks([...links]);
    }, [setLinks, links]);

    const onAddNewLinkField = useCallback((event) => {
        links.push('');
        setLinks([...links]);
    }, [setLinks, links]);

    return (
        <FormControl className={className}>
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
    );
}

Form.propTypes = {
    googleFormData: PropTypes.object.isRequired,
    onSubmit: PropTypes.func.isRequired,
    className: PropTypes.string,
};

export default Form;
