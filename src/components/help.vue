<template>
    <div id="help">
        <h1>{{ $t("welcome_message_hoobs") }}</h1>
        <span>{{ $t("pronounced_hoobs") }}</span>
        <p>
            {{ $t("help_welcome") }}
        </p>
        <h2>{{ $t("documentation") }}</h2>
        <p>
            <ul>
                <li v-on:click="$browse('https://github.com/hoobs-org/HOOBS/wiki/1.0-Community')">{{ $t("community") }}</li>
                <li v-on:click="$browse('https://github.com/hoobs-org/HOOBS/wiki/2.0-Getting-Started')">{{ $t("getting_started") }}</li>
                <li v-on:click="$browse('https://github.com/hoobs-org/HOOBS/wiki/3.0-User-Interface')">{{ $t("user_interface") }}</li>
                <li v-on:click="$browse('https://github.com/hoobs-org/HOOBS/wiki/4.0-Plugins')">{{ $t("plugins") }}</li>
                <li v-on:click="$browse('https://github.com/hoobs-org/HOOBS/wiki/5.0-Hardware')">{{ $t("hardware") }}</li>
                <li v-on:click="$browse('https://github.com/hoobs-org/HOOBS/wiki/7.0-Legal')">{{ $t("legal") }}</li>
                <li v-on:click="$browse('https://github.com/hoobs-org/HOOBS/wiki/8.0-Credits')">{{ $t("credits") }}</li>
            </ul>
        </p>
    </div>
</template>

<script>
    export default {
        name: "help"
    }
</script>

<style scoped>
    #help {
        text-align: left;
        font-size: 12px;
        user-select: none;
        cursor: default;
    }

    #help h1 {
        margin: 0 0 7px 0;
        padding: 0 0 7px 0;
        line-height: normal;
        font-size: 20px;
        color: #feb400;
        border-bottom: 1px #e5e5e5 solid;
    }

    #help h2 {
        margin: 20px 0 0 0;
        padding: 0;
        line-height: normal;
        font-size: 18px;
    }

    #help ul {
        margin: 0 0 0 7px;
        padding: 0 0 0 1em;
        list-style: none;
    }

    #help ul li {
        padding: 3px 0;
        font-size: 12px;
        font-weight: bold;
        color: #feb400;
        cursor: pointer;
    }

    #help ul li:hover {
        text-decoration: underline;
    }
</style>