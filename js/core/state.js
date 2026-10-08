import {
    DEFAULT_FRIDGE_ITEMS
} from './constants.js';

export const state = {
    habits: [],
    timeBlocks: [],
    weeklyTasks: [],
    activeCategoryFilter: 'All'
};

export const fridgeState = {
    items: [],
    customRecipes: []
};

export const uiState = {
    currentFridgeView: 'list'
};

export function setRoutineState(newState = {}) {
    state.habits = Array.isArray(newState.habits)
        ? newState.habits
        : [];

    state.timeBlocks = Array.isArray(newState.timeBlocks)
        ? newState.timeBlocks
        : [];

    state.weeklyTasks = Array.isArray(newState.weeklyTasks)
        ? newState.weeklyTasks
        : [];

    state.activeCategoryFilter =
        newState.activeCategoryFilter || 'All';
}

export function setFridgeState(newState = {}) {
    fridgeState.items = Array.isArray(newState.items)
        ? newState.items
        : [];

    fridgeState.customRecipes =
        Array.isArray(newState.customRecipes)
            ? newState.customRecipes
            : [];
}

export function resetState() {
    state.habits = [];
    state.timeBlocks = [];
    state.weeklyTasks = [];
    state.activeCategoryFilter = 'All';

    fridgeState.items = [];
    fridgeState.customRecipes = [];
}

export function initializeEmptyFridge() {
    fridgeState.items = structuredClone(DEFAULT_FRIDGE_ITEMS);
    fridgeState.customRecipes = [];
}
