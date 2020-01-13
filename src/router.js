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
            path: "/devices",
            name: "devices",
            component: () => import(/* webpackChunkName: "devices" */ "./views/devices.vue")
        },
        {
            path: "/devices/:mac/:port",
            name: "system",
            component: () => import(/* webpackChunkName: "system" */ "./views/system.vue")
        },
        {
            path: "/terminal/:mac/:port",
            name: "terminal",
            component: () => import(/* webpackChunkName: "terminal" */ "./views/terminal.vue")
        },
        {
            path: "/etcher",
            name: "etcher",
            component: () => import(/* webpackChunkName: "etcher" */ "./views/etcher.vue")
        },
        {
            path: "/accessories",
            name: "accessories",
            component: () => import(/* webpackChunkName: "accessories" */ "./views/accessories.vue")
        },
        {
            path: "/log",
            name: "log",
            component: () => import(/* webpackChunkName: "log" */ "./views/log.vue")
        },
        {
            path: "/users",
            name: "users",
            component: () => import(/* webpackChunkName: "users" */ "./views/users.vue")
        },
        {
            path: "/plugins",
            name: "plugins",
            component: () => import(/* webpackChunkName: "plugins" */ "./views/plugins.vue")
        },
        {
            path: "/config",
            name: "config",
            component: () => import(/* webpackChunkName: "config" */ "./views/config.vue")
        }
    ]
});
