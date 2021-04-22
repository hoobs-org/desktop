<template>
    <div :key="version" v-if="user.permissions.users" id="users">
        <context>
            <router-link v-if="id !== 'add'" to="/users/add" class="button">
                <icon name="plus" class="icon" />
                {{ $t("add_user") }}
            </router-link>
        </context>
        <div v-if="!loading" class="content">
            <list value="id" display="name" :values="users" :selected="id" controller="users" />
            <form v-if="parseInt(id, 10) > 0" class="screen form">
                <div class="wrapper">
                    <div class="row title">{{ name }}</div>
                    <div class="row section">{{ $t("profile") }}</div>
                    <div class="row">
                        <text-field :title="$t('name')" v-model="name" />
                        <text-field :title="$t('username')" v-model="username" />
                    </div>
                    <div class="row section">{{ $t("security") }}</div>
                    <div class="row">
                        <password-field :title="$t('password')" v-model="password" />
                        <password-field :title="$t('password_confirm')" v-model="challenge" />
                    </div>
                    <div v-if="subject.id > 1" class="row section">{{ $t("permissions") }}</div>
                    <div v-if="subject.id > 1" class="grid">
                        <div v-for="(permission, index) in permissions" :key="`permission:${index}`">
                            <checkbox :id="`permission_${index}`" :title="$t(permission.label)" v-model="permission.selected" />
                        </div>
                    </div>
                    <div class="row actions">
                        <div v-if="!loading" v-on:click="save()" class="button primary">{{ $t("save") }}</div>
                        <div v-if="subject.id > 1" v-on:click="remove()" class="button">{{ $t("remove") }}</div>
                        <router-link to="/users" class="button">{{ $t("cancel") }}</router-link>
                    </div>
                </div>
            </form>
            <form v-else-if="id === 'add'" class="screen form">
                <div class="wrapper">
                    <div class="row section">{{ $t("profile") }}</div>
                    <div class="row">
                        <text-field :title="$t('name')" v-model="name" />
                        <text-field :title="$t('username')" v-model="username" />
                    </div>
                    <div class="row section">{{ $t("security") }}</div>
                    <div class="row">
                        <password-field :title="$t('password')" v-model="password" />
                        <password-field :title="$t('password_confirm')" v-model="challenge" />
                    </div>
                    <div class="row section">{{ $t("permissions") }}</div>
                    <div class="grid">
                        <div v-for="(permission, index) in permissions" :key="`permission:${index}`">
                            <checkbox :id="`permission_${index}`" :title="$t(permission.label)" v-model="permission.selected" />
                        </div>
                    </div>
                    <div class="row actions">
                        <div v-if="!loading" v-on:click="save(true)" class="button primary">{{ $t("save") }}</div>
                        <router-link to="/users" class="button">{{ $t("cancel") }}</router-link>
                    </div>
                </div>
            </form>
            <div v-else class="initial">
                <div class="message">
                    {{ $t("user_select_add") }}
                    <router-link to="/users/add">{{ $t("user_add") }}</router-link>
                </div>
            </div>
        </div>
        <div v-else class="loading">
            <spinner />
        </div>
    </div>
</template>

<script>
    import ListComponent from "@/components/elements/list.vue";

    import Validators from "../services/validators";

    export default {
        name: "users",

        props: {
            id: String,
        },

        components: {
            "list": ListComponent,
        },

        computed: {
            user() {
                return this.$store.state.user;
            },
        },

        data() {
            return {
                version: 0,
                loading: true,
                users: [],
                subject: {},
                name: "",
                username: "",
                password: "",
                challenge: "",
                permissions: [{
                    name: "accessories",
                    label: "permission_accessories",
                    selected: false,
                }, {
                    name: "controller",
                    label: "permission_controller",
                    selected: false,
                }, {
                    name: "bridges",
                    label: "permission_bridges",
                    selected: false,
                }, {
                    name: "terminal",
                    label: "permission_terminal",
                    selected: false,
                }, {
                    name: "plugins",
                    label: "permission_plugins",
                    selected: false,
                }, {
                    name: "users",
                    label: "permission_users",
                    selected: false,
                }, {
                    name: "reboot",
                    label: "permission_reboot",
                    selected: false,
                }, {
                    name: "config",
                    label: "permission_config",
                    selected: false,
                }],
            };
        },

        watch: {
            id(value) {
                this.load(value);
            },
        },

        async mounted() {
            this.load(this.id);
        },

        methods: {
            async load(id) {
                this.loading = true;
                this.users = await this.$hoobs.users.list();
                this.subject = {};
                this.name = "";
                this.username = "";

                for (let i = 0; i < this.permissions.length; i += 1) {
                    this.permissions[i].selected = false;
                }

                if (parseInt(id, 10) > 0) {
                    this.subject = await this.$hoobs.user(parseInt(id, 10));
                    this.name = this.subject.name;
                    this.username = this.subject.username;

                    for (let i = 0; i < this.permissions.length; i += 1) {
                        this.permissions[i].selected = this.subject.permissions[this.permissions[i].name];
                    }
                }

                this.loading = false;
            },

            async save(create) {
                const validation = Validators.user(create, await this.$hoobs.users.list(), this.username, this.password, this.challenge);

                if (validation.valid) {
                    if (create) {
                        this.loading = true;

                        const permissions = {
                            accessories: false,
                            controller: false,
                            bridges: false,
                            terminal: false,
                            plugins: false,
                            users: false,
                            reboot: false,
                            config: false,
                        };

                        for (let i = 0; i < this.permissions.length; i += 1) {
                            permissions[this.permissions[i].name] = this.permissions[i].selected;
                        }

                        await this.$hoobs.users.add(this.username, this.password, !this.name || this.name === "" ? this.username : this.name, permissions);
                    } else if (this.subject.id === 1) {
                        this.loading = true;

                        await this.subject.update(this.username, !this.password || this.password === "" ? null : this.password, !this.name || this.name === "" ? this.username : this.name);
                    } else {
                        this.loading = true;

                        const permissions = {
                            accessories: false,
                            controller: false,
                            bridges: false,
                            terminal: false,
                            plugins: false,
                            users: false,
                            reboot: false,
                            config: false,
                        };

                        for (let i = 0; i < this.permissions.length; i += 1) {
                            permissions[this.permissions[i].name] = this.permissions[i].selected;
                        }

                        await this.subject.update(this.username, !this.password || this.password === "" ? null : this.password, !this.name || this.name === "" ? this.username : this.name, permissions);
                    }

                    if (this.user.id === this.subject.id) {
                        await this.$hoobs.auth.logout();

                        this.$router.push({ path: "/login", query: { url: "/users" } });
                    } else {
                        this.users = await this.$hoobs.users.list();
                        this.$router.push({ path: `/users/${this.users.find((item) => item.username === this.username).id}` });
                    }
                } else {
                    this.$alert(this.$t(validation.error));
                }
            },

            async remove() {
                if (this.subject.id > 1) {
                    this.$confirm(this.$t("remove"), this.$t("remove_user_warning"), async () => {
                        await this.subject.remove();

                        this.users = await this.$hoobs.users.list();
                        this.$router.push({ path: "/users" });
                    });
                } else {
                    this.$router.push({ path: "/users" });
                }
            },
        },
    };
</script>

<style lang="scss" scoped>
    #users {
        display: flex;
        flex-direction: column;
        overflow: hidden;

        .content {
            flex: 1;
            display: flex;
            overflow: hidden;

            .screen {
                flex: 1;
                display: flex;
                margin: 0 20px 20px 10px;
                color: var(--widget-text);
                background: var(--widget-background);
                backdrop-filter: var(--transparency);
                overflow: auto;

                .title {
                    font-size: 17px;
                }

                .wrapper {
                    max-width: 800px;
                }

                .field {
                    flex: 1;
                    padding-right: 0;
                    padding-left: 5px;

                    &:first-child {
                        padding-right: 5px;
                    }
                }
            }

            .initial {
                flex: 1;
                display: flex;
                flex-direction: row;
                padding: 0 20px 20% 20px;
                align-items: center;
                overflow: hidden;

                .message {
                    margin: 0 auto;
                }
            }
        }
    }
</style>
