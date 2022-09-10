const plugins = require('./gatsby-config.plugins');

const defaultLanguage = 'en';

module.exports = {
    siteMetadata: {
        title: 'Home Finder',
        author: 'blopa',
        summary: 'Find homes for you',
        defaultLanguage,
        description: 'Home Finder',
        siteUrl: 'https://blopa.github.io/home-finder/',
        social: {
            twitter: 'thepiratepablo',
        },
    },
    plugins,
};
