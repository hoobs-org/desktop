export function units(value: number): { [key: string]: number | string } {
    const results = {
        value: Math.round((value / 1073741824) * 100) / 100,
        units: "GB",
    };

    while (results.value < 1 && results.units !== "KB") {
        results.value = Math.round((results.value * 1024) * 100) / 100;

        switch (results.units) {
            case "GB":
                results.units = "MB";
                break;

            case "MB":
                results.units = "KB";
                break;

            default:
                results.units = "GB";
                break;
        }
    }

    return results;
}

export function timespan(value: number): { [key: string]: number } {
    const results = {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    };

    let timestamp = value;

    results.days = Math.floor(timestamp / (1000 * 60 * 60 * 24));
    timestamp -= results.days * (1000 * 60 * 60 * 24);
    results.hours = Math.floor(timestamp / (1000 * 60 * 60));
    timestamp -= results.hours * (1000 * 60 * 60);
    results.minutes = Math.floor(timestamp / (1000 * 60));
    timestamp -= results.minutes * (1000 * 60);
    results.seconds = Math.floor(timestamp / (1000));

    return results;
}

export function mac(): string {
    let value = "";

    for (let i = 0; i < 6; i += 1) {
        if (value !== "") value += ":";

        const hex = `00${Math.floor(Math.random() * 255).toString(16).toUpperCase()}`;

        value += hex.substring(hex.length - 2, hex.length);
    }

    return value;
}
