import { makeStyles } from '@material-ui/core/styles';
import { Typography} from '@material-ui/core';
import { useIntl } from 'gatsby-plugin-react-intl';

// Components
import SEO from '../components/SEO';
import Layout from '../components/Layout';

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
    // const { spreadsheetData } = pageContext;

    return (
        <Layout>
            <SEO
                title={intl.formatMessage({ id: 'home' })}
            />
            <Typography
                color="textPrimary"
                variant="h4"
            >
                {intl.formatMessage({ id: 'title' })}
            </Typography>

            <div
                className={classes.pageContent}
            >
                <Typography
                    className={classes.paragraph}
                    color="textPrimary"
                    variant="body1"
                >
                    {intl.formatMessage({ id: 'what_is_home_finder' })}
                </Typography>
            </div>
        </Layout>
    );
};

export default HomePage;
