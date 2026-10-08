export const DEFAULT_HABITS = [
    {
        id: 'h1',
        title: 'Hydrate (500ml Water)',
        category: 'Health',
        tod: 'Morning',
        frequency: 'Daily',
        color: '#3b82f6',
        currentStreak: 3,
        bestStreak: 7,
        history: {}
    },
    {
        id: 'h2',
        title: '30-Min Cardio / Gym Workout',
        category: 'Fitness',
        tod: 'Morning',
        frequency: 'Daily',
        color: '#10b981',
        currentStreak: 5,
        bestStreak: 12,
        history: {}
    },
    {
        id: 'h3',
        title: 'Focus Work Session',
        category: 'Productivity',
        tod: 'Afternoon',
        frequency: 'Weekdays',
        color: '#6366f1',
        currentStreak: 2,
        bestStreak: 5,
        history: {}
    },
    {
        id: 'h4',
        title: 'Evening Reading / Learning',
        category: 'Mindset',
        tod: 'Evening',
        frequency: 'Daily',
        color: '#f59e0b',
        currentStreak: 1,
        bestStreak: 8,
        history: {}
    }
];

export const DEFAULT_TIMEBLOCKS = [
    {
        id: 'tb1',
        title: 'Morning Exercise & Breakfast',
        startHour: 7,
        duration: 2
    },
    {
        id: 'tb2',
        title: 'Core Product Development',
        startHour: 9,
        duration: 3
    },
    {
        id: 'tb3',
        title: 'Reading & Wind Down',
        startHour: 21,
        duration: 1
    }
];

export const DAYS_OF_WEEK = [
    'Segunda',
    'Terça',
    'Quarta',
    'Quinta',
    'Sexta',
    'Sábado',
    'Domingo'
];

export const MOCK_NUTRITION_DB = {
    leite: {
        calories: 60,
        carbs: 5,
        protein: 3.2,
        fat: 3
    },

    ovo: {
        calories: 155,
        carbs: 1.1,
        protein: 13,
        fat: 11
    },

    tomate: {
        calories: 18,
        carbs: 3.9,
        protein: 0.9,
        fat: 0.2
    },

    'macarrão': {
        calories: 131,
        carbs: 25,
        protein: 5,
        fat: 1.1
    },

    queijo: {
        calories: 402,
        carbs: 1.3,
        protein: 25,
        fat: 33
    },

    frango: {
        calories: 165,
        carbs: 0,
        protein: 31,
        fat: 3.6
    },

    arroz: {
        calories: 130,
        carbs: 28,
        protein: 2.7,
        fat: 0.3
    }
};

export const DEFAULT_RECIPES = [
    {
        id: 'r1',
        name: 'Panqueca',
        ingredients: ['Ovo', 'Leite']
    },
    {
        id: 'r2',
        name: 'Omelete',
        ingredients: ['Ovo', 'Tomate']
    }
];

export const DEFAULT_FRIDGE_ITEMS = [
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
];
