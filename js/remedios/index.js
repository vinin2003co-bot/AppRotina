import { remediesState } from './remediesState.js';
import { RemedyJarCanvas } from './remediesCanvas.js';
import { remediesUI } from './remediesUI.js';

// Exemplo de uso dentro do renderRemediesUI() no index.js:
export function renderRemediesUI() {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayDoses = calculateDosesForDate(todayStr);

  // Renderiza checklist de hoje e trata o checkbox
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

  // Renderiza histórico
  remediesUI.renderLogs(remediesState.logs);
}

let jarCanvas = null;
let selectedPreviewDate = new Date().toISOString().split('T')[0];

export function initRemediesModule() {
  // Inicializa o Canvas do Pote de Pílulas
  const canvasElement = document.getElementById('remedies-jar-canvas');
  if (canvasElement) {
    jarCanvas = new RemedyJarCanvas('remedies-jar-canvas');
  }

  // Configura event listeners dos botões e modais
  setupEventListeners();

  // Renderiza a interface inicial
  renderRemediesUI();
}

function setupEventListeners() {
  // Botão: Adicionar Remédio (Abre Modal de Cadastro)
  const btnAddRemedy = document.getElementById('btn-add-remedy');
  if (btnAddRemedy) {
    btnAddRemedy.addEventListener('click', () => openModal('modal-add-remedy'));
  }

  // Botão: Tomei Agora (Abre Modal Avulso)
  const btnTakeNow = document.getElementById('btn-take-now');
  if (btnTakeNow) {
    btnTakeNow.addEventListener('click', () => openModal('modal-take-now'));
  }

  // Fechar modais (botões de cancelar ou fechar)
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modalId = e.target.getAttribute('data-close-modal');
      closeModal(modalId);
    });
  });

  // Submissão do formulário: Adicionar Remédio
  const formAddRemedy = document.getElementById('form-add-remedy');
  if (formAddRemedy) {
    formAddRemedy.addEventListener('submit', (e) => {
      e.preventDefault();
      handleSaveRemedy();
    });
  }

  // Submissão do formulário: Tomei Agora
  const formTakeNow = document.getElementById('form-take-now');
  if (formTakeNow) {
    formTakeNow.addEventListener('submit', (e) => {
      e.preventDefault();
      handleSaveTakeNow();
    });
  }

  // Configuração dos dias futuros (Pré-visualização)
  setupPreviewDaysSelector();
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeModal(modalId) {
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
  const intervalUnit = document.getElementById('remedy-interval-unit').value; // 'hours' ou 'days'

  if (!name || isNaN(quantity) || isNaN(mg) || !startDate || isNaN(intervalValue)) {
    alert('Por favor, preencha todos os campos obrigatórios.');
    return;
  }

  const newRemedy = {
    name,
    quantity,
    mg,
    startDate,
    endDate: endDate || null,
    intervalValue,
    intervalUnit
  };

  remediesState.addRemedy(newRemedy);
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

function setupPreviewDaysSelector() {
  const container = document.getElementById('preview-days-container');
  if (!container) return;

  container.innerHTML = '';
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(today.getDate() + i);
    const dateString = d.toISOString().split('T')[0];
    const label = i === 0 ? 'Hoje' : d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' });

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `px-4 py-2 rounded-xl text-sm font-medium transition-all ${dateString === selectedPreviewDate ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`;
    btn.innerText = label;
    btn.addEventListener('click', () => {
      selectedPreviewDate = dateString;
      setupPreviewDaysSelector();
      renderPreviewList();
    });

    container.appendChild(btn);
  }

  renderPreviewList();
}

function renderPreviewList() {
  const container = document.getElementById('preview-list-container');
  if (!container) return;

  // Lógica para calcular os remédios programados para selectedPreviewDate com base nas recorrências
  const scheduledDoses = calculateDosesForDate(selectedPreviewDate);

  if (scheduledDoses.length === 0) {
    container.innerHTML = `<p class="text-slate-400 text-sm italic py-2">Nenhum remédio programado para esta data.</p>`;
    return;
  }

  container.innerHTML = scheduledDoses.map(item => `
    <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
      <div>
        <h4 class="font-semibold text-slate-700 dark:text-slate-200 text-sm">${item.name}</h4>
        <p class="text-xs text-slate-500">${item.quantity} un • ${item.mg} mg</p>
      </div>
      <span class="text-xs font-semibold px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-lg">
        ${item.time}
      </span>
    </div>
  `).join('');
}

function calculateDosesForDate(targetDateStr) {
  const targetDate = new Date(targetDateStr + 'T00:00:00');
  const results = [];

  remediesState.remedies.forEach(remedy => {
    const startDate = new Date(remedy.startDate);
    const endDate = remedy.endDate ? new Date(remedy.endDate + 'T23:59:59') : null;

    if (targetDate < new Date(remedy.startDate.split('T')[0] + 'T00:00:00')) return;
    if (endDate && targetDate > endDate) return;

    // Cálculo simplificado de ocorrências por Horas ou Dias
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
      const intervalHours = remedy.intervalValue;
      const intervalMs = intervalHours * 60 * 60 * 1000;
      
      // Projeta todas as ocorrências a partir do início
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

export function renderRemediesUI() {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayDoses = calculateDosesForDate(todayStr);
  const checklistContainer = document.getElementById('today-checklist-container');
  
  if (!checklistContainer) return;

  if (todayDoses.length === 0) {
    checklistContainer.innerHTML = `<p class="text-slate-400 text-sm italic text-center py-4">Nenhum remédio para tomar hoje.</p>`;
    if (jarCanvas) jarCanvas.setProgress(0);
    return;
  }

  const checkedState = remediesState.todayChecked[todayStr] || {};
  let checkedCount = 0;

  checklistContainer.innerHTML = todayDoses.map((dose, index) => {
    const isChecked = checkedState[index] || false;
    if (isChecked) checkedCount++;

    return `
      <label class="flex items-center justify-between p-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-700/50 cursor-pointer hover:bg-white/80 transition-all">
        <div class="flex items-center gap-3">
          <input type="checkbox" data-dose-index="${index}" ${isChecked ? 'checked' : ''} class="w-5 h-5 text-indigo-600 rounded-lg border-slate-300 focus:ring-indigo-500">
          <div>
            <span class="font-semibold text-slate-700 dark:text-slate-200 text-sm block ${isChecked ? 'line-through opacity-60' : ''}">${dose.name}</span>
            <span class="text-xs text-slate-500">${dose.quantity} un • ${dose.mg} mg</span>
          </div>
        </div>
        <span class="text-xs font-medium px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg">${dose.time}</span>
      </label>
    `;
  }).join('');

  // Adiciona listeners nos checkboxes de hoje
  checklistContainer.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const idx = e.target.getAttribute('data-dose-index');
      if (!remediesState.todayChecked[todayStr]) {
        remediesState.todayChecked[todayStr] = {};
      }
      const wasChecked = remediesState.todayChecked[todayStr][idx];
      remediesState.todayChecked[todayStr][idx] = e.target.checked;
      remediesState.saveChecked();

      // Se acabou de marcar, registra no histórico como Rotina
      if (e.target.checked && !wasChecked) {
        const dose = todayDoses[idx];
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
  });

  // Atualiza progresso do pote (Canvas)
  const progress = (checkedCount / todayDoses.length) * 100;
  if (jarCanvas) {
    jarCanvas.setProgress(progress);
  }

  renderLogsUI();
}

function renderLogsUI() {
  const logsContainer = document.getElementById('remedies-logs-container');
  if (!logsContainer) return;

  if (remediesState.logs.length === 0) {
    logsContainer.innerHTML = `<p class="text-slate-400 text-sm italic text-center py-4">Nenhum registro no histórico ainda.</p>`;
    return;
  }

  logsContainer.innerHTML = remediesState.logs.map(log => `
    <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
      <div class="flex items-center gap-3">
        <div class="w-2 h-2 rounded-full ${log.type === 'Rotina' ? 'bg-indigo-500' : 'bg-emerald-500'}"></div>
        <div>
          <h4 class="font-semibold text-slate-700 dark:text-slate-200 text-sm">${log.name}</h4>
          <p class="text-xs text-slate-500">${log.quantity} un • ${log.mg} mg <span class="ml-1 px-1.5 py-0.5 rounded text-[10px] ${log.type === 'Rotina' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'}">${log.type}</span></p>
        </div>
      </div>
      <div class="text-right">
        <span class="text-xs font-medium text-slate-600 dark:text-slate-300 block">${log.timeStr}</span>
        <span class="text-[10px] text-slate-400">${log.dateStr}</span>
      </div>
    </div>
  `).join('');
}
