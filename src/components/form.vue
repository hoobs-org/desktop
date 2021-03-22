<template>
    <div>
        <template v-for="(property, key) in schema.properties">
            <slot :name="key" :item="{ key: key, schema: property, value: items[key], update: updateValue }">
                <schema
                    :key="key"
                    :bridge="bridge"
                    :identifier="identifier"
                    :field="key"
                    :schema="property"
                    :value="items[key]"
                    :items="items"
                    v-on:input="updateValue($event, key)"
                    v-on:save="$emit('save', $event)"
                />
            </slot>
        </template>
    </div>
</template>

<script>
    import SchemaComponent from "@/components/elements/schema.vue";

    import { scaffold, prune } from "../services/schema";

    export default {
        name: "schema-form",

        components: {
            "schema": SchemaComponent,
        },

        props: {
            schema: Object,
            value: Object,
            bridge: String,
            identifier: String,
        },

        data() {
            return {
                items: this.value || scaffold(this.schema),
            };
        },

        watch: {
            schema() {
                this.items = this.value || scaffold(this.schema);
            },
        },

        methods: {
            updateValue(value, child) {
                this.items[child] = value;
                this.$emit("input", prune(this.items) || {});
            },
        },
    };
</script>
