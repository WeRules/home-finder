import { useCallback, useMemo, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { Button, FormControl, TextField, Tooltip } from '@material-ui/core';
import { GoogleFormProvider, useGoogleForm } from 'react-google-forms-hooks';
import PropTypes from 'prop-types';
import { useIntl } from 'gatsby-plugin-react-intl';
import { makeStyles } from '@material-ui/core/styles';
import classNames from 'classnames';

// Constants
import { LONG_ANSWER, SHORT_ANSWER } from './google-forms-inputs/input-types';
import { SUCCESS_MESSAGE_TYPE } from '../utils/constants';

// Components
import ShortAnswerInput from './google-forms-inputs/ShortAnswerInput';
import LongAnswerInput from './google-forms-inputs/LongAnswerInput';
import SnackBarAlert from './SnackBarAlert';

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

function LinksForm({
    googleFormData,
    onSubmit = () => {},
    className = null,
}) {
    const intl = useIntl();
    const [isShowingSnackbar, setIsShowingSnackbar] = useState(false);
    const [isFormSubmitted, setIsFormSubmitted] = useState(false);
    const [isFormValid, setIsFormValid] = useState(false);
    const classes = useStyles();
    const [links, setLinks] = useState(['']);
    const formMethods = useGoogleForm({ form: googleFormData });
    const { submitToGoogleForms, formState, handleSubmit } = formMethods;
    // console.log('>>> Here are the errors!!!', formState.errors);

    const secret = useMemo(() => uuid(), []);

    const linksFieldId = useMemo(() => {
        const linksField = googleFormData.fields.find(({label}) => label === 'links');
        return linksField.id;
    }, [googleFormData.fields]);

    const formBody = useMemo(() => {
        return googleFormData.fields.map((field) => {
            const { id, type, label, required } = field;
            let extraProps = {
                required,
                fullWidth: true,
                id,
            };

            if (['links', 'secret', 'disable'].includes(label)) {
                extraProps = {
                    ...extraProps,
                    // these fields are hidden, so no need for translation
                    label: label,
                    ...label === 'secret' && { value: secret },
                    style: { display: 'none' },
                };
            } else {
                extraProps = {
                    ...extraProps,
                    label: intl.formatMessage({ id: label }),
                };
            }

            if (type === SHORT_ANSWER) {
                return (
                    <ShortAnswerInput
                        key={id}
                        type={label === 'email' ? 'email' : 'text'}
                        {...extraProps}
                    />
                );
            } else if (type === LONG_ANSWER) {
                return (
                    <LongAnswerInput
                        key={id}
                        {...extraProps}
                    />
                );
            }

            return null;
        });
    }, [googleFormData.fields, intl, secret]);

    const onFormSubmit = useCallback((data, event) => {
        setIsFormSubmitted(true);

        data[linksFieldId] = links.filter((link) => link).join('\n');
        submitToGoogleForms(data).then(() => {
            event.target.reset();
            setLinks(['']);
            setIsShowingSnackbar(true);
            setIsFormSubmitted(false);
        });
        onSubmit();
    }, [linksFieldId, onSubmit, submitToGoogleForms, links]);

    const onAddNewLink = useCallback((index) => (event) => {
        links[index] = event.target.value;
        setLinks([...links]);
    }, [setLinks, links]);

    const onAddNewLinkField = useCallback(() => {
        links.push('');
        setLinks([...links]);
    }, [setLinks, links]);

    const handleLinkOnBlur = useCallback((event) => {
        event.target.setCustomValidity('');
        if (!event.target.checkValidity()) {
            event.target.setCustomValidity(intl.formatMessage({ id: 'this_doesnt_look_like_a_link' }));
        }

        setIsFormValid(event.target.reportValidity());
    }, [intl, setIsFormValid]);

    const handleCloseSnackbar = useCallback(() => {
        setIsShowingSnackbar(false);
    }, []);

    return (
        <div>
            <FormControl className={classNames(className, classes.formWrapper)}>
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
                <GoogleFormProvider {...formMethods}>
                    <form onSubmit={handleSubmit(onFormSubmit)}>
                        {formBody}
                        <Button
                            className={classes.submitButton}
                            variant="contained"
                            color="default"
                            type="submit"
                            key="submit-button"
                            disabled={!isFormValid || isFormSubmitted}
                        >
                            {intl.formatMessage({ id: 'submit' })}
                        </Button>
                    </form>
                </GoogleFormProvider>
            </FormControl>
            <SnackBarAlert
                onClose={handleCloseSnackbar}
                severity={SUCCESS_MESSAGE_TYPE}
                show={isShowingSnackbar}
                messageKey="your_data_submitted"
            />
        </div>
    );
}

LinksForm.propTypes = {
    googleFormData: PropTypes.object.isRequired,
    className: PropTypes.string,
};

export default LinksForm;
