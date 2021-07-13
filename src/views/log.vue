<template>
    <div :key="version" id="log">
        <context>
            <div ref="bridges" v-on:click.stop="menu('bridges')" class="button">
                <icon name="layers" class="icon" />
                {{ $t("bridges") }}
            </div>
            <div ref="plugins" v-on:click.stop="menu('plugins')" class="button">
                <icon name="puzzle" class="icon" />
                {{ $t("plugins") }}
            </div>
            <icon v-if="debug" v-on:click="mode()" :title="$t('debug_log')" name="bug-check" class="icon" />
            <icon v-else v-on:click="mode()" :title="$t('debug_log')" name="bug" class="icon dim" />
            <div class="seperator"></div>
            <icon v-on:click="download()" :title="$t('download_log')" name="download" class="icon" />
        </context>
        <div ref="messages" class="messages">
            <message v-for="(message, index) in messages" :key="`message:${index}`" :value="message" />
        </div>
    </div>
</template>

<script>
    import MessageComponent from "@/components/elements/message.vue";

    const SCROLL_DELAY = 10;

    export default {
        name: "log",

        components: {
            "message": MessageComponent,
        },

        computed: {
            messages() {
                return this.$store.state.log.filter(this.filter);
            },
        },

        data() {
            return {
                version: 0,
                downloading: false,
                bottom: true,
                debug: false,
                bridges: [],
                plugins: [],
            };
        },

        created() {
            this.$action.on("log", "plugins", (plugins) => {
                this.plugins = plugins;
            });

            this.$action.on("log", "bridges", (bridges) => {
                this.bridges = bridges;
            });
        },

        beforeRouteLeave(_to, _from, next) {
            if (this.$refs.messages) this.$refs.messages.removeEventListener("scroll", this.position);

            next();
        },

        mounted() {
            const { bridges } = this.$store.state;

            this.bridges.push({
                value: "hub",
                text: "Hub",
                selected: true,
            });

            for (let i = 0; i < bridges.length; i += 1) {
                this.bridges.push({
                    value: bridges[i].id,
                    text: bridges[i].display,
                    selected: true,
                });
            }

            this.$action.emit("log", "history");

            this.$hoobs.plugins().then((plugins) => {
                this.plugins.push({
                    value: "null",
                    text: this.$t("non_plugin"),
                    selected: true,
                });

                for (let i = 0; i < plugins.length; i += 1) {
                    if (this.plugins.findIndex((item) => item.value === plugins[i].identifier) === -1) {
                        this.plugins.push({
                            value: plugins[i].identifier,
                            text: plugins[i].alias || plugins[i].name || plugins[i].identifier,
                            selected: true,
                        });
                    }
                }
            }).finally(() => {
                setTimeout(() => {
                    this.$refs.messages.addEventListener("scroll", this.position);

                    if (this.bottom && this.$refs.messages) this.$refs.messages.scrollTo(0, this.$refs.messages.scrollHeight);
                }, SCROLL_DELAY);
            });
        },

        updated() {
            if (this.bottom && this.$refs.messages) this.$refs.messages.scrollTo(0, this.$refs.messages.scrollHeight);
        },

        methods: {
            position() {
                this.bottom = false;

                if ((this.$refs.messages.clientHeight + this.$refs.messages.scrollTop) >= this.$refs.messages.scrollHeight) this.bottom = true;
            },

            mode() {
                this.debug = !this.debug;
            },

            menu(name) {
                this.$menu.open(name, {
                    opener: this.$refs[name],
                    values: this[name],
                });
            },

            filter(message) {
                if (!this.debug && message.level === "debug") {
                    return false;
                }

                if (!((this.bridges.find((item) => item.value === (message.bridge || "hub")) || {}).selected)) {
                    return false;
                }

                if (!((this.plugins.find((item) => item.value === (message.plugin || "null")) || {}).selected)) {
                    return false;
                }

                return true;
            },

            download() {
                this.downloading = true;

                this.$hoobs.log(5000).then((log) => {
                    let content = "";

                    for (let i = 0; i < log.length; i += 1) {
                        content += `${new Date(log[i].timestamp).toLocaleString()} `;

                        if (log[i].id !== "" && log[i].id !== "hub") content += `${log[i].display} `;
                        if (log[i].plugin && log[i].plugin !== "") content += `${log[i].prefix} `;

                        switch (log[i].level) {
                            case "debug":
                                content += `[ DEBUG ] ${log[i].message}`;
                                break;

                            case "error":
                                content += `[ ERROR ] ${log[i].message}`;
                                break;

                            case "warn":
                                content += `[ WARNING ] ${log[i].message}`;
                                break;

                            default:
                                content += log[i].message;
                                break;
                        }

                        content += "\r\n";
                    }

                    const link = document.createElement("a");

                    link.href = `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`;
                    link.download = "log.txt";

                    link.click();
                }).finally(() => {
                    this.downloading = false;
                });
            },
        },
    };
</script>

<style lang="scss" scoped>
    #log {
        flex: 1;
        display: flex;
        background: var(--application-background);
        position: relative;
        overflow: hidden;
        flex-direction: column;

        .dim {
            opacity: 0.3;
        }

        .messages {
            flex: 1;
            padding: 10px 20px 20px 20px;
            overflow: auto;
        }
    }
</style>
