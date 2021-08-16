/**************************************************************************************************
 * hoobs-desktop                                                                                  *
 * Copyright (C) 2020 HOOBS                                                                       *
 *                                                                                                *
 * This program is free software: you can redistribute it and/or modify                           *
 * it under the terms of the GNU General Public License as published by                           *
 * the Free Software Foundation, either version 3 of the License, or                              *
 * (at your option) any later version.                                                            *
 *                                                                                                *
 * This program is distributed in the hope that it will be useful,                                *
 * but WITHOUT ANY WARRANTY; without even the implied warranty of                                 *
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the                                  *
 * GNU General Public License for more details.                                                   *
 *                                                                                                *
 * You should have received a copy of the GNU General Public License                              *
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.                          *
 **************************************************************************************************/

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

const helpers = {
    notify(title: string, body: string): void {
        new remote.Notification({ title, body }).show();
    },

    get maximized(): boolean {
        const window = remote.getCurrentWindow();

        if (window) return window.isMaximized();

        return false;
    },

    close(): void {
        const window = remote.getCurrentWindow();

        if (window) window.hide();
    },

    minimize(): void {
        const window = remote.getCurrentWindow();

        if (window) window.hide();
    },

    maximize(): void {
        const window = remote.getCurrentWindow();

        if (window) window.maximize();
    },

    restore(): void {
        const window = remote.getCurrentWindow();

        if (window) window.unmaximize();
    },

    async open(file: string): Promise<string> {
        const results = await shell.openPath(file);

        return results;
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

export default {
    helpers,

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
                    return helpers;
                },
            },
        });
    },
};
