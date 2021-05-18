<template>
    <div id="detail">
        <div v-if="installed.length > 0" class="title">
            <h1>{{ $t("installed") }}</h1>
        </div>
        <div v-if="installed.length > 0" class="item vertical">
            <div v-for="(item, index) in bridges" :key="`installed:${index}`" class="value smaller">
                <router-link :to="`/bridges/${item.id}`" :style="bridge(item.display)">{{ item.display }}</router-link>
                {{ item.version }}
            </div>
        </div>
        <div v-if="plugin.certified" class="title">
            <h1>{{ $t("certification") }}</h1>
        </div>
        <div v-if="plugin.certified" class="item">
            <div class="tag">
                <svg version="1.1" width="17" height="17" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 94.67 95.72">
                    <path
                        class="background"
                        d="M74.54,0H17.13A17.28,17.28,0,0,0,0,17.32V75.4A17.28,17.28,0,0,0,17.13,92.72H74.54A17.28,17.28,0,0,0,91.67,75.4V17.32A17.28,17.28,0,0,0,74.54,0ZM50,67.47H47v8.1a4.06,4.06,0,
                        0,1-4,4.05h-7.7v-3a5.47,5.47,0,0,0-10.93,0v3h-7.7a4.07,4.07,0,0,1-4.05-4.05V67.88h3a5.47,5.47,0,0,0,0-10.94h-3V49.25a4.07,4.07,0,0,1,4.05-4h8.1v-3a5.07,5.07,0,0,1,10.13,
                        0v3H43a4.06,4.06,0,0,1,4,4v8.1h3a5.06,5.06,0,1,1,0,10.12ZM81.84,32.35a1.69,1.69,0,0,1-1.44,1.36A1.44,1.44,0,0,1,78.71,33c-.66-1.77-2.12-2.84-3.39-4.05a4.51,4.51,0,0,
                        1-1.58-3.84c.08-1,0-2,0-3h0c0-1.33,0-2.65,0-4S73,16.71,72,16.73s-2.13-.17-2.2,1.31c0,1.2,0,2.4,0,3.6,0,.4.2,1-.19,1.15s-.67-.36-1-.62c-2.65-2.49-5.31-5-7.92-7.5a1.32,1.32,0,0,
                        0-2.19,0Q49.91,23.35,41.23,32c-.75.75-.85,1.35,0,2,.19.16.35.35.53.53,1.14,1.11,1.31,1.08,2.52,0,3.78-3.46,7.33-7.16,11-10.74.77-.75,1.58-1.45,2.36-2.19a3.09,3.09,0,0,1,4.63,
                        0c1.58,1.51,3.1,3.1,4.66,4.63,2.89,2.84,5.81,5.65,8.69,8.5,1.89,1.88,1.86,3.54,0,5.45-3,3-4.1,3-7.07,0-2.59-2.55-5.25-5-7.83-7.6-.81-.81-1.42-.72-2.18,0q-4.14,4.2-8.34,
                        8.32c-.74.72-.74,1.31,0,2,.27.26.53.52.78.79a1.19,1.19,0,0,0,2,0c1.47-1.46,3-2.86,4.47-4.29a3.22,3.22,0,0,1,4.76-.11c1.66,1.55,3.29,3.14,4.9,4.75a3.14,3.14,0,0,1,0,4.56c-1.1,
                        1.18-2.28,2.29-3.41,3.43a6.62,6.62,0,0,0-1.79,2.33,1.49,1.49,0,0,1-1.7,1,1.6,1.6,0,0,1-1.48-1.3,1.65,1.65,0,0,1,.87-2c2.37-1.12,3.72-3.35,5.61-5a.86.86,0,0,0,
                        0-1.4l-4.49-4.45c-.6-.6-1.16-.44-1.72.1-1.48,1.44-3,2.85-4.48,4.29a3.27,3.27,0,0,1-4.76.2c-.41-.34-.78-.73-1.16-1.11-1.92-2-1.92-3.65,0-5.56,2.81-2.81,5.61-5.62,8.43-8.41,
                        1.79-1.78,3.48-1.8,5.29-.05L70.79,39c1.2,1.17,1.34,1.15,2.78-.29,1.21-1.23,1.23-1.41,0-2.6C69.39,31.92,65.16,27.79,61,23.63c-.71-.71-1.28-.76-2-.06-1.94,1.91-3.9,3.8-5.86,
                        5.7l-7.73,7.52a3.22,3.22,0,0,1-4.67.11c-3.07-2.77-3.83-4.23-.27-7.64C46,23.94,51.37,18.43,56.81,13c1.95-1.94,3.63-1.94,5.58-.05,1.33,1.29,2.7,2.55,4,3.83.55.53.92.85,1.22-.24a2.74,
                        2.74,0,0,1,2.4-2,14.71,14.71,0,0,1,1.47-.17c3.45-.09,4.66,1.09,4.66,4.54,0,2.06,0,4.13,0,6.2A2.46,2.46,0,0,0,77,27.14c1.33,1.15,2.31,2.69,4,3.4A1.5,1.5,0,0,1,81.84,32.35Z"
                    />
                </svg>
                <span>{{ $t("certified_hoobs") }}</span>
            </div>
        </div>
        <div v-if="plugin.author && (plugin.author.name || plugin.author.username)" class="title">
            <h1>{{ $t("author") }}</h1>
        </div>
        <div v-if="plugin.author && (plugin.author.name || plugin.author.username)" class="item">
            <div class="tag">
                <img class="gravatar" :src="plugin.gravitar" />
                <span>{{ plugin.author.name || plugin.author.username }}</span>
            </div>
        </div>
        <div v-if="downloads.data" class="title">
            <h1>{{ $t("average_weekly_downloads") }}</h1>
        </div>
        <div v-if="downloads.data" class="item" style="padding: 0;">
            <div class="count">
                <div style="flex: 1;">
                    <span v-if="active && current">{{ current }}</span>
                    <span v-else>{{ downloads.average }}</span>
                </div>
                <div class="leader"></div>
            </div>
            <div class="chart">
                <trend-chart :interactive="true" :datasets="[downloads]" :min="1" v-on:mouse-move="weekly" padding="0" />
                <div class="leader"></div>
            </div>
        </div>
        <div class="title">
            <h1>Version</h1>
            <h1>License</h1>
        </div>
        <div class="item">
            <div class="value">{{ plugin.version || plugin.tags.latest }}</div>
            <div class="value">{{ plugin.license || "" }}</div>
        </div>
        <div v-if="support" class="title">
            <h1>{{ $t("support") }}</h1>
        </div>
        <div v-if="support" class="item">
            <div class="value">
                <a href="#" :onclick="`window.$open('${support}');`">
                    <icon name="help-circle" class="icon" />
                    {{ $t("plugin_issues") }}
                </a>
            </div>
        </div>
        <div class="title">
            <h1>{{ $t("homepage") }}</h1>
        </div>
        <div class="item">
            <div class="value">
                <a v-if="homepage" href="#" :onclick="`window.$open('${homepage}');`">
                    <icon name="link" class="icon" />
                    {{ domain(homepage) }}
                </a>
                <a href="#" :onclick="`window.$open('https://plugins.hoobs.org/plugin/${plugin.name}');`">
                    <icon name="link" class="icon" />
                    hoobs.org
                </a>
            </div>
        </div>
        <div v-if="repository" class="title">
            <h1>{{ $t("repository") }}</h1>
        </div>
        <div v-if="repository" class="item">
            <div class="value">
                <a href="#" :onclick="`window.$open('${repository}');`">
                    <icon name="code-tags" class="icon" />
                    {{ domain(repository) }}
                </a>
            </div>
        </div>
        <div class="title">
            <h1>{{ $t("last_publish") }}</h1>
        </div>
        <div class="item">
            <div class="value">{{ $hoobs.dates.age(plugin.published) }}</div>
        </div>
    </div>
</template>

<script>
    import ColorScheme from "color-scheme";

    import TrendChartComponent from "vue-trend-chart";

    export default {
        name: "detail",

        props: {
            plugin: Object,
            installed: Array,
        },

        components: {
            "trend-chart": TrendChartComponent,
        },

        data() {
            return {
                active: null,
                current: null,
                homepage: null,
                repository: null,
                bridges: [],
                support: null,
                downloads: {},
            };
        },

        mounted() {
            this.homepage = this.url(this.plugin.homepage);
            this.repository = this.url((this.plugin.repository || {}).url);
            this.bridges = this.installed;

            this.bridges.sort((a, b) => {
                if (a.id < b.id) return -1;
                if (a.id > b.id) return 1;

                return 0;
            });

            const points = [];

            let sum = 0;
            let total = 0;
            let count = 0;
            let average = 0;
            let last = null;

            if (this.plugin.downloads.length > 0) {
                for (let i = 0; i < this.plugin.downloads.length; i += 1) {
                    if (this.plugin.downloads[i].downloads > 0 || sum > 0) {
                        sum += this.plugin.downloads[i].downloads;
                        total += this.plugin.downloads[i].downloads;
                        last = new Date(this.plugin.downloads[i].day);
                        count += 1;

                        if (i % 7 === 0 && count > 0) {
                            points.push({
                                date: last,
                                value: parseInt((total / count).toFixed(0), 10),
                            });

                            total = 0;
                            count = 0;
                        }
                    }
                }

                if (count > 0) {
                    points.push({
                        date: last,
                        value: parseInt((total / count).toFixed(0), 10),
                    });
                }

                average = parseInt((sum / this.plugin.downloads.length).toFixed(0), 10);
            }

            this.downloads = {
                data: points,
                average,
                smooth: true,
                fill: true,
            };

            if (this.plugin.versions) {
                const version = Object.keys(this.plugin.versions).pop();
                const latest = this.plugin.versions[version];

                if (latest && (latest.bugs || {}).url) this.support = latest.bugs.url;
            }
        },

        methods: {
            weekly(value) {
                this.active = null;
                this.current = null;

                if (value && value.data[0]) {
                    this.active = value.data[0].date;
                    this.current = value.data[0].value;
                }
            },

            url(value) {
                if (!value || value === "") {
                    return null;
                }

                const parts = (value || "").split("//");

                if (parts.length < 2) {
                    return null;
                }

                let ssl = true;

                if (parts[0].endsWith("http:")) {
                    ssl = false;
                }

                if (ssl) {
                    return `https://${parts[1]}`;
                }

                return `http://${parts[1]}`;
            },

            domain(value) {
                return value.replace("http://", "").replace("https://", "").split("/")[0];
            },

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

                return `color: ${this.analogic("000000".substring(0, 6 - hex.length) + hex)} !important;`;
            },
        },
    };
</script>

<style scoped lang="scss">
    #detail {
        max-width: 320px;
        user-select: none;
        overflow: auto;

        .title {
            margin: 20px 0 10px 0;
            display: flex;
            flex-direction: row;

            h1 {
                flex: 1;
                font-size: 14px;
                padding: 0;
                margin: 0;
                line-height: normal;
                opacity: 0.7;
            }
        }

        .item {
            display: flex;
            padding: 0 0 10px 0;
            border-bottom: 1px var(--application-border) solid;

            .count {
                width: 100px;
                display: flex;
                flex-direction: column;
                font-weight: bold;
                font-size: 14px;
            }

            .value {
                flex: 1;

                a {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    text-decoration: none !important;

                    .icon {
                        height: 22px;
                        margin: 0 7px 0 0;
                    }
                }

                &.smaller {
                    font-size: 14px;
                    display: flex;
                    flex-direction: row;

                    a {
                        margin: 0 5px 0 0;

                        &:hover {
                            text-decoration: underline !important;
                        }

                        .icon {
                            height: 14px;
                        }
                    }
                }
            }

            &.vertical {
                flex-direction: column;

                .value {
                    flex: unset;
                }
            }

            .chart {
                flex: 1;
                display: flex;
                flex-direction: column;
                overflow: hidden;

                svg {
                    height: 40px;
                    margin: 0;
                }
            }

            .leader {
                height: 3px;
                background: var(--application-highlight);
                opacity: 0.3;
            }
        }

        .tag {
            flex: 1;
            display: flex;
            flex-direction: row;
            align-content: center;
            align-items: center;
            margin: 0;
            font-size: 14px;

            svg {
                margin: 0 4px 0 0;
            }

            .background {
                fill: var(--application-highlight);
            }

            .gravatar {
                width: 22px;
                height: 22px;
                margin: 0 4px 0 0;
                border-radius: 3px;
            }
        }
    }
</style>
