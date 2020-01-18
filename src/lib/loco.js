const File = require("fs");
const Loco = require("loco-api-js");

const { dirname, join } = require("path");

const loco = new Loco("5pxDtjXTzMLg3tFZ3EdDTEslro-AjMyBC");
const root = join(dirname(File.realpathSync(__filename)), "../");
const locale = join(root, "locale");

(async () => {
    let keys = [];

    const locales = await loco.getLocales();
    const source = JSON.parse(File.readFileSync(join(locale, "source.json")));

    keys = Object.keys(source);
    keys.sort();

    const used = [
        "bridge_name",
        "hoobs_version",
        "node_version",
        "homebridge_port",
        "home_setup_id",
        "home_setup_pin",
        "configuration_path",
        "plugins_path",
        "product",
        "manufacturer",
        "model",
        "serial",
        "uuid",
        "sku",
        "platform",
        "distro",
        "release",
        "codename",
        "kernel",
        "arch",
        "hostname",
        "codepage",
        "logofile",
        "build",
        "servicepack",
        "homebridge_version",
        "application_path",
        "local_modules_path",
        "global_modules_path",
        "operating_system",
        "system",
        "file_system"
    ];

    let entries = null;

    entries = File.readdirSync(root).filter(f => File.lstatSync(join(root, f)).isFile());

    for (let i = 0; i < entries.length; i++) {
        if (entries[i].endsWith(".vue") || entries[i].endsWith(".js")) {
            const content = File.readFileSync(join(root, entries[i]), "utf8");
            const matches = content.match(/\$t\(['"][a-z-_]*['"]\)/gm);

            if (matches) {
                for (let j = 0; j < matches.length; j++) {
                    let match = `${matches[j]}`;

                    match = match.replace(/\$t\('/gi, "");
                    match = match.replace(/'\)/gi, "");
                    match = match.replace(/\$t\("/gi, "");
                    match = match.replace(/"\)/gi, "");

                    if (used.indexOf(match) === -1) {
                        used.push(match);
                    }
                }
            }
        }
    }

    const views = join(root, "views");

    entries = File.readdirSync(views).filter(f => File.lstatSync(join(views, f)).isFile());

    for (let i = 0; i < entries.length; i++) {
        if (entries[i].endsWith(".vue") || entries[i].endsWith(".js")) {
            const content = File.readFileSync(join(views, entries[i]), "utf8");
            const matches = content.match(/\$t\(['"][a-z-_]*['"]\)/gm);

            if (matches) {
                for (let j = 0; j < matches.length; j++) {
                    let match = `${matches[j]}`;

                    match = match.replace(/\$t\('/gi, "");
                    match = match.replace(/'\)/gi, "");
                    match = match.replace(/\$t\("/gi, "");
                    match = match.replace(/"\)/gi, "");

                    if (used.indexOf(match) === -1) {
                        used.push(match);
                    }
                }
            }
        }
    }

    const components = join(root, "components");

    entries = File.readdirSync(components).filter(f => File.lstatSync(join(components, f)).isFile());

    for (let i = 0; i < entries.length; i++) {
        if (entries[i].endsWith(".vue") || entries[i].endsWith(".js")) {
            const content = File.readFileSync(join(components, entries[i]), "utf8");
            const matches = content.match(/\$t\(['"][a-z-_]*['"]\)/gm);

            if (matches) {
                for (let j = 0; j < matches.length; j++) {
                    let match = `${matches[j]}`;

                    match = match.replace(/\$t\('/gi, "");
                    match = match.replace(/'\)/gi, "");
                    match = match.replace(/\$t\("/gi, "");
                    match = match.replace(/"\)/gi, "");

                    if (used.indexOf(match) === -1) {
                        used.push(match);
                    }
                }
            }
        }
    }

    const sorted = {};

    for (let i = 0; i < keys.length; i++) {
        if (used.indexOf(keys[i]) >= 0) {
            sorted[keys[i]] = source[keys[i]];
        }
    }

    if (File.existsSync(join(locale, "source.json"))) {
        File.unlinkSync(join(locale, "source.json"));
    }

    File.appendFileSync(join(locale, "source.json"), JSON.stringify(sorted, null, 4));

    keys = Object.keys(sorted);

    const unused = [];

    if (File.existsSync(join(locale, "unused.json"))) {
        File.unlinkSync(join(locale, "unused.json"));
    }

    const missing = {};

    if (File.existsSync(join(locale, "missing.json"))) {
        File.unlinkSync(join(locale, "missing.json"));
    }

    for (let i = 0; i < locales.length; i++) {
        const lang = locales[i].code.split("-")[0];

        if (lang === "en") {
            if (File.existsSync(join(locale, `${lang}.json`))) {
                File.unlinkSync(join(locale, `${lang}.json`));
            }

            const output = {};

            output[lang] = {};

            for (let j = 0; j < keys.length; j++) {
                output[lang][keys[j]] = (sorted[keys[j]] || "").trim();
            }

            File.appendFileSync(join(locale, `${lang}.json`), JSON.stringify(output, null, 4));
        } else {
            if (File.existsSync(join(locale, `${lang}.json`))) {
                File.unlinkSync(join(locale, `${lang}.json`));
            }

            const resource = (await loco.exportLocale(locales[i].code));
            const output = {};

            output[lang] = {};

            for (let j = 0; j < keys.length; j++) {
                if (resource[keys[j]] === undefined && resource.en[keys[j]] === undefined) {
                    missing[keys[j]] = (sorted[keys[j]] || "").trim();
                }

                output[lang][keys[j]] = (resource[keys[j]] || resource.en[keys[j]] || sorted[keys[j]] || "").trim();
            }

            let available = null;

            available = Object.keys(resource);

            if (available) {
                for (let j = 0; j < available.length; j++) {
                    if (available[j] !== "en" && keys.indexOf(available[j]) === -1 && unused.indexOf(available[j]) === -1) {
                        unused.push(available[j]);
                    }
                }
            }

            if (resource.en) {
                available = Object.keys(resource.en);

                if (available) {
                    for (let j = 0; j < available.length; j++) {
                        if (available[j] !== "en" && keys.indexOf(available[j]) === -1 && unused.indexOf(available[j]) === -1) {
                            unused.push(available[j]);
                        }
                    }
                }
            }

            File.appendFileSync(join(locale, `${lang}.json`), JSON.stringify(output, null, 4));
        }

        console.log(`Complete '${lang}.json'`);
    }

    File.appendFileSync(join(locale, "unused.json"), JSON.stringify(unused, null, 4));
    File.appendFileSync(join(locale, "missing.json"), JSON.stringify(missing, null, 4));
})();
