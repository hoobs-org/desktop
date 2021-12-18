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
    <div v-if="!loading && (location || {}).id" id="widget">
        <div class="location">{{ location.name }}, {{ (country.find((country) => country.value === location.country) || {}).text }}</div>
        <div class="today">{{ $t(weekday(new Date())) }}</div>
        <div class="weather">{{ $t(icon[current.icon].label) }}</div>
        <div class="current">
            <div class="display" :class="`wi wi-day-${icon[current.icon].icon}`"></div>
            <div class="temp">{{ Math.round(current.temp) }}°</div>
        </div>
    </div>
    <div v-else-if="!loading" id="widget">
        <div class="setup">
            <div class="message">
                <div class="warning">{{ $t("location_setup_message") }}</div>
                <div v-on:click="$dialog.open('settings')" class="button">{{ $t("hub_settings") }}</div>
            </div>
        </div>
    </div>
</template>

<script>
    import "@/assets/weathericons.css";

    import icons from "@/assets/weathericons.json";
    import countries from "@/lang/countries.json";
    import dates from "@/services/dates";

    export default {
        name: "current-widget",

        data() {
            return {
                loading: true,
                location: {},
                current: {},
                icon: icons,
                country: countries,
            };
        },

        mounted() {
            const waits = [];

            waits.push(new Promise((resolve) => {
                this.$hoobs.config.get().then((config) => {
                    this.location = (config.weather || {}).location;
                }).finally(() => resolve());
            }));

            waits.push(new Promise((resolve) => {
                this.$hoobs.weather.current().then((current) => {
                    this.current = current;
                }).finally(() => resolve());
            }));

            Promise.all(waits).then(() => {
                this.loading = false;
            });
        },

        methods: {
            weekday(value, abbr) {
                if (abbr) return `${dates.weekday(value)}_abbr`;

                return dates.weekday(value);
            },
        },
    };
</script>

<style lang="scss" scoped>
    #widget {
        height: 100%;
        display: flex;
        box-sizing: border-box;
        flex-direction: column;
        padding: 20px 6px 20px 20px;
        position: relative;
        cursor: default;

        .setup {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: space-around;
            height: 100%;
            padding: 0 14px 0 0;
            box-sizing: border-box;

            .message {
                display: flex;
                flex-direction: column;
                align-items: center;

                .warning {
                    max-width: 200px;
                    text-align: center;
                }

                .button {
                    margin: 7px 0 0 0;
                }
            }
        }

        .location {
            font-size: 18px;
            padding: 0 14px 0 0;
            user-select: none;
        }

        .today {
            font-size: 15px;
            padding: 0 14px 0 0;
            user-select: none;
        }

        .weather {
            font-size: 15px;
            padding: 0 14px 0 0;
            user-select: none;
        }

        .current {
            display: flex;
            flex-direction: row;
            align-items: center;
            padding: 0 0 20px 0;
            margin: 20px 14px 20px 0;
            user-select: none;

            .display {
                font-size: 40px;
                line-height: 67px;
                color: var(--widget-highlight);
            }

            .temp {
                font-size: 57px;
                margin: 0 0 0 20px;
            }
        }
    }
</style>
