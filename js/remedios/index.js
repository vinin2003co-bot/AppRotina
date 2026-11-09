import { remediesState } from './remediesState.js';
import { remediesUI } from './remediesUI.js';
import { RemedyJarCanvas } from './remediesCanvas.js';

let jarCanvas = null;
let selectedPreviewDate = new Date().toLocaleTimeString('pt-BR').split('T')[0];

export function initRemediesModule() {
  const canvasElement = document.getElementById('remedies-jar-canvas');
  if (canvasElement) {
    jarCanvas = new RemedyJarCanvas('remedies-jar-canvas');
  }

  setupEventListeners();
  renderRemediesUI();
}

function setupEventListeners() {
  const btnAddRemedy = document.getElementById('btn-add-remedy');
  if (btnAddRemedy) {
    btnAddRemedy.onclick = () => openModal('modal-add-remedy');
  }

  const btnTakeNow = document.getElementById('btn-take-now');
  if (btnTakeNow) {
    btnTakeNow.onclick = () => openModal('modal-take-now');
  }

  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.onclick = (e) => {
      const modalId = e.currentTarget.getAttribute('data-close-modal');
      closeModal(modalId);
    };
  });

  const formAddRemedy = document.getElementById('form-add-remedy');
  if (formAddRemedy) {
    formAddRemedy.onsubmit = (e) => {
      e.preventDefault();
      handleSaveRemedy();
    };
  }

  const formTakeNow = document.getElementById('form-take-now');
  if (formTakeNow) {
    formTakeNow.onsubmit = (e) => {
      e.preventDefault();
      handleSaveTakeNow();
    };
  }
}

export function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

export function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('flex');
    modal.classList.add('hidden');
  }
}

function handleSaveRemedy() {
  const name = document.getElementById('remedy-name').value;
  const quantity = parseFloat(document.getElementById('remedy-qty').value);
  const mg = parseFloat(document.getElementById('remedy-mg').value);
  const startDate = document.getElementById('remedy-start').value;
  const endDate = document.getElementById('remedy-end').value;
  const intervalValue = parseInt(document.getElementById('remedy-interval-val').value, 10);
  const intervalUnit = document.getElementById('remedy-interval-unit').value;

  if (!name || isNaN(quantity) || isNaN(mg) || !startDate || isNaN(intervalValue)) {
    alert('Por favor, preencha todos os campos obrigatórios.');
    return;
  }

  remediesState.addRemedy({
    name,
    quantity,
    mg,
    startDate,
    endDate: endDate || null,
    intervalValue,
    intervalUnit
  });

  closeModal('modal-add-remedy');
  document.getElementById('form-add-remedy').reset();
  renderRemediesUI();
}

function handleSaveTakeNow() {
  const name = document.getElementById('taken-name').value;
  const quantity = parseFloat(document.getElementById('taken-qty').value);
  const mg = parseFloat(document.getElementById('taken-mg').value);

  if (!name || isNaN(quantity) || isNaN(mg)) {
    alert('Por favor, preencha todos os campos.');
    return;
  }

  remediesState.addLog({
    name,
    quantity,
    mg,
    type: 'Avulso',
    dateStr: new Date().toLocaleDateString('pt-BR'),
    timeStr: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  });

  closeModal('modal-take-now');
  document.getElementById('form-take-now').reset();
  renderRemediesUI();
}

function calculateDosesForDate(targetDateStr) {
  const targetDate = new Date(targetDateStr + 'T00:00:00');
  const results = [];

  remediesState.remedies.forEach(remedy => {
    const startDate = new Date(remedy.startDate);
    const endDate = remedy.endDate ? new Date(remedy.endDate + 'T23:59:59') : null;

    if (targetDate < new Date(remedy.startDate.split('T')[0] + 'T00:00:00')) return;
    if (endDate && targetDate > endDate) return;

    const startMs = startDate.getTime();
    const targetMs = targetDate.getTime();
    const diffMs = targetMs - startMs;

    if (diffMs < 0) return;

    if (remedy.intervalUnit === 'days') {
      const intervalDays = remedy.intervalValue;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays % intervalDays === 0) {
        results.push({
          name: remedy.name,
          quantity: remedy.quantity,
          mg: remedy.mg,
          time: startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        });
      }
    } else if (remedy.intervalUnit === 'hours') {
      const intervalMs = remedy.intervalValue * 60 * 60 * 1000;
      let currentOccurrence = startMs;
      const endOfDayMs = targetMs + (24 * 60 * 60 * 1000) - 1;

      while (currentOccurrence <= endOfDayMs) {
        if (currentOccurrence >= targetMs && currentOccurrence <= endOfDayMs) {
          const occDate = new Date(currentOccurrence);
          results.push({
            name: remedy.name,
            quantity: remedy.quantity,
            mg: remedy.mg,
            time: occDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          });
        }
        currentOccurrence += intervalMs;
      }
    }
  });

  return results;
}

// Declaração única de renderRemediesUI
export function renderRemediesUI() {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayDoses = calculateDosesForDate(todayStr);

  remediesUI.renderRemediesList(remediesState.remedies, (id) => {
    if (confirm('Deseja realmente excluir este remédio da rotina?')) {
      remediesState.removeRemedy(id);
      renderRemediesUI();
    }
  });

  remediesUI.renderTodayChecklist(todayDoses, (index, isChecked, dose) => {
    if (!remediesState.todayChecked[todayStr]) {
      remediesState.todayChecked[todayStr] = {};
    }
    const wasChecked = remediesState.todayChecked[todayStr][index];
    remediesState.todayChecked[todayStr][index] = isChecked;
    remediesState.saveChecked();

    if (isChecked && !wasChecked) {
      remediesState.addLog({
        name: dose.name,
        quantity: dose.quantity,
        mg: dose.mg,
        type: 'Rotina',
        dateStr: new Date().toLocaleDateString('pt-BR'),
        timeStr: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      });
    }

    renderRemediesUI();
  });

  const checkedState = remediesState.todayChecked[todayStr] || {};
  const checkedCount = Object.values(checkedState).filter(Boolean).length;
  const progress = todayDoses.length > 0 ? (checkedCount / todayDoses.length) * 100 : 0;
  if (jarCanvas) {
    jarCanvas.setProgress(progress);
  }

  remediesUI.renderPreviewDaysSelector(selectedPreviewDate, (newDate) => {
    selectedPreviewDate = newDate;
    renderRemediesUI();
  });
  remediesUI.renderPreviewList(calculateDosesForDate(selectedPreviewDate));

  remediesUI.renderLogs(remediesState.logs);
}
