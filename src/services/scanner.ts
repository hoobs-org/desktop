import Request from "axios";
import EventEmitter from "events";
import Scan from "evilscan";

import { getMAC } from "node-arp";
import { CancelToken } from "cancel-token";
import { networkInterfaces } from "os";
import { cidrSubnet } from "ip";
import Vue, { VueConstructor } from "vue";

interface Subnet {
    network: string;
    broadcast: string;
    hosts: number;
}

interface Canidate {
    ip: string;
    port: number;
}

interface Active {
    ip: string;
    port: number;
    application: string;
    version: string;
    mac?: string;
}

export default class Scanner extends EventEmitter {
    declare stopped: boolean;

    declare total: number;

    declare count: number;

    declare errors: number;

    declare timeout: number;

    constructor() {
        super();

        this.stopped = true;

        this.total = 0;
        this.count = 0;
        this.errors = 0;

        this.timeout = 7 * 1000;
    }

    async start(devices: Active[], ...ports: number[]): Promise<void> {
        if (this.stopped) {
            this.stopped = false;

            this.total = 0;
            this.count = 0;
            this.errors = 0;

            this.emit("start");
            this.emit("clear");
            this.emit("progress", 0);

            const subnets = this.subnets();
            const scanners: Promise<void>[] = [];
            const canidates: Canidate[] = [];
            const active = [...devices];

            this.emit("message", "Checking Existing Connections");

            for (let i = 0; i < active.length; i += 1) {
                const data = await this.detect(active[i].ip, active[i].port);

                if (data) this.emit("device", data);
            }

            this.total = subnets.map((item) => item.hosts).reduce((a, b) => a + b, 0) * ports.length;

            for (let i = 0; i < subnets.length; i += 1) {
                this.emit("message", `Scanning Network: ${subnets[i].network}`);

                scanners.push(new Promise((resolve) => {
                    const scan = new Scan({
                        target: subnets[i].network,
                        port: ports.join(","),
                        status: "TROU",
                        banner: true,
                    });

                    scan.on("result", (data: { [key: string]: any }) => {
                        if (data.status === "open") {
                            canidates.push({ ip: data.ip, port: data.port });
                        } else {
                            this.total -= 1;
                        }
                    });

                    scan.on("done", () => {
                        resolve();
                    });

                    scan.run();
                }));
            }

            Promise.all(scanners).then(async () => {
                this.emit("message", `Checking ${canidates.length} Host(s)`);

                for (let i = 0; i < canidates.length; i += 1) {
                    if (this.stopped) break;

                    const data = await this.detect(canidates[i].ip, canidates[i].port);

                    if (data) this.emit("device", data);

                    this.count += 1;
                    this.emit("progress", Math.round((this.count * 100) / this.total));
                }

                this.stopped = true;

                this.emit("message", "Scan Complete");
                this.emit("stop");
            });
        }
    }

    stop(): void {
        this.stopped = true;
        this.emit("stop");
    }

    private subnets(): Subnet[] {
        const subnets: Subnet[] = [];
        const ifaces = networkInterfaces();
        const keys = Object.keys(ifaces);

        for (let i = 0; i < keys.length; i += 1) {
            for (let j = 0; j < (ifaces[keys[i]] || []).length; j += 1) {
                if ((ifaces[keys[i]] || [])[j].family === "IPv4" && !(ifaces[keys[i]] || [])[j].internal) {
                    const details = cidrSubnet((ifaces[keys[i]] || [])[j].cidr || "");

                    subnets.push({
                        network: `${details.networkAddress}/${details.subnetMaskLength}`,
                        broadcast: details.broadcastAddress,
                        hosts: details.numHosts,
                    });
                }
            }
        }

        return subnets;
    }

    detect(ip: string, port: number, timeout?: number): Promise<Active | undefined> {
        return new Promise((resolve) => {
            let data: Active | undefined;

            const source = CancelToken.source();

            setTimeout(() => {
                source.cancel();
            }, timeout || this.timeout);

            this.emit("message", `Checking: ${ip}:${port}`);

            Request({
                method: "get",
                url: `http://${ip}:${port}/api`,
                timeout: this.timeout,
                cancelToken: source.token,
            }).then(async (response) => {
                if (response && response.data && response.data.application === "hoobsd" && response.data.version) {
                    this.emit("message", `Found HOOBS Device: ${ip}:${port}`);

                    data = {
                        ip,
                        port,
                        application: response.data.application,
                        version: response.data.version,
                        mac: await this.identify(ip),
                    };
                }
            }).catch(() => {
                this.errors += 1;
            }).finally(() => {
                resolve(data);
            });
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

    install(vue: VueConstructor<Vue>): void {
        vue.mixin({
            computed: {
                $scanner: () => this,
            },
        });
    }
}
