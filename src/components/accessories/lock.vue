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
    <div v-if="!hidden" id="control">
        <div class="item">
            <div class="lock">
                <div class="inner">
                    <svg viewBox="0 0 100 100">
                        <g v-if="locked">
                            <path class="border" stroke-width="3.75" d="M15.8,81.1v7.3c0,4.7,3.8,8.5,8.5,8.5h51.2c4.7,0,8.5-3.8,8.5-8.5v-7.3H15.8z" />
                            <path class="border" stroke-width="3.75" d="M50,3.1c-13.8,0-25,11.2-25,25v10v26h9.5v-26v-10c0-8.6,7-15.5,15.5-15.5s15.5,7,15.5,15.5v10v26H75v-26v-10 C75,14.3,63.8,3.1,50,3.1z" />
                            <path class="border" stroke-width="1.25" stroke-miterlimit="10" d="M96.9,77c0,7.1-5.8,12.8-12.8,12.8H16C8.9,89.9,3.1,84.1,3.1,77S8.9,64.2,16,64.2h68C91.1,64.2,96.9,70,96.9,77 z" />
                            <path class="face" stroke-width="3" d="M15.8,81.1v7.3c0,4.7,3.8,8.5,8.5,8.5h51.2c4.7,0,8.5-3.8,8.5-8.5v-7.3H15.8z" />
                            <path class="face" stroke-width="3" d="M50,3.1c-13.8,0-25,11.2-25,25v10v26h9.5v-26v-10c0-8.6,7-15.5,15.5-15.5s15.5,7,15.5,15.5v10v26H75v-26v-10 C75,14.3,63.8,3.1,50,3.1z" />
                            <path class="accent" stroke="#ffffff" stroke-miterlimit="10" d="M96.9,77c0,7.1-5.8,12.8-12.8,12.8H16C8.9,89.9,3.1,84.1,3.1,77S8.9,64.2,16,64.2h68C91.1,64.2,96.9,70,96.9,77 z"/>
                            <path class="locked" d="M40.9,73.7h1.5V79h2.7v1.4h-4.2V73.7z" />
                            <path class="locked" d="M45.6,77c0-0.5,0.1-1,0.3-1.4c0.2-0.4,0.4-0.8,0.7-1.1c0.3-0.3,0.7-0.5,1.1-0.7c0.4-0.2,0.9-0.2,1.4-0.2 c0.5,0,1,0.1,1.4,0.2c0.4,0.2,0.8,0.4,1.1,0.7c0.3,
                                                    0.3,0.6,0.7,0.7,1.1c0.2,0.4,0.3,0.9,0.3,1.4c0,0.5-0.1,1-0.3,1.4 c-0.2,0.4-0.4,0.8-0.7,1.1c-0.3,0.3-0.7,0.5-1.1,0.7c-0.4,0.2-0.9,0.2-1.4,0.2c-0.5,
                                                    0-1-0.1-1.4-0.2c-0.4-0.2-0.8-0.4-1.1-0.7 c-0.3-0.3-0.6-0.7-0.7-1.1C45.7,78,45.6,77.6,45.6,77z M47.1,77c0,0.3,0,0.6,0.1,0.9c0.1,0.3,0.2,0.5,0.4,0.7 c0.2,
                                                    0.2,0.4,0.3,0.7,0.4c0.3,0.1,0.5,0.2,0.9,0.2c0.3,0,0.6-0.1,0.9-0.2c0.3-0.1,0.5-0.3,0.7-0.4c0.2-0.2,0.3-0.4,0.4-0.7 c0.1-0.3,0.1-0.5,0.1-0.9c0-0.3,
                                                    0-0.6-0.1-0.9s-0.2-0.5-0.4-0.7c-0.2-0.2-0.4-0.3-0.7-0.4c-0.3-0.1-0.5-0.2-0.9-0.2 c-0.3,0-0.6,0.1-0.9,0.2c-0.3,0.1-0.5,0.3-0.7,0.4c-0.2,0.2-0.3,0.4-0.4,
                                                    0.7S47.1,76.7,47.1,77z" />
                            <path class="locked" d="M58.1,75.4c-0.1-0.2-0.3-0.3-0.5-0.4c-0.2-0.1-0.5-0.1-0.7-0.1s-0.5,0.1-0.8,0.2c-0.2,0.1-0.4,0.3-0.6,0.4 c-0.2,0.2-0.3,0.4-0.4,0.7s-0.1,0.5-0.1,0.9c0,0.3,
                                                    0,0.6,0.1,0.9c0.1,0.3,0.2,0.5,0.4,0.7c0.2,0.2,0.4,0.3,0.6,0.4 c0.2,0.1,0.5,0.2,0.7,0.2c0.3,0,0.6-0.1,0.8-0.2c0.2-0.1,0.4-0.3,0.6-0.5l1.2,0.9c-0.3,0.4-0.6,
                                                    0.7-1.1,0.9 c-0.4,0.2-0.9,0.3-1.3,0.3c-0.5,0-1-0.1-1.4-0.2c-0.4-0.2-0.8-0.4-1.1-0.7c-0.3-0.3-0.6-0.7-0.7-1.1c-0.2-0.4-0.3-0.9-0.3-1.4 c0-0.5,0.1-1,
                                                    0.3-1.4c0.2-0.4,0.4-0.8,0.7-1.1c0.3-0.3,0.7-0.5,1.1-0.7c0.4-0.2,0.9-0.2,1.4-0.2c0.2,0,0.4,0,0.6,0.1 c0.2,0,0.4,0.1,0.6,0.2c0.2,0.1,0.4,0.2,0.6,0.3c0.2,
                                                    0.1,0.3,0.3,0.5,0.5L58.1,75.4z" />
                            <path class="locked" d="M60.3,73.7h1.5v2.8l2.6-2.8h1.9l-3,3.1l3.2,3.6h-2.1l-2.7-3.2v3.2h-1.5V73.7z" />
                            <path class="locked" d="M67.1,73.7h4.5v1.4h-3.1v1.2h2.9v1.4h-2.9V79h3.2v1.4h-4.7V73.7z" />
                            <path class="locked" d="M72.9,73.7h2.2c0.5,0,1,0.1,1.5,0.2c0.5,0.1,0.9,0.3,1.3,0.6c0.4,0.3,0.6,0.6,0.9,1c0.2,0.4,0.3,0.9,0.3,1.6 c0,0.5-0.1,1-0.3,1.4c-0.2,0.4-0.5,0.8-0.8,1c-0.3,
                                                    0.3-0.7,0.5-1.2,0.6c-0.5,0.1-0.9,0.2-1.4,0.2h-2.4V73.7z M74.4,79h0.8 c0.3,0,0.7,0,0.9-0.1c0.3-0.1,0.5-0.2,0.8-0.3c0.2-0.2,0.4-0.4,0.5-0.6c0.1-0.3,0.2-0.6,
                                                    0.2-1c0-0.3-0.1-0.6-0.2-0.9 c-0.1-0.2-0.3-0.4-0.5-0.6c-0.2-0.2-0.4-0.3-0.7-0.4c-0.3-0.1-0.6-0.1-0.9-0.1h-0.9V79z" />
                            <circle class="input" cx="15.9" cy="77" r="11" v-on:click="toggle" style="cursor: pointer;" />
                        </g>
                        <g v-else>
                            <path class="border" stroke-width="3.75" d="M65.5,28.1v0.2H75v-0.2c0-13.8-11.2-25-25-25s-25,11.2-25,25v10v26h9.5v-26v-10c0-8.6,7-15.5,15.5-15.5 S65.5,19.5,65.5,28.1z" />
                            <path class="border" stroke-width="3.75" d="M15.8,81.1v7.3c0,4.7,3.8,8.5,8.5,8.5h51.2c4.7,0,8.5-3.8,8.5-8.5v-7.3H15.8z" />
                            <path class="border" stroke-width="1.25" stroke-miterlimit="10" d="M96.9,77c0,7.1-5.8,12.8-12.8,12.8H16C8.9,89.9,3.1,84.1,3.1,77S8.9,64.2,16,64.2h68C91.1,64.2,96.9,70,96.9,77 z" />
                            <path class="face" stroke-width="3" d="M65.5,28.1v0.2H75v-0.2c0-13.8-11.2-25-25-25s-25,11.2-25,25v10v26h9.5v-26v-10c0-8.6,7-15.5,15.5-15.5 S65.5,19.5,65.5,28.1z" />
                            <path class="face" stroke-width="3" d="M15.8,81.1v7.3c0,4.7,3.8,8.5,8.5,8.5h51.2c4.7,0,8.5-3.8,8.5-8.5v-7.3H15.8z" />
                            <path class="face" stroke-miterlimit="10" d="M96.9,77c0,7.1-5.8,12.8-12.8,12.8H16C8.9,89.9,3.1,84.1,3.1,77S8.9,64.2,16,64.2h68C91.1,64.2,96.9,70,96.9,77 z" />
                            <path class="label" d="M18.4,77.8c0,0.4-0.1,0.8-0.2,1.1c-0.1,0.3-0.3,0.6-0.5,0.9c-0.2,0.2-0.5,0.4-0.9,0.6 c-0.4,0.1-0.8,0.2-1.2,
                                                   0.2c-0.5,0-0.9-0.1-1.2-0.2c-0.4-0.1-0.6-0.3-0.9-0.6c-0.2-0.2-0.4-0.5-0.5-0.9c-0.1-0.3-0.2-0.7-0.2-1.1 v-4.1h1.5v4c0,0.2,0,0.4,0.1,0.6c0.1,0.2,0.2,0.3,0.3,0.5c0.1,0.1,
                                                   0.3,0.2,0.4,0.3c0.2,0.1,0.3,0.1,0.5,0.1c0.2,0,0.4,0,0.5-0.1 s0.3-0.2,0.4-0.3c0.1-0.1,0.2-0.3,0.3-0.5c0.1-0.2,0.1-0.4,0.1-0.6v-4h1.5V77.8z" />
                            <path class="label" d="M19.8,73.7h2l2.8,4.6h0v-4.6h1.5v6.7h-1.9l-2.9-4.7h0v4.7h-1.5V73.7z" />
                            <path class="label" d="M27.5,73.7H29V79h2.7v1.4h-4.2V73.7z" />
                            <path class="label" d="M32.1,77c0-0.5,0.1-1,0.3-1.4c0.2-0.4,0.4-0.8,0.7-1.1c0.3-0.3,0.7-0.5,1.1-0.7c0.4-0.2,0.9-0.2,1.4-0.2 s1,0.1,1.4,0.2c0.4,0.2,0.8,0.4,1.1,0.7c0.3,0.3,0.6,0.7,0.7,1.1c0.2,
                                                   0.4,0.3,0.9,0.3,1.4c0,0.5-0.1,1-0.3,1.4 c-0.2,0.4-0.4,0.8-0.7,1.1c-0.3,0.3-0.7,0.5-1.1,0.7c-0.4,0.2-0.9,0.2-1.4,0.2s-1-0.1-1.4-0.2c-0.4-0.2-0.8-0.4-1.1-0.7
                                                   c-0.3-0.3-0.6-0.7-0.7-1.1C32.2,78,32.1,77.6,32.1,77z M33.7,77c0,0.3,0,0.6,0.1,0.9c0.1,0.3,0.2,0.5,0.4,0.7 c0.2,0.2,0.4,0.3,0.7,0.4c0.3,0.1,0.5,0.2,0.9,0.2c0.3,0,
                                                   0.6-0.1,0.9-0.2c0.3-0.1,0.5-0.3,0.7-0.4c0.2-0.2,0.3-0.4,0.4-0.7 c0.1-0.3,0.1-0.5,0.1-0.9c0-0.3,
                                                   0-0.6-0.1-0.9c-0.1-0.3-0.2-0.5-0.4-0.7c-0.2-0.2-0.4-0.3-0.7-0.4c-0.3-0.1-0.5-0.2-0.9-0.2 c-0.3,0-0.6,0.1-0.9,0.2c-0.3,0.1-0.5,0.3-0.7,0.4c-0.2,0.2-0.3,0.4-0.4,
                                                   0.7C33.7,76.4,33.7,76.7,33.7,77z" />
                            <path class="label" d="M44.7,75.4c-0.1-0.2-0.3-0.3-0.5-0.4c-0.2-0.1-0.5-0.1-0.7-0.1c-0.3,0-0.5,0.1-0.8,0.2 c-0.2,0.1-0.4,0.3-0.6,0.4c-0.2,0.2-0.3,0.4-0.4,0.7c-0.1,0.3-0.1,0.5-0.1,0.9c0,
                                                   0.3,0,0.6,0.1,0.9c0.1,0.3,0.2,0.5,0.4,0.7 c0.2,0.2,0.4,0.3,0.6,0.4c0.2,0.1,0.5,0.2,0.7,0.2c0.3,0,0.6-0.1,0.8-0.2c0.2-0.1,0.4-0.3,0.6-0.5l1.2,0.9 c-0.3,0.4-0.6,
                                                   0.7-1.1,0.9c-0.4,0.2-0.9,0.3-1.3,0.3c-0.5,0-1-0.1-1.4-0.2c-0.4-0.2-0.8-0.4-1.1-0.7c-0.3-0.3-0.6-0.7-0.7-1.1 C40.1,78,40,77.6,40,77c0-0.5,0.1-1,0.3-1.4c0.2-0.4,
                                                   0.4-0.8,0.7-1.1c0.3-0.3,0.7-0.5,1.1-0.7c0.4-0.2,0.9-0.2,1.4-0.2 c0.2,0,0.4,0,0.6,0.1c0.2,0,0.4,0.1,0.6,0.2c0.2,0.1,0.4,0.2,0.6,0.3c0.2,0.1,0.3,0.3,0.5,0.5L44.7,
                                                   75.4z" />
                            <path class="label" d="M46.8,73.7h1.5v2.8l2.6-2.8h1.9l-3,3.1l3.2,3.6H51l-2.7-3.2v3.2h-1.5V73.7z" />
                            <path class="label" d="M53.6,73.7h4.5v1.4h-3.1v1.2H58v1.4h-2.9V79h3.2v1.4h-4.7V73.7z" />
                            <path class="label" d="M59.5,73.7h2.2c0.5,0,1,0.1,1.5,0.2c0.5,0.1,0.9,0.3,1.3,0.6c0.4,0.3,0.6,0.6,0.9,1c0.2,0.4,0.3,0.9,0.3,1.6 c0,0.5-0.1,1-0.3,1.4c-0.2,0.4-0.5,0.8-0.8,1c-0.3,0.3-0.7,
                                                   0.5-1.2,0.6c-0.5,0.1-0.9,0.2-1.4,0.2h-2.4V73.7z M61,79h0.8 c0.3,0,0.7,0,0.9-0.1c0.3-0.1,0.5-0.2,0.8-0.3c0.2-0.2,0.4-0.4,0.5-0.6c0.1-0.3,0.2-0.6,
                                                   0.2-1c0-0.3-0.1-0.6-0.2-0.9 c-0.1-0.2-0.3-0.4-0.5-0.6c-0.2-0.2-0.4-0.3-0.7-0.4c-0.3-0.1-0.6-0.1-0.9-0.1H61V79z" />
                            <circle class="input" cx="83.9" cy="77" r="11" v-on:click="toggle" style="cursor: pointer;" />
                        </g>
                    </svg>
                </div>
            </div>
            <div v-if="!disabled" v-on:click="settings" class="settings">
                <icon name="cog" class="icon" :title="$t('accessory_settings')" />
            </div>
            <div v-if="!disabled && features.battery" class="battery" :title="`${battery}%`">
                <div class="charge">
                    <icon :name="charge" class="icon" />
                </div>
                <div class="frame">
                    <icon name="battery-outline" class="icon" />
                </div>
            </div>
        </div>
        <div class="name">{{ display }}</div>
    </div>
</template>

<script>
    import Debounce from "lodash.debounce";

    const UPDATE_DELAY = 150;
    const LOCAL_DELAY = 1000;

    export default {
        name: "lock-accessory",
        props: { disabled: Boolean, accessory: Object },

        computed: {
            charge() {
                if (!this.battery) return "battery-outline";
                if (this.battery > 0 && this.battery < 10) return "battery-10";
                if (this.battery > 10 && this.battery < 20) return "battery-20";
                if (this.battery > 20 && this.battery < 30) return "battery-30";
                if (this.battery > 30 && this.battery < 40) return "battery-40";
                if (this.battery > 40 && this.battery < 50) return "battery-50";
                if (this.battery > 50 && this.battery < 60) return "battery-60";
                if (this.battery > 60 && this.battery < 70) return "battery-70";
                if (this.battery > 70 && this.battery < 80) return "battery-80";
                if (this.battery > 80 && this.battery < 90) return "battery-90";

                return "battery";
            },
        },

        data() {
            return {
                locked: true,
                battery: 0,
                features: { battery: false },
                local: false,
                subject: null,
                display: "",
                hidden: false,
                updater: Debounce(() => {
                    if (!this.local) {
                        const battery = this.subject.characteristics.find((item) => item.type === "battery_level");

                        this.display = this.subject.name;
                        this.hidden = this.subject.hidden;
                        this.locked = (this.subject.characteristics.find((item) => item.type === "lock_target_state") || {}).value || false;
                        this.battery = (battery || {}).value || 0;

                        if (battery) this.features.battery = true;
                    }
                }, UPDATE_DELAY),
            };
        },

        created() {
            this.$action.on("io", "accessory_change", (payload) => {
                if (payload.data.accessory.accessory_identifier === this.subject.accessory_identifier) {
                    this.subject = payload.data.accessory;
                    this.updater();
                }
            });
        },

        mounted() {
            this.subject = this.accessory;
            this.updater();
        },

        methods: {
            settings() {
                this.$dialog.open("accessory", { bridge: this.subject.bridge, id: this.subject.accessory_identifier });
            },

            async toggle() {
                this.local = true;

                const accessory = await this.$hoobs.accessory(this.subject.bridge, this.subject.accessory_identifier);
                const locked = !this.locked;

                this.locked = locked;

                await accessory.set("lock_target_state", locked);

                setTimeout(() => { this.local = false; }, LOCAL_DELAY);
            },
        },
    };
</script>

<style lang="scss" scoped>
    #control {
        width: 100%;
        display: flex;
        flex-direction: column;

        .item {
            width: 100%;
            height: 0;
            padding-bottom: 100%;
            position: relative;
        }

        .name {
            text-align: center;
            padding: 14px 7px 7px 7px;
        }

        .battery {
            width: 27px;
            height: 27px;
            box-sizing: border-box;
            position: absolute;
            border-radius: 50%;
            background: var(--widget-background);
            display: flex;
            justify-content: space-around;
            align-items: center;
            padding: 3px;
            top: -8px;
            left: -6px;
            cursor: default;

            .icon {
                height: 20px;
                transform-origin: center;
                transform: rotate(90deg);
            }

            .charge {
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: space-around;
                align-items: center;
                position: absolute;
                color: var(--accessory-text);
                top: 0;
                left: 0;
            }

            .frame {
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: space-around;
                align-items: center;
                position: absolute;
                color: var(--accessory-border);
                top: 0;
                left: 0;
            }
        }

        .settings {
            display: none;
            position: absolute;
            border-radius: 50%;
            background: var(--widget-background);
            justify-content: space-around;
            align-items: center;
            padding: 3px;
            top: -6px;
            right: -6px;
            cursor: pointer;

            .icon {
                height: 22px;
                opacity: 0.3;
            }

            &:hover {
                .icon {
                    opacity: 1;
                }
            }
        }

        .lock {
            width: 100%;
            height: 100%;
            position: absolute;
            box-sizing: border-box;
            pointer-events: none;
            top: 0;
            left: 0;

            .inner {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                position: relative;
                box-sizing: border-box;
                pointer-events: all;
            }

            svg {
                width: 100%;
                height: 100%;

                .border {
                    fill: var(--accessory-border);
                    stroke: var(--accessory-border);
                }

                .face {
                    fill: var(--accessory-background);
                    stroke: var(--widget-background);
                }

                .accent {
                    fill: var(--application-highlight);
                }

                .label {
                    fill: var(--accessory-text);
                }

                .locked {
                    fill: var(--accessory-highlight);
                }

                .input {
                    fill: var(--accessory-highlight);
                }
            }
        }

        &:hover {
            .settings {
                display: flex;
            }
        }
    }
</style>
