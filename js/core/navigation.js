import { renderStats } from '../statistics/statistics.js';
import { renderWeeklyTasks } from '../weekly/weekly.js';
import { renderTimeline } from '../planner/planner.js';
import {
    renderFridgeInventory
} from '../fridge/inventory.js';
import {
    renderRecipes
} from '../fridge/recipes.js';

export function switchTab(tabId) {
    document
        .querySelectorAll('.tab-content')
        .forEach(tab => {
            tab.classList.add('hidden');
        });

    document
        .getElementById(tabId)
        ?.classList.remove('hidden');

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
        case 'tab-stats':
            renderStats();
            break;

        case 'tab-planner':
            renderTimeline();
            break;

        case 'tab-weekly':
            renderWeeklyTasks();
            break;

        case 'tab-fridge':
            renderFridgeInventory();
            renderRecipes();
            break;
    }
}

export function toggleTheme() {
    const html = document.documentElement;

    const isDark =
        html.classList.toggle('dark');

    const label =
        document.getElementById('theme-label');

    if (label) {
        label.innerText =
            isDark ? 'Dark Mode' : 'Light Mode';
    }
}

export function renderHeaderDate() {
    const element =
        document.getElementById('current-date-str');

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
