import { useCallback, useMemo, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { Button, FormControl, TextField, Tooltip, Checkbox, FormControlLabel, Typography } from '@material-ui/core';
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
    removeLinkButton: {
        marginLeft: '5px',
    },
    linksButtonsWrapper: {
        display: 'flex',
        marginBottom: '20px',
    },
    linksButtons: {
        marginTop: '10px',
        display: 'block',
    },
    disabledAddLinksButton: {
        ...theme?.palette?.type === 'dark' && { color: '#ffffff4d' },
        ...theme?.palette?.type !== 'dark' && { color: '#00000042' },
        boxShadow: 'none',
        cursor: 'default',
        ...theme?.palette?.type === 'dark' && { backgroundColor: '#ffffff1f' },
        ...theme?.palette?.type !== 'dark' && { backgroundColor: '#0000001f' },
        '&:hover': {
            boxShadow: 'inherit',
            ...theme?.palette?.type === 'dark' && { backgroundColor: '#ffffff1f' },
            ...theme?.palette?.type !== 'dark' && { backgroundColor: '#0000001f' },
        },
        '&:active': {
            boxShadow: 'inherit',
        }
    },
    linkInput: {
        display: 'flex',
    },
    input: {
        marginTop: '15px',
    },
    paragraph: {
        marginBottom: '10px',
    },
    formWrapper: {
        display: 'flex',
    },
    hiddenTelegramInput: {
        display: 'none',
    }
}));

function LinksForm({
    googleFormData,
    onSubmit = () => {},
    className = null,
}) {
    const intl = useIntl();
    const [isShowingSnackbar, setIsShowingSnackbar] = useState(false);
    const [isTelegramEnabled, setIsTelegramEnabled] = useState(false);
    const [isFormSubmitted, setIsFormSubmitted] = useState(false);
    const [areLinksValid, setAreLinksValid] = useState(false);
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

            switch (label) {
                case 'links':
                case 'secret':
                case 'disable': {
                    extraProps = {
                        ...extraProps,
                        // these fields are hidden, so no need for translation
                        label,
                        ...label === 'secret' && { value: secret },
                        style: { display: 'none' },
                    };

                    break;
                }

                default: {
                    extraProps = {
                        ...extraProps,
                        label: intl.formatMessage({ id: label }),
                    };

                    break;
                }
            }

            if (type === SHORT_ANSWER) {
                if (label === 'telegram_group_id') {
                    return (
                        <Tooltip
                            key={id}
                            placement="right-start"
                            title={intl.formatMessage({ id: 'telegram_group_id_description_short' })}
                        >
                            <span>
                                <ShortAnswerInput
                                    className={classNames(classes.input, { [classes.hiddenTelegramInput]: !isTelegramEnabled })}
                                    type="text"
                                    {...extraProps}
                                />
                            </span>
                        </Tooltip>
                    );
                }

                return (
                    <ShortAnswerInput
                        key={id}
                        className={classes.input}
                        type={label === 'email' ? 'email' : 'text'}
                        {...extraProps}
                    />
                );
            } else if (type === LONG_ANSWER) {
                return (
                    <LongAnswerInput
                        key={id}
                        className={classes.input}
                        {...extraProps}
                    />
                );
            }

            return null;
        });
    }, [classes.hiddenTelegramInput, classes.input, googleFormData.fields, intl, isTelegramEnabled, secret]);

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
        if (areLinksValid) {
            links.push('');
            setLinks([...links]);
            setAreLinksValid(false);
        }
    }, [areLinksValid, links]);

    const onRemovePreviousLinkField = useCallback(() => {
        links.pop();
        setLinks([...links]);
        setAreLinksValid(true);
    }, [links]);

    const handleLinkOnBlur = useCallback((event) => {
        event.target.setCustomValidity('');
        if (!event.target.checkValidity()) {
            event.target.setCustomValidity(intl.formatMessage({ id: 'this_doesnt_look_like_a_link' }));
        }

        setAreLinksValid(event.target.reportValidity());
    }, [intl, setAreLinksValid]);

    const handleCloseSnackbar = useCallback(() => {
        setIsShowingSnackbar(false);
    }, []);

    const handleTelegramCheckboxChanged = useCallback(() => {
        setIsTelegramEnabled(!isTelegramEnabled);
    }, [isTelegramEnabled]);

    return (
        <div>
            <FormControl className={classNames(className, classes.formWrapper)}>
                <div>
                    {links.map((v, i) => (
                        <Tooltip
                            key={i}
                            placement="right-start"
                            title={intl.formatMessage({ id: 'fill_here_links_sites' })}
                        >
                            <TextField
                                name={`links.${i}`}
                                type="text"
                                label={intl.formatMessage({ id: 'link' })}
                                value={links[i]}
                                onChange={onAddNewLink(i)}
                                className={classNames(classes.linkInput, classes.input)}
                                disabled={isFormSubmitted}
                                fullWidth
                                required
                                inputProps={{ inputMode: 'text', pattern: '(?:https?):\\/\\/(\\w+:?\\w*)?(\\S+)(:\\d+)?(\\/|\\/([\\w#!:.?+=&%!\\-\\/]))?' }}
                                onBlur={handleLinkOnBlur}
                            />
                        </Tooltip>
                    ))}
                    <div className={classes.linksButtonsWrapper}>
                        <Tooltip
                            placement="right-start"
                            title={intl.formatMessage({ id: 'add_more_links' })}
                        >
                            <Button
                                disableRipple={!areLinksValid}
                                className={classNames(classes.linksButtons, {
                                    [classes.disabledAddLinksButton]: !areLinksValid,
                                })}
                                variant="contained"
                                color="default"
                                onClick={onAddNewLinkField}
                            >
                                +
                            </Button>
                        </Tooltip>
                        {links.length > 1 && (
                            <Tooltip
                                placement="right-start"
                                title={intl.formatMessage({ id: 'remove_previous_link' })}
                            >
                                <Button
                                    className={classNames(classes.linksButtons, classes.removeLinkButton)}
                                    variant="contained"
                                    color="secondary"
                                    onClick={onRemovePreviousLinkField}
                                >
                                    -
                                </Button>
                            </Tooltip>
                        )}
                    </div>
                    <FormControlLabel
                        control={<Checkbox name="enable_telegram" onChange={handleTelegramCheckboxChanged} checked={isTelegramEnabled} />}
                        label={intl.formatMessage({ id: 'enable_telegram' })}
                    />
                    {isTelegramEnabled && (
                        <div>
                            <Typography
                                className={classes.paragraph}
                                color="textPrimary"
                                variant="body1"
                            >
                                {intl.formatMessage({ id: 'telegram_group_id_description' },
                                    {
                                        telegram_link: (message) => {
                                            return (
                                                <a
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    href="https://stackoverflow.com/q/32423837/4307769"
                                                >
                                                    {message}
                                                </a>
                                            );
                                        }
                                    })}
                            </Typography>
                            <Typography
                                className={classes.paragraph}
                                color="textPrimary"
                                variant="body1"
                            >
                                {intl.formatMessage({ id: 'dont_forget_to_add_telegram_bot' },
                                    {
                                        telegram_link: (message) => {
                                            return (
                                                <a
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    href="https://telegram.me/FreeHomeFinderBot"
                                                >
                                                    {message}
                                                </a>
                                            );
                                        }
                                    })}
                            </Typography>
                        </div>
                    )}
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
                            disabled={!areLinksValid || isFormSubmitted}
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
