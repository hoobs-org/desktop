import Vue from "vue";
import Vuex from "vuex";
import Persistence from "vuex-persist";
import { units, timespan } from "./formatters";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        log: [],
        scanning: false,
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
        temp: null,
        session: "",
        user: {
            permissions: {},
        },
        auth: false,
        notifications: [],
        latest: null,
        navigation: false,
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
        "IO:SCANNER:START": (state: { [key: string]: any }) => {
            state.scanning = true;
        },

        "IO:SCANNER:STOP": (state: { [key: string]: any }) => {
            state.scanning = false;
        },

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

        "IO:LOG": (state: { [key: string]: any }, payload: any) => {
            state.log.push(payload);
            state.log = state.log.slice(Math.max(state.log.length - 5000, 0));
        },

        "IO:MONITOR": (state: { [key: string]: any }, payload: any) => {
            const keys = Object.keys(payload.data.bridges);
            const bridges = [];

            for (let i = 0; i < keys.length; i += 1) {
                const { ...bridge } = payload.data.bridges[keys[i]];

                bridges.push({
                    id: keys[i],
                    display: bridge.display,
                    version: bridge.version,
                    running: bridge.running,
                    uptime: timespan(bridge.uptime),
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
        },

        "IO:NOTIFICATION": (state: { [key: string]: any }, payload: any) => {
            const now = (new Date()).getTime();

            const notification = {
                id: `${now}:${Math.random()}`,
                time: now,
                event: payload.event,
                bridge: payload.bridge,
                type: payload.data.type,
                title: payload.data.title,
                description: payload.data.description,
                icon: payload.data.icon,
                ttl: now + (1 * 60 * 60 * 1000),
            };

            if (state.latest) clearTimeout(state.latest.timer);

            state.latest = {
                timer: setTimeout(() => {
                    state.latest = null;
                }, 10 * 1000),
                notification,
            };

            state.notifications.unshift(notification);
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
                state.user = {
                    permissions: {},
                };
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

        "NOTIFICATION:ADD": (state: { [key: string]: any }, payload: any) => {
            const now = (new Date()).getTime();
            const { ...notification } = payload;

            notification.id = `${now}:${Math.random()}`;
            notification.time = now;
            notification.ttl = now + (1 * 60 * 60 * 1000);

            state.notifications.unshift(notification);
        },

        "NOTIFICATION:DISMISS": (state: { [key: string]: any }, id: string) => {
            state.notifications = state.notifications.filter((item: { [key: string]: any }) => (item.id || "") !== "" && (item.id || "") !== id);
        },

        "NOTIFICATION:DISMISS:LATEST": (state: { [key: string]: any }) => {
            if (state.latest) clearTimeout(state.latest.timer);

            state.latest = null;
        },

        "NOTIFICATION:DISMISS:OLD": (state: { [key: string]: any }) => {
            const now = (new Date()).getTime();

            state.notifications = state.notifications.filter((item: { [key: string]: any }) => (item.ttl || 0) > now);
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

        "THEME:SET": (state: { [key: string]: any }, theme: number) => {
            state.theme = theme;
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
            notifications: state.notifications,
            navigation: state.navigation,
        }),
    }).plugin],
});
