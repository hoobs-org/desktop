<template>
    <div v-if="!serviceRoute() && devices.length > 0" id="navigation">
        <div class="routes">
            <div class="action-link" v-on:click="() => { show.tips = !show.tips }">
                <span v-if="show.tips" class="icon">chevron_left</span>
                <span v-else class="icon">chevron_right</span>
            </div>
            <div class="seperator">
                <div></div>
            </div>
            <router-link to="/" @click.native="() => { show.tips = false }">
                <span v-bind:class="routeIcon('home')">dashboard</span>
                <span v-if="show.tips" v-bind:class="activeRoute('home')">{{ $t("dashboard") }}</span>
            </router-link>
            <router-link to="/accessories" @click.native="() => { show.tips = false }">
                <span v-bind:class="routeIcon('accessories', 'layout')">highlight</span>
                <span v-if="show.tips" v-bind:class="activeRoute('accessories', 'layout')">{{ $t("accessories") }}</span>
            </router-link>
            <router-link to="/log" @click.native="() => { show.tips = false }">
                <span v-bind:class="routeIcon('log')">subject</span>
                <span v-if="show.tips" v-bind:class="activeRoute('log')">{{ $t("log") }}</span>
            </router-link>
            <router-link to="/plugins/browse" @click.native="() => { show.tips = false }">
                <span v-bind:class="routeIcon('plugins', 'plugin', 'search')">extension</span>
                <span v-if="show.tips" v-bind:class="activeRoute('plugins', 'plugin', 'search')">{{ $t("plugins") }}</span>
            </router-link>
        </div>
        <div class="routes">
            <router-link to="/config/interface" @click.native="() => { show.tips = false }">
                <span v-bind:class="routeIcon('config')">settings</span>
            </router-link>
        </div>
    </div>
</template>

<script>
    export default {
        name: "navigation",

        props: {
            route: String,
            devices: {
                type: Array,
                default: () => []
            }
        },

        data() {
            return {
                show: {
                    tips: false
                },
            }
        },

        methods: {
            serviceRoute() {
                switch(this.$route.name) {
                    case "devices":
                    case "system":
                    case "terminal":
                    case "etcher":
                        return true;

                    default:
                        return false;
                }
            },

            activeRoute(...values) {
                if (values.filter(r => this.route === r).length > 0) {
                    return "route-link route-link-on";
                }

                return "route-link";
            },

            routeIcon(...values) {
                if (values.filter(r => this.route === r).length > 0) {
                    return "icon icon-on";
                }

                return "icon";
            }
        }
    }
</script>

<style scoped>
    #navigation {
        min-width: 57px;
        padding: 37px 0 15px 0;
        background: #262626;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        user-select: none;
    }

    #navigation .routes {
        min-width: 57px;
        display: flex;
        flex-direction: column;
        align-content: center;
        align-items: center;
    }

    #navigation .seperator {
        width: 100%;
        height: 1px;
        margin: 5px 0 0 0;
        padding: 0 17px;
        box-sizing: border-box;
    }

    #navigation .seperator div {
        background: #3d3d3d;
        height: 1px;
    }

    #navigation a,
    #navigation a:link,
    #navigation a:active,
    #navigation a:visited {
        color: #bababa;
        text-decoration: none;
        margin-top: 15px;
        width: 100%;
        text-align: left;
        display: flex;
        align-items: center;
        align-content: center;
        justify-content: flex-start;
        cursor: pointer;
    }

    #navigation a:hover {
        color: #fff !important;
        text-decoration: none;
    }

    #navigation .action-link {
        color: #bababa;
        text-decoration: none;
        margin-top: 12px;
        width: 100%;
        text-align: left;
        display: flex;
        align-items: center;
        align-content: center;
        justify-content: flex-start;
        cursor: pointer;
    }

    #navigation .action-link:hover {
        color: #fff !important;
        text-decoration: none;
    }

    #navigation .route-link {
        font-size: 17px;
        margin: 0 24px 0 -6px;
    }

    #navigation .icon {
        margin: 0 16px;
    }

    #navigation .route-link-on,
    #navigation .icon-on,
    #navigation .route-link-on:hover,
    #navigation .icon-on:hover {
        color: #feb400 !important;
    }

    #navigation .icon svg {
        width: 24px;
        height: 24px;
    }
</style>