<template>
    <modal width="490px" height="220px">
        <div class="content message">{{ options.message }}</div>
        <div class="actions modal">
            <div class="button" v-on:click="cancel()">{{ $t("cancel") }}</div>
            <div class="button primary" v-on:click="execute()">{{ options.button || $t("ok") }}</div>
        </div>
    </modal>
</template>

<script>
    export default {
        name: "confirm",

        props: {
            options: Object,
        },

        methods: {
            cancel() {
                if ((this.options || {}).cancel) this.options.cancel();

                this.$dialog.close("confirm");
            },

            execute() {
                if ((this.options || {}).confirm) this.options.confirm();

                this.$dialog.close("confirm");
            },
        },
    };
</script>
