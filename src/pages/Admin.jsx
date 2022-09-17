import { makeStyles } from '@material-ui/core/styles';
import { Typography} from '@material-ui/core';
import { useIntl } from 'gatsby-plugin-react-intl';

// Components
import SEO from '../components/SEO';
import Layout from '../components/Layout';
import LinksForm from "../components/LinksForm";

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
    disclaimerTitle: {
        color: '#e81111',
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

    return (
        <Layout>
            <SEO
                title={intl.formatMessage({ id: 'home' })}
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
                <LinksForm googleFormData={googleFormData} onSubmit={() => {}} isAdmin />
            </div>
        </Layout>
    );
};

export default HomePage;
