import Sanitize from "@hoobs/sdk/lib/sanitize";
import { UserRecord } from "@hoobs/sdk/lib/users";
import { BridgeRecord } from "@hoobs/sdk/lib/bridges";

interface Validation {
    valid: boolean;
    error?: string;
}

const reserved = [
    "new",
    "add",
    "hub",
    "edit",
    "hidden",
    "bridge",
    "bridges",
    "library",
    "advanced",
];

export default class Validators {
    static user(create: boolean, users: UserRecord[], username: any, password?: any, challenge?: any): Validation {
        if (create) {
            if (!username || username.length < 3) {
                return {
                    error: "username_required",
                    valid: false,
                };
            }

            if (users.findIndex((item) => item.username.toLowerCase() === username.toLowerCase()) >= 0) {
                return {
                    error: "username_already_taken",
                    valid: false,
                };
            }

            if (!password || password.length < 5) {
                return {
                    error: "password_weak",
                    valid: false,
                };
            }

            if (password !== challenge) {
                return {
                    error: "password_mismatch",
                    valid: false,
                };
            }
        } else {
            if (username.length < 3) {
                return {
                    error: "username_required",
                    valid: false,
                };
            }

            if (password && password !== "" && password.length < 5) {
                return {
                    error: "password_weak",
                    valid: false,
                };
            }

            if (password && password !== "" && password !== challenge) {
                return {
                    error: "password_mismatch",
                    valid: false,
                };
            }
        }

        return {
            valid: true,
        };
    }

    static bridge(create: boolean, bridges: BridgeRecord[], display: any, pin: any, port?: any, username?: any, autostart?: any, start?: any, end?: any): Validation {
        if (create) {
            if (!display || display === "") {
                return {
                    error: "bridge_name_required",
                    valid: false,
                };
            }

            if (reserved.indexOf(Sanitize(display || "")) >= 0) {
                return {
                    error: "bridge_name_reserved",
                    valid: false,
                };
            }

            if (bridges.findIndex((item) => item.id === Sanitize(display)) >= 0) {
                return {
                    error: "bridge_name_taken",
                    valid: false,
                };
            }

            if (Number.isNaN(parseInt(port, 10))) {
                return {
                    error: "bridge_port_required",
                    valid: false,
                };
            }

            if (bridges.findIndex((item) => item.port === parseInt(port, 10)) >= 0) {
                return {
                    error: "bridge_port_taken",
                    valid: false,
                };
            }

            if (pin && pin !== "" && !Validators.pin(pin)) {
                return {
                    error: "bridge_pin_invalid",
                    valid: false,
                };
            }
        } else {
            if (!display || display === "") {
                return {
                    error: "bridge_name_required",
                    valid: false,
                };
            }

            if (pin && pin !== "" && !Validators.pin(pin)) {
                return {
                    error: "bridge_pin_invalid",
                    valid: false,
                };
            }

            if (!username || username === "") {
                return {
                    error: "bridge_username_invalid",
                    valid: false,
                };
            }

            if (Number.isNaN(parseInt(autostart, 10)) || autostart < -1 || autostart > 300) {
                return {
                    error: "bridge_autostart_invalid",
                    valid: false,
                };
            }

            if (!Number.isNaN(parseInt(start, 10)) || !Number.isNaN(parseInt(end, 10))) {
                if (Number.isNaN(parseInt(start, 10)) || Number.isNaN(parseInt(end, 10))) {
                    return {
                        error: "bridge_port_pool_required",
                        valid: false,
                    };
                }

                if (parseInt(end, 10) < parseInt(start, 10)) {
                    return {
                        error: "bridge_port_pool_invalid",
                        valid: false,
                    };
                }

                for (let i = parseInt(start, 10); i <= parseInt(end, 10); i += 1) {
                    if (bridges.findIndex((item) => item.port === i) >= 0) {
                        return {
                            error: "bridge_port_pool_collision",
                            valid: false,
                        };
                    }
                }
            }
        }

        return {
            valid: true,
        };
    }

    static pin(value: any): boolean {
        const parts = (`${value}`).split("-");

        if (parts.length !== 3) return false;

        for (let i = 0; i < parts.length; i += 1) {
            if (Number.isNaN(parseInt(parts[i], 10))) return false;
        }

        return true;
    }

    static room(create: boolean, value: any, rooms?: { [key: string]: any }[]): Validation {
        if (!value) {
            return {
                error: "room_invalid_name",
                valid: false,
            };
        }

        const id = Sanitize(`${value}`);

        if (!id || id === "") {
            return {
                error: "room_invalid_name",
                valid: false,
            };
        }

        if (reserved.indexOf(id) >= 0) {
            return {
                error: "room_reserved_name",
                valid: false,
            };
        }

        if (create && (rooms || []).findIndex((item) => item.id === id) >= 0) {
            return {
                error: "room_exists",
                valid: false,
            };
        }

        return {
            valid: true,
        };
    }
}
