import {
    fridgeState
} from '../core/state.js';

import {
    MOCK_NUTRITION_DB
} from '../core/constants.js';

import {
    openModal
} from '../core/modal.js';

export function getNutritionMock(name) {
    const key =
        name.toLowerCase().trim();

    if (MOCK_NUTRITION_DB[key]) {
        return MOCK_NUTRITION_DB[key];
    }

    let hash = 0;

    for (
        let i = 0;
        i < key.length;
        i++
    ) {
        hash =
            key.charCodeAt(i) +
            ((hash << 5) - hash);
    }

    let seedValue =
        Math.abs(hash);

    const pseudoRandom = () => {
        seedValue =
            (
                seedValue * 9301 +
                49297
            ) % 233280;

        return (
            seedValue / 233280
        );
    };

    return {
        calories:
            Math.floor(
                pseudoRandom() * 250
            ) + 20,

        carbs:
            (
                pseudoRandom() * 30
            ).toFixed(1),

        protein:
            (
                pseudoRandom() * 20
            ).toFixed(1),

        fat:
            (
                pseudoRandom() * 15
            ).toFixed(1)
    };
}

export function showNutrition(id) {
    const item =
        fridgeState.items.find(
            current => current.id === id
        );

    if (!item) return;

    const nutrition =
        getNutritionMock(
            item.name
        );

    document.getElementById(
        'nutrition-title'
    ).innerText = item.name;

    document.getElementById(
        'nutrition-subtitle'
    ).innerText =
        item.unit === 'un'
            ? 'Valores ref. a 1 unidade'
            : `Valores ref. a 100${item.unit}`;

    document.getElementById(
        'nutri-cal'
    ).innerText =
        nutrition.calories;

    document.getElementById(
        'nutri-carb'
    ).innerText =
        nutrition.carbs;

    document.getElementById(
        'nutri-prot'
    ).innerText =
        nutrition.protein;

    document.getElementById(
        'nutri-fat'
    ).innerText =
        nutrition.fat;

    openModal('nutrition-modal');
}
