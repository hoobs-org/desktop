import ButtonField from "@/components/fields/button.vue";
import OneOfField from "@/components/fields/oneof.vue";
import RootField from "@/components/fields/root.vue";
import ListField from "@/components/fields/list.vue";
import AnyOfField from "@/components/fields/anyof.vue";
import FormField from "@/components/fields/form.vue";
import KeysField from "@/components/fields/keys.vue";

export function prune(input: any): any {
    if (typeof (input) === "object") {
        if (input instanceof Date) {
            return input.toISOString().slice(0, 10);
        } else if (!Array.isArray(input)) {
            const output: any = {};

            for (const member in input) {
                const value = prune(input[member]);

                if (value !== undefined) output[member] = value;
            }

            if (Object.keys(output).length > 0) return output;
        } else {
            const output = [];

            for (const member of input) {
                const value = prune(member);

                if (value !== undefined) output.push(value);
            }

            if (output.length > 0) return output;
        }
    } else if (input !== undefined && input !== "") {
        return input;
    }
}

export function scaffold(input: any, callback: any): any {
    if (input.type === "object") {
        const output: any = {};

        for (const item in input.properties) output[item] = scaffold(input.properties[item], callback);

        return output;
    } else if (input.type === "array") {
        return [scaffold(input.items, callback)];
    } else {
        return callback === undefined ? callback : callback(input);
    }
}

export function merge(first: any, second: any) {
    if (typeof (first) === "object" && typeof (second) === "object") {
        if (!Array.isArray(first)) {
            const output: any = {};

            for (const member in first) output[member] = merge(first[member], second[member]);

            return output;
        } else {
            return Array.isArray(second) && second.length > 0 && prune(second[0]) !== undefined ? second : first;
        }
    } else {
        return (second !== undefined) ? second : first;
    }
}

export function component(name: string) {
    switch (name) {
        case "custom:ring":
            return () => import(/* webpackChunkName: "custom-ring" */ "@/partner/ring.vue");

        case "custom:gsh":
            return () => import(/* webpackChunkName: "custom-gsh" */ "@/partner/gsh.vue");

        case "custom:honeywell":
            return () => import(/* webpackChunkName: "custom-honeywell" */ "@/partner/honeywell.vue");

        case "field:button":
            return ButtonField;

        case "field:oneof":
            return OneOfField;

        case "field:root":
            return RootField;

        case "field:list":
            return ListField;

        case "field:anyof":
            return AnyOfField;

        case "field:form":
            return FormField;

        case "field:keys":
            return KeysField;

        case "field:textarea":
            return "textarea-field";

        case "field:select":
            return "select-field";

        case "field:checkbox":
            return "checkbox";

        case "field:integer":
            return "integer-field";

        case "field:number":
            return "number-field";

        case "field:date":
            return "date-field";

        case "field:password":
            return "password-field";

        default:
            return "text-field";
    }
}

export function field(schema: { [key: string]: any }) {
    if (schema.widget === "ring") return component("custom:ring");
    if (schema.widget === "gsh") return component("custom:gsh");
    if (schema.widget === "honeywell") return component("custom:honeywell");

    if (schema.widget === "button") return component("field:button");
    if (schema.widget === "textarea") return component("field:textarea");

    if (schema.oneOf !== undefined && Array.isArray(schema.oneOf)) {
        if (schema.widget === "radio") return component("field:oneof");
        if (schema.widget === "select") return component("field:select");
        if (schema.oneOf.length <= 3) return component("field:oneof");

        return component("field:select");
    }

    if (schema.enum !== undefined && Array.isArray(schema.enum)) return component("field:select");

    if (schema.type === "boolean") return component("field:checkbox");
    if (schema.type === "array" && schema.format === "root") return component("field:root");
    if (schema.type === "array") return schema.items.anyOf === undefined || !Array.isArray(schema.items.anyOf) ? component("field:list") : component("field:anyof");
    if (schema.type === "object" && schema.properties) return component("field:form");
    if (schema.type === "object" && schema.patternProperties) return component("field:keys");

    if (schema.type === "integer") return component("field:integer");
    if (schema.type === "number") return component("field:number");

    if (schema.format === "date") return component("field:date");
    if (schema.format === "password") return component("field:password");

    return component("field:text");
}

export const draft = {
    $schema: "http://json-schema.org/draft-07/schema#",
    $id: "http://json-schema.org/draft-07/schema#",
    title: "Core schema meta-schema",
    definitions: {
        schemaArray: {
            type: "array",
            minItems: 1,
            items: { $ref: "#" },
        },
        nonNegativeInteger: { type: "integer", minimum: 0 },
        nonNegativeIntegerDefault0: {
            allOf: [{ $ref: "#/definitions/nonNegativeInteger" }, { default: 0 }],
        },
        simpleTypes: { enum: ["array", "boolean", "integer", "null", "number", "object", "string"] },
        stringArray: {
            type: "array",
            items: { type: "string" },
            uniqueItems: true,
            default: [],
        },
    },
    type: ["object", "boolean"],
    properties: {
        $id: { type: "string", format: "uri-reference" },
        $schema: { type: "string", format: "uri" },
        $ref: { type: "string", format: "uri-reference" },
        $comment: { type: "string" },
        title: { type: "string" },
        description: { type: "string" },
        default: true,
        readOnly: { type: "boolean", default: false },
        examples: { type: "array", items: true },
        multipleOf: { type: "number", exclusiveMinimum: 0 },
        maximum: { type: "number" },
        exclusiveMaximum: { type: "number" },
        minimum: { type: "number" },
        exclusiveMinimum: { type: "number" },
        maxLength: { $ref: "#/definitions/nonNegativeInteger" },
        minLength: { $ref: "#/definitions/nonNegativeIntegerDefault0" },
        pattern: { type: "string", format: "regex" },
        additionalItems: { $ref: "#" },
        items: {
            anyOf: [{ $ref: "#" }, { $ref: "#/definitions/schemaArray" }],
            default: true,
        },
        maxItems: { $ref: "#/definitions/nonNegativeInteger" },
        minItems: { $ref: "#/definitions/nonNegativeIntegerDefault0" },
        uniqueItems: { type: "boolean", default: false },
        contains: { $ref: "#" },
        maxProperties: { $ref: "#/definitions/nonNegativeInteger" },
        minProperties: { $ref: "#/definitions/nonNegativeIntegerDefault0" },
        required: { $ref: "#/definitions/stringArray" },
        additionalProperties: { $ref: "#" },
        definitions: {
            type: "object",
            additionalProperties: { $ref: "#" },
            default: {},
        },
        properties: {
            type: "object",
            additionalProperties: { $ref: "#" },
            default: {},
        },
        patternProperties: {
            type: "object",
            additionalProperties: { $ref: "#" },
            propertyNames: { format: "regex" },
            default: {},
        },
        dependencies: {
            type: "object",
            additionalProperties: { anyOf: [{ $ref: "#" }, { $ref: "#/definitions/stringArray" }] },
        },
        propertyNames: { $ref: "#" },
        const: true,
        enum: {
            type: "array",
            items: true,
            minItems: 1,
            uniqueItems: true,
        },
        type: {
            anyOf: [
                { $ref: "#/definitions/simpleTypes" },
                {
                    type: "array",
                    items: { $ref: "#/definitions/simpleTypes" },
                    minItems: 1,
                    uniqueItems: true,
                },
            ],
        },
        format: { type: "string" },
        contentMediaType: { type: "string" },
        contentEncoding: { type: "string" },
        if: { $ref: "#" },
        then: { $ref: "#" },
        else: { $ref: "#" },
        allOf: { $ref: "#/definitions/schemaArray" },
        anyOf: { $ref: "#/definitions/schemaArray" },
        oneOf: { $ref: "#/definitions/schemaArray" },
        not: { $ref: "#" },
    },
    default: true,
};

export function decamel(value: string): string {
    if (!value || value === "") return "";

    let results = value;

    results = results.replace(/ /gi, "_");
    results = results.replace(/-/gi, "_");
    results = results.replace(/,/gi, "");
    results = results.replace(/'/gi, "");
    results = results.replace(/"/gi, "");
    results = results.replace(/!/gi, "");
    results = results.replace(/\./gi, "");
    results = results.replace(/\[/gi, "");
    results = results.replace(/\]/gi, "");
    results = results.replace(/\\/gi, "");
    results = results.replace(/\//gi, "");
    results = results.replace(/\^/gi, "");
    results = results.replace(/\$/gi, "");
    results = results.replace(/\|/gi, "");
    results = results.replace(/\?/gi, "");
    results = results.replace(/\*/gi, "");
    results = results.replace(/\+/gi, "");
    results = results.replace(/\(/gi, "");
    results = results.replace(/\)/gi, "");

    results = results.replace(/[-_]/gi, " ");
    results = results.replace(/([A-Z])/g, (item) => ` ${item.charAt(0).toLowerCase()}${item.slice(1)}`);
    results = results.trim();
    results = results.replace(/\w\S*/g, (item) => `${item.charAt(0).toUpperCase()}${item.slice(1)}`);
    results = results.trim();

    return results;
}
