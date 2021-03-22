import Request from "axios";
import EventEmitter from "events";

import { getMAC } from "node-arp";
import { CancelToken } from "cancel-token";
import { networkInterfaces } from "os";
import { fromLong, toLong, cidrSubnet } from "ip";
import Vue, { VueConstructor } from "vue";

export default class Scanner extends EventEmitter {
    declare timeout: number;

    declare stopped: boolean;

    declare timer: NodeJS.Timeout | undefined;

    declare total: number;

    declare count: number;

    constructor(timeout?: number) {
        super();

        this.timeout = timeout || 100;
        this.stopped = true;

        this.total = 0;
        this.count = 0;
    }

    async start(...ports: number[]): Promise<void> {
        if (this.stopped) {
            this.stopped = false;

            this.total = 0;
            this.count = 0;

            const subnets = this.subnets();

            this.emit("start");
            this.emit("progress", 0);

            for (let i = 0; i < subnets.length; i += 1) {
                if (this.stopped) {
                    break;
                } else {
                    for (let j = 0; j < ports.length; j += 1) {
                        this.subnet(subnets[i].start, subnets[i].end, ports[j]);
                    }
                }
            }
        }
    }

    async subnet(start: number, end: number, port: number): Promise<void> {
        for (let l = start, r = end; l <= r; l += 1, r -= 1) {
            if (this.stopped) {
                break;
            } else {
                this.emit("progress", Math.round((((this.count + 2) * 100) / this.total) * 10) / 10);

                const waits: Promise<void>[] = [];

                waits.push(new Promise((resolve) => {
                    this.detect(fromLong(l), port).then((response) => {
                        if (response) {
                            this.emit("device", {
                                ip: fromLong(l),
                                mac: response.mac,
                                port,
                                application: response.application,
                                version: response.version,
                            });

                            resolve();
                        } else {
                            resolve();
                        }
                    });
                }));

                waits.push(new Promise((resolve) => {
                    this.detect(fromLong(r), port).then((response) => {
                        if (response) {
                            this.emit("device", {
                                ip: fromLong(r),
                                mac: response.mac,
                                port,
                                application: response.application,
                                version: response.version,
                            });

                            resolve();
                        } else {
                            resolve();
                        }
                    });
                }));

                await Promise.all(waits);

                this.count += 2;

                if (this.count >= this.total) {
                    this.emit("stop");
                }
            }
        }
    }

    subnets(): { [key: string]: number }[] {
        const ifaces = networkInterfaces();
        const subnets: { [key: string]: number }[] = [];
        const keys = Object.keys(ifaces);

        for (let i = 0; i < keys.length; i += 1) {
            for (let j = 0; j < (ifaces[keys[i]] || []).length; j += 1) {
                if ((ifaces[keys[i]] || [])[j].family === "IPv4" && !(ifaces[keys[i]] || [])[j].internal) {
                    const details = cidrSubnet((ifaces[keys[i]] || [])[j].cidr || "");

                    this.total += (toLong(details.lastAddress) - toLong(details.firstAddress));

                    subnets.push({
                        start: toLong(details.firstAddress),
                        end: toLong(details.lastAddress),
                    });
                }
            }
        }

        return subnets;
    }

    detect(ip: string, port: number): Promise<{ [key: string]: string | undefined } | undefined> {
        return new Promise((resolve) => {
            const source = CancelToken.source();

            setTimeout(() => {
                source.cancel();
            }, this.timeout);

            if (!this.stopped) {
                Request({
                    method: "get",
                    url: `http://${ip}:${port}/api`,
                    timeout: this.timeout,
                    cancelToken: source.token,
                }).then(async (response) => {
                    if (response && response.data && response.data.application === "hoobsd" && response.data.version) {
                        resolve({
                            application: response.data.application,
                            version: response.data.version,
                            mac: await this.identify(ip),
                        });
                    } else {
                        resolve(undefined);
                    }
                }).catch(() => {
                    resolve(undefined);
                });
            } else {
                resolve(undefined);
            }
        });
    }

    identify(ip: string): Promise<string | undefined> {
        return new Promise((resolve) => {
            getMAC(ip, (error: any, mac: string) => {
                if (!error && mac) {
                    resolve(mac);
                } else {
                    resolve(undefined);
                }
            });
        });
    }

    stop(): void {
        this.stopped = true;

        this.total = 0;
        this.count = 0;

        if (this.timer) {
            clearTimeout(this.timer);
        }

        this.timer = undefined;

        this.emit("stop");
    }

    install(vue: VueConstructor<Vue>): void {
        vue.mixin({
            computed: {
                $scanner: () => this,
            },
        });
    }
}
