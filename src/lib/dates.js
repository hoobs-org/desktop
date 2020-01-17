Date.Millisecond = 0;
Date.Second = 1;
Date.Minute = 2;
Date.Hour = 3;
Date.Day = 4;
Date.Year = 5;

Date.today = function () {
    const date = new Date();

    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);

    return date;
};

Date.latest = function(date1, date2) {
    date1 = new Date(date1);
    date2 = new Date(date2);

    if (date2 && date2 !== "") {
        const latest = new Date(date2);

        if (!date1 || latest > date1) {
            return new Date(latest);
        }
    }

    return date1;
}

Object.defineProperty(Date.prototype, "date", {
    get: function () {
        return `${this.getMonth() + 1}/${this.getDate()}/${this.getFullYear()}`;
    }
});

Object.defineProperty(Date.prototype, "time", {
    get: function () {
        return `${this.getHours() % 12 ? this.getHours() % 12 : 12}:${this.getMinutes() < 10 ? `0${this.getMinutes()}` : this.getMinutes()} ${this.getHours() >= 12 ? "PM" : "AM"}`;
    }
});

Object.defineProperty(Date.prototype, "first", {
    get: function () {
        return new Date(this.getFullYear(), this.getMonth(), 1);
    }
});

Object.defineProperty(Date.prototype, "last", {
    get: function () {
        const value = new Date(this);

        value.setMonth(value.getMonth() + 1);

        return value.first.add(Date.Day, -1);
    }
});

Object.defineProperty(Date.prototype, "sunday", {
    get: function () {
        return new Date(this.setDate(this.getDate() - this.getDay() + (this.getDay() === 0 ? -6 : 1) - 1));
    }
});

Object.defineProperty(Date.prototype, "month", {
    get: function () {
        switch (this.getMonth() % 12) {
            case 1:
                return "February";

            case 2:
                return "March";

            case 3:
                return "April";

            case 4:
                return "May";

            case 5:
                return "June";

            case 6:
                return "July";

            case 7:
                return "August";

            case 8:
                return "September";

            case 9:
                return "October";

            case 10:
                return "November";

            case 11:
                return "December";

            default:
                return "January";
        }
    }
});

Object.defineProperty(Date.prototype, "day", {
    get: function () {
        switch (this.getDay() % 7) {
            case 1:
                return "Monday";

            case 2:
                return "Tuesday";

            case 3:
                return "Wednesday";

            case 4:
                return "Thursday";

            case 5:
                return "Friday";

            case 6:
                return "Saturday";

            default:
                return "Sunday";
        }
    }
});

Object.defineProperty(Date.prototype, "display", {
    get: function () {
        if (new Date().getFullYear() === this.getFullYear()) {
            return `${this.month} ${this.getDate().ordinal}`;
        }

        return `${this.month} ${this.getDate().ordinal}, ${this.getFullYear()}`;
    }
});

Object.defineProperty(Date.prototype, "age", {
    get: function () {
        const age = new Date() - this;
        const future = age < 0;

        if (Math.abs(age) < 2000) {
            return "Now";
        }

        if (Math.abs(age) < 60000) {
            return "A few seconds ago";
        }

        if (Math.abs(age) < 3600000 && Math.abs(age) >= 120000) {
            return `${future ? "In " : ""}${Math.floor(Math.abs(age) / 60000)} minutes${future ? "" : " ago"}`;
        }

        if (Math.abs(age) < 3600000) {
            return `${future ? "In " : ""}${Math.floor(Math.abs(age) / 60000)} minute${future ? "" : " ago"}`;
        }

        if (Math.abs(age) < 86400000 && Math.abs(age) >= 7200000) {
            return `${future ? "In " : ""}${Math.floor(Math.abs(age) / 3600000)} hours${future ? "" : " ago"}`;
        }

        if (Math.abs(age) < 86400000) {
            return `${future ? "In " : ""}${Math.floor(Math.abs(age) / 3600000)} hour${future ? "" : " ago"}`;
        }

        if (age > 0 && age < 604800000 && age >= 172800000) {
            return `${Math.floor(Math.abs(age) / 86400000)} days ago`;
        }

        if (age > 0 && age < 604800000) {
            return `${Math.floor(Math.abs(age) / 86400000)} day ago`;
        }

        return "";
    }
});

Object.defineProperty(Date.prototype, "period", {
    get: function () {
        if (this.getHours() < 12) {
            return "morning";
        } else if (this.getHours() < 18) {
            return "afternoon";
        } else {
            return "evening";
        }
    }
});

Object.defineProperty(Date.prototype, "season", {
    get: function () {
        switch(this.getMonth() + 1) {
            case 12:
            case 1:
            case 2:
                return "winter";

            case 3:
            case 4:
            case 5:
                return "spring";

            case 6:
            case 7:
            case 8:
                return "summer";

            default:
                return "fall";
        }
    }
});

Object.defineProperty(Date.prototype, "add", {
    enumerable: false,
    writable: true,

    value: function (interval, number) {
        const value = new Date(this);

        switch(interval) {
            case Date.Second:
                value.setTime(value.getTime() + (number * 1000));
                break;

            case Date.Minute:
                value.setTime(value.getTime() + (number * 60 * 1000));
                break;

            case Date.Hour:
                value.setTime(value.getTime() + (number * 60 * 60 * 1000));
                break;

            case Date.Day:
                value.setTime(value.getTime() + (number * 24 * 60 * 60 * 1000));
                break;
                
            case Date.Year:
                value.setTime(value.getTime() + (number * 365 * 24 * 60 * 60 * 1000));
                break;

            default:
                value.setTime(value.getTime() + number);
                break;
        }

        return value;
    }
});

Object.defineProperty(Date.prototype, "range", {
    enumerable: false,
    writable: true,

    value: function (interval, number) {
        const now = new Date().getTime();

        let start = this.add(interval, number * -1);
        let end = new Date(this);

        if (this > now) {
            start = now.add(interval, number * -1);
            end = now;
        }

        return {
            start,
            end
        };
    }
});
