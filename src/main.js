import Vue from "vue";
import App from "./App.vue";
import Router from "./lib/router";
import Settings from "./lib/settings";

import { remote } from "electron";

const settings = new Settings({
    name: "user-preferences",
    defaults: {
        devices: []
    }
});

Vue.mixin({
    computed: {
        $window() {
            return remote.BrowserWindow.getFocusedWindow();
        }
    },

    methods: {
        $minimize() {
            remote.BrowserWindow.getFocusedWindow().minimize();
        },

        $maximize() {
            const window = remote.BrowserWindow.getFocusedWindow();

            if (window.isMaximized()){
                window.unmaximize();
            } else{
                window.maximize();
            }
        },

        $close() {
            remote.BrowserWindow.getFocusedWindow().close();
        },

        $settings: {
            get(key) {
                return settings.get(key);
            },

            set(key, value) {
                settings.set(key, value);
            }
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
