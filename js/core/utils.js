export function getTodayStr() {
    const date = new Date();

    return date.toISOString().split('T')[0];
}

export function getWeekDates() {
    const current = new Date();

    const firstDay =
        current.getDate() -
        current.getDay() +
        1;

    return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(current);

        date.setDate(firstDay + index);

        return date.toISOString().split('T')[0];
    });
}
