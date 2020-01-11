import Vue from "vue";
import Request from "axios";

import App from "./app.vue";
import Router from "./router";
import Store from "./lib/store";
import Settings from "./lib/settings";

import { remote } from "electron";

const settings = new Settings({
    name: "preferences",
    defaults: {
        devices: [],
        sessions: {}
    }
});

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

            api: {
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
            return remote.BrowserWindow.getFocusedWindow().isMaximized();
        },

        $minimize() {
            remote.BrowserWindow.getFocusedWindow().minimize();
        },

        $maximize() {
            remote.BrowserWindow.getFocusedWindow().maximize();
        },

        $unmaximize() {
            remote.BrowserWindow.getFocusedWindow().unmaximize();
        },

        $close() {
            remote.BrowserWindow.getFocusedWindow().close();
        }
    },
});

Vue.config.productionTip = false;

new Vue({
    router: Router,
    store: Store,
    render: h => h(App)
}).$mount("#app");
