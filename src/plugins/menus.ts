import Vue, { VueConstructor } from "vue";

export default class Menus {
    declare private current: undefined | string;

    declare private menus: any[];

    declare private events: Vue;

    constructor(menus: any[]) {
        this.events = new Vue();
        this.menus = menus;
    }

    on(event: string, callback: (value?: any) => void): void {
        this.events.$on(event, callback);
    }

    open(name: string, options?: { [key: string]: any }): void {
        if (this.current && this.current === name) {
            this.close();
        } else {
            const source = this.menus.findIndex((item) => item.name === name);

            if (source >= 0) {
                this.current = name;
                this.menus[source].options = options;
                this.events.$emit("open", this.menus[source]);
            }
        }
    }

    close(): void {
        for (let i = 0; i < this.menus.length; i += 1) {
            delete this.menus[i].options;
        }

        this.current = undefined;
        this.events.$emit("close");
    }

    install(vue: VueConstructor<Vue>): void {
        vue.mixin({
            computed: {
                $menu: () => this,
            },
        });

        Vue.component("menu-view", () => import("@/components/menus.vue"));
    }
}
