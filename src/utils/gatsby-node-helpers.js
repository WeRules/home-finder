const nodeFetch = require('node-fetch');
const { read, utils } = require('xlsx');

const convertToKebabCase = (string) => string.replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase();

const downloadSpreadsheetFile = async (spreadsheetId, sheetId = 0, forceCors = false) => {
    let url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=xlsx&gid=${sheetId}`;
    if (forceCors) {
        url = `https://cors-anywhere.herokuapp.com/${url}`;
    }

    const response = await nodeFetch(url);
    // eslint-disable-next-line no-return-await
    return await response.blob();
};

const getGoogleFormData = async (googleFormId) =>
    nodeFetch(`https://docs.google.com/forms/d/e/${googleFormId}/viewform?embedded=true`, {
        method: 'GET',
    }).then((response) => {
        if (!response.ok) {
            throw new Error('Network request failed');
        }

        return response.text().then((data) => {
            let loadData = data.split('FB_PUBLIC_LOAD_DATA_');
            loadData = loadData[1].split(';');
            // eslint-disable-next-line no-new-func
            const getLoadData = new Function(`const result${loadData[0]}; return result`);
            // let shuffleSeed = data.split('data-shuffle-seed="');
            // shuffleSeed = shuffleSeed[1].split('"');
            return {
                loadData: getLoadData(),
                // shuffleSeed: shuffleSeed[0],
            };
        });
    });


module.exports = {
    getGoogleFormData,
    convertToKebabCase,
    downloadSpreadsheetFile,
};