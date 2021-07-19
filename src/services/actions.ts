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
