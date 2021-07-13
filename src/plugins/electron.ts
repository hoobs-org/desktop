import { remote, shell } from "electron";
import Vue, { VueConstructor } from "vue";
import Request from "@hoobs/sdk/lib/request";
import OS from "os";
import { join } from "path";
import { existsSync, writeFileSync, unlinkSync } from "fs";

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

                        open(file: string) {
                            shell.openPath(file);
                        },

                        download(url: string | undefined, filename: string): Promise<string | undefined> {
                            return new Promise((resolve) => {
                                if (url && url !== "") {
                                    Request({
                                        url,
                                        method: "GET",
                                        responseType: "blob",
                                    }).then((response) => {
                                        response.data.arrayBuffer().then((buffer: Buffer) => {
                                            const file = join(OS.tmpdir(), filename);

                                            if (existsSync(file)) unlinkSync(file);

                                            writeFileSync(file, Buffer.from(buffer));
                                            resolve(file);
                                        }).catch(() => {
                                            resolve(undefined);
                                        });
                                    }).catch(() => {
                                        resolve(undefined);
                                    });
                                } else {
                                    resolve(undefined);
                                }
                            });
                        },
                    };
                },
            },
        });
    },
};
