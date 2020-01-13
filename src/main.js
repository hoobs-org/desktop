import Vue from "vue";

import Request from "axios";

import App from "./app.vue";
import Router from "./router";

import Store from "./lib/store";
import Settings from "./lib/settings";
import Scanner from "./lib/scanner";
import Encryption from "./lib/encryption";

import { remote } from "electron";

const settings = new Settings({
    name: "preferences",
    defaults: {
        devices: [],
        sessions: {},
        units: {
            temperature: "fahrenheit"
        }
    }
});

const scanners = {};
const persistant = {};

Vue.mixin({
    data: () => {
        return {
            settings: {
                get(key) {
                    return settings.get(key);
                },
    
                set(key, value) {
                    settings.set(key, value);
                }
            },

            device: {
                wait: {
                    start(ip, port, callback, persist, interval) {
                        if (persist) {
                            if (persistant[`${ip}:${port}`]) {
                                persistant[`${ip}:${port}`].stop();
                            }
    
                            persistant[`${ip}:${port}`] = new Scanner("hoobs");
                            persistant[`${ip}:${port}`].wait(ip, port, callback, interval);
                        } else {
                            if (scanners[`${ip}:${port}`]) {
                                scanners[`${ip}:${port}`].stop();
                            }
    
                            scanners[`${ip}:${port}`] = new Scanner("hoobs");
                            scanners[`${ip}:${port}`].wait(ip, port, callback, interval);
                        }
                    },

                    stop(ip, port, persist) {
                        if (persist) {
                            if (persistant[`${ip}:${port}`]) {
                                persistant[`${ip}:${port}`].stop();
                            }

                            persistant[`${ip}:${port}`] = null;

                            delete persistant[`${ip}:${port}`];
                        } else {
                            if (scanners[`${ip}:${port}`]) {
                                scanners[`${ip}:${port}`].stop();
                            }

                            scanners[`${ip}:${port}`] = null;
    
                            delete scanners[`${ip}:${port}`];
                        }
                    }
                }
            },

            api: {
                async login(ip, port) {
                    Request.defaults.headers.get["Authorization"] = settings.get("sessions")[`${ip}:${port}`] || null;

                    let response = "unauthorized";

                    try {
                        response = ((await Request.get(`http://${ip}:${port}/api/service`)).data || {}).error;
                    } catch {
                        response = "unauthorized";
                    }
    
                    if (response) {
                        const sessions = settings.get("sessions");
                        const devices = settings.get("devices");
                        const index = devices.findIndex(d => d.ip === ip && d.port === port);
    
                        if (index > -1) {
                            const device = devices[index];
    
                            const response = (await Request.post(`http://${device.ip}:${device.port}/api/auth`, {
                                username: Encryption.decrypt(device.username),
                                password: Encryption.decrypt(device.password),
                                remember: true
                            })).data;
    
                            if (response && response.token && (!sessions[`${device.ip}:${device.port}`] || sessions[`${device.ip}:${device.port}`] !== response.token)) {
                                sessions[`${device.ip}:${device.port}`] = response.token;
    
                                settings.set("sessions", sessions);
                            }
                        }
                    }
                },

                async get(ip, port, url) {
                    Request.defaults.headers.get["Authorization"] = settings.get("sessions")[`${ip}:${port}`] || null;

                    return new Promise((resolve) => {
                        Request.get(`http://${ip}:${port}/api${url}`).then((response) => {
                            resolve(response.data);
                        }).catch((error) => {
                            resolve({
                                error: error.message
                            });
                        });
                    });
                },

                async post(ip, port, url, data) {
                    Request.defaults.headers.post["Authorization"] = settings.get("sessions")[`${ip}:${port}`] || null;

                    return new Promise((resolve) => {
                        Request.post(`http://${ip}:${port}/api${url}`, data).then((response) => {
                            resolve(response.data);
                        }).catch((error) => {
                            resolve({
                                error: error.message
                            });
                        });
                    });
                },

                async put(ip, port, url, data) {
                    Request.defaults.headers.put["Authorization"] = settings.get("sessions")[`${ip}:${port}`] || null;

                    return new Promise((resolve) => {
                        Request.put(`http://${ip}:${port}/api${url}`, data).then((response) => {
                            resolve(response.data);
                        }).catch((error) => {
                            resolve({
                                error: error.message
                            });
                        });
                    });
                },

                async delete(ip, port, url, data) {
                    Request.defaults.headers.delete["Authorization"] = settings.get("sessions")[`${ip}:${port}`] || null;

                    return new Promise((resolve) => {
                        Request.delete(`http://${ip}:${port}/api${url}`, data).then((response) => {
                            resolve(response.data);
                        }).catch((error) => {
                            resolve({
                                error: error.message
                            });
                        });
                    });
                }
            }
        }
    },

    methods: {
        $version() {
            return remote.app.getVersion();
        },

        $window() {
            return remote.BrowserWindow.getFocusedWindow();
        },

        $browse(url) {
            remote.shell.openExternal(url);
        },

        $maximized() {
            const window = remote.BrowserWindow.getFocusedWindow();

            if (window) {
                return window.isMaximized();
            }

            return false;
        },

        $minimize() {
            const window = remote.BrowserWindow.getFocusedWindow();

            if (window) {
                window.minimize();
            }
        },

        $maximize() {
            const window = remote.BrowserWindow.getFocusedWindow();

            if (window) {
                window.maximize();
            }
        },

        $unmaximize() {
            const window = remote.BrowserWindow.getFocusedWindow();

            if (window) {
                window.unmaximize();
            }
        },

        $close() {
            const window = remote.BrowserWindow.getFocusedWindow();

            if (window) {
                window.close();
            }
        }
    },
});

Vue.config.productionTip = false;

new Vue({
    router: Router,
    store: Store,
    render: h => h(App)
}).$mount("#app");