import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";

import DashboardView from "@/views/dashboard.vue";
import SetupView from "@/views/setup.vue";
import LoginView from "@/views/login.vue";
import AccessoriesView from "@/views/accessories.vue";
import LogView from "@/views/log.vue";
import UsersView from "@/views/users.vue";
import BridgesView from "@/views/bridges.vue";
import PluginsView from "@/views/plugins.vue";
import PluginView from "@/views/plugin.vue";
import ConfigView from "@/views/config.vue";
import TerminalView from "@/views/terminal.vue";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
    {
        path: "/",
        name: "dashboard",
        meta: { layout: "authenticated" },
        component: DashboardView,
    },
    {
        path: "/setup",
        name: "setup",
        meta: { layout: "public" },
        component: SetupView,
    },
    {
        path: "/login",
        name: "login",
        meta: { layout: "public" },
        component: LoginView,
    },
    {
        path: "/accessories/:id?/:room?",
        name: "accessories",
        meta: { layout: "authenticated" },
        component: AccessoriesView,
        props: true,
    },
    {
        path: "/log",
        name: "log",
        meta: { layout: "authenticated" },
        component: LogView,
    },
    {
        path: "/users/:id?",
        name: "users",
        meta: { layout: "authenticated" },
        component: UsersView,
        props: true,
    },
    {
        path: "/bridges/:id?",
        name: "bridges",
        meta: { layout: "authenticated" },
        component: BridgesView,
        props: true,
    },
    {
        path: "/plugins/:id?",
        name: "plugins",
        meta: { layout: "authenticated" },
        component: PluginsView,
        props: true,
    },
    {
        path: "/plugin/:scope/:name?",
        name: "plugin",
        meta: { layout: "authenticated" },
        component: PluginView,
        props: true,
    },
    {
        path: "/config/:scope?/:name?",
        name: "config",
        meta: { layout: "authenticated" },
        component: ConfigView,
        props: true,
    },
    {
        path: "/terminal",
        name: "terminal",
        meta: { layout: "authenticated" },
        component: TerminalView,
    },
];

const router = new VueRouter({
    mode: "history",
    base: process.env.BASE_URL,
    routes,
});

export default router;
