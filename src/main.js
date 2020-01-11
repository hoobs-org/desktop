import Vue from "vue";
import Request from "axios";

import App from "./app.vue";
import Router from "./router";
import Settings from "./lib/settings";

import { remote } from "electron";

const settings = new Settings({
    name: "user-preferences",
    defaults: {
        devices: []
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
                async get(ip, port, url, token) {
                    Request.defaults.headers.get["Authorization"] = token;

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

                async post(ip, port, url, data, token) {
                    Request.defaults.headers.post["Authorization"] = token;

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

                async put(ip, port, url, data, token) {
                    Request.defaults.headers.put["Authorization"] = token;

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

                async delete(ip, port, url, data, token) {
                    Request.defaults.headers.delete["Authorization"] = token;

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
    render: h => h(App)
}).$mount("#app");
