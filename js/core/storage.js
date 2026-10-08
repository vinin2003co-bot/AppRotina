import {
    DEFAULT_HABITS,
    DEFAULT_TIMEBLOCKS,
    DEFAULT_FRIDGE_ITEMS
} from './constants.js';

import {
    state,
    fridgeState,
    setRoutineState,
    setFridgeState
} from './state.js';

export function loadStorage() {
    const savedHabits =
        localStorage.getItem('rc_habits');

    const savedBlocks =
        localStorage.getItem('rc_blocks');

    const savedWeekly =
        localStorage.getItem('rc_weekly');

    setRoutineState({
        habits: savedHabits
            ? JSON.parse(savedHabits)
            : structuredClone(DEFAULT_HABITS),

        timeBlocks: savedBlocks
            ? JSON.parse(savedBlocks)
            : structuredClone(DEFAULT_TIMEBLOCKS),

        weeklyTasks: savedWeekly
            ? JSON.parse(savedWeekly)
            : [],

        activeCategoryFilter: 'All'
    });
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
    const saved =
        localStorage.getItem('fridge_data_v2');

    if (saved) {
        try {
            setFridgeState(JSON.parse(saved));
            return;
        } catch (error) {
            console.error(
                'Could not load fridge data:',
                error
            );
        }
    }

    setFridgeState({
        items: structuredClone(DEFAULT_FRIDGE_ITEMS),
        customRecipes: []
    });
}

export function saveFridgeStorage() {
    localStorage.setItem(
        'fridge_data_v2',
        JSON.stringify(fridgeState)
    );
}

export function clearStorage() {
    localStorage.removeItem('rc_habits');
    localStorage.removeItem('rc_blocks');
    localStorage.removeItem('rc_weekly');
    localStorage.removeItem('fridge_data_v2');
}
