import * as Scanner from "network-list";
import * as PortReachable from "is-port-reachable";
import * as Request from "axios";

export default class Devices {
    static type = {
        hoobs: "hoobs"
    };

    static async scan(type, port, callback) {
        Scanner.scanEach({
            timeout: 10,
            vendor: false
        }, async (error, device) => {
            if (!error && device.alive) {
                if (await PortReachable(port, {
                    timeout: 10,
                    host: device.ip
                })) {
                    this.detect(type, port, device.ip, callback);
                }
            }
        });
    }

    static detect(type, port, address, callback) {
        switch (type) {
            case Devices.type.HOOBS:
                Request({
                    method: "get",
                    url: `http://${address}:${port}/api/status`,
                    timeout: 500
                }).then((response) => {
                    const version = ((response || {}).data || {}).hoobs_version;
            
                    if (version && callback) {
                        callback(null, version);
                    }
                }).catch((error) => {
                    if (callback) {
                        callback(error);
                    }
                });

                break;
        }
    }
}