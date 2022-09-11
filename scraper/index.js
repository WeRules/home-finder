const path = require('path');
// require('dotenv').config({
//     path: path.resolve(__dirname, '..', '.env'),
// });

const { cpSync } = require('fs');

// Create .env file
// const envVariables = {
//     'GOOGLE_SPREADSHEET_ID': process.env.GOOGLE_SPREADSHEET_ID,
//     'GOOGLE_SPREADSHEET_GID': process.env.GOOGLE_SPREADSHEET_GID,
//     'USER_AGENT': process.env.USER_AGENT,
//     'EMAIL_USER': process.env.EMAIL_USER,
//     'EMAIL_PASSWORD': process.env.EMAIL_PASSWORD,
// };
//
// mkdirSync(path.resolve(__dirname, 'build'), { recursive: true });
// writeFileSync(path.resolve(__dirname, 'build', '.env'), Object.entries(envVariables).reduce((acc, [key, value]) => {
//     return `${acc}${key}=${value}\n`;
// }, ''));

// Copy files
[
    'db.json',
    'package.json',
    'package-lock.json',
    'scraper.js',
    'template.html',
].forEach((fileName) => {
    cpSync(path.resolve(__dirname, fileName), path.resolve(__dirname, 'build', fileName), { recursive: true });
});

cpSync(
    path.resolve(__dirname, 'run-task.yml'), path.resolve(__dirname, 'build', '.github', 'workflows', 'run-task.yml'),
    { recursive: true }
);
