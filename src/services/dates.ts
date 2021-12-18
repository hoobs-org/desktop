/**************************************************************************************************
 * hoobs-desktop                                                                                  *
 * Copyright (C) 2020 HOOBS                                                                       *
 *                                                                                                *
 * This program is free software: you can redistribute it and/or modify                           *
 * it under the terms of the GNU General Public License as published by                           *
 * the Free Software Foundation, either version 3 of the License, or                              *
 * (at your option) any later version.                                                            *
 *                                                                                                *
 * This program is distributed in the hope that it will be useful,                                *
 * but WITHOUT ANY WARRANTY; without even the implied warranty of                                 *
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the                                  *
 * GNU General Public License for more details.                                                   *
 *                                                                                                *
 * You should have received a copy of the GNU General Public License                              *
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.                          *
 **************************************************************************************************/

export default class Dates {
    static weekday(value: Date): string {
        const day = value.getDay();

        if (!Number.isInteger(day)) return "";

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
