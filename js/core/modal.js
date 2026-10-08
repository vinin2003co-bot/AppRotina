export function openModal(modalId) {
    const modal = document.getElementById(modalId);

    if (!modal) return;

    modal.classList.remove('hidden');
}

export function closeModal(modalId) {
    const modal = document.getElementById(modalId);

    if (!modal) return;

    modal.classList.add('hidden');

    const formMap = {
        'habit-modal': 'habit-form',
        'weekly-modal': 'weekly-form',
        'recipe-modal': 'recipe-form'
    };

    const formId = formMap[modalId];

    if (formId) {
        document.getElementById(formId)?.reset();
    }
}
