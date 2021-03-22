<template>
    <div>
        <component v-for="(dialog) in dialogs" :key="dialog.name" :is="dialog.component" :options="dialog.options"></component>
    </div>
</template>

<script>
    export default {
        name: "dialog-view",

        data() {
            return {
                dialogs: [],
            };
        },

        async created() {
            this.$dialog.on("state", (dialogs) => {
                this.$menu.close();
                this.dialogs = dialogs;
            });
        },
    };
</script>
