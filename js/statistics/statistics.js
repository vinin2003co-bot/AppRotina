import {
    state
} from '../core/state.js';

import {
    getTodayStr,
    getWeekDates
} from '../core/utils.js';

export function renderStats() {
    const total =
        state.habits.length;

    const bestStreak =
        state.habits.reduce(
            (maximum, habit) =>
                Math.max(
                    maximum,
                    habit.bestStreak || 0
                ),
            0
        );

    const today =
        getTodayStr();

    const todayCompleted =
        state.habits.filter(
            habit =>
                habit.history &&
                habit.history[today]
        ).length;

    const totalRoutinesElement =
        document.getElementById(
            'stat-total-routines'
        );

    const bestStreakElement =
        document.getElementById(
            'stat-best-streak'
        );

    const todayCompletedElement =
        document.getElementById(
            'stat-today-completed'
        );

    const weeklyRateElement =
        document.getElementById(
            'stat-weekly-rate'
        );

    if (totalRoutinesElement) {
        totalRoutinesElement.innerText =
            total;
    }

    if (bestStreakElement) {
        bestStreakElement.innerHTML =
            `${bestStreak}
             <span class="text-sm font-normal text-gray-400">
                 days
             </span>`;
    }

    if (todayCompletedElement) {
        todayCompletedElement.innerText =
            `${todayCompleted} / ${total}`;
    }

    if (weeklyRateElement) {
        weeklyRateElement.innerText =
            total === 0
                ? '0%'
                : `${Math.round(
                    (todayCompleted / total) * 100
                )}%`;
    }

    const tableBody =
        document.getElementById(
            'weekly-matrix-body'
        );

    if (!tableBody) return;

    tableBody.innerHTML = '';

    const datesOfWeek =
        getWeekDates();

    state.habits.forEach(habit => {
        const row =
            document.createElement('tr');

        row.className =
            'hover:bg-gray-50/50 dark:hover:bg-gray-800/40';

        let daysHtml = '';

        datesOfWeek.forEach(
            dateString => {
                const isDone =
                    habit.history &&
                    habit.history[dateString];

                daysHtml += `
                    <td class="py-3 px-2 text-center">

                        <span class="inline-block w-5 h-5 rounded-md ${
                            isDone
                                ? 'bg-emerald-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-transparent'
                        } text-[10px] flex items-center justify-center mx-auto">

                            <i class="fa-solid fa-check"></i>

                        </span>

                    </td>
                `;
            }
        );

        row.innerHTML = `
            <td class="py-3 px-4 font-medium flex items-center space-x-2">

                <span
                    class="w-2 h-2 rounded-full"
                    style="background-color: ${habit.color}"
                ></span>

                <span>
                    ${habit.title}
                </span>

            </td>

            ${daysHtml}

            <td class="py-3 px-4 text-right font-semibold text-amber-500">

                <i class="fa-solid fa-fire text-xs mr-1"></i>

                ${habit.currentStreak || 0}

            </td>
        `;

        tableBody.appendChild(row);
    });
}
