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
            <div class="background">
                <div class="sensor">
                    <div v-if="main === 'leak' && leak" class="main leak">
                        <icon v-if="subject" :name="subject.icon && subject.icon !== '' ? subject.icon : 'pipe-leak'" class="icon" />
                        <div class="status">
                            {{ $t("leak_detected") }}
                        </div>
                    </div>
                    <div v-if="main === 'leak' && !leak" class="main">
                        <icon v-if="subject" :name="subject.icon && subject.icon !== '' ? subject.icon : 'pipe-leak'" class="icon" />
                        <div class="status">
                            {{ $t("no_leaks") }}
                        </div>
                    </div>
                    <div v-if="main === 'temperature'" class="main value">
                        <icon v-if="subject" :name="subject.icon && subject.icon !== '' ? subject.icon : 'thermometer'" class="icon" />
                        <div class="status">
                            {{ readout }}&deg;
                        </div>
                    </div>
                    <div v-if="main === 'humidity'" class="main value">
                        <icon v-if="subject" :name="subject.icon && subject.icon !== '' ? subject.icon : 'water-outline'" class="icon" />
                        <div class="status">
                            {{ humidity }}%;
                        </div>
                    </div>
                    <div v-if="main === 'smoke' && smoke" class="main alert">
                        <icon v-if="subject" :name="subject.icon && subject.icon !== '' ? subject.icon : 'fire'" class="icon" />
                        <div class="status">
                            {{ $t("smoke_detected") }}
                        </div>
                    </div>
                    <div v-if="main === 'smoke' && !smoke" class="main">
                        <icon v-if="subject" :name="subject.icon && subject.icon !== '' ? subject.icon : 'fire'" class="icon" />
                        <div class="status">
                            {{ $t("no_smoke") }}
                        </div>
                    </div>
                    <div v-if="main === 'carbon' && carbon" class="main alert">
                        <icon v-if="subject" :name="subject.icon && subject.icon !== '' ? subject.icon : 'smog'" class="icon" />
                        <div class="status">
                            {{ $t("carbon_monoxide_detected") }}
                        </div>
                    </div>
                    <div v-if="main === 'carbon' && !carbon" class="main">
                        <icon v-if="subject" :name="subject.icon && subject.icon !== '' ? subject.icon : 'smog'" class="icon" />
                        <div class="status">
                            {{ $t("no_carbon_monoxide") }}
                        </div>
                    </div>
                    <div v-if="main === 'contact' && contact" class="main on">
                        <icon v-if="subject" :name="subject.icon && subject.icon !== '' ? subject.icon : 'dock-window'" class="icon" />
                        <div class="status">
                            {{ $t("open") }}
                        </div>
                    </div>
                    <div v-if="main === 'contact' && !contact" class="main">
                        <icon v-if="subject" :name="subject.icon && subject.icon !== '' ? subject.icon : 'dock-window'" class="icon" />
                        <div class="status">
                            {{ $t("closed") }}
                        </div>
                    </div>
                    <div v-if="main === 'motion' && motion" class="main on">
                        <icon v-if="subject" :name="subject.icon && subject.icon !== '' ? subject.icon : 'motion-sensor'" class="icon" />
                        <div class="status">
                            {{ $t("motion_detected") }}
                        </div>
                    </div>
                    <div v-if="main === 'motion' && !motion" class="main">
                        <icon v-if="subject" :name="subject.icon && subject.icon !== '' ? subject.icon : 'motion-sensor'" class="icon" />
                        <div class="status">
                            {{ $t("no_motion") }}
                        </div>
                    </div>
                    <div v-if="main === 'obstruction' && obstruction" class="main on">
                        <icon v-if="subject" :name="subject.icon && subject.icon !== '' ? subject.icon : 'dog-side'" class="icon" />
                        <div class="status">
                            {{ $t("obstruction_detected") }}
                        </div>
                    </div>
                    <div v-if="main === 'obstruction' && !obstruction" class="main">
                        <icon v-if="subject" :name="subject.icon && subject.icon !== '' ? subject.icon : 'dog-side'" class="icon" />
                        <div class="status">
                            {{ $t("no_obstruction") }}
                        </div>
                    </div>
                    <div v-if="main === 'occupancy' && occupancy" class="main on">
                        <icon v-if="subject" :name="subject.icon && subject.icon !== '' ? subject.icon : 'crosshairs-gps'" class="icon" />
                        <div class="status">
                            {{ $t("presence_detected") }}
                        </div>
                    </div>
                    <div v-if="main === 'occupancy' && !occupancy" class="main">
                        <icon v-if="subject" :name="subject.icon && subject.icon !== '' ? subject.icon : 'crosshairs-gps'" class="icon" />
                        <div class="status">
                            {{ $t("no_presence") }}
                        </div>
                    </div>
                    <div v-if="extra" class="extra">
                        <icon v-if="main !== 'leak' && features.leak && leak" name="pipe-leak" :title="$t('leak_detected')" class="icon leak" />
                        <icon v-else-if="main !== 'leak' && features.leak" name="pipe-leak" :title="$t('no_leaks')" class="icon" />
                        <icon v-if="main !== 'smoke' && features.smoke && smoke" name="fire" :title="$t('smoke_detected')" class="icon alert" />
                        <icon v-else-if="main !== 'smoke' && features.smoke" name="fire" :title="$t('no_smoke')" class="icon" />
                        <icon v-if="main !== 'carbon' && features.carbon && carbon" name="smog" :title="$t('carbon_monoxide_detected')" class="icon alert" />
                        <icon v-else-if="main !== 'carbon' && features.carbon" name="smog" :title="$t('no_carbon_monoxide')" class="icon" />
                        <icon v-if="main !== 'contact' && features.contact && contact" name="dock-window" :title="$t('open')" class="icon on" />
                        <icon v-else-if="main !== 'contact' && features.contact" name="dock-window" :title="$t('closed')" class="icon" />
                        <icon v-if="main !== 'motion' && features.motion && motion" name="motion-sensor" :title="$t('motion_detected')" class="icon on" />
                        <icon v-else-if="main !== 'motion' && features.motion" name="motion-sensor" :title="$t('no_motion')" class="icon" />
                        <icon v-if="main !== 'obstruction' && features.obstruction && obstruction" name="dog-side" :title="$t('obstruction_detected')" class="icon on" />
                        <icon v-else-if="main !== 'obstruction' && features.obstruction" name="dog-side" :title="$t('no_obstruction')" class="icon" />
                        <icon v-if="main !== 'occupancy' && features.occupancy && occupancy" name="crosshairs-gps" :title="$t('presence_detected')" class="icon on" />
                        <icon v-else-if="main !== 'occupancy' && features.occupancy" name="crosshairs-gps" :title="$t('no_presence')" class="icon" />
                    </div>
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

    export default {
        name: "sensor-accessory",
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

            extra() {
                const keys = Object.keys(this.features);

                for (let i = 0; i < keys.length; i += 1) {
                    if (keys[i] !== "battery" && keys[i] !== this.main && this.features[keys[i]]) return true;
                }

                return false;
            },

            readout() {
                const results = this.temperature;

                if (this.output === "fahrenheit" && this.unit === "celsius") return Math.round((results * 1.8) + 32);
                if (this.output === "celsius" && this.unit === "fahrenheit") return Math.round((results - 32) / 1.8);

                return Math.round(results);
            },
        },

        data() {
            return {
                main: "",
                leak: false,
                temperature: 0,
                unit: "celsius",
                output: "celsius",
                humidity: 0,
                smoke: false,
                carbon: false,
                contact: true,
                motion: false,
                obstruction: false,
                occupancy: false,
                battery: 0,
                features: {
                    leak: false,
                    temperature: false,
                    humidity: false,
                    smoke: false,
                    carbon: false,
                    contact: false,
                    motion: false,
                    obstruction: false,
                    occupancy: false,
                    battery: false,
                },
                local: false,
                subject: null,
                display: "",
                hidden: false,
                updater: Debounce(async () => {
                    if (!this.local) {
                        const leak = this.subject.characteristics.find((item) => item.type === "leak_detected");
                        const temperature = this.subject.characteristics.find((item) => item.type === "current_temperature");
                        const humidity = this.subject.characteristics.find((item) => item.type === "current_relative_humidity");
                        const smoke = this.subject.characteristics.find((item) => item.type === "smoke_detected" || item.type === "carbon_dioxide_detected");
                        const carbon = this.subject.characteristics.find((item) => item.type === "carbon_monoxide_detected");
                        const contact = this.subject.characteristics.find((item) => item.type === "contact_sensor_state" || item.type === "current_door_state");
                        const motion = this.subject.characteristics.find((item) => item.type === "motion_detected");
                        const obstruction = this.subject.characteristics.find((item) => item.type === "obstruction_detected");
                        const occupancy = this.subject.characteristics.find((item) => item.type === "occupancy_detected");
                        const battery = this.subject.characteristics.find((item) => item.type === "battery_level");

                        if (this.subject.main_sensor === "leak_detected") this.main = "leak";
                        if (this.subject.main_sensor === "current_temperature") this.main = "temperature";
                        if (this.subject.main_sensor === "current_relative_humidity") this.main = "humidity";
                        if (this.subject.main_sensor === "smoke_detected" || this.subject.main_sensor === "carbon_dioxide_detected") this.main = "smoke";
                        if (this.subject.main_sensor === "carbon_monoxide_detected") this.main = "carbon";
                        if (this.subject.main_sensor === "contact_sensor_state" || this.subject.main_sensor === "current_door_state") this.main = "contact";
                        if (this.subject.main_sensor === "motion_detected") this.main = "motion";
                        if (this.subject.main_sensor === "obstruction_detected") this.main = "obstruction";
                        if (this.subject.main_sensor === "occupancy_detected") this.main = "occupancy";

                        this.display = this.subject.name;
                        this.hidden = this.subject.hidden;
                        this.leak = (leak || {}).value || false;
                        this.temperature = (temperature || {}).value || 0;
                        this.unit = (temperature || {}).unit || "celsius";
                        this.humidity = (humidity || {}).value || 0;
                        this.smoke = (smoke || {}).value || false;
                        this.carbon = (carbon || {}).value || false;
                        this.contact = (contact || {}).value || false;
                        this.motion = (motion || {}).value || false;
                        this.obstruction = (obstruction || {}).value || false;
                        this.occupancy = (occupancy || {}).value || false;
                        this.battery = (battery || {}).value || 0;

                        if (leak) this.features.leak = true;
                        if (temperature) this.features.temperature = true;
                        if (humidity) this.features.humidity = true;
                        if (smoke) this.features.smoke = true;
                        if (carbon) this.features.carbon = true;
                        if (contact) this.features.contact = true;
                        if (motion) this.features.motion = true;
                        if (obstruction) this.features.obstruction = true;
                        if (occupancy) this.features.occupancy = true;
                        if (battery) this.features.battery = true;

                        if (this.features.temperature) this.output = ((await this.$hoobs.config.get()).weather || {}).units || "celsius";
                    }
                }, UPDATE_DELAY),
            };
        },

        created() {
            this.$store.subscribe(async (mutation) => {
                if (mutation.type === "IO:ACCESSORY:CHANGE" && mutation.payload.data.accessory.accessory_identifier === this.subject.accessory_identifier) {
                    this.subject = mutation.payload.data.accessory;
                    this.updater();
                }
            });
        },

        async mounted() {
            this.subject = this.accessory;
            this.updater();
        },

        methods: {
            settings() {
                this.$dialog.open("accessory", { bridge: this.subject.bridge, id: this.subject.accessory_identifier });
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
            display: flex;
            justify-content: space-around;
            align-items: center;
            padding: 3px;
            top: 0;
            left: 0;
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
            justify-content: space-around;
            align-items: center;
            padding: 3px;
            top: 2px;
            right: 2px;
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

        .background {
            width: 100%;
            height: 100%;
            position: absolute;
            display: flex;
            align-items: center;
            top: 0;
            left: 0;
        }

        .sensor {
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            padding: 11px 11px 10px 10px;
            display: flex;
            flex-direction: column;
            border-radius: 7px;
            background: var(--accessory-background);
            border: 1px var(--accessory-border) solid;

            .main {
                flex: 1;
                margin: 0 auto;
                display: flex;
                align-items: center;
                flex-direction: column;
                justify-content: space-around;
                padding: 7px;
                cursor: default;

                .icon {
                    height: 37px;
                    color: var(--accessory-text);
                }

                .status {
                    font-size: 17px;
                    color: var(--accessory-text);
                    text-align: center;
                }

                &.value {
                    .icon {
                        height: 27px;
                    }

                    .status {
                        font-size: 27px;
                        color: var(--application-highlight);
                    }
                }

                &.on {
                    .icon {
                        color: var(--application-highlight);
                    }

                    .status {
                        color: var(--application-highlight);
                    }
                }

                &.leak {
                    .icon {
                        color: #00b9f1;
                    }

                    .status {
                        color: #00b9f1;
                    }
                }

                &.alert {
                    .icon {
                        color: #c51212;
                    }

                    .status {
                        color: #c51212;
                    }
                }
            }

            .extra {
                height: 32px;
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: flex-end;
                border-top: 1px var(--accessory-border) solid;

                .icon {
                    height: 18px;
                    margin-left: 4px;
                    color: var(--accessory-text);

                    &.leak {
                        color: #00b9f1;
                    }

                    &.alert {
                        color: #c51212;
                    }

                    &.on {
                        color: var(--application-highlight);
                    }
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
