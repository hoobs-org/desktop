<template>
    <div id="system">
        <div class="actions">
            <div v-on:click="$emit('close')" title="Back" class="icon">arrow_back</div>
            <div class="action-seperator"></div>
            <div v-on:click="reload()" title="Refresh Device Details" class="icon">refresh</div>
        </div>
        <div class="flow">
            <div class="section">
                <div class="software">
                    <b>HOOBS Server</b>
                    <span v-if="status">Current Version: {{ status["hoobs_version"] }}</span>
                    <div v-if="working" class="working">
                        <marquee :height="3" color="#feb400" background="#856a3b" />
                    </div>
                    <div v-else-if="updates.length > 0" class="updates">
                        <b>{{ updates[0].version }} Update Available</b><br>
                        <div class="button button-primary" v-on:click="updateSystem()">Update</div>
                    </div>
                    <div v-else class="updates">
                        <b>Up to Date</b>
                    </div>
                </div>
                <h2 v-if="status">Software</h2>
                <table v-if="status">
                    <tbody>
                        <tr v-for="(value, name) in status" :key="name">
                            <td style="min-width: 250px;">{{ humanize(name) }}</td>
                            <td style="width: 100%;">{{ value }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div v-for="(item, title) in info" :key="title" class="section">
                <h2>{{ humanize(title) }}</h2>
                <table>
                    <tbody>
                        <tr v-for="(value, name) in item" :key="name">
                            <td style="min-width: 250px;">{{ humanize(name) }}</td>
                            <td style="width: 100%;">{{ value }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div v-if="filesystem" class="section">
                <h2>File System</h2>
                <table>
                    <tbody>
                        <tr v-for="(item, index) in filesystem" :key="index">
                            <td style="min-width: 250px;">{{ item.mount }}</td>
                            <td style="width: 100%;">Used {{ formatSize(item.used) }} ({{ item.use }}%)</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div v-if="temp && (temp || {}).main >= 0" class="section">
                <h2>Temperature</h2>
                <table>
                    <tbody>
                        <tr>
                            <td style="min-width: 250px;">Current</td>
                            <td style="width: 100%;">{{ getTemp(temp.main) }}°</td>
                        </tr>
                        <tr>
                            <td style="min-width: 250px;">Max</td>
                            <td style="width: 100%;">{{ getTemp(temp.max) }}°</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script>
    import Decamelize from "decamelize";
    import Inflection from "inflection";

    import Alfred from "../lib/alfred";

    import Marquee from "@/components/marquee.vue";

    export default {
        name: "system",

        components: {
            "marquee": Marquee
        },

        props: {
            value: Object
        },

        data() {
            return {
                info: null,
                status: null,
                filesystem: null,
                temp: null,
                working: true,
                updates: []
            }
        },

        async mounted() {
            await this.load();
        },

        methods: {
            async reload() {
                this.info = null;
                this.status = null;
                this.filesystem = null;
                this.temp = null;
                this.working = true;
                this.updates = [];

                setTimeout(async () => {
                    await this.load();
                }, 500);
            },

            async load() {
                this.filesystem = await this.api.get(this.value.ip, this.value.port, "/system/filesystem");
                this.temp = await this.api.get(this.value.ip, this.value.port, "/system/temp");
                this.status = await this.api.get(this.value.ip, this.value.port, "/status");
                this.info = await this.api.get(this.value.ip, this.value.port, "/system");

                await this.checkVersion();
            },

            async checkVersion() {
                this.working = true;
                this.updates = await this.api.get(this.value.ip, this.value.port, "/system/updates");

                setTimeout(() => {
                    this.working = false;
                }, 100);
            },

            async updateSystem() {
                this.working = true;

                await this.api.post(this.value.ip, this.value.port, "/service/stop");
                await this.api.put(this.value.ip, this.value.port, "/update");

                setTimeout(async () => {
                    await this.deviceAlive();
                }, 2000);
            },

            async deviceAlive() {
                const scanner = new Alfred("hoobs");

                const test = await scanner.detect(this.value.ip, this.value.port);

                scanner.stop();

                if (test && test !== "") {
                    this.show.working = false;
                } else {
                    setTimeout(async () => {
                        await this.deviceAlive();
                    }, 2000);
                }
            },

            getTemp(value) {
                if (this.settings.get("units").temperature === "celsius") {
                    return Math.round(value);
                }

                return Math.round((value * (9/5)) + 32);
            },

            formatSize(bytes) {
                if(Math.abs(bytes) < 1000) {
                    return `${bytes} B`;
                }

                const units = [
                    "kB",
                    "MB",
                    "GB",
                    "TB",
                    "PB",
                    "EB",
                    "ZB",
                    "YB"
                ];

                let index = -1;

                do {
                    bytes /= 1000;
                    ++index;
                } while(Math.abs(bytes) >= 1000 && index < units.length - 1);

                return `${bytes.toFixed(1)} ${units[index]}`;
            },

            humanize(string) {
                return Inflection.titleize(Decamelize((string || "").split(".")[0].replace(/-/gi, " ").replace(/_/gi, " ").trim())).replace(/hoobs/gi, "HOOBS");
            }
        }
    }
</script>

<style scoped>
    #system {
        flex: 1;
        display: flex;
        flex-direction: column;
    }

    #system .actions {
        display: flex;
        flex-direction: row;
        padding: 0 0 10px 0;
        margin: 0 0 10px 0;
        border-bottom: 1px #424242 solid;
    }

    #system .actions .icon {
        font-size: 18px;
        margin: 0 7px 0 0;
        cursor: pointer;
    }

    #system .actions .icon:hover {
        color: #fff;
    }

    #system .actions .action-seperator {
        display: inline;
        margin: 0 7px 0 0;
        border-right: 1px #5e5e5e solid;
        cursor: default;
    }

    #system .flow {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 0 3px 3px 3px;
        overflow: auto;
    }

    #system .section {
        width: 100%;
        margin: 0;
        text-align: left;
    }

    #system .software {
        padding: 20px;
        display: flex;
        flex-direction: column;
        background: #262626;
        box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.24),
                    0 2px 1px -1px rgba(0, 0, 0, 0.22),
                    0 1px 3px 2px rgba(0, 0, 0, 0.3);
        border-radius: 3px;
        color: #999 !important;
        font-size: 14px;
        margin: 7px 0 30px 0;
    }

    #system .software .updates {
        margin: 20px 0 0 0;
    }

    #system .software .updates .button {
        margin: 10px 10px 0 0;
    }

    #system .software .working {
        max-width: 350px;
        margin: 20px 0 0 0;
    }

    #system h2 {
        margin: 0;
        padding: 0 0 7px 4px;
        line-height: normal;
        border-bottom: 1px #424242 solid;
        font-size: 18px;
        color: #feb400;
    }

    #system .section table {
        width: 100%;
        border-spacing: 0;
        margin: 0 0 30px 0;
    }

    #system .section table tr td {
        padding: 10px;
        font-size: 14px;
        text-align: left;
        border-bottom: 1px #333 solid;
    }

    #system .section table tr:last-child td {
        border-bottom: 0 none;
    }

    #system .section table .empty {
        padding: 30px;
        text-align: center;
    }
</style>