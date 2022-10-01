import { makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import { useIntl, navigate } from 'gatsby-plugin-react-intl';
import { useMemo } from 'react';
import { validate } from 'uuid';

// Utils
import { isClient } from '../utils/gatsby-frontend-helpers';

// Components
import SEO from '../components/SEO';
import Layout from '../components/Layout';
import AdminForm from '../components/AdminForm';

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        backgroundColor: theme.palette.background.paper,
    },
    nested: {
        paddingLeft: theme.spacing(4),
    },
    subtitle: {
        marginTop: '2px',
    },
    paragraph: {
        marginBottom: '10px',
    },
    pageContent: {
        padding: '5px',
        '& a': {
            color: '#8da4f7',
        },
        '& a:visited': {
            color: '#48578a',
        },
    },
}));

const HomePage = ({ pageContext }) => {
    const intl = useIntl();
    const classes = useStyles();
    const { googleFormData } = pageContext;

    const urlSecret = useMemo(() => {
        if (isClient()) {
            const url = new URL(window.location.href);
            return url.searchParams.get('secret');
        }

        return '';
    }, []);

    const isValidUrlSecret = validate(urlSecret);

    if (!isValidUrlSecret) {
        if (isClient()) {
            navigate('/404/');
        }

        return (
            <Layout>
                <SEO
                    title={intl.formatMessage({ id: 'admin' })}
                />
                <Typography
                    color="textPrimary"
                    variant="h4"
                >
                    {intl.formatMessage({ id: 'nothing_to_see' })}
                </Typography>
            </Layout>
        );
    }

    return (
        <Layout>
            <SEO
                title={intl.formatMessage({ id: 'admin' })}
            />
            <Typography
                color="textPrimary"
                variant="h4"
            >
                {intl.formatMessage({ id: 'admin' })}
            </Typography>
            <div
                className={classes.pageContent}
            >
                <Typography
                    className={classes.paragraph}
                    color="textPrimary"
                    variant="body1"
                >
                    {intl.formatMessage({ id: 'here_you_can_cancel' })}
                </Typography>
                <AdminForm googleFormData={googleFormData} urlSecret={urlSecret} />
            </div>
        </Layout>
    );
};

export default HomePage;
