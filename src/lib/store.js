import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        menus: {
            header: false,
            system: false,
            logFilter: false
        },
        messages: [],
        version: {},
        running: {},
        update: {},
        uptime: {},
        cpu: {},
        memory: {},
        temp: {},
        notifications: [],
        connected: 0
    },

    mutations: {
        resetStore(state) {
            state.messages = [];
            state.version = {};
            state.running = {};
            state.update = {};
            state.uptime = {};
            state.cpu = {};
            state.memory = {};
            state.temp = {};
            state.notifications = [];
        },

        toggleMenu(state, name) {
            const keys = Object.keys(state.menus);

            for (let i = 0; i < keys.length; i++) {
                if (keys[i] === name) {
                    state.menus[name] = !state.menus[name];
                } else {
                    state.menus[keys[i]] = false;
                }
            }
        },

        hideMenu(state, name) {
            state.menus[name] = false;
        },

        hideAllMenus(state) {
            const keys = Object.keys(state.menus);

            for (let i = 0; i < keys.length; i++) {
                state.menus[keys[i]] = false;
            }
        },

        deviceConnected(state) {
            state.connected += 1;
        },

        deviceDisconected(state) {
            state.connected -= 1;
        },

        updateAccessories(state, instance) {
            if (!state.update[instance]) {
                state.update[instance] = null;
            }

            state.update[instance] = new Date();
        },

        updateMessages(state, message) {
            if (message.endsWith("{CLEAR}")) {
                state.messages = state.messages.filter(m => !m.startsWith(message.split("{{SPLIT}}")[0]));
            } else {
                state.messages.push(message)

                while (state.messages.length > 500) {
                    state.messages.shift();
                }
            }
        },

        updateNotifications(state, payload) {
            state.notifications.push(payload);

            while (state.notifications.length > 2) {
                state.notifications.shift();
            }
        },

        dismissNotification(state, index) {
            state.notifications.splice(index, 1);
        },

        clearNotifications(state) {
            state.notifications = [];
        },

        updateMonitor(state, payload) {
            const units = (value) => {
                const results = {
                    value: Math.round((value / 1073741824) * 100) / 100,
                    units: "GB"
                };

                while (results.value < 1 && results.units !== "KB") {
                    results.value = Math.round((results.value * 1024) * 100) / 100;

                    switch (results.units) {
                        case "GB":
                            results.units = "MB";
                            break;

                        case "MB":
                            results.units = "KB";
                            break;
                    }
                }

                return results;
            }

            let diff = 0;

            switch (payload.name) {
                case "status":
                    if (!state.version[payload.instance]) {
                        state.version[payload.instance] = null;
                    }

                    if (!state.running[payload.instance]) {
                        state.running[payload.instance] = false;
                    }

                    if (!state.uptime[payload.instance]) {
                        state.uptime[payload.instance] = {
                            days: 0,
                            hours: 0,
                            minutes: 0,
                            seconds: 0
                        };
                    }

                    state.version[payload.instance] = payload.data.version;
                    state.running[payload.instance] = payload.data.running;
        
                    diff = payload.data.uptime;
                    state.uptime[payload.instance].days = Math.floor(diff / (1000 * 60 * 60 * 24));
                    diff -=  state.uptime.days * (1000 * 60 * 60 * 24);
                    state.uptime[payload.instance].hours = Math.floor(diff / (1000 * 60 * 60));
                    diff -= state.uptime.hours * (1000 * 60 * 60);
                    state.uptime[payload.instance].minutes = Math.floor(diff / (1000 * 60));
                    diff -= state.uptime.minutes * (1000 * 60);
                    state.uptime[payload.instance].seconds = Math.floor(diff / (1000));
                    break;

                case "load":
                    if (!state.cpu[payload.instance]) {
                        state.cpu[payload.instance] = {
                            used: null,
                            history: [
                                [0,  -1], [1,  -1], [2,  -1], [3,  -1],
                                [4,  -1], [5,  -1], [6,  -1], [7,  -1],
                                [8,  -1], [9,  -1], [10, -1], [11, -1],
                                [12, -1], [13, -1], [14, -1], [15, -1],
                                [16, -1], [17, -1], [18, -1], [19, -1]
                            ]
                        };
                    }

                    if (!state.memory[payload.instance]) {
                        state.memory[payload.instance] = {
                            load: null,
                            total: null,
                            used: null,
                            history: [
                                [0,  -1], [1,  -1], [2,  -1], [3,  -1],
                                [4,  -1], [5,  -1], [6,  -1], [7,  -1],
                                [8,  -1], [9,  -1], [10, -1], [11, -1],
                                [12, -1], [13, -1], [14, -1], [15, -1],
                                [16, -1], [17, -1], [18, -1], [19, -1]
                            ]
                        };
                    }

                    if (!state.temp[payload.instance]) {
                        state.temp[payload.instance] = -1;
                    }

                    state.cpu[payload.instance].used = 100 - Math.round(payload.data.cpu.currentload_idle);
                    state.cpu[payload.instance].available = Math.round(payload.data.cpu.currentload_idle);

                    state.memory[payload.instance].load = Math.round((payload.data.memory.active * 100) / payload.data.memory.total);
                    state.memory[payload.instance].total = units(payload.data.memory.total);
                    state.memory[payload.instance].used = units(payload.data.memory.active);

                    for (let i = 0; i < state.cpu[payload.instance].history.length - 1; i++) {
                        state.cpu[payload.instance].history[i] = state.cpu[payload.instance].history[i + 1];
                        state.cpu[payload.instance].history[i][0] = i;

                        state.memory[payload.instance].history[i] = state.memory[payload.instance].history[i + 1];
                        state.memory[payload.instance].history[i][0] = `${i}`;
                    }

                    state.temp[payload.instance] = payload.data.temp.main;
                    state.cpu[payload.instance].history[state.cpu[payload.instance].history.length - 1] = [state.cpu[payload.instance].history.length - 1, state.cpu[payload.instance].used];
                    state.memory[payload.instance].history[state.memory[payload.instance].history.length - 1] = [state.memory[payload.instance].history.length - 1, state.memory[payload.instance].load];

                    break;
            }
        }
    }
});
