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
    <div :key="version" v-if="user.permissions.config" id="config">
        <context />
        <div v-if="!loading" class="content">
            <list value="identifier" display="display" :values="plugins" :selected="identifier" initial="hub" controller="config" />
            <div v-if="screen === 'schema'" class="screen">
                <div class="wrapper">
                    <div class="section">{{ plugin.display }}</div>
                    <tabs :values="bridges" v-on:change="exit" :value="bridge" field="id" display="display" class="tabs" />
                    <schema-form :bridge="bridge" :identifier="identifier" :schema="schema" v-model="working" v-on:input="updated" v-on:save="save" />
                    <div class="row actions">
                        <div v-on:click="save" class="button primary">{{ $t("save") }}</div>
                        <router-link to="/config" class="button">{{ $t("cancel") }}</router-link>
                        <div v-on:click="toggle" class="button">{{ $t("advanced") }}</div>
                    </div>
                </div>
            </div>
            <div v-else-if="screen === 'manual'" class="screen tight">
                <div class="section tight">{{ plugin.display }}</div>
                <tabs :values="bridges" v-on:change="exit" :value="bridge" field="id" display="display" class="tabs tight" />
                <monaco class="editor" v-on:change="parse" :theme="theme" :foreground="foreground" :background="background" :value="code" />
                <div class="row actions">
                    <div v-on:click="save" class="button primary">{{ $t("save") }}</div>
                    <router-link to="/config" class="button">{{ $t("cancel") }}</router-link>
                    <div v-if="schema" v-on:click="toggle" class="button">{{ $t("visual") }}</div>
                </div>
            </div>
            <div v-else-if="screen === 'advanced'" class="screen tight">
                <tabs v-if="bridges.length > 0" :values="bridges" v-on:change="exit" :value="bridge" field="id" display="display" class="tabs tight" />
                <monaco v-if="bridges.length > 0" class="editor" v-on:change="parse" :theme="theme" :foreground="foreground" :background="background" :value="code" />
                <div class="row actions">
                    <div v-if="bridges.length > 0" v-on:click="save" class="button primary">{{ $t("save") }}</div>
                    <router-link to="/config" class="button">{{ $t("cancel") }}</router-link>
                </div>
            </div>
            <div v-else class="screen">
                <div class="wrapper">
                    <div class="section">{{ $t("authentication") }}</div>
                    <div class="row">
                        <integer-field :title="$t('inactive_logoff')" :description="$t('inactive_logoff_description')" :min="5" :max="300" v-model="working.inactive_logoff" v-on:input="updated" />
                    </div>
                    <div class="row">
                        <checkbox id="disable_auth" :title="$t('disable_auth')" v-model="working.disable_auth" v-on:input="updated" />
                    </div>
                    <div class="section extra">{{ $t("monitor") }}</div>
                    <div class="row">
                        <integer-field :title="$t('update_interval')" :description="$t('update_interval_description')" :min="2" :max="300" v-model="working.polling_seconds" v-on:input="updated" />
                    </div>
                    <div class="section">{{ $t("interface") }}</div>
                    <div class="row">
                        <text-field :title="$t('cors_orgin')" :description="$t('cors_orgin_description')" v-model="working.origin" v-on:input="updated" />
                    </div>
                    <div class="row">
                        <text-field :title="$t('gui_path')" :description="$t('gui_path_description')" v-model="working.gui_path" v-on:input="updated" />
                    </div>
                    <div class="row">
                        <text-field :title="$t('touch_path')" :description="$t('touch_path_description')" v-model="working.touch_path" v-on:input="updated" />
                    </div>
                    <div class="row actions">
                        <div v-on:click="save" class="button primary">{{ $t("save") }}</div>
                        <router-link to="/config" class="button">{{ $t("cancel") }}</router-link>
                        <div v-on:click="$dialog.open('settings')" class="button">{{ $t("hub_settings") }}</div>
                    </div>
                </div>
            </div>
        </div>
        <div v-else class="loading">
            <spinner />
        </div>
    </div>
</template>

<script>
    import TabsComponent from "@/components/elements/tabs.vue";
    import ListComponent from "@/components/elements/list.vue";
    import SchemaComponent from "@/components/form.vue";
    import Monaco from "../components/monaco";
    import { cloneJson } from "../services/json";

    const BRIDGE_RESTART_DELAY = 4000;

    export default {
        name: "config",

        props: {
            name: String,
            scope: String,
        },

        components: {
            "list": ListComponent,
            "tabs": TabsComponent,
            "schema-form": SchemaComponent,
            "monaco": Monaco,
        },

        computed: {
            user() {
                return this.$store.state.user;
            },

            screen() {
                if (this.identifier === "hub" || this.identifier === "") return "hub";
                if (this.identifier === "advanced") return "advanced";
                if (this.identifier && this.schema && !this.manual) return "schema";
                if (this.identifier) return "manual";

                return "hub";
            },

            code() {
                return JSON.stringify(this.working, null, 4);
            },
        },

        watch: {
            scope() {
                if (!this.intermediate) {
                    if (this.dirty) {
                        this.$confirm(this.$t("ok"), this.$t("unsaved_changes_warning"), () => {
                            this.switch(this.name && this.name !== "" ? `${this.scope}/${this.name}` : this.scope);
                        }, () => {
                            if (this.$route.path !== `/config/${this.identifier}`) {
                                this.intermediate = true;
                                this.$router.push({ path: `/config/${this.identifier}` });
                            }
                        });
                    } else {
                        this.switch(this.name && this.name !== "" ? `${this.scope}/${this.name}` : this.scope);
                    }
                }

                this.intermediate = false;
            },

            manual() {
                if (!this.intermediate) {
                    if (this.dirty) {
                        this.$confirm(this.$t("ok"), this.$t("unsaved_changes_warning"), () => {
                            this.change(this.bridge);
                        }, () => {
                            this.intermediate = true;
                            this.manual = !this.manual;
                        });
                    } else {
                        this.change(this.bridge);
                    }
                }

                this.intermediate = false;
            },
        },

        data() {
            return {
                version: 0,
                theme: "dark",
                foreground: "999999",
                background: "141414",
                intermediate: false,
                loading: true,
                dirty: false,
                manual: false,
                identifier: "",
                type: null,
                alias: null,
                schema: null,
                saved: {},
                working: {},
                plugins: [],
                plugin: null,
                bridges: [],
                bridge: "",
            };
        },

        mounted() {
            this.$action.off("config", "update");
            this.$action.off("personalize", "update");
            this.$action.on("config", "update", () => this.change(this.bridge));

            this.$action.on("personalize", "update", () => {
                if (this.identifier === "advanced") this.change(this.bridge);
            });

            this.load(this.name && this.name !== "" ? `${this.scope}/${this.name}` : this.scope);
        },

        methods: {
            updated(value) {
                if (JSON.stringify(value) !== JSON.stringify(this.saved)) this.dirty = true;
            },

            toggle() {
                this.manual = !this.manual;
            },

            parse(value) {
                let working;

                try {
                    working = JSON.parse(value);
                } catch (_error) {
                    working = undefined;
                }

                if (working) {
                    this.working = working;
                    this.updated(working);
                }
            },

            async save() {
                this.loading = true;

                let index;
                let config;
                let working;
                let bridge;
                let plugins;

                let reload = false;
                let logout = false;

                switch (this.screen) {
                    case "hub":
                        config = await this.$hoobs.config.get();
                        working = cloneJson(this.working);
                        reload = false;
                        logout = false;

                        if (config.api.disable_auth !== working.disable_auth) {
                            reload = true;

                            if (!config.api.disable_auth) logout = true;
                        }

                        config.api = working;
                        config.api.origin = config.api.origin || "*";

                        this.$hoobs.config.update(config);

                        if (logout) await this.$hoobs.auth.logout();

                        setTimeout(() => {
                            if (reload) {
                                window.location.reload();
                            } else {
                                this.dirty = false;
                                this.change(this.bridge);
                            }
                        }, BRIDGE_RESTART_DELAY);

                        break;

                    case "advanced":
                        bridge = await this.$hoobs.bridge(this.bridge);
                        plugins = await bridge.plugins.list();
                        working = cloneJson(this.working);

                        working.accessories = working.accessories || [];
                        working.platforms = working.platforms || [];

                        for (let i = 0; i < working.platforms.length; i += 1) {
                            const { identifier } = ((plugins.find((plugin) => plugin.alias === working.platforms[i].platform)) || {});

                            if (identifier) working.platforms[i].plugin_map = { plugin_name: identifier };
                        }

                        for (let i = 0; i < working.accessories.length; i += 1) {
                            const { identifier } = ((plugins.find((plugin) => plugin.alias === working.accessories[i].accessory)) || {});

                            if (identifier) working.accessories[i].plugin_map = { plugin_name: identifier };
                        }

                        for (let i = 0; i < working.platforms.length; i += 1) {
                            const { identifier } = ((plugins.find((plugin) => plugin.alias === working.platforms[i].platform)) || {});

                            if (identifier) working.platforms[i].plugin_map = { plugin_name: identifier };
                        }

                        for (let i = 0; i < working.accessories.length; i += 1) {
                            const { identifier } = ((plugins.find((plugin) => plugin.alias === working.accessories[i].accessory)) || {});

                            if (identifier) working.accessories[i].plugin_map = { plugin_name: identifier };
                        }

                        await bridge.config.update(working);

                        setTimeout(() => {
                            this.dirty = false;
                            this.change(this.bridge);
                        }, BRIDGE_RESTART_DELAY);

                        break;

                    default:
                        bridge = await this.$hoobs.bridge(this.bridge);
                        config = await bridge.config.get();
                        working = cloneJson(this.working);
                        index = -1;

                        switch (this.type) {
                            case "accessory":
                                index = config.accessories.findIndex((item) => item.accessory === this.alias);
                                working.accessories = working.accessories || [];

                                while (index >= 0) {
                                    config.accessories.splice(index, 1);
                                    index = config.accessories.findIndex((item) => item.accessory === this.alias);
                                }

                                for (let i = 0; i < working.accessories.length; i += 1) {
                                    working.accessories[i].accessory = this.alias;
                                    working.accessories[i].plugin_map = { plugin_name: this.identifier };
                                }

                                config.accessories = [...config.accessories, ...working.accessories];
                                break;

                            default:
                                index = config.platforms.findIndex((item) => item.platform === this.alias);

                                while (index >= 0) {
                                    config.platforms.splice(index, 1);
                                    index = config.platforms.findIndex((item) => item.platform === this.alias);
                                }

                                working.platform = this.alias;
                                working.plugin_map = { plugin_name: this.identifier };

                                config.platforms = [...config.platforms, working];
                                break;
                        }

                        await bridge.config.update(config);

                        setTimeout(() => {
                            this.dirty = false;
                            this.change(this.bridge);
                        }, BRIDGE_RESTART_DELAY);

                        break;
                }
            },

            exit(bridge) {
                if (this.dirty) {
                    this.$confirm(this.$t("ok"), this.$t("unsaved_changes_warning"), () => { this.change(bridge); });
                } else {
                    this.change(bridge);
                }
            },

            async change(bridge) {
                this.loading = true;
                this.bridge = bridge;

                if (!this.identifier || this.identifier === "" || this.identifier === "hub") {
                    this.saved = (await this.$hoobs.config.get()).api || {};
                    this.working = cloneJson(this.saved);

                    this.working.inactive_logoff = this.working.inactive_logoff || 30;
                    this.working.disable_auth = this.working.disable_auth || false;
                    this.working.polling_seconds = this.working.polling_seconds || 5;
                    this.working.origin = this.working.origin === "*" ? "" : this.working.origin;

                    this.loading = false;
                    this.dirty = false;
                } else if (this.identifier === "advanced") {
                    const theme = await this.$hoobs.theme.get(this.$store.state.theme);

                    this.theme = theme.mode;
                    this.foreground = theme.widget.text.default.replace("#", "");
                    this.background = "00000000";

                    if (this.foreground.length === 3) this.foreground = this.foreground.split("").map((item) => `${item}${item}`).join("");
                    if (this.background.length === 3) this.background = this.background.split("").map((item) => `${item}${item}`).join("");

                    this.saved = (await (await this.$hoobs.bridge(bridge)).config.get()) || {};

                    for (let i = 0; i < (this.saved.accessories || []).length; i += 1) {
                        delete this.saved.accessories[i].plugin_map;
                    }

                    for (let i = 0; i < (this.saved.platforms || []).length; i += 1) {
                        delete this.saved.platforms[i].plugin_map;
                    }

                    this.working = cloneJson(this.saved);
                    this.loading = false;
                    this.dirty = false;
                } else {
                    const config = await (await this.$hoobs.bridge(bridge)).config.get();

                    const platforms = (config || {}).platforms || [];
                    const accessories = (config || {}).accessories || [];

                    switch (this.type) {
                        case "accessory":
                            this.saved = { accessories: accessories.filter((item) => item.accessory === this.alias) || [] };
                            break;

                        default:
                            this.saved = platforms.find((item) => item.platform === this.alias) || { platform: this.alias };
                            break;
                    }

                    delete this.saved.plugin_map;

                    if (this.manual || !(((this.plugin || {}).schema || {}).config)) {
                        const theme = await this.$hoobs.theme.get(this.$store.state.theme);

                        this.theme = theme.mode;
                        this.foreground = theme.widget.text.default.replace("#", "");
                        this.background = "00000000";

                        if (this.foreground.length === 3) this.foreground = this.foreground.split("").map((item) => `${item}${item}`).join("");
                        if (this.background.length === 3) this.background = this.background.split("").map((item) => `${item}${item}`).join("");
                    }

                    this.working = cloneJson(this.saved);
                    this.loading = false;
                    this.dirty = false;
                }
            },

            async switch(identifier) {
                this.loading = true;
                this.identifier = identifier;
                this.bridges = await this.$hoobs.bridges.list();
                this.schema = null;
                this.plugin = null;
                this.dirty = false;
                this.manual = false;

                this.bridges.sort((a, b) => {
                    if (a.display < b.display) return -1;
                    if (a.display > b.display) return 1;

                    return 0;
                });

                if (!this.identifier || this.identifier === "" || this.identifier === "hub") {
                    this.change("");
                } else if (this.identifier === "advanced") {
                    if (this.bridges.length > 0) {
                        this.change(((this.bridges || [])[0] || {}).id || "");
                    } else {
                        this.loading = false;
                    }
                } else {
                    this.plugin = this.plugins.find((item) => item.identifier === identifier);

                    if (this.plugin && this.plugin.schema && this.plugin.schema.config) {
                        this.type = this.plugin.schema.pluginType || (this.plugin.schema.accessory ? "accessory" : "platform");
                        this.alias = this.plugin.alias || this.plugin.schema.pluginAlias || this.$hoobs.repository.title(this.plugin.identifier);
                        this.bridges = this.bridges.filter((bridge) => this.plugin.bridges.findIndex((item) => item.id === bridge.id) >= 0);

                        switch (this.type) {
                            case "accessory":
                                this.schema = {
                                    type: "object",
                                    properties: {
                                        accessories: {
                                            type: "array",
                                            format: "root",
                                            items: {
                                                title: this.$t("accessory"),
                                                type: "object",
                                                properties: this.plugin.schema.config.properties || this.plugin.schema.config,
                                            },
                                        },
                                    },
                                };

                                break;

                            default:
                                this.schema = {
                                    type: "object",
                                    properties: this.plugin.schema.config.properties || this.plugin.schema.config,
                                };

                                break;
                        }
                    } else {
                        this.type = (this.plugin.details[0] || {}).type || "platform";
                        this.alias = this.plugin.alias || (this.plugin.details[0] || {}).alias || this.$hoobs.repository.title(this.plugin.identifier);
                        this.bridges = this.bridges.filter((bridge) => this.plugin.bridges.findIndex((item) => item.id === bridge.id) >= 0);
                    }

                    this.change(((this.bridges || [])[0] || {}).id || "");
                }
            },

            load(identifier) {
                this.loading = true;

                this.$hoobs.plugins().then((plugins) => {
                    for (let i = 0; i < plugins.length; i += 1) {
                        const plugin = plugins[i];

                        if (plugin) {
                            const { bridge } = plugin;
                            const { version } = plugin;

                            let index = this.plugins.findIndex((item) => item.identifier === plugin.identifier);

                            if (index === -1) {
                                index = this.plugins.length;
                                plugin.bridges = [];
                                plugin.display = this.$hoobs.repository.title(plugin.name);

                                delete plugin.bridge;
                                delete plugin.version;

                                this.plugins.push(plugin);
                            }

                            this.plugins[index].bridges.push({ id: bridge, version });
                        }
                    }

                    this.plugins.sort((a, b) => {
                        if (a.display < b.display) return -1;
                        if (a.display > b.display) return 1;

                        return 0;
                    });

                    this.plugins.unshift({ identifier: "hub", display: this.$t("hub") });

                    if (!this.$mobile) this.plugins.push({ identifier: "advanced", display: this.$t("advanced") });

                    this.switch(identifier);
                });
            },
        },
    };
</script>

<style lang="scss" scoped>
    #config {
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
                padding: 20px;
                color: var(--widget-text);
                background: var(--widget-background);
                backdrop-filter: var(--transparency);
                overflow: auto;

                &.tight {
                    margin: 0 20px 20px 0;
                }

                .section {
                    display: flex;
                    flex-direction: row;
                    padding: 0 0 10px 0;
                    border-bottom: var(--application-border) 1px solid;
                    color: var(--application-highlight);
                    margin: 0 0 20px 0;
                    user-select: none;

                    &.tight {
                        margin: 0 0 20px 10px;
                    }

                    &.extra {
                        margin: 20px 0;
                    }
                }

                .wrapper {
                    max-width: 800px;
                }

                .tabs {
                    margin: 20px 0;

                    &.tight {
                        margin: 0 0 7px 10px;
                    }
                }

                .editor {
                    flex: 1;

                    textarea {
                        background: transparent;
                        color: var(--application-input-text);
                        border: 0 none;
                        border-radius: 0;
                        outline: 0 none !important;

                        &:focus {
                            border-color: #f0f;
                            border-radius: 0;
                        }
                    }
                }

                .actions {
                    margin: 10px 0 0 0;
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

<style lang="scss">
    #config {
        .editor {
            textarea {
                background: transparent;
                color: transparent;
                border: 0 none;
                border-radius: 0;
                outline: 0 none !important;

                &:focus {
                    border: 0 none;
                    border-radius: 0;
                }
            }
        }
    }
</style>
