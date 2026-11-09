import { STORAGE_KEYS } from '../core/constants.js';

export const remediesState = {
  remedies: JSON.parse(localStorage.getItem(STORAGE_KEYS.REMEDIES)) || [],
  logs: JSON.parse(localStorage.getItem(STORAGE_KEYS.REMEDIES_LOGS)) || [],
  todayChecked: JSON.parse(localStorage.getItem(STORAGE_KEYS.REMEDIES_CHECKED)) || {},

  saveRemedies() {
    localStorage.setItem(STORAGE_KEYS.REMEDIES, JSON.stringify(this.remedies));
  },
  saveLogs() {
    localStorage.setItem(STORAGE_KEYS.REMEDIES_LOGS, JSON.stringify(this.logs));
  },
  saveChecked() {
    localStorage.setItem(STORAGE_KEYS.REMEDIES_CHECKED, JSON.stringify(this.todayChecked));
  },

  addRemedy(remedy) {
    this.remedies.push({ id: Date.now().toString(), ...remedy });
    this.saveRemedies();
  },
  removeRemedy(id) {
    this.remedies = this.remedies.filter(r => r.id !== id);
    this.saveRemedies();
  },

  addLog(entry) {
    this.logs.unshift({
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...entry
    });
    this.saveLogs();
  }
};
