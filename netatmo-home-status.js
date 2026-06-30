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
 
     function NetatmoHomeStatus(config) {

        RED.nodes.createNode(this,config);
        this.creds = RED.nodes.getNode(config.creds);

        var node = this;
this.on('input', async function(msg, send, done) {
            send = send || function () { node.send.apply(node, arguments) };
            done = done || function (error) { node.error.call(node, error, msg) };

            this.homeId = msg.homeId || config.homeId || '';
            this.deviceTypes = msg.deviceTypes || config.deviceTypes || '';

            const { client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken } = node.creds.credentials;

            var options = {
                home_id: this.homeId
            };
            if (this.deviceTypes !== '') {
                options.device_types = this.deviceTypes;
            }

            try {
                const accessToken = await refreshAccessToken({ clientId, clientSecret, refreshToken });
                const body = await netatmoGet(accessToken, 'homestatus', options);
                msg.payload = body;
                send(msg);
                done();
            } catch (e) {
                done(e);
            }
        });

    }
    RED.nodes.registerType("home status",NetatmoHomeStatus);
 }