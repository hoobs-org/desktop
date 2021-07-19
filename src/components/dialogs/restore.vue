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
    <div v-if="!loading" id="restore" class="form">
        <div v-if="files.length > 0" class="row section">{{ $t("restore") }}</div>
        <div v-if="files.length > 0" class="row title">{{ $t("available_backups") }}</div>
        <div v-for="(file, index) in files" :key="`file:${index}`" class="row">
            <radio :id="`file_${index}`" name="filename" :title="format(file.date)" v-model="filename" :value="file.filename" />
        </div>
        <div v-if="files.length > 0" class="row" style="margin-top: 7px;">
            <div v-on:click="restore()" class="button">{{ $t("restore") }}</div>
        </div>
        <div class="row section" style="margin-bottom: 7px;">{{ $t("backup_file") }}</div>
        <div class="row">
            <input type="file" ref="backup" v-on:change="upload()" accept=".backup" hidden />
            <div v-on:click="$refs.backup.click();" class="button">{{ $t("upload_file") }}</div>
        </div>
    </div>
    <div v-else class="status">
        <div class="loading">
            <spinner />
        </div>
        <div class="messages" style="height: 70%;">
            <message v-for="(message, index) in messages" :key="`message:${index}`" :value="message" :compact="true" />
        </div>
    </div>
</template>

<script>
    import MessageComponent from "@/components/elements/message.vue";

    const REDIRECT_DELAY = 1000;

    export default {
        name: "restore",

        components: {
            "message": MessageComponent,
        },

        data() {
            return {
                loading: false,
                logging: true,
                filename: "",
                files: [],
                messages: [],
            };
        },

        async mounted() {
            this.loading = true;

            this.files = await this.$hoobs.backup.catalog(5);

            this.loading = false;
        },

        methods: {
            format(value) {
                const date = new Date(value);

                return date.toLocaleString();
            },

            async restore() {
                if (this.filename !== "") {
                    this.$emit("restore");
                    this.logging = true;
                    this.loading = true;

                    this.$store.subscribe(async (mutation) => {
                        if (mutation.type === "IO:LOG" && this.logging) {
                            if (!mutation.payload.bridge || mutation.payload.bridge === "hub" || mutation.payload.bridge === "") {
                                this.messages.push(mutation.payload);
                                this.messages = this.messages.slice(Math.max(this.messages.length - 25, 0));
                            }

                            if ((mutation.payload.message || "").toLowerCase().indexOf("service restart") >= 0) {
                                this.logging = false;

                                this.messages.push({
                                    level: "info",
                                    bridge: "hub",
                                    display: "hub",
                                    timestamp: new Date().getTime(),
                                    message: "restarting",
                                }, {
                                    level: "info",
                                    bridge: "hub",
                                    display: "hub",
                                    timestamp: new Date().getTime(),
                                    message: ".",
                                });

                                this.messages = this.messages.slice(Math.max(this.messages.length - 25, 0));

                                setInterval(() => {
                                    if (this.messages[this.messages.length - 1].message === ".................................") {
                                        this.messages[this.messages.length - 1].message = ".";
                                    } else {
                                        this.messages[this.messages.length - 1].message += ".";
                                    }
                                }, 500);

                                this.messages = this.messages.slice(Math.max(this.messages.length - 25, 0));
                            }
                        }
                    });

                    await this.$hoobs.restore.file(this.filename);

                    this.$action.on("io", "disconnected", () => {
                        this.$action.emit("io", "reload");

                        setTimeout(() => {
                            this.$dialog.close("settings");
                        }, REDIRECT_DELAY);
                    });
                }
            },

            async upload() {
                if (this.$refs.backup && this.$refs.backup.files[0]) {
                    this.$emit("restore");
                    this.logging = true;
                    this.loading = true;

                    this.$store.subscribe(async (mutation) => {
                        if (mutation.type === "IO:LOG" && this.logging) {
                            if (!mutation.payload.bridge || mutation.payload.bridge === "hub" || mutation.payload.bridge === "") {
                                this.messages.push(mutation.payload);
                                this.messages = this.messages.slice(Math.max(this.messages.length - 25, 0));
                            }

                            if ((mutation.payload.message || "").toLowerCase().indexOf("service restart") >= 0) {
                                this.logging = false;

                                this.messages.push({
                                    level: "info",
                                    bridge: "hub",
                                    display: "hub",
                                    timestamp: new Date().getTime(),
                                    message: "restarting",
                                }, {
                                    level: "info",
                                    bridge: "hub",
                                    display: "hub",
                                    timestamp: new Date().getTime(),
                                    message: ".",
                                });

                                this.messages = this.messages.slice(Math.max(this.messages.length - 25, 0));

                                setInterval(() => {
                                    if (this.messages[this.messages.length - 1].message === ".................................") {
                                        this.messages[this.messages.length - 1].message = ".";
                                    } else {
                                        this.messages[this.messages.length - 1].message += ".";
                                    }

                                    this.messages = this.messages.slice(Math.max(this.messages.length - 25, 0));
                                }, 500);
                            }
                        }
                    });

                    await this.$hoobs.restore.upload(this.$refs.backup.files[0]);

                    this.$action.on("io", "disconnected", () => {
                        this.$action.emit("io", "reload");

                        setTimeout(() => {
                            this.$dialog.close("settings");
                        }, REDIRECT_DELAY);
                    });
                }
            },
        },
    };
</script>
