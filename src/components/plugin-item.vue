<template>
    <div id="plugin-item" v-on:click="$emit('select')">
        <div v-if="value.certified" class="certified"></div>
        <span class="title">{{ pluginTitle() }}</span>
        <span v-if="value.installed" class="version">{{ versionCompare(value.installed, value.version) ? `${value.installed} - Published ${new Date(value.date.replace(/\s/, "T")).date}` : `${value.installed} - ${value.version} Update Available` }}</span>
        <span v-else class="version">{{ value.version }} - Published {{ new Date(value.date.replace(/\s/, "T")).date }}</span>
        <span v-if="value.certified" class="version">HOOBS Certified</span>
        <p class="description">{{ value.description }}</p>
    </div>
</template>

<script>
    import Semver from "compare-versions";
    import Decamelize from "decamelize";
    import Inflection from "inflection";

    export default {
        name: "plugin-item",

        props: {
            value: Object
        },

        methods: {
            versionCompare(current, latest) {
                return Semver.compare(current, latest, ">=");
            },

            pluginTitle() {
                if (this.value.name === "google-home" || this.value.name === "homebridge-gsh") {
                    return "Google Home";
                }

                let results = (((this.value.schema || {}).platform || {}).plugin_alias || ((this.value.schema || {}).accessories || {}).plugin_alias || this.value.name || "Unknown Plugin").split(".")[0];

                results = Inflection.titleize(Decamelize(results.replace(/-/gi, " ").replace(/homebridge/gi, "").trim()));

                results = results.replace(/smart things/gi, "SmartThings");
                results = results.replace(/smartthings/gi, "SmartThings");
                results = results.replace(/my q/gi, "myQ");
                results = results.replace(/myq/gi, "myQ");
                results = results.replace(/rgb/gi, "RGB");
                results = results.replace(/wink2/gi, "Wink");
                results = results.replace(/winkv2/gi, "Wink");
                results = results.replace(/wink3/gi, "Wink");
                results = results.replace(/winkv3/gi, "Wink");
                results = results.replace(/ffmpeg/gi, "FFMPEG");
                results = results.replace(/webos/gi, "LG webOS");
                results = results.replace(/webostv/gi, "webOS");

                return results;
            }
        }
    }
</script>

<style scoped>
    #plugin-item {
        display: flex;
        flex-direction: column;
        padding: 20px 10px;
        position: relative;
        border-bottom: 1px #333 solid;
        color: #999;
        cursor: pointer;
        text-decoration: none;
        user-select: none;
    }

    #plugin-item:hover {
        background: #ffffff07;
    }

    #plugin-item .certified {
        position: absolute;
        top: 0;
        left: 0;
        width: 14px;
        height: 14px;
        clip-path: polygon(0 0, 0% 100%, 100% 0);
        background: #feb400;
    }

    #plugin-item .title {
        font-size: 16px;
        color: #feb400;
    }

    #plugin-item .version {
        font-size: 11px;
    }

    #plugin-item .description {
        margin: 10px 0 0 0;
        font-size: 14px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
</style>