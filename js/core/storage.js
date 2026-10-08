import { state, fridgeState } from './state.js';
import {
    DEFAULT_HABITS,
    DEFAULT_TIMEBLOCKS
} from './constants.js';

export function loadStorage() {
    const savedHabits = localStorage.getItem('rc_habits');
    const savedBlocks = localStorage.getItem('rc_blocks');
    const savedWeekly = localStorage.getItem('rc_weekly');

    state.habits = savedHabits
        ? JSON.parse(savedHabits)
        : structuredClone(DEFAULT_HABITS);

    state.timeBlocks = savedBlocks
        ? JSON.parse(savedBlocks)
        : structuredClone(DEFAULT_TIMEBLOCKS);

    state.weeklyTasks = savedWeekly
        ? JSON.parse(savedWeekly)
        : [];
}

export function saveStorage() {
    localStorage.setItem(
        'rc_habits',
        JSON.stringify(state.habits)
    );

    localStorage.setItem(
        'rc_blocks',
        JSON.stringify(state.timeBlocks)
    );

    localStorage.setItem(
        'rc_weekly',
        JSON.stringify(state.weeklyTasks)
    );
}

export function loadFridgeStorage() {
    const saved = localStorage.getItem('fridge_data_v2');

    if (!saved) return;

    const parsed = JSON.parse(saved);

    fridgeState.items = parsed.items ?? [];
    fridgeState.customRecipes = parsed.customRecipes ?? [];
}

export function saveFridgeStorage() {
    localStorage.setItem(
        'fridge_data_v2',
        JSON.stringify(fridgeState)
    );
}
