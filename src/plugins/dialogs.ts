import Vue, { VueConstructor } from "vue";

import DialogsComponent from "@/components/dialogs.vue";

export default class Dialogs {
    declare private current: any[];

    declare private dialogs: any[];

    declare private events: Vue;

    constructor(dialogs: any[]) {
        this.events = new Vue();
        this.dialogs = dialogs;
        this.current = [];
    }

    on(event: string, callback: (value?: any) => void): void {
        this.events.$on(event, callback);
    }

    open(name: string, options?: { [key: string]: any }): void {
        const dialog = this.dialogs.findIndex((item) => item.name === name);

        if (dialog >= 0) {
            this.dialogs[dialog].options = options;

            this.current.push(this.dialogs[dialog]);
            this.events.$emit("open", this.dialogs[dialog]);
            this.events.$emit("state", this.current);
        }
    }

    close(name: string): void {
        if (name) {
            const current = this.current.findIndex((item) => item.name === name);
            const dialog = this.dialogs.findIndex((item) => item.name === name);

            if (current >= 0 && dialog >= 0) {
                delete this.dialogs[dialog].options;

                this.current.splice(current, 1);
                this.events.$emit("close", this.dialogs[dialog]);
                this.events.$emit("state", this.current);
            }
        } else {
            while (this.current.length > 0) {
                const current = this.current.pop();
                const dialog = this.current.findIndex((item) => item.name === current.name);

                if (dialog >= 0) {
                    delete this.dialogs[dialog].options;

                    this.events.$emit("close", this.dialogs[dialog]);
                }
            }

            this.events.$emit("state", this.current);
        }
    }

    install(vue: VueConstructor<Vue>): void {
        vue.mixin({
            computed: {
                $dialog: () => this,
            },

            methods: {
                $alert: (message: string) => {
                    this.open("alert", { message });
                },

                $confirm: (action: string, message: string, confirm: () => void, cancel?: () => void) => {
                    this.open("confirm", {
                        message,
                        action,
                        confirm,
                        cancel,
                    });
                },
            },
        });

        Vue.component("dialog-view", DialogsComponent);
    }
}
