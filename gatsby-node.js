require('dotenv').config({
    path: '.env',
});

// const { read, utils } = require('xlsx');
const packageJson = require('./package.json');

const ignoredPages = ['/Home/'];
const { convertToKebabCase, getGoogleFormData, downloadSpreadsheetFile } = require('./src/utils/gatsby-node-helpers');

exports.onCreatePage = async ({ page, actions }) => {
    const { createPage, deletePage } = actions;
    const { language } = page.context.intl; // from accessed site
    const matchPath = page.matchPath;
    const pagePath = convertToKebabCase(page.path);
    deletePage(page);

    if (ignoredPages.includes(page.context.intl.originalPath)) {
        return;
    }

    const googleFormData = await getGoogleFormData(process.env.GATSBY_GOOGLE_FORM_ID);
    // const spreadsheet = await downloadSpreadsheetFile(process.env.GATSBY_GOOGLE_SPREADSHEET_ID, process.env.GOOGLE_SPREADSHEET_GID);
    // const workbook = read(await spreadsheet.arrayBuffer(), { type: 'array' });
    // const sheetName = workbook.SheetNames[0];
    // const spreadsheetData = utils.sheet_to_json(workbook.Sheets[sheetName], { raw: false });

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
            // spreadsheetData,
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

// exports.onCreateBabelConfig = ({ actions }) => {
//     actions.setBabelPlugin({
//         name: '@babel/plugin-transform-react-jsx',
//         options: {
//             runtime: 'automatic',
//         },
//     });
// };