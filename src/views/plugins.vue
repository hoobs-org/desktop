<template>
    <div v-if="connected > 0" id="plugins">
        <div class="tabs">
            <div class="spacer"></div>
            <tab :title="$t('browse_packages')" v-on:activate="navigate('browse')" :active="section === 'browse'" />
            <tab v-for="(device) in devices" :key="`device-${device.mac}:${device.port}`" :title="device.hostname" v-on:activate="navigate(`${device.mac}:${device.port}`)" :active="section === `${device.mac}:${device.port}`" />
            <div class="fill"></div>
        </div>
        <div class="layout">
            <div class="list">
                <div v-if="section === 'browse'">
                    <div class="search">
                        <div class="icon">search</div>
                        <input v-on:input="debounceSearch" type="text" placeholder="Search" onfocus="this.placeholder = ''" onblur="this.placeholder = 'Search'" />
                    </div>
                </div>
                <div class="results">
                    <plugin-item v-for="(plugin) in data.installed" :key="`installed_${plugin.scope || ''}_${plugin.name}`" v-on:select="displayPlugin(plugin)" :value="plugin" class="item" />
                    <plugin-item v-for="(plugin) in data.results" :key="`search_${plugin.scope || ''}_${plugin.name}`" v-on:select="displayPlugin(plugin)" :value="plugin" class="item" />
                </div>
            </div>
            <div ref="details" class="details">
                <div v-if="plugin" class="control">
                    <span class="title">{{ pluginTitle(plugin) }}</span>
                    <span v-if="plugin.installed" class="version">{{ versionCompare(plugin.installed, plugin.version) ? `${plugin.installed} - Published ${new Date(plugin.date.replace(/\s/, "T")).date}` : `${plugin.installed} - ${plugin.version} Update Available` }}</span>
                    <span v-else class="version">{{ plugin.version }} - Published {{ new Date(plugin.date.replace(/\s/, "T")).date }}</span>
                    <span v-if="plugin.certified" class="version">HOOBS Certified</span>
                    <div v-if="!show.working" class="actions">
                        <div v-if="plugin.installed && plugin.versions">
                            <div v-if="!versionCompare(plugin.installed, plugin.version)" class="button button-primary dropdown">
                                <div v-on:click="updatePlugin(device, plugin)" class="text">Update</div>
                                <div v-on:click.stop="$store.commit('toggleMenu', 'version')" class="icon">arrow_drop_down</div>
                            </div>
                            <div v-else class="button dropdown">
                                <div class="text">{{ plugin.installed }}</div>
                                <div v-on:click.stop="$store.commit('toggleMenu', 'version')" class="icon">arrow_drop_down</div>
                            </div>
                        </div>
                        <div v-else-if="plugin.installed">
                            <div v-if="!versionCompare(plugin.installed, plugin.version)" v-on:click="updatePlugin(device, plugin)" class="button button-primary">Update</div>
                        </div>
                        <div v-else-if="plugin.versions">
                            <div class="button button-primary dropdown">
                                <div class="text">Install</div>
                                <div v-on:click.stop="$store.commit('toggleMenu', 'version')" class="icon">arrow_drop_down</div>
                            </div>
                        </div>
                        <div v-else>
                            <div class="button button-primary">Install</div>
                        </div>
                        <confirm v-if="plugin.installed" value="Uninstall" v-on:confirm="uninstallPlugin(device, plugin)" />
                        <div v-on:click="$browse(`https://www.npmjs.com/package/${plugin.scope ? `@${plugin.scope}/${plugin.name}` : plugin.name}`)" class="link">NPM</div>
                        <div class="seperator">|</div>
                        <div v-if="plugin.homepage" v-on:click="$browse(plugin.homepage)" class="link">Details</div>
                        <dropdown v-if="plugin.installed && plugin.versions && menus['version']" class="version-menu">
                            <div v-for="(version) in pluginVersions(plugin)" :key="`plugin_version_${plugin.scope || ''}_${plugin.name}_${version}`" v-on:click="installPlugin(device, plugin, version)" class="item">{{ version }}</div>
                        </dropdown>
                        <dropdown v-else-if="plugin.versions && menus['version']" class="version-menu">
                            <div v-for="(version) in pluginVersions(plugin)" :key="`plugin_version_${plugin.scope || ''}_${plugin.name}_${version}`" class="item">{{ version }}</div>
                        </dropdown>
                    </div>
                    <div v-else class="working">
                        <marquee :height="3" color="#feb400" background="#856a3b" />
                    </div>
                </div>
                <div v-if="plugin">
                    <div class="detail-version">{{ plugin.version }} - Published {{ new Date(plugin.date.replace(/\s/, "T")).age }}</div>
                    <div id="markdown" v-html="processMarkdown(plugin.description_details || plugin.description)"></div>
                    <div v-if="plugin.node" class="node-version">Node {{ plugin.node }} required.</div>
                    <div v-if="plugin.stats" class="description">
                        Downloads the week: {{ plugin.stats.week.downloads }}
                        <br>
                        Downloads the month: {{ plugin.stats.month.downloads }}
                    </div>
                </div>
                <loader v-else-if="show.loading" class="loader" :value="`${$t('loading')}...`" />
            </div>
        </div>
    </div>
    <loader v-else id="loader" :value="`${$t('connecting')}...`" />
</template>

<script>
    import _ from "lodash";

    import Semver from "compare-versions";
    import Showdown from "showdown";
    import Decamelize from "decamelize";
    import Inflection from "inflection";

    import Tab from "@/components/tab.vue";
    import PluginItem from "@/components/plugin-item.vue"

    export default {
        name: "plugins",

        components: {
            "tab": Tab,
            "plugin-item": PluginItem
        },

        props: {
            section: String
        },

        data() {
            return {
                active: [],
                devices: [],
                device: null,
                latest: null,
                plugin: null,
                query: "",
                show: {
                    working: false,
                    loading: false
                },
                data: {
                    installed: [],
                    results: []
                }
            }
        },

        computed: {
            menus() {
                return this.$store.state.menus;
            },

            connected() {
                return this.$store.state.connected;
            }
        },

        async mounted() {
            this.devices = this.Settings.get("devices");

            for (let i = 0; i < this.devices.length; i++) {
                await this.API.login(this.devices[i].ip, this.devices[i].port);

                this.devices[i].version = (await this.API.get(this.devices[i].ip, this.devices[i].port, "/status")).hoobs_version;
            }

            const devices = JSON.clone(this.devices);

            devices.sort((a, b) => this.versionCompare(b.version, a.version) ? 1 : -1);

            this.latest = devices[0];

            await this.loadPlugins();
        },

        watch: {
            section: async function () {
                this.query = "";
                this.show.working = false;

                await this.loadPlugins();

                if (this.device && this.plugin && this.active.indexOf(`${this.device.mac}:${this.device.port}_@${this.plugin.scope || "unscoped"}/${this.plugin.name}`) >= 0) {
                    this.show.working = true;
                }
            },

            plugin: function () {
                this.show.working = false;

                if (this.device && this.plugin && this.active.indexOf(`${this.device.mac}:${this.device.port}_@${this.plugin.scope || "unscoped"}/${this.plugin.name}`) >= 0) {
                    this.show.working = true;
                }
            },

            active: function () {
                this.show.working = false;

                if (this.device && this.plugin && this.active.indexOf(`${this.device.mac}:${this.device.port}_@${this.plugin.scope || "unscoped"}/${this.plugin.name}`) >= 0) {
                    this.show.working = true;
                }
            },

            query: function () {
                if (!this.device) {
                    this.searchPlugins();
                }
            }
        },

        methods: {
            versionCompare(current, latest) {
                return Semver.compare(current, latest, ">=");
            },

            navigate(section) {
                this.$router.push({
                    path: `/plugins/${section}`
                });
            },

            processMarkdown(value) {
                return new Showdown.Converter({
                    tables: true
                }).makeHtml(value);
            },

            async loadPlugins() {
                this.device = null;
                this.plugin = null;
                this.active = [];

                this.query = "";

                this.data.installed = [];
                this.data.results = [];

                switch (this.section) {
                    case "browse":
                        await this.searchPlugins();
                        break;

                    default:
                        this.device = this.devices.filter(d => (`${d.mac}:${d.port}`) === this.section)[0];

                        if (this.device) {
                            this.show.loading = true;

                            await this.API.login(this.device.ip, this.device.port);

                            const plugins = await this.API.get(this.device.ip, this.device.port, "/plugins");

                            if (plugins) {
                                for(let j = 0; j < plugins.length; j++) {
                                    const plugin = plugins[j];

                                    this.data.installed.push(_.assign(plugin, {
                                        instance: `${this.device.mac}:${this.device.port}`
                                    }));
                                }
                            }

                            this.show.loading = false;
                        }

                        this.data.installed.sort((a, b) => (a.name.replace("homebridge-", "") > b.name.replace("homebridge-", "")) ? 1 : -1);
                        break
                }
            },

            async displayPlugin(plugin) {
                const id = plugin.scope ? `@${plugin.scope}/${plugin.name}` : plugin.name;

                this.plugin = null;
                this.show.loading = true;

                if (this.device) {
                    await this.API.login(this.device.ip, this.device.port);

                    this.plugin = await this.API.get(this.device.ip, this.device.port, `/plugins/${encodeURIComponent(id)}`);
                } else if (this.latest) {
                    await this.API.login(this.latest.ip, this.latest.port);

                    this.plugin = await this.API.get(this.latest.ip, this.latest.port, `/plugins/${encodeURIComponent(id)}`);
                }

                this.show.loading = false;

                this.$refs.details.scrollTo(0, 0);
            },

            markWorking(device, plugin) {
                if (this.active.indexOf(`${device.mac}:${device.port}_@${plugin.scope || "unscoped"}/${plugin.name}`) === -1) {
                    this.active.push(`${device.mac}:${device.port}_@${plugin.scope || "unscoped"}/${plugin.name}`)
                }
            },

            markNotWorking(device, plugin) {
                const index = this.active.indexOf(`${device.mac}:${device.port}_@${plugin.scope || "unscoped"}/${plugin.name}`);

                if (index >= 0) {
                    this.active.splice(index, 1);
                }
            },

            pluginVersions(plugin) {
                return _.keys(plugin.versions).reverse();
            },

            debounceSearch: _.debounce(function (event) {
                this.query = event.target.value;
            }, 250),

            async searchPlugins() {
                await this.API.login(this.latest.ip, this.latest.port);

                if (this.query.length >= 1) {
                    this.data.results = await this.API.post(this.latest.ip, this.latest.port, `/plugins/${encodeURIComponent(this.query)}/50`);
                } else {
                    this.data.results = await this.API.post(this.latest.ip, this.latest.port, "/plugins/recommended/7");
                }
            },

            async installPlugin(device, plugin, version) {
                this.markWorking(device, plugin);

                const running = this.$store.state.running[`${device.ip}:${device.port}`];

                await this.API.login(device.ip, device.port);

                if (running) {
                    await this.API.post(device.ip, device.port, "/service/stop");
                }

                await this.API.put(device.ip, device.port, `/plugins/${encodeURIComponent(`${plugin.scope ? `@${plugin.scope}/${plugin.name}` : plugin.name}@${version || "latest"}`)}`);

                if (running) {
                    await this.API.post(device.ip, device.port, "/service/start");
                }

                this.markNotWorking(device, plugin);

                await this.displayPlugin(plugin);
            },

            async updatePlugin(device, plugin) {
                this.markWorking(device, plugin);

                const running = this.$store.state.running[`${device.ip}:${device.port}`];

                await this.API.login(device.ip, device.port);

                if (running) {
                    await this.API.post(device.ip, device.port, "/service/stop");
                }

                await this.API.post(device.ip, device.port, `/plugins/${encodeURIComponent(`${plugin.scope ? `@${plugin.scope}/${plugin.name}` : plugin.name}@latest`)}`);

                if (running) {
                    await this.API.post(device.ip, device.port, "/service/start");
                }

                this.markNotWorking(device, plugin);

                await this.displayPlugin(plugin);
            },

            async uninstallPlugin(device, plugin) {
                this.markWorking(device, plugin);

                const running = this.$store.state.running[`${device.ip}:${device.port}`];

                await this.API.login(device.ip, device.port);

                if (running) {
                    await this.API.post(device.ip, device.port, "/service/stop");
                }

                await this.API.delete(device.ip, device.port, `/plugins/${encodeURIComponent(`${plugin.scope ? `@${plugin.scope}/${plugin.name}` : plugin.name}`)}`);

                if (running) {
                    await this.API.post(device.ip, device.port, "/service/start");
                }

                this.markNotWorking(device, plugin);

                await this.loadPlugins();
            },

            pluginTitle(plugin) {
                if (plugin.name === "google-home" || plugin.name === "homebridge-gsh") {
                    return "Google Home";
                }

                let value = (((plugin.schema || {}).platform || {}).plugin_alias || ((plugin.schema || {}).accessories || {}).plugin_alias || plugin.name || "Unknown Plugin").split(".")[0];

                value = Inflection.titleize(Decamelize(value.replace(/-/gi, " ").replace(/homebridge/gi, "").trim()));

                value = value.replace(/smart things/gi, "SmartThings");
                value = value.replace(/smartthings/gi, "SmartThings");
                value = value.replace(/my q/gi, "myQ");
                value = value.replace(/myq/gi, "myQ");
                value = value.replace(/wink2/gi, "Wink");
                value = value.replace(/winkv2/gi, "Wink");
                value = value.replace(/wink3/gi, "Wink");
                value = value.replace(/winkv3/gi, "Wink");
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
    #plugins {
        flex: 1;
        display: flex;
        flex-direction: column;
        margin: 0 20px 20px 0;
        padding: 0 0 0 7px;
        overflow: hidden;
    }

    #plugins .tabs {
        height: 24px;
        display: flex;
        flex-direction: row;
        padding: 0 0 7px 0;
        overflow-x: auto;
        overflow-y: hidden;
    }

    #plugins .tabs::-webkit-scrollbar {
        display: none;
    }

    #plugins .tabs .fill {
        flex: 1;
        height: 30px;
        min-width: 20px;
        border-bottom: 1px #424242 solid;
    }

    #plugins .tabs .spacer {
        height: 30px;
        width: 10px;
        border-bottom: 1px #424242 solid;
    }

    #plugins .layout {
        flex: 1;
        display: flex;
        flex-direction: row;
        overflow: hidden;
    }

    #plugins .layout .list {
        width: 30%;
        height: 100%;
        min-width: 300px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    #plugins .layout .list .search {
        display: flex;
        flex-direction: row;
        align-content: center;
        align-items: center;
        padding: 0 7px;
        border-width: 0 0 1px 0;
        border-style: solid;
        border-color: #424242;
    }

    #plugins .layout .list .search:focus-within {
        border-color: #feb400;
    }

    #plugins .layout .list .search .icon {
        font-size: 18px;
    }

    #plugins .layout .list .search input {
        flex: 1;
        box-sizing: border-box;
        padding: 0;
        margin: 14px 0 14px 7px;
        font-size: 14px;
        background: transparent;
        color: #fff;
        border: 0 none;
    }

    #plugins .layout .list .search input:focus {
        outline: 0 none;
    }

    #plugins .layout .list .results {
        flex: 1;
        overflow: auto;
        text-align: left;
    }

    #plugins .layout .details {
        flex: 1;
        height: 100%;
        padding: 20px 3px 0 20px;
        text-align: left;
        overflow: auto;
    }

    #plugins .layout .details .loader {
        margin: 5em auto;
        padding: 0 4em 0 0;
        width: 300px;
    }

    #plugins .layout .details .stats {
        margin: 20px 0 0 0;
        font-size: 17px;
    }

    #plugins .layout .details .node-version {
        margin: 20px 0 10px 0;
        padding: 10px 0;
        font-size: 17px;
        border-top: 1px #424242 solid;
        border-bottom: 1px #424242 solid;
    }

    #plugins .layout .details .detail-version {
        margin: 20px 0 10px 0;
        padding: 0 0 10px 0;
        border-bottom: 1px #424242 solid;
        font-size: 14px;
    }

    #plugins .layout .details::-webkit-scrollbar {
        display: none;
    }

    #plugins .layout .details .control {
        padding: 20px;
        margin: 0 0 20px 0;
        background: #262626;
        box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.24),
                    0 2px 1px -1px rgba(0, 0, 0, 0.22),
                    0 1px 3px 2px rgba(0, 0, 0, 0.3);
        border-radius: 3px;
        display: flex;
        flex-direction: column;
        color: #999 !important;
        text-decoration: none;
    }

    #plugins .layout .details .control .title {
        font-size: 20px;
        color: #feb400;
    }

    #plugins .layout .details .control .version {
        font-size: 13px;
    }

    #plugins .layout .details .control .actions {
        display: flex;
        position: relative;
        flex-direction: row;
        justify-content: flex-start;
        align-content: center;
        align-items: center;
        margin: 0 0 0 -10px;
        padding: 10px 0 0 0;
    }

    #plugins .layout .details .control .actions .version-menu {
        position: absolute;
        top: 50px;
        left: 10px;
        min-width: 100px;
        z-index: 300;
    }

    #plugins .layout .details .control .actions .button {
        margin: 0 0 0 10px;
    }

    #plugins .layout .details .control .actions .link {
        margin: 0 0 0 10px;
        cursor: pointer;
    }

    #plugins .layout .details .control .actions .link:hover {
        text-decoration: underline;
    }

    #plugins .layout .details .control .actions .seperator {
        margin: 0 0 0 10px;
        color: #424242;
    }

    #plugins .layout .details .control .working {
        margin: 10px 0 0 0;
    }

    #loader {
        margin: 7em auto;
        width: 350px;
    }
</style>

<style>
    #markdown {
        margin: 10px 0 0 0;
        font-size: 17px;
    }

    #markdown .pl-c {
        color: #6a737d;
    }

    #markdown .pl-c1,
    #markdown .pl-s .pl-v {
        color: #005cc5;
    }

    #markdown .pl-e,
    #markdown .pl-en {
        color: #6f42c1;
    }

    #markdown .pl-smi,
    #markdown .pl-s .pl-s1 {
        color: #24292e;
    }

    #markdown .pl-ent {
        color: #22863a;
    }

    #markdown .pl-k {
        color: #d73a49;
    }

    #markdown .pl-s,
    #markdown .pl-pds,
    #markdown .pl-s .pl-pse .pl-s1,
    #markdown .pl-sr,
    #markdown .pl-sr .pl-cce,
    #markdown .pl-sr .pl-sre,
    #markdown .pl-sr .pl-sra {
        color: #032f62;
    }

    #markdown .pl-v,
    #markdown .pl-smw {
        color: #e36209;
    }

    #markdown .pl-bu {
        color: #b31d28;
    }

    #markdown .pl-ii {
        color: #fafbfc;
        background-color: #b31d28;
    }

    #markdown .pl-c2 {
        color: #fafbfc;
        background-color: #d73a49;
    }

    #markdown .pl-c2::before {
        content: "^M";
    }

    #markdown .pl-sr .pl-cce {
        font-weight: bold;
        color: #22863a;
    }

    #markdown .pl-ml {
        color: #735c0f;
    }

    #markdown .pl-mh,
    #markdown .pl-mh .pl-en,
    #markdown .pl-ms {
        font-weight: bold;
        color: #005cc5;
    }

    #markdown .pl-mi {
        font-style: italic;
        color: #24292e;
    }

    #markdown .pl-mb {
        font-weight: bold;
        color: #24292e;
    }

    #markdown .pl-md {
        color: #b31d28;
        background-color: #ffeef0;
    }

    #markdown .pl-mi1 {
        color: #22863a;
        background-color: #f0fff4;
    }

    #markdown .pl-mc {
        color: #e36209;
        background-color: #ffebda;
    }

    #markdown .pl-mi2 {
        color: #f6f8fa;
        background-color: #005cc5;
    }

    #markdown .pl-mdr {
        font-weight: bold;
        color: #6f42c1;
    }

    #markdown .pl-ba {
        color: #586069;
    }

    #markdown .pl-sg {
        color: #959da5;
    }

    #markdown .pl-corl {
        text-decoration: underline;
        color: #032f62;
    }

    #markdown .octicon {
        display: inline-block;
        vertical-align: text-top;
        fill: currentColor;
    }

    #markdown a {
        background-color: transparent;
    }

    #markdown a:active,
    #markdown a:hover {
        outline-width: 0;
    }

    #markdown strong {
        font-weight: inherit;
    }

    #markdown strong {
        font-weight: bolder;
    }

    #markdown h1 {
        margin: 0.67em 0;
    }

    #markdown img {
        border-style: none;
    }

    #markdown code,
    #markdown kbd,
    #markdown pre {
        font-family: monospace, monospace;
        font-size: 1em;
    }

    #markdown hr {
        box-sizing: content-box;
        height: 0;
        overflow: visible;
    }

    #markdown input {
        font: inherit;
        margin: 0;
    }

    #markdown input {
        overflow: visible;
    }

    #markdown [type="checkbox"] {
        box-sizing: border-box;
        padding: 0;
    }

    #markdown * {
        box-sizing: border-box;
    }

    #markdown input {
        font-family: inherit;
        font-size: inherit;
        line-height: inherit;
    }

    #markdown a {
        color: #0366d6;
        text-decoration: none;
    }

    #markdown a:hover {
        text-decoration: underline;
    }

    #markdown strong {
        font-weight: 600;
    }

    #markdown hr {
        height: 0;
        margin: 15px 0;
        overflow: hidden;
        background: transparent;
        border: 0;
        border-bottom: 1px #424242 solid;
    }

    #markdown hr::before {
        display: table;
        content: "";
    }

    #markdown hr::after {
        display: table;
        clear: both;
        content: "";
    }

    #markdown table {
        border-spacing: 0;
        border-collapse: collapse;
    }

    #markdown table th {
        padding: 10px;
        text-align: left;
        border-bottom: 1px #000 solid;
        color: #feb400;
    }

    #markdown table td {
        padding: 10px;
        background-color: #262626;
        border-bottom: 1px #424242 solid;
    }

    #markdown h1,
    #markdown h2,
    #markdown h3,
    #markdown h4,
    #markdown h5,
    #markdown h6 {
        margin-top: 0;
        margin-bottom: 0;
    }

    #markdown h1 {
        font-size: 24px;
        color: #feb400;
        font-weight: 600;
    }

    #markdown h2 {
        font-size: 20px;
        font-weight: 600;
    }

    #markdown h3 {
        font-size: 18px;
        font-weight: 600;
    }

    #markdown h4,
    #markdown h5,
    #markdown h6 {
        font-size: 14px;
        font-weight: 600;
    }

    #markdown p {
        margin-top: 0;
        margin-bottom: 10px;
    }

    #markdown blockquote {
        margin: 0;
    }

    #markdown ul,
    #markdown ol {
        padding-left: 0;
        margin-top: 0;
        margin-bottom: 0;
    }

    #markdown ol ol,
    #markdown ul ol {
        list-style-type: lower-roman;
    }

    #markdown ul ul ol,
    #markdown ul ol ol,
    #markdown ol ul ol,
    #markdown ol ol ol {
        list-style-type: lower-alpha;
    }

    #markdown dd {
        margin-left: 0;
    }

    #markdown code {
        font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier,
            monospace;
        font-size: 12px;
    }

    #markdown pre {
        margin-top: 0;
        margin-bottom: 0;
        font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier,
            monospace;
        font-size: 12px;
    }

    #markdown .octicon {
        vertical-align: text-bottom;
    }

    #markdown .pl-0 {
        padding-left: 0 !important;
    }

    #markdown .pl-1 {
        padding-left: 4px !important;
    }

    #markdown .pl-2 {
        padding-left: 8px !important;
    }

    #markdown .pl-3 {
        padding-left: 16px !important;
    }

    #markdown .pl-4 {
        padding-left: 24px !important;
    }

    #markdown .pl-5 {
        padding-left: 32px !important;
    }

    #markdown .pl-6 {
        padding-left: 40px !important;
    }

    #markdown::before {
        display: table;
        content: "";
    }

    #markdown::after {
        display: table;
        clear: both;
        content: "";
    }

    #markdown > *:first-child {
        margin-top: 0 !important;
    }

    #markdown > *:last-child {
        margin-bottom: 0 !important;
    }

    #markdown a:not([href]) {
        color: inherit;
        text-decoration: none;
    }

    #markdown .anchor {
        float: left;
        padding-right: 4px;
        margin-left: -20px;
        line-height: 1;
    }

    #markdown .anchor:focus {
        outline: none;
    }

    #markdown p,
    #markdown blockquote,
    #markdown ul,
    #markdown ol,
    #markdown dl,
    #markdown table,
    #markdown pre {
        margin-top: 0;
        margin-bottom: 16px;
    }

    #markdown hr {
        height: 1px;
        padding: 0;
        margin: 24px 0;
        background-color: #424242;
        border: 0;
    }

    #markdown blockquote {
        padding: 0 1em;
        color: #424242;
        border-left: 0.25em #424242 solid;
    }

    #markdown blockquote > :first-child {
        margin-top: 0;
    }

    #markdown blockquote > :last-child {
        margin-bottom: 0;
    }

    #markdown kbd {
        display: inline-block;
        padding: 3px 5px;
        font-size: 11px;
        line-height: 10px;
        color: #444d56;
        vertical-align: middle;
        background-color: #fafbfc;
        border: solid 1px #c6cbd1;
        border-bottom-color: #959da5;
        border-radius: 3px;
        box-shadow: inset 0 -1px 0 #959da5;
    }

    #markdown h1,
    #markdown h2,
    #markdown h3,
    #markdown h4,
    #markdown h5,
    #markdown h6 {
        margin-top: 24px;
        margin-bottom: 16px;
        font-weight: 600;
        line-height: 1.25;
    }

    #markdown h1 .octicon-link,
    #markdown h2 .octicon-link,
    #markdown h3 .octicon-link,
    #markdown h4 .octicon-link,
    #markdown h5 .octicon-link,
    #markdown h6 .octicon-link {
        color: #1b1f23;
        vertical-align: middle;
        visibility: hidden;
    }

    #markdown h1:hover .anchor,
    #markdown h2:hover .anchor,
    #markdown h3:hover .anchor,
    #markdown h4:hover .anchor,
    #markdown h5:hover .anchor,
    #markdown h6:hover .anchor {
        text-decoration: none;
    }

    #markdown h1:hover .anchor .octicon-link,
    #markdown h2:hover .anchor .octicon-link,
    #markdown h3:hover .anchor .octicon-link,
    #markdown h4:hover .anchor .octicon-link,
    #markdown h5:hover .anchor .octicon-link,
    #markdown h6:hover .anchor .octicon-link {
        visibility: visible;
    }

    #markdown h1 {
        padding-bottom: 0.3em;
        border-bottom: 1px #424242 solid;
    }

    #markdown h2 {
        padding-bottom: 0.3em;
        border-bottom: 1px #424242 solid;
    }

    #markdown ul,
    #markdown ol {
        padding-left: 2em;
    }

    #markdown ul ul,
    #markdown ul ol,
    #markdown ol ol,
    #markdown ol ul {
        margin-top: 0;
        margin-bottom: 0;
    }

    #markdown li {
        word-wrap: break-all;
    }

    #markdown li > p {
        margin-top: 16px;
    }

    #markdown li + li {
        margin-top: 0.25em;
    }

    #markdown dl {
        padding: 0;
    }

    #markdown dl dt {
        padding: 0;
        margin-top: 16px;
        font-size: 1em;
        font-style: italic;
        font-weight: 600;
    }

    #markdown dl dd {
        padding: 0 16px;
        margin-bottom: 16px;
    }

    #markdown table {
        width: 100%;
        overflow: auto;
    }

    #markdown table th {
        font-weight: 600;
    }

    #markdown table th,
    #markdown table td {
        padding: 6px 13px;
    }

    #markdown table tr {
        background-color: #262626;
    }

    #markdown table tr:nth-child(2n) {
        background-color: #262626;
    }

    #markdown img {
        max-width: 100%;
        box-sizing: content-box;
        background-color: #262626;
    }

    #markdown img[align="right"] {
        padding-left: 20px;
    }

    #markdown img[align="left"] {
        padding-right: 20px;
    }

    #markdown code {
        padding: 0.2em 0.4em;
        margin: 0;
        font-size: 85%;
        background-color: rgba(27, 31, 35, 0.05);
        border-radius: 3px;
    }

    #markdown pre {
        word-wrap: normal;
    }

    #markdown pre > code {
        padding: 0;
        margin: 0;
        font-size: 100%;
        word-break: normal;
        white-space: pre;
        background: transparent;
        border: 0;
    }

    #markdown .highlight {
        margin-bottom: 16px;
    }

    #markdown .highlight pre {
        margin-bottom: 0;
        word-break: normal;
    }

    #markdown .highlight pre,
    #markdown pre {
        padding: 16px;
        overflow: auto;
        font-size: 85%;
        line-height: 1.45;
        background-color: #444;
        border-radius: 3px;
    }

    #markdown pre code {
        display: inline;
        max-width: auto;
        padding: 0;
        margin: 0;
        overflow: visible;
        line-height: inherit;
        word-wrap: normal;
        background-color: transparent;
        border: 0;
    }

    #markdown .full-commit .btn-outline:not(:disabled):hover {
        color: #005cc5;
        border-color: #005cc5;
    }

    #markdown kbd {
        display: inline-block;
        padding: 3px 5px;
        font: 11px "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier,
            monospace;
        line-height: 10px;
        color: #444d56;
        vertical-align: middle;
        background-color: #fafbfc;
        border: solid 1px #d1d5da;
        border-bottom-color: #c6cbd1;
        border-radius: 3px;
        box-shadow: inset 0 -1px 0 #c6cbd1;
    }

    #markdown :checked + .radio-label {
        position: relative;
        z-index: 1;
        border-color: #0366d6;
    }

    #markdown .task-list-item {
        list-style-type: none;
    }

    #markdown .task-list-item + .task-list-item {
        margin-top: 3px;
    }

    #markdown .task-list-item input {
        margin: 0 0.2em 0.25em -1.6em;
        vertical-align: middle;
    }

    #markdown hr {
        border-bottom-color: #424242;
    }

    #markdown .token.comment,
    #markdown .token.prolog,
    #markdown .token.doctype,
    #markdown .token.cdata {
        color: #008000;
        font-style: italic;
    }

    #markdown .token.namespace {
        opacity: 0.7;
    }

    #markdown .token.string {
        color: #a31515;
    }

    #markdown .token.punctuation,
    #markdown .token.operator {
        color: #393a34;
    }

    #markdown .token.url,
    #markdown .token.symbol,
    #markdown .token.number,
    #markdown .token.boolean,
    #markdown .token.variable,
    #markdown .token.constant,
    #markdown .token.inserted {
        color: #36acaa;
    }

    #markdown .token.atrule,
    #markdown .token.keyword,
    #markdown .token.attr-value,
    #markdown .language-autohotkey .token.selector,
    #markdown .language-json .token.boolean,
    #markdown .language-json .token.number,
    #markdown code[class*="language-css"] {
        color: #0000ff;
    }

    #markdown .token.function {
        color: #393a34;
    }

    #markdown .token.deleted,
    #markdown .language-autohotkey .token.tag {
        color: #9a050f;
    }

    #markdown .token.selector,
    #markdown .language-autohotkey .token.keyword {
        color: #00009f;
    }

    #markdown .token.important,
    #markdown .token.bold {
        font-weight: bold;
    }

    #markdown .token.italic {
        font-style: italic;
    }

    #markdown .token.class-name,
    #markdown .language-json .token.property {
        color: #2b91af;
    }

    #markdown .token.tag,
    #markdown .token.selector {
        color: #800000;
    }

    #markdown .token.attr-name,
    #markdown .token.property,
    #markdown .token.regex,
    #markdown .token.entity {
        color: #ff0000;
    }

    #markdown .token.directive.tag .tag {
        background: #ffff00;
        color: #393a34;
    }
</style>
