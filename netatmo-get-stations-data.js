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
module.exports = function(RED)
{
	"use strict";
    
    function NetatmoGetStationsData(config) {

        RED.nodes.createNode(this,config);
        // Retrieve the config node
        this.creds = RED.nodes.getNode(config.creds);
        const node = this;
        this.on('input', async function(msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };
            done = done || function (error) { node.error.call(node, error, msg) };

            this.deviceId = msg.deviceId || config.deviceId || '';
            this.getFavorites = msg.getFavorites || config.getFavorites || false;

            const { client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken } = node.creds.credentials;

            var options = {};
            if (this.deviceId !== '') {
                options.device_id = this.deviceId;
            }
            if (this.getFavorites !== false) {
                options.get_favorites = this.getFavorites;
            }

            try {
                const accessToken = await refreshAccessToken({ clientId, clientSecret, refreshToken });
                const devices = await netatmoGet(accessToken, 'getstationsdata', options);
                msg.payload = { devices: devices };
                send(msg);
                done();
            } catch (e) {
                done(e);
            }
        });

    }
    RED.nodes.registerType("get stations data",NetatmoGetStationsData);
}