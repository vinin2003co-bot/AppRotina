import {
    loadStorage,
    loadFridgeStorage
} from './core/storage.js';

import {
    initializeEvents
} from './core/events.js';

import {
    renderHeaderDate
} from './core/navigation.js';

import {
    renderRoutines
} from './routines/routines.js';

import {
    renderWeeklyTasks
} from './weekly/weekly.js';

import {
    renderTimeline,
    populateTimeSelects
} from './planner/planner.js';

import {
    renderStats
} from './statistics/statistics.js';

import {
    initializeFridge,
    renderFridge
} from './fridge/index.js';

function initializeExpiryDate() {
    const input =
        document.getElementById(
            'fridge-item-expiry'
        );

    if (!input) return;

    const nextWeek =
        new Date();

    nextWeek.setDate(
        nextWeek.getDate() + 7
    );

    input.value =
        nextWeek
            .toISOString()
            .split('T')[0];
}

function initializeApp() {
    loadStorage();
    loadFridgeStorage();

    initializeEvents();
    initializeFridge();

    renderHeaderDate();

    renderRoutines();
    renderWeeklyTasks();
    renderTimeline();
    renderStats();
    renderFridge();

    populateTimeSelects();
    initializeExpiryDate();
}

document.addEventListener(
    'DOMContentLoaded',
    initializeApp
);
