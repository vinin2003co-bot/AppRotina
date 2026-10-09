function formatLocalDate(date) {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000);
}

export function getTodayStr() {
    const date = new Date();
    const dateNew = formatLocalDate(date)
    return dateNew.toISOString().split('T')[0];
}

export function getWeekDates() {
    const current = new Date();
    const currentNew = formatLocalDate(current)
    const day = currentNew.getDay();

    // Monday = 0
    const mondayOffset = day === 0 ? -6 : 1 - day;

    const monday = new Date(currentNew);

    monday.setDate(
        currentNew.getDate() + mondayOffset
    );

    return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(monday);

        date.setDate(
            monday.getDate() + index
        );

        return date.toISOString().split('T')[0];
    });
}

export function generateId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 5)}`;
}

export function dispatchAppEvent(name, detail = {}) {
    document.dispatchEvent(
        new CustomEvent(name, {
            detail
        })
    );
}
