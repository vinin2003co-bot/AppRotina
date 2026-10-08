import {
    renderFridgeInventory
} from './inventory.js';

import {
    renderRecipes
} from './recipes.js';

let initialized = false;

export function initializeFridge() {
    if (initialized) return;

    document.addEventListener(
        'fridge:changed',
        refreshFridge
    );

    initialized = true;
}

export function refreshFridge() {
    renderFridgeInventory();
    renderRecipes();
}

export function renderFridge() {
    refreshFridge();
}

export {
    renderFridgeInventory,
    renderRecipes
};
