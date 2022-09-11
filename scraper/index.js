const path = require('path');
require('dotenv').config({
    path: path.resolve(__dirname, '..', '.env'),
});

const { writeFileSync, mkdirSync, cpSync } = require('fs');

// Create .env file
const envVariables = {
    'GATSBY_GOOGLE_SPREADSHEET_ID': process.env.GATSBY_GOOGLE_SPREADSHEET_ID,
    'GATSBY_GOOGLE_SPREADSHEET_GID': process.env.GATSBY_GOOGLE_SPREADSHEET_GID,
    'GATSBY_USER_AGENT': process.env.GATSBY_USER_AGENT,
};

mkdirSync(path.resolve(__dirname, 'build'), { recursive: true });
writeFileSync(path.resolve(__dirname, 'build', '.env'), Object.entries(envVariables).reduce((acc, [key, value]) => {
    return `${acc}${key}=${value}\n`;
}, ''));

// Copy files
[
    '.github',
    'db.json',
    'package.json',
    'package-lock.json',
    'scraper.js',
    'template.html',
].forEach((fileName) => {
    cpSync(path.resolve(__dirname, fileName), path.resolve(__dirname, 'build', fileName), {recursive: true});
});