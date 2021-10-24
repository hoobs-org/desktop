/**************************************************************************************************
 * hoobs-desktop                                                                                  *
 * Copyright (C) 2020 HOOBS                                                                       *
 *                                                                                                *
 * This program is free software: you can redistribute it and/or modify                           *
 * it under the terms of the GNU General Public License as published by                           *
 * the Free Software Foundation, either version 3 of the License, or                              *
 * (at your option) any later version.                                                            *
 *                                                                                                *
 * This program is distributed in the hope that it will be useful,                                *
 * but WITHOUT ANY WARRANTY; without even the implied warranty of                                 *
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the                                  *
 * GNU General Public License for more details.                                                   *
 *                                                                                                *
 * You should have received a copy of the GNU General Public License                              *
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.                          *
 **************************************************************************************************/

import OffAccessory from "@/components/accessories/off.vue";
import HueAccessory from "@/components/accessories/hue.vue";
import FanAccessory from "@/components/accessories/fan.vue";
import LockAccessory from "@/components/accessories/lock.vue";
import LightAccessory from "@/components/accessories/light.vue";
import BlindAccessory from "@/components/accessories/blind.vue";
import CameraAccessory from "@/components/accessories/camera.vue";
import SensorAccessory from "@/components/accessories/sensor.vue";
import SwitchAccessory from "@/components/accessories/switch.vue";
import GarageAccessory from "@/components/accessories/garage.vue";
import SecurityAccessory from "@/components/accessories/security.vue";
import SprinklerAccessory from "@/components/accessories/sprinkler.vue";
import TelevisionAccessory from "@/components/accessories/television.vue";
import ThermostatAccessory from "@/components/accessories/thermostat.vue";
import BrightnessAccessory from "@/components/accessories/brightness.vue";
import UnavailableAccessory from "@/components/accessories/unavailable.vue";
import UnknownAccessory from "@/components/accessories/unknown.vue";

export function types(accessory: { [key: string]: any }): string | undefined {
    let sensors: [string];

    switch ((accessory || {}).type) {
        case "light":
            return "light-accessory";

        case "switch":
        case "outlet":
            return "switch-accessory";

        case "fan":
            return "fan-accessory";

        case "lock":
            return "lock-accessory";

        case "camera":
            return "camera-accessory";

        case "thermostat":
            return "thermostat-accessory";

        case "garage_door_opener":
            return "garage-accessory";

        case "security_system":
            return "security-accessory";

        case "valve":
            return "sprinkler-accessory";

        case "window_covering":
            return "blind-accessory";

        case "television":
            return "television-accessory";

        case "sensor":
            if (!accessory.main_sensor) return "unknown-accessory";

            sensors = accessory.characteristics.map((item: { [key: string]: any }) => item.type);

            if (sensors.indexOf("leak_detected") >= 0) return "sensor-accessory";
            if (sensors.indexOf("current_temperature") >= 0) return "sensor-accessory";
            if (sensors.indexOf("current_relative_humidity") >= 0) return "sensor-accessory";
            if (sensors.indexOf("smoke_detected") >= 0) return "sensor-accessory";
            if (sensors.indexOf("carbon_dioxide_detected") >= 0) return "sensor-accessory";
            if (sensors.indexOf("carbon_monoxide_detected") >= 0) return "sensor-accessory";
            if (sensors.indexOf("contact_sensor_state") >= 0) return "sensor-accessory";
            if (sensors.indexOf("current_door_state") >= 0) return "sensor-accessory";
            if (sensors.indexOf("motion_detected") >= 0) return "sensor-accessory";
            if (sensors.indexOf("obstruction_detected") >= 0) return "sensor-accessory";
            if (sensors.indexOf("occupancy_detected") >= 0) return "sensor-accessory";

            return "unknown-accessory";

        default:
            return "unknown-accessory";
    }
}

export function accessories(): { [key: string]: any } {
    return {
        "off-accessory": OffAccessory,
        "hue-accessory": HueAccessory,
        "fan-accessory": FanAccessory,
        "lock-accessory": LockAccessory,
        "light-accessory": LightAccessory,
        "blind-accessory": BlindAccessory,
        "camera-accessory": CameraAccessory,
        "sensor-accessory": SensorAccessory,
        "switch-accessory": SwitchAccessory,
        "garage-accessory": GarageAccessory,
        "security-accessory": SecurityAccessory,
        "sprinkler-accessory": SprinklerAccessory,
        "television-accessory": TelevisionAccessory,
        "thermostat-accessory": ThermostatAccessory,
        "brightness-accessory": BrightnessAccessory,
        "unavailable-accessory": UnavailableAccessory,
        "unknown-accessory": UnknownAccessory,
    };
}
