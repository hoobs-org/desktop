import { app, protocol,  BrowserWindow, ipcMain } from "electron";
import { createProtocol, installVueDevtools } from "vue-cli-plugin-electron-builder/lib";

import { download } from "electron-dl";

import windowStateKeeper from "electron-window-state";

const isDevelopment = process.env.NODE_ENV !== "production";

let state;
let window;

protocol.registerSchemesAsPrivileged([{
    scheme: "app",
    privileges: {
        secure: true,
        standard: true
    }
}]);

function createWindow() {
    state = windowStateKeeper({
        defaultWidth: 1000,
        defaultHeight: 800
    });

    window = new BrowserWindow({
        title: "HOOBS",
        x: state.x,
        y: state.y,
        frame: false,
        width: state.width,
        height: state.height,
        minWidth: 700,
        minHeight: 400,
        backgroundColor: "#262626",
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false
        }
    });

    state.manage(window);

    if (process.env.WEBPACK_DEV_SERVER_URL) {
        window.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    } else {
        createProtocol("app");

        window.loadURL("app://./index.html");
    }

    ipcMain.on("download", (_event, payload) => {
        download(BrowserWindow.getFocusedWindow(), payload.url, payload.properties).then(d => window.webContents.send("download_complete", d.getSavePath()));
    });

    window.on("closed", () => {
        window = null
    });
}

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
})

app.on("activate", () => {
    if (window === null) {
        createWindow();
    }
})

app.on("ready", async () => {
    if (isDevelopment && !process.env.IS_TEST) {
        try {
            await installVueDevtools()
        } catch (e) {
            console.error("Vue Devtools failed to install:", e.toString());
        }
    }

    createWindow();
})

if (isDevelopment) {
    if (process.platform === "win32") {
        process.on("message", data => {
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
