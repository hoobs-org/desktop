<template>
    <div>
        <component v-if="menu" :key="menu.name" :is="menu.component" :options="menu.options"></component>
    </div>
</template>

<script>
    export default {
        name: "menu-view",

        data() {
            return {
                menu: null,
            };
        },

        async created() {
            this.$menu.on("open", (menu) => {
                this.menu = menu;
            });

            this.$menu.on("close", () => {
                this.menu = null;
            });
        },
    };
</script>
