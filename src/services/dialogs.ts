import Dialogs from "../plugins/dialogs";

export default new Dialogs([
    {
        name: "alert",
        component: () => import(/* webpackChunkName: "dialog-alert" */ "@/components/dialogs/alert.vue"),
    },
    {
        name: "confirm",
        component: () => import(/* webpackChunkName: "dialog-confirm" */ "@/components/dialogs/confirm.vue"),
    },
    {
        name: "about",
        component: () => import(/* webpackChunkName: "dialog-about" */ "@/components/dialogs/about.vue"),
    },
    {
        name: "updates",
        component: () => import(/* webpackChunkName: "dialog-updates" */ "@/components/dialogs/updates.vue"),
    },
    {
        name: "settings",
        component: () => import(/* webpackChunkName: "dialog-settings" */ "@/components/dialogs/settings.vue"),
    },
    {
        name: "personalize",
        component: () => import(/* webpackChunkName: "dialog-personalize" */ "@/components/dialogs/personalize.vue"),
    },
    {
        name: "dashboard",
        component: () => import(/* webpackChunkName: "dialog-dashboard" */ "@/components/dialogs/dashboard.vue"),
    },
    {
        name: "bridges",
        component: () => import(/* webpackChunkName: "dialog-bridges" */ "@/components/dialogs/bridges.vue"),
    },
    {
        name: "plugin",
        component: () => import(/* webpackChunkName: "dialog-plugin" */ "@/components/dialogs/plugin.vue"),
    },
    {
        name: "popup",
        component: () => import(/* webpackChunkName: "dialog-popup" */ "@/components/dialogs/popup.vue"),
    },
    {
        name: "accessory",
        component: () => import(/* webpackChunkName: "dialog-accessory" */ "@/components/dialogs/accessory.vue"),
    },
    {
        name: "hidden",
        component: () => import(/* webpackChunkName: "dialog-accessory" */ "@/components/dialogs/hidden.vue"),
    },
    {
        name: "cache",
        component: () => import(/* webpackChunkName: "dialog-cache" */ "@/components/dialogs/cache.vue"),
    },
]);
