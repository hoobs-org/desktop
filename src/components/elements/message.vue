<template>
    <span id="message">
        <span v-if="value.level === 'debug'" class="content">
            <span class="dim">{{ new Date(value.timestamp).toLocaleString() }}</span>
            <span v-if="value.bridge !== 'hub'" v-on:click="navigation('bridges', value.bridge)" class="bridge" :style="bridge(value.display)">{{ value.display }}</span>
            <span v-on:click="navigation('config', value.plugin)" class="prefix" :style="prefix(value.plugin)">{{ value.prefix }}</span>
            <span>{{ value.message }}</span>
        </span>
        <span v-else-if="value.level === 'error'" class="content">
            <span class="dim">{{ new Date(value.timestamp).toLocaleString() }}</span>
            <span v-if="value.bridge !== 'hub'" v-on:click="navigation('bridges', value.bridge)" class="bridge" :style="bridge(value.display)">{{ value.display }}</span>
            <span v-on:click="navigation('config', value.plugin)" class="prefix" :style="prefix(value.plugin)">{{ value.prefix }}</span>
            <span class="error">{{ $t("error") }}</span>
            <span class="error-text">{{ value.message }}</span>
        </span>
        <span v-else-if="value.level === 'warn'" class="content">
            <span class="dim">{{ new Date(value.timestamp).toLocaleString() }}</span>
            <span v-if="value.bridge !== 'hub'" v-on:click="navigation('bridges', value.bridge)" class="bridge" :style="bridge(value.display)">{{ value.display }}</span>
            <span v-on:click="navigation('config', value.plugin)" class="prefix" :style="prefix(value.plugin)">{{ value.prefix }}</span>
            <span class="warning">{{ $t("warning") }}</span>
            <span class="warning-text">{{ value.message }}</span>
        </span>
        <span v-else-if="value.level === 'info'" class="content">
            <span class="dim">{{ new Date(value.timestamp).toLocaleString() }}</span>
            <span v-if="value.bridge !== 'hub'" v-on:click="navigation('bridges', value.bridge)" class="bridge" :style="bridge(value.display)">{{ value.display }}</span>
            <span v-on:click="navigation('config', value.plugin)" class="prefix" :style="prefix(value.plugin)">{{ value.prefix }}</span>
            <span class="text">{{ value.message }}</span>
        </span>
    </span>
</template>

<script>
    import ColorScheme from "color-scheme";

    export default {
        name: "message",

        props: {
            value: Object,
        },

        methods: {
            analogic(value, double) {
                const scheme = new ColorScheme();

                scheme.from_hex(value.replace("#", "").toUpperCase());
                scheme.scheme("analogic");
                scheme.variation("hard");

                if (double) {
                    return this.analogic(scheme.colors()[7]);
                }

                return `#${scheme.colors()[7]}`;
            },

            bridge(value) {
                let hash = 0;

                for (let i = 0; i < value.length; i += 1) hash = value.charCodeAt(i) + ((hash << 6) - hash);

                const hex = (hash & 0x00FFFFFF).toString(16).toLowerCase();

                return `color: ${this.analogic("000000".substring(0, 6 - hex.length) + hex)};`;
            },

            prefix(value) {
                const sample = `${value}${value}`;

                let hash = 0;

                for (let i = sample.length - 1; i >= 0; i -= 1) hash = sample.charCodeAt(i) + ((hash << 6) - hash);

                const hex = (hash & 0x00FFFFFF).toString(16).toLowerCase();

                return `color: ${this.analogic("000000".substring(0, 6 - hex.length) + hex, true)};`;
            },

            navigation(route, value) {
                this.$router.push({ path: `/${route}/${encodeURIComponent(value)}` });
            },
        },
    };
</script>

<style lang="scss" scoped>
    #message {
        display: block;
        unicode-bidi: embed;
        font-family: monospace;
        white-space: pre-wrap;
        color: var(--application-text);
        margin: 0 0 1px 0;

        .warning {
            text-transform: uppercase;
            color: var(--application-background);
            background: #feb400;
            padding: 0 7px;
        }

        .error {
            text-transform: uppercase;
            color: var(--application-background);
            background: #c20101;
            padding: 0 7px;
        }

        .content {
            white-space: pre-wrap;

            span {
                margin: 0 7px 0 0;

                &:empty {
                    display: none;
                }
            }
        }

        .dim {
            opacity: 0.4;
        }

        .text {
            color: var(--application-highlight-text);
        }

        .warning-text {
            color: #feb400;
        }

        .error-text {
            color: #c20101;
        }

        .bridge {
            cursor: pointer;

            &:hover {
                text-decoration: underline;
            }
        }

        .prefix {
            cursor: pointer;

            &:hover {
                text-decoration: underline;
            }
        }
    }
</style>
