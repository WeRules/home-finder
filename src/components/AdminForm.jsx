import { useCallback, useMemo, useState } from 'react';
import { Button, FormControl } from '@material-ui/core';
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

function AdminForm({
    googleFormData,
    onSubmit = () => {},
    className = null,
    urlSecret,
}) {
    const intl = useIntl();
    const [isShowingSnackbar, setIsShowingSnackbar] = useState(false);
    const [isFormSubmitted, setIsFormSubmitted] = useState(false);
    const classes = useStyles();
    const formMethods = useGoogleForm({ form: googleFormData });
    const { submitToGoogleForms, formState, handleSubmit } = formMethods;
    // console.log('>>> Here are the errors!!!', formState.errors);

    const formBody = useMemo(() => {
        return googleFormData.fields.map((field) => {
            const { id, type, label } = field;
            const extraProps = {
                id,
                label,
                style: { display: 'none' },
                value: 'test@test.com',
                ...label === 'secret' && { value: urlSecret },
                ...label === 'disable' && { value: 'true' },
            };

            if (type === SHORT_ANSWER) {
                return (
                    <ShortAnswerInput
                        key={id}
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
    }, [googleFormData.fields, urlSecret]);

    const onFormSubmit = useCallback((data, event) => {
        setIsFormSubmitted(true);

        submitToGoogleForms(data).then(() => {
            event.target.reset();
            setIsShowingSnackbar(true);
            setIsFormSubmitted(false);
        });
        onSubmit();
    }, [onSubmit, submitToGoogleForms]);

    const handleCloseSnackbar = useCallback(() => {
        setIsShowingSnackbar(false);
    }, []);

    return (
        <div>
            <FormControl className={classNames(className, classes.formWrapper)}>
                <GoogleFormProvider {...formMethods}>
                    <form onSubmit={handleSubmit(onFormSubmit)}>
                        {formBody}
                        <Button
                            className={classes.submitButton}
                            variant="contained"
                            color="default"
                            type="submit"
                            key="submit-button"
                            disabled={isFormSubmitted}
                        >
                            {intl.formatMessage({ id: 'unsubscribe' })}
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

AdminForm.propTypes = {
    googleFormData: PropTypes.object.isRequired,
    className: PropTypes.string,
};

export default AdminForm;
