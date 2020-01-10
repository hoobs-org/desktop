<template>
    <div id="devices">
        <div v-if="scanning" class="scanning">Scanning</div>
        <div class="device" v-for="(device, index) in available" :key="index">
            <div class="join">
                <div class="button button-primary">Join</div>
            </div>
            <div class="info">
                <div class="title">{{ device.hostname || device.ip }}</div>
                <div v-if="device.hostname" class="ip">{{ device.ip }}</div>
            </div>
            <div class="service">
                <div class="version">HOOBS {{ device.version }}</div>
            </div>
        </div>
    </div>
</template>

<script>
    import Alfred from "../lib/alfred";

    export default {
        name: "devices",

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
        }
    }
</script>

<style scoped>
    #devices {
        display: flex;
        flex-direction: column;
    }
</style>