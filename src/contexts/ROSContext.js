/*!
 * Copyright (c) 2024 Taisyu Shibata
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import ROSLIB from 'roslib';

// ROS接続のコンテキストを作成
const ROSContext = createContext(null);

export const useROS = () => useContext(ROSContext);

export const ROSProvider = ({ children }) => {
    const [ros, setRos] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        let intervalId;

        const connectROS = () => {        
            const rosClient = new ROSLIB.Ros({
                url: process.env.REACT_APP_ROSBRIDGE_URL || 'ws://localhost:9090' // ここを適切なWebSocket URLに変更してください
            });

            rosClient.on('connection', () => {
                console.log('Connected to websocket server.');
                setIsConnected(true);
                setRos(rosClient);
                clearInterval(intervalId);
            });

            rosClient.on('error', (error) => {
                console.log('Error connecting to websocket server:', error);
                setIsConnected(false);
            });

            rosClient.on('close', () => {
                console.log('Connection to websocket server closed.');
                setIsConnected(false);
                intervalId = setInterval(connectROS, 5000);
            });

            return rosClient;
        };

        const rosClient = connectROS();

        return () => {
            if (rosClient) {
                rosClient.close();
            }
            clearInterval(intervalId);
        };
    }, []);

    return (
        <ROSContext.Provider value={{ ros, isConnected }}>
            {children}
        </ROSContext.Provider>
    );
};
