<template>
    <modal :title="$t('updates')" :draggable="true" width="720px" height="520px">
        <div id="updates">
            <div class="content">
                <div v-if="!updating" class="form">
                    <div class="row section">{{ $t("software") }}</div>
                    <div v-if="!loading && !status.upgraded" class="row">
                        {{ $t("version_server") }}: {{ status.current }}
                        <span class="value">{{ $t("available") }}</span>
                    </div>
                    <div v-if="!loading && !status.gui_upgraded" class="row">
                        {{ $t("version_gui") }}: {{ status.gui_current }}
                        <span class="value">{{ $t("available") }}</span>
                    </div>
                    <div v-if="!loading && !status.cli_upgraded" class="row">
                        {{ $t("version_cli") }}: {{ status.cli_current }}
                        <span class="value">{{ $t("available") }}</span>
                    </div>
                    <div v-if="!loading && !status.node_upgraded" class="row">
                        {{ $t("version_node") }}: {{ status.node_current }}
                        <span class="value">{{ $t("available") }}</span>
                    </div>
                    <div v-for="(plugin, index) in plugins" :key="`plugin:${index}`" class="row">
                        {{ $hoobs.repository.title(plugin.name) }}: {{ plugin.latest }}
                        <span class="value">{{ $t("available") }}</span>
                    </div>
                    <div v-if="!loading && !updated" class="row" style="margin-top: 7px;">
                        <a v-if="stack" class="button" href="https://github.com/hoobs-org/HOOBS" target="_blank">{{ $t("changelog") }}</a>
                        <div v-if="stack" v-on:click="upgrade()" class="button">{{ $t("update_now") }}</div>
                        <div v-if="plugins.length > 0" v-on:click="update()" class="button">{{ $t("update_plugins") }}</div>
                    </div>
                    <div v-if="!loading && updated" class="row updated">
                        <icon name="update" class="icon" />
                        <div class="text">{{ $t("updated") }}</div>
                    </div>
                    <div v-if="loading" class="row loading">
                        <spinner />
                    </div>
                </div>
                <div v-else class="status">
                    <div class="loading">
                        <spinner />
                    </div>
                    <div class="messages" style="height: 50%;">
                        <message v-for="(message, index) in messages" :key="`message:${index}`" :value="message" />
                    </div>
                </div>
            </div>
            <div class="actions modal">
                <div v-if="!updating" v-on:click="$dialog.close('updates')" class="button">{{ $t("ok") }}</div>
            </div>
        </div>
    </modal>
</template>

<script>
    import Semver from "compare-versions";

    import MessageComponent from "@/components/elements/message.vue";

    const REDIRECT_DELAY = 1000;

    export default {
        name: "updates",

        components: {
            "message": MessageComponent,
        },

        data() {
            return {
                loading: true,
                logging: false,
                status: {},
                version: "",
                plugins: [],
                stack: false,
                updated: false,
                updating: false,
                messages: [],
            };
        },

        async mounted() {
            this.load();
        },

        methods: {
            async load() {
                this.loading = true;

                this.status = await this.$hoobs.status();
                this.version = await this.$hoobs.version();

                this.plugins = ((await this.$hoobs.plugins()) || []).filter((item) => !Semver.compare(item.version, item.latest, ">="));

                if (!this.status.gui_version) this.status.gui_upgraded = true;

                this.stack = !(this.status.upgraded && this.status.cli_upgraded && this.status.node_upgraded && this.status.gui_upgraded);
                this.updated = !(this.stack || this.plugins.length > 0);

                this.loading = false;
                this.updating = false;
            },

            async upgrade() {
                this.updating = true;
                this.logging = true;
                this.messages = [];

                this.$store.subscribe(async (mutation) => {
                    if (mutation.type === "IO:LOG" && this.logging) {
                        if (!mutation.payload.bridge || mutation.payload.bridge === "hub" || mutation.payload.bridge === "") {
                            this.messages.push(mutation.payload);
                            this.messages = this.messages.slice(Math.max(this.messages.length - 12, 0));
                        }

                        if ((mutation.payload.message || "").toLowerCase().indexOf("service restart") >= 0) {
                            this.logging = false;

                            this.messages.push({
                                level: "info",
                                bridge: "hub",
                                display: "hub",
                                timestamp: new Date().getTime(),
                                message: "restarting",
                            }, {
                                level: "info",
                                bridge: "hub",
                                display: "hub",
                                timestamp: new Date().getTime(),
                                message: ".",
                            });

                            this.messages = this.messages.slice(Math.max(this.messages.length - 12, 0));

                            setInterval(() => {
                                if (this.messages[this.messages.length - 1].message === ".................................") {
                                    this.messages[this.messages.length - 1].message = ".";
                                } else {
                                    this.messages[this.messages.length - 1].message += ".";
                                }
                            }, 500);

                            this.messages = this.messages.slice(Math.max(this.messages.length - 12, 0));
                        }
                    }
                });

                await (await this.$hoobs.system()).upgrade();

                this.$action.on("io", "disconnected", () => {
                    this.$action.emit("io", "reload");

                    setTimeout(() => {
                        this.$dialog.close("updates");
                    }, REDIRECT_DELAY);
                });
            },

            update() {
                this.updating = true;
                this.logging = true;
                this.messages = [];

                this.$store.subscribe(async (mutation) => {
                    if (mutation.type === "IO:LOG" && this.logging && (!mutation.payload.bridge || mutation.payload.bridge === "hub" || mutation.payload.bridge === "")) {
                        this.messages.push(mutation.payload);
                        this.messages = this.messages.slice(Math.max(this.messages.length - 12, 0));
                    }
                });

                const waits = [];

                for (let i = 0; i < this.plugins.length; i += 1) {
                    const { ...plugin } = this.plugins[i];

                    waits.push(new Promise((resolve) => {
                        this.$hoobs.bridge(plugin.bridge).then((bridge) => {
                            bridge.plugins.upgrade(plugin.identifier).then(() => {
                                resolve();
                            });
                        });
                    }));
                }

                Promise.all(waits).then(() => {
                    this.logging = false;
                    this.load();
                });
            },
        },
    };
</script>

<style lang="scss" scoped>
    #updates {
        flex: 1;
        display: flex;
        flex-direction: column;
        margin: 0 0 0 10px;

        .value {
            font-weight: bold;
            margin: 0 4px;
        }

        .loading {
            margin: 7px 0 0 0;
        }

        .updated {
            align-items: center;

            .icon {
                height: 37px;
                color: var(--modal-highlight);
            }

            .text {
                font-size: 22px;
                margin: 0 0 0 14px;
            }
        }

        .status {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;

            .loading {
                flex: 1;
                padding: 0 0 4% 0;
            }
        }
    }
</style>
