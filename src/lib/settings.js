import * as File from "fs";
import * as Path from "path";

import {
    app,
    remote
} from "electron";

export default class Settings {
    constructor(options) {
        this.path = Path.join((app || remote.app).getPath("userData"), `${options.name}.json`);
        this.data = this.parse(this.path, options.defaults);
    }

    get(key) {
        return this.data[key];
    }

    set(key, value) {
        this.data[key] = value;

        File.writeFileSync(this.path, JSON.stringify(this.data));
    }

    parse(path, defaults) {
        try {
            return JSON.parse(File.readFileSync(path));
        } catch(error) {
            return defaults;
        }
    }
}
