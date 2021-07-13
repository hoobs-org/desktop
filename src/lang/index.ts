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

export default new VueI18n({
    locale,
    messages: load(locale),
});
