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

import {
    app,
    shell,
    protocol,
    BrowserWindow,
    MenuItemConstructorOptions,
    Menu,
    Tray,
} from "electron";

import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
import windowState from "electron-window-state";
import context from "electron-context-menu";
import electron from "./plugins/electron";

const gotLock = app.requestSingleInstanceLock();
const isDevelopment = process.env.NODE_ENV !== "production";

protocol.registerSchemesAsPrivileged([
    { scheme: "app", privileges: { secure: true, standard: true } },
]);

let window: BrowserWindow | undefined;

async function createWindow() {
    const template: MenuItemConstructorOptions[] = [];

    if (process.platform === "darwin") {
        template.push({
            label: app.name,
            submenu: [
                { role: "about" },
                { type: "separator" },
                { role: "services" },
                { type: "separator" },
                { role: "hide" },
                { role: "hideOthers" },
                { role: "unhide" },
                { type: "separator" },
                { role: "quit" },
            ],
        });
    }

    template.push({
        label: "File",
        submenu: [
            { role: "reload" },
            { role: "forceReload" },
            { type: "separator" },
            process.platform === "darwin" ? { role: "close" } : { role: "quit" },
        ],
    });

    template.push({
        label: "Edit",
        submenu: [
            { label: "Undo", accelerator: "CmdOrCtrl+Z", role: "undo" },
            { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", role: "redo" },
            { type: "separator" },
            { label: "Cut", accelerator: "CmdOrCtrl+X", role: "cut" },
            { label: "Copy", accelerator: "CmdOrCtrl+C", role: "copy" },
            { label: "Paste", accelerator: "CmdOrCtrl+V", role: "paste" },
        ],
    });

    template.push({
        role: "help",
        submenu: [
            {
                label: "Learn More",
                click: async () => {
                    await shell.openExternal("https://support.hoobs.org/docs");
                },
            },
        ],
    });

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));

    const state = windowState({ defaultWidth: 1000, defaultHeight: 800 });

    window = new BrowserWindow({
        title: "HOOBS",
        icon: electron.helpers.image("Tray.ico"),
        x: state.x,
        y: state.y,
        frame: false,
        width: state.width,
        height: state.height,
        minWidth: 700,
        minHeight: 400,
        backgroundColor: "#141414",
        webPreferences: {
            nodeIntegration: (process.env.ELECTRON_NODE_INTEGRATION as unknown) as boolean,
            enableRemoteModule: true,
            contextIsolation: false,
            webSecurity: false,
        },
    });

    window.setTitle("HOOBS");
    state.manage(window);

    if (process.env.WEBPACK_DEV_SERVER_URL) {
        await window.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string);

        if (!process.env.IS_TEST) window.webContents.openDevTools({ mode: "detach" });
    } else {
        createProtocol("app");
        window.loadURL("app://./index.html");
    }
}

if (!gotLock) {
    app.exit(0);
} else {
    app.setAppUserModelId("HOOBS");
    app.commandLine.appendSwitch("disable-site-isolation-trials");

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        } else if (window) {
            window.show();
            window.focus();
        }
    });

    app.on("second-instance", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        } else if (window) {
            window.show();
            window.focus();
        }
    });

    let tray: Tray | undefined;

    app.on("ready", async () => {
        if (isDevelopment && !process.env.IS_TEST) {
            try {
                await installExtension(VUEJS_DEVTOOLS);
            } catch (_error) {
                console.error("developer tools failed to install");
            }
        }

        tray = new Tray(process.platform === "win32" ? electron.helpers.image("Tray.ico") : electron.helpers.image("TrayTemplate.png"));
        tray.setToolTip("HOOBS");

        tray.setContextMenu(Menu.buildFromTemplate([
            {
                label: "Dashboard",
                click: () => {
                    if (window) {
                        window.show();
                        window.focus();

                        if (process.platform === "win32") {
                            window.setSkipTaskbar(false);
                        } else {
                            app.dock.show();
                        }
                    }
                },
            },
            {
                label: "Enable on Startup",
                type: "checkbox",
                checked: app.getLoginItemSettings().openAtLogin,
                click: () => {
                    app.setLoginItemSettings({ openAtLogin: !app.getLoginItemSettings().openAtLogin });
                },
            },
            { type: "separator" },
            {
                label: "Quit HOOBS Desktop",
                click: () => {
                    app.exit(0);
                },
            },
        ]));

        tray.on("double-click", () => {
            if (window) {
                window.show();
                window.focus();

                if (process.platform === "win32") {
                    window.setSkipTaskbar(false);
                } else {
                    app.dock.show();
                }
            }
        });

        createWindow();
        context({});
    });

    if (isDevelopment) {
        if (process.platform === "win32") {
            process.on("message", (data) => {
                if (data === "graceful-exit") {
                    app.exit(0);
                }
            });
        } else {
            process.on("SIGTERM", () => {
                app.exit(0);
            });
        }
    }
}
