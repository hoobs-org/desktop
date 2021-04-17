<template>
    <div :key="version" v-if="user.permissions.accessories" id="accessories">
        <context>
            <router-link v-if="rooms.length > 0 && id !== 'add'" to="/accessories/add" class="button">
                <icon name="plus" class="icon" />
                {{ $t("add_room") }}
            </router-link>
            <div v-if="rooms.length > 0" class="seperator"></div>
            <icon v-if="rooms.length > 0" v-on:click.stop="$dialog.open('hidden')" :title="$t('hidden_accessories')" name="eye-off" class="icon" />
            <icon v-if="rooms.length > 0 && locked.rooms" v-on:click.stop="unlock" :title="$t('sort_rooms')" name="lock" class="icon" />
            <icon v-else-if="rooms.length > 0" v-on:click.stop="lock" :title="$t('sort_rooms')" name="lock-open-variant" class="icon" />
        </context>
        <div v-if="!loading && rooms.length > 0" class="content">
            <list value="id" display="name" :values="filtered" :selected="id" :initial="rooms[0].id" :sort="!locked.rooms" v-on:update="layout" controller="accessories" />
            <div v-if="!intermediate && id === 'add'" class="screen">
                <div class="wrapper">
                    <div class="row section">{{ $t("details") }}</div>
                    <div class="row">
                        <text-field :title="$t('name')" style="flex: 1; padding-right: 5px" v-model="display" />
                    </div>
                    <div class="row actions">
                        <div v-if="!loading" v-on:click="create()" class="button primary">{{ $t("save") }}</div>
                        <router-link to="/accessories" class="button">{{ $t("cancel") }}</router-link>
                    </div>
                </div>
            </div>
            <div v-else-if="!intermediate && id === 'edit'" class="screen">
                <div class="wrapper">
                    <div class="row section">{{ $t("details") }}</div>
                    <div class="row">
                        <text-field :title="$t('name')" style="flex: 1; padding-right: 5px" v-model="display" />
                    </div>
                    <div class="row actions">
                        <div v-if="!loading" v-on:click="update()" class="button primary">{{ $t("save") }}</div>
                        <div v-if="!loading" v-on:click="remove()" class="button">{{ $t("remove") }}</div>
                        <router-link :to="`/accessories/${room}`" class="button">{{ $t("cancel") }}</router-link>
                    </div>
                </div>
            </div>
            <div v-else-if="!intermediate" class="screen">
                <div class="section">
                    <span>{{ display }}</span>
                    <div style="flex: 1"></div>
                    <icon v-if="locked.accessories" v-on:click.stop="() => { locked.accessories = !locked.accessories}" :title="$t('sort_accessories')" name="lock" class="icon" />
                    <icon v-else v-on:click.stop="() => { locked.accessories = !locked.accessories; load(id); }" :title="$t('sort_accessories')" name="lock-open-variant" class="icon" />
                    <router-link v-if="identifier !== 'default'" :to="`/accessories/edit/${id || rooms[0].id}`" :title="$t('room_settings')" class="edit-room"><icon name="pencil" class="icon" /></router-link>
                </div>
                <draggable :key="`version-${key}`" v-if="!locked.accessories" ghost-class="ghost" v-model="accessories" v-on:end="sort" class="devices">
                    <div v-for="(accessory, index) in accessories" :key="`accessory:${index}`" class="device editing">
                        <component v-if="accessory.control" :is="accessory.control" :accessory="accessory" :disabled="true" />
                        <div v-if="accessory.control" class="device-cover"></div>
                    </div>
                </draggable>
                <div v-else class="devices">
                    <div v-if="features.off" class="device">
                        <off-accessory :id="id" :room="current" />
                    </div>
                    <div v-if="features.light || features.brightness" class="device">
                        <brightness-accessory :id="id" :room="current" :features="features" />
                    </div>
                    <div v-if="features.hue" class="device">
                        <hue-accessory :id="id" :room="current" />
                    </div>
                    <div v-for="(accessory, index) in accessories" :key="`accessory:${index}`" class="device">
                        <component v-if="accessory.control" :is="accessory.control" :accessory="accessory" :disabled="false" />
                    </div>
                </div>
            </div>
            <div v-else-if="id" class="loading">
                <spinner />
            </div>
        </div>
        <div v-else-if="!loading && rooms.length === 0" class="empty">
            {{ $t("no_accessories") }}
        </div>
        <div v-else class="loading">
            <spinner />
        </div>
    </div>
</template>

<script>
    import Sanitize from "@hoobs/sdk/lib/sanitize";

    import DraggableComponent from "vuedraggable";
    import ListComponent from "@/components/elements/list.vue";

    import Validators from "../services/validators";
    import { accessories, types } from "../services/accessories";

    export default {
        name: "accessories",

        props: {
            id: String,
            room: String,
        },

        components: {
            "list": ListComponent,
            "draggable": DraggableComponent,

            ...accessories(),
        },

        computed: {
            user() {
                return this.$store.state.user;
            },

            filtered() {
                if (this.locked.rooms) return this.rooms;

                return this.rooms.filter((item) => item.id !== "default");
            },
        },

        data() {
            return {
                key: 1,
                version: 0,
                loading: true,
                current: null,
                locked: {
                    rooms: true,
                    accessories: true,
                },
                intermediate: true,
                characteristics: [],
                accessories: [],
                features: {
                    hue: false,
                    off: false,
                    light: false,
                    brightness: false,
                },
                identifier: "",
                display: "",
                types: [],
                rooms: [],
            };
        },

        watch: {
            id() {
                this.load(this.id);
            },

            room() {
                this.load(this.id);
            },
        },

        created() {
            this.$store.subscribe(async (mutation) => {
                if (mutation.type === "IO:ROOM:CHANGE" && this.id !== "add" && this.id !== "edit") {
                    if (mutation.payload.data.action === "update" && mutation.payload.data.field === "sequence" && this.locked.rooms) this.loadRooms();
                    if (mutation.payload.data.action === "update" && mutation.payload.data.field !== "sequence") this.load(this.id);
                    if (mutation.payload.data.action === "add" || mutation.payload.data.action === "remove") this.rooms = await this.$hoobs.rooms.list();
                }
            });
        },

        mounted() {
            this.load(this.id);
        },

        methods: {
            async layout(rooms) {
                const updates = [];

                for (let i = 0; i < rooms.length; i += 1) {
                    if ((i + 1) !== rooms[i].sequence) {
                        updates.push(new Promise((resolve) => {
                            this.$hoobs.room(rooms[i].id).then((room) => {
                                room.set("sequence", (i + 1)).finally(() => {
                                    resolve();
                                });
                            }).catch(() => {
                                resolve();
                            });
                        }));
                    }
                }

                await Promise.all(updates);
            },

            async lock() {
                await this.loadRooms();

                this.locked.rooms = !this.locked.rooms;
            },

            unlock() {
                this.locked.rooms = !this.locked.rooms;
            },

            async sort() {
                this.key += 1;

                const updates = [];

                for (let i = 0; i < this.accessories.length; i += 1) {
                    if ((i + 1) !== this.accessories[i].sequence) {
                        updates.push(new Promise((resolve) => {
                            this.$hoobs.accessory(this.accessories[i].bridge, this.accessories[i].accessory_identifier).then((accessory) => {
                                accessory.set("sequence", (i + 1)).finally(() => {
                                    resolve();
                                });
                            }).catch(() => {
                                resolve();
                            });
                        }));
                    }
                }

                await Promise.all(updates);
            },

            async load(id) {
                this.intermediate = true;
                this.accessories = [];
                this.display = "";

                if (!this.rooms || this.rooms.length === 0) await this.loadRooms();

                this.features.off = false;

                this.features.light = false;
                this.features.brightness = false;
                this.features.hue = false;

                if (id === "edit") {
                    const index = this.rooms.findIndex((item) => item.id === this.room);

                    if (index >= 0) {
                        this.current = await this.$hoobs.room(this.rooms[index].id);
                        this.display = this.current.name || this.$t(this.current.id);
                    }
                } else if (id !== "add") {
                    let index = this.rooms.findIndex((item) => item.id === id);

                    if (index === -1 && this.rooms.length > 0) index = 0;

                    if (index >= 0 && this.rooms[index].id && this.rooms[index].id !== "") {
                        this.current = await this.$hoobs.room(this.rooms[index].id);
                        this.characteristics = this.current.characteristics || [];
                        this.accessories = this.current.accessories || [];
                        this.identifier = this.current.id;
                        this.display = this.current.name || this.$t(this.current.id);
                        this.types = this.current.types || [];

                        this.features.off = this.characteristics.indexOf("off") >= 0;

                        for (let i = 0; i < this.accessories.length; i += 1) {
                            this.accessories[i].control = types(this.accessories[i]);
                        }

                        this.features.light = this.types.indexOf("lightbulb") && this.characteristics.indexOf("on") >= 0;
                        this.features.brightness = this.types.indexOf("lightbulb") && this.characteristics.indexOf("brightness") >= 0;
                        this.features.hue = this.characteristics.indexOf("hue") >= 0;
                    }
                }

                this.loading = false;
                this.intermediate = false;
            },

            async loadRooms() {
                this.rooms = await this.$hoobs.rooms.list();

                for (let i = 0; i < this.rooms.length; i += 1) {
                    if (!this.rooms[i].name || this.rooms[i].name === "") this.rooms[i].name = this.$t(this.rooms[i].id);
                }
            },

            async remove() {
                this.$confirm(this.$t("remove"), this.$t("remove_remove_warning"), async () => {
                    this.intermediate = true;

                    if (this.current && this.current.id === this.room) await this.current.remove();

                    await this.loadRooms();

                    this.$router.push({ path: "/accessories" });
                });
            },

            async update() {
                this.intermediate = true;

                if (this.current && this.current.id === this.room) await this.current.set("name", this.display);

                await this.loadRooms();

                this.$router.push({ path: `/accessories/${this.room}` });
            },

            async create() {
                this.intermediate = true;

                const validation = Validators.room(true, this.display, this.rooms);

                if (validation.valid) {
                    await this.$hoobs.rooms.add(this.display);
                    await this.loadRooms();

                    this.$router.push({ path: `/accessories/${this.rooms.find((item) => item.id === Sanitize(this.display)).id}` });
                } else {
                    this.intermediate = false;
                    this.$alert(this.$t(validation.error));
                }
            },
        },
    };
</script>

<style lang="scss" scoped>
    #accessories {
        display: flex;
        flex-direction: column;
        overflow: hidden;

        .content {
            flex: 1;
            display: flex;
            overflow: hidden;

            .screen {
                flex: 1;
                display: flex;
                margin: 0 20px 20px 10px;
                padding: 20px;
                color: var(--widget-text);
                background: var(--widget-background);
                backdrop-filter: var(--transparency);
                -ms-overflow-style: none;
                overflow: auto;

                &::-webkit-scrollbar {
                    display: none;
                }

                .wrapper {
                    max-width: 800px;
                }

                .section {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    padding: 0 0 10px 0;
                    justify-content: space-between;
                    border-bottom: 1px var(--application-border) solid;
                    color: var(--application-highlight);
                    margin: 0 0 20px 0;
                    user-select: none;

                    .icon {
                        height: 18px;
                        color: var(--application-text) !important;
                        text-decoration: none !important;
                        margin: 0 0 7px 7px;
                        opacity: 0.5;
                        cursor: pointer;

                        &:hover {
                            opacity: 1;
                        }
                    }
                }

                .devices {
                    display: flex;
                    flex-flow: row wrap;
                    justify-content: flex-start;

                    .device {
                        margin: 0 0 20px 20px;
                        padding: 10px 10px 10px 10px;
                        position: relative;
                        width: 155px;
                        user-select: none;

                        &.editing {
                            background: var(--widget-background);

                            &:hover {
                                opacity: 1;
                            }
                        }

                        .device-cover {
                            width: 100%;
                            height: 100%;
                            position: absolute;
                            border: 1px var(--application-border) solid;
                            border-radius: 4px;
                            top: 0;
                            left: 0;
                            z-index: 200;
                        }
                    }
                }

                .actions {
                    margin: 10px 0 0 0;
                }

                .nav {
                    display: flex;
                    flex-direction: row;
                    padding: 20px 0 10px 0;
                    border-bottom: 1px var(--application-border) solid;
                    margin: 0 0 20px 0;
                    user-select: none;

                    &:first-child {
                        padding: 0 0 10px 0;
                    }
                }
            }
        }

        .empty {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: space-around;
            padding: 0 0 20% 0;
        }

        .ghost {
            border: 1px var(--application-highlight) solid;
        }
    }
</style>
