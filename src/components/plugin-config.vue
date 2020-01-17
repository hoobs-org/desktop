<template>
    <div :key="`config_${instance}_${plugin.name}`" id="plugin-config">
        <p v-if="type.platform && plugin.name === 'google-home'">
            <span>
                <div class="button button-primary" v-on:click="gsh">Link Account</div>
            </span>
        </p>
        <div v-if="type.platform">
            <div v-if="plugin.schema && plugin.schema.platform.schema.properties">
                <schema-form v-on:input="markDirty()" :schema="plugin.schema.platform.schema.properties || {}" v-model="platform" />
            </div>
            <div v-else class="monaco-field-large">
                <monaco v-on:change="(code) => { updateJson('platform', code) }" theme="hoobs-field" :value="platformCode()" class="monaco" />
            </div>
        </div>
        <div v-if="type.accessory">
            <div v-for="(accessory, index) in accessories.working" :key="`accessory_${index}`" class="accessory-card">
                <div v-if="accessory.plugin_map && accessories.schemas[accessoryKey(accessory)]">
                    <div class="accessory-title">
                        <h3>{{ accessories.schemas[accessoryKey(accessory)].title || "Accessory" }}</h3>
                        <confirm value="Remove" icon="delete_outline" v-on:confirm="() => { removeAccessory(index) }" class="confirm-float" />
                    </div>
                    <schema-form v-on:input="markDirty()" :schema="accessories.schemas[accessoryKey(accessory)].properties || {}" v-model="accessories.working[index]" />
                </div>
                <div v-else>
                    <div class="accessory-title">
                        <h3>Accessory</h3>
                        <confirm value="Remove" icon="delete_outline" v-on:confirm="() => { removeAccessory(index) }" class="confirm-float" />
                    </div>
                    <div class="monaco-field">
                        <monaco v-on:change="(code) => { updateJson('accessory', code, index) }" theme="hoobs-field" :value="accessoryCode(index)" class="monaco" />
                    </div>
                </div>
            </div>
            <div class="action">
                <div v-on:click="addAccessory()" class="button">Add accessory</div>
            </div>
        </div>
        <modal v-if="show.accessories" title="Add Accessory" v-on:cancel="() => { show.accessories = false }" :ok-button="false"  width="450px">
            <div v-for="(key) in Object.keys(accessories.schemas)" :key="`available_${key}`" class="button button-primary add-accessory-button" v-on:click="insertAccessory(key)">
                {{ accessories.schemas[key].title }} <span class="icon">chevron_right</span>
            </div>
        </modal>
    </div>
</template>

<script>
    import Decamelize from "decamelize";
    import Inflection from "inflection";

    import SchemaForm from "@/components/schema-form.vue";

    import Monaco from "../lib/monaco";

    export default {
        name: "plugin-config",

        components: {
            "monaco": Monaco,
            "schema-form": SchemaForm
        },

        props: {
            value: Object,
            instance: String,
            plugin: Object
        },

        data() {
            return {
                show: {
                    accessories: false
                },
                type: {
                    platform: false,
                    accessory: false
                },
                aliases: {
                    platform: null,
                    accessories: []
                },
                indexes: {
                    platform: -1,
                    accessories: []
                },
                platform: null,
                accessories: {
                    working: [],
                    schemas: {},
                    lookup: {}
                }
            }
        },

        async mounted() {
            this.processPlatform();
            this.processAccessories();

            if (this.plugin.name === "google-home") {
                window.addEventListener("message", this.gshListner, false);
            }
        },

        destroyed() {
            if (this.plugin.name === "google-home") {
                if (this.gshOriginCheck) {
                    clearInterval(this.gshOriginCheck);
                }

                window.removeEventListener("message", this.gshListner);

                if (this.gshPopup) {
                    this.gshPopup.close();
                }
            }
        },

        methods: {
            markDirty() {
                this.value.platforms[this.indexes.platform] = this.platform;

                for (let i = 0; i < this.accessories.working.length; i++) {
                    this.value.accessories[this.accessories.lookup[i]] = this.accessories.working[i];
                }

                this.$emit("input", this.value);
            },

            processPlatform() {
                if (this.plugin.details.findIndex(p => p.type === "platform") >= 0) {
                    this.type.platform = true;

                    this.aliases.platform = this.plugin.details.filter(p => p.type === "platform").map(p => p.alias);
                    this.indexes.platform = this.value.platforms.findIndex(p => this.aliases.platform.indexOf(p.platform) >= 0 || (p.plugin_map || {}).plugin_name === this.plugin.name);

                    if (this.indexes.platform === -1) {
                        this.platform = {
                            platform: this.aliases.platform,
                            plugin_map: {
                                plugin_name: this.plugin.name
                            }
                        };

                        this.indexes.platform = this.value.platforms.length;
                        this.value.platforms.push(this.platform);
                    } else {
                        this.platform = this.value.platforms[this.indexes.platform];
                    }
                }
            },

            processAccessories() {
                if (this.plugin.details.findIndex(p => p.type === "accessory") >= 0) {
                    this.type.accessory = true;
                    this.accessories.working = [];
                    this.accessories.lookup = {};

                    const alias = this.plugin.details.filter(p => p.type === "accessory").map(p => p.alias);

                    for (let i = 0; i < this.value.accessories.length; i++) {
                        if (alias.indexOf(this.value.accessories[i].accessory) >= 0) {
                            this.accessories.lookup[i] = this.accessories.working.length;

                            this.accessories.working.push(this.value.accessories[i]);
                            this.aliases.accessories.push(this.value.accessories[i].accessory);
                            this.indexes.accessories.push(i);
                        }
                    }

                    this.accessories.schemas = {};

                    if (this.plugin.schema) {
                        for (let i = 0; i < this.plugin.schema.accessories.schemas.length; i++) {
                            this.accessories.schemas[`${this.plugin.name}-:-${i}`] = this.plugin.schema.accessories.schemas[i];
                        }
                    }
                }
            },

            platformCode() {
                const copy = JSON.clone(this.platform);

                delete copy.plugin_map;

                return JSON.stringify(copy, null, 4);
            },

            accessoryCode(index) {
                const copy = JSON.clone(this.accessories.working[index]);

                delete copy.plugin_map;

                return JSON.stringify(copy, null, 4);
            },

            addAccessory() {
                const keys = Object.keys(this.accessories.schemas);

                if (keys.length > 1) {
                    this.show.accessories = true;
                } else if (keys.length === 1) {
                    this.insertAccessory(keys[0]);
                } else {
                    this.insertAccessory();
                }
            },

            insertAccessory(key) {
                if (key) {
                    this.show.accessories = false;

                    const index = parseInt(key.split("-:-")[1]);
                    const schema = this.accessories.schemas[key];

                    const accessory = {
                        accessory: schema.plugin_alias || schema.pluginAlias || this.plugin.details.filter(p => p.type === "accessory")[0].alias,
                        plugin_map: {
                            plugin_name: this.plugin.name,
                            index
                        }
                    };

                    this.value.accessories.push(accessory);
                } else {
                    this.show.accessories = false;

                    this.value.accessories.push({
                        accessory: this.plugin.details.filter(p => p.type === "accessory")[0].alias,
                        plugin_map: {
                            plugin_name: this.plugin.name,
                            index: 0
                        }
                    });
                }

                this.processAccessories();
                this.markDirty();
            },

            removeAccessory(index) {
                this.value.accessories.splice(this.accessories.lookup[index], 1);

                this.processAccessories();
                this.markDirty();
            },

            getAccessoryIndex() {
                const index = [];
                const alias = this.plugin.details.filter(p => p.type === "accessory").map(p => p.alias);

                for (let i = 0; i < this.value.accessories.length; i++) {
                    if (alias.indexOf(this.value.accessories[i].accessory) >= 0) {
                        index.push(i);
                    }
                }

                return index;
            },

            accessoryKey(accessory) {
                return `${accessory.plugin_map.plugin_name}-:-${accessory.plugin_map.index}`;
            },

            updateJson(section, code, index) {
                let copy = null;

                switch (section) {
                    case "accessory":
                        copy = JSON.clone(this.value.accessories[this.accessories.lookup[index]]);

                        this.accessories.working[index] = JSON.tryParse(code, this.accessories.working[index]);

                        if (this.accessories.working[index] && Array.isArray(this.accessories.working[index])) {
                            if (this.accessories.working[index].length === 1) {
                                this.accessories.working[index] = this.accessories.working[index][0];
                            }
                        }

                        if (this.accessories.working[index].accessories && Array.isArray(this.accessories.working[index].accessories)) {
                            if (this.accessories.working[index].accessories.length === 1) {
                                this.accessories.working[index] = this.accessories.working[index].accessories[0];
                            }
                        } else if (this.accessories.working[index].accessories) {
                            this.accessories.working[index] = this.accessories.working[index].accessories;
                        }

                        this.accessories.working[index].plugin_map = copy.plugin_map;

                        break;

                    case "platform":
                        copy = JSON.clone(this.value.platforms[this.indexes.platform]);

                        this.platform = JSON.tryParse(code, copy);

                        if (this.platform && Array.isArray(this.platform)) {
                            if (this.platform.length === 1) {
                                this.platform = this.platform[0];
                            }
                        }

                        if (this.platform.platforms && Array.isArray(this.platform.platforms)) {
                            if (this.platform.platforms.length === 1) {
                                this.platform = this.platform.platforms[0];
                            }
                        } else if (this.platform.platforms) {
                            this.platform = this.platform.platforms;
                        }

                        this.platform.plugin_map = copy.plugin_map;
                        
                        break;
                }

                this.markDirty();
            },

            gsh() {
                const width = 450;
                const height = 700;
                const top = window.top.outerHeight / 2 + window.top.screenY - (height / 2);
                const left = window.top.outerWidth / 2 + window.top.screenX - (width / 2);

                this.gshPopup = window.open(
                    "https://homebridge-gsh.iot.oz.nu/link-account",
                    "oznu-google-smart-home-auth",
                    `toolbar=no, location=no, directories=no, status=no, menubar=no scrollbars=no, resizable=no, copyhistory=no, width=${width}, height=${height}, top=${top}, left=${left}`,
                );

                this.gshOriginCheck = setInterval(() => {
                    this.gshPopup.postMessage("origin-check", "https://homebridge-gsh.iot.oz.nu");
                }, 2000);
            },

            gshListner(event) {
                if (event.origin === "https://homebridge-gsh.iot.oz.nu") {
                    const data = JSON.tryParse(event.data, {});

                    if (data.token) {
                        this.gshProcessToken(data.token);
                    }
                }
            },

            gshProcessToken(token) {
                if (this.gshOriginCheck) {
                    clearInterval(this.gshOriginCheck);
                }

                this.gshOriginCheck = null;

                if (this.gshPopup) {
                    this.gshPopup.close();
                }

                this.gshPopup = null;

                const index = this.value.platforms.findIndex(p => (p.plugin_map || {}).plugin_name === "google-home");

                this.value.platforms[index].token = token;

                this.markDirty();
            },

            humanize(string) {
                string = Inflection.titleize(Decamelize(string.replace(/-/gi, " ").replace(/homebridge/gi, "").trim()));

                string = string.replace(/smart things/gi, "SmartThings");
                string = string.replace(/smartthings/gi, "SmartThings");
                string = string.replace(/my q/gi, "myQ");
                string = string.replace(/myq/gi, "myQ");
                string = string.replace(/rgb/gi, "RGB");
                string = string.replace(/ffmpeg/gi, "FFMPEG");

                return string;
            }
        }
    }
</script>

<style scoped>
    #plugin-config .accessory-card {
        padding: 20px;
        position: relative;
        background: #262626;
        box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.24),
                    0 2px 1px -1px rgba(0, 0, 0, 0.22),
                    0 1px 3px 2px rgba(0, 0, 0, 0.3);
        border-radius: 3px;
        margin: 0 0 20px 0;
    }

    #plugin-config .accessory-card .confirm-float {
        position: absolute;
        top: 20px;
        right: 20px;
    }

    #plugin-config .accessory-title {
        margin: 0 0 10px 0;
        padding: 0 0 5px 0;
        border-bottom: 1px var(--border) solid;
        display: flex;
        align-content: flex-start;
        align-items: flex-start;
        justify-content: space-between;
    }

    #plugin-config h3 {
        margin: 0;
        padding: 0;
        line-height: normal;
        font-size: 14px;
    }

    #plugin-config p {
        margin: 0 0 20px 0;
    }

    #plugin-config .accessory-button {
        white-space: normal;
        margin: 0 0 10px 0;
    }

    #plugin-config .field {
        display: flex;
        flex-direction: column;
        padding: 0 0 20px 0;
        text-align: left;
    }

    #plugin-config .field .title {
        font-weight: bold;
        font-size: 14px;
        color: #feb400;
        user-select: none;
        cursor: default;
    }

    #plugin-config .field .description {
        font-size: 12px;
        user-select: none;
        cursor: default;
    }

    #plugin-config .monaco-field {
        height: 200px;
        padding: 7px;
        background: #444;
        border: 1px #333 solid;
        border-radius: 5px;
    }

    #plugin-config .monaco-field-large {
        height: 350px;
        padding: 7px;
        background: #444;
        border: 1px #333 solid;
        border-radius: 5px;
    }

    #plugin-config .monaco {
        width: 100%;
        height: 100%;
    }

    #plugin-config .action {
        padding: 0 0 20px 0;
    }

    #plugin-config .add-accessory-button {
        padding: 10px 10px 10px 20px;
        display: block;
        margin: 10px 0 0 0;
        white-space: normal;
        display: flex;
        align-items: center;
        align-content: center;
        justify-content: space-between;
    }

    #plugin-config .add-accessory-button:first-child {
        margin: 0;
    }
</style>
