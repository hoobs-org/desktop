import { Store } from "vuex";
import Vue, { VueConstructor } from "vue";
import Sanitize from "@hoobs/sdk/lib/sanitize";

interface Options {
    store: Store<any>;
    hoobs: any;
}

export function path(theme: string, hoobs?: any | unknown, store?: Store<any>): string {
    switch (theme) {
        case "light":
        case "dark":
            return `/defaults/${theme}/theme.css`;

        default:
            if (hoobs && store && store.state.current) {
                return `${hoobs.sdk.config.host.get("themes")}/${theme}/theme.css`;
            }

            return "/defaults/dark/theme.css";
    }
}

export async function set(name: string, hoobs?: any | unknown, store?: Store<any>): Promise<void> {
    const style = document.getElementById("app-theme");

    if (hoobs && store && store.state.current) {
        const config = await hoobs.sdk.config.get();

        config.theme = Sanitize(name);

        await hoobs.sdk.config.update(config);
    }

    if (style) style.setAttribute("href", path(Sanitize(name), hoobs, store));
    if (store) store.commit("THEME:SET", Sanitize(name));
}

export async function load(hoobs?: any | unknown, store?: Store<any>): Promise<void> {
    const style = document.getElementById("app-theme");

    let theme: { [key: string]: any } = {};

    if (hoobs && store && store.state.current) {
        const config = await hoobs.sdk.config.get();

        theme = await hoobs.sdk.theme.get(config.theme || "dark");
    }

    if (style) style.setAttribute("href", path(theme.name || "dark", hoobs, store));
    if (store) store.commit("THEME:SET", theme.name || "dark");
}

export default {
    install(vue: VueConstructor<Vue>, options: Options): void {
        vue.mixin({
            computed: {
                $theme() {
                    return {
                        load() {
                            load(options?.hoobs, options?.store);
                        },

                        set(name: string) {
                            set(name, options?.hoobs, options?.store);
                        },

                        async get() {
                            const config = await options?.hoobs.sdk.config.get();
                            const theme = await options?.hoobs.sdk.theme.get(config.theme || "dark");

                            return theme;
                        },
                    };
                },
            },
        });
    },
};
