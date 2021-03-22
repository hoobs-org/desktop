<template>
    <div id="rooms" class="form">
        <div v-if="!loading" class="row section">{{ $t("add_room") }}</div>
        <div v-if="!loading" class="row rooms">
            <div class="static">
                <div class="row">
                    <text-field :title="$t('name')" style="flex: 1; padding-right: 5px" v-model="display" />
                </div>
                <div class="row">
                    <div v-on:click="create" class="button">{{ $t("save") }}</div>
                </div>
                <div v-if="rooms.length > 0" class="row section">{{ $t("rooms") }}</div>
                <div v-if="rooms.length > 0" class="list">
                    <div class="grid">
                        <div v-for="(room, index) in rooms" :key="`room:${index}`" v-on:click="select(room.id)" class="button full">{{ room.name }}</div>
                    </div>
                </div>
            </div>
        </div>
        <div v-else class="loading">
            <spinner />
        </div>
    </div>
</template>

<script>
    import Sanitize from "@hoobs/sdk/lib/sanitize";
    import { Wait } from "@hoobs/sdk/lib/wait";
    import Validators from "../../services/validators";

    const SOCKET_RECONNECT_DELAY = 500;

    export default {
        name: "rooms",

        data() {
            return {
                loading: true,
                display: "",
                rooms: [],
            };
        },

        async mounted() {
            this.rooms = (await this.$hoobs.rooms.list()).filter((item) => item.id !== "default");
            this.loading = false;
        },

        methods: {
            select(room) {
                this.$emit("update", room);
            },

            async create() {
                this.loading = true;

                const validation = Validators.room(true, this.display, this.rooms);

                if (validation.valid) {
                    await this.$hoobs.rooms.add(this.display);

                    setTimeout(async () => {
                        await Wait();

                        this.rooms = await this.$hoobs.rooms.list();
                        this.loading = false;
                        this.select(this.rooms.find((item) => item.id === Sanitize(this.display)).id);
                    }, SOCKET_RECONNECT_DELAY);
                } else {
                    this.loading = false;
                    this.$alert(this.$t(validation.error));
                }
            },
        },
    };
</script>

<style lang="scss" scoped>
    #rooms {
        overflow: hidden !important;

        .rooms {
            margin: 0;
            flex: 1;
            overflow: hidden;

            .static {
                flex: 1;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }

            .list {
                flex: 1;
                overflow: auto;
                -ms-overflow-style: none;
                scrollbar-width: none;

                &::-webkit-scrollbar {
                    display: none;
                }
            }
        }

        .full {
            flex: 1;
            margin: 0 10px 10px 0;
            justify-content: space-around;
        }
    }
</style>
