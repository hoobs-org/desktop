import {
    app,
    protocol,
    BrowserWindow
} from "electron";

import {
    createProtocol,
    installVueDevtools
} from "vue-cli-plugin-electron-builder/lib";

import windowStateKeeper from "electron-window-state";

const isDevelopment = process.env.NODE_ENV !== "production";

let state;
let win;

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

    win = new BrowserWindow({
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
            nodeIntegration: true
        }
    });

    state.manage(win);

    if (process.env.WEBPACK_DEV_SERVER_URL) {
        win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    } else {
        createProtocol("app");

        win.loadURL("app://./index.html");
    }

    win.on("closed", () => {
        win = null
    });
}

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
})

app.on("activate", () => {
    if (win === null) {
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
