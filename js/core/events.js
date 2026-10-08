import {
    toggleTheme,
    switchTab
} from './navigation.js';

import {
    openModal,
    closeModal
} from './modal.js';

import {
    filterCategory,
    toggleHabitDone,
    editHabit,
    deleteHabit,
    saveHabit
} from '../routines/routines.js';

import {
    saveWeeklyTask,
    toggleWeeklyTaskDone,
    deleteWeeklyTask
} from '../weekly/weekly.js';

import {
    openTimeBlockModal,
    saveTimeBlock,
    deleteTimeBlock
} from '../planner/planner.js';

import {
    setFridgeView,
    addFridgeItem,
    removeFridgeItem,
    changeQuantity,
    manualQuantityUpdate
} from '../fridge/inventory.js';

import {
    showNutrition
} from '../fridge/nutrition.js';

import {
    saveCustomRecipe,
    deleteCustomRecipe,
    cookRecipe
} from '../fridge/recipes.js';

import {
    exportData,
    importData,
    confirmResetData
} from '../backup/backup.js';

export function initializeEvents() {
    document.addEventListener(
        'click',
        handleClick
    );

    document.addEventListener(
        'submit',
        handleSubmit
    );

    document.addEventListener(
        'change',
        handleChange
    );
}

function handleClick(event) {
    const element =
        event.target.closest(
            '[data-action]'
        );

    if (!element) return;

    const action =
        element.dataset.action;

    switch (action) {
        case 'toggle-theme':
            toggleTheme();
            break;

        case 'switch-tab':
            switchTab(
                element.dataset.tab
            );
            break;

        case 'open-modal':
            openModal(
                element.dataset.modal
            );
            break;

        case 'close-modal':
            closeModal(
                element.dataset.modal
            );
            break;

        case 'filter-category':
            filterCategory(
                element.dataset.category
            );
            break;

        case 'toggle-habit':
            toggleHabitDone(
                element.dataset.id
            );
            break;

        case 'edit-habit':
            editHabit(
                element.dataset.id
            );
            break;

        case 'delete-habit':
            deleteHabit(
                element.dataset.id
            );
            break;

        case 'toggle-weekly':
            toggleWeeklyTaskDone(
                element.dataset.id
            );
            break;

        case 'delete-weekly':
            deleteWeeklyTask(
                element.dataset.id
            );
            break;

        case 'open-timeblock':
            openTimeBlockModal();
            break;

        case 'delete-timeblock':
            deleteTimeBlock(
                element.dataset.id
            );
            break;

        case 'set-fridge-view':
            setFridgeView(
                element.dataset.view
            );
            break;

        case 'show-nutrition':
            showNutrition(
                element.dataset.id
            );
            break;

        case 'change-quantity':
            changeQuantity(
                element.dataset.id,
                Number(
                    element.dataset.change
                )
            );
            break;

        case 'remove-fridge-item':
            removeFridgeItem(
                element.dataset.id
            );
            break;

        case 'delete-custom-recipe':
            deleteCustomRecipe(
                element.dataset.id
            );
            break;

        case 'cook-recipe':
            if (
                !element.disabled
            ) {
                cookRecipe(
                    element.dataset.id
                );
            }
            break;

        case 'export-data':
            exportData();
            break;

        case 'reset-data':
            confirmResetData();
            break;
    }
}

function handleSubmit(event) {
    switch (event.target.id) {
        case 'habit-form':
            saveHabit(event);
            break;

        case 'weekly-form':
            saveWeeklyTask(event);
            break;

        case 'timeblock-form':
            saveTimeBlock(event);
            break;

        case 'fridge-form':
            addFridgeItem(event);
            break;

        case 'recipe-form':
            saveCustomRecipe(event);
            break;
    }
}

function handleChange(event) {
    const element =
        event.target;

    if (
        element.matches(
            '[data-action="manual-quantity"]'
        )
    ) {
        manualQuantityUpdate(
            element.dataset.id,
            element
        );

        return;
    }

    if (
        element.matches(
            '[data-action="import-data"]'
        )
    ) {
        importData(event);
    }
}
