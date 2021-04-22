<template>
    <modal :title="(accessory || {}).name || $t('accessory')" :draggable="true" width="780px" height="747px">
        <div id="accessory">
            <div v-if="!loading" class="content">
                <icons v-if="accessory && show.icons" v-on:update="select" />
                <rooms v-else-if="accessory && show.rooms" v-on:update="assign" />
                <div v-else-if="accessory" class="form">
                    <div class="row section">{{ $t("details") }}</div>
                    <div class="row">
                        <text-field :title="$t('name')" style="flex: 1; padding-right: 5px" v-model="display" />
                    </div>
                    <div class="row">
                        <checkbox id="hidden" :title="$t('hidden')" v-model="hidden" />
                    </div>
                    <div v-if="features.icon" class="row title">{{ $t("icon") }}</div>
                    <div v-if="features.icon" class="row">
                        <div class="icon">
                            <icon :name="icon.selected || icon.default" class="selected" />
                        </div>
                        <div v-on:click="() => { show.icons = true; }" class="button">{{ $t("change") }}</div>
                    </div>
                    <div v-if="plugin" class="row section">{{ $t("plugin") }}</div>
                    <div v-if="plugin" class="row plugin">
                        <span>{{ $hoobs.repository.title(plugin) }}</span>
                    </div>
                    <div v-if="plugin" class="row">
                        <div v-on:click="configure" class="button">{{ $t("configuration") }}</div>
                    </div>
                    <div class="row section">{{ $t("room") }}</div>
                    <div v-if="features.icon" class="row">{{ $t("current_room") }}</div>
                    <div v-if="room" class="row current-room">
                        <span>{{ title }}</span>
                        <div v-on:click="() => { show.rooms = true; }" class="button">{{ $t("room_assign") }}</div>
                        <div v-if="room !== 'default'" v-on:click="assign()" class="button">{{ $t("remove") }}</div>
                    </div>
                    <div v-if="options.unknown" class="row section">{{ $t("accessory_data") }}</div>
                    <div v-if="options.unknown" class="row">
                        <div v-on:click="dump" class="button">{{ $t("download") }}</div>
                    </div>
                </div>
            </div>
            <div v-else class="loading">
                <spinner />
            </div>
            <div v-if="!loading && show.icons" class="actions modal">
                <div class="button" v-on:click="select(null)">{{ $t("default") }}</div>
                <div class="button" v-on:click="() => { show.icons = false; }">{{ $t("cancel") }}</div>
            </div>
            <div v-else-if="!loading && show.rooms" class="actions modal">
                <div class="button" v-on:click="() => { show.rooms = false; }">{{ $t("cancel") }}</div>
            </div>
            <div v-else class="actions modal">
                <div v-if="widget" v-on:click="remove" class="button">{{ $t("remove_from_dashboard") }}</div>
                <div v-else v-on:click="add" class="button">{{ $t("add_to_dashboard") }}</div>
                <div style="flex: 1"></div>
                <div v-on:click="$dialog.close('accessory')" class="button">{{ $t("cancel") }}</div>
                <div v-on:click="save()" class="button primary">{{ $t("apply") }}</div>
            </div>
        </div>
    </modal>
</template>

<script>
    import { Wait } from "@hoobs/sdk/lib/wait";
    import { saveAs } from "file-saver";

    import IconsComponent from "@/components/dialogs/icons.vue";
    import RoomsComponent from "@/components/dialogs/rooms.vue";

    import { initial, layout } from "../../services/widgets";

    export default {
        name: "settings",

        components: {
            "icons": IconsComponent,
            "rooms": RoomsComponent,
        },

        props: {
            options: Object,
        },

        computed: {
            widget() {
                if (this.accessory && this.items.find((item) => item.i === this.accessory.accessory_identifier)) {
                    return true;
                }

                return false;
            },
        },

        data() {
            return {
                loading: true,
                accessory: null,
                plugin: null,
                items: [],
                display: "",
                hidden: false,
                room: "",
                title: "",
                icon: {
                    selected: null,
                    default: null,
                },
                safety: 0,
                features: {
                    icon: false,
                },
                show: {
                    icons: false,
                    rooms: false,
                },
            };
        },

        created() {
            this.$action.on("dashboard", "update", () => {
                this.load();
            });
        },

        async mounted() {
            await this.load();
        },

        watch: {
            async room() {
                const rooms = await this.$hoobs.rooms.list();
                const room = rooms.find((item) => item.id === this.room) || {};

                this.title = room.name || this.$t(room.id || "default");
            },
        },

        methods: {
            async load() {
                this.loading = true;
                this.accessory = null;

                await Wait();

                const config = await this.$hoobs.config.get();
                const accessory = await this.$hoobs.accessory(this.options.bridge, this.options.id);

                config.dashboard = config.dashboard || {
                    items: [...initial],
                };

                this.accessory = accessory;
                this.plugin = this.accessory.plugin;
                this.items = config.dashboard.items;
                this.display = this.accessory.name;
                this.hidden = this.accessory.hidden;
                this.room = this.accessory.room;
                this.loading = false;

                switch (this.accessory.type) {
                    case "light":
                        this.features.icon = true;
                        this.icon.default = "lightbulb-outline";
                        this.icon.selected = this.accessory.icon;
                        break;

                    case "sensor":
                        this.features.icon = true;
                        this.icon.default = "memory";
                        this.icon.selected = this.accessory.icon;
                        break;

                    case "switch":
                    case "outlet":
                        this.features.icon = true;
                        this.icon.default = "toggle-switch-off";
                        this.icon.selected = this.accessory.icon;
                        break;

                    case "fan":
                        this.features.icon = true;
                        this.icon.default = "fan";
                        this.icon.selected = this.accessory.icon;
                        break;

                    default:
                        this.features.icon = false;
                        this.icon.default = null;
                        this.icon.selected = this.accessory.icon;
                        break;
                }
            },

            configure() {
                this.$dialog.close("accessory");
                this.$router.push({ path: `/config/${this.plugin}` });
            },

            select(icon) {
                if (icon === this.icon.default) {
                    this.icon.selected = null;
                } else {
                    this.icon.selected = icon;
                }

                this.show.icons = false;
            },

            assign(room) {
                this.room = room && room !== "" && room !== "default" ? room : "default";
                this.show.rooms = false;
            },

            async save() {
                await Wait();

                const accessory = await this.$hoobs.accessory(this.accessory.bridge, this.accessory.accessory_identifier);

                if (this.display !== this.accessory.name) await accessory.set("name", this.display);
                if (this.room !== this.accessory.room) await accessory.set("room", this.room);
                if (this.features.icon) await accessory.set("icon", this.icon.selected);

                await accessory.set("hidden", this.hidden);

                this.$dialog.close("accessory");
            },

            async add() {
                const config = await this.$hoobs.config.get();
                const items = JSON.parse(JSON.stringify(this.items));
                const widget = this.options.camera ? layout("camera-widget") : layout("accessory-widget");

                config.dashboard = config.dashboard || {};

                widget.bridge = this.accessory.bridge;
                widget.id = this.accessory.accessory_identifier;
                widget.i = this.accessory.accessory_identifier;

                if (widget) items.unshift(widget);

                config.dashboard.items = items;

                await this.$hoobs.config.update(config);
                await Wait();

                this.$dialog.close("accessory");
                this.$action.emit("dashboard", "update");
                this.$router.push({ path: "/" });
            },

            async remove() {
                const config = await this.$hoobs.config.get();
                const items = JSON.parse(JSON.stringify(this.items));

                let index = -1;

                if (this.options.camera) {
                    index = items.findIndex((item) => item.component === "camera-widget" && item.i === this.accessory.accessory_identifier);
                } else {
                    index = items.findIndex((item) => item.component === "accessory-widget" && item.i === this.accessory.accessory_identifier);
                }

                config.dashboard = config.dashboard || {};

                if (index >= 0) items.splice(index, 1);

                config.dashboard.items = items;

                await this.$hoobs.config.update(config);
                await Wait();

                this.$dialog.close("accessory");
                this.$action.emit("dashboard", "update");
            },

            dump() {
                saveAs(new Blob([JSON.stringify(this.accessory, null, 4)], { type: "application/json" }), "accessory.json");
            },
        },
    };
</script>

<style lang="scss" scoped>
    #accessory {
        flex: 1;
        display: flex;
        flex-direction: column;
        margin: 0 0 0 10px;
        overflow: hidden;

        .content {
            overflow: hidden;

            .form {
                overflow: auto;

                .title {
                    margin: 14px 0 0 0;
                }

                .plugin {
                    margin: 0 0 10px 0;
                    align-items: center;

                    span {
                        font-size: 20px;
                    }
                }

                .current-room {
                    margin: 10px 0;
                    align-items: center;

                    span {
                        margin: 0 14px 0 0;
                        color: var(--application-highlight);
                        font-size: 27px;
                    }
                }

                .icon {
                    margin: 0 14px 14px 0;
                    border: 1px var(--application-border) solid;
                    padding: 7px;

                    .selected {
                        height: 42px;
                    }
                }
            }
        }
    }
</style>
