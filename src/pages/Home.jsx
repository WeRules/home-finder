import { makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import { useIntl } from 'gatsby-plugin-react-intl';
import classNames from 'classnames';

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

const HomePage = () => {
    const intl = useIntl();
    const classes = useStyles();

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
                    color="textPrimary"
                    variant="h6"
                >
                    {intl.formatMessage({ id: 'what_is_home_finder' })}
                </Typography>
                <Typography
                    className={classes.paragraph}
                    color="textPrimary"
                    variant="body1"
                >
                    {intl.formatMessage({ id: 'what_is_home_finder_description' })}
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
                <Typography
                    className={classNames(classes.subtitle, classes.disclaimerTitle)}
                    color="textPrimary"
                    variant="h6"
                >
                    {intl.formatMessage({ id: 'disclaimer' })}
                </Typography>
                <Typography
                    className={classes.paragraph}
                    color="textPrimary"
                    variant="body1"
                >
                    {intl.formatMessage({ id: 'disclaimer_description_1' })}
                </Typography>
                <Typography
                    className={classes.paragraph}
                    color="textPrimary"
                    variant="body1"
                >
                    <a
                        href="https://github.com/werules/home-finder"
                        target="_blank"
                        rel="noreferrer"
                    >
                        {intl.formatMessage({ id: 'source_code' })}
                    </a>
                </Typography>
            </div>
        </Layout>
    );
};

export default HomePage;
