<template>
    <div id="devices">
        <div class="actions">
            <div v-if="this.devices.length > 0" v-on:click="cancel" class="icon">arrow_back</div>
            <div v-if="this.devices.length > 0" class="action-seperator"></div>
            <div v-on:click="scanNetwork()" class="icon">refresh</div>
            <div v-on:click="addDevice()" class="icon">add</div>
        </div>
        <div class="device" v-for="(device, didx) in devices" :key="didx">
            <div class="image">
                <div class="icon">router</div>
            </div>
            <div class="action-cell">
                <div v-on:click="removeDevice(device.ip, device.port)" class="button">Remove</div>
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
            <div class="action-cell">
                <div v-on:click="addDevice(device.ip, device.port)" class="button button-primary">Join</div>
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
        <div v-if="loaded && !show.scanning && available.length === 0" class="empty">
            <div class="message">
                <span>No Devices Found</span>
                <div v-on:click="addDevice()" class="button">Add Manually</div>
            </div>
        </div>
        <div v-if="show.scanning" class="scanning">
            <div class="message">Searching for Devices ({{ progress.toFixed(1) }}%)</div>
            <marquee :height="3" color="#feb400" background="#856a3b" />
        </div>
        <modal v-if="show.add || show.join" width="350px" title="Add Device" ok-title="Add Device" :cancel-action="closeAddDevice" :ok-action="saveDevice">
            <form class="form" method="post" action="/" autocomplete="false" v-on:submit.prevent="saveDevice()">
                <div v-if="errors.add && errors.add !== ''" class="error" v-html="errors.add"></div>
                <text-field v-if="show.add" name="IP Address" description="Enter the IP address your HOOBS device" theme="light" v-model="data.ip" :required="true" />
                <port-field v-if="show.add" name="Port" description="Enter the configured port number" theme="light" v-model.number="data.port" :required="true" />
                <text-field v-if="show.add || show.join" name="Username" description="Enter the username this device was srtup with" theme="light" v-model="data.username" :required="true" />
                <password-field v-if="show.add || show.join" name="Password" description="Enter the password for this device" theme="light" v-model="data.password" :required="true" />
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
                loaded: false,
                scanner: null,
                progress: 0,
                show: {
                    scanning: false,
                    add: false,
                    join: false
                },
                data: {
                    ip: "",
                    port: 8080,
                    username: "",
                    password: ""
                },
                devices: [],
                available: [],
                errors: {
                    add: ""
                }
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

            this.scanNetwork();

            this.loaded = true;
        },

        destroyed() {
            if (this.scanner) {
                this.scanner.stop();
            }

            this.show.scanning = false;
            this.scanner = null;
        },

        methods: {
            async scanNetwork() {
                if (this.scanner && !this.show.scanning) {
                    this.progress = 0;
                    this.show.scanning = true;

                    await this.scanner.scan();

                    this.show.scanning = false;
                }
            },

            addDevice(ip, port) {
                this.show.add = true;
                this.show.join = false;

                if (ip && port) {
                    this.show.add = false;
                    this.show.join = true;
                }

                this.data.ip = "";
                this.data.port = 8080;

                if (ip && port) {
                    this.data.ip = ip;
                    this.data.port = port;
                }

                this.data.username = "";
                this.data.password = "";

                this.errors.add = "";
            },

            closeAddDevice() {
                this.show.add = false;
                this.show.join = false;

                this.data.ip = "";
                this.data.port = 8080;

                this.data.username = "";
                this.data.password = "";

                this.errors.add = "";
            },

            validateIpAddress(value) {
                if (!value || value === "") {
                    return false;
                }

                if (Number.isNaN(parseInt(value.replace(/\./gi, ""), 10))) {
                    return false;
                }

                const parts = value.split(".");

                if (parts.length !== 4) {
                    return false;
                }

                for (let i = 0; i < parts.length; i++) {
                    const part = parseInt(parts[i], 10);

                    if (Number.isNaN(part)) {
                        return false;
                    }

                    if (part < 1 || part > 255) {
                        return false;
                    }
                }

                return true;
            },

            validatePort(value) {
                if (!value || value === "") {
                    return false;
                }

                value = parseInt(value, 10);

                if (Number.isNaN(value)) {
                    return false;
                }

                if (value < 1 || value > 65535) {
                    return false;
                }

                return true;
            },

            async saveDevice() {
                const errors = [];

                if (!this.validateIpAddress(this.data.ip)) {
                    errors.push("Invalid IP address.");
                }

                if (!this.validatePort(this.data.port)) {
                    errors.push("Invalid IP port number.");
                }

                if (this.devices.findIndex(d => d.ip === this.data.ip && d.port === this.data.port) >= 0) {
                    errors.push("This device has already been paired.");
                }

                if (!this.data.username || this.data.username === "") {
                    errors.push("Username is required.");
                }

                if (!this.data.password || this.data.password === "") {
                    errors.push("Password is required.");
                }

                if (errors.length === 0) {
                    const test = await this.scanner.detect(this.data.ip, this.data.port);

                    if (!test || test === "") {
                        errors.push("HOOBS is not available on this device.");
                    }

                    if (errors.length === 0) {
                        const response = await this.api.post(this.data.ip, this.data.port, "/auth", {
                            username: this.data.username,
                            password: this.data.password,
                            remember: true
                        });
                        
                        if (!response.error) {
                            const index = this.available.findIndex(d => d.ip === this.data.ip && d.port === this.data.port);

                            if (index >= 0) {
                                this.available.splice(index, 1);
                            }

                            this.data.username = Encryption.encrypt(this.data.username);
                            this.data.password = Encryption.encrypt(this.data.password);

                            this.devices.push({
                                ip: this.data.ip,
                                port: this.data.port,
                                username: this.data.username,
                                password: this.data.password,
                                token: response.token
                            });

                            this.settings.set("devices", this.devices);

                            this.closeAddDevice();
                        } else {
                            errors.push(response.error);
                        }
                    }
                }

                this.errors.add = errors.join("<br>");
            },

            removeDevice(ip, port) {
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
        user-select: none;
        cursor: default;
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
        cursor: default;
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

    #devices .device .joiaction-celln {
        padding: 20px 0 20px 0;
    }

    #devices .device .action-cell .button {
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
        user-select: none;
        cursor: default;
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