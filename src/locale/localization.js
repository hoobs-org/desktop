import Vue from "vue";
import VueI18n from "vue-i18n";
import Messages from "@/locale/en.json";

Vue.use(VueI18n);

export const i18n = new VueI18n({
    locale: "en",
    fallbackLocale: "en",
    messages: Messages
})

const loadedLanguages = ["en"]

function setLanguage (lang) {
    i18n.locale = lang;

    document.querySelector("html").setAttribute("lang", lang);

    return lang;
}

export function LoadLanguage(lang) {
    if (i18n.locale === lang) {
        return Promise.resolve(setLanguage(lang));
    }

    if (loadedLanguages.includes(lang)) {
        return Promise.resolve(setLanguage(lang))
    }

    return import(/* webpackChunkName: "lang-[request]" */ `@/locale/${lang}.json`).then((messages) => {
        i18n.setLocaleMessage(lang, messages.default[lang]);
        loadedLanguages.push(lang);

        return setLanguage(lang)
    }
  )
}
