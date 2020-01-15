<template>
    <div id="system">
        <div class="actions">
            <div v-on:click="$router.back()" title="Back" class="icon">arrow_back</div>
            <div class="action-seperator"></div>
            <div v-on:click="reload()" title="Refresh Device Details" class="icon">refresh</div>
        </div>
        <div class="flow">
            <div class="section">
                <div class="software">
                    <div class="details">
                        <b>HOOBS Server</b>
                        <span v-if="status">Current Version: {{ status["hoobs_version"] }}</span>
                        <div v-if="show.working" class="working">
                            <marquee :height="3" color="#feb400" background="#856a3b" />
                        </div>
                        <div v-else-if="updates.length > 0" class="updates">
                            <b>{{ updates[0].version }} Update Available</b>
                            <br>
                            <div class="button button-primary" v-on:click="updateSystem()">Update</div>
                        </div>
                        <div v-else class="updates">
                            <b>Up to Date</b>
                            <br>
                            <div class="button" v-on:click="$browse('https://github.com/hoobs-org/hoobs-core')">Details</div>
                        </div>
                    </div>
                    <div class="action-cell">
                        <router-link v-if="show.terminal" :to="`/terminal/${device.mac}/${device.port}`" title="Terminal" class="icon action-icon">code</router-link>
                    </div>
                    <div>
                        <div v-if="(show.restart || show.reboot) && show.seperators" class="action-seperator"></div>
                    </div>
                    <div class="action-cell">
                        <confirm v-if="show.restart" value="Restart Bridge" icon="cached" title="Are you sure you want to restart the bridge?" v-on:start="toggleFields(false, true, false, false, false)" v-on:cancel="toggleFields(true, true, true, true, true)" v-on:confirm="restartDevice()" />
                    </div>
                    <div class="action-cell">
                        <confirm v-if="show.reboot" value="Reboot Device" icon="power_settings_new" title="Are you sure you want to reboot this device?" v-on:start="toggleFields(false, false, true, false, false)" v-on:cancel="toggleFields(true, true, true, true, true)" v-on:confirm="rebootDevice()" />
                    </div>
                    <div>
                        <div v-if="show.extra && show.seperators" class="action-seperator"></div>
                    </div>
                    <div class="action-cell">
                        <div v-if="show.extra" v-on:click.stop="$store.commit('toggleMenu', 'system')" class="icon action-icon">menu</div>
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
            <dropdown v-if="menus['system']" class="system-menu">
                <div class="item" v-on:click="() => { confirm.connection = true }">Reset Connection</div>
                <div class="item" v-on:click="() => { confirm.username = true }">Generate New Identifier</div>
                <div class="seperator"></div>
                <div class="item" v-on:click="systemBackup()">System Backup</div>
                <div class="item" v-on:click="systemRestore()">System Restore</div>
                <div class="seperator"></div>
                <div class="item" v-on:click="() => { confirm.reset = true }">Factory Reset</div>
            </dropdown>
            <modal v-if="confirm.connection" v-on:confirm="resetConnection()" v-on:cancel="() => { confirm.connection = false }" width="350px">
                <b>Are you sure you want to reset the connection?</b>
                <p>
                    This will disconnect this device from Apple Home. It will also remove all cached devices and connections. This action can not be reversed.
                </p>
            </modal>
            <modal v-if="confirm.username" v-on:confirm="generateUsername()" v-on:cancel="() => { confirm.username = false }" width="350px">
                <b>Are you sure you want to rgenerate the bridge username?</b>
                <p>
                    This will disconnect this device from Apple Home.
                </p>
            </modal>
            <modal v-if="confirm.reset" v-on:confirm="factoryReset()" v-on:cancel="() => { confirm.reset = false }" width="350px">
                <b>Are you sure you want to factory reset this device?</b>
                <p>
                    This will remove all configurations and plugins. This action can not be reversed.
                </p>
            </modal>
        </div>
    </div>
</template>

<script>
    import Decamelize from "decamelize";
    import Inflection from "inflection";

    import { remote } from "electron";

    export default {
        name: "system",

        data() {
            return {
                info: null,
                status: null,
                filesystem: null,
                temp: null,
                device: null,
                show: {
                    terminal: false,
                    restart: false,
                    reboot: false,
                    extra: false,
                    seperators: false,
                    working: false
                },
                confirm: {
                    connection: false,
                    username: false,
                    reset: false
                },
                updates: []
            }
        },

        computed: {
            menus() {
                return this.$store.state.menus;
            }
        },

        async mounted() {
            const devices = this.Settings.get("devices");
            const index = devices.findIndex(d => d.mac === this.$route.params.mac && d.port === parseInt(this.$route.params.port, 10))

            if (index > -1) {
                this.device = devices[index];

                this.toggleFields(false, false, false, false, false);

                this.Device.wait.start(this.device.ip, this.device.port, async () => {
                    this.toggleFields(true, true, true, true, true);

                    await this.load();
                });
            }
        },

        destroyed() {
            this.Device.wait.stop(this.device.ip, this.device.port);
        },

        methods: {
            toggleFields(terminal, restart, reboot, extra, seperators) {
                this.show.terminal = terminal;
                this.show.restart = restart;
                this.show.reboot = reboot;
                this.show.extra = extra;
                this.show.seperators = seperators;
            },

            async systemRestore() {
                const filename = remote.dialog.showOpenDialogSync({
                    properties: ["openFile"],
                    filters: [
                        {
                            name: "HOOBS Backup",
                            extensions: ["hbf"]
                        }
                    ]
                })[0];

                if (filename) {
                    this.toggleFields(false, false, false, false, false);

                    this.show.working = true;

                    await this.API.login(this.device.ip, this.device.port);
                    await this.API.upload(this.device.ip, this.device.port, "/restore", filename);

                    setTimeout(async () => {
                        this.Device.wait.start(this.device.ip, this.device.port, () => {
                            this.show.working = false;

                            this.toggleFields(true, true, true, true, true);
                        });
                    }, 5000);
                }
            },

            async systemBackup() {
                this.toggleFields(false, false, false, false, false);

                this.show.working = true;

                const response = await this.API.post(this.device.ip, this.device.port, "/backup");

                if (response.success) {
                    this.$download(`http://${this.device.ip}:${this.device.port}${response.filename}`);
                }

                this.show.working = false;

                this.toggleFields(true, true, true, true, true);
            },

            async restartDevice() {
                this.toggleFields(true, false, false, false, true);

                this.show.working = true;

                await this.API.login(this.device.ip, this.device.port);
                await this.API.post(this.device.ip, this.device.port, "/service/restart");

                this.show.working = false;

                this.toggleFields(true, true, true, true, true);
            },

            async rebootDevice() {
                this.toggleFields(false, false, false, false, false);

                this.show.working = true;

                await this.API.login(this.device.ip, this.device.port);
                await this.API.post(this.device.ip, this.device.port, "/service/stop");
                await this.API.put(this.device.ip, this.device.port, "/reboot");

                setTimeout(async () => {
                    this.Device.wait.start(this.device.ip, this.device.port, () => {
                        this.show.working = false;

                        this.toggleFields(true, true, true, true, true);
                    });
                }, 5000);
            },

            async factoryReset() {
                this.confirm.reset = false;

                this.toggleFields(false, false, false, false, false);

                this.show.working = true;

                await this.API.login(this.device.ip, this.device.port);
                await this.API.put(this.device.ip, this.device.port, "/reset");

                setTimeout(async () => {
                    this.Device.wait.start(this.device.ip, this.device.port, () => {
                        this.show.working = false;

                        this.toggleFields(true, true, true, true, true);
                    });
                }, 5000);
            },

            async resetConnection() {
                this.confirm.connection = false;

                this.toggleFields(true, false, false, false, true);

                this.show.working = true;

                await this.API.login(this.device.ip, this.device.port);
                await this.API.post(this.device.ip, this.device.port, "/service/stop");
                await this.API.post(this.device.ip, this.device.port, "/service/clean");

                const username = (await this.API.get(this.device.ip, this.device.port, "/config/generate")).username || "";
                const config = await this.API.get(this.device.ip, this.device.port, "/config");

                const data = {
                    client: config.client,
                    bridge: config.bridge,
                    description: config.description,
                    ports: config.ports,
                    accessories: config.accessories || [],
                    platforms: config.platforms || []
                }

                if (username && username !== "") {
                    data.bridge.username = username;
                }

                await this.API.post(this.device.ip, this.device.port, "/config", data);
                await this.API.post(this.device.ip, this.device.port, "/service/start");

                this.show.working = false;

                this.toggleFields(true, true, true, true, true);
            },

            async generateUsername() {
                this.confirm.username = false;

                this.toggleFields(true, false, false, false, true);

                this.show.working = true;

                await this.API.login(this.device.ip, this.device.port);
                await this.API.post(this.device.ip, this.device.port, "/service/stop");

                const username = (await this.API.get(this.device.ip, this.device.port, "/config/generate")).username || "";
                const config = await this.API.get(this.device.ip, this.device.port, "/config");

                const data = {
                    client: config.client,
                    bridge: config.bridge,
                    description: config.description,
                    ports: config.ports,
                    accessories: config.accessories || [],
                    platforms: config.platforms || []
                }

                if (username && username !== "") {
                    data.bridge.username = username;
                }

                await this.API.post(this.device.ip, this.device.port, "/config", data);
                await this.API.post(this.device.ip, this.device.port, "/service/start");

                this.show.working = false;

                this.toggleFields(true, true, true, true, true);
            },

            async reload() {
                this.info = null;
                this.status = null;
                this.filesystem = null;
                this.temp = null;
                this.show.working = true;
                this.updates = [];

                setTimeout(async () => {
                    await this.load();
                }, 500);
            },

            async load() {
                await this.API.login(this.device.ip, this.device.port);

                this.filesystem = await this.API.get(this.device.ip, this.device.port, "/system/filesystem");
                this.temp = await this.API.get(this.device.ip, this.device.port, "/system/temp");
                this.status = await this.API.get(this.device.ip, this.device.port, "/status");
                this.info = await this.API.get(this.device.ip, this.device.port, "/system");
                this.updates = await this.API.get(this.device.ip, this.device.port, "/system/updates");

                setTimeout(() => {
                    this.show.working = false;
                }, 100);
            },

            async updateSystem() {
                this.show.working = true;

                await this.API.login(this.device.ip, this.device.port);
                await this.API.post(this.device.ip, this.device.port, "/service/stop");
                await this.API.put(this.device.ip, this.device.port, "/update");

                setTimeout(async () => {
                    this.Device.wait.start(this.device.ip, this.device.port, () => {
                        this.show.working = false;
                    });
                }, 5000);
            },

            getTemp(value) {
                if (this.Settings.get("units").temperature === "celsius") {
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
        padding: 0 20px 20px 20px;
        overflow: hidden;
    }

    #system .actions {
        height: 23px;
        display: flex;
        flex-direction: row;
        padding: 0 0 7px 0;
        margin: 0 0 6px 0;
        border-bottom: 1px #424242 solid;
    }

    #system .actions .icon {
        font-size: 18px;
        margin: 5px 7px 0 0;
        cursor: pointer;
    }

    #system .actions .icon:hover {
        color: #fff;
    }

    #system .actions .action-seperator {
        display: inline;
        margin: 5px 7px 0 0;
        border-right: 1px #5e5e5e solid;
        cursor: default;
    }

    #system .flow {
        flex: 1;
        display: flex;
        position: relative;
        flex-direction: column;
        padding: 0 3px 3px 3px;
        overflow: auto;
    }

    #system .flow::-webkit-scrollbar {
        display: none;
    }

    #system .section {
        width: 100%;
        margin: 0;
        text-align: left;
    }

    #system .software {
        height: 116px;
        padding: 20px;
        display: flex;
        flex-direction: row;
        align-content: center;
        align-items: center;
        background: #262626;
        box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.24),
                    0 2px 1px -1px rgba(0, 0, 0, 0.22),
                    0 1px 3px 2px rgba(0, 0, 0, 0.3);
        border-radius: 3px;
        color: #999 !important;
        font-size: 14px;
        margin: 7px 0 30px 0;
    }

    #system .software .details {
        flex: 1;
        display: flex;
        flex-direction: column;
    }

    #system .software .action-cell {
        padding: 20px 0 20px 0;
    }

    #system .software .action-cell:last-child {
        padding: 20px 20px 20px 0;
    }

    #system .software .action-cell .action-icon,
    #system .software .action-cell .action-icon:link,
    #system .software .action-cell .action-icon:active,
    #system .software .action-cell .action-icon:visited {
        margin: 0 0 0 7px;
        font-size: 18px;
        text-decoration: none;
        color: #999;
        cursor: pointer;
    }

    #system .software .action-cell .action-icon:hover {
        color: #fff;
        text-decoration: none;
    }

    #system .software .action-seperator {
        width: 8px;
        height: 20px;
        margin: 0 7px;
        border-right: 1px #5e5e5e solid;
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

    #system .system-menu {
        position: absolute;
        top: 96px;
        right: 43px;
        z-index: 1000;
    }
</style>