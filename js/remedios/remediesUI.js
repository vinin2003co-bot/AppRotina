import { remediesState } from './remediesState.js';

export const remediesUI = {
  renderTodayChecklist(todayDoses, onCheckboxToggle) {
    const checklistContainer = document.getElementById('today-checklist-container');
    if (!checklistContainer) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const checkedState = remediesState.todayChecked[todayStr] || {};

    if (todayDoses.length === 0) {
      checklistContainer.innerHTML = `
        <div class="text-center py-6">
          <p class="text-slate-400 dark:text-slate-500 text-sm italic">Nenhum remédio agendado para hoje.</p>
        </div>
      `;
      return;
    }

    checklistContainer.innerHTML = todayDoses.map((dose, index) => {
      const isChecked = Boolean(checkedState[index]);

      return `
        <label class="flex items-center justify-between p-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-700/50 cursor-pointer hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all select-none">
          <div class="flex items-center gap-3">
            <input type="checkbox" 
                   data-dose-index="${index}" 
                   ${isChecked ? 'checked' : ''} 
                   class="remedy-checkbox w-5 h-5 text-indigo-600 rounded-lg border-slate-300 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 cursor-pointer">
            <div>
              <span class="font-semibold text-slate-700 dark:text-slate-200 text-sm block ${isChecked ? 'line-through opacity-50' : ''}">
                ${dose.name}
              </span>
              <span class="text-xs text-slate-500 dark:text-slate-400">
                ${dose.quantity} un • ${dose.mg} mg
              </span>
            </div>
          </div>
          <span class="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg">
            ${dose.time}
          </span>
        </label>
      `;
    }).join('');

    // Adiciona listener para alteração nos checkboxes
    checklistContainer.querySelectorAll('.remedy-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const index = e.target.getAttribute('data-dose-index');
        const isChecked = e.target.checked;
        if (onCheckboxToggle) {
          onCheckboxToggle(index, isChecked, todayDoses[index]);
        }
      });
    });
  },

  renderPreviewDaysSelector(selectedDateStr, onSelectDate) {
    const container = document.getElementById('preview-days-container');
    if (!container) return;

    container.innerHTML = '';
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      const dateString = d.toISOString().split('T')[0];
      const label = i === 0 ? 'Hoje' : d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' });
      const isSelected = dateString === selectedDateStr;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap capitalize ${
        isSelected
          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
      }`;
      btn.innerText = label;
      btn.addEventListener('click', () => {
        if (onSelectDate) onSelectDate(dateString);
      });

      container.appendChild(btn);
    }
  },

  renderPreviewList(scheduledDoses) {
    const container = document.getElementById('preview-list-container');
    if (!container) return;

    if (!scheduledDoses || scheduledDoses.length === 0) {
      container.innerHTML = `
        <div class="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/60 text-center">
          <p class="text-slate-400 dark:text-slate-500 text-xs italic">Nenhum remédio agendado para esta data.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = scheduledDoses.map(item => `
      <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
        <div>
          <h4 class="font-semibold text-slate-700 dark:text-slate-200 text-sm">${item.name}</h4>
          <p class="text-xs text-slate-500 dark:text-slate-400">${item.quantity} un • ${item.mg} mg</p>
        </div>
        <span class="text-xs font-semibold px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-lg">
          ${item.time}
        </span>
      </div>
    `).join('');
  },
  renderRemediesList(remedies, onDeleteRemedy) {
    const container = document.getElementById('remedies-list-container');
    if (!container) return;

    if (!remedies || remedies.length === 0) {
      container.innerHTML = `
        <div class="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/60 text-center">
          <p class="text-slate-400 dark:text-slate-500 text-xs italic">Nenhum remédio cadastrado na rotina.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = remedies.map(remedy => `
      <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
        <div>
          <h4 class="font-semibold text-slate-700 dark:text-slate-200 text-sm">${remedy.name}</h4>
          <p class="text-xs text-slate-500 dark:text-slate-400">${remedy.quantity} un • ${remedy.mg} mg (A cada ${remedy.intervalValue} ${remedy.intervalUnit})</p>
        </div>
        <button type="button" data-delete-remedy="${remedy.id}" class="text-slate-400 hover:text-red-500 p-2 transition-colors">
          <i class="fa-solid fa-trash text-xs"></i>
        </button>
      </div>
    `).join('');

    container.querySelectorAll('[data-delete-remedy]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-delete-remedy');
        if (onDeleteRemedy) onDeleteRemedy(id);
      });
    });
  },

  renderLogs(logs) {
    const logsContainer = document.getElementById('remedies-logs-container');
    if (!logsContainer) return;

    if (!logs || logs.length === 0) {
      logsContainer.innerHTML = `
        <div class="py-6 text-center">
          <p class="text-slate-400 dark:text-slate-500 text-xs italic">Nenhum registro no histórico ainda.</p>
        </div>
      `;
      return;
    }

    logsContainer.innerHTML = logs.map(log => `
      <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 transition-all">
        <div class="flex items-center gap-3">
          <div class="w-2.5 h-2.5 rounded-full ${log.type === 'Rotina' ? 'bg-indigo-500' : 'bg-emerald-500'}"></div>
          <div>
            <h4 class="font-semibold text-slate-700 dark:text-slate-200 text-sm">${log.name}</h4>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              ${log.quantity} un • ${log.mg} mg 
              <span class="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                log.type === 'Rotina' 
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400' 
                  : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
              }">
                ${log.type}
              </span>
            </p>
          </div>
        </div>
        <div class="text-right">
          <span class="text-xs font-semibold text-slate-600 dark:text-slate-300 block">${log.timeStr}</span>
          <span class="text-[10px] text-slate-400">${log.dateStr}</span>
        </div>
      </div>
    `).join('');
  }
};
