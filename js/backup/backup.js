import {
    state,
    fridgeState,
    setRoutineState,
    setFridgeState,
    resetState
} from '../core/state.js';

import {
    saveStorage,
    saveFridgeStorage,
    clearStorage
} from '../core/storage.js';

import {
    getTodayStr
} from '../core/utils.js';

import {
    renderRoutines
} from '../routines/routines.js';

import {
    renderWeeklyTasks
} from '../weekly/weekly.js';

import {
    renderTimeline
} from '../planner/planner.js';

import {
    renderStats
} from '../statistics/statistics.js';

import {
    renderFridge
} from '../fridge/index.js';

export function exportData() {
    const exportObject = {
        routineState: state,
        fridgeState: fridgeState
    };

    const dataString =
        'data:text/json;charset=utf-8,' +
        encodeURIComponent(
            JSON.stringify(
                exportObject,
                null,
                2
            )
        );

    const downloadAnchor =
        document.createElement('a');

    downloadAnchor.setAttribute(
        'href',
        dataString
    );

    downloadAnchor.setAttribute(
        'download',
        `routinecraft_complete_backup_${getTodayStr()}.json`
    );

    document.body.appendChild(
        downloadAnchor
    );

    downloadAnchor.click();

    downloadAnchor.remove();
}

export function importData(event) {
    const file =
        event.target.files?.[0];

    if (!file) return;

    const fileReader =
        new FileReader();

    fileReader.onload = function (loadEvent) {
        try {
            const imported =
                JSON.parse(
                    loadEvent.target.result
                );

            if (imported.routineState) {
                setRoutineState(
                    imported.routineState
                );

                saveStorage();
            } else if (
                imported.habits
            ) {
                // Backward compatibility
                // with the old single-state format.

                setRoutineState(
                    imported
                );

                saveStorage();
            }

            if (imported.fridgeState) {
                setFridgeState(
                    imported.fridgeState
                );

                saveFridgeStorage();
            }

            renderRoutines();
            renderTimeline();
            renderWeeklyTasks();
            renderStats();
            renderFridge();

            alert(
                'Database backup restored successfully!'
            );

            event.target.value = '';

        } catch (error) {
            console.error(
                'Backup import error:',
                error
            );

            alert(
                'Invalid JSON backup file.'
            );
        }
    };

    fileReader.readAsText(file);
}

export function confirmResetData() {
    if (
        !confirm(
            'Are you sure you want to erase ALL habit, task, schedule, and pantry data?'
        )
    ) {
        return;
    }

    clearStorage();

    resetState();

    renderRoutines();
    renderTimeline();
    renderWeeklyTasks();
    renderStats();
    renderFridge();
}
