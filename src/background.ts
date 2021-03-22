import { app, protocol, BrowserWindow } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
import windowState from "electron-window-state";

const isDevelopment = process.env.NODE_ENV !== "production";

protocol.registerSchemesAsPrivileged([
    { scheme: "app", privileges: { secure: true, standard: true } },
]);

async function createWindow() {
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

    state.manage(window);

    if (process.env.WEBPACK_DEV_SERVER_URL) {
        await window.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string);

        if (!process.env.IS_TEST) window.webContents.openDevTools({ mode: "detach" });
    } else {
        createProtocol("app");
        window.loadURL("app://./index.html");
    }
}

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
