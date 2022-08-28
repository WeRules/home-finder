/* global GOOGLE_FORM_ID */
import { useCallback, useState } from 'react';
import { v5 as uuid } from 'uuid';
import { Button, FormControl, TextField, Tooltip } from '@material-ui/core';
import PropTypes from 'prop-types';
import { useIntl } from 'gatsby-plugin-react-intl';
import { makeStyles } from '@material-ui/core/styles';
import { SUCCESS_MESSAGE_TYPE } from '../utils/constants';
import { setSnackbarMessage } from '../utils/gatsby-frontend-helpers';

const useStyles = makeStyles((theme) => ({
    submitButton: {
        marginTop: '20px',
    },
}));

function Form({ googleFormData, onSubmit, className = null }) {
    const intl = useIntl();
    const [isFormSubmitted, setIsFormSubmitted] = useState(false);
    const { loadData } = googleFormData;
    const classes = useStyles();
    const [links, setLinks] = useState([]);

    const formBody = loadData[1][1].map((data) => {
        const formName = data[1];
        const formType = data[3];
        const formCode = data[4][0][0];
        const isMandatory = Boolean(data[4][0][2]);

        let extraProps = {
            style: { margin: '5px 0' },
            fullWidth: true,
        };

        if (['links', 'secret'].includes(formName)) {
            extraProps = {
                ...extraProps,
                // these fields are hidden, so no need for translation
                label: formName,
                value: formName === 'links' ? '' : uuid(),
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

        return (
            <Tooltip
                key={formCode}
                placement="bottom-start"
                title={intl.formatMessage({ id: 'fill_this_want_reply' })}
            >
                <TextField
                    name={`entry.${formCode}`}
                    type="text"
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...extraProps}
                />
            </Tooltip>
        );
    });

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

    const onAddNewLink = useCallback((event) => {
        debugger;
    }, []);

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
                        title={intl.formatMessage({ id: 'fill_this_want_reply' })}
                    >
                        <TextField
                            name={`links.${i}`}
                            type="text"
                            onKeyUp={onAddNewLink}
                        />
                    </Tooltip>
                ))}
                <Tooltip
                    placement="bottom-start"
                    title={intl.formatMessage({ id: 'fill_this_want_reply' })}
                >
                    <TextField
                        name="links"
                        type="text"
                        onKeyUp={onAddNewLink}
                    />
                </Tooltip>
                <Button
                    variant="contained"
                    color="default"
                    type="submit"
                >
                    ➕
                </Button>
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
                    {intl.formatMessage({ id: 'post_comment' })}
                </Button>
            </form>
        </FormControl>
    );
}

Form.propTypes = {
    googleFormId: PropTypes.string.isRequired,
    googleFormData: PropTypes.object.isRequired,
    onSubmit: PropTypes.func.isRequired,
    className: PropTypes.string,
};

export default Form;
