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

import Vue from "vue";
import VueI18n from "vue-i18n";
import Languages from "./languages";

function supported(locale: string) {
    switch (locale) {
        case "ar":
        case "bg":
        case "cs":
        case "de":
        case "el":
        case "es":
        case "fr":
        case "he":
        case "it":
        case "ja":
        case "ko":
        case "nl":
        case "no":
        case "pl":
        case "pt":
        case "ro":
        case "ru":
        case "sv":
        case "vi":
        case "zh":
            return locale;

        default:
            return "en";
    }
}

function current(locale?: string) {
    if ((!locale || locale === "") && window.navigator && window.navigator.language) return supported(Languages[(`${window.navigator.language}`).toLowerCase()]);
    if (!locale || locale === "") return supported("en");

    return supported(Languages[locale]);
}

function load(locale: string) {
    return require(`./locals/${current(locale)}.json`);
}

Vue.use(VueI18n);

const locale = current();

export default new VueI18n({ locale, messages: load(locale) });
