require('dotenv').config();
const { writeFileSync, readFileSync } = require('fs');
const puppeteer = require('puppeteer');
const jsdom = require('jsdom');
// const nodeFetch = require('node-fetch');

const WIDTH = 1920;
const HEIGHT = 1080;

const data = readFileSync('db.json', { encoding: 'utf8', flag: 'r' });
const pastResults = new Set(JSON.parse(data) || []);
console.log('pastResults:', pastResults);
const results = new Set();
// const { CHAT_ID, BOT_API } = process.env;

const runTask = async () => {
  const urls = [
  ];

  for (const url of urls) {
    await runPuppeteer(url);
  }

  console.log('results:', results);

  if (results.size > 0) {
    writeFileSync(
      'db.json',
      JSON.stringify(Array.from([...results, ...pastResults]))
    );

    console.log('sending messages to Telegram');
  }
};

const runPuppeteer = async (url) => {
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
  await page.setUserAgent(
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36'
  );

  console.log('going to website');
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  const htmlString = await page.content();
  const dom = new jsdom.JSDOM(htmlString);

  if (url.includes('funda.nl/')) {
    console.log('parsing funda.nl data');
    dom.window.document
      .querySelectorAll('.search-result')
      ?.forEach((element) => {
        const urlPath = element?.querySelectorAll('a')?.[0]?.href;

        const path = `https://www.funda.nl${urlPath}`;
        if (urlPath && !pastResults.has(path)) {
          results.add(path);
        }
      });
  } else if (url.includes('vbo.nl/')) {
    console.log('parsing vbo.nl data');
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
        !pastResults.has(path) &&
        dateText?.toLowerCase()?.includes('nieuw')
      ) {
        results.add(path);
      }
    }
  } else if (url.includes('huislijn.nl/')) {
    console.log('parsing huislijn.nl data');
    const result =
      dom.window.document
        .querySelector('.wrapper-objects')
        ?.querySelectorAll('.hl-search-object-display') || [];

    for (const div of result) {
      const anchor = div?.querySelector('a');
      const path = anchor?.href;

      if (path && !pastResults.has(path)) {
        results.add(path);
      }
    }
  } else if (url.includes('zah.nl/')) {
    console.log('parsing zah.nl data');
    const result =
      dom.window.document
        .querySelector('#koopwoningen')
        ?.querySelectorAll('.result') || [];

    for (const div of result) {
      const anchor = div?.querySelector('a');
      const dateText = div?.querySelector('.date')?.innerText;
      const path = anchor?.href;

      if (
        path &&
        !pastResults.has(path) &&
        dateText?.toLowerCase().includes('1 dag')
      ) {
        results.add(path);
      }
    }
  } else if (url.includes('pararius.nl/')) {
    console.log('parsing pararius.nl data');
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
        !pastResults.has(path) &&
        dateText?.toLowerCase().includes('nieuw')
      ) {
        results.add(path);
      }
    }
  } else if (url.includes('jaap.nl/')) {
    console.log('parsing jaap.nl data');
    const result =
      dom.window.document
        .querySelector('.property-list')
        ?.querySelectorAll('[id^="house_"]') || [];

    for (const div of result) {
      const anchor = div?.querySelector('a');
      const path = anchor?.href;

      if (path && !pastResults.has(path)) {
        results.add(path);
      }
    }
  } else if (url.includes('hoekstraenvaneck.nl/')) {
    console.log('parsing hoekstraenvaneck.nl data');
    const result =
      dom.window.document
        .querySelector('.overzicht')
        ?.querySelectorAll('.woning') || [];

    for (const div of result) {
      const anchor = div?.querySelector('a');
      const urlPath = anchor?.href;

      const path = `https://hoekstraenvaneck.nl${urlPath}`;
      if (path && !pastResults.has(path)) {
        results.add(path);
      }
    }
  }

  console.log('closing browser');
  await browser.close();
};

runTask();
