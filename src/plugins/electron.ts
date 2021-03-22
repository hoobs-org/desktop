import { remote } from "electron";
import Vue, { VueConstructor } from "vue";

export default {
    install(vue: VueConstructor<Vue>): void {
        vue.mixin({
            computed: {
                $electron() {
                    return {
                        get maximized() {
                            const window = remote.getCurrentWindow();

                            if (window) return window.isMaximized();

                            return false;
                        },

                        close() {
                            const window = remote.getCurrentWindow();

                            if (window) window.close();
                        },

                        minimize() {
                            const window = remote.getCurrentWindow();

                            if (window) window.minimize();
                        },

                        maximize() {
                            const window = remote.getCurrentWindow();

                            if (window) window.maximize();
                        },

                        restore() {
                            const window = remote.getCurrentWindow();

                            if (window) window.unmaximize();
                        },
                    };
                },
            },
        });
    },
};
