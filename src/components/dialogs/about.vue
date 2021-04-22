<template>
    <modal :title="$t('about')" :draggable="true" width="740px" height="547px">
        <div id="about">
            <div class="content">
                <div class="form">
                    <div class="row section">{{ $t("software") }}</div>
                    <div class="row" style="margin-bottom: 7px;">{{ $t("version") }}: {{ version }}</div>
                    <div class="row">
                        <div v-on:click="upgrades()" class="button">{{ $t("check_updates") }}</div>
                    </div>
                    <div class="row section">{{ $t("license") }}</div>
                    <div class="row">{{ $t("license_title") }}</div>
                    <p>{{ $t("license_summary") }}</p>
                    <div class="row">
                        <div>
                            <a href="https://support.hoobs.org/docs/5e7649bee87d1e02b6c19d48" target="_blank">{{ $t("terms_conditions") }}</a>
                            <br />
                            <a href="https://support.hoobs.org/docs/5e8f6c790ab68b0344e872d8" target="_blank">{{ $t("privacy_policy") }}</a>
                            <br />
                            <a href="https://support.hoobs.org/docs/5e763ca9e87d1e02b6c19d2f" target="_blank">{{ $t("open_source") }}</a>
                            <br />
                        </div>
                    </div>
                </div>
            </div>
            <div class="actions modal">
                <div v-on:click="donate()" class="button">{{ $t("donate") }}</div>
                <div v-on:click="$dialog.close('about')" class="button primary">{{ $t("ok") }}</div>
            </div>
        </div>
    </modal>
</template>

<script>
    export default {
        name: "about",

        data() {
            return {
                version: "",
            };
        },

        async mounted() {
            this.version = await this.$hoobs.version();
        },

        methods: {
            donate() {
                window.open("https://paypal.me/hoobsorg");
            },

            upgrades() {
                this.$dialog.close("about");
                this.$dialog.open("updates");
            },
        },
    };
</script>

<style lang="scss" scoped>
    #about {
        flex: 1;
        display: flex;
        flex-direction: column;
        margin: 0 0 0 10px;
    }
</style>
