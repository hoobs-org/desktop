<template>
    <div v-if="connected > 0" id="plugins">
        <div class="tabs">
            <div class="spacer"></div>
            <tab :title="$t('browse_packages')" v-on:activate="navigate('browse')" :active="section === 'browse'" />
            <tab :title="$t('installed_packages')" v-on:activate="navigate('installed')" :active="section === 'installed'" />
            <div class="fill"></div>
        </div>
        <div class="layout">

        </div>
    </div>
    <loader v-else id="loader" :value="`${$t('connecting')}...`" />
</template>

<script>
    import Tab from "@/components/tab.vue";

    export default {
        name: "plugins",

        components: {
            "tab": Tab
        },

        props: {
            section: String
        },

        computed: {
            connected() {
                return this.$store.state.connected;
            }
        },

        methods: {
            navigate(section) {
                this.section = section;
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
        overflow: hidden;
    }

    #loader {
        margin: 7em auto;
        width: 350px;
    }
</style>
