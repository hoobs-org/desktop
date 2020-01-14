import Vue from "vue";

import Modal from "@/components/modal.vue";
import Loader from "@/components/loader.vue";
import Confirm from "@/components/confirm.vue";
import Marquee from "@/components/marquee.vue";
import Checkbox from "@/components/checkbox.vue";
import Dropdown from "@/components/dropdown.vue";
import Notification from "@/components/notification.vue";


export default function() {
    Vue.component("modal", Modal);
    Vue.component("loader", Loader);
    Vue.component("confirm", Confirm);
    Vue.component("marquee", Marquee);
    Vue.component("checkbox", Checkbox);
    Vue.component("dropdown", Dropdown);
    Vue.component("notification", Notification);
}
