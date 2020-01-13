import {ipcRenderer} from "electron";

ipcRenderer.on("download_complete", (_event, file) => {
    console.log(file);
});
