<template>
    <div id="devices">
        <div class="actions">
            <div v-if="this.devices.length > 0" v-on:click="cancel" class="icon">arrow_back</div>
            <div v-if="this.devices.length > 0" class="action-seperator"></div>
            <div v-on:click="refresh()" class="icon">refresh</div>
            <div v-on:click="manual()" class="icon">add</div>
        </div>
        <div class="device" v-for="(device, didx) in devices" :key="didx">
            <div class="image">
                <div class="icon">router</div>
            </div>
            <div class="join">
                <div v-on:click="remove(device.ip, device.port)" class="button">Remove</div>
            </div>
            <div class="info">
                <span class="title">{{ device.hostname || device.ip }}</span>
                <span v-if="device.hostname" class="ip">{{ device.ip }}</span>
            </div>
            <div class="service">
                <span class="title">HOOBS</span>
                <div class="version">{{ device.version }}</div>
            </div>
        </div>
        <div class="device" v-for="(device, aidx) in available" :key="aidx">
            <div class="image">
                <div class="icon">router</div>
            </div>
            <div class="join">
                <div v-on:click="join(device.ip, device.port)" class="button button-primary">Join</div>
            </div>
            <div class="info">
                <span class="title">{{ device.hostname || device.ip }}</span>
                <span v-if="device.hostname" class="ip">{{ device.ip }}</span>
            </div>
            <div class="service">
                <span class="title">HOOBS</span>
                <div class="version">{{ device.version }}</div>
            </div>
        </div>
        <div v-if="loaded && !scanning && available.length === 0" class="empty">
            <div class="message">
                <span>No Devices Found</span>
                <div v-on:click="manual()" class="button">Add Manually</div>
            </div>
        </div>
        <div v-if="scanning" class="scanning">
            <div class="message">Searching for Devices ({{ progress.toFixed(1) }}%)</div>
            <marquee :height="3" color="#feb400" background="#856a3b" />
        </div>
        <modal v-if="adding || joining" width="350px" title="Add Device" action="Add Device" :cancel="close" :ok="add">
            <form class="form" method="post" action="/" autocomplete="false" v-on:submit.prevent="add()">
                <div v-if="error && error !== ''" class="error" v-html="error"></div>
                <text-field v-if="adding" name="IP Address" description="Enter the IP address your HOOBS device" theme="light" v-model="ip" :required="true" />
                <port-field v-if="adding" name="Port" description="Enter the configured port number" theme="light" v-model.number="port" :required="true" />
                <text-field v-if="adding || joining" name="Username" description="Enter the username this device was srtup with" theme="light" v-model="username" :required="true" />
                <password-field v-if="adding || joining" name="Password" description="Enter the password for this device" theme="light" v-model="password" :required="true" />
            </form>
        </modal>
    </div>
</template>

<script>
    import Alfred from "../lib/alfred";
    import Encryption from "../lib/encryption";

    import Modal from "@/components/modal.vue";
    import Marquee from "@/components/marquee.vue";
    import TextField from "@/components/text-field.vue";
    import PasswordField from "@/components/password-field.vue";
    import PortField from "@/components/port-field.vue";

    export default {
        name: "devices",

        components: {
            "modal": Modal,
            "marquee": Marquee,
            "text-field": TextField,
            "password-field": PasswordField,
            "port-field": PortField
        },

        props: {
            cancel: Function
        },

        data() {
            return {
                progress: 0,
                adding: false,
                joining: false,
                scanner: null,
                scanning: false,
                loaded: false,
                ip: "",
                port: 8080,
                username: "",
                password: "",
                devices: [],
                available: [],
                error: ""
            }
        },

        async mounted() {
            this.devices = this.settings.get("devices");
            this.available = [];
            this.scanner = new Alfred("hoobs", 8080);

            this.scanner.on("progress", (data) => {
                this.progress = data;
            });

            this.scanner.on("device", (data) => {
                if (this.available.findIndex(d => d.ip === data.ip && d.port === 8080) === -1 && this.devices.findIndex(d => d.ip === data.ip && d.port === 8080) === -1) {
                    this.available.push(data);
                }
            });

            this.progress = 0;
            this.scanning = true;

            await this.scanner.scan();

            this.scanning = false;
            this.loaded = true;
        },

        destroyed() {
            if (this.scanner) {
                this.scanner.stop();
            }

            this.scanning = false;
            this.scanner = null;
        },

        methods: {
            async refresh() {
                if (!this.scanning && this.scanner) {
                    this.progress = 0;
                    this.scanning = true;

                    await this.scanner.scan();

                    this.scanning = false;
                }
            },

            manual() {
                this.adding = true;
                this.joining = false;
                this.ip = "";
                this.port = 8080;
                this.username = "";
                this.password = "";
                this.error = "";
            },

            join(ip, port) {
                this.adding = false;
                this.joining = true;
                this.ip = ip;
                this.port = port;
                this.username = "";
                this.password = "";
            },

            close() {
                this.adding = false;
                this.joining = false;
                this.ip = "";
                this.port = 8080;
                this.username = "";
                this.password = "";
                this.error = "";
            },

            async add() {
                const errors = [];

                if (!this.ip || this.ip === "" || Number.isNaN(parseInt(this.ip.replace(/\./gi, ""), 10)) || this.ip.split(".").length !== 4) {
                    errors.push("Invalid IP address.");
                }

                if (!this.port || Number.isNaN(parseInt(this.port, 10)) || this.port < 1 || this.port > 65535) {
                    errors.push("Invalid IP port number.");
                }

                if (this.devices.findIndex(d => d.ip === this.ip && d.port === this.port) >= 0) {
                    errors.push("This device has already been paired.");
                }

                if (!this.username || this.username === "") {
                    errors.push("Username is required.");
                }

                if (!this.password || this.password === "") {
                    errors.push("Password is required.");
                }

                if (errors.length === 0) {
                    const test = await this.scanner.detect(this.ip, this.port);

                    if (!test || test === "") {
                        errors.push("HOOBS is not available on this device.");
                    }

                    if (errors.length === 0) {
                        const response = await this.api.post(this.ip, this.port, "/auth", {
                            username: this.username,
                            password: this.password
                        });
                        
                        if (!response.error) {
                            this.username = Encryption.encrypt(this.username);
                            this.password = Encryption.encrypt(this.password);

                            this.devices.push({
                                ip: this.ip,
                                port: this.port,
                                username: this.username,
                                password: this.password,
                                token: response.token
                            });

                            this.settings.set("devices", this.devices);

                            this.close();
                        } else {
                            errors.push(response.error);
                        }
                    }
                }

                this.error = errors.join("<br>");
            },

            remove(ip, port) {
                const index = this.devices.findIndex(d => d.ip === ip && d.port === port);

                if (index >= 0) {
                    this.devices.splice(index, 1);
                    this.settings.set("devices", this.devices);
                }
            }
        }
    }
</script>

<style scoped>
    #devices {
        display: flex;
        flex-direction: column;
    }

    #devices .empty {
        padding: 20px 0;
        font-size: 14px;
        margin: 0 auto;
    }

    #devices .empty .message {
        display: flex;
        flex-direction: column;
    }

    #devices .empty .message span {
        margin: 0 0 10px 0;
    }

    #devices .empty .message .button {
        margin: 0;
    }

    #devices .actions {
        display: flex;
        flex-direction: row;
        padding: 0 0 10px 0;
        margin: 0 0 10px 0;
        border-bottom: 1px #424242 solid;
    }

    #devices .actions .icon {
        font-size: 18px;
        margin: 0 7px 0 0;
        cursor: pointer;
    }

    #devices .actions .icon:hover {
        color: #fff;
    }

    #devices .actions .action-seperator {
        display: inline;
        margin: 0 7px 0 0;
        border-right: 1px #5e5e5e solid;
        cursor: default;
    }

    #devices .device {
        display: flex;
        flex-direction: row;
        align-content: center;
        align-items: center;
        margin: 0 0 10px 0;
        background: #262626;
        box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.24),
                    0 2px 1px -1px rgba(0, 0, 0, 0.22),
                    0 1px 3px 1px rgba(0, 0, 0, 0.3);
    }

    #devices .device:hover {
        background: #2b2b2b;
    }

    #devices .device .image {
        padding: 20px;
        cursor: default;
    }

    #devices .device .image .icon {
        font-size: 37px;
    }

    #devices .device .join {
        padding: 20px 0 20px 0;
    }

    #devices .device .join .button {
        width: 72px;
    }

    #devices .device .info {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 20px;
        text-align: left;
        user-select: none;
        cursor: default;
    }

    #devices .device .info .title {
        font-size: 17px;
    }

    #devices .device .info .ip {
        font-size: 12px;
    }

    #devices .device .service {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 20px 20px 20px 0;
        text-align: right;
        user-select: none;
        cursor: default;
    }

    #devices .device .service .title {
        font-size: 17px;
    }

    #devices .device .service .version {
        font-size: 12px;
    }

    #devices .scanning {
        text-align: left;
    }

    #devices .scanning .message {
        font-size: 14px;
        margin: 0 0 7px 0;
    }

    #devices .form .error {
        font-size: 12px;
        text-align: left;
        color: #e30505;
        margin: 0 0 14px 0;
    }
</style>