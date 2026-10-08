import { renderStats } from '../statistics/statistics.js';
import { renderWeeklyTasks } from '../weekly/weekly.js';
import { renderTimeline } from '../planner/planner.js';
import { renderRoutines } from '../routines/routines.js';
import { renderFridge } from '../fridge/index.js';

export function switchTab(tabId) {
    document
        .querySelectorAll('.tab-content')
        .forEach(element => {
            element.classList.add('hidden');
        });

    const tab =
        document.getElementById(tabId);

    if (!tab) return;

    tab.classList.remove('hidden');

    document
        .querySelectorAll('.nav-btn')
        .forEach(button => {
            button.classList.remove(
                'bg-brand-500',
                'text-white',
                'shadow-lg'
            );

            button.classList.add(
                'text-gray-600',
                'dark:text-gray-400'
            );
        });

    const activeButton =
        document.getElementById(`nav-${tabId}`);

    if (activeButton) {
        activeButton.classList.add(
            'bg-brand-500',
            'text-white',
            'shadow-lg'
        );

        activeButton.classList.remove(
            'text-gray-600',
            'dark:text-gray-400'
        );
    }

    switch (tabId) {
        case 'tab-routines':
            renderRoutines();
            break;

        case 'tab-weekly':
            renderWeeklyTasks();
            break;

        case 'tab-planner':
            renderTimeline();
            break;

        case 'tab-fridge':
            renderFridge();
            break;

        case 'tab-stats':
            renderStats();
            break;
    }
}

export function toggleTheme() {
    const html =
        document.documentElement;

    const isDark =
        html.classList.toggle('dark');

    const label =
        document.getElementById('theme-label');

    if (label) {
        label.innerText =
            isDark
                ? 'Modo Escuro'
                : 'Modo Claro';
    }
}

export function renderHeaderDate() {
    const element =
        document.getElementById(
            'current-date-str'
        );

    if (!element) return;

    const options = {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
    };

    element.innerText =
        new Date().toLocaleDateString(
            'en-US',
            options
        );
}
