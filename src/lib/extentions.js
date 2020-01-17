Object.defineProperty(Object.prototype, "getValue", {
    enumerable: false,
    writable: true,

    value: function () {
        let value = this;
        let search = ([...arguments] || []).map(a => Array.isArray(a) ? a.join(".") : a).join(".");

        if (!search || search === "") {
            return value;
        }

        search = search.replace(/\[(\w+)\]/g, ".$1");
        search = search.replace(/^\./, '');

        const keys = search.split(".");

        for (var i = 0, n = keys.length; i < n; ++i) {
            const key = keys[i];

            if (key in value) {
                value = value[key];
            } else {
                return;
            }
        }

        return value;
    }
});

Object.defineProperty(Object.prototype, "getKeys", {
    enumerable: false,
    writable: false,

    value: function () {
        return Object.keys(this);
    }
});

Object.defineProperty(Number.prototype, "ordinal", {
    get: function () {
        let value = parseInt(this, 10);

        if (Number.isNaN(value) || value <= 0) {
            return `${this}`;
        }

        if (value % 10 === 1 && value % 100 !== 11) {
            return `${value}st`;
        }

        if (value % 10 === 2 && value % 100 !== 12) {
            return `${value}nd`;
        }

        if (value % 10 === 3 && value % 100 !== 13) {
            return `${value}rd`;
        }

        return `${value}th`;
    }
});

JSON.tryParse = function (value, replacement) {
    replacement = replacement || null;

    try {
        return JSON.parse(value);
    } catch {
        return replacement;
    }
};

JSON.load = function (filename, replacement) {
    replacement = replacement || null;

    try {
        return JSON.parse(File.readFileSync(filename));
    } catch {
        return replacement;
    }
};

JSON.validate = function (filename) {
    if (File.existsSync(filename)) {
        try {
            if (typeof (JSON.parse(File.readFileSync(filename))) === "object") {
                return true;
            }

            return false;
        } catch {
            return false;
        }
    }

    return false;
};

JSON.equals = function (source, value) {
    if (JSON.stringify(source) === JSON.stringify(value)) {
        return true;
    }

    return false;
};

JSON.clone = function (object) {
    return JSON.parse(JSON.stringify(object));
};

JSON.toString = function (object) {
    return JSON.stringify(object, null, 4);
};
