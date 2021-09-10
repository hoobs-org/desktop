<!-------------------------------------------------------------------------------------------------
 | hoobs-desktop                                                                                  |
 | Copyright (C) 2021 HOOBS                                                                       |
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
    <modal :title="$t('network')" :draggable="true" width="780px" height="820px">
        <div id="network">
            <div v-if="!loading" class="content">
                <div class="form"></div>
            </div>
            <div v-else class="status">
                <div class="loading">
                    <spinner :value="message" />
                </div>
                <div class="messages" style="height: 70%;">
                    <message v-for="(message, index) in messages" :key="`message:${index}`" :value="message" :compact="true" />
                </div>
            </div>
            <div v-if="!loading" class="actions modal">
                <div v-on:click="$dialog.close('network')" class="button">{{ $t("cancel") }}</div>
            </div>
        </div>
    </modal>
</template>

<script>
    export default {
        name: "netwsork",

        data() {
            return {
                loading: true,
                status: {},
                networks: [],
                messages: [],
                message: "",
            };
        },

        async mounted() {
            this.status = await this.$hoobs.network.status();
            this.networks = await this.$hoobs.networks();

            this.loading = false;
        },
    };
</script>

<style lang="scss" scoped>
    #network {
        flex: 1;
        display: flex;
        flex-direction: column;
        margin: 0 0 0 10px;
    }
</style>
