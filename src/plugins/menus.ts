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

import Vue, { VueConstructor } from "vue";

export default class Menus {
    declare private current: undefined | string;

    declare private menus: any[];

    declare private events: Vue;

    constructor(menus: any[]) {
        this.events = new Vue();
        this.menus = menus;
    }

    on(event: string, callback: (value?: any) => void): void {
        this.events.$on(event, callback);
    }

    open(name: string, options?: { [key: string]: any }): void {
        if (this.current && this.current === name) {
            this.close();
        } else {
            const source = this.menus.findIndex((item) => item.name === name);

            if (source >= 0) {
                this.current = name;
                this.menus[source].options = options;
                this.events.$emit("open", this.menus[source]);
            }
        }
    }

    close(): void {
        for (let i = 0; i < this.menus.length; i += 1) {
            delete this.menus[i].options;
        }

        this.current = undefined;
        this.events.$emit("close");
    }

    install(vue: VueConstructor<Vue>): void {
        vue.mixin({
            computed: {
                $menu: () => this,
            },
        });

        Vue.component("menu-view", () => import("@/components/menus.vue"));
    }
}
