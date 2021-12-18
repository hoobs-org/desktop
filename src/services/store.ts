/**************************************************************************************************
 * hoobs-desktop                                                                                  *
 * Copyright (C) 2020 HOOBS                                                                       *
 *                                                                                                *
 * This program is free software: you can redistribute it and/or modify                           *
 * it under the terms of the GNU General Public License as published by                           *
 * the Free Software Foundation, either version 3 of the License, or                              *
 * (at your option) any later version.                                                            *
 *                                                                                                *
 * This program is distributed in the hope that it will be useful,                                *
 * but WITHOUT ANY WARRANTY; without even the implied warranty of                                 *
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the                                  *
 * GNU General Public License for more details.                                                   *
 *                                                                                                *
 * You should have received a copy of the GNU General Public License                              *
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.                          *
 **************************************************************************************************/

import Vue from "vue";
import Vuex from "vuex";
import Persistence from "vuex-persist";
import { units, timespan } from "./formatters";
import { cloneJson } from "./json";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        log: [],
        current: null,
        devices: [],
        bridges: [],
        cpu: {
            used: null,
            history: [
                [0, 0], [1, 0], [2, 0], [3, 0],
                [4, 0], [5, 0], [6, 0], [7, 0],
                [8, 0], [9, 0], [10, 0], [11, 0],
                [12, 0], [13, 0], [14, 0], [15, 0],
                [16, 0], [17, 0], [18, 0], [19, 0],
            ],
        },
        memory: {
            load: null,
            total: null,
            used: null,
            history: [
                [0, 0], [1, 0], [2, 0], [3, 0],
                [4, 0], [5, 0], [6, 0], [7, 0],
                [8, 0], [9, 0], [10, 0], [11, 0],
                [12, 0], [13, 0], [14, 0], [15, 0],
                [16, 0], [17, 0], [18, 0], [19, 0],
            ],
        },
        heap: 0,
        temp: null,
        session: "",
        user: { permissions: {} },
        auth: false,
        version: {
            hoobsd: "0.0.0",
            homebridge: "0.0.0",
            node: "0.0.0",
            updated: true,
        },
        snapshots: {},
        streaming: {},
        navigation: false,
        mdns: false,
        broadcast: "",
        product: "",
        terminal: false,
        platform: null,
        accessory: null,
        room: null,
        theme: null,
    },

    getters: {
        theme(state) {
            return state.theme;
        },
    },

    mutations: {
        "IO:DEVICE": (state: { [key: string]: any }, payload: any) => {
            const index = state.devices.findIndex((item: { [key: string]: any }) => item.mac === payload.mac);

            if (index >= 0) {
                state.devices[index] = payload;
            } else {
                state.devices.push(payload);
            }
        },

        "IO:DEVICE:SET": (state: { [key: string]: any }, payload: any) => {
            state.current = payload;
        },

        "IO:DEVICE:CLEAR": (state: { [key: string]: any }) => {
            state.current = null;
            state.devices = [];
        },

        "IO:LOG": (state: { [key: string]: any }, payload: any) => {
            state.log.push(payload);
            state.log = state.log.slice(Math.max(state.log.length - 5000, 0));
        },

        "IO:MONITOR": (state: { [key: string]: any }, payload: any) => {
            const keys = Object.keys(payload.data.bridges);
            const bridges = [];

            for (let i = 0; i < keys.length; i += 1) {
                const bridge = cloneJson(payload.data.bridges[keys[i]]);

                bridges.push({
                    id: keys[i],
                    display: bridge.display,
                    version: bridge.version,
                    running: bridge.running,
                    uptime: timespan(bridge.uptime),
                    heap: bridge.heap,
                });
            }

            state.bridges = bridges;
            state.temp = (payload.data.temp.main || -1) > -1 ? payload.data.temp.main : null;

            state.cpu.used = 100 - Math.round(payload.data.cpu.currentLoadIdle || 100);
            state.cpu.available = Math.round(payload.data.cpu.currentLoadIdle || 100);

            state.memory.load = Math.round((payload.data.memory.total || 0) > 0 ? ((payload.data.memory.active || 0) * 100) / (payload.data.memory.total || 0) : 0);
            state.memory.total = units(payload.data.memory.total || 0);
            state.memory.used = units(payload.data.memory.active || 0);

            for (let i = 0; i < state.cpu.history.length - 1; i += 1) {
                state.cpu.history[i] = state.cpu.history[i + 1];
                state.cpu.history[i][0] = i;

                state.memory.history[i] = state.memory.history[i + 1];
                state.memory.history[i][0] = `${i}`;
            }

            state.cpu.history[state.cpu.history.length - 1] = [state.cpu.history.length - 1, state.cpu.used];
            state.memory.history[state.memory.history.length - 1] = [state.memory.history.length - 1, state.memory.load];
            state.heap = payload.data.heap;
        },

        "IO:SNAPSHOT:UPDATE": (state: { [key: string]: any }, payload: any) => {
            state.snapshots[payload.id] = payload.data;
        },

        "IO:ACCESSORY:CHANGE": (state: { [key: string]: any }, payload: any) => {
            state.accessory = payload.data;
        },

        "IO:ROOM:CHANGE": (state: { [key: string]: any }, payload: any) => {
            state.room = payload.data;
        },

        "SESSION:SET": (state: { [key: string]: any }, token: string) => {
            state.session = token;

            if (token && token !== "") {
                const user = JSON.parse(Buffer.from(token, "base64").toString("utf8"));

                state.user = {
                    id: user.id,
                    name: user.name,
                    username: user.username,
                    permissions: user.permissions || {},
                };
            } else {
                state.user = { permissions: {} };
            }
        },

        "SESSION:DISABLE": (state: { [key: string]: any }) => {
            state.session = "";

            state.user = {
                id: 1,
                name: "unavailable",
                username: "unavailable",
                permissions: {
                    accessories: true,
                    bridges: true,
                    config: true,
                    controller: true,
                    plugins: true,
                    reboot: true,
                    terminal: true,
                    users: false,
                },
            };
        },

        "LOG:HISTORY": (state: { [key: string]: any }, messages: string) => {
            state.log = messages;
            state.log = state.log.slice(1).slice(-5000);
        },

        "NAVIGATION:STATE": (state: { [key: string]: any }, value: boolean) => {
            state.navigation = value;
        },

        "AUTH:STATE": (state: { [key: string]: any }, value: string) => {
            if (value === "enabled") {
                state.auth = true;
            } else {
                state.auth = false;
            }
        },

        "VERSION:STATE": (state: { [key: string]: any }, payload: any) => {
            state.version = {
                hoobsd: payload.version,
                homebridge: payload.homebridge_version,
                node: payload.node_version,
                updated: payload.upgraded && payload.cli_upgraded && payload.node_upgraded,
            };
        },

        "MDNS:STATE": (state: { [key: string]: any }, payload: any) => {
            state.mdns = payload;
        },

        "BROADCAST:STATE": (state: { [key: string]: any }, payload: any) => {
            state.broadcast = payload;
        },

        "PRODUCT:STATE": (state: { [key: string]: any }, payload: any) => {
            state.product = payload;
        },

        "TERMINAL:STATE": (state: { [key: string]: any }, payload: any) => {
            state.terminal = payload;
        },

        "PLATFORM:STATE": (state: { [key: string]: any }, payload: any) => {
            state.platform = payload;
        },

        "THEME:SET": (state: { [key: string]: any }, theme: number) => {
            state.theme = theme;
        },

        "ACCESSORY:STREAMING": (state: { [key: string]: any }, payload: any) => {
            state.streaming[payload.id] = payload.data;
        },
    },

    plugins: [new Persistence({
        key: "hoobs:state",
        storage: window.localStorage,
        reducer: (state: { [key: string]: any }) => ({
            current: state.current,
            devices: state.devices,
            bridges: state.bridges,
            cpu: state.cpu,
            memory: state.memory,
            temp: state.temp,
            session: state.session,
            user: state.user,
            snapshots: state.snapshots,
            streaming: state.streaming,
            navigation: state.navigation,
        }),
    }).plugin],
});
