JSON.tryParse = function(value, replacement) {
    replacement = replacement || null;

    try {
        return JSON.parse(value);
    } catch {
        return replacement;
    }
};

JSON.load = function(filename, replacement) {
    replacement = replacement || null;

    try {
        return JSON.parse(File.readFileSync(filename));
    } catch {
        return replacement;
    }
};

JSON.validate = function(filename) {
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
},

JSON.equals = function(source, value) {
    if (JSON.stringify(source) === JSON.stringify(value)) {
        return true;
    }

    return false;
};

JSON.clone = function(object) {
    return JSON.parse(JSON.stringify(object));
};

JSON.toString = function(object) {
    return JSON.stringify(object, null, 4);
};
