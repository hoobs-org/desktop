import Vue from "vue";
import App from "./App.vue";
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
            }
        }
    },

    methods: {
        $window() {
            return remote.BrowserWindow.getFocusedWindow();
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
    render: h => h(App),
    created() {
        // this.$router.push("/");
    }
}).$mount("#app");
