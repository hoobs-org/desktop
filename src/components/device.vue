<template>
    <div id="device">
        <div class="image">
            <div class="icon">router</div>
        </div>
        <div v-if="joined" class="action-cell">
            <router-link :to="`/devices/${value.mac}/${value.port}`" class="button">Details</router-link>
        </div>
        <div v-else class="action-cell">
            <div v-on:click="$emit('join')" class="button button-primary">Join</div>
        </div>
        <div v-if="joined" class="info">
            <span v-if="value.hostname !== value.ip" class="title">{{ value.hostname }}</span>
            <span v-if="value.hostname !== value.ip" class="ip">{{ value.ip }}</span>
            <span v-else class="title">{{ value.ip }}</span>
            <div class="working">
                <marquee v-if="show.working" :height="3" color="#feb400" background="#856a3b" />
            </div>
        </div>
        <div v-else class="info">
            <span v-if="value.hostname" class="title">{{ humanize(value.hostname) }}</span>
            <span v-if="value.hostname" class="ip">{{ value.ip }}</span>
            <span v-else class="title">{{ value.ip }}</span>
        </div>
        <div v-if="joined" class="action-cell">
            <router-link v-if="show.terminal" :to="`/terminal/${value.mac}/${value.port}`" title="Terminal" class="icon action-icon">code</router-link>
        </div>
        <div v-if="joined">
            <div v-if="show.terminal && show.seperators" class="action-seperator"></div>
        </div>
        <div v-if="joined" class="action-cell">
            <confirm v-if="show.restart" value="Restart Bridge" icon="cached" title="Are you sure you want to restart the bridge?" v-on:start="toggleFields(false, true, false, false, false)" v-on:cancel="toggleFields(true, true, true, true, true)" v-on:confirm="restartDevice()" />
        </div>
        <div v-if="joined" class="action-cell">
            <confirm v-if="show.reboot" value="Reboot Device" icon="power_settings_new" title="Are you sure you want to reboot this device?" v-on:start="toggleFields(false, false, true, false, false)" v-on:cancel="toggleFields(true, true, true, true, true)" v-on:confirm="rebootDevice()" />
        </div>
        <div v-if="joined">
            <div v-if="(show.restart || show.reboot) && show.seperators" class="action-seperator"></div>
        </div>
        <div v-if="joined" class="action-cell">
            <confirm v-if="show.remove" value="Remove Device" icon="delete_outline" title="Are you sure you want to remove this device?" v-on:start="toggleFields(false, false, false, true, false)" v-on:cancel="toggleFields(true, true, true, true, true)" v-on:confirm="$emit('remove')" />
        </div>
        <div v-if="!joined" class="service">
            <span class="title">HOOBS</span>
            <div class="version">{{ value.version }}</div>
        </div>
    </div>
</template>

<script>
    import Decamelize from "decamelize";
    import Inflection from "inflection";

    import Confirm from "@/components/confirm.vue";
    import Marquee from "@/components/marquee.vue";

    export default {
        name: "devices",

        components: {
            "confirm": Confirm,
            "marquee": Marquee
        },

        props: {
            value: Object,
            joined: {
                type: Boolean,
                default: false
            }
        },

        data() {
            return {
                show: {
                    terminal: false,
                    restart: false,
                    reboot: false,
                    remove: false,
                    seperators: false,
                    working: false
                }
            }
        },

        async mounted() {
            this.show.working = true;
            this.toggleFields(false, false, false, true, true);

            this.Device.wait.start(this.value.ip, this.value.port, () => {
                this.show.working = false;
                this.toggleFields(true, true, true, true, true);
            });
        },

        destroyed() {
            this.Device.wait.stop(this.value.ip, this.value.port);
        },

        methods: {
            toggleFields(terminal, restart, reboot, remove, seperators) {
                this.show.terminal = terminal;
                this.show.restart = restart;
                this.show.reboot = reboot;
                this.show.remove = remove;
                this.show.seperators = seperators;
            },

            async restartDevice() {
                this.toggleFields(true, false, false, true, true);
                this.show.working = true;

                await this.API.login(this.value.ip, this.value.port);
                await this.API.post(this.value.ip, this.value.port, "/service/restart");

                this.show.working = false;
                this.toggleFields(true, true, true, true, true);
            },

            async rebootDevice() {
                this.toggleFields(false, false, false, true, true);
                this.show.working = true;

                await this.API.login(this.value.ip, this.value.port);
                await this.API.post(this.value.ip, this.value.port, "/service/stop");
                await this.API.put(this.value.ip, this.value.port, "/reboot");

                setTimeout(async () => {
                    this.Device.wait.start(this.value.ip, this.value.port, () => {
                        this.show.working = false;
                        this.toggleFields(true, true, true, true, true);
                    });
                }, 5000);
            },

            humanize(string) {
                return Inflection.titleize(Decamelize((string || "").split(".")[0].replace(/-/gi, " ").replace(/_/gi, " ").trim())).replace(/hoobs/gi, "HOOBS");
            }
        }
    }
</script>

<style scoped>
    #device {
        display: flex;
        flex-direction: row;
        align-content: center;
        align-items: center;
        margin: 0 0 10px 0;
        background: #262626;
        box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.24),
                    0 2px 1px -1px rgba(0, 0, 0, 0.22),
                    0 1px 3px 2px rgba(0, 0, 0, 0.3);
    }

    #device .image {
        padding: 20px;
        cursor: default;
    }

    #device .image .icon {
        font-size: 37px;
    }

    #device .action-cell {
        padding: 20px 0 20px 0;
    }

    #device .action-cell:last-child {
        padding: 20px 20px 20px 0;
    }

    #device .action-cell .button {
        width: 72px;
    }

    #device .action-cell .action-icon,
    #device .action-cell .action-icon:link,
    #device .action-cell .action-icon:active,
    #device .action-cell .action-icon:visited {
        margin: 0 0 0 7px;
        font-size: 18px;
        text-decoration: none;
        color: #999;
        cursor: pointer;
    }

    #device .action-cell .action-icon:hover {
        color: #fff;
        text-decoration: none;
    }

    #device .action-seperator {
        width: 8px;
        height: 20px;
        margin: 0 7px;
        border-right: 1px #5e5e5e solid;
    }

    #device .info {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 20px;
        text-align: left;
        user-select: none;
        cursor: default;
    }

    #device .info .title {
        margin: 3px 0 0 0;
        font-size: 17px;
    }

    #device .info .ip {
        font-size: 12px;
    }

    #device .info .working {
        height: 3px;
        margin: 3px 0 0 0;
        max-width: 350px;
    }

    #device .service {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 20px 20px 20px 0;
        text-align: right;
        user-select: none;
        cursor: default;
    }

    #device .service .title {
        font-size: 17px;
    }

    #device .service .version {
        font-size: 12px;
    }
</style>