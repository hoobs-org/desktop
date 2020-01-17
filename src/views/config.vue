<template>
    <div id="config">
        <monaco v-on:mounted="() => { show.mounting = false }" value="{}" class="monaco-loader" />
        <div v-if="!show.loading && !show.mounting" class="loaded">
            <div class="sections">
                <div class="actions">
                    <div v-on:click="saveChanges()" title="Save Changes" class="icon">save</div>
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
                    <div class="spacer"></div>
                    <tab title="Preferences" :active="true" :dirty="flags.dirty.indexOf('preferences') >= 0" />
                    <div class="fill"></div>
                </div>
                <div class="flow">
                    <div class="form">
                        <select-field v-on:input="markDirty()" name="Language" description="This changes the language of this interface." :options="$options.values.languages" v-model="configurations.working['preferences'].locale" :required="true" />
                        <select-field v-on:input="markDirty()" name="Temperature Units" description="Termprature units used for weather forecasts and system sensors." :options="$options.values.units" v-model="configurations.working['preferences'].tempUnits" :required="true" />
                        <select-field v-on:input="markDirty()" name="Country Code" description="This is the country code used for weather forecasts." :options="$options.values.countries" v-model="configurations.working['preferences'].countryCode" />
                        <text-field v-on:input="markDirty()" name="Postal Code" description="This is the postal code used for weather forecasts." v-model="configurations.working['preferences'].postalCode" :required="false" />
                        <text-field v-on:input="markDirty()" name="Latitude" description="Latitude value used for weather forecasts." v-model="configurations.working['preferences'].latitude" :required="false" />
                        <text-field v-on:input="markDirty()" name="Longitude" description="Longitude value used for weather forecasts." v-model="configurations.working['preferences'].longitude" :required="false" />
                    </div>
                </div>
            </div>
            <div v-if="section === 'server'" class="panels">
                <div class="tabs">
                    <div class="spacer"></div>
                    <tab v-for="(item) in data.instances" :key="`instance_${item.key}`" v-on:activate="selectinstance(item.key)" :title="item.value" :active="item.key === data.instance" :dirty="flags.dirty.indexOf(item.key) >= 0" />
                    <div class="fill"></div>
                </div>
                <div class="flow">
                    <div class="form">
                        <port-field v-on:input="markDirty()" name="Server Port" description="This is the port the server runs on." v-model.number="configurations.working[data.instance].server.port" :required="true" />
                        <integer-field v-on:input="markDirty()" name="Bridge Auto Start" description="Automatically start the bridge service, in seconds." v-model.number="configurations.working[data.instance].server.autostart" :required="false" />
                        <integer-field v-on:input="markDirty()" name="Refresh Interval" description="Refresh the accessory states interval in seconds." v-model.number="configurations.working[data.instance].server.polling_seconds" :required="true" />
                    </div>
                </div>
            </div>
            <div v-if="section === 'ports'" class="panels">
                <div class="tabs">
                    <div class="spacer"></div>
                    <tab v-for="(item) in data.instances" :key="`instance_${item.key}`" v-on:activate="selectinstance(item.key)" :title="item.value" :active="item.key === data.instance" :dirty="flags.dirty.indexOf(item.key) >= 0" />
                    <div class="fill"></div>
                </div>
                <div class="flow">
                    <div class="form">
                        <text-field v-on:input="markDirty()" name="Range Name" description="A port range description used to identify the port range." v-model="configurations.working[data.instance].ports.comment" />
                        <port-field v-on:input="markDirty()" name="Start Port" description="The port range starting number." v-model.number="configurations.working[data.instance].ports.start" />
                        <port-field v-on:input="markDirty()" name="End Port" description="The port range ending number." v-model.number="configurations.working[data.instance].ports.end" />
                    </div>
                </div>
            </div>
            <div v-if="section === 'bridge'" class="panels">
                <div class="tabs">
                    <div class="spacer"></div>
                    <tab v-for="(item) in data.instances" :key="`instance_${item.key}`" v-on:activate="selectinstance(item.key)" :title="item.value" :active="item.key === data.instance" :dirty="flags.dirty.indexOf(item.key) >= 0" />
                    <div class="fill"></div>
                </div>
                <div class="flow">
                    <div class="form">
                        <text-field v-on:input="markDirty()" name="Bridge Name" description="Used to identify the bridge in Apple Home." v-model="configurations.working[data.instance].bridge.name" :required="true" />
                        <description-field v-on:input="markDirty()" name="Description" description="Used to identify the bridge on the device." v-model="configurations.working[data.instance].description" />
                        <port-field v-on:input="markDirty()" name="Bridge Port" description="This is the bridge communication port." v-model.number="configurations.working[data.instance].bridge.port" :required="true" />
                        <hex-field v-on:input="markDirty()" name="Unique Identifier" description="Unique identifier for this bridge." v-model="configurations.working[data.instance].bridge.username" :required="true" />
                        <text-field v-on:input="markDirty()" name="Apple Home PIN" description="The PIN used when adding HOOBS to Apple Home." v-model="configurations.working[data.instance].bridge.pin" :required="true" />
                    </div>
                </div>
            </div>
            <div v-if="section === 'advanced'" class="panels">
                <div class="tabs">
                    <div class="spacer"></div>
                    <tab v-for="(item) in data.instances" :key="`instance_${item.key}`" v-on:activate="selectinstance(item.key)" :title="item.value" :active="item.key === data.instance" :dirty="flags.dirty.indexOf(item.key) >= 0" />
                    <div class="fill"></div>
                </div>
                <div class="editor">
                    <monaco v-on:change="updateCode" :value="code" class="monaco" />
                </div>
            </div>
            <div v-for="(plugin) in data.plugins" :key="`plugin_${plugin.name}`" class="loop">
                <div v-if="section === plugin.name" class="panels">
                    <div class="tabs">
                        <div class="spacer"></div>
                        <tab v-for="(item) in data.instances" :key="`instance_${item.key}`" v-on:activate="selectinstance(item.key)" :title="item.value" :active="item.key === data.instance" :dirty="flags.dirty.indexOf(item.key) >= 0" />
                        <div class="fill"></div>
                    </div>
                    <div v-for="(instance) in data.instances" :key="`plugin_${plugin.name}_instance_${instance.key}`" class="loop">
                        <div v-if="instance.key === data.instance" class="flow">
                            <div class="form">
                                <plugin-config v-on:input="updateConfig" :plugin="plugin" :instance="instance.key" v-model="configurations.working[data.instance]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <loader v-else id="loader" value="Loading..." :initilized="true" />
        <modal v-if="confirm.save || confirm.refresh" v-on:cancel="discardChanges()" v-on:confirm="navigationCancel()" cancel-title="Discard" ok-title="Cancel" width="350px">
            <b>You have unsaved changes.</b>
            <p v-if="confirm.save">
                Are you sure you want to leave?
            </p>
            <p v-if="confirm.refresh">
                Are you sure you want to refresh?
            </p>
        </modal>
        <modal v-if="confirm.reboot" v-on:cancel="cancelReboot()" v-on:confirm="rebootDevice()" cancel-title="Cancel" ok-title="Reboot" width="450px">
            <b>You will need to reboot the device for these changes to take affect.</b>
            <p>
                Are you sure you want to reboot {{ data.reboot.length }} device(s)?
            </p>
        </modal>
        <modal v-if="confirm.errors" v-on:confirm="() => { confirm.errors = false }" :cancel-button="false" width="550px">
            <b>You have errors in your configuration.</b>
            <p class="errors">
                <span v-for="(error, index) in errors" :key="`error_${index}`">{{ error }}</span>
            </p>
        </modal>
    </div>
</template>

<script>
    import Decamelize from "decamelize";
    import Inflection from "inflection";

    import PluginConfig from "@/components/plugin-config.vue";
    import Tab from "@/components/tab.vue";

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
            "plugin-config": PluginConfig,
            "tab": Tab,
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
                confirm: {
                    save: false,
                    refresh: false,
                    reboot: false,
                    errors: false,
                    discard: false
                },
                show: {
                    loading: true,
                    mounting: true
                },
                devices: [],
                configurations: {
                    originl: {},
                    working: {}
                },
                flags: {
                    dirty: [],
                    reboot: []
                },
                data: {
                    plugins: {},
                    instances: [],
                    instance: "preferences",
                    reboot: [],
                    plugin: null
                },
                errors: [],
                url: null
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
            running() {
                return this.$store.state.running;
            },

            code() {
                return JSON.toString(this.configurations.working[this.data.instance]);         
            }
        },

        async mounted() {
            this.devices = this.Settings.get("devices");
            this.show.loading = true;

            this.loadPreferences();

            await this.loadConfig();
            await this.loadPlugins();

            this.loadInstances();

            this.show.loading = false;
        },

        created() {
            this.watcher = this.$store.subscribe((mutation) => {
                if (mutation.type === "saveChanges") {
                    this.saveChanges();
                }
            });
        },

        beforeDestroy() {
            if (this.watcher) {
                this.watcher();
            }
        },

        beforeRouteLeave (to, from, next) {
            if (this.flags.dirty.length === 0 || this.confirm.discard) {
                next();
            } else {
                this.url = to.path;
                this.confirm.save = true;

                next(false);
            }
        },

        watch: {
            section: async function () {
                this.loadInstances();
            } 
        },

        methods: {
            markDirty() {
                const keys = Object.keys(this.configurations.working);

                for (let i = 0; i < keys.length; i++) {
                    if (!this.configurations.originl[keys[i]] || !JSON.equals(this.configurations.working[keys[i]], this.configurations.originl[keys[i]])) {
                        if (this.flags.dirty.indexOf(keys[i]) === -1) {
                            this.flags.dirty.push(keys[i]);
                        }
                    } else {
                        const index = this.flags.dirty.indexOf(keys[i]);

                        if (index >= 0) {
                            this.flags.dirty.splice(index, 1);
                        }
                    }

                    if (keys[i] !== "preferences") {
                        if (!JSON.equals(this.configurations.working[keys[i]].server, this.configurations.originl[keys[i]].server)) {
                            if (this.flags.reboot.indexOf(keys[i]) === -1) {
                                this.flags.reboot.push(keys[i]);
                            }
                        } else {
                            const index = this.flags.reboot.indexOf(keys[i]);

                            if (index >= 0) {
                                this.flags.reboot.splice(index, 1);
                            }
                        }
                    }
                }
            },

            cancelReboot() {
                this.confirm.reboot = false;
                this.show.loading = false;
            },

            async rebootDevice() {
                this.confirm.reboot = false;
                this.show.loading = true;

                for (let i = 0; i < this.data.reboot.length; i++) {
                    await this.API.login(this.data.reboot[i].ip, this.data.reboot[i].port);
                    await this.API.post(this.data.reboot[i].ip, this.data.reboot[i].port, "/service/stop");
                    await this.API.put(this.data.reboot[i].ip, this.data.reboot[i].port, "/reboot");
                }

                setTimeout(async () => {
                    for (let i = 0; i < this.data.reboot.length; i++) {
                        this.Device.wait.start(this.data.reboot[i].ip, this.data.reboot[i].port, () => {
                            this.data.reboot.pop();

                            if (this.data.reboot.length === 0) {
                                this.refresh();
                            }
                        });
                    }
                }, 5000);
            },

            navigationCancel() {
                this.confirm.save = false;
                this.confirm.refresh = false;
            },

            discardChanges() {
                if (this.confirm.save && this.url) {
                    this.confirm.save = false;
                    this.confirm.discard = true;

                    this.$router.push({
                        path: this.url
                    });
                } else if (this.confirm.refresh) {
                    this.confirm.refresh = false;
                    this.confirm.discard = true;

                    this.refresh()
                } else {
                    this.confirm.save = false;
                    this.confirm.refresh = false;
                    this.confirm.discard = false;
                }
            },

            updateConfig(value) {
                this.configurations.working[this.data.instance] = value;

                this.markDirty();
            },

            updateCode(value) {
                this.configurations.working[this.data.instance] = JSON.tryParse(value, this.configurations.working[this.data.instance]);

                this.markDirty();
            },

            refresh() {
                if (this.flags.dirty.length === 0 || this.confirm.discard) {
                    (async () => {
                        this.show.loading = true;

                        this.loadPreferences();

                        await this.loadConfig();
                        await this.loadPlugins();

                        this.loadInstances();

                        this.show.loading = false;
                    })();
                } else {
                    this.confirm.refresh = true;
                }
            },

            loadPreferences() {
                const units = this.Settings.get("units") || {};
                const geolocation = this.Settings.get("geolocation") || {};

                this.configurations.working["preferences"] = {};

                this.configurations.working["preferences"].locale = this.Settings.get("locale") || "en";
                this.configurations.working["preferences"].tempUnits = units.temperature || "fahrenheit";
                this.configurations.working["preferences"].countryCode = geolocation.countryCode || "US";
                this.configurations.working["preferences"].postalCode = geolocation.postalCode || "94040";
                this.configurations.working["preferences"].latitude = geolocation.latitude || "";
                this.configurations.working["preferences"].longitude = geolocation.longitude || "";

                this.configurations.originl["preferences"] = JSON.clone(this.configurations.working["preferences"]);
            },

            async loadConfig() {
                for (let i = 0; i < this.devices.length; i++) {
                    const device = this.devices[i];
                    const instance = `${device.mac}:${device.port}`;

                    this.flags.dirty = [];

                    await this.API.login(device.ip, device.port);

                    this.configurations.working[instance] = await this.API.get(device.ip, device.port, "/config") || {};
                    this.configurations.originl[instance] = JSON.clone(this.configurations.working[instance]);
                }
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
                            index = plugins.length;
                            plugins.push(response[j]);
                        }

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
                this.data.instance = "preferences";

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
            },

            validateConfig(device) {
                if (device) {
                    const instance = `${device.mac}:${device.port}`;
                    const config = this.configurations.working[instance];

                    const results = {
                        server: config.server,
                        bridge: config.bridge,
                        description: config.description,
                        ports: config.ports,
                        accessories: config.accessories || [],
                        platforms: config.platforms || []
                    }

                    const messages = [];

                    if (!results.server.port || Number.isNaN(parseInt(results.server.port, 10)) || results.server.port < 1 || results.server.port > 65535) {
                        messages.push(`${device.hostname} - Invalid server port.`);
                    }

                    if (!results.server.polling_seconds || results.server.polling_seconds < 1 || results.server.polling_seconds > 1800) {
                        messages.push(`${device.hostname} - Invalid refresh interval.`);
                    }

                    if (!results.bridge.name || results.bridge.name === "") {
                        messages.push(`${device.hostname} - Apple Home bridge name is required.`);
                    }

                    if (!results.bridge.port || Number.isNaN(parseInt(results.bridge.port, 10)) || results.bridge.port < 1 || results.bridge.port > 65535) {
                        messages.push(`${device.hostname} - Invalid Apple Home bridge port.`);
                    }

                    if (!results.bridge.username || results.bridge.username === "") {
                        messages.push(`${device.hostname} - Apple Home unique identifier is required.`);
                    }

                    if (!results.bridge.pin || results.bridge.pin === "") {
                        messages.push(`${device.hostname} - Apple Home PIN is required.`);
                    }

                    if (results.ports && (!Number.isNaN(parseInt(results.ports.start)) || !Number.isNaN(parseInt(results.ports.end)))) {
                        if (Number.isNaN(parseInt(results.ports.start, 10)) || results.ports.start < 1 || results.ports.start > 65535) {
                            messages.push(`${device.hostname} - Invalid start port.`);
                        }

                        if (Number.isNaN(parseInt(results.ports.end, 10)) || results.ports.end < 1 || results.ports.end > 65535) {
                            messages.push(`${device.hostname} - Invalid end port.`);
                        }

                        if (!Number.isNaN(parseInt(results.ports.start, 10)) && !Number.isNaN(parseInt(results.ports.end, 10)) && results.ports.start > results.ports.end) {
                            messages.push(`${device.hostname} - The start port must be lower than or equal to the end port.`);
                        }
                    } else {
                        results.ports = {};
                    }

                    if (messages.length === 0) {
                        return results;
                    } else {
                        for (let i = 0; i < messages.length; i++) {
                            if (this.errors.indexOf(messages[i]) === -1) {
                                this.errors.push(messages[i]);
                            }
                        }
                    }
                }

                return null;
            },

            async saveChanges() {
                this.errors = [];
                this.data.reboot = [];

                if (this.flags.dirty.length > 0) {
                    this.show.loading = true;

                    const jobs = [];

                    for (let i = 0; i < this.flags.dirty.length; i++) {
                        if (this.flags.dirty[i] === "preferences") {
                            let locale = this.Settings.get("locale") || "en";
                            let units = this.Settings.get("units") || {};
                            let geolocation = this.Settings.get("geolocation") || {};

                            locale = this.configurations.working["preferences"].locale;
                            units.temperature = this.configurations.working["preferences"].tempUnits;
                            geolocation.countryCode = this.configurations.working["preferences"].countryCode;
                            geolocation.postalCode = this.configurations.working["preferences"].postalCode;
                            geolocation.latitude = this.configurations.working["preferences"].latitude;
                            geolocation.longitude = this.configurations.working["preferences"].longitude;

                            this.Settings.set("locale", locale);
                            this.Settings.set("units", units);
                            this.Settings.set("geolocation", geolocation);
                        } else {
                            const device = this.devices.filter(d => this.flags.dirty[i] === `${d.mac}:${d.port}`)[0];
                            const config = this.validateConfig(device);

                            if (device && config) {
                                jobs.push({
                                    device,
                                    config
                                });
                            }
                        }
                    }

                    if (this.errors.length === 0) {
                        for (let i = 0; i < jobs.length; i++) {
                            const job = jobs[i];

                            await this.API.login(job.device.ip, job.device.port);

                            await this.API.post(job.device.ip, job.device.port, "/config", {
                                server: job.config.server,
                                bridge: job.config.bridge,
                                description: job.config.description,
                                ports: job.config.ports,
                                accessories: job.config.accessories || [],
                                platforms: job.config.platforms || []
                            });

                            if (this.flags.reboot.indexOf(this.flags.dirty[i]) > -1) {
                                this.data.reboot.push(job.device);
                            } else {
                                if (this.running) {
                                    await this.API.post(job.device.ip, job.device.port, "/service/restart");
                                } else {
                                    await this.API.post(job.device.ip, job.device.port, "/service/start");
                                }
                            }
                        }

                        this.flags.dirty = [];
                        this.flags.reboot = [];
                        this.errors = [];

                        if (this.data.reboot.length > 0) {
                            this.confirm.reboot = true;
                        } else {
                            this.refresh();
                        }
                    } else {
                        this.show.loading = false;
                        this.confirm.errors = true;
                    }
                }
            }
        }
    };
</script>

<style scoped>
    #config {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    #config .loaded {
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

    #config .loop {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    #config .loop:empty {
        display: none;
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

    #config .monaco-loader {
        width: 5px;
        height: 5px;
        position: absolute;
        bottom: 0;
        right: 0;
        opacity: 0;
    }

    #config .editor .monaco {
        width: 100%;
        height: 100%;
    }

    #config .errors {
        display: flex;
        flex-direction: column;
    }

    #loader {
        margin: 7em auto;
        width: 350px;
    }
</style>
