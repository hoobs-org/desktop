import { Store } from "vuex";

const TASK_INTERVAL = 5000;

function notifications(store: Store<any>) {
    store.commit("NOTIFICATION:DISMISS:OLD");

    setTimeout(() => {
        notifications(store);
    }, TASK_INTERVAL);
}

export default function tasks(store: Store<any>): void {
    notifications(store);
}
