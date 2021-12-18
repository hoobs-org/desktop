<!-------------------------------------------------------------------------------------------------
 | hoobs-desktop                                                                                  |
 | Copyright (C) 2020 HOOBS                                                                       |
 |                                                                                                |
 | This program is free software: you can redistribute it and/or modify                           |
 | it under the terms of the GNU General Public License as published by                           |
 | the Free Software Foundation, either version 3 of the License, or                              |
 | (at your option) any later version.                                                            |
 |                                                                                                |
 | This program is distributed in the hope that it will be useful,                                |
 | but WITHOUT ANY WARRANTY; without even the implied warranty of                                 |
 | MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the                                  |
 | GNU General Public License for more details.                                                   |
 |                                                                                                |
 | You should have received a copy of the GNU General Public License                              |
 | along with this program.  If not, see <http://www.gnu.org/licenses/>.                          |
 -------------------------------------------------------------------------------------------------->

<template>
    <div v-on:click.stop id="dialog" class="frame">
        <div v-if="draggable" v-drag="{ handle: '.handle' }" class="window modal" :style="`width: ${width}; height: ${height};`">
            <div class="subject handle">{{ title || "" }}</div>
            <slot />
        </div>
        <div v-else class="window modal" :style="`width: ${width}; height: ${height};`">
            <div v-if="title" class="subject handle">{{ title || "" }}</div>
            <slot />
        </div>
    </div>
</template>

<script>
    export default {
        name: "frame",

        props: {
            title: String,
            width: { type: String, default: "auto" },
            height: { type: String, default: "auto" },
            draggable: { type: Boolean, default: false },
        },
    };
</script>

<style lang="scss">
    #dialog {
        &.frame {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            box-sizing: border-box;
            background: var(--modal-mask);
            justify-content: space-around;
            padding: 0 0 4% 0;
            overflow: hidden;
            z-index: 2000;

            .subject {
                color: var(--modal-highlight);
                font-weight: bold;
                font-size: 17px;
                padding: 10px 10px 0 10px;
                user-select: none;
            }

            .window {
                display: flex;
                flex-direction: column;
                padding: 10px;
                color: #515151;
                background: #fff;
                border-top: 0 none;
                box-shadow: var(--elevation);
                overflow: auto;
            }

            .content {
                flex: 1;
                display: flex;
                flex-direction: column;
                font-size: 14px;
                margin: 0 10px 0 0;

                &.message {
                    display: flex;
                    justify-content: space-around;
                    align-items: center;
                    text-align: center;
                    padding: 27px 10px 0 10px;
                    user-select: none;
                }
            }

            .actions {
                margin: 10px 0 10px 10px;
                display: flex;
                justify-content: flex-end;
            }
        }
    }
</style>
