
import {
    fridgeState
} from '../core/state.js';

import {
    DEFAULT_RECIPES
} from '../core/constants.js';

import {
    saveFridgeStorage
} from '../core/storage.js';

import {
    closeModal
} from '../core/modal.js';

import {
    dispatchAppEvent
} from '../core/utils.js';

export function renderRecipes() {
    const container =
        document.getElementById(
            'recipes-container'
        );

    if (!container) return;

    container.innerHTML = '';

    const allRecipes = [
        ...DEFAULT_RECIPES,
        ...(fridgeState.customRecipes || [])
    ];

    const availableIngredients =
        fridgeState.items.map(
            item =>
                item.name
                    .toLowerCase()
                    .trim()
        );

    if (allRecipes.length === 0) {
        container.innerHTML = `
            <p class="text-sm text-gray-500">
                Nenhuma receita encontrada.
            </p>
        `;

        return;
    }

    allRecipes.forEach(recipe => {
        const missing =
            recipe.ingredients.filter(
                ingredient =>
                    !availableIngredients.includes(
                        ingredient
                            .toLowerCase()
                            .trim()
                    )
            );

        const canMake =
            missing.length === 0;

        const ingredientsHtml =
            recipe.ingredients
                .map(ingredient => {
                    const hasIngredient =
                        availableIngredients.includes(
                            ingredient
                                .toLowerCase()
                                .trim()
                        );

                    return `
                        <span class="text-[10px] px-2 py-1 rounded-md font-medium border ${
                            hasIngredient
                                ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 border-emerald-200 dark:border-emerald-800'
                                : 'bg-red-50 dark:bg-red-900/30 text-red-600 border-red-200 dark:border-red-800'
                        }">
                            ${ingredient}
                        </span>
                    `;
                })
                .join('');

        const card =
            document.createElement('div');

        card.className =
            `p-4 rounded-xl border ${
                canMake
                    ? 'border-brand-500 bg-brand-50/30 dark:bg-brand-900/10'
                    : 'border-gray-200 dark:border-darkborder bg-white dark:bg-darkcard'
            } flex flex-col justify-between space-y-3 transition-all`;

        card.innerHTML = `
            <div>

                <div class="flex justify-between items-start mb-2">

                    <h4 class="font-bold text-sm flex items-center gap-2">
                        <i class="fa-solid fa-utensils text-gray-400"></i>
                        ${recipe.name}
                    </h4>

                    ${
                        recipe.id.startsWith('c_')
                            ? `
                                <button
                                    data-action="delete-custom-recipe"
                                    data-id="${recipe.id}"
                                    class="text-xs text-gray-400 hover:text-red-500"
                                >
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            `
                            : ''
                    }

                </div>

                <div class="flex flex-wrap gap-1.5 mt-2">
                    ${ingredientsHtml}
                </div>

            </div>

            <div>

                <button
                    data-action="cook-recipe"
                    data-id="${recipe.id}"
                    ${
                        !canMake
                            ? 'disabled'
                            : ''
                    }
                    class="w-full mt-2 py-2 rounded-lg text-xs font-semibold transition-colors ${
                        canMake
                            ? 'bg-brand-500 hover:bg-brand-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                    }"
                >
                    ${
                        canMake
                            ? 'Cozinhar (-1 un / 100g)'
                            : `Faltam ${missing.length} item(s)`
                    }
                </button>

            </div>
        `;

        container.appendChild(card);
    });
}

export function saveCustomRecipe(event) {
    event.preventDefault();

    const name =
        document.getElementById(
            'recipe-name'
        ).value.trim();

    const ingredientString =
        document.getElementById(
            'recipe-ingredients'
        ).value;

    const ingredients =
        ingredientString
            .split(',')
            .map(
                value => value.trim()
            )
            .filter(
                value => value !== ''
            );

    if (
        !name ||
        ingredients.length === 0
    ) {
        return;
    }

    if (
        !fridgeState.customRecipes
    ) {
        fridgeState.customRecipes = [];
    }

    fridgeState.customRecipes.push({
        id: `c_${Date.now()}`,
        name,
        ingredients
    });

    saveFridgeStorage();

    renderRecipes();

    closeModal('recipe-modal');
}

export function deleteCustomRecipe(id) {
    if (
        !confirm(
            'Remover esta receita?'
        )
    ) {
        return;
    }

    fridgeState.customRecipes =
        fridgeState.customRecipes.filter(
            recipe =>
                recipe.id !== id
        );

    saveFridgeStorage();

    renderRecipes();
}

export function cookRecipe(recipeId) {
    const allRecipes = [
        ...DEFAULT_RECIPES,
        ...(fridgeState.customRecipes || [])
    ];

    const recipe =
        allRecipes.find(
            current =>
                current.id === recipeId
        );

    if (!recipe) return;

    recipe.ingredients.forEach(
        requiredIngredient => {
            const requiredName =
                requiredIngredient
                    .toLowerCase()
                    .trim();

            const item =
                fridgeState.items.find(
                    current =>
                        current.name
                            .toLowerCase() ===
                        requiredName
                );

            if (!item) return;

            const deduction =
                item.unit === 'g' ||
                item.unit === 'ml'
                    ? 100
                    : 1;

            item.quantity -= deduction;
        }
    );

    fridgeState.items =
        fridgeState.items.filter(
            item => item.quantity > 0
        );

    saveFridgeStorage();

    dispatchAppEvent(
        'fridge:changed'
    );

    if (typeof confetti === 'function') {
        confetti({
            particleCount: 40,
            spread: 50,
            origin: {
                y: 0.7
            },
            colors: [
                '#d47bb6',
                '#ffffff'
            ]
        });
    }
}
