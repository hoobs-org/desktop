<template>
    <div v-if="!show.loading" id="config">
        <div class="sections">
            <div class="actions">
                <div title="Save Changes" class="icon">save</div>
                <div class="action-seperator"></div>
                <div v-on:click="refresh()" title="Refresh Log" class="icon">refresh</div>
            </div>
            <div class="flow">
                <router-link to="/config/interface" :class="section === 'interface' ? 'active': ''">Interface</router-link>
                <router-link to="/config/server" :class="section === 'server' ? 'active': ''">Server</router-link>
                <router-link to="/config/ports" :class="section === 'ports' ? 'active': ''">Ports</router-link>
                <router-link to="/config/bridge" :class="section === 'bridge' ? 'active': ''">Apple Home</router-link>
                <router-link v-for="(plugin) in data.plugins" :key="`plugin_${plugin.name}`" :to="`/config/${plugin.name}`" :class="section === plugin.name ? 'active': ''">{{ plugin.title }}</router-link>
                <router-link to="/config/advanced" :class="section === 'advanced' ? 'active': ''">Advanced</router-link>
            </div>
        </div>
        <div v-if="section === 'interface'" class="panels">
            <div class="tabs">
                <div class="fill"></div>
            </div>
            <div class="flow">
                <div class="form">
                    <select-field name="Language" description="This changes the language of this interface." :options="$options.values.languages" v-model="preferences.locale" :required="true" />
                    <select-field name="Temperature Units" description="Termprature units used for weather forecasts and system sensors." :options="$options.values.units" v-model="preferences.tempUnits" :required="true" />
                    <select-field name="Country Code" description="This is the country code used for weather forecasts." :options="$options.values.countries" v-model="preferences.countryCode" />
                    <text-field name="Postal Code" description="This is the postal code used for weather forecasts." v-model="preferences.postalCode" :required="false" />
                    <text-field name="Latitude" description="Latitude value used for weather forecasts." v-model="preferences.latitude" :required="false" />
                    <text-field name="Longitude" description="Longitude value used for weather forecasts." v-model="preferences.longitude" :required="false" />
                </div>
            </div>
        </div>
        <div v-else-if="section === 'server'" class="panels">
            <div class="tabs">
                <div class="spacer"></div>
                <div v-for="(item) in data.instances" :key="`instance_${item.key}`" v-on:click="selectinstance(item.key)" :class="`${item.key === data.instance ? 'tab active' : 'tab'}`">{{ item.value }}</div>
                <div class="fill"></div>
            </div>
            <div class="flow">
                <div class="form">
                    <port-field name="Server Port" description="This is the port the server runs on." v-model.number="configurations[data.instance].server.port" :required="true" />
                    <integer-field name="Bridge Auto Start" description="Automatically start the bridge service, in seconds." v-model.number="configurations[data.instance].server.autostart" :required="false" />
                    <integer-field name="Refresh Interval" description="Refresh the accessory states interval in seconds." v-model.number="configurations[data.instance].server.polling_seconds" :required="true" />
                </div>
            </div>
        </div>
        <div v-else-if="section === 'ports'" class="panels">
            <div class="tabs">
                <div class="spacer"></div>
                <div v-for="(item) in data.instances" :key="`instance_${item.key}`" v-on:click="selectinstance(item.key)" :class="`${item.key === data.instance ? 'tab active' : 'tab'}`">{{ item.value }}</div>
                <div class="fill"></div>
            </div>
            <div class="flow">
                <div class="form">
                    <text-field name="Range Name" description="A port range description used to identify the port range." v-model="configurations[data.instance].ports.comment" />
                    <port-field name="Start Port" description="The port range starting number." v-model.number="configurations[data.instance].ports.start" />
                    <port-field name="End Port" description="The port range ending number." v-model.number="configurations[data.instance].ports.end" />
                </div>
            </div>
        </div>
        <div v-else-if="section === 'bridge'" class="panels">
            <div class="tabs">
                <div class="spacer"></div>
                <div v-for="(item) in data.instances" :key="`instance_${item.key}`" v-on:click="selectinstance(item.key)" :class="`${item.key === data.instance ? 'tab active' : 'tab'}`">{{ item.value }}</div>
                <div class="fill"></div>
            </div>
            <div class="flow">
                <div class="form">
                    <text-field name="Bridge Name" description="Used to identify the bridge in Apple Home." v-model="configurations[data.instance].bridge.name" :required="true" />
                    <description-field name="Description" description="Used to identify the bridge on the device." v-model="configurations[data.instance].description" />
                    <port-field name="Bridge Port" description="This is the bridge communication port." v-model.number="configurations[data.instance].bridge.port" :required="true" />
                    <hex-field name="Unique Identifier" description="Unique identifier for this bridge." v-model="configurations[data.instance].bridge.username" :required="true" />
                    <text-field name="Apple Home PIN" description="The PIN used when adding HOOBS to Apple Home." v-model="configurations[data.instance].bridge.pin" :required="true" />
                </div>
            </div>
        </div>
        <div v-else-if="section === 'advanced'" class="panels">
            <div class="tabs">
                <div class="spacer"></div>
                <div v-for="(item) in data.instances" :key="`instance_${item.key}`" v-on:click="selectinstance(item.key)" :class="`${item.key === data.instance ? 'tab active' : 'tab'}`">{{ item.value }}</div>
                <div class="fill"></div>
            </div>
            <div class="editor">
                <monaco v-model="code" class="monaco" v-on:change="updateConfig" />
            </div>
        </div>
        <div v-else class="panels">
            <div class="tabs">
                <div class="spacer"></div>
                <div v-for="(item) in data.instances" :key="`instance_${item.key}`" v-on:click="selectinstance(item.key)" :class="`${item.key === data.instance ? 'tab active' : 'tab'}`">{{ item.value }}</div>
                <div class="fill"></div>
            </div>
            <div class="flow">
                <div class="form">

                </div>
            </div>
        </div>
    </div>
    <loader v-else id="loader" value="Loading..." />
</template>

<script>
    import Decamelize from "decamelize";
    import Inflection from "inflection";

    import TextField from "@/components/text-field.vue";
    import DescriptionField from "@/components/description-field.vue";
    import IntegerField from "@/components/integer-field.vue";
    import SelectField from "@/components/select-field.vue";
    import PortField from "@/components/port-field.vue";
    import HexField from "@/components/hex-field.vue";

    import Monaco from "../lib/monaco";

    import Languages from "../locals/languages.json";
    import Countries from "../locals/country-codes.json";

    export default {
        name: "config",

        components: {
            "text-field": TextField,
            "description-field": DescriptionField,
            "integer-field": IntegerField,
            "select-field": SelectField,
            "port-field": PortField,
            "hex-field": HexField,
            "monaco": Monaco
        },

        props: {
            section: String
        },

        data() {
            return {
                show: {
                    loading: true
                },
                preferences: {
                    locale: "en",
                    tempUnits: "fahrenheit",
                    countryCode: "US",
                    postalCode: "94040",
                    latitude: null,
                    longitude: null
                },
                devices: [],
                configurations: {},
                data: {
                    plugins: {},
                    instances: [],
                    instance: null,
                    plugin: null
                },
                errors: []
            }
        },

        values: {
            languages: Languages,
            countries: Countries,
            units: [{
                text: "Celsius",
                value: "celsius"
            },{
                text: "Fahrenheit",
                value: "fahrenheit"
            }]
        },

        computed: {
            code() {
                return JSON.toString(this.configurations[this.data.instance]);
            }
        },

        async mounted() {
            this.devices = this.Settings.get("devices");
            this.show.loading = true;

            await this.loadConfig();
            await this.loadPlugins();

            this.loadInstances();

            this.show.loading = false;
        },

        watch: {
            configurations: {
                deep: true,

                handler() {
                    // RELOAD FIELDS
                }
            },

             section: async function () {
                this.loadInstances();
            } 
        },

        methods: {
            async refresh() {
                this.show.loading = true;

                await this.loadConfig();
                await this.loadPlugins();

                this.loadInstances();

                this.show.loading = false;
            },

            async loadConfig() {
                for (let i = 0; i < this.devices.length; i++) {
                    const device = this.devices[i];
                    const instance = `${device.mac}:${device.port}`;

                    await this.API.login(device.ip, device.port);

                    this.configurations[instance] = await this.API.get(device.ip, device.port, "/config") || {};
                }

                this.configurations = JSON.clone(this.configurations);
            },

            async loadPlugins() {
                const plugins = [];

                for (let i = 0; i < this.devices.length; i++) {
                    const device = this.devices[i];
                    const instance = `${device.mac}:${device.port}`;

                    await this.API.login(device.ip, device.port);

                    const response = await this.API.get(device.ip, device.port, "/plugins") || [];

                    for (let j = 0; j < response.length; j++) {
                        let index = plugins.findIndex(p => p.name === response[j].name && p.name === response[j].name);

                        if (index === -1) {
                            plugins.push(response[j]);
                        }

                        index = plugins.length - 1;

                        plugins[index].title = this.pluginTitle(plugins[index]);

                        if (!plugins[index].instances) {
                            plugins[index].instances = [];
                        }

                        plugins[index].instances.push(instance);
                    }
                }

                plugins.sort((a, b) => (a.title > b.title) ? 1 : -1);

                this.data.plugins = plugins;
            },

            loadInstances() {
                this.data.plugin = null;

                this.data.instances = [];
                this.data.instance = null;

                if (([
                    "interface",
                    "server",
                    "ports",
                    "bridge",
                    "advanced"
                ]).indexOf(this.section) === -1) {
                    this.data.plugin = this.data.plugins.filter(p => p.name === this.section)[0];

                    this.data.instances = this.devices.filter(d => this.data.plugin.instances.indexOf(`${d.mac}:${d.port}`) > -1).map((device) => {
                        return {
                            key: `${device.mac}:${device.port}`,
                            value: device.hostname
                        }
                    });

                    this.data.instance = this.data.instances[0].key;
                } else if (this.section !== "interface") {
                    this.data.instances = this.devices.map((device) => {
                        return {
                            key: `${device.mac}:${device.port}`,
                            value: device.hostname
                        }
                    });

                    this.data.instance = this.data.instances[0].key;
                }
            },

            addError(message) {
                if (this.errors.indexOf(message) === -1) {
                    this.errors.push(message);
                }
            },

            fixError(message) {
                const index = this.errors.indexOf(message);

                if (index >= 0) {
                    this.errors.splice(index, 1);
                }
            },

            updateConfig(value) {
                try {
                    this.configurations[this.data.instance] = JSON.parse(value);

                    this.fixError("Invalid configuration.");
                } catch {
                    this.addError("Invalid configuration.");
                }
            },

            selectinstance(instance) {
                this.data.instance = instance;
            },

            pluginTitle(plugin) {
                if (plugin.name === "google-home") {
                    return "Google Home";
                }

                let value = (((plugin.schema || {}).platform || {}).plugin_alias || ((plugin.schema || {}).accessories || {}).plugin_alias || plugin.name || "Unknown Plugin").split(".")[0];

                value = Inflection.titleize(Decamelize(value.replace(/-/gi, " ").replace(/homebridge/gi, "").trim()));

                value = value.replace(/wink/gi, "Wink");

                if (value.indexOf("Wink") >= 0) {
                    return "Wink";
                }

                value = value.replace(/shelly/gi, "Shelly");

                if (value.indexOf("Shelly") >= 0) {
                    return "Shelly";
                }

                value = value.replace(/smart things/gi, "SmartThings");
                value = value.replace(/smartthings/gi, "SmartThings");

                if (value.indexOf("SmartThings") >= 0) {
                    return "SmartThings";
                }

                value = value.replace(/my q/gi, "myQ");
                value = value.replace(/myq/gi, "myQ");
                value = value.replace(/rgb/gi, "RGB");
                value = value.replace(/ffmpeg/gi, "FFMPEG");
                value = value.replace(/webos/gi, "LG webOS");
                value = value.replace(/webostv/gi, "webOS");

                return value;
            }
        }
    };
</script>

<style scoped>
    #config {
        flex: 1;
        display: flex;
        position: relative;
        flex-direction: row;
        background: #262626;
        text-align: left;
        overflow: hidden;
    }

    #config .actions {
        height: 23px;
        display: flex;
        flex-direction: row;
        padding: 0 0 7px 0;
        border-bottom: 1px #424242 solid;
        overflow-x: auto;
    }

    #config .actions .icon,
    #config .actions .icon:link,
    #config .actions .icon:active,
    #config .actions .icon:visited {
        font-size: 18px;
        color: #999;
        margin: 5px 7px 0 0;
        cursor: pointer;
    }

    #config .actions .icon:hover {
        color: #fff;
        text-decoration: none;
    }

    #config .actions .action-seperator {
        display: inline;
        margin: 5px 7px 0 0;
        border-right: 1px #5e5e5e solid;
        cursor: default;
    }

    #config .tabs {
        height: 24px;
        display: flex;
        flex-direction: row;
        padding: 0 0 7px 0;
        overflow-x: auto;
        overflow-y: hidden;
    }

    #config .tabs::-webkit-scrollbar {
        display: none;
    }

    #config .tabs .tab {
        height: 31px;
        line-height: 32px;
        padding: 0 14px;
        box-sizing: border-box;
        border-bottom: 1px #424242 solid;
        font-size: 14px;
        user-select: none;
        cursor: pointer;
    }

    #config .tabs .tab.active {
        line-height: 32px;
        background: #262626;
        border-top: 1px #424242 solid;
        border-right: 1px #424242 solid;
        border-bottom: 0 none;
        border-left: 1px #424242 solid;
        border-radius: 2px 2px 0 0;
        color: #feb400;
    }

    #config .tabs .fill {
        flex: 1;
        height: 30px;
        min-width: 20px;
        border-bottom: 1px #424242 solid;
    }

    #config .tabs .spacer {
        height: 30px;
        width: 20px;
        border-bottom: 1px #424242 solid;
    }

    #config .sections {
        width: 200px;
        height: 100%;
        display: flex;
        flex-direction: column;
        font-size: 14px;
        box-sizing: border-box;
        padding: 0 0 20px 7px;
        overflow: hidden;
    }

    #config .sections .flow {
        flex: 1;
        overflow: auto;
    }

    #config .sections .flow::-webkit-scrollbar {
        display: none;
    }

    #config .sections a,
    #config .sections a:link,
    #config .sections a:active,
    #config .sections a:visited {
        padding: 10px;
        border-bottom: 1px #333 solid;
        color: #999;
        text-decoration: none;
        display: block;
    }

    #config .sections a:hover {
        color: #fff;
    }

    #config .sections .active {
        font-weight: bold;
        color: #feb400 !important;
    }

    #config .panels {
        flex: 1;
        display: flex;
        padding: 0 20px 20px 0;
        flex-direction: column;
        overflow: hidden;
    }

    #config .panels .flow {
        flex: 1;
        overflow: auto;
    }

    #config .panels .flow::-webkit-scrollbar {
        display: none;
    }

    #config .form {
        padding: 10px 20px 0 20px;
        max-width: 700px;
    }

    #config .editor {
        flex: 1;
        width: 100%;
        height: 100%;
    }

    #config .editor .monaco {
        width: 100%;
        height: 100%;
    }

    #loader {
        margin: 7em auto;
        width: 350px;
    }
</style>
