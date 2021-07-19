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

import { VueConstructor } from "vue";

declare global {
    interface Window {
        data: any;
    }
}

export function transform(str: string, dir: any): number {
    let pos = Number(window.getComputedStyle(window.data.move)[dir].replace("px", ""));

    if (str !== "none") pos += Number((str.match(/[0-9.-]+/g) || [])[8 - dir.length]);

    return pos;
}

export function mouse(event: MouseEvent): void {
    window.data.mouseX = event.pageX - window.data.initialX;
    window.data.mouseY = event.pageY - window.data.initialY;
}

export function animate(): void {
    window.data.relativeX = window.data.mouseX;
    window.data.relativeY = window.data.mouseY;
    window.data.move.style.transform = `matrix(${window.data.matrix || "1, 0, 0, 1,"} ${window.data.matrixX + window.data.relativeX}, ${window.data.matrixY + window.data.relativeY})`;

    window.data.posAnimation = requestAnimationFrame(animate);
}

export function move(): void {
    window.data.move.classList.add(window.data.class.move);
    window.data.posAnimation = requestAnimationFrame(animate);

    document.removeEventListener("mousemove", move);
}

export function start(handle: HTMLElement, element: HTMLElement, event: MouseEvent): void {
    window.data.grab = handle;
    window.data.move = element;

    window.data.initialX = event.pageX;
    window.data.initialY = event.pageY;

    window.data.relativeX = 0;
    window.data.relativeY = 0;

    const matrix = window.getComputedStyle(window.data.move).transform;

    if (matrix === "none") {
        window.data.matrix = false;
    } else {
        window.data.matrix = matrix.match(/\d([^,]*,){4}/g);
    }

    const left = transform(matrix, "left");
    const top = transform(matrix, "top");

    window.data.move.style.transform = `matrix(${window.data.matrix || "1, 0, 0, 1,"} ${left}, ${top})`;
    window.data.move.style.left = 0;
    window.data.move.style.top = 0;

    window.data.matrixX = left;
    window.data.matrixY = top;

    window.data.grab.classList.add(window.data.class.down);

    document.addEventListener("mousemove", mouse);
    document.addEventListener("mousemove", move);
}

export function end(): void {
    cancelAnimationFrame(window.data.posAnimation);

    document.removeEventListener("mousemove", move);

    if (window.data.move) {
        window.data.move.style.transform = window.data.matrix ? `matrix(${window.data.matrix || "1, 0, 0, 1,"} 0, 0)` : "none";
        window.data.move.style.left = `${window.data.matrixX + window.data.relativeX}px`;
        window.data.move.style.top = `${window.data.matrixY + window.data.relativeY}px`;
    }

    if (window.data.grab) window.data.grab.classList.remove(window.data.class.down);
    if (window.data.move) window.data.move.classList.remove(window.data.class.move);

    document.removeEventListener("mousemove", mouse);
}

export function contain(): void {
    const event = document.createEvent("HTMLEvents");

    event.initEvent("mouseup", true, true);

    document.dispatchEvent(event);
}

export function events(element: HTMLElement, binding: { [key: string]: any }): void {
    const { value } = binding;

    const selector: string = value instanceof Object ? value.handle : value;
    const handles = element.querySelectorAll(selector);

    if (handles.length !== 0) {
        element.classList.add(window.data.class.usesHandle);

        handles.forEach((handle: Element) => {
            const current = handle as HTMLElement;

            current.classList.add(window.data.class.handle);
            current.onmousedown = (item: MouseEvent) => start(current, element, item);
        });
    }

    element.classList.add(window.data.class.initial);

    document.addEventListener("mouseup", end);
    document.body.addEventListener("mouseleave", contain);
}

export default {
    install(Vue: VueConstructor<Vue>, options: { [key: string]: any }): void {
        window.data = {};

        window.data.class = {
            initial: "drag-draggable",
            usesHandle: "drag-uses-handle",
            handle: "drag-handle",
            down: "drag-down",
            move: "drag-move",
        };

        if (options) {
            const classes = options.eventClass;

            Object.keys(classes).forEach((key) => {
                if (classes[key]) {
                    window.data.class[key] = classes[key];
                }
            });
        }

        const styleElement = document.createElement("style");

        styleElement.innerHTML = `.${window.data.class.initial}{position:relative;transition:none;}.${window.data.class.initial}:not(.${window.data.class.usesHandle}),.${window.data.class.handle}.${window.data.class.down},.${window.data.class.initial}:not(.${window.data.class.usesHandle}).${window.data.class.down}{z-index:999;}`;

        document.body.appendChild(styleElement);

        Vue.directive("drag", {
            inserted(element: HTMLElement, binding: { [key: string]: any }) {
                events(element, binding);
            },

            update(element: HTMLElement, binding: { [key: string]: any }) {
                element.onmousedown = null;

                const handle = typeof binding.old === "object" ? binding.old.handle : binding.old;

                document.querySelectorAll(handle).forEach((existing: HTMLElement) => {
                    existing.onmousedown = null;

                    existing.classList.remove(window.data.class.handle);
                    element.classList.remove(window.data.class.usesHandle);
                });

                events(element, binding);
            },
        });
    },
};
