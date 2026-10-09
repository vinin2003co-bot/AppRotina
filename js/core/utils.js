function toLocalDateStr(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function getTodayStr() {
    return toLocalDateStr(new Date());
}

export function getWeekDates() {
    const current = new Date();
    const day = current.getDay(); // 0 = Sunday, 1 = Monday, ...

    const mondayOffset = day === 0 ? -6 : 1 - day;

    const monday = new Date(current);
    monday.setDate(current.getDate() + mondayOffset);

    return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(monday);
        date.setDate(monday.getDate() + index);
        return toLocalDateStr(date);
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
