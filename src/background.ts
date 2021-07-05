import {
    app,
    shell,
    protocol,
    BrowserWindow,
    MenuItemConstructorOptions,
    Menu,
} from "electron";

import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
import windowState from "electron-window-state";
import context from "electron-context-menu";

const isDevelopment = process.env.NODE_ENV !== "production";

protocol.registerSchemesAsPrivileged([
    { scheme: "app", privileges: { secure: true, standard: true } },
]);

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

    const state = windowState({
        defaultWidth: 1000,
        defaultHeight: 800,
    });

    const window = new BrowserWindow({
        title: "HOOBS",
        icon: `${__dirname}/../public/favicon.ico`,
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

app.commandLine.appendSwitch("disable-site-isolation-trials");

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on("ready", async () => {
    if (isDevelopment && !process.env.IS_TEST) {
        try {
            await installExtension(VUEJS_DEVTOOLS);
        } catch (e) {
            console.error("Vue Devtools failed to install:", e.toString());
        }
    }
    createWindow();
    context({});
});

if (isDevelopment) {
    if (process.platform === "win32") {
        process.on("message", (data) => {
            if (data === "graceful-exit") {
                app.quit();
            }
        });
    } else {
        process.on("SIGTERM", () => {
            app.quit();
        });
    }
}
