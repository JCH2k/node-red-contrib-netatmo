'use strict';
const https = require('https');
const fetch = require('node-fetch');

/**
 * Exchanges a refresh token for a new access token via the Netatmo OAuth2 endpoint.
 * node-fetch does not work reliably for this particular endpoint, so we use https directly.
 */
const refreshAccessToken = ({ clientId, clientSecret, refreshToken }) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.netatmo.com',
            port: '443',
            path: '/oauth2/token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'node ' + process.version
            }
        };
        const request = https.request(options, (res) => {
            let chunks = [];
            res.on('data', chunk => chunks.push(chunk))
               .on('end', () => {
                   const body = Buffer.concat(chunks).toString('utf8');
                   if (res.statusCode === 200) {
                       try { resolve(JSON.parse(body).access_token); }
                       catch (e) { reject(e); }
                   } else {
                       reject(new Error('Token refresh failed, status: ' + res.statusCode));
                   }
               });
        }).setTimeout(0).on('error', reject);

        request.write(new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: clientId,
            client_secret: clientSecret
        }).toString());
        request.end();
    });
};

/**
 * Makes an authenticated GET request to the Netatmo API.
 * @param {string} accessToken
 * @param {string} endpoint  e.g. 'getstationsdata'
 * @param {object} params    query-string parameters (omit falsy values before passing)
 */
const netatmoGet = (accessToken, endpoint, params) => {
    const qs = params && Object.keys(params).length ? '?' + new URLSearchParams(params) : '';
    return fetch('https://api.netatmo.com/api/' + endpoint + qs, {
        method: 'GET',
        headers: { Authorization: 'Bearer ' + accessToken }
    }).then(r => r.json());
};

/**
 * Makes an authenticated POST request to the Netatmo API.
 * @param {string} accessToken
 * @param {string} endpoint  e.g. 'setthermmode'
 * @param {object} params    form body parameters
 */
const netatmoPost = (accessToken, endpoint, params) => {
    return fetch('https://api.netatmo.com/api/' + endpoint, {
        method: 'POST',
        headers: {
            Authorization: 'Bearer ' + accessToken,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(params || {})
    }).then(r => r.json());
};

module.exports = { refreshAccessToken, netatmoGet, netatmoPost };
