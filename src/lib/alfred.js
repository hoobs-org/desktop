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
        this.dispose = false;

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

            if (this.dispose) {
                break;
            }

            if (device.alive && await this.alive(device.ip, this.port)) {
                const response = await this.detect(device.ip, this.port);

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

    async alive(ip, port) {
        return new Promise(((resolve) => {
            if (!this.dispose) {
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
            } else {
                resolve(false);
            }
        }));
    }

    detect(ip, port) {
        return new Promise((resolve) => {
            let results = null;

            if (!this.dispose) {
                switch (this.service) {
                    case "hoobs":
                        Request({
                            method: "get",
                            url: `http://${ip}:${port}/api/status`,
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
            } else {
                resolve(null);
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
    
            if (!this.dispose) {
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
            } else {
                resolve({
                    ip,
                    alive: false,
                    hostname: null,
                });
            }
        });
    }

    stop() {
        this.dispose = true;
    }
}
