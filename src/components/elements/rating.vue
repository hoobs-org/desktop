<!-------------------------------------------------------------------------------------------------
 | hoobs-desktop                                                                                  |
 | Copyright (C) 2020 HOOBS                                                                       |
 |                                                                                                |
 | This program is free software: you can redistribute it and/or modify                           |
 | it under the terms of the GNU General Public License as published by                           |
 | the Free Software Foundation, either version 3 of the License, or                              |
 | (at your option) any later version.                                                            |
 |                                                                                                |
 | This program is distributed in the hope that it will be useful,                                |
 | but WITHOUT ANY WARRANTY; without even the implied warranty of                                 |
 | MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the                                  |
 | GNU General Public License for more details.                                                   |
 |                                                                                                |
 | You should have received a copy of the GNU General Public License                              |
 | along with this program.  If not, see <http://www.gnu.org/licenses/>.                          |
 -------------------------------------------------------------------------------------------------->

<template>
    <div id="rating">
        <div class="star" :style="`width: ${size}px; height: ${size}px;`">
            <icon name="star" class="icon" :style="`height: ${size}px;`" />
            <icon v-if="value >= 1" name="star" class="icon earned" :style="`height: ${size}px;`" />
            <icon v-else-if="value > 0" name="star" class="icon earned" :style="`width: ${(value * 100).toFixed(2)}%; height: ${size}px;`" />
        </div>
        <div class="star" :style="`width: ${size}px; height: ${size}px;`">
            <icon name="star" class="icon" :style="`height: ${size}px;`" />
            <icon v-if="value >= 2" name="star" class="icon earned" :style="`height: ${size}px;`" />
            <icon v-else-if="value > 1" name="star" class="icon earned" :style="`width: ${((value - 1) * 100).toFixed(2)}%; height: ${size}px;`" />
        </div>
        <div class="star" :style="`width: ${size}px; height: ${size}px;`">
            <icon name="star" class="icon" :style="`height: ${size}px;`" />
            <icon v-if="value >= 3" name="star" class="icon earned" :style="`height: ${size}px;`" />
            <icon v-else-if="value > 2" name="star" class="icon earned" :style="`width: ${((value - 2) * 100).toFixed(2)}%; height: ${size}px;`" />
        </div>
        <div class="star" :style="`width: ${size}px; height: ${size}px;`">
            <icon name="star" class="icon" :style="`height: ${size}px;`" />
            <icon v-if="value >= 4" name="star" class="icon earned" :style="`height: ${size}px;`" />
            <icon v-else-if="value > 3" name="star" class="icon earned" :style="`width: ${((value - 3) * 100).toFixed(2)}%; height: ${size}px;`" />
        </div>
        <div class="star" :style="`width: ${size}px; height: ${size}px;`">
            <icon name="star" class="icon" :style="`height: ${size}px;`" />
            <icon v-if="value >= 5" name="star" class="icon earned" :style="`height: ${size}px;`" />
            <icon v-else-if="value > 4" name="star" class="icon earned" :style="`width: ${((value - 4) * 100).toFixed(2)}%; height: ${size}px;`" />
        </div>
    </div>
</template>

<script>
    export default {
        name: "rating",
        props: { value: Number, size: { type: Number, default: 17 } },
    };
</script>

<style lang="scss" scoped>
    #rating {
        display: flex;
        flex-direction: row;
        align-content: center;
        align-items: center;
        user-select: none;
        cursor: default;

        .star {
            position: relative;
            overflow: hidden;

            .icon {
                color: var(--application-input-accent);
            }

            .earned {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                color: var(--application-highlight);
                overflow: hidden;
            }
        }
    }
</style>
