<template>
    <div id="devices">
        <div class="actions">
            <div v-if="devices.length > 0" v-on:click="$router.back()" title="Back" class="icon">arrow_back</div>
            <div v-if="devices.length > 0" class="action-seperator"></div>
            <div v-on:click="scanNetwork()" title="Scan Network" class="icon">refresh</div>
            <div v-on:click="addDevice()" title="Add Device" class="icon">add</div>
        </div>
        <div class="flow">
            <device v-for="(device) in devices" :key="`${device.mac}:${device.port}`" :joined="true" :value="device" v-on:remove="removeDevice(device.mac, device.ip, device.port)" />
            <device v-for="(device) in available" :key="`${device.mac}:${device.port}`" :joined="false" :value="device" v-on:join="addDevice(device.mac, device.ip, device.port, device.hostname)" />
            <div v-if="loaded && !show.scanning && available.length === 0 && devices.length === 0" class="empty">
                <div class="message">
                    <span>No Devices Found</span>
                    <div v-on:click="addDevice()" class="button">Add Manually</div>
                </div>
            </div>
            <div v-if="show.scanning" class="scanning">
                <div class="message">Searching for Devices ({{ show.progress.toFixed(1) }}%)</div>
                <marquee :height="3" color="#feb400" background="#856a3b" />
            </div>
        </div>
        <modal v-if="show.add || show.join" v-on:confirm="saveDevice()" v-on:cancel="closeAddDevice()" title="Add Device" ok-title="Add Device" width="350px">
            <form class="form" method="post" action="/" autocomplete="false" v-on:submit.prevent="saveDevice()">
                <div v-if="errors.add && errors.add !== ''" class="error" v-html="errors.add"></div>
                <text-field v-if="show.add || show.join" name="Name" description="Assign a name for this device" theme="light" v-model="values.hostname" :required="false" />
                <text-field v-if="show.add" name="IP Address" description="Enter the IP address your HOOBS device" theme="light" v-model="values.ip" :required="true" />
                <port-field v-if="show.add" name="Port" description="Enter the configured port number" theme="light" v-model.number="values.port" :required="true" />
                <text-field v-if="show.add || show.join" name="Username" description="Enter your HOOBS username" theme="light" v-model="values.username" :required="true" />
                <password-field v-if="show.add || show.join" name="Password" description="Enter your HOOBS password" theme="light" v-model="values.password" :required="true" />
            </form>
        </modal>
    </div>
</template>

<script>
    import Decamelize from "decamelize";
    import Inflection from "inflection";

    import Scanner from "../lib/scanner";
    import Encryption from "../lib/encryption";

    import TextField from "@/components/text-field.vue";
    import PasswordField from "@/components/password-field.vue";
    import PortField from "@/components/port-field.vue";
    import Device from "@/components/device.vue";

    export default {
        name: "devices",

        components: {
            "text-field": TextField,
            "password-field": PasswordField,
            "port-field": PortField,
            "device": Device
        },

        data() {
            return {
                url: null,
                loaded: false,
                scanner: null,
                show: {
                    scanning: false,
                    progress: 0,
                    add: false,
                    join: false
                },
                values: {
                    ip: "",
                    port: 8080,
                    hostname: "",
                    username: "",
                    password: ""
                },
                devices: [],
                available: [],
                terminal: null,
                errors: {
                    add: ""
                }
            }
        },

        async mounted() {
            this.url = this.$route.query.url;

            this.devices = this.Settings.get("devices");
            this.available = [];
            this.scanner = new Scanner("hoobs", 8080);

            this.scanner.on("progress", (response) => {
                if (response > this.show.progress) {
                    this.show.progress = response;
                }
            });

            this.scanner.on("device", (response) => {
                const index = this.devices.findIndex(d => d.mac === response.mac && d.port === 8080);

                if (response.mac && this.available.findIndex(d => d.mac === response.mac && d.port === 8080) === -1 && index === -1) {
                    this.available.push(response);
                } else if (index > -1 && this.devices[index] !== response.ip) {
                    this.updateDevice(response.mac, 8080, response.ip)
                }
            });

            this.scanner.on("stop", () => {
                this.show.scanning = false;
            });

            if (this.devices.length === 0) {
                this.scanNetwork();
            }

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
                    this.show.progress = 0;
                    this.show.scanning = true;

                    await this.scanner.scan();
                }
            },

            updateDevice(mac, port, ip) {
                const index = this.devices.findIndex(d => d.mac === mac && d.port === port);

                if (index > -1 && this.devices[index] !== ip) {
                    this.devices[index].ip = ip;
                    this.Settings.set("devices", this.devices);
                }
            },

            addDevice(mac, ip, port, hostname) {
                this.show.add = true;
                this.show.join = false;

                if (ip && port) {
                    this.show.add = false;
                    this.show.join = true;
                }

                this.values.ip = "";
                this.values.port = 8080;

                if (ip && port) {
                    this.values.ip = ip;
                    this.values.port = port;
                }

                this.values.mac = null;

                if (mac && mac !== "") {
                    this.values.mac = mac;
                }

                this.values.hostname = ip;

                if (hostname) {
                    this.values.hostname = this.humanize(hostname);
                }

                this.values.username = "";
                this.values.password = "";

                this.errors.add = "";
            },

            closeAddDevice() {
                this.show.add = false;
                this.show.join = false;

                this.values.ip = "";
                this.values.port = 8080;
                this.values.mac = null;
                this.values.hostname = "";

                this.values.username = "";
                this.values.password = "";

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

                if (!this.validateIpAddress(this.values.ip)) {
                    errors.push("Invalid IP address.");
                }

                if (!this.validatePort(this.values.port)) {
                    errors.push("Invalid IP port number.");
                }

                if (!this.values.username || this.values.username === "") {
                    errors.push("Username is required.");
                }

                if (!this.values.password || this.values.password === "") {
                    errors.push("Password is required.");
                }

                if ((!this.values.mac || this.values.mac === "") && this.validateIpAddress(this.values.ip)) {
                    this.values.mac = await this.scanner.identify(this.values.ip);
                }

                if (!this.values.mac || this.values.mac === "") {
                    errors.push("This device doesn't have a valid MAC address.");
                }

                if (this.values.mac && this.values.mac !== "" && this.devices.findIndex(d => d.mac === this.values.mac && d.port === this.values.port) >= 0) {
                    errors.push("This device has already been paired.");
                }

                if (errors.length === 0) {
                    const test = await this.scanner.detect(this.values.ip, this.values.port);

                    if (!test || test === "") {
                        errors.push("HOOBS is not available on this device.");
                    }

                    if (errors.length === 0) {
                        if ((await this.API.get(this.values.ip, this.values.port, "/auth")).state === -1) {
                            await this.API.put(this.values.ip, this.values.port, "/auth", {
                                name: "Administrator",
                                admin: true,
                                username: this.values.username.toLowerCase(),
                                password: this.values.password
                            });
                        }

                        const response = await this.API.post(this.values.ip, this.values.port, "/auth", {
                            username: this.values.username,
                            password: this.values.password
                        });
                        
                        if (!response.error) {
                            const index = this.available.findIndex(d => d.mac === this.values.mac && d.port === this.values.port);

                            if (index >= 0) {
                                this.available.splice(index, 1);
                            }

                            this.values.username = Encryption.encrypt(this.values.username);
                            this.values.password = Encryption.encrypt(this.values.password);

                            if (!this.values.hostname || this.values.hostname === "") {
                                this.values.hostname = this.values.ip;
                            }

                            this.devices.push({
                                ip: this.values.ip,
                                port: this.values.port,
                                mac: this.values.mac,
                                hostname: this.values.hostname,
                                username: this.values.username,
                                password: this.values.password
                            });

                            this.Settings.set("devices", this.devices);

                            this.closeAddDevice();

                            if (this.url) {
                                this.$router.push({
                                    path: this.url
                                });
                            }
                        } else {
                            errors.push(response.error);
                        }
                    }
                }

                this.errors.add = errors.join("<br>");
            },

            removeDevice(mac, ip, port) {
                this.Device.wait.stop(ip, port);
                this.Device.wait.stop(ip, port, true);

                const index = this.devices.findIndex(d => d.mac === mac && d.port === port);

                if (index >= 0) {
                    this.devices.splice(index, 1);
                    this.Settings.set("devices", this.devices);
                }
            },

            humanize(string) {
                return Inflection.titleize(Decamelize((string || "").split(".")[0].replace(/-/gi, " ").replace(/_/gi, " ").trim())).replace(/hoobs/gi, "HOOBS");
            }
        }
    }
</script>

<style scoped>
    #devices {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 7px 20px 20px 20px;
        overflow: hidden;
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

    #devices .actions .icon,
    #devices .actions .icon:link,
    #devices .actions .icon:active,
    #devices .actions .icon:visited {
        font-size: 18px;
        color: #999;
        margin: 0 7px 0 0;
        cursor: pointer;
    }

    #devices .actions .icon:hover {
        color: #fff;
        text-decoration: none;
    }

    #devices .actions .action-seperator {
        display: inline;
        margin: 0 7px 0 0;
        border-right: 1px #5e5e5e solid;
        cursor: default;
    }

    #devices .flow {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 3px;
        overflow: auto;
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

    #devices .device .action-cell {
        padding: 20px 0 20px 0;
    }

    #devices .device .action-cell:last-child {
        padding: 20px 20px 20px 0;
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