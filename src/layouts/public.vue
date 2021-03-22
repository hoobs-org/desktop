<template>
    <div id="public">
        <context :login="true" />
        <slot />
    </div>
</template>

<script>
    export default {
        name: "public",
    };
</script>

<style lang="scss">
    #public {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        font-family: "Montserrat", sans-serif;
        color: var(--application-text);
        background-image: var(--backdrop);
        background-repeat: no-repeat;
        background-position: center center;
        background-size: cover;
        overflow: hidden;
    }
</style>
