import Vue from "vue";
import App from "./App.vue";
import Router from "./router";
import Themes from "./themes/themes";

Vue.config.productionTip = false;

new Vue({
    router: Router,
    themes: Themes,
    render: h => h(App),
    created() {
        // this.$router.push("/");
    }
}).$mount("#app");
