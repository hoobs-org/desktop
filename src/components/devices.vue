<template>
    <div id="devices">
        <div class="actions">
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
            <div class="message">Searching for Devices</div>
            <marquee :height="3" color="#feb400" background="#856a3b" />
        </div>
        <modal v-if="form" width="350px" title="Add Device" action="Add" :cancel="close" :ok="add">
            <form class="form" method="post" action="/" autocomplete="false" v-on:submit.prevent="add()">
                <div v-if="error && error !== ''" class="error">{{ error }}</div>
                <text-field name="IP Address" description="This is the IP address your HOOBS device is running on" theme="light" v-model="ip" :required="true" />
                <port-field name="Port" description="This the port number that your HOOBS device is configured to run on" theme="light" v-model.number="port" :required="true" />
            </form>
        </modal>
    </div>
</template>

<script>
    import Alfred from "../lib/alfred";

    import Modal from "@/components/modal.vue";
    import Marquee from "@/components/marquee.vue";
    import TextField from "@/components/text-field.vue";
    import PortField from "@/components/port-field.vue";

    export default {
        name: "devices",

        components: {
            "modal": Modal,
            "marquee": Marquee,
            "text-field": TextField,
            "port-field": PortField
        },

        data() {
            return {
                form: false,
                scanner: null,
                scanning: false,
                loaded: false,
                ip: "",
                port: 8080,
                devices: [],
                available: [],
                error: ""
            }
        },

        async mounted() {
            this.devices = this.settings.get("devices");
            this.available = [];
            this.scanner = new Alfred("hoobs", 8080);

            this.scanner.on("data", (data) => {
                if (this.available.findIndex(d => d.ip === data.ip && d.port === 8080) === -1 && this.devices.findIndex(d => d.ip === data.ip && d.port === 8080) === -1) {
                    this.available.push(data);
                }
            });

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
                if (this.scanner) {
                    this.scanning = true;

                    await this.scanner.scan();

                    this.scanning = false;
                }
            },

            manual() {
                this.form = true;
                this.error = "";
            },

            close() {
                this.form = false;
                this.port = 8080;
                this.ip = "";
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

                if (errors.length === 0) {
                    const test = await this.scanner.detect(this.ip, this.port);

                    if (!test || test === "") {
                        errors.push("HOOBS is not available on this device.");
                    }

                    if (errors.length === 0) {
                        this.form = false;

                        this.join(this.ip, this.port);
                    }
                }

                this.error = errors.join("<br>");
            },

            join(ip, port) {
                const index = this.available.findIndex(d => d.ip === ip && d.port === port);

                if (index >= 0) {
                    const device = this.available[index];

                    // LOGIN

                    this.devices.push(device);
                    this.settings.set("devices", this.devices);
                }
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
        border-bottom: 1px #333 solid;
    }

    #devices .actions .icon {
        font-size: 18px;
        margin: 0 7px 0 0;
        cursor: pointer;
    }

    #devices .actions .icon:hover {
        color: #fff;
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