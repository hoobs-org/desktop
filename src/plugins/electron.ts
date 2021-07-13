import { remote } from "electron";
import Vue, { VueConstructor } from "vue";
import OS from "os";

const pjson = require("../../package.json");

const platforms: { [key: string]: string } = {
    win32: "win",
    darwin: "mac",
};

export default {
    install(vue: VueConstructor<Vue>): void {
        vue.mixin({
            computed: {
                $version() {
                    return pjson.version;
                },

                $os(): string {
                    return platforms[OS.platform()];
                },

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
