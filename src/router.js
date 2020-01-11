import Vue from "vue";
import Router from "vue-router";
import Home from "./views/home.vue";

Vue.use(Router);

export default new Router({
    mode: "history",
    base: process.env.BASE_URL,
    routes: [
        {
            path: "/",
            name: "home",
            component: Home
        },
        {
            path: "/accessories",
            name: "accessories",
            component: () => import(/* webpackChunkName: "about" */ "./views/accessories.vue")
        },
        {
            path: "/log",
            name: "log",
            component: () => import(/* webpackChunkName: "about" */ "./views/log.vue")
        },
        {
            path: "/users",
            name: "users",
            component: () => import(/* webpackChunkName: "about" */ "./views/users.vue")
        },
        {
            path: "/plugins",
            name: "plugins",
            component: () => import(/* webpackChunkName: "about" */ "./views/plugins.vue")
        },
        {
            path: "/config",
            name: "config",
            component: () => import(/* webpackChunkName: "about" */ "./views/config.vue")
        }
    ]
});
