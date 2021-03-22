<template>
    <div id="field">
        <div class="action">
            <div class="button primary" v-on:click="link">{{ $t("link_account") }}</div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "gsh",

        props: {
            value: [Object, String, Number, Boolean, Array],
        },

        data() {
            return {
                token: "",
                dialog: null,
                interval: null,
            };
        },

        mounted() {
            this.token = this.value;
        },

        methods: {
            link() {
                window.addEventListener("message", this.message, false);

                const left = (window.screen.width / 2) - (760 / 2);
                const top = ((window.screen.height / 2) - (760 / 2)) / 2;

                this.dialog = window.open(
                    "https://homebridge-gsh.iot.oz.nu/link-account",
                    "google-home",
                    `toolbar=no,status=no,menubar=no,resizable=yes,width=760,height=760,top=${top},left=${left}`,
                );

                this.interval = setInterval(() => { this.dialog.postMessage("origin-check", "https://homebridge-gsh.iot.oz.nu"); }, 2000);
            },

            message(event) {
                if (event.origin === "https://homebridge-gsh.iot.oz.nu") {
                    try {
                        const data = JSON.parse(event.data);

                        if (data.token) this.update(data.token);
                    } catch (_error) { /* NULL */ }
                }
            },

            update(token) {
                if (this.interval) clearInterval(this.interval);
                if (this.dialog) this.dialog.close();

                window.removeEventListener("message", this.message);

                this.interval = null;
                this.dialog = null;
                this.token = token;

                this.$emit("input", this.token);
                this.$emit("change", this.token);
                this.$emit("save");
            },
        },
    };
</script>

<style lang="scss" scoped>
    #field {
        display: flex;
        flex-direction: column;
        padding: 0 10px 10px 0;

        .action {
            padding: 0;
        }
    }
</style>
