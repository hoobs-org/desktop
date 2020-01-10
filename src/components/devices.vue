<template>
    <div id="devices">
        <div class="device" v-for="(device, index) in available" :key="index">
            <div class="image">
                <div class="icon">router</div>
            </div>
            <div class="join">
                <div class="button button-primary">Join</div>
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
        <div v-if="scanning" class="scanning">
            <div class="message">Searching for Devices</div>
            <marquee :height="3" color="#feb400" background="#856a3b" />
        </div>
    </div>
</template>

<script>
    import Alfred from "../lib/alfred";
    import Marquee from "@/components/marquee.vue";

    export default {
        name: "devices",

        components: {
            "marquee": Marquee
        },

        data() {
            return {
                scanner: null,
                scanning: false,
                devices: [],
                available: []
            }
        },

        async mounted() {
            this.devices = this.settings.get("devices");
            this.available = [];
            this.scanner = new Alfred("hoobs", 8080);

            this.scanner.on("data", (data) => {
                this.available.push(data);
            });

            this.scanning = true;

            await this.scanner.scan();

            this.scanning = false;
        },

        destroyed() {
            if (this.scanner) {
                this.scanner.stop();
            }

            this.scanning = false;
        },
    }
</script>

<style scoped>
    #devices {
        display: flex;
        flex-direction: column;
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
    }

    #devices .device .image .icon {
        font-size: 37px;
    }

    #devices .device .join {
        padding: 20px 0 20px 0;
    }

    #devices .device .info {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 20px;
        text-align: left;
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
</style>