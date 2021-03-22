import Vue, { VueConstructor } from "vue";

class Events {
    declare private events: Vue;

    constructor() {
        this.events = new Vue();
    }

    on(view: string, event: string, callback: (value?: any) => void) {
        this.events.$on(`${view}:${event}`, callback);
    }

    off(view: string, event: string) {
        this.events.$off(`${view}:${event}`);
    }

    emit(view: string, event: string, payload?: any) {
        this.events.$emit(`${view}:${event}`, payload);
    }

    install(vue: VueConstructor<Vue>): void {
        vue.mixin({ computed: { $action: () => this } });
    }
}

export default new Events();
