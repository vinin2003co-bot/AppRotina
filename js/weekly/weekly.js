import { state } from '../core/state.js';
import { saveStorage } from '../core/storage.js';
import { closeModal } from '../core/modal.js';
import {
    DAYS_OF_WEEK
} from '../core/constants.js';
import {
    generateId
} from '../core/utils.js';

export function renderWeeklyTasks() {
    const container =
        document.getElementById(
            'weekly-days-container'
        );

    if (!container) return;

    container.innerHTML = '';

    DAYS_OF_WEEK.forEach(day => {
        const dayTasks =
            state.weeklyTasks.filter(
                task => task.day === day
            );

        const card =
            document.createElement('div');

        card.className =
            'bg-white dark:bg-darkcard border border-gray-200 dark:border-darkborder rounded-2xl p-4 shadow-sm flex flex-col justify-between space-y-3';

        const tasksListHtml =
            dayTasks.length === 0
                ? `
                    <p class="text-xs text-gray-400 italic">
                        Nenhuma tarefa
                    </p>
                `
                : dayTasks
                    .map(task => `
                        <div class="flex items-center justify-between bg-gray-50 dark:bg-gray-800/60 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">

                            <div class="flex items-center space-x-2.5">

                                <button
                                    data-action="toggle-weekly"
                                    data-id="${task.id}"
                                    class="w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                                        task.completed
                                            ? 'bg-emerald-500 border-emerald-500 text-white'
                                            : 'border-gray-300 dark:border-gray-600 text-transparent'
                                    }"
                                >
                                    <i class="fa-solid fa-check text-[10px]"></i>
                                </button>

                                <span class="text-xs font-medium ${
                                    task.completed
                                        ? 'line-through text-gray-400'
                                        : ''
                                }">
                                    ${task.title}
                                </span>

                            </div>

                            <button
                                data-action="delete-weekly"
                                data-id="${task.id}"
                                class="text-gray-400 hover:text-red-500 text-xs p-1"
                            >
                                <i class="fa-solid fa-trash"></i>
                            </button>

                        </div>
                    `)
                    .join('');

        card.innerHTML = `
            <div>

                <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2 mb-3">

                    <h4 class="font-bold text-sm tracking-wide text-brand-500">
                        ${day}
                    </h4>

                    <span class="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 font-semibold">
                        ${dayTasks.length}
                    </span>

                </div>

                <div class="space-y-2">
                    ${tasksListHtml}
                </div>

            </div>
        `;

        container.appendChild(card);
    });
}

export function saveWeeklyTask(event) {
    event.preventDefault();

    const title =
        document.getElementById(
            'wt-title'
        ).value.trim();

    const day =
        document.getElementById(
            'wt-day'
        ).value;

    if (!title) return;

    state.weeklyTasks.push({
        id: generateId('wt'),
        title,
        day,
        completed: false
    });

    saveStorage();

    closeModal('weekly-modal');

    renderWeeklyTasks();
}

export function toggleWeeklyTaskDone(id) {
    const task =
        state.weeklyTasks.find(
            item => item.id === id
        );

    if (!task) return;

    task.completed =
        !task.completed;

    saveStorage();

    renderWeeklyTasks();
}

export function deleteWeeklyTask(id) {
    state.weeklyTasks =
        state.weeklyTasks.filter(
            task => task.id !== id
        );

    saveStorage();

    renderWeeklyTasks();
}
