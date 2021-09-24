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
    <modal :title="$t('about')" :draggable="true" width="740px" height="547px">
        <div id="about">
            <div class="content">
                <div class="form">
                    <div class="row section">{{ $t("software") }}</div>
                    <div class="row" style="margin-bottom: 7px;" v-html="version"></div>
                    <div class="row">
                        <div v-on:click="upgrades()" class="button">{{ $t("check_updates") }}</div>
                    </div>
                    <div class="row section">{{ $t("license") }}</div>
                    <div class="row">{{ $t("license_title") }}</div>
                    <p>{{ $t("license_summary") }}</p>
                    <div class="row">
                        <div>
                            <a href="https://support.hoobs.org/docs/5e7649bee87d1e02b6c19d48" target="_blank">{{ $t("terms_conditions") }}</a>
                            <br />
                            <a href="https://support.hoobs.org/docs/5e8f6c790ab68b0344e872d8" target="_blank">{{ $t("privacy_policy") }}</a>
                            <br />
                            <a href="https://support.hoobs.org/docs/5e763ca9e87d1e02b6c19d2f" target="_blank">{{ $t("open_source") }}</a>
                            <br />
                        </div>
                    </div>
                </div>
            </div>
            <div class="actions modal">
                <div v-on:click="donate()" class="button">{{ $t("donate") }}</div>
                <div v-on:click="$dialog.close('about')" class="button primary">{{ $t("ok") }}</div>
            </div>
        </div>
    </modal>
</template>

<script>
    export default {
        name: "about",

        data() {
            return {
                version: "",
            };
        },

        async mounted() {
            this.version = (await this.$hoobs.version()) || "";

            if (this.version.startsWith("4.0")) this.version = `${this.version} <span style="opacity: 0.4; margin: 0 0 0 4px;">Sierra</span>`;
            if (this.version.startsWith("4.1")) this.version = `${this.version} <span style="opacity: 0.4; margin: 0 0 0 4px;">Blackwing</span>`;

            this.version = `${this.$t("version")}: ${this.version}`;
        },

        methods: {
            donate() {
                window.open("https://paypal.me/hoobsorg");
            },

            upgrades() {
                this.$dialog.close("about");
                this.$dialog.open("updates");
            },
        },
    };
</script>

<style lang="scss" scoped>
    #about {
        flex: 1;
        display: flex;
        flex-direction: column;
        margin: 0 0 0 10px;
    }
</style>
