import ApplicationMenu from "@/components/menus/application.vue";
import NotificationsMenu from "@/components/notifications.vue";
import BridgesMenu from "@/components/menus/bridges.vue";
import PluginsMenu from "@/components/menus/plugins.vue";

import Menus from "../plugins/menus";

export default new Menus([
    {
        name: "application",
        component: ApplicationMenu,
    },
    {
        name: "notifications",
        component: NotificationsMenu,
    },
    {
        name: "bridges",
        component: BridgesMenu,
    },
    {
        name: "plugins",
        component: PluginsMenu,
    },
]);
