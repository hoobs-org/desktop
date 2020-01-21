import _ from "lodash";

import Request from "axios";

export default class Plugins {
    constructor (cache) {
        this.cache = cache;

        this.blocked = [
            "hoobs-core",
            "homebridge",
            "homebridge-server",
            "homebridge-to-hoobs",
            "homebridge-config-ui",
            "homebridge-config-ui-x",
            "homebridge-config-ui-rdp",
            "homebridge-config-ui-hoobs"
        ];
    }

    package(name, version) {
        return new Promise((resolve, reject) => {
            this.lookup().then((database) => {
                const key = `package/${name}${version ? `@${version}` : ""}`;
                const cached = this.cache.get(key);
                const tracked = _.keys(database);

                if (cached) {
                    resolve(cached);
                } else {
                    Request.get(`https://registry.npmjs.org/${encodeURIComponent(name)}`).then(async (response) => {
                        const { ...item } = response.data;
                        const id = (item.name || "").split("/");

                        let stats = {};

                        try {
                            stats = {
                                week: (await Request.get(`https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(name)}`)).data,
                                month: (await Request.get(`https://api.npmjs.org/downloads/point/last-month/${encodeURIComponent(name)}`)).data
                            };
                        } catch {
                            stats = {};
                        }

                        const index = tracked.indexOf(item.name);
                        const tags = item["dist-tags"] || {};

                        if (index >= 0) {
                            tags.certified = database[tracked[index]].version || tags.latest;
                        }

                        if (version === "latest") {
                            version = tags.latest;
                        }

                        const results = {
                            name: id.length === 2 ? id[1] : item.name,
                            scope: id.length === 2 ? id[0].replace(/@/gi, "") : null,
                            certified: (database[item.name] || {}).certified || false,
                            local: false,
                            tags,
                            stats,
                            version: tags.certified || tags.latest,
                            versions: item.versions,
                            node: ((item.versions[tags.certified || tags.latest].engines || {}).node || "10.0.0").replace(/[^\d.]/g, ""),
                            times: item.time,
                            installed: version || false,
                            date: (item.time || {}).modified,
                            author: (item.author || {}).name,
                            description: (item.description || "").replace(/(?:https?|ftp):\/\/[\n\S]+/g, "").trim(),
                            description_details: (database[item.name] || {}).description,
                            homepage: item.homepage,
                            keywords: item.keywords,
                            license: item.license,
                            readme: item.readme
                        };

                        this.cache.set(key, results, 60 * 3);

                        resolve(results);
                    }).catch((error) => {
                        reject(error);
                    });
                }
            }).catch((error) => {
                reject(error);
            });
        });
    }

    recommended() {
        return new Promise((resolve, reject) => {
            const key = "certified/recommended";
            const cached = this.cache.get(key);

            if (cached) {
                resolve(cached);
            } else {
                Request.get(`https://raw.githubusercontent.com/hoobs-org/HOOBS/master/certified/recommended.json`).then((response) => {    
                    this.cache.set(key, response.data, 60 * 3);
    
                    resolve(response.data)
                }).catch((error) => {
                    reject(error);
                });
            }
        });
    }

    lookup() {
        return new Promise((resolve, reject) => {
            const key = "certified/plugins";
            const cached = this.cache.get(key);

            if (cached) {
                resolve(cached);
            } else {
                Request.get(`https://raw.githubusercontent.com/hoobs-org/HOOBS/master/certified/database.json`).then((response) => {    
                    this.cache.set(key, response.data, 60 * 3);
    
                    resolve(response.data)
                }).catch((error) => {
                    reject(error);
                });
            }
        });
    }

    search(search, limit) {
        return new Promise((resolve, reject) => {
            this.lookup().then((database) => {
                const tracked = _.keys(database);

                if (!search || search === "" || search === "recommended") {
                    this.recommended().then((response) => {
                        const results = [];

                        response.objects = response.objects || [];

                        for (let i = 0; i < response.objects.length; i++) {
                            const { ...item } = response.objects[i].package;

                            if (this.blocked.indexOf(item.name || "") === -1) {
                                const id = (item.name || "").split("/");

                                if (tracked.findIndex(p => (database[p].exclude || []).indexOf(item.name) >= 0) === -1) {
                                    results.push({
                                        name: id.length === 2 ? id[1] : item.name,
                                        scope: item.scope === "unscoped" ? null : item.scope,
                                        version: item.version,
                                        certified: (database[item.name] || {}).certified || false,
                                        date: item.date,
                                        description: (item.description || "").replace(/(?:https?|ftp):\/\/[\n\S]+/g, "").trim(),
                                        homepage: item.homepage,
                                        keywords: item.keywords
                                    });
                                }
                            }
                        }

                        resolve(results);
                    }).catch((error) => {
                        reject(error);
                    });
                } else {
                    Request.get(`https://registry.npmjs.org/-/v1/search?text=${search}+keywords:hoobs-plugin%2Chomebridge-plugin&size=${limit}`).then((response) => {    
                        const results = [];

                        response.data.objects = response.data.objects || [];

                        for (let i = 0; i < response.data.objects.length; i++) {
                            const { ...item } = response.data.objects[i].package;

                            if (this.blocked.indexOf(item.name || "") === -1) {
                                const id = (item.name || "").split("/");

                                if (tracked.findIndex(p => (database[p].exclude || []).indexOf(item.name) >= 0) === -1) {
                                    results.push({
                                        name: id.length === 2 ? id[1] : item.name,
                                        scope: item.scope === "unscoped" ? null : item.scope,
                                        version: item.version,
                                        certified: (database[item.name] || {}).certified || false,
                                        date: item.date,
                                        description: (item.description || "").replace(/(?:https?|ftp):\/\/[\n\S]+/g, "").trim(),
                                        homepage: item.homepage,
                                        keywords: item.keywords
                                    });
                                }
                            }
                        }

                        resolve(results);
                    }).catch((error) => {
                        reject(error);
                    });
                }
            }).catch((error) => {
                reject(error);
            });
        });
    }
}
