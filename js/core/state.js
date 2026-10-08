import {
    DEFAULT_HABITS,
    DEFAULT_TIMEBLOCKS
} from './constants.js';

export const state = {
    habits: [],
    timeBlocks: [],
    weeklyTasks: [],
    activeCategoryFilter: 'All'
};

export const fridgeState = {
    items: [
        {
            id: 'i1',
            name: 'Leite',
            quantity: 1000,
            unit: 'ml',
            expiry: '2026-10-15'
        },
        {
            id: 'i2',
            name: 'Ovo',
            quantity: 12,
            unit: 'un',
            expiry: '2026-10-10'
        },
        {
            id: 'i3',
            name: 'Tomate',
            quantity: 500,
            unit: 'g',
            expiry: '2026-10-06'
        }
    ],

    customRecipes: []
};

export const uiState = {
    currentFridgeView: 'list'
};

export function initializeState() {
    state.habits = structuredClone(DEFAULT_HABITS);
    state.timeBlocks = structuredClone(DEFAULT_TIMEBLOCKS);
    state.weeklyTasks = [];
}
