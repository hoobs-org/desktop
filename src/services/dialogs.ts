/**************************************************************************************************
 * hoobs-desktop                                                                                  *
 * Copyright (C) 2020 HOOBS                                                                       *
 *                                                                                                *
 * This program is free software: you can redistribute it and/or modify                           *
 * it under the terms of the GNU General Public License as published by                           *
 * the Free Software Foundation, either version 3 of the License, or                              *
 * (at your option) any later version.                                                            *
 *                                                                                                *
 * This program is distributed in the hope that it will be useful,                                *
 * but WITHOUT ANY WARRANTY; without even the implied warranty of                                 *
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the                                  *
 * GNU General Public License for more details.                                                   *
 *                                                                                                *
 * You should have received a copy of the GNU General Public License                              *
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.                          *
 **************************************************************************************************/

import AlertDialog from "@/components/dialogs/alert.vue";
import ConfirmDialog from "@/components/dialogs/confirm.vue";
import AboutDialog from "@/components/dialogs/about.vue";
import UpdatesDialog from "@/components/dialogs/updates.vue";
import SettingsDialog from "@/components/dialogs/settings.vue";
import NetworksDialog from "@/components/dialogs/network.vue";
import PersonalizeDialog from "@/components/dialogs/personalize.vue";
import DashboardDialog from "@/components/dialogs/dashboard.vue";
import BridgesDialog from "@/components/dialogs/bridges.vue";
import PluginDialog from "@/components/dialogs/plugin.vue";
import AccessoryDialog from "@/components/dialogs/accessory.vue";
import HiddenDialog from "@/components/dialogs/hidden.vue";
import CacheDialog from "@/components/dialogs/cache.vue";

import Dialogs from "../plugins/dialogs";

export default new Dialogs([
    {
        name: "alert",
        component: AlertDialog,
    },
    {
        name: "confirm",
        component: ConfirmDialog,
    },
    {
        name: "about",
        component: AboutDialog,
    },
    {
        name: "updates",
        component: UpdatesDialog,
    },
    {
        name: "settings",
        component: SettingsDialog,
    },
    {
        name: "network",
        component: NetworksDialog,
    },
    {
        name: "personalize",
        component: PersonalizeDialog,
    },
    {
        name: "dashboard",
        component: DashboardDialog,
    },
    {
        name: "bridges",
        component: BridgesDialog,
    },
    {
        name: "plugin",
        component: PluginDialog,
    },
    {
        name: "accessory",
        component: AccessoryDialog,
    },
    {
        name: "hidden",
        component: HiddenDialog,
    },
    {
        name: "cache",
        component: CacheDialog,
    },
]);
