import EventEmitter from "events";

import OS from "os";
import Ping from "ping";
import DNS from "dns";
import IP from "ip";
import Net from "net";
import ARP from "node-arp";
import Request from "axios";

export default class Scanner extends EventEmitter {
    constructor(service, port, timeout) {
        super();

        this.service = service;
        this.port = port;
        this.timeout = timeout || 500;
        this.stopped = false;
        this.timer = null;

        this.total = 0;
        this.count = 0;
    }

    async heartbeat(ip, port, callback, interval) {
        const test = await this.detect(ip, port);

        interval = interval || 10000;

        if (test && test.version && test.version !== "") {
            this.timer = setTimeout(() => {
                this.heartbeat(ip, port, callback, interval);
            }, interval);
        } else {
            if (this.timer) {
                clearTimeout(this.timer);
            }

            this.timer = null;

            if (callback) {
                callback();
            }
        }
    }

    async wait(ip, port, callback, interval) {
        const test = await this.detect(ip, port);

        interval = interval || 5000;

        if (test && test.version && test.version !== "") {
            if (this.timer) {
                clearTimeout(this.timer);
            }

            this.timer = null;

            if (callback) {
                callback();
            }
        } else {
            this.timer = setTimeout(() => {
                this.wait(ip, port, callback, interval);
            }, interval);
        }
    }

    async scan() {
        this.stopped = false;

        this.total = 0;
        this.count = 0;

        const subnets = this.subnets();

        this.emit("progress", 0);

        for (let i = 0; i < subnets.length; i++) {
            if (this.stopped) {
                break;
            } else {
                this.subnet(subnets[i].start, subnets[i].end);
            }
        }
    }

    async subnet(start, end) {
        for (let l = start, r = end; l <= r; l++, r-- ) {
            if (this.stopped) {
                break;
            } else {
                const [left, right] = await Promise.all([this.info(IP.fromLong(l)), await this.info(IP.fromLong(r))]);

                this.emit("progress", Math.round((((this.count + 2) * 100) / this.total) * 10) / 10);

                if (left.alive && await this.alive(left.ip, this.port)) {
                    const response = await this.detect(left.ip, this.port);

                    if (response && response.version) {
                        this.emit("device", {
                            ip: left.ip,
                            mac: left.mac,
                            hostname: left.hostname,
                            port: this.port,
                            service: this.service,
                            product: response.product || "HOOBS Core",
                            version: response.version
                        });
                    }
                }

                if (right.alive && await this.alive(right.ip, this.port)) {
                    const response = await this.detect(right.ip, this.port);

                    if (response && response.version) {
                        this.emit("device", {
                            ip: right.ip,
                            mac: right.mac,
                            hostname: right.hostname,
                            port: this.port,
                            service: this.service,
                            product: response.product || "HOOBS Core",
                            version: response.version
                        });
                    }
                }

                this.count += 2;

                if (this.count >= this.total) {
                    this.emit("stop");
                }
            }
        }
    }

    async alive(ip, port) {
        return new Promise(((resolve) => {
            if (!this.stopped) {
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

    subnets() {
        const ifaces = OS.networkInterfaces();
        const subnets = [];
        const keys = Object.keys(ifaces);

        for (let i = 0; i < keys.length; i++) {
            for (let j = 0; j < ifaces[keys[i]].length; j++) {
                if (ifaces[keys[i]][j].family === "IPv4" && !ifaces[keys[i]][j].internal) {
                    const details = IP.cidrSubnet(ifaces[keys[i]][j].cidr);

                    this.total += (IP.toLong(details.lastAddress) - IP.toLong(details.firstAddress));

                    subnets.push({
                        start: IP.toLong(details.firstAddress),
                        end: IP.toLong(details.lastAddress)
                    });
                }
            }
        }

        return subnets;
    }

    detect(ip, port) {
        return new Promise((resolve) => {
            let results = null;

            if (!this.stopped) {
                switch (this.service) {
                    case "hoobs":
                        Request({
                            method: "get",
                            url: `http://${ip}:${port}/api/status`,
                            timeout: this.timeout
                        }).then((response) => {
                            if (response && response.data && response.data.hoobs_version) {
                                results = {
                                    product: response.data.product,
                                    version: response.data.hoobs_version
                                };
                            }
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

    lookup(ip) {
        return new Promise((resolve) => {
            DNS.reverse(ip, (error, host) => {
                if (!error) {
                    resolve((host && host.length) ? host[0] : null);
                } else {
                    resolve(null);
                }
            });
        });
    }

    identify(ip) {
        return new Promise((resolve) => {
            ARP.getMAC(ip, (error, mac) => {
                if (!error && mac) {
                    resolve(mac);
                } else {
                    resolve(null);
                }
            });
        });
    }

    info(ip) {
        return new Promise((resolve) => {
            const results = {
                ip,
                mac: null,
                alive: false,
                hostname: null
            };
    
            if (!this.stopped) {
                Ping.promise.probe(ip, {
                    timeout: 1,
                }).then((response) => {
                    results.alive = response.alive;
                }).finally(async () => {
                    if (results.alive) {  
                        results.hostname = await this.lookup(ip);
                        results.mac = await this.identify(ip);
                    }

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
        this.stopped = true;

        this.total = 0;
        this.count = 0;

        if (this.timer) {
            clearTimeout(this.timer);
        }

        this.timer = null;

        this.emit("stop");
    }
}
