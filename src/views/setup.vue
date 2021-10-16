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
    <div :key="version" id="setup">
        <modal v-if="loading" :welcome="$t('welcome')" width="760px" height="670px">
            <div class="loading">
                <spinner v-model="message" />
            </div>
        </modal>
        <modal v-else :welcome="$t('welcome')" width="760px" height="670px">
            <p>{{ $t("user_add_admin_account") }}</p>
            <form class="modal" autocomplete="false" method="post" action="/setup" v-on:submit.prevent="account()">
                <div v-if="errors.length > 0" class="errors">
                    <span v-for="(error, index) in errors" :key="`errors:${index}`">{{ error }}</span>
                </div>
                <input type="submit" class="hidden-submit" value="submit" />
                <text-field :title="$t('name')" :description="$t('name_description')" v-model="name" :required="true" :autofocus="true" />
                <text-field :title="$t('username')" :description="$t('username_description')" v-model="username" :required="true" />
                <password-field :title="$t('password')" :description="$t('password_description')" v-model="password" />
                <password-field :title="$t('password_confirm')" :description="$t('password_confirm_description')" v-model="challenge" />
            </form>
            <div class="actions modal">
                <div class="copyright">
                    Copyright &copy; {{ (new Date()).getFullYear() }} HOOBS, Inc. All rights reserved.
                </div>
                <div class="button" v-on:click="disable()">{{ $t("disable_login") }}</div>
                <div class="button primary" v-on:click="account()">{{ $t("create_account") }}</div>
            </div>
        </modal>
    </div>
</template>

<script>
    import { Sleep } from "@hoobs/sdk/lib/wait";

    export default {
        name: "setup",

        data() {
            return {
                version: 0,
                loading: true,
                name: "",
                username: "",
                password: "",
                challenge: "",
                bridge: "Default",
                port: 51826,
                errors: [],
                message: "",
            };
        },

        async mounted() {
            this.$theme.set("dark");
            this.loading = false;
        },

        methods: {
            async wait(callback, compare, saftey) {
                const results = await callback();

                if (compare(results)) return results;
                if ((saftey || 0) >= 300) return results;

                await Sleep(1000);

                return this.wait(callback, compare, (saftey || 0) + 1);
            },

            async account() {
                this.errors = [];

                if (this.username.length < 3) this.errors.push(this.$t("username_required"));
                if (this.password.length < 5) this.errors.push(this.$t("password_weak"));
                if (this.password !== this.challenge) this.errors.push(this.$t("password_mismatch"));

                if (this.errors.length === 0) {
                    this.loading = true;
                    this.message = `${this.$t("user_add_creating")} ...`;

                    await this.$hoobs.users.add(this.username.toLowerCase(), this.password, this.name, true);

                    if (await this.$hoobs.auth.login(this.username.toLowerCase(), this.password)) {
                        await (await this.$hoobs.system()).updates();

                        this.$router.push({ path: "/" });
                    } else {
                        this.loading = false;
                        this.errors.push(this.$t("user_add_failed"));
                    }
                }
            },

            async disable() {
                this.loading = true;
                this.message = `${this.$t("disable_login_disabling")} ...`;

                await this.$hoobs.auth.disable();
                await this.wait(this.$hoobs.auth.status, (value) => value === "disabled");
                await (await this.$hoobs.system()).updates();

                this.$router.push({ path: "/" });
            },
        },
    };
</script>

<style lang="scss" scoped>
    #setup {
        flex: 1;
        background: linear-gradient(
            to bottom,
            var(--application-background) 0%,
            #00000000 30%
        );

        .loading {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-around;
            padding: 0 10px 20% 10px;
        }

        .errors {
            margin: 0 0 20px 0;
            padding: 0 0 20px 0;
            display: flex;
            flex-direction: column;
            font-size: 14px;
            color: var(--modal-error-text);
            border-bottom: var(--modal-border) 1px solid;
        }

        p {
            padding: 0 10px;
        }

        form {
            flex: 1;
            background: var(--modal-form);
            padding: 20px;
            margin: 0 10px;
        }
    }
</style>
