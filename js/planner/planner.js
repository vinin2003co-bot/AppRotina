import { state } from '../core/state.js';
import { saveStorage } from '../core/storage.js';
import {
    openModal,
    closeModal
} from '../core/modal.js';
import {
    generateId
} from '../core/utils.js';

export function populateTimeSelects() {
    const select =
        document.getElementById(
            'tb-start'
        );

    if (!select) return;

    select.innerHTML = '';

    for (let hour = 6; hour <= 22; hour++) {
        const hourString =
            hour < 10
                ? `0${hour}:00`
                : `${hour}:00`;

        select.innerHTML += `
            <option value="${hour}">
                ${hourString}
            </option>
        `;
    }
}

export function openTimeBlockModal() {
    openModal('timeblock-modal');
}

export function saveTimeBlock(event) {
    event.preventDefault();

    const title =
        document.getElementById(
            'tb-title'
        ).value.trim();

    const startHour =
        parseInt(
            document.getElementById(
                'tb-start'
            ).value,
            10
        );

    const duration =
        parseInt(
            document.getElementById(
                'tb-duration'
            ).value,
            10
        );

    if (!title) return;

    state.timeBlocks.push({
        id: generateId('tb'),
        title,
        startHour,
        duration
    });

    saveStorage();

    closeModal('timeblock-modal');

    renderTimeline();
}

export function renderTimeline() {
    const container =
        document.getElementById(
            'timeline-container'
        );

    if (!container) return;

    container.innerHTML = '';

    for (
        let hour = 6;
        hour <= 23;
        hour++
    ) {
        const hourLabel =
            hour < 10
                ? `0${hour}:00`
                : `${hour}:00`;

        const blocksAtHour =
            state.timeBlocks.filter(
                block =>
                    block.startHour === hour
            );

        const row =
            document.createElement('div');

        row.className =
            'relative min-h-[50px] border-t border-gray-100 dark:border-gray-800 flex items-start pt-2';

        row.innerHTML = `
            <span class="absolute -left-16 text-xs text-gray-400 font-mono w-12 text-right">
                ${hourLabel}
            </span>

            <div class="w-full space-y-2">

                ${blocksAtHour
                    .map(block => `
                        <div class="bg-brand-500/10 border-l-4 border-brand-500 text-brand-600 dark:text-brand-300 p-3 rounded-r-xl flex justify-between items-center shadow-sm">

                            <div>
                                <h5 class="font-bold text-xs">
                                    ${block.title}
                                </h5>

                                <p class="text-[10px] text-gray-400 mt-0.5">
                                    ${block.startHour}:00 -
                                    ${block.startHour + block.duration}:00
                                    (${block.duration} hr)
                                </p>
                            </div>

                            <button
                                data-action="delete-timeblock"
                                data-id="${block.id}"
                                class="text-gray-400 hover:text-red-500 text-xs"
                            >
                                <i class="fa-solid fa-xmark"></i>
                            </button>

                        </div>
                    `)
                    .join('')}

            </div>
        `;

        container.appendChild(row);
    }
}

export function deleteTimeBlock(id) {
    state.timeBlocks =
        state.timeBlocks.filter(
            block => block.id !== id
        );

    saveStorage();

    renderTimeline();
}
