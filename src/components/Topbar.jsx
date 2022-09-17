import { useContext } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import MenuIcon from '@material-ui/icons/Menu';
import Hidden from '@material-ui/core/Hidden';
import { makeStyles } from '@material-ui/core/styles';
import { useIntl } from 'gatsby-plugin-react-intl';
import PropTypes from 'prop-types';

// Context
import { CustomMenuContext } from '../context/CustomMenuProvider';

// Components
import ThemeToggler from './ThemeToggler';
import MenuItems from './MenuItems';
import Link from './Link';
import SiteLogo from './SiteLogo';
import LanguageSelector from './LanguageSelector';

const useStyles = makeStyles({
    burguerMenuIcon: {
        marginRight: '15px',
        '&:hover': {
            cursor: 'pointer',
        },
    },
    rightItems: {
        marginLeft: 'auto',
        display: 'inline-flex',
    },
    appBarWrapper: {
        // zIndex: 2000,
    },
});

function Topbar({
    showLanguageSelector = true,
    onLanguageChange,
}) {
    const classes = useStyles();
    const intl = useIntl();
    const { isShowingDrawer, setIsShowingDrawer } = useContext(CustomMenuContext);

    return (
        <AppBar
            className={classes.appBarWrapper}
            position="sticky"
        >
            <Toolbar>
                <Hidden smUp>
                    <div className={classes.burguerMenuIcon}>
                        <MenuIcon
                            onClick={() => setIsShowingDrawer(!isShowingDrawer)}
                        />
                    </div>
                </Hidden>
                <Link to="/">
                    <SiteLogo />
                </Link>
                <Hidden xsDown>
                    <MenuItems />
                </Hidden>
                <div className={classes.rightItems}>
                    {showLanguageSelector && (
                        <LanguageSelector
                            currentLocale={intl.locale}
                            onLanguageChange={onLanguageChange}
                        />
                    )}
                    <ThemeToggler />
                </div>
            </Toolbar>
        </AppBar>
    );
}

Topbar.propTypes = {
    showLanguageSelector: PropTypes.bool,
};

export default Topbar;
