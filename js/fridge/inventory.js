
import {
    fridgeState,
    uiState
} from '../core/state.js';

import {
    saveFridgeStorage
} from '../core/storage.js';

import {
    dispatchAppEvent
} from '../core/utils.js';

import {
    showNutrition
} from './nutrition.js';

export function setFridgeView(view) {
    uiState.currentFridgeView =
        view;

    const btnList =
        document.getElementById(
            'btn-view-list'
        );

    const btnShelf =
        document.getElementById(
            'btn-view-shelf'
        );

    [btnList, btnShelf]
        .filter(Boolean)
        .forEach(button => {
            button.className =
                'px-3 py-1.5 rounded-md text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 transition-all';
        });

    if (view === 'list') {
        if (btnList) {
            btnList.className =
                'px-3 py-1.5 rounded-md text-xs font-semibold bg-white dark:bg-darkcard shadow-sm text-brand-500 transition-all';
        }
    } else {
        if (btnShelf) {
            btnShelf.className =
                'px-3 py-1.5 rounded-md text-xs font-semibold bg-white dark:bg-darkcard shadow-sm text-brand-500 transition-all';
        }
    }

    renderFridgeInventory();
}

export function getStatus(expiryDate) {
    const today = new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );

    const expiry =
        new Date(expiryDate);

    expiry.setHours(
        0,
        0,
        0,
        0
    );

    const diffTime =
        expiry - today;

    const diffDays =
        Math.ceil(
            diffTime /
            (1000 * 60 * 60 * 24)
        );

    if (diffDays < 0) {
        return {
            label: 'Vencido',
            color: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
            dot: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'
        };
    }

    if (diffDays <= 3) {
        return {
            label: `Vence em ${diffDays}d`,
            color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
            dot: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]'
        };
    }

    return {
        label: 'Bom',
        color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
        dot: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
    };
}

export function addFridgeItem(event) {
    event.preventDefault();

    const name =
        document.getElementById(
            'fridge-item-name'
        ).value.trim();

    const quantity =
        parseFloat(
            document.getElementById(
                'fridge-item-qty'
            ).value
        );

    const unit =
        document.getElementById(
            'fridge-item-unit'
        ).value;

    const expiry =
        document.getElementById(
            'fridge-item-expiry'
        ).value;

    if (!name || quantity <= 0) {
        return;
    }

    const formattedName =
        name.charAt(0).toUpperCase() +
        name.slice(1).toLowerCase();

    const existingIndex =
        fridgeState.items.findIndex(
            item =>
                item.name === formattedName &&
                item.unit === unit
        );

    if (existingIndex > -1) {
        fridgeState.items[
            existingIndex
        ].quantity += quantity;

        fridgeState.items[
            existingIndex
        ].expiry = expiry;
    } else {
        fridgeState.items.push({
            id: `item_${Date.now()}`,
            name: formattedName,
            quantity,
            unit,
            expiry
        });
    }

    saveFridgeStorage();

    renderFridgeInventory();

    document.getElementById(
        'fridge-item-name'
    ).value = '';

    document.getElementById(
        'fridge-item-qty'
    ).value = '';

    dispatchAppEvent(
        'fridge:changed'
    );
}

export function removeFridgeItem(id) {
    fridgeState.items =
        fridgeState.items.filter(
            item => item.id !== id
        );

    saveFridgeStorage();

    renderFridgeInventory();

    dispatchAppEvent(
        'fridge:changed'
    );
}

export function changeQuantity(
    id,
    changeAmount
) {
    const item =
        fridgeState.items.find(
            current => current.id === id
        );

    if (!item) return;

    item.quantity += changeAmount;

    if (item.quantity <= 0) {
        removeFridgeItem(id);
        return;
    }

    saveFridgeStorage();

    renderFridgeInventory();

    dispatchAppEvent(
        'fridge:changed'
    );
}

export function manualQuantityUpdate(
    id,
    inputElement
) {
    const item =
        fridgeState.items.find(
            current => current.id === id
        );

    if (!item) return;

    const newQuantity =
        parseFloat(
            inputElement.value
        );

    if (
        Number.isNaN(newQuantity) ||
        newQuantity <= 0
    ) {
        removeFridgeItem(id);
        return;
    }

    item.quantity =
        newQuantity;

    saveFridgeStorage();

    renderFridgeInventory();

    dispatchAppEvent(
        'fridge:changed'
    );
}

export function renderFridgeInventory() {
    const countElement =
        document.getElementById(
            'inventory-count'
        );

    if (countElement) {
        countElement.innerText =
            `${fridgeState.items.length} itens`;
    }

    const sortedItems =
        [...fridgeState.items].sort(
            (a, b) =>
                new Date(a.expiry) -
                new Date(b.expiry)
        );

    const listContainer =
        document.getElementById(
            'fridge-list-container'
        );

    const shelfContainer =
        document.getElementById(
            'fridge-shelf-container'
        );

    if (
        !listContainer ||
        !shelfContainer
    ) {
        return;
    }

    if (
        uiState.currentFridgeView ===
        'list'
    ) {
        listContainer.classList.remove(
            'hidden'
        );

        shelfContainer.classList.add(
            'hidden'
        );

        shelfContainer.classList.remove(
            'flex'
        );

        renderListView(
            sortedItems
        );
    } else {
        listContainer.classList.add(
            'hidden'
        );

        shelfContainer.classList.remove(
            'hidden'
        );

        shelfContainer.classList.add(
            'flex'
        );

        renderShelfView(
            sortedItems
        );
    }
}

function renderListView(items) {
    const tbody =
        document.getElementById(
            'inventory-table-body'
        );

    if (!tbody) return;

    tbody.innerHTML = '';

    if (items.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td
                    colspan="5"
                    class="py-8 text-center text-gray-400 italic"
                >
                    Sua despensa está vazia.
                </td>
            </tr>
        `;

        return;
    }

    items.forEach(item => {
        const status =
            getStatus(item.expiry);

        const step =
            item.unit === 'g' ||
            item.unit === 'ml'
                ? 50
                : 1;

        const displayDate =
            item.expiry
                .split('-')
                .reverse()
                .join('/')
                .slice(0, 8);

        const row =
            document.createElement('tr');

        row.innerHTML = `
            <td class="py-3 px-4">

                <button
                    data-action="show-nutrition"
                    data-id="${item.id}"
                    class="font-medium text-left hover:text-brand-500 transition-colors inline-flex items-center gap-1.5 focus:outline-none"
                >
                    ${item.name}

                    <i class="fa-solid fa-circle-info text-[10px] text-gray-400"></i>
                </button>

            </td>

            <td class="py-3 px-4">

                <div class="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-lg w-max px-1 py-1">

                    <button
                        data-action="change-quantity"
                        data-id="${item.id}"
                        data-change="-${step}"
                        class="w-6 h-6 rounded flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                        -
                    </button>

                    <input
                        type="number"
                        value="${item.quantity}"
                        data-action="manual-quantity"
                        data-id="${item.id}"
                        class="w-12 text-center bg-transparent border-none focus:outline-none text-sm font-semibold p-0"
                    >

                    <span class="text-xs text-gray-400 font-medium w-4">
                        ${item.unit}
                    </span>

                    <button
                        data-action="change-quantity"
                        data-id="${item.id}"
                        data-change="${step}"
                        class="w-6 h-6 rounded flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                        +
                    </button>

                </div>

            </td>

            <td class="py-3 px-4 text-gray-500">
                ${displayDate}
            </td>

            <td class="py-3 px-4">
                <span class="px-2.5 py-1 rounded-md text-[10px] font-bold ${status.color}">
                    ${status.label}
                </span>
            </td>

            <td class="py-3 px-4 text-right">

                <button
                    data-action="remove-fridge-item"
                    data-id="${item.id}"
                    class="text-gray-400 hover:text-red-500 transition-colors"
                >
                    <i class="fa-solid fa-trash"></i>
                </button>

            </td>
        `;

        tbody.appendChild(row);
    });
}

function renderShelfView(items) {
    const container =
        document.getElementById(
            'fridge-shelf-container'
        );

    if (!container) return;

    container.innerHTML = '';

    const shelfGroups = [
        [],
        [],
        []
    ];

    items.forEach(
        (item, index) => {
            shelfGroups[
                index % 3
            ].push(item);
        }
    );

    shelfGroups.forEach(group => {
        const shelf =
            document.createElement('div');

        shelf.className =
            'w-full min-h-[90px] border-b-[8px] border-gray-300 dark:border-gray-600/60 flex flex-wrap gap-4 items-end pb-1 px-4';

        if (group.length === 0) {
            shelf.innerHTML = `
                <span class="w-full text-center text-xs text-gray-400 dark:text-gray-500 pb-2 italic opacity-50">
                    Prateleira vazia
                </span>
            `;
        } else {
            group.forEach(item => {
                const status =
                    getStatus(item.expiry);

                shelf.innerHTML += `
                    <div class="relative group">

                        <div
                            data-action="show-nutrition"
                            data-id="${item.id}"
                            class="bg-white dark:bg-darkcard px-3 py-2.5 rounded-t-lg rounded-b-sm border border-gray-200 dark:border-gray-600 shadow-sm flex flex-col items-center justify-center transform transition-all hover:-translate-y-1.5 hover:border-brand-400 cursor-pointer w-[85px]"
                        >
                            <span class="text-xs font-semibold text-gray-700 dark:text-gray-200 text-center w-full truncate leading-tight">
                                ${item.name}
                            </span>

                            <span class="text-[10px] text-gray-500 dark:text-gray-400 mt-1 font-medium">
                                ${item.quantity} ${item.unit}
                            </span>

                            <div class="w-2 h-2 rounded-full mt-2 ${status.dot}"></div>
                        </div>

                        <button
                            data-action="remove-fridge-item"
                            data-id="${item.id}"
                            class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
                        >
                            <i class="fa-solid fa-xmark text-[10px]"></i>
                        </button>

                    </div>
                `;
            });
        }

        container.appendChild(shelf);
    });
}
