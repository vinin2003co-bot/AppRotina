const DEFAULT_HABITS = [
    { id: 'h1', title: 'Hydrate (500ml Water)', category: 'Health', tod: 'Morning', frequency: 'Daily', color: '#3b82f6', currentStreak: 3, bestStreak: 7, history: {} },
    { id: 'h2', title: '30-Min Cardio / Gym Workout', category: 'Fitness', tod: 'Morning', frequency: 'Daily', color: '#10b981', currentStreak: 5, bestStreak: 12, history: {} },
    { id: 'h3', title: 'Focus Work Session', category: 'Productivity', tod: 'Afternoon', frequency: 'Weekdays', color: '#6366f1', currentStreak: 2, bestStreak: 5, history: {} },
    { id: 'h4', title: 'Evening Reading / Learning', category: 'Mindset', tod: 'Evening', frequency: 'Daily', color: '#f59e0b', currentStreak: 1, bestStreak: 8, history: {} }
];

const DEFAULT_TIMEBLOCKS = [
    { id: 'tb1', title: 'Morning Exercise & Breakfast', startHour: 7, duration: 2 },
    { id: 'tb2', title: 'Core Product Development', startHour: 9, duration: 3 },
    { id: 'tb3', title: 'Reading & Wind Down', startHour: 21, duration: 1 }
];

const DAYS_OF_WEEK = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

const MOCK_NUTRITION_DB = {
    'leite': { calories: 60, carbs: 5, protein: 3.2, fat: 3 },
    'ovo': { calories: 155, carbs: 1.1, protein: 13, fat: 11 },
    'tomate': { calories: 18, carbs: 3.9, protein: 0.9, fat: 0.2 },
    'macarrão': { calories: 131, carbs: 25, protein: 5, fat: 1.1 },
    'queijo': { calories: 402, carbs: 1.3, protein: 25, fat: 33 },
    'frango': { calories: 165, carbs: 0, protein: 31, fat: 3.6 },
    'arroz': { calories: 130, carbs: 28, protein: 2.7, fat: 0.3 }
};

const DEFAULT_RECIPES = [
    { id: 'r1', name: 'Panqueca', ingredients: ['Ovo', 'Leite'] },
    { id: 'r2', name: 'Omelete', ingredients: ['Ovo', 'Tomate'] }
];

let state = {
    habits: [],
    timeBlocks: [],
    weeklyTasks: [],
    activeCategoryFilter: 'All'
};

let fridgeState = {
    items: [
        { id: 'i1', name: 'Leite', quantity: 1000, unit: 'ml', expiry: '2026-10-15' },
        { id: 'i2', name: 'Ovo', quantity: 12, unit: 'un', expiry: '2026-10-10' },
        { id: 'i3', name: 'Tomate', quantity: 500, unit: 'g', expiry: '2026-10-06' }
    ],
    customRecipes: []
};

let currentFridgeView = 'list';

function getTodayStr() {
    const d = new Date();
    return d.toISOString().split('T')[0];
}

window.addEventListener('DOMContentLoaded', () => {
    loadStorage();
    loadFridgeStorage();
    renderHeaderDate();
    renderRoutines();
    renderTimeline();
    renderWeeklyTasks();
    renderStats();
    populateTimeSelects();

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const expiryInput = document.getElementById('fridge-item-expiry');
    if (expiryInput) expiryInput.value = nextWeek.toISOString().split('T')[0];

    if (!document.getElementById('tab-fridge').classList.contains('hidden')) {
        renderFridgeInventory();
        renderRecipes();
    }
});

function loadStorage() {
    const savedHabits = localStorage.getItem('rc_habits');
    const savedBlocks = localStorage.getItem('rc_blocks');
    const savedWeekly = localStorage.getItem('rc_weekly');

    state.habits = savedHabits ? JSON.parse(savedHabits) : DEFAULT_HABITS;
    state.timeBlocks = savedBlocks ? JSON.parse(savedBlocks) : DEFAULT_TIMEBLOCKS;
    state.weeklyTasks = savedWeekly ? JSON.parse(savedWeekly) : [];
}

function saveStorage() {
    localStorage.setItem('rc_habits', JSON.stringify(state.habits));
    localStorage.setItem('rc_blocks', JSON.stringify(state.timeBlocks));
    localStorage.setItem('rc_weekly', JSON.stringify(state.weeklyTasks));
}

function loadFridgeStorage() {
    const saved = localStorage.getItem('fridge_data_v2');
    if (saved) fridgeState = JSON.parse(saved);
}

function saveFridgeStorage() {
    localStorage.setItem('fridge_data_v2', JSON.stringify(fridgeState));
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.getElementById(tabId).classList.remove('hidden');

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('bg-brand-500', 'text-white', 'shadow-lg');
        btn.classList.add('text-gray-600', 'dark:text-gray-400');
    });

    const activeBtn = document.getElementById(`nav-${tabId}`);
    if (activeBtn) {
        activeBtn.classList.add('bg-brand-500', 'text-white', 'shadow-lg');
        activeBtn.classList.remove('text-gray-600', 'dark:text-gray-400');
    }

    if (tabId === 'tab-stats') renderStats();
    if (tabId === 'tab-planner') renderTimeline();
    if (tabId === 'tab-weekly') renderWeeklyTasks();
    if (tabId === 'tab-fridge') { renderFridgeInventory(); renderRecipes(); }
}

function openModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
    if (modalId === 'habit-modal') document.getElementById('habit-form').reset();
    if (modalId === 'weekly-modal') document.getElementById('weekly-form').reset();
    if (modalId === 'recipe-modal') document.getElementById('recipe-form').reset();
}

function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.classList.toggle('dark');
    document.getElementById('theme-label').innerText = isDark ? 'Dark Mode' : 'Light Mode';
}

function renderHeaderDate() {
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    document.getElementById('current-date-str').innerText = new Date().toLocaleDateString('en-US', options);
}

// Routines & Habits Engine
function renderRoutines() {
    const container = document.getElementById('routines-container');
    const today = getTodayStr();

    let filtered = state.habits;
    if (state.activeCategoryFilter !== 'All') {
        filtered = state.habits.filter(h => h.category === state.activeCategoryFilter);
    }

    const total = filtered.length;
    const completedCount = filtered.filter(h => h.history && h.history[today]).length;
    const percent = total === 0 ? 0 : Math.round((completedCount / total) * 100);

    document.getElementById('progress-percentage-text').innerText = `${percent}% Completed (${completedCount}/${total})`;
    document.getElementById('progress-bar-fill').style.width = `${percent}%`;

    container.innerHTML = '';

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12 border-2 border-dashed border-gray-200 dark:border-darkborder rounded-2xl">
                <i class="fa-solid fa-clipboard-list text-3xl text-gray-400 mb-2"></i>
                <p class="text-sm font-medium text-gray-500">No routines found in this category.</p>
            </div>
        `;
        return;
    }

    const timesOfDay = ['Morning', 'Afternoon', 'Evening'];

    timesOfDay.forEach(tod => {
        const groupHabits = filtered.filter(h => h.tod === tod);
        if (groupHabits.length === 0) return;

        const section = document.createElement('div');
        section.className = 'space-y-3';

        let icon = tod === 'Morning' ? 'fa-sun text-amber-500' : tod === 'Afternoon' ? 'fa-cloud-sun text-orange-500' : 'fa-moon text-indigo-400';

        const habitsCardsHtml = groupHabits.map(habit => {
            const isDone = habit.history && habit.history[today];
            return `
                <div class="bg-white dark:bg-darkcard border ${isDone ? 'border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/10' : 'border-gray-200 dark:border-darkborder'} rounded-2xl p-4 flex items-center justify-between shadow-sm transition-all hover:border-brand-500/50">
                    <div class="flex items-center space-x-4">
                        <button onclick="toggleHabitDone('${habit.id}')" class="w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isDone ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-brand-500'}">
                            <i class="fa-solid ${isDone ? 'fa-check text-lg' : 'fa-circle text-xs'}"></i>
                        </button>
                        <div>
                            <h4 class="font-semibold text-sm ${isDone ? 'line-through text-gray-400 dark:text-gray-500' : ''}">${habit.title}</h4>
                            <div class="flex items-center space-x-2 mt-1">
                                <span class="text-[10px] px-2 py-0.5 rounded-md font-semibold text-white" style="background-color: ${habit.color}">${habit.category}</span>
                                <span class="text-xs text-gray-400"><i class="fa-solid fa-fire text-amber-500 mr-1"></i>${habit.currentStreak || 0} streak</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center space-x-1">
                        <button onclick="editHabit('${habit.id}')" class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button onclick="deleteHabit('${habit.id}')" class="p-2 text-gray-400 hover:text-red-500 text-xs">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        section.innerHTML = `
            <div class="flex items-center space-x-2 text-sm font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-darkborder pb-2">
                <i class="fa-solid ${icon}"></i>
                <span>${tod} Routines</span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                ${habitsCardsHtml}
            </div>
        `;

        container.appendChild(section);
    });
}

function toggleHabitDone(id) {
    const today = getTodayStr();
    const habit = state.habits.find(h => h.id === id);
    if (!habit) return;

    if (!habit.history) habit.history = {};

    if (habit.history[today]) {
        delete habit.history[today];
        habit.currentStreak = Math.max(0, habit.currentStreak - 1);
    } else {
        habit.history[today] = true;
        habit.currentStreak = (habit.currentStreak || 0) + 1;
        if (habit.currentStreak > (habit.bestStreak || 0)) {
            habit.bestStreak = habit.currentStreak;
        }
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    }

    saveStorage();
    renderRoutines();
}

function filterCategory(cat) {
    state.activeCategoryFilter = cat;
    document.querySelectorAll('.category-filter-btn').forEach(btn => {
        const btnCat = btn.getAttribute('data-category');
        if (btnCat === cat) {
            btn.className = "category-filter-btn px-4 py-2 rounded-xl text-xs font-semibold bg-brand-500 text-white shadow-sm transition-all whitespace-nowrap";
        } else {
            btn.className = "category-filter-btn px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-darkcard text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-darkborder hover:bg-gray-50 dark:hover:bg-gray-800 transition-all whitespace-nowrap";
        }
    });
    renderRoutines();
}

function saveHabit(e) {
    e.preventDefault();
    const id = document.getElementById('habit-id').value;
    const title = document.getElementById('habit-title').value.trim();
    const category = document.getElementById('habit-category').value;
    const tod = document.getElementById('habit-tod').value;
    const frequency = document.getElementById('habit-frequency').value;
    const color = document.getElementById('habit-color').value;

    if (id) {
        const index = state.habits.findIndex(h => h.id === id);
        if (index !== -1) {
            state.habits[index] = { ...state.habits[index], title, category, tod, frequency, color };
        }
    } else {
        const newHabit = {
            id: 'h_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
            title,
            category,
            tod,
            frequency,
            color,
            currentStreak: 0,
            bestStreak: 0,
            history: {}
        };
        state.habits.push(newHabit);
    }

    saveStorage();
    closeModal('habit-modal');
    filterCategory('All');
}

function editHabit(id) {
    const habit = state.habits.find(h => h.id === id);
    if (!habit) return;

    document.getElementById('habit-id').value = habit.id;
    document.getElementById('habit-title').value = habit.title;
    document.getElementById('habit-category').value = habit.category;
    document.getElementById('habit-tod').value = habit.tod;
    document.getElementById('habit-frequency').value = habit.frequency;
    document.getElementById('habit-color').value = habit.color;
    document.getElementById('habit-modal-title').innerText = 'Edit Routine';

    openModal('habit-modal');
}

function deleteHabit(id) {
    if (confirm('Are you sure you want to delete this routine?')) {
        state.habits = state.habits.filter(h => h.id !== id);
        saveStorage();
        renderRoutines();
    }
}

// Weekly Tasks Engine
function renderWeeklyTasks() {
    const container = document.getElementById('weekly-days-container');
    if (!container) return;
    container.innerHTML = '';

    DAYS_OF_WEEK.forEach(day => {
        const dayTasks = state.weeklyTasks.filter(t => t.day === day);
        const card = document.createElement('div');
        card.className = 'bg-white dark:bg-darkcard border border-gray-200 dark:border-darkborder rounded-2xl p-4 shadow-sm flex flex-col justify-between space-y-3';

        const tasksListHtml = dayTasks.length === 0 
            ? `<p class="text-xs text-gray-400 italic">Nenhuma tarefa</p>` 
            : dayTasks.map(task => `
                <div class="flex items-center justify-between bg-gray-50 dark:bg-gray-800/60 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                    <div class="flex items-center space-x-2.5">
                        <button onclick="toggleWeeklyTaskDone('${task.id}')" class="w-5 h-5 rounded-md flex items-center justify-center border transition-all ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 dark:border-gray-600 text-transparent'}">
                            <i class="fa-solid fa-check text-[10px]"></i>
                        </button>
                        <span class="text-xs font-medium ${task.completed ? 'line-through text-gray-400' : ''}">${task.title}</span>
                    </div>
                    <button onclick="deleteWeeklyTask('${task.id}')" class="text-gray-400 hover:text-red-500 text-xs p-1">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `).join('');

        card.innerHTML = `
            <div>
                <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2 mb-3">
                    <h4 class="font-bold text-sm tracking-wide text-brand-500">${day}</h4>
                    <span class="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 font-semibold">${dayTasks.length}</span>
                </div>
                <div class="space-y-2">${tasksListHtml}</div>
            </div>
        `;
        container.appendChild(card);
    });
}

function saveWeeklyTask(e) {
    e.preventDefault();
    const title = document.getElementById('wt-title').value.trim();
    const day = document.getElementById('wt-day').value;
    if (!title) return;

    const newTask = {
        id: 'wt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
        title,
        day,
        completed: false
    };

    state.weeklyTasks.push(newTask);
    saveStorage();
    closeModal('weekly-modal');
    renderWeeklyTasks();
}

function toggleWeeklyTaskDone(id) {
    const task = state.weeklyTasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveStorage();
        renderWeeklyTasks();
    }
}

function deleteWeeklyTask(id) {
    state.weeklyTasks = state.weeklyTasks.filter(t => t.id !== id);
    saveStorage();
    renderWeeklyTasks();
}

// Timeline Planner Engine
function populateTimeSelects() {
    const select = document.getElementById('tb-start');
    if(!select) return;
    select.innerHTML = '';
    for (let i = 6; i <= 22; i++) {
        const hourStr = i < 10 ? `0${i}:00` : `${i}:00`;
        select.innerHTML += `<option value="${i}">${hourStr}</option>`;
    }
}

function openTimeBlockModal() {
    openModal('timeblock-modal');
}

function saveTimeBlock(e) {
    e.preventDefault();
    const title = document.getElementById('tb-title').value;
    const startHour = parseInt(document.getElementById('tb-start').value);
    const duration = parseInt(document.getElementById('tb-duration').value);

    const newBlock = {
        id: 'tb_' + Date.now(),
        title,
        startHour,
        duration
    };

    state.timeBlocks.push(newBlock);
    saveStorage();
    closeModal('timeblock-modal');
    renderTimeline();
}

function renderTimeline() {
    const container = document.getElementById('timeline-container');
    if(!container) return;
    container.innerHTML = '';

    for (let hour = 6; hour <= 23; hour++) {
        const hourLabel = hour < 10 ? `0${hour}:00` : `${hour}:00`;
        const blocksAtHour = state.timeBlocks.filter(b => b.startHour === hour);

        const row = document.createElement('div');
        row.className = 'relative min-h-[50px] border-t border-gray-100 dark:border-gray-800 flex items-start pt-2';

        row.innerHTML = `
            <span class="absolute -left-16 text-xs text-gray-400 font-mono w-12 text-right">${hourLabel}</span>
            <div class="w-full space-y-2">
                ${blocksAtHour.map(block => `
                    <div class="bg-brand-500/10 border-l-4 border-brand-500 text-brand-600 dark:text-brand-300 p-3 rounded-r-xl flex justify-between items-center shadow-sm">
                        <div>
                            <h5 class="font-bold text-xs">${block.title}</h5>
                            <p class="text-[10px] text-gray-400 mt-0.5">${block.startHour}:00 - ${block.startHour + block.duration}:00 (${block.duration} hr)</p>
                        </div>
                        <button onclick="deleteTimeBlock('${block.id}')" class="text-gray-400 hover:text-red-500 text-xs">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
        container.appendChild(row);
    }
}

function deleteTimeBlock(id) {
    state.timeBlocks = state.timeBlocks.filter(b => b.id !== id);
    saveStorage();
    renderTimeline();
}

// Fridge & Recipes Engine
function setFridgeView(view) {
    currentFridgeView = view;
    const btnList = document.getElementById('btn-view-list');
    const btnShelf = document.getElementById('btn-view-shelf');

    [btnList, btnShelf].forEach(btn => {
        btn.className = 'px-3 py-1.5 rounded-md text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 transition-all';
    });

    if (view === 'list') {
        btnList.className = 'px-3 py-1.5 rounded-md text-xs font-semibold bg-white dark:bg-darkcard shadow-sm text-brand-500 transition-all';
    } else {
        btnShelf.className = 'px-3 py-1.5 rounded-md text-xs font-semibold bg-white dark:bg-darkcard shadow-sm text-brand-500 transition-all';
    }
    renderFridgeInventory();
}

function getStatus(expiryDate) {
    const today = new Date();
    today.setHours(0,0,0,0);
    const exp = new Date(expiryDate);
    exp.setHours(0,0,0,0);
    
    const diffTime = exp - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: 'Vencido', color: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400', dot: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' };
    if (diffDays <= 3) return { label: `Vence em ${diffDays}d`, color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400', dot: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]' };
    return { label: 'Bom', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400', dot: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' };
}

function addFridgeItem(e) {
    e.preventDefault();
    const name = document.getElementById('fridge-item-name').value.trim();
    const qty = parseFloat(document.getElementById('fridge-item-qty').value);
    const unit = document.getElementById('fridge-item-unit').value;
    const expiry = document.getElementById('fridge-item-expiry').value;

    if (name && qty > 0) {
        const formattedName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
        const existingIndex = fridgeState.items.findIndex(i => i.name === formattedName && i.unit === unit);
        
        if (existingIndex > -1) {
            fridgeState.items[existingIndex].quantity += qty;
            fridgeState.items[existingIndex].expiry = expiry;
        } else {
            fridgeState.items.push({ id: 'item_' + Date.now(), name: formattedName, quantity: qty, unit: unit, expiry: expiry });
        }

        saveFridgeStorage();
        renderFridgeInventory();
        renderRecipes();
        
        document.getElementById('fridge-item-name').value = '';
        document.getElementById('fridge-item-qty').value = '';
    }
}

function removeFridgeItem(id) {
    fridgeState.items = fridgeState.items.filter(i => i.id !== id);
    saveFridgeStorage();
    renderFridgeInventory();
    renderRecipes();
}

function changeQuantity(id, changeAmount) {
    const item = fridgeState.items.find(i => i.id === id);
    if (!item) return;

    item.quantity += changeAmount;
    if (item.quantity <= 0) {
        removeFridgeItem(id);
    } else {
        saveFridgeStorage();
        renderFridgeInventory();
    }
}

function manualQuantityUpdate(id, inputElement) {
    const item = fridgeState.items.find(i => i.id === id);
    if (!item) return;
    
    const newQty = parseFloat(inputElement.value);
    if (isNaN(newQty) || newQty <= 0) {
        removeFridgeItem(id);
    } else {
        item.quantity = newQty;
        saveFridgeStorage();
        renderFridgeInventory();
    }
}

function renderFridgeInventory() {
    const countEl = document.getElementById('inventory-count');
    if(countEl) countEl.innerText = `${fridgeState.items.length} itens`;
    const sortedItems = [...fridgeState.items].sort((a, b) => new Date(a.expiry) - new Date(b.expiry));

    const listContainer = document.getElementById('fridge-list-container');
    const shelfContainer = document.getElementById('fridge-shelf-container');
    if(!listContainer || !shelfContainer) return;

    if (currentFridgeView === 'list') {
        listContainer.classList.remove('hidden');
        shelfContainer.classList.add('hidden');
        shelfContainer.classList.remove('flex');
        renderListView(sortedItems);
    } else {
        listContainer.classList.add('hidden');
        shelfContainer.classList.remove('hidden');
        shelfContainer.classList.add('flex');
        renderShelfView(sortedItems);
    }
}

function renderListView(items) {
    const tbody = document.getElementById('inventory-table-body');
    if(!tbody) return;
    tbody.innerHTML = '';

    if (items.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-gray-400 italic">Sua despensa está vazia.</td></tr>`;
        return;
    }

    items.forEach(item => {
        const status = getStatus(item.expiry);
        const step = (item.unit === 'g' || item.unit === 'ml') ? 50 : 1;
        const displayDate = item.expiry.split('-').reverse().join('/').slice(0, 8);

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="py-3 px-4">
                <button onclick="showNutrition('${item.id}')" class="font-medium text-left hover:text-brand-500 transition-colors inline-flex items-center gap-1.5 focus:outline-none">
                    ${item.name} <i class="fa-solid fa-circle-info text-[10px] text-gray-400"></i>
                </button>
            </td>
            <td class="py-3 px-4">
                <div class="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-lg w-max px-1 py-1">
                    <button onclick="changeQuantity('${item.id}', -${step})" class="w-6 h-6 rounded flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700">-</button>
                    <input type="number" value="${item.quantity}" onchange="manualQuantityUpdate('${item.id}', this)" class="w-12 text-center bg-transparent border-none focus:outline-none text-sm font-semibold p-0">
                    <span class="text-xs text-gray-400 font-medium w-4">${item.unit}</span>
                    <button onclick="changeQuantity('${item.id}', ${step})" class="w-6 h-6 rounded flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700">+</button>
                </div>
            </td>
            <td class="py-3 px-4 text-gray-500">${displayDate}</td>
            <td class="py-3 px-4">
                <span class="px-2.5 py-1 rounded-md text-[10px] font-bold ${status.color}">${status.label}</span>
            </td>
            <td class="py-3 px-4 text-right">
                <button onclick="removeFridgeItem('${item.id}')" class="text-gray-400 hover:text-red-500 transition-colors">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderShelfView(items) {
    const container = document.getElementById('fridge-shelf-container');
    if(!container) return;
    container.innerHTML = '';
    
    const shelfGroups = [[], [], []];
    items.forEach((item, i) => shelfGroups[i % 3].push(item));

    shelfGroups.forEach(group => {
        const shelf = document.createElement('div');
        shelf.className = 'w-full min-h-[90px] border-b-[8px] border-gray-300 dark:border-gray-600/60 flex flex-wrap gap-4 items-end pb-1 px-4';
        
        if(group.length === 0) {
            shelf.innerHTML = `<span class="w-full text-center text-xs text-gray-400 dark:text-gray-500 pb-2 italic opacity-50">Prateleira vazia</span>`;
        } else {
            group.forEach(item => {
                const status = getStatus(item.expiry);
                shelf.innerHTML += `
                    <div class="relative group">
                        <div onclick="showNutrition('${item.id}')" class="bg-white dark:bg-darkcard px-3 py-2.5 rounded-t-lg rounded-b-sm border border-gray-200 dark:border-gray-600 shadow-sm flex flex-col items-center justify-center transform transition-all hover:-translate-y-1.5 hover:border-brand-400 cursor-pointer w-[85px]">
                            <span class="text-xs font-semibold text-gray-700 dark:text-gray-200 text-center w-full truncate leading-tight">${item.name}</span>
                            <span class="text-[10px] text-gray-500 dark:text-gray-400 mt-1 font-medium">${item.quantity} ${item.unit}</span>
                            <div class="w-2 h-2 rounded-full mt-2 ${status.dot}"></div>
                        </div>
                        <button onclick="removeFridgeItem('${item.id}')" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10">
                            <i class="fa-solid fa-xmark text-[10px]"></i>
                        </button>
                    </div>
                `;
            });
        }
        container.appendChild(shelf);
    });
}

function getNutritionMock(name) {
    const key = name.toLowerCase().trim();
    if (MOCK_NUTRITION_DB[key]) return MOCK_NUTRITION_DB[key];
    
    let hash = 0;
    for (let i = 0; i < key.length; i++) { hash = key.charCodeAt(i) + ((hash << 5) - hash); }
    let seedVal = Math.abs(hash);
    const pseudoRandom = () => { seedVal = (seedVal * 9301 + 49297) % 233280; return seedVal / 233280; };
    
    return {
        calories: Math.floor(pseudoRandom() * 250) + 20,
        carbs: (pseudoRandom() * 30).toFixed(1),
        protein: (pseudoRandom() * 20).toFixed(1),
        fat: (pseudoRandom() * 15).toFixed(1)
    };
}

function showNutrition(id) {
    const item = fridgeState.items.find(i => i.id === id);
    if (!item) return;

    const nutrition = getNutritionMock(item.name);
    document.getElementById('nutrition-title').innerText = item.name;
    document.getElementById('nutrition-subtitle').innerText = item.unit === 'un' ? 'Valores ref. a 1 unidade' : 'Valores ref. a 100' + item.unit;
    
    document.getElementById('nutri-cal').innerText = nutrition.calories;
    document.getElementById('nutri-carb').innerText = nutrition.carbs;
    document.getElementById('nutri-prot').innerText = nutrition.protein;
    document.getElementById('nutri-fat').innerText = nutrition.fat;

    openModal('nutrition-modal');
}

function renderRecipes() {
    const container = document.getElementById('recipes-container');
    if(!container) return;
    container.innerHTML = '';

    const allRecipes = [...DEFAULT_RECIPES, ...(fridgeState.customRecipes || [])];
    const availableIngredients = fridgeState.items.map(i => i.name.toLowerCase().trim());

    if (allRecipes.length === 0) {
        container.innerHTML = `<p class="text-sm text-gray-500">Nenhuma receita encontrada.</p>`;
        return;
    }

    allRecipes.forEach((recipe) => {
        const missing = recipe.ingredients.filter(ing => !availableIngredients.includes(ing.toLowerCase().trim()));
        const canMake = missing.length === 0;

        const ingHtml = recipe.ingredients.map(ing => {
            const hasIng = availableIngredients.includes(ing.toLowerCase().trim());
            return `<span class="text-[10px] px-2 py-1 rounded-md font-medium border ${hasIng ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/30 text-red-600 border-red-200 dark:border-red-800'}">${ing}</span>`;
        }).join('');

        const card = document.createElement('div');
        card.className = `p-4 rounded-xl border ${canMake ? 'border-brand-500 bg-brand-50/30 dark:bg-brand-900/10' : 'border-gray-200 dark:border-darkborder bg-white dark:bg-darkcard'} flex flex-col justify-between space-y-3 transition-all`;
        
        card.innerHTML = `
            <div>
                <div class="flex justify-between items-start mb-2">
                    <h4 class="font-bold text-sm flex items-center gap-2">
                        <i class="fa-solid fa-utensils text-gray-400"></i> ${recipe.name}
                    </h4>
                    ${recipe.id.startsWith('c_') ? `<button onclick="deleteCustomRecipe('${recipe.id}')" class="text-xs text-gray-400 hover:text-red-500"><i class="fa-solid fa-trash"></i></button>` : ''}
                </div>
                <div class="flex flex-wrap gap-1.5 mt-2">${ingHtml}</div>
            </div>
            <div>
                <button onclick="cookRecipe('${recipe.id}')" ${!canMake ? 'disabled' : ''} class="w-full mt-2 py-2 rounded-lg text-xs font-semibold transition-colors ${canMake ? 'bg-brand-500 hover:bg-brand-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'}">
                    ${canMake ? 'Cozinhar (-1 un / 100g)' : `Faltam ${missing.length} item(s)`}
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

function saveCustomRecipe(e) {
    e.preventDefault();
    const name = document.getElementById('recipe-name').value;
    const ingString = document.getElementById('recipe-ingredients').value;
    const ingredients = ingString.split(',').map(s => s.trim()).filter(s => s !== '');
    
    if (name && ingredients.length > 0) {
        if (!fridgeState.customRecipes) fridgeState.customRecipes = [];
        fridgeState.customRecipes.push({ id: 'c_' + Date.now(), name, ingredients });
        saveFridgeStorage();
        renderRecipes();
        closeModal('recipe-modal');
    }
}

function deleteCustomRecipe(id) {
    if(confirm("Remover esta receita?")) {
        fridgeState.customRecipes = fridgeState.customRecipes.filter(r => r.id !== id);
        saveFridgeStorage();
        renderRecipes();
    }
}

function cookRecipe(recipeId) {
    const allRecipes = [...DEFAULT_RECIPES, ...(fridgeState.customRecipes || [])];
    const recipe = allRecipes.find(r => r.id === recipeId);
    if (!recipe) return;

    recipe.ingredients.forEach(reqIng => {
        const reqName = reqIng.toLowerCase().trim();
        const item = fridgeState.items.find(i => i.name.toLowerCase() === reqName);
        if (item) {
            const deductAmount = (item.unit === 'g' || item.unit === 'ml') ? 100 : 1;
            item.quantity -= deductAmount;
        }
    });

    fridgeState.items = fridgeState.items.filter(i => i.quantity > 0);

    saveFridgeStorage();
    renderFridgeInventory();
    renderRecipes();
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 }, colors: ['#d47bb6', '#ffffff'] });
}

// Statistics & Streaks Engine
function renderStats() {
    const total = state.habits.length;
    const bestStreak = state.habits.reduce((max, h) => Math.max(max, h.bestStreak || 0), 0);
    const today = getTodayStr();
    const todayCompleted = state.habits.filter(h => h.history && h.history[today]).length;

    const totalRoutinesEl = document.getElementById('stat-total-routines');
    const bestStreakEl = document.getElementById('stat-best-streak');
    const todayCompletedEl = document.getElementById('stat-today-completed');
    const weeklyRateEl = document.getElementById('stat-weekly-rate');

    if(totalRoutinesEl) totalRoutinesEl.innerText = total;
    if(bestStreakEl) bestStreakEl.innerHTML = `${bestStreak} <span class="text-sm font-normal text-gray-400">days</span>`;
    if(todayCompletedEl) todayCompletedEl.innerText = `${todayCompleted} / ${total}`;
    if(weeklyRateEl) weeklyRateEl.innerText = total === 0 ? '0%' : `${Math.round((todayCompleted / total) * 100)}%`;

    const tableBody = document.getElementById('weekly-matrix-body');
    if (!tableBody) return;
    tableBody.innerHTML = '';

    const datesOfWeek = getWeekDates();

    state.habits.forEach(habit => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-gray-50/50 dark:hover:bg-gray-800/40';

        let daysHtml = '';
        datesOfWeek.forEach(dateStr => {
            const isDone = habit.history && habit.history[dateStr];
            daysHtml += `
                <td class="py-3 px-2 text-center">
                    <span class="inline-block w-5 h-5 rounded-md ${isDone ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-transparent'} text-[10px] flex items-center justify-center mx-auto">
                        <i class="fa-solid fa-check"></i>
                    </span>
                </td>
            `;
        });

        tr.innerHTML = `
            <td class="py-3 px-4 font-medium flex items-center space-x-2">
                <span class="w-2 h-2 rounded-full" style="background-color: ${habit.color}"></span>
                <span>${habit.title}</span>
            </td>
            ${daysHtml}
            <td class="py-3 px-4 text-right font-semibold text-amber-500">
                <i class="fa-solid fa-fire text-xs mr-1"></i>${habit.currentStreak || 0}
            </td>
        `;

        tableBody.appendChild(tr);
    });
}

function getWeekDates() {
    const curr = new Date();
    const first = curr.getDate() - curr.getDay() + 1;
    const week = [];

    for (let i = 0; i < 7; i++) {
        const next = new Date(curr.setDate(first + i));
        week.push(next.toISOString().split('T')[0]);
    }
    return week;
}

// Backup & Data Management
function exportData() {
    const exportObj = { routineState: state, fridgeState: fridgeState };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `routinecraft_complete_backup_${getTodayStr()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

function importData(event) {
    const fileReader = new FileReader();
    fileReader.onload = function (e) {
        try {
            const imported = JSON.parse(e.target.result);
            if (imported.routineState) {
                state = imported.routineState;
                saveStorage();
            }
            if (imported.fridgeState) {
                fridgeState = imported.fridgeState;
                saveFridgeStorage();
            } else if (imported.habits) {
                // backward compatibility if old single-state format is uploaded
                state = imported;
                saveStorage();
            }
            renderRoutines();
            renderTimeline();
            renderWeeklyTasks();
            renderStats();
            renderFridgeInventory();
            renderRecipes();
            alert('Database backup restored successfully!');
        } catch (err) {
            alert('Invalid JSON backup file.');
        }
    };
    fileReader.readAsText(event.target.files[0]);
}

function confirmResetData() {
    if (confirm('Are you sure you want to erase ALL habit, task, schedule, and pantry data?')) {
        localStorage.removeItem('rc_habits');
        localStorage.removeItem('rc_blocks');
        localStorage.removeItem('rc_weekly');
        localStorage.removeItem('fridge_data_v2');
        state.habits = [];
        state.timeBlocks = [];
        state.weeklyTasks = [];
        fridgeState.items = [];
        fridgeState.customRecipes = [];
        renderRoutines();
        renderTimeline();
        renderWeeklyTasks();
        renderStats();
        renderFridgeInventory();
        renderRecipes();
    }
}
