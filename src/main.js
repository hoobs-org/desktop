import "./lib/extentions";
import "./lib/dates";

import Vue from "vue";
import Request from "axios";
import FormData from "form-data";

import App from "./app.vue";
import Router from "./router";

import Store from "./lib/store";
import Cache from "./lib/cache";
import Plugins from "./lib/plugins";
import Scanner from "./lib/scanner";
import Settings from "./lib/settings";
import Encryption from "./lib/encryption";
import Components from "./lib/components";

import { i18n, LoadLanguage } from "./locale/localization";

import { basename } from "path";
import { existsSync, readFileSync } from "fs";
import { remote, ipcRenderer } from "electron";

const settings = new Settings({
    name: "preferences",
    defaults: {
        devices: [],
        sessions: {},
        locale: "en",
        units: {
            temperature: "fahrenheit",
            timeFormat: "12hour"
        },
        geolocation: {
            countryCode: "US",
            postalCode: "94040",
            latitude: "",
            longitude: ""
        }
    }
});

const cache = new Cache();
const plugins = new Plugins(cache);
const router = Router();

const scanners = {};
const persistant = {};
const heartbeats = {};

Vue.mixin({
    data: () => {
        return {
            Settings: {
                get(key) {
                    return settings.get(key);
                },
    
                set(key, value) {
                    settings.set(key, value);
                }
            },

            Cache: {
                get(key) {
                    return cache.get(key);
                },

                set(key, value, age) {
                    cache.set(key, value, age);
                },

                remove(key) {
                    cache.remove(key);
                }
            },

            Plugins: {
                package(name, version) {
                    return plugins.package(name, version);
                },

                search(search, limit) {
                    return plugins.search(search, limit);
                }
            },

            Device: {
                heartbeat: {
                    start(ip, port, callback, interval) {
                        if (heartbeats[`${ip}:${port}`]) {
                            heartbeats[`${ip}:${port}`].stop();
                        }
    
                        heartbeats[`${ip}:${port}`] = new Scanner("hoobs");
                        heartbeats[`${ip}:${port}`].heartbeat(ip, port, callback, interval);
                    },

                    stop(ip, port) {
                        if (heartbeats[`${ip}:${port}`]) {
                            heartbeats[`${ip}:${port}`].stop();
                        }

                        heartbeats[`${ip}:${port}`] = null;

                        delete heartbeats[`${ip}:${port}`];
                    }
                },

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

            API: {
                async login(ip, port) {
                    let response = "unauthorized";

                    try {
                        response = ((await Request.get(`http://${ip}:${port}/api/service`, {
                            headers: {
                                "Authorization": settings.get("sessions")[`${ip}:${port}`]
                            }
                        })).data || {}).error;
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
                            },
                            {
                                headers: {
                                    "Authorization": settings.get("sessions")[`${ip}:${port}`]
                                }
                            })).data;
    
                            if (response && response.token) {
                                sessions[`${device.ip}:${device.port}`] = response.token;
    
                                settings.set("sessions", sessions);
                            }
                        }
                    }
                },

                async upload(ip, port, url, filename) {
                    return new Promise((resolve) => {
                        if (filename && existsSync(filename)) {
                            const data = new FormData();

                            data.append("file", new File([readFileSync(filename)], basename(filename), {
                                type: "application/octet-stream"
                            }));

                            Request.post(`http://${ip}:${port}/api${url}`, data, {
                                headers: {
                                    "Authorization": settings.get("sessions")[`${ip}:${port}`],
                                    "Content-Type": "multipart/form-data"
                                }
                            }).then((response) => {
                                resolve(response.data);
                            }).catch((error) => {
                                resolve({
                                    error: error.message
                                });
                            });
                        } else {
                            resolve({
                                error: "File does not exist"
                            });
                        }
                    });
                },

                async get(ip, port, url) {
                    return new Promise((resolve) => {
                        Request.get(`http://${ip}:${port}/api${url}`, {
                            headers: {
                                "Authorization": settings.get("sessions")[`${ip}:${port}`]
                            }
                        }).then((response) => {
                            resolve(response.data);
                        }).catch((error) => {
                            resolve({
                                error: error.message
                            });
                        });
                    });
                },

                async post(ip, port, url, data) {
                    return new Promise((resolve) => {
                        Request.post(`http://${ip}:${port}/api${url}`, data, {
                            headers: {
                                "Authorization": settings.get("sessions")[`${ip}:${port}`]
                            }
                        }).then((response) => {
                            resolve(response.data);
                        }).catch((error) => {
                            resolve({
                                error: error.message
                            });
                        });
                    });
                },

                async put(ip, port, url, data) {
                    return new Promise((resolve) => {
                        Request.put(`http://${ip}:${port}/api${url}`, data, {
                            headers: {
                                "Authorization": settings.get("sessions")[`${ip}:${port}`]
                            }
                        }).then((response) => {
                            resolve(response.data);
                        }).catch((error) => {
                            resolve({
                                error: error.message
                            });
                        });
                    });
                },

                async delete(ip, port, url) {
                    return new Promise((resolve) => {
                        Request.delete(`http://${ip}:${port}/api${url}`, {
                            headers: {
                                "Authorization": settings.get("sessions")[`${ip}:${port}`]
                            }
                        }).then((response) => {
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

        async $localize() {
            await LoadLanguage(settings.get("locale") || "en");
        },

        $window() {
            return remote.getCurrentWindow();
        },

        $focused() {
            return remote.BrowserWindow.getFocusedWindow();
        },

        $browse(url) {
            remote.shell.openExternal(url);
        },

        async $download(url) {
            ipcRenderer.send("download", {
                url,
                properties: {
                    saveAs: true
                }
            });
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

Components();

router.beforeEach(async (to, _from, next) => {
    if (to.path !== "/devices" && to.path !== "/etcher" && settings.get("devices").length === 0) {
        router.push({
            path: "/devices",
            query: {
                url: to.path
            }
        });
        
        return;
    }

    next();
});

LoadLanguage(settings.get("locale") || "en").then(() => {
    Vue.config.productionTip = false;

    new Vue({
        router,
        i18n,
        store: Store,
        render: h => h(App)
    }).$mount("#app");
});
