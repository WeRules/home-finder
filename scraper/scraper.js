require('dotenv').config({
  path: '.env',
});
const path = require('path');
const { writeFileSync, readFileSync } = require('fs');
const puppeteer = require('puppeteer');
const jsdom = require('jsdom');
const { read, utils } = require('xlsx');
const nodeFetch = require('node-fetch');
const nodemailer = require('nodemailer');

const WIDTH = 1920;
const HEIGHT = 1080;
const TIMEOUT = 10000;

const downloadSpreadsheetFile = async (spreadsheetId, sheetId = 0) => {
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=xlsx&gid=${sheetId}`;
  const response = await nodeFetch(url);
  return await response.blob();
};

const data = readFileSync(path.resolve(__dirname, 'db.json'), { encoding: 'utf8', flag: 'r' });
const pastResults = JSON.parse(data) || [];
console.log('pastResults:', pastResults);
const results = {};

const runTask = async () => {
  const spreadsheet = await downloadSpreadsheetFile(process.env.GATSBY_GOOGLE_SPREADSHEET_ID, process.env.GATSBY_GOOGLE_SPREADSHEET_GID);
  const workbook = read(await spreadsheet.arrayBuffer(), { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const spreadsheetData = utils.sheet_to_json(workbook.Sheets[sheetName], { raw: false });

  const disableds = spreadsheetData.filter((row) => row.disable === 'disable').map((row) => row.secret);
  for (const row of spreadsheetData) {
    if (disableds.includes(row.secret)) {
      continue;
    }

    await scrape(row.links.split('\n'), row.email, row.secret);
  }
};

const scrape = async (urls, email, secret) => {
  if (!results[email]) {
    results[email] = [];
  }

  if (!pastResults[email]) {
    pastResults[email] = [];
  }

  for (const url of urls) {
    await runPuppeteer(url, email);
  }

  console.log('results:', results);

  if (results[email].length > 0) {
    writeFileSync(
        path.resolve(__dirname, 'db.json'),
      JSON.stringify({
        ...pastResults,
        [email]: [
          ...pastResults[email],
          ...results[email],
        ]
      })
    );
  }

  await sendEmail(results[email], email, secret);
};

const sendEmail = async (links, email, secret) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GATSBY_EMAIL_USER,
      pass: process.env.GATSBY_EMAIL_PASSWORD
    }
  });

  const htmlTemplate = readFileSync(path.resolve(__dirname, 'template.html'), { encoding: 'utf8', flag: 'r' });
  const mailOptions = {
    from: process.env.GATSBY_EMAIL_USER,
    to: email,
    subject: 'New Houses Found',
    // text: links.join('\n'),
    html: htmlTemplate
        .replace('{{SECRET}}', secret)
        .replace('{{LINKS_LIST}}', links.map((link) => {
          return `<li><a href="${link}">${link}</a></li>`;
        }).join('\n')),
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};

const runPuppeteer = async (url, email) => {
  console.log('opening headless browser');
  const browser = await puppeteer.launch({
    headless: true,
    args: [`--window-size=${WIDTH},${HEIGHT}`],
    defaultViewport: {
      width: WIDTH,
      height: HEIGHT,
    },
  });

  const page = await browser.newPage();
  // https://stackoverflow.com/a/51732046/4307769 https://stackoverflow.com/a/68780400/4307769
  await page.setUserAgent(process.env.GATSBY_USER_AGENT);

  console.log('going to website', url);
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForNetworkIdle();

  if (url.includes('funda.nl/')) {
    try {
      console.log('parsing funda.nl data');
      await page.waitForSelector('.search-result', {
        timeout: TIMEOUT,
        visible: true,
      });

      const htmlString = await page.content();
      const dom = new jsdom.JSDOM(htmlString);

      dom.window.document
          .querySelectorAll('.search-result')
          ?.forEach((element) => {
            const urlPath = element?.querySelectorAll('a')?.[0]?.href;

            const path = `https://www.funda.nl${urlPath}`;
            if (urlPath && !pastResults[email]?.includes(path)) {
              results[email].push(path);
            }
          });
    } catch (e) {
      // console.log(e);
    }
  } else if (url.includes('vbo.nl/')) {
    try {
      console.log('parsing vbo.nl data');
      await page.waitForSelector('#propertiesWrapper', {
        timeout: TIMEOUT,
        visible: true,
      });

      const htmlString = await page.content();
      const dom = new jsdom.JSDOM(htmlString);

      const result =
          dom.window.document
              .querySelector('#propertiesWrapper')
              ?.querySelector('.row')?.children || [];

      for (const div of result) {
        const anchor = div?.querySelector('a');
        const dateText = anchor?.querySelector('div')?.innerText;
        const path = anchor?.href;

        if (
            path &&
            !pastResults[email]?.includes(path) &&
            dateText?.toLowerCase()?.includes('nieuw')
        ) {
          results[email].push(path);
        }
      }
    } catch (e) {
      // console.log(e);
    }
  } else if (url.includes('huislijn.nl/')) {
    try {
      console.log('parsing huislijn.nl data');
      await page.waitForSelector('.hl-search-object-display', {
        timeout: TIMEOUT,
        visible: true,
      });

      const htmlString = await page.content();
      const dom = new jsdom.JSDOM(htmlString);
      const result =
          dom.window.document
              .querySelector('.wrapper-objects')
              ?.querySelectorAll('.hl-search-object-display') || [];

      for (const div of result) {
        const anchor = div?.querySelector('a');
        const urlPath = anchor?.href;

        const path = `https://www.huislijn.nl${urlPath}`;
        if (path && !pastResults[email]?.includes(path)) {
          results[email].push(path);
        }
      }
    } catch (e) {
      // console.log(e);
    }
  } else if (url.includes('zah.nl/')) {
    try {
      console.log('parsing zah.nl data');
      await page.waitForNavigation({
        waitUntil: 'load',
        timeout: TIMEOUT,
      });
      await page.waitForSelector('#koopwoningen', {
        timeout: TIMEOUT,
        visible: true,
      });

      const htmlString = await page.content();
      const dom = new jsdom.JSDOM(htmlString);
      // writeFileSync(
      //     path.resolve(__dirname, 'test.html'),
      //     htmlString
      // );

      const result =
          dom.window.document
              .querySelector('#koopwoningen')
              ?.querySelectorAll('.result') || [];

      for (const div of result) {
        const anchor = div?.querySelector('a');
        const dateText = div?.querySelector('.date')?.innerText || div?.querySelector('.date')?.innerHTML;
        const urlPath = anchor?.href;
        const path = `https://www.zah.nl${urlPath}`;

        if (
            path &&
            !pastResults[email]?.includes(path) &&
            dateText?.toLowerCase().includes('1 dag')
        ) {
          results[email].push(path);
        }
      }
    } catch (e) {
      // console.log(e);
    }
  } else if (url.includes('pararius.nl/')) {
    try {
      console.log('parsing pararius.nl data');
      console.log('parsing zah.nl data');
      await page.waitForSelector('.search-list__item--listing', {
        timeout: TIMEOUT,
        visible: true,
      });

      const htmlString = await page.content();
      const dom = new jsdom.JSDOM(htmlString);

      const result =
          dom.window.document
              .querySelector('.search-list')
              ?.querySelectorAll('.search-list__item--listing') || [];

      for (const div of result) {
        const anchor = div?.querySelector('a');
        const dateText = div?.querySelector('.listing-label--new')?.innerText;
        const urlPath = anchor?.href;

        const path = `https://www.pararius.nl${urlPath}`;
        if (
            urlPath &&
            !pastResults[email]?.includes(path) &&
            dateText?.toLowerCase().includes('nieuw')
        ) {
          results[email].push(path);
        }
      }
    } catch (e) {
      // console.log(e);
    }
  } else if (url.includes('jaap.nl/')) {
    try {
      console.log('parsing jaap.nl data');
      await page.waitForSelector('.property-list', {
        timeout: TIMEOUT,
        visible: true,
      });

      const htmlString = await page.content();
      const dom = new jsdom.JSDOM(htmlString);

      const result =
          dom.window.document
              .querySelector('.property-list')
              ?.querySelectorAll('[id^="house_"]') || [];

      for (const div of result) {
        const anchor = div?.querySelector('a');
        const path = anchor?.href;

        if (path && !pastResults[email]?.includes(path)) {
          results[email].push(path);
        }
      }
    } catch (e) {
      // console.log(e);
    }
  } else if (url.includes('hoekstraenvaneck.nl/')) {
    try {
      console.log('parsing hoekstraenvaneck.nl data');
      await page.waitForSelector('.overzicht', {
        timeout: TIMEOUT,
        visible: true,
      });

      const htmlString = await page.content();
      const dom = new jsdom.JSDOM(htmlString);

      const result =
          dom.window.document
              .querySelector('.overzicht')
              ?.querySelectorAll('.woning') || [];

      for (const div of result) {
        const anchor = div?.querySelector('a');
        const urlPath = anchor?.href;

        const path = `https://hoekstraenvaneck.nl${urlPath}`;
        if (path && !pastResults[email]?.includes(path)) {
          results[email].push(path);
        }
      }
    } catch (e) {
      // console.log(e);
    }
  }

  console.log('closing browser');
  await browser.close();
};

runTask();
