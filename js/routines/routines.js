import { state } from '../core/state.js';
import { saveStorage } from '../core/storage.js';
import { getTodayStr, generateId } from '../core/utils.js';
import { openModal, closeModal } from '../core/modal.js';

export function renderRoutines() {
    const container =
        document.getElementById(
            'routines-container'
        );

    if (!container) return;

    const today = getTodayStr();

    let filtered = state.habits;

    if (
        state.activeCategoryFilter !== 'All'
    ) {
        filtered = state.habits.filter(
            habit =>
                habit.category ===
                state.activeCategoryFilter
        );
    }

    const total = filtered.length;

    const completedCount =
        filtered.filter(
            habit =>
                habit.history &&
                habit.history[today]
        ).length;

    const percent =
        total === 0
            ? 0
            : Math.round(
                (completedCount / total) * 100
            );

    const progressText =
        document.getElementById(
            'progress-percentage-text'
        );

    const progressBar =
        document.getElementById(
            'progress-bar-fill'
        );

    if (progressText) {
        progressText.innerText =
            `${percent}% Completed (${completedCount}/${total})`;
    }

    if (progressBar) {
        progressBar.style.width =
            `${percent}%`;
    }

    container.innerHTML = '';

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12 border-2 border-dashed border-gray-200 dark:border-darkborder rounded-2xl">
                <i class="fa-solid fa-clipboard-list text-3xl text-gray-400 mb-2"></i>
                <p class="text-sm font-medium text-gray-500">
                    No routines found in this category.
                </p>
            </div>
        `;

        return;
    }

    const timesOfDay = [
        'Morning',
        'Afternoon',
        'Evening'
    ];

    timesOfDay.forEach(tod => {
        const groupHabits =
            filtered.filter(
                habit => habit.tod === tod
            );

        if (groupHabits.length === 0) {
            return;
        }

        const section =
            document.createElement('div');

        section.className =
            'space-y-3';

        const icon =
            tod === 'Morning'
                ? 'fa-sun text-amber-500'
                : tod === 'Afternoon'
                    ? 'fa-cloud-sun text-orange-500'
                    : 'fa-moon text-indigo-400';

        const habitsCardsHtml =
            groupHabits
                .map(habit => {
                    const isDone =
                        habit.history &&
                        habit.history[today];

                    return `
                        <div class="bg-white dark:bg-darkcard border ${
                            isDone
                                ? 'border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/10'
                                : 'border-gray-200 dark:border-darkborder'
                        } rounded-2xl p-4 flex items-center justify-between shadow-sm transition-all hover:border-brand-500/50">

                            <div class="flex items-center space-x-4">

                                <button
                                    data-action="toggle-habit"
                                    data-id="${habit.id}"
                                    class="w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                        isDone
                                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-brand-500'
                                    }"
                                >
                                    <i class="fa-solid ${
                                        isDone
                                            ? 'fa-check text-lg'
                                            : 'fa-circle text-xs'
                                    }"></i>
                                </button>

                                <div>
                                    <h4 class="font-semibold text-sm ${
                                        isDone
                                            ? 'line-through text-gray-400 dark:text-gray-500'
                                            : ''
                                    }">
                                        ${habit.title}
                                    </h4>

                                    <div class="flex items-center space-x-2 mt-1">
                                        <span
                                            class="text-[10px] px-2 py-0.5 rounded-md font-semibold text-white"
                                            style="background-color: ${habit.color}"
                                        >
                                            ${habit.category}
                                        </span>

                                        <span class="text-xs text-gray-400">
                                            <i class="fa-solid fa-fire text-amber-500 mr-1"></i>
                                            ${habit.currentStreak || 0} streak
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div class="flex items-center space-x-1">

                                <button
                                    data-action="edit-habit"
                                    data-id="${habit.id}"
                                    class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs"
                                >
                                    <i class="fa-solid fa-pen"></i>
                                </button>

                                <button
                                    data-action="delete-habit"
                                    data-id="${habit.id}"
                                    class="p-2 text-gray-400 hover:text-red-500 text-xs"
                                >
                                    <i class="fa-solid fa-trash"></i>
                                </button>

                            </div>
                        </div>
                    `;
                })
                .join('');

        section.innerHTML = `
            <div class="flex items-center space-x-2 text-sm font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-darkborder pb-2">
                <i class="fa-solid ${icon}"></i>
                <span>${tod} Routines</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                ${habitsCardsHtml}
            </div>
        `;

        container.appendChild(section);
    });
}

export function toggleHabitDone(id) {
    const today = getTodayStr();

    const habit =
        state.habits.find(
            item => item.id === id
        );

    if (!habit) return;

    if (!habit.history) {
        habit.history = {};
    }

    if (habit.history[today]) {
        delete habit.history[today];

        habit.currentStreak =
            Math.max(
                0,
                (habit.currentStreak || 0) - 1
            );
    } else {
        habit.history[today] = true;

        habit.currentStreak =
            (habit.currentStreak || 0) + 1;

        if (
            habit.currentStreak >
            (habit.bestStreak || 0)
        ) {
            habit.bestStreak =
                habit.currentStreak;
        }

        if (typeof confetti === 'function') {
            confetti({
                particleCount: 40,
                spread: 60,
                origin: {
                    y: 0.8
                }
            });
        }
    }

    saveStorage();
    renderRoutines();
}

export function filterCategory(category) {
    state.activeCategoryFilter =
        category;

    document
        .querySelectorAll(
            '.category-filter-btn'
        )
        .forEach(button => {
            const buttonCategory =
                button.getAttribute(
                    'data-category'
                );

            if (
                buttonCategory === category
            ) {
                button.className =
                    'category-filter-btn px-4 py-2 rounded-xl text-xs font-semibold bg-brand-500 text-white shadow-sm transition-all whitespace-nowrap';
            } else {
                button.className =
                    'category-filter-btn px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-darkcard text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-darkborder hover:bg-gray-50 dark:hover:bg-gray-800 transition-all whitespace-nowrap';
            }
        });

    renderRoutines();
}

export function saveHabit(event) {
    event.preventDefault();

    const id =
        document.getElementById(
            'habit-id'
        ).value;

    const title =
        document.getElementById(
            'habit-title'
        ).value.trim();

    const category =
        document.getElementById(
            'habit-category'
        ).value;

    const tod =
        document.getElementById(
            'habit-tod'
        ).value;

    const frequency =
        document.getElementById(
            'habit-frequency'
        ).value;

    const color =
        document.getElementById(
            'habit-color'
        ).value;

    if (id) {
        const index =
            state.habits.findIndex(
                habit => habit.id === id
            );

        if (index !== -1) {
            state.habits[index] = {
                ...state.habits[index],
                title,
                category,
                tod,
                frequency,
                color
            };
        }
    } else {
        state.habits.push({
            id: generateId('h'),
            title,
            category,
            tod,
            frequency,
            color,
            currentStreak: 0,
            bestStreak: 0,
            history: {}
        });
    }

    saveStorage();

    closeModal('habit-modal');

    filterCategory('All');
}

export function editHabit(id) {
    const habit =
        state.habits.find(
            item => item.id === id
        );

    if (!habit) return;

    document.getElementById(
        'habit-id'
    ).value = habit.id;

    document.getElementById(
        'habit-title'
    ).value = habit.title;

    document.getElementById(
        'habit-category'
    ).value = habit.category;

    document.getElementById(
        'habit-tod'
    ).value = habit.tod;

    document.getElementById(
        'habit-frequency'
    ).value = habit.frequency;

    document.getElementById(
        'habit-color'
    ).value = habit.color;

    document.getElementById(
        'habit-modal-title'
    ).innerText = 'Edit Routine';

    openModal('habit-modal');
}

export function deleteHabit(id) {
    if (
        !confirm(
            'Are you sure you want to delete this routine?'
        )
    ) {
        return;
    }

    state.habits =
        state.habits.filter(
            habit => habit.id !== id
        );

    saveStorage();

    renderRoutines();
}
