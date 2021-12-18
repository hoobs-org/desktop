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
    <div id="control" :version="version" :class="dashboard ? 'dashboard' : 'normal'">
        <div class="item">
            <div class="background">
                <div v-if="!live || !source" class="panel" :style="style">
                    <div v-if="snapshot && !live" class="timelapse">{{ span }}</div>
                    <div v-if="snapshot && live" class="timelapse">{{ $t("live") }}</div>
                    <icon v-if="!live" v-on:click="start" name="toggle-switch-off" class="icon" />
                    <icon v-if="live" v-on:click="stop" name="toggle-switch" class="icon" />
                </div>
                <div v-else class="panel">
                    <player class="stream" :source="source" />
                    <div class="timelapse">{{ $t("live") }}</div>
                    <icon v-if="!live" v-on:click="start" name="toggle-switch-off" class="icon" />
                    <icon v-if="live" v-on:click="stop" name="toggle-switch" class="icon" />
                </div>
            </div>
            <div v-if="!disabled" v-on:click.stop="settings" class="settings">
                <icon name="cog" class="icon" :title="$t('accessory_settings')" />
            </div>
        </div>
        <div v-if="!dashboard" class="name">{{ display }}</div>
    </div>
</template>

<script>
    import Debounce from "lodash.debounce";

    import Player from "@/components/elements/player.vue";

    const UPDATE_DELAY = 150;
    const CYCLE_TIMER = 3 * 60 * 1000;

    export default {
        name: "camera-accessory",
        components: { "player": Player },

        props: {
            disabled: Boolean,
            accessory: Object,
            dashboard: Boolean,
        },

        computed: {
            style() {
                if (this.snapshot) return `background-image: url(data:image/png;base64,${this.snapshot})`;

                return "background-image: none";
            },

            span() {
                if (!this.timelapse || this.timelapse >= 60) return "";
                if (this.timelapse < 10) return this.$t("now");

                return `${this.timelapse} ${this.$t("seconds")}`;
            },

            streaming() {
                return this.$store.state.streaming[this.accessory.accessory_identifier];
            },
        },

        data() {
            return {
                version: 0,
                snapshot: null,
                subject: null,
                timelapse: null,
                display: "",
                source: false,
                live: false,
                timers: {
                    snapshot: null,
                    timelapse: null,
                    live: null,
                },
                updater: Debounce(async () => {
                    this.display = this.subject.name;

                    if (this.subject.supports_streaming && this.streaming) this.source = this.subject.stream();

                    this.cycle(true, true);
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
            this.subject = await this.$hoobs.accessory(this.accessory.bridge, this.accessory.accessory_identifier);
            this.snapshot = this.$store.state.snapshots[this.accessory.accessory_identifier];

            this.version += 1;

            this.updater();
        },

        beforeDestroy() {
            this.cycle(false, true);
        },

        methods: {
            settings() {
                this.$dialog.open("accessory", {
                    bridge: this.subject.bridge,
                    id: this.subject.accessory_identifier,
                    camera: true,
                });
            },

            lapse() {
                this.timelapse += 1;
                this.timers.timelapse = setTimeout(() => this.lapse(), 1000);
            },

            async cycle(repeat, clear) {
                if (clear) {
                    clearTimeout(this.timers.snapshot);
                    clearTimeout(this.timers.timelapse);

                    this.timers.snapshot = null;
                    this.timers.timelapse = null;
                }

                if (repeat && (!this.live || !this.source)) {
                    const snapshot = await this.subject.snapshot();

                    if (snapshot) {
                        this.snapshot = snapshot;
                        this.$store.commit("IO:SNAPSHOT:UPDATE", { id: this.subject.accessory_identifier, data: snapshot });
                        this.version += 1;

                        if (!this.timers.timelapse) this.lapse();
                    }

                    this.timers.snapshot = setTimeout(() => this.cycle(true, false), this.live ? 1000 : CYCLE_TIMER);
                }
            },

            start() {
                this.live = true;
                this.cycle(!this.source, true);
            },

            stop() {
                this.live = false;
                this.cycle(true, true);
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
            position: relative;
        }

        .name {
            text-align: center;
            padding: 14px 7px 7px 7px;
        }

        .settings {
            display: none;
            position: absolute;
            color: #fff;
            justify-content: space-around;
            align-items: center;
            padding: 3px;
            top: 6px;
            right: 7px;
            cursor: pointer;

            .icon {
                height: 22px;
                opacity: 0.8;
            }

            &:hover {
                .icon {
                    opacity: 1;
                }
            }
        }

        .background {
            width: 100%;
            aspect-ratio: 16/9;
            display: flex;
            align-items: center;
            top: 0;
            left: 0;
        }

        .panel {
            width: 100%;
            height: 100%;
            position: relative;
            box-sizing: border-box;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-around;
            border: 1px var(--accessory-border) solid;
            background-color: #000;
            background-repeat: no-repeat;
            background-position: center center;
            background-size: cover;

            .timelapse {
                position: absolute;
                top: 7px;
                left: 10px;
                color: #ffffff8a;
                font-weight: bold;
                font-size: 14px;
            }

            .icon {
                display: none;
                position: absolute;
                top: 7px;
                right: 37px;
                color: #fff;
                opacity: 0.8;
                cursor: pointer;

                &:hover {
                    opacity: 1;
                }
            }

            .stream {
                width: 100%;
                height: 100%;
            }
        }

        &.dashboard {
            height: 100%;

            .item {
                height: 100%;
            }

            .background {
                height: 100%;
                aspect-ratio: unset;
            }

            .panel {
                border: 1px var(--widget-border) solid;
            }
        }

        &:hover {
            .settings {
                display: flex;
            }

            .panel {
                .icon {
                    display: block;
                }
            }
        }
    }
</style>
