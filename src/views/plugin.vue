<!-------------------------------------------------------------------------------------------------
 | hoobs-desktop                                                                                  |
 | Copyright (C) 2020 HOOBS                                                                       |
 |                                                                                                |
 | This program is free software: you can redistribute it and/or modify                           |
 | it under the terms of the GNU General Public License as published by                           |
 | the Free Software Foundation, either version 3 of the License, or                              |
 | (at your option) any later version.                                                            |
 |                                                                                                |
 | This program is distributed in the hope that it will be useful,                                |
 | but WITHOUT ANY WARRANTY; without even the implied warranty of                                 |
 | MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the                                  |
 | GNU General Public License for more details.                                                   |
 |                                                                                                |
 | You should have received a copy of the GNU General Public License                              |
 | along with this program.  If not, see <http://www.gnu.org/licenses/>.                          |
 -------------------------------------------------------------------------------------------------->

<template>
    <div :key="version" v-if="user.permissions.plugins" id="plugin">
        <context />
        <div class="content">
            <list value="id" display="display" :values="sections" :selected="from" initial="library" controller="plugins" :query="query" />
            <div v-if="!loading" class="screen">
                <div class="header">
                    <div v-if="!plugin.deleted" class="image">
                        <img :src="icon()" />
                    </div>
                    <div v-if="plugin.deleted" class="title">
                        <h1>{{ $hoobs.repository.title(plugin.name) }}</h1>
                    </div>
                    <div v-else class="title">
                        <rating :value="plugin.rating" />
                        <h1>{{ $hoobs.repository.title(plugin.name) }}</h1>
                        <div v-if="((plugin.tags && plugin.tags.latest) || plugin.version)" class="version">{{ plugin.version || plugin.tags.latest }} • Published {{ $hoobs.dates.age(plugin.published) }}</div>
                    </div>
                </div>
                <div class="header">
                    <div v-if="plugin.deleted" class="actions">
                        <router-link :to="navigate('plugins', from, query)" class="button">{{ $t("back") }}</router-link>
                        <div v-on:click="uninstall()" class="button">{{ $t("plugin_uninstall") }}</div>
                        <router-link :to="`/config/${identifier}`" class="button primary">{{ $t("configuration") }}</router-link>
                    </div>
                    <div v-else class="actions">
                        <router-link :to="navigate('plugins', from, query)" class="button">{{ $t("back") }}</router-link>
                        <div v-if="installed.length > 0" v-on:click="uninstall()" class="button">{{ $t("plugin_uninstall") }}</div>
                        <div v-if="!updated" v-on:click="update()" class="button">{{ $t("plugin_update") }}</div>
                        <div v-on:click="install()" :class="installed.length > 0 ? 'button' : 'button primary'">{{ $t("plugin_install") }}</div>
                        <router-link v-if="installed.length > 0" :to="`/config/${identifier}`" class="button primary">{{ $t("configuration") }}</router-link>
                    </div>
                </div>
                <tabs v-if="!plugin.deleted" :values="tabs" v-on:change="change" :value="section" class="tabs" />
                <div ref="layout" class="layout">
                    <div v-if="section === 'details'" :class="plugin.deleted ? 'section tight' : 'section'">
                        <div class="markdown" v-html="readme()"></div>
                    </div>
                    <div v-if="section === 'reviews'" class="section">
                        <reviews :identifier="identifier" />
                    </div>
                    <div v-if="section === 'versions'" class="section">
                        <div class="heading">{{ $t("tags") }}</div>
                        <div v-for="(tag, index) in releases.tags" :key="`tag:${index}`" class="version">
                            <icon v-on:click="install(tag.tag, true)" name="download" class="icon" :title="$t('plugin_install')" />
                            <div v-on:click="install(tag.tag, true)" class="value">{{ tag.version }}</div>
                            <div class="fill"></div>
                            <div class="value">{{ tag.tag }}</div>
                        </div>
                        <div class="heading">{{ $t("releases") }}</div>
                        <div v-for="(release, index) in releases.versions" :key="`version:${index}`" class="version">
                            <icon v-on:click="install(release.version, true)" name="download" class="icon" :title="$t('plugin_install')" />
                            <div v-on:click="install(release.version, true)" class="value" :title="$t('plugin_install')">{{ release.version }}</div>
                            <div class="fill"></div>
                            <div class="value">{{ $hoobs.dates.age(release.published) }}</div>
                        </div>
                    </div>
                    <detail :plugin="plugin" :installed="installed" />
                </div>
            </div>
            <div v-else class="loading">
                <spinner />
            </div>
        </div>
    </div>
</template>

<script>
    import { shell } from "electron";
    import Semver from "compare-versions";
    import crypto from "crypto";
    import identicon from "identicon.js";

    import TabsComponent from "@/components/elements/tabs.vue";
    import ListComponent from "@/components/elements/list.vue";
    import DetailComponent from "@/components/elements/detail.vue";
    import RatingComponent from "@/components/elements/rating.vue";
    import ReviewsComponent from "@/components/elements/reviews.vue";

    window.$open = (href) => {
        shell.openExternal(href);
    };

    export default {
        name: "plugin",

        components: {
            "tabs": TabsComponent,
            "list": ListComponent,
            "detail": DetailComponent,
            "rating": RatingComponent,
            "reviews": ReviewsComponent,
        },

        props: {
            name: String,
            scope: String,
        },

        computed: {
            user() {
                return this.$store.state.user;
            },

            updated() {
                return this.installed.filter((item) => !item.updated).length === 0;
            },
        },

        watch: {
            section() {
                this.top();
            },
        },

        data() {
            return {
                version: 0,
                loading: true,
                tabs: [
                    {
                        value: "details",
                        display: this.$t("details"),
                    },
                    {
                        value: "reviews",
                        display: this.$t("reviews"),
                    },
                    {
                        value: "versions",
                        display: this.$t("versions"),
                    },
                ],
                section: "details",
                sections: [],
                bridges: [],
                identifier: "",
                installed: [],
                available: [],
                plugin: {},
                releases: {},
                query: "",
                from: "",
            };
        },

        beforeRouteEnter(_to, from, next) {
            next((view) => {
                const incoming = view;
                const action = (from.path || "").split("/").pop();

                incoming.query = Object.keys(from.query).map((item) => `${item}=${from.query[item]}`).join("&");

                if (from.path === "/plugins") incoming.from = "library";
                if (action !== "" && action !== "plugins") incoming.from = action;
            });
        },

        async mounted() {
            this.identifier = this.name && this.name !== "" ? `${this.scope}/${this.name}` : this.scope;
            this.load(this.identifier);
        },

        methods: {
            async load(identifier) {
                this.loading = true;

                this.installed = [];
                this.available = [];
                this.plugin = {};
                this.active = null;
                this.current = null;
                this.homepage = null;
                this.repository = null;
                this.downloads = {};
                this.releases = {};

                this.bridges = (await this.$hoobs.bridges.list()).filter((item) => item.type === "bridge");

                this.bridges.sort((a, b) => {
                    if (a.display < b.display) return -1;
                    if (a.display > b.display) return 1;

                    return 0;
                });

                this.sections = [{
                    id: "library",
                    display: this.$t("library"),
                }, ...this.bridges];

                if (identifier && identifier !== "") {
                    this.plugin = await this.$hoobs.repository.details(identifier);

                    if (this.plugin) {
                        this.releases = this.versions(this.plugin);
                    } else {
                        this.plugin = {
                            deleted: true,
                            name: identifier,
                            version: "0.1",
                            latest: "0.1",
                        };
                    }

                    const waits = [];

                    for (let i = 0; i < this.bridges.length; i += 1) {
                        if (this.bridges[i].type === "bridge") {
                            waits.push(new Promise((resolve) => {
                                this.$hoobs.bridge(this.bridges[i].id).then((bridge) => {
                                    if (bridge) {
                                        bridge.plugins.list().then((results) => {
                                            const plugin = results.find((item) => item.identifier === identifier);

                                            if (plugin) {
                                                this.installed.push({
                                                    id: this.bridges[i].id,
                                                    display: this.bridges[i].display,
                                                    version: plugin.version,
                                                    updated: Semver.compare(plugin.version, plugin.latest, ">="),
                                                });
                                            }

                                            resolve();
                                        });
                                    } else {
                                        resolve();
                                    }
                                });
                            }));
                        }
                    }

                    Promise.all(waits).then(() => {
                        this.intersect();
                        this.loading = false;
                    });
                } else {
                    this.loading = false;
                }
            },

            install(tag, all) {
                this.$dialog.open("bridges", {
                    type: "install",
                    plugin: this.plugin,
                    values: all ? [...this.available, ...this.installed] : this.available,
                    select: (data) => {
                        const waits = [];
                        let success = false;

                        if (typeof data === "string") {
                            waits.push(new Promise((resolve) => {
                                this.$hoobs.bridge(data).then((bridge) => {
                                    if (bridge) {
                                        bridge.plugins.install(`${this.identifier}@${tag || "latest"}`).then((result) => {
                                            success = result;

                                            resolve();
                                        });
                                    } else {
                                        resolve();
                                    }
                                });
                            }));
                        } else {
                            waits.push(new Promise((resolve) => {
                                this.$hoobs.bridges.add(data.display, data.port, data.pin, data.username, data.advertiser, `${this.identifier}@${tag || "latest"}`).then((result) => {
                                    success = result;

                                    resolve();
                                });
                            }));
                        }

                        if (success) {
                            this.$dialog.close("bridges");
                            this.load(this.identifier);
                        } else {
                            this.$dialog.close("bridges");
                            this.$alert(this.$t("plugin_install_failed"));
                        }
                    },
                });
            },

            uninstall() {
                this.$dialog.open("bridges", {
                    type: "uninstall",
                    plugin: this.plugin,
                    values: this.installed,
                    select: (id, remove) => {
                        this.$hoobs.bridge(id).then((bridge) => {
                            const waits = [];
                            let success = false;

                            if (bridge) {
                                waits.push(new Promise((resolve) => {
                                    bridge.plugins.uninstall(this.identifier).then((result) => {
                                        success = result;

                                        if (success && remove) {
                                            bridge.plugins.list().then((plugins) => {
                                                if (plugins.length === 0) {
                                                    bridge.remove().then(() => resolve());
                                                } else {
                                                    resolve();
                                                }
                                            });
                                        } else {
                                            resolve();
                                        }
                                    });
                                }));
                            }

                            Promise.all(waits).then(() => {
                                if (success && this.plugin.deleted) {
                                    this.$dialog.close("bridges");

                                    if (bridge) {
                                        this.$router.push({ path: `/plugins/${bridge.id}` });
                                    } else {
                                        this.$router.push({ path: "/plugins" });
                                    }
                                } else if (success) {
                                    this.$dialog.close("bridges");
                                    this.load(this.identifier);
                                } else {
                                    this.$dialog.close("bridges");
                                    this.$alert(this.$t("plugin_uninstall_failed"));
                                }
                            });
                        });
                    },
                });
            },

            update() {
                this.loading = true;

                const waits = [];

                for (let i = 0; i < this.installed.length; i += 1) {
                    waits.push(new Promise((resolve) => {
                        this.$hoobs.bridge(this.installed[i].id).then((bridge) => {
                            bridge.plugins.upgrade(`${this.identifier}@latest`).then(() => {
                                resolve();
                            });
                        });
                    }));
                }

                Promise.all(waits).then(() => this.load(this.identifier));
            },

            locate(ref) {
                let element = null;

                if (this.$refs[ref].constructor.name === "HTMLDivElement") {
                    element = this.$refs[ref];
                } else if (this.$refs[ref].constructor.name === "Array" && this.$refs[ref][0].constructor.name === "HTMLDivElement") {
                    element = this.$refs[ref][0]; // eslint-disable-line prefer-destructuring
                }

                if (element) {
                    try {
                        return {
                            element,
                            position: element.getBoundingClientRect(),
                        };
                    } catch (_error) {
                        return null;
                    }
                }

                return null;
            },

            versions(plugin) {
                const tags = Object.keys(plugin.tags || {}).filter((tag) => plugin.times[plugin.tags[tag]]).map((tag) => ({
                    tag,
                    version: plugin.tags[tag],
                    published: plugin.times[plugin.tags[tag]],
                }));

                const versions = Object.keys(plugin.versions).reverse().filter((key) => plugin.times[key]).map((key) => ({
                    version: key,
                    published: plugin.times[key],
                }));

                return {
                    tags,
                    versions,
                };
            },

            intersect() {
                const bridges = this.bridges.filter((item) => item.type === "bridge").map((item) => item.id);
                const installed = this.installed.map((item) => item.id);
                const available = bridges.filter((item) => item !== "library" && installed.indexOf(item) === -1);

                this.available = [];

                for (let i = 0; i < available.length; i += 1) {
                    const bridge = this.bridges.find((item) => item.id === available[i]);

                    if (bridge) {
                        this.available.push({
                            id: bridge.id,
                            display: bridge.display,
                        });
                    }
                }
            },

            change(value) {
                this.section = value;
            },

            readme() {
                if (this.plugin.deleted) return this.$t("plugin_deleted");

                const { latest } = (this.plugin.tags || {});

                if (this.plugin.override_readme && this.plugin.curated && this.plugin.curated !== "") return this.$markdown(this.plugin.curated);
                if (latest && this.plugin.versions[latest] && this.plugin.versions[latest].readme && this.plugin.versions[latest].readme !== "") return this.$markdown(this.plugin.versions[latest].readme);

                if (this.plugin.versions) {
                    const keys = Object.keys(this.plugin.versions).reverse();

                    for (let i = 0; i < keys.length; i += 1) {
                        if ((!latest || Semver.compare(keys[i], latest, "<=")) && this.plugin.versions[keys[i]].readme && this.plugin.versions[keys[i]].readme !== "") {
                            return this.$markdown(this.plugin.versions[keys[i]].readme);
                        }
                    }
                }

                if (this.plugin.details && this.plugin.details !== "") return this.$markdown(this.plugin.details);

                return this.$markdown(this.plugin.description);
            },

            navigate(controller, action, query) {
                let path = `/${controller}`;

                if (action && action !== "") path = `${path}/${action}`;
                if (query && query !== "") path = `${path}?${query}`;

                return path;
            },

            icon() {
                if (this.plugin.deleted) return "";
                if (this.plugin.icon) return this.plugin.icon;

                const hash = crypto.createHash("md5").update(this.plugin.name).digest("hex");

                return `data:image/png;base64,${new identicon(hash, { background: [0, 0, 0, 0], size: 128 }).toString()}`; // eslint-disable-line new-cap
            },

            top() {
                this.$refs.layout.scrollTo(0, 0);
            },
        },
    };
</script>

<style lang="scss" scoped>
    #plugin {
        position: relative;
        display: flex;
        flex-direction: column;
        overflow: hidden;

        .content {
            flex: 1;
            display: flex;
            overflow: hidden;

            .screen {
                flex: 1;
                display: flex;
                margin: 0 20px 20px 10px;
                color: var(--widget-text);
                background: var(--widget-background);
                backdrop-filter: var(--transparency);
                overflow: hidden;

                .header {
                    max-width: 950px;
                    display: flex;
                    flex-direction: row;
                    align-items: flex-end;
                    margin: 20px 10px 10px 20px;
                    user-select: none;

                    .button {
                        margin-bottom: 10px;
                    }

                    .image {
                        margin: 0 10px 0 0;
                        border: 1px var(--application-border) solid;
                        border-radius: 3px;

                        img {
                            width: 63px;
                            height: 63px;
                        }
                    }

                    .title {
                        flex: 1;

                        h1 {
                            margin: 0;
                            padding: 0;
                            line-height: normal;
                            font-size: 30px;
                            color: var(--application-highlight);
                        }

                        .version {
                            font-size: 14px;
                        }
                    }

                    .actions {
                        display: flex;
                        flex-direction: row;
                        justify-content: flex-start;
                    }
                }

                .tabs {
                    margin: 20px 20px 0 20px;
                }

                .layout {
                    flex: 1;
                    padding: 0 20px 0 0;
                    display: flex;
                    flex-direction: row;
                    overflow: hidden;

                    .section {
                        flex: 1;
                        padding: 20px 0 20px 20px;
                        margin: 0 20px 0 0;
                        max-width: 950px;
                        overflow-wrap: break-word;
                        overflow: auto;

                        &.tight {
                            padding: 0 0 20px 20px;
                        }

                        .heading {
                            display: flex;
                            flex-direction: row;
                            padding: 20px 0 10px 0;
                            border-bottom: 1px var(--application-border) solid;
                            color: var(--application-highlight);
                            margin: 0 10px 20px 7px;
                            user-select: none;

                            &:first-child {
                                padding: 0 0 10px 0;
                            }
                        }

                        .version {
                            display: flex;
                            flex-direction: row;
                            margin: 0 10px 0 7px;
                            font-size: 14px;
                            user-select: none;

                            .value {
                                white-space: nowrap;
                                cursor: pointer;

                                &:last-child {
                                    cursor: default;
                                }
                            }

                            .icon {
                                height: 17px;
                                padding: 0 7px 0 0;
                                cursor: pointer;
                                opacity: 0.7;

                                &:hover {
                                    opacity: 1;
                                }
                            }

                            &:hover {
                                .value {
                                    font-weight: bold;
                                }
                            }

                            .fill {
                                flex: 1;
                                margin: 0 7px;
                                height: 8px;
                                border-bottom: 1px var(--application-border) dashed;
                            }
                        }
                    }
                }

                .nav {
                    display: flex;
                    flex-direction: row;
                    padding: 20px 0 10px 0;
                    border-bottom: 1px var(--application-border) solid;
                    margin: 0 0 0 7px;
                    user-select: none;

                    &:first-child {
                        padding: 0 0 10px 0;
                    }
                }
            }
        }
    }
</style>

<style lang="scss">
    .chart {
        flex: 1;
        height: 40px;
        overflow: hidden;

        svg {
            margin: 0;
        }

        .stroke {
            stroke: var(--application-highlight);
        }

        .fill {
            fill: var(--application-highlight);
            opacity: 0.3;
        }

        .active-line {
            stroke: var(--application-border);
        }

        .point {
            display: none;
        }

        .point.is-active {
            &.is-active {
                display: block;
            }
        }
    }
</style>
