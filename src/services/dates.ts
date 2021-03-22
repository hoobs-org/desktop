export default class Dates {
    static weekday(value: Date): string {
        const day = value.getDay();

        if (!Number.isInteger(day)) {
            return "";
        }

        switch (day % 7) {
            case 1:
                return "monday";

            case 2:
                return "tuesday";

            case 3:
                return "wednesday";

            case 4:
                return "thursday";

            case 5:
                return "friday";

            case 6:
                return "saturday";

            default:
                return "sunday";
        }
    }
}
