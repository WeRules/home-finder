require('dotenv').config({
    path: '.env',
});

const { googleFormsToJson } = require('react-google-forms-hooks');
const packageJson = require('./package.json');

const ignoredPages = ['/Home/'];
const { convertToKebabCase, getGoogleFormData } = require('./src/utils/gatsby-node-helpers');

exports.onCreatePage = async ({ page, actions }) => {
    const { createPage, deletePage } = actions;
    const { language } = page.context.intl; // from accessed site
    const matchPath = page.matchPath;
    const pagePath = convertToKebabCase(page.path);
    deletePage(page);

    if (ignoredPages.includes(page.context.intl.originalPath)) {
        return;
    }

    const googleFormData = await googleFormsToJson(
        `https://docs.google.com/forms/d/e/${process.env.GATSBY_GOOGLE_FORM_ID}/viewform?embedded=true`,
    );

    createPage({
        ...page,
        path: pagePath,
        matchPath,
        context: {
            ...page.context,
            intl: {
                ...page.context.intl,
                originalPath: convertToKebabCase(page.context.intl.originalPath),
            },
            locale: language,
            googleFormData,
        },
    });
};

exports.onCreateWebpackConfig = async ({
    plugins,
    actions,
}) => {
    // TODO this fixes the 'React Refresh Babel' error when NODE_ENV is 'local' for some reason
    if (process.env.NODE_ENV !== 'production') {
        process.env.NODE_ENV = 'development';
    }

    actions.setWebpackConfig({
        plugins: [
            plugins.define({
                VERSION: JSON.stringify(packageJson.version),
                GOOGLE_FORM_ID: JSON.stringify(process.env.GATSBY_GOOGLE_FORM_ID),
            }),
        ],
    });
};
