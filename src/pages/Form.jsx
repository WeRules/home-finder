import { makeStyles } from '@material-ui/core/styles';
import { Typography} from '@material-ui/core';
import { useIntl } from 'gatsby-plugin-react-intl';
import classNames from "classnames";

// Components
import SEO from '../components/SEO';
import Layout from '../components/Layout';

// Constants
import LinksForm from '../components/LinksForm';

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

    return (
        <Layout>
            <SEO
                title={intl.formatMessage({ id: 'form' })}
            />
            <Typography
                color="textPrimary"
                variant="h4"
            >
                {intl.formatMessage({ id: 'fill_form' })}
            </Typography>
            <div
                className={classes.pageContent}
            >
                <Typography
                    className={classes.paragraph}
                    color="textPrimary"
                    variant="body1"
                >
                    {intl.formatMessage(
                        { id: 'add_here_the_links' },
                        {
                            funda_link: (message) => {
                                return (
                                    <a
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        href={message}
                                    >
                                        {message}
                                    </a>
                                );
                            }
                        }
                    )}
                </Typography>
                <Typography
                    className={classes.paragraph}
                    color="textPrimary"
                    variant="body1"
                >
                    {intl.formatMessage(
                        { id: 'script_frequency_explanation' },
                        {
                            deploy_instructions: (message) => {
                                return (
                                    <a
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        href="https://github.com/WeRules/home-finder#how-to-deploy"
                                    >
                                        {message}
                                    </a>
                                );
                            }
                        }
                    )}
                </Typography>
                <Typography
                    className={classNames(classes.subtitle)}
                    color="textPrimary"
                    variant="h6"
                >
                    {intl.formatMessage({ id: 'remember' })}
                </Typography>
                <Typography
                    className={classes.paragraph}
                    color="textPrimary"
                    variant="body1"
                >
                    {intl.formatMessage({ id: 'half_of_the_work' },
                        {
                            b: (message) => <b>{message}</b>
                        })}
                </Typography>
                <LinksForm googleFormData={googleFormData} />
            </div>
        </Layout>
    );
};

export default HomePage;
