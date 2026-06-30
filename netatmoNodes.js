/**
 * Copyright 2016 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/
const { refreshAccessToken, netatmoGet } = require('./netatmo-api');
module.exports = function(RED) {
    "use strict";

    /***************************************************************/
    function NetatmoConfigNode(config) {
        RED.nodes.createNode(this,config);
    }

    RED.nodes.registerType("configNode",NetatmoConfigNode,{
        credentials: {
            client_id: {type:"text"},
            client_secret: {type:"text"},
            refresh_token: {type:"text"}
    }});

    // Discover homes with homesData
    // see https://github.com/node-red/node-red-nodes/blob/master/hardware/wemo/WeMoNG.html or /node-red-contrib-huemagic/huemagic/hue-brightness.html
    // eslint-disable-next-line no-unused-vars
	RED.httpAdmin.get('/netatmo/homes', async function(req, res)
	{
        const creds = RED.nodes.getNode(req.query.nodeIdCred);
        if (!creds) {
            res.end(JSON.stringify({error:'No configuration node found.'}));
            return;
        }

        const credentials = creds.credentials;
        if (!credentials) {
            res.end(JSON.stringify({error:'No configuration found.'}));
            return;
        }

        try {
            const accessToken = await refreshAccessToken({
                clientId: credentials.client_id,
                clientSecret: credentials.client_secret,
                refreshToken: credentials.refresh_token
            });
            const body = await netatmoGet(accessToken, 'homesdata', {});
            res.end(JSON.stringify(body));
        } catch(error) {
            res.end(JSON.stringify({error: error.message}));
        }
	});   
};
