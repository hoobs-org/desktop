import hoobs from "@hoobs/sdk";
import Vue from "vue";
import { shell } from "electron";

import IconComponent from "@/components/elements/icon.vue";
import ModalComponent from "@/components/elements/modal.vue";
import RadioComponent from "@/components/fields/radio.vue";
import ContextComponent from "@/components/elements/context.vue";
import CheckboxComponent from "@/components/fields/checkbox.vue";
import TextComponent from "@/components/fields/text.vue";
import TextareaComponent from "@/components/fields/textarea.vue";
import PasswordComponent from "@/components/fields/password.vue";
import NumberComponent from "@/components/fields/number.vue";
import IntegerComponent from "@/components/fields/integer.vue";
import SearchComponent from "@/components/fields/search.vue";
import SelectComponent from "@/components/fields/select.vue";
import PortComponent from "@/components/fields/port.vue";
import SpinnerComponent from "@/components/elements/spinner.vue";

import App from "./app.vue";
import Scanner from "./services/scanner";

import electron from "./plugins/electron";
import converter from "./plugins/markdown";
import graphing from "./plugins/graphing";
import themes from "./plugins/themes";
import drag from "./plugins/drag";

import actions from "./services/actions";
import dialogs from "./services/dialogs";
import router from "./services/router";
import menus from "./services/menus";
import store from "./services/store";
import tasks from "./services/tasks";
import lang from "./lang";

const scanner = new Scanner();
const io = hoobs.sdk.io();
const markdown = converter();

hoobs.sdk.config.token.get(() => (store.state.session || ""));
hoobs.sdk.config.token.set((token: string) => { store.commit("SESSION:SET", token); });

scanner.on("device", (data) => store.commit("IO:DEVICE", data));
scanner.on("clear", () => store.commit("IO:DEVICE:CLEAR"));

io.on("log", (data) => store.commit("IO:LOG", data));
io.on("monitor", (data) => store.commit("IO:MONITOR", data));
io.on("notification", (data) => store.commit("IO:NOTIFICATION", data));
io.on("accessory_change", (data) => store.commit("IO:ACCESSORY:CHANGE", data));
io.on("room_change", (data) => store.commit("IO:ROOM:CHANGE", data));

io.on("connect", () => actions.emit("io", "connected"));
io.on("reconnect", () => actions.emit("io", "connected"));
io.on("disconnect", () => actions.emit("io", "disconnected"));

actions.on("log", "history", () => {
    hoobs.sdk.log().then((messages) => store.commit("LOG:HISTORY", messages));
});

actions.on("window", "open", (url) => {
    shell.openExternal(url);
});

const { current }: any = store.state;

if (current) hoobs.sdk.config.host.set(current.ip, current.port);

router.beforeEach((to, _from, next) => {
    if (store.state.current) {
        hoobs.sdk.auth.validate().then((valid) => {
            if (["/login", "/setup"].indexOf(to.path) === -1 && !valid) router.push({ path: "/login", query: { url: to.path } });
        });
    } else if (["/login", "/setup"].indexOf(to.path) === -1) {
        router.push({ path: "/login", query: { url: to.path } });
    }

    next();
});

Vue.config.productionTip = false;

Vue.use(io);
Vue.use(drag);
Vue.use(hoobs);
Vue.use(menus);
Vue.use(scanner);
Vue.use(dialogs);
Vue.use(actions);
Vue.use(electron);
Vue.use(markdown);
Vue.use(graphing);

Vue.use(themes, { hoobs, store });

Vue.component("icon", IconComponent);
Vue.component("modal", ModalComponent);
Vue.component("radio", RadioComponent);
Vue.component("context", ContextComponent);
Vue.component("checkbox", CheckboxComponent);
Vue.component("text-field", TextComponent);
Vue.component("textarea-field", TextareaComponent);
Vue.component("password-field", PasswordComponent);
Vue.component("number-field", NumberComponent);
Vue.component("integer-field", IntegerComponent);
Vue.component("search-field", SearchComponent);
Vue.component("select-field", SelectComponent);
Vue.component("port-field", PortComponent);
Vue.component("spinner", SpinnerComponent);

tasks(store);

new Vue({
    router,
    store,
    i18n: lang,
    render: (h) => h(App),
}).$mount("#app");
