import { Snackbar } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { useIntl } from 'gatsby-plugin-react-intl';

function SnackBarAlert({ severity, show, messageKey, onClose }) {
    const intl = useIntl();

    return (
        <Snackbar
            open={show}
            autoHideDuration={6000}
            onClose={onClose}
        >
            <Alert
                onClose={onClose}
                severity={severity}
            >
                {(show && messageKey) && intl.formatMessage({ id: messageKey })}
            </Alert>
        </Snackbar>
    );
}

export default SnackBarAlert;
