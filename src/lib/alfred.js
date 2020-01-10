import EventEmitter from "events";

import * as Ping from "ping";
import * as DNS from "dns";
import * as IP from "ip";
import * as Net from "net";
import * as Request from "axios";

export default class Alfred extends EventEmitter {
    constructor(service, port, timeout) {
        super();

        this.service = service;
        this.port = port;
        this.timeout = timeout || 500;

        this.prefix = IP.address();

        if (this.prefix) {
            const parts = this.prefix.split(".");

            if (parts.length === 4) {
                this.prefix = parts.slice(0, -1).join(".");
            }
        }
    }

    async scan() {
        for (let i = 1; i < 255; i++) {
            const device = await this.info(`${this.prefix}.${i}`);

            if (device.alive && await this.alive(this.port, device.ip)) {
                const response = await this.detect(device.ip);

                if (response) {
                    this.emit("data", {
                        ip: device.ip,
                        hostname: device.hostname,
                        port: this.port,
                        service: this.service,
                        version: response
                    });
                }
            }
        }
    }

    async alive(port, ip) {
        return new Promise(((resolve) => {
            const socket = new Net.Socket();
    
            socket.setTimeout(10);

            socket.once("error", () => {
                socket.destroy();

                resolve(false);
            });

            socket.once("timeout", () => {
                socket.destroy();

                resolve(false);
            });

            socket.connect(port, ip, () => {
                socket.end();

                resolve(true);
            });
        }));
    }

    detect(ip) {
        return new Promise((resolve) => {
            let results = null;

            switch (this.service) {
                case "hoobs":
                    Request({
                        method: "get",
                        url: `http://${ip}:${this.port}/api/status`,
                        timeout: this.timeout
                    }).then((response) => {
                        results = ((response || {}).data || {}).hoobs_version;
                    }).catch(() => {
                        results = null;
                    }).finally(() => {
                        resolve(results);
                    });
    
                    break;

                default:
                    resolve(results);
                    break;
            }
        });
    }

    info(ip) {
        return new Promise((resolve) => {
            const results = {
                ip,
                alive: false,
                hostname: null,
            };
    
            Ping.promise.probe(ip, {
                timeout: 1,
            }).then((response) => {
                if (response.alive) {
                    results.alive = true;
    
                    DNS.reverse(ip, (error, host) => {
                        if (!error) {
                            results.hostname = (host && host.length) ? host[0] : null;
                        }
                    });
                }
            }).finally(() => {
                resolve(results);
            });
        });
    }
}
