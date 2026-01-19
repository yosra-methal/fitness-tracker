// Initial State
let defaultExercises = [
    { id: 'bench', name: 'Bench Press', defaultSets: 4, defaultReps: 10, defaultWeight: 60, enableStopwatch: false },
    { id: 'squat', name: 'Squat', defaultSets: 5, defaultReps: 5, defaultWeight: 80, enableStopwatch: false },
    { id: 'pullup', name: 'Pull-ups', defaultSets: 4, defaultReps: 8, defaultWeight: 0, enableStopwatch: false },
    { id: 'dl', name: 'Deadlift', defaultSets: 3, defaultReps: 5, defaultWeight: 100, enableStopwatch: false }
];

// Load from local storage or use default
const savedExercises = localStorage.getItem('fitness_exercises');
if (savedExercises) {
    defaultExercises = JSON.parse(savedExercises);
}

let state = {
    mode: 'SELECTION', // SELECTION, ACTIVE, SETTINGS
    activeSubMode: 'EFFORT', // EFFORT, REST
    currentExercise: null,
    unit: 'kg', // 'kg' or 'lbs'

    // Session State
    currentSet: 1,
    targetSets: 4,
    currentReps: 0,
    targetRepsSession: 10,
    currentWeight: 60,
    targetWeightSession: 60,

    // Timer
    restTimer: 90, // seconds
    timerRemaining: 90,
    timerInterval: null,

    // Stopwatch (Chrono)
    stopwatchTime: 0,
    stopwatchRunning: false,
    stopwatchInterval: null
};

// Check for saved unit preference
const savedUnit = localStorage.getItem('fitness_unit');
if (savedUnit) {
    state.unit = savedUnit;
}

// DOM Elements
const container = document.getElementById('widget-container');

// Icons
const Icons = {
    Gear: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.5;"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
    ChevronLeft: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`,
    Plus: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
    Minus: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
    Star: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
    Trash: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
    Play: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`,
    Pause: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`,
    Edit: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.5;"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>`
};

// Render Functions
function render() {
    container.innerHTML = '';
    container.dataset.mode = state.mode;
    container.dataset.subMode = state.activeSubMode;

    // Main View
    let content;
    if (state.mode === 'SELECTION') {
        content = renderSelectionMode();
    } else if (state.mode === 'ACTIVE') {
        if (state.activeSubMode === 'EFFORT') {
            content = renderActiveEffortMode();
        } else {
            content = renderActiveRestMode();
        }
    } else if (state.mode === 'SETTINGS') {
        content = renderSettingsMode();
    }

    container.appendChild(content);

    // Render Overlay Modals if any exists
    const modal = document.getElementById('active-modal');
    if (modal) {
        container.appendChild(modal);
    }
}

function renderSelectionMode() {
    const view = document.createElement('div');
    view.className = 'view';

    const header = document.createElement('div');
    header.className = 'header';

    const leftDiv = document.createElement('div');

    const title = document.createElement('h2');
    title.textContent = 'Exercises';

    const addBtn = document.createElement('button');
    addBtn.className = 'btn btn-icon';
    addBtn.innerHTML = Icons.Plus;
    addBtn.onclick = showAddExerciseModal;

    header.appendChild(leftDiv);
    header.appendChild(title);
    header.appendChild(addBtn);



    const list = document.createElement('div');
    list.className = 'exercise-list';

    defaultExercises.forEach((ex, index) => {
        const item = document.createElement('div');
        item.className = 'exercise-item';
        item.onclick = () => selectExercise(ex); // Move click to container

        const nameSpan = document.createElement('span');
        nameSpan.textContent = ex.name;
        nameSpan.style.flex = '1';

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = Icons.Minus;
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            showDeleteConfirmation(index);
        };

        item.appendChild(nameSpan);
        item.appendChild(deleteBtn);
        list.appendChild(item);
    });

    view.appendChild(header);
    // Removed subtitle
    view.appendChild(list);
    return view;
}

function renderActiveEffortMode() {
    const view = document.createElement('div');
    view.className = 'view';

    const header = document.createElement('div');
    header.className = 'header';
    header.innerHTML = `
        <button class="btn btn-icon" id="back-btn">${Icons.ChevronLeft}</button>
        <h2 class="title-text" style="cursor: pointer;">${state.currentExercise.name}</h2>
        <button class="btn btn-icon" id="settings-btn">${Icons.Gear}</button>
    `;

    header.querySelector('#back-btn').onclick = goBackToSelection;
    header.querySelector('#settings-btn').onclick = openSettings;
    header.querySelector('.title-text').onclick = (e) => editExerciseTitle(e.target);

    const content = document.createElement('div');
    content.className = 'content';

    const setDisplay = document.createElement('div');
    setDisplay.style.textAlign = 'center';
    setDisplay.style.marginBottom = '30px'; // Push vertically higher by increasing gap below
    setDisplay.innerHTML = `
        <div class="text-secondary" style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Current Set</div>
        <div style="font-size: 42px; font-weight: 800; color: var(--active-color-primary); margin-top: 4px;">${state.currentSet} <span style="color: var(--text-secondary); font-size: 24px;">/ ${state.targetSets}</span></div>
    `;

    const controlsRow = document.createElement('div');
    controlsRow.className = 'row';

    // Reps Control
    const repsControl = createStepperControl(
        'Reps',
        state.currentReps,
        (val) => {
            if (val >= 0) updateState('currentReps', val);
        },
        1,
        `<span class="editable-curr-val">${state.currentReps}</span><span style="color:var(--text-secondary); font-size: 14px;">/${state.targetRepsSession}</span>`
    );

    // Weight Control
    const weightLabel = state.unit === 'lbs' ? 'Lbs' : 'Kg';
    const weightControl = createStepperControl(
        weightLabel,
        state.currentWeight,
        (val) => {
            if (val >= 0) updateState('currentWeight', val);
        },
        1,
        `<span class="editable-curr-val">${state.currentWeight}</span><span style="color:var(--text-secondary); font-size: 14px;">/${state.targetWeightSession}</span>`
    );

    controlsRow.appendChild(repsControl);
    controlsRow.appendChild(weightControl);

    content.appendChild(setDisplay);
    content.appendChild(controlsRow);

    // Stopwatch Section (if enabled)
    if (state.currentExercise.enableStopwatch) {
        const chronoRow = document.createElement('div');
        chronoRow.style.marginTop = '16px';
        chronoRow.style.display = 'flex';
        chronoRow.style.alignItems = 'center';
        chronoRow.style.justifyContent = 'space-between';
        chronoRow.style.backgroundColor = 'var(--bg-secondary)';
        chronoRow.style.padding = '12px 16px';
        chronoRow.style.borderRadius = '16px';

        const chronoLabel = document.createElement('div');
        chronoLabel.className = 'text-label';
        chronoLabel.style.marginBottom = '0';
        chronoLabel.textContent = 'Timer';

        const chronoControls = document.createElement('div');
        chronoControls.style.display = 'flex';
        chronoControls.style.alignItems = 'center';
        chronoControls.style.gap = '12px';

        const timeDisplay = document.createElement('div');
        timeDisplay.id = 'chrono-display';
        timeDisplay.style.fontSize = '24px';
        timeDisplay.style.fontWeight = '600';
        timeDisplay.style.fontVariantNumeric = 'tabular-nums';
        timeDisplay.textContent = formatTime(state.stopwatchTime);

        const playBtn = document.createElement('button');
        playBtn.className = 'btn btn-play';
        if (state.stopwatchRunning) playBtn.classList.add('running');
        playBtn.innerHTML = state.stopwatchRunning ? Icons.Pause : Icons.Play;
        playBtn.onclick = toggleStopwatch;

        chronoControls.appendChild(timeDisplay);
        chronoControls.appendChild(playBtn);

        chronoRow.appendChild(chronoLabel);
        chronoRow.appendChild(chronoControls);

        content.appendChild(chronoRow);
    }

    const footer = document.createElement('div');
    footer.className = 'footer';
    const validateBtn = document.createElement('button');
    validateBtn.className = 'btn btn-primary btn-success';
    validateBtn.textContent = 'Complete Set';
    validateBtn.onclick = validateSet;

    footer.appendChild(validateBtn);

    view.appendChild(header);
    view.appendChild(content);
    view.appendChild(footer);
    return view;
}

function renderActiveRestMode() {
    const view = document.createElement('div');
    view.className = 'view';

    const header = document.createElement('div');
    header.className = 'header';
    header.innerHTML = `
        <div style="width: 40px"></div>
        <h2 class="title-text">Rest</h2>
        <button class="btn btn-icon" id="settings-btn">${Icons.Gear}</button>
    `;
    header.querySelector('#settings-btn').onclick = openSettings;

    const content = document.createElement('div');
    content.className = 'content';
    content.style.alignItems = 'center';

    const nextSetInfo = document.createElement('div');
    nextSetInfo.className = 'text-secondary';
    nextSetInfo.textContent = `Up Next: Set ${state.currentSet + 1} / ${state.targetSets}`;

    const timerDisplay = document.createElement('div');
    timerDisplay.className = 'timer-display';
    timerDisplay.textContent = formatTime(state.timerRemaining);

    content.appendChild(timerDisplay);
    content.appendChild(nextSetInfo);

    const timerControls = document.createElement('div');
    timerControls.className = 'row';
    timerControls.style.marginTop = '16px';
    timerControls.innerHTML = `
        <button class="btn btn-secondary" id="tm-10">-10s</button>
        <button class="btn btn-secondary" id="tm-plus10">+10s</button>
    `;

    timerControls.querySelector('#tm-10').onclick = () => adjustTimer(-10);
    timerControls.querySelector('#tm-plus10').onclick = () => adjustTimer(10);

    content.appendChild(timerControls);

    const footer = document.createElement('div');
    footer.className = 'footer';
    const skipBtn = document.createElement('button');
    skipBtn.className = 'btn btn-primary';
    skipBtn.textContent = 'Resume';
    skipBtn.onclick = finishRest;

    footer.appendChild(skipBtn);

    view.appendChild(header);
    view.appendChild(content);
    view.appendChild(footer);
    return view;
}

function renderSettingsMode() {
    const view = document.createElement('div');
    view.className = 'view';
    // Ensure view flex column for footer stickiness
    view.style.display = 'flex';
    view.style.flexDirection = 'column';
    view.style.height = '100%';

    const header = document.createElement('div');
    header.className = 'header';
    header.style.flexShrink = '0';

    const leftDiv = document.createElement('div');
    const rightDiv = document.createElement('div');

    const title = document.createElement('h2');
    title.textContent = 'Settings';

    header.appendChild(leftDiv);
    header.appendChild(title);
    header.appendChild(rightDiv);

    const content = document.createElement('div');
    content.className = 'content';
    // Overriding content styles for settings specifics
    content.style.justifyContent = 'flex-start';
    content.style.paddingBottom = '16px';

    const isLbs = state.unit === 'lbs';

    content.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 14px;">
            <div>
                <label class="text-label">Sets</label>
                <input type="number" id="setting-sets" class="setting-input" value="${state.targetSets}">
            </div>
            <div>
                <label class="text-label">Reps</label>
                <input type="number" id="setting-reps" class="setting-input" value="${state.targetRepsSession}">
            </div>
            <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <label class="text-label" style="margin-bottom:0;">Weight</label>
                    <div class="settings-toggle-wrapper">
                        <span style="font-size: 13px; font-weight: 600; color: ${!isLbs ? 'var(--text-primary)' : 'var(--text-secondary)'}">Kg</span>
                        <label class="ios-switch">
                            <input type="checkbox" id="setting-unit-toggle" ${isLbs ? 'checked' : ''}>
                            <span class="ios-slider"></span>
                        </label>
                        <span style="font-size: 13px; font-weight: 600; color: ${isLbs ? 'var(--text-primary)' : 'var(--text-secondary)'}">Lbs</span>
                    </div>
                </div>
                <input type="number" id="setting-weight" class="setting-input" value="${state.targetWeightSession}">
            </div>
            <div>
                <label class="text-label">Rest (sec)</label>
                <input type="number" id="setting-rest" class="setting-input" value="${state.restTimer}">
            </div>
            <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; margin-top: 8px;">
                    <label class="text-label" style="margin-bottom:0;">Timer</label>
                    <div class="settings-toggle-wrapper">
                        <label class="ios-switch">
                            <input type="checkbox" id="setting-timer-toggle" ${state.currentExercise && state.currentExercise.enableStopwatch ? 'checked' : ''}>
                            <span class="ios-slider"></span>
                        </label>
                    </div>
                </div>
                <div class="text-secondary" style="font-size: 13px;">Enable stopwatch for this exercise</div>
            </div>
        </div>
    `;

    const footer = document.createElement('div');
    footer.className = 'footer';
    footer.style.flexShrink = '0';

    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn btn-primary';
    saveBtn.textContent = 'Save';
    saveBtn.onclick = saveSettingsAndClose;

    footer.appendChild(saveBtn);

    view.appendChild(header);
    view.appendChild(content);
    view.appendChild(footer);
    return view;
}

// Modal Helpers
function showModalUI(htmlContent) {
    const existing = document.getElementById('active-modal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'active-modal';
    overlay.className = 'modal-overlay';
    overlay.innerHTML = htmlContent;

    container.appendChild(overlay);
    return overlay;
}

function closeActiveModal() {
    const existing = document.getElementById('active-modal');
    if (existing) existing.remove();
}

function showDeleteConfirmation(index) {
    const overlay = showModalUI(`
        <div class="modal-card">
            <div class="modal-title">Delete this exercice ?</div>
            <div class="modal-body">This action cannot be undone.</div>
            <div class="modal-actions">
                <button class="modal-btn modal-btn-cancel" id="modal-no">No</button>
                <button class="modal-btn modal-btn-danger" id="modal-yes">Yes</button>
            </div>
        </div>
    `);

    overlay.querySelector('#modal-no').onclick = closeActiveModal;
    overlay.querySelector('#modal-yes').onclick = () => {
        defaultExercises.splice(index, 1);
        saveExercises();
        closeActiveModal();
        render(); // Re-render list
    };
}

function showAddExerciseModal() {
    const overlay = showModalUI(`
        <div class="modal-card">
            <div class="modal-title">New Exercise</div>
            
            <input type="text" class="modal-input" placeholder="Exercise Name" id="new-ex-name" style="margin-bottom: 12px;">
            
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 16px;">
                <div>
                    <label class="text-label">Sets</label>
                    <input type="number" class="modal-input" value="4" id="new-ex-sets" style="margin-bottom:0; text-align:center;">
                </div>
                <div>
                    <label class="text-label">Reps</label>
                    <input type="number" class="modal-input" value="10" id="new-ex-reps" style="margin-bottom:0; text-align:center;">
                </div>
                <div>
                    <label class="text-label">Kg</label>
                    <input type="number" class="modal-input" value="10" id="new-ex-weight" style="margin-bottom:0; text-align:center;">
                </div>
            </div>

             <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; background: var(--bg-secondary); padding: 12px; border-radius: 12px;">
                <label class="text-label" style="margin-bottom:0;">Timer</label>
                <label class="ios-switch">
                    <input type="checkbox" id="new-ex-timer">
                    <span class="ios-slider"></span>
                </label>
            </div>

            <div class="modal-actions">
                <button class="modal-btn modal-btn-cancel" id="modal-cancel">Cancel</button>
                <button class="modal-btn modal-btn-confirm" id="modal-save">Create</button>
            </div>
        </div>
    `);

    const inputName = overlay.querySelector('#new-ex-name');
    inputName.focus();

    overlay.querySelector('#modal-cancel').onclick = closeActiveModal;
    overlay.querySelector('#modal-save').onclick = () => {
        const name = inputName.value.trim();
        const sets = Number(overlay.querySelector('#new-ex-sets').value);
        const reps = Number(overlay.querySelector('#new-ex-reps').value);
        const weight = Number(overlay.querySelector('#new-ex-weight').value);
        const hasTimer = overlay.querySelector('#new-ex-timer').checked;

        if (name && sets > 0 && reps > 0) {
            const newEx = {
                id: 'ex_' + Date.now(),
                name: name,
                defaultSets: sets,
                defaultReps: reps,
                defaultWeight: weight,
                enableStopwatch: hasTimer
            };
            defaultExercises.push(newEx);
            saveExercises();
            closeActiveModal();
            render();
        } else {
            inputName.style.borderColor = "#FF3B30";
        }
    };
}

function showCompletionModal() {
    const overlay = showModalUI(`
        <div class="modal-card">
            <div class="modal-title">Good Job! 🎉</div>
            <div class="modal-body">You have completed all sets.</div>
            <div class="modal-actions">
                <button class="modal-btn modal-btn-confirm" id="modal-ok">Finish</button>
            </div>
        </div>
    `);

    overlay.querySelector('#modal-ok').onclick = () => {
        closeActiveModal();
        state.mode = 'SELECTION';
        render();
    };
}

function showEndSessionModal() {
    const overlay = showModalUI(`
        <div class="modal-card">
            <div class="modal-title">End Session?</div>
            <div class="modal-body">Your progress will be lost.</div>
            <div class="modal-actions">
                <button class="modal-btn modal-btn-cancel" id="modal-stay">Cancel</button>
                <button class="modal-btn modal-btn-danger" id="modal-leave">End</button>
            </div>
        </div>
    `);

    overlay.querySelector('#modal-stay').onclick = closeActiveModal;
    overlay.querySelector('#modal-leave').onclick = () => {
        closeActiveModal();
        state.mode = 'SELECTION';
        render();
    };
}

// Helper to create stepper controls
function createStepperControl(label, value, onUpdate, step = 1, displayValue = null) {
    const div = document.createElement('div');
    div.className = 'control-group';

    div.innerHTML = `
        <div class="text-label">${label}</div>
        <div class="stepper">
            <button class="btn stepper-btn minus">${Icons.Minus}</button>
            <div class="input-display">${displayValue !== null ? displayValue : value}</div>
            <button class="btn stepper-btn plus">${Icons.Plus}</button>
        </div>
    `;

    div.querySelector('.minus').onclick = () => onUpdate(Number(value) - step);
    div.querySelector('.plus').onclick = () => onUpdate(Number(value) + step);

    // Specific inline edit logic for the "Current" value only
    // It targets an element with class .editable-curr-val within displayValue
    const editableSpan = div.querySelector('.editable-curr-val');
    if (editableSpan) {
        editableSpan.style.cursor = 'pointer';
        editableSpan.title = "Click to edit";

        editableSpan.onclick = (e) => {
            e.stopPropagation(); // Prevent bubbling

            // Avoid creating multiple inputs
            if (editableSpan.querySelector('input')) return;

            const currentVal = value;
            const input = document.createElement('input');
            input.type = 'number';
            input.value = currentVal;
            input.className = 'inline-number-input';

            // Clear text, insert input
            editableSpan.textContent = '';
            editableSpan.appendChild(input);

            input.focus();
            input.select();

            const finish = () => {
                let val = parseFloat(input.value);
                if (!isNaN(val) && val >= 0) {
                    onUpdate(val);
                } else {
                    onUpdate(currentVal);
                }
            };

            input.onblur = finish;
            input.onkeydown = (e) => {
                if (e.key === 'Enter') input.blur();
            };

            // Stop click propagation on the input to prevent re-triggering span click
            input.onclick = (e) => e.stopPropagation();
        };
    }

    return div;
}

// Logic
function selectExercise(ex) {
    state.currentExercise = ex;
    state.currentSet = 1;
    state.targetSets = ex.defaultSets;
    state.currentReps = 0; // Reset count
    state.targetRepsSession = ex.defaultReps;
    state.currentWeight = ex.defaultWeight;
    state.targetWeightSession = ex.defaultWeight;
    state.mode = 'ACTIVE';
    state.activeSubMode = 'EFFORT';
    resetStopwatch(); // Reset stopwatch on new exercise
    render();
}

function validateSet() {
    // If stopwatch is enabled and running, pause it? Or keep running? 
    // Usually we pause between sets or reset. Let's pause.
    if (state.stopwatchRunning) toggleStopwatch();

    if (state.currentSet < state.targetSets) {
        startRest();
    } else {
        showCompletionModal();
    }
}

function startRest() {
    state.activeSubMode = 'REST';
    state.timerRemaining = state.restTimer;
    render();

    if (state.timerInterval) clearInterval(state.timerInterval);
    state.timerInterval = setInterval(() => {
        state.timerRemaining--;
        if (state.timerRemaining <= 0) {
            finishRest();
        } else {
            const display = document.querySelector('.timer-display');
            if (display) display.textContent = formatTime(state.timerRemaining);
        }
    }, 1000);
}

function finishRest() {
    if (state.timerInterval) clearInterval(state.timerInterval);
    state.currentSet++;
    state.currentReps = 0; // Reset counter for the new set
    state.activeSubMode = 'EFFORT';
    resetStopwatch(); // Reset stopwatch for next set
    render();
}

function adjustTimer(seconds) {
    state.timerRemaining += seconds;
    if (state.timerRemaining < 0) state.timerRemaining = 0;
    render();
}

function toggleStopwatch() {
    if (state.stopwatchRunning) {
        clearInterval(state.stopwatchInterval);
        state.stopwatchRunning = false;
    } else {
        state.stopwatchInterval = setInterval(() => {
            state.stopwatchTime++;
            const display = document.getElementById('chrono-display');
            if (display) display.textContent = formatTime(state.stopwatchTime);
        }, 1000);
        state.stopwatchRunning = true;
    }
    render(); // Re-render to update icon color
}

function resetStopwatch() {
    if (state.stopwatchInterval) clearInterval(state.stopwatchInterval);
    state.stopwatchRunning = false;
    state.stopwatchTime = 0;
}

function openSettings() {
    state.previousMode = state.mode;
    state.mode = 'SETTINGS';
    render();
}

function saveSettingsAndClose() {
    const sets = Number(document.getElementById('setting-sets').value);
    const reps = Number(document.getElementById('setting-reps').value);
    const weight = Number(document.getElementById('setting-weight').value);
    const rest = Number(document.getElementById('setting-rest').value);

    // Check toggle state
    const isLbs = document.getElementById('setting-unit-toggle').checked;
    const hasTimer = document.getElementById('setting-timer-toggle').checked;

    // Check if unit changed
    const newUnit = isLbs ? 'lbs' : 'kg';
    if (newUnit !== state.unit) {
        // Convert all default exercise weights
        const ratio = newUnit === 'lbs' ? 2.20462 : 0.453592;
        defaultExercises.forEach(ex => {
            ex.defaultWeight = Math.round(ex.defaultWeight * ratio);
        });
        saveExercises();
        state.unit = newUnit;
        localStorage.setItem('fitness_unit', newUnit);
    }

    // Update current session state
    state.targetSets = sets;
    state.targetRepsSession = reps; // Update target
    state.currentWeight = weight; // This value is already in the displayed unit (user edited it), so just save it.
    state.targetWeightSession = weight;
    state.restTimer = rest;

    // Update persistent defaults for this exercise
    if (state.currentExercise) {
        const exIndex = defaultExercises.findIndex(e => e.id === state.currentExercise.id);
        if (exIndex !== -1) {
            defaultExercises[exIndex].defaultSets = sets;
            defaultExercises[exIndex].defaultReps = reps;
            defaultExercises[exIndex].defaultWeight = weight;
            defaultExercises[exIndex].enableStopwatch = hasTimer;
            saveExercises();
            state.currentExercise = defaultExercises[exIndex];

            // If we disabled the stopwatch, ensure it's stopped
            if (!hasTimer) resetStopwatch();
        }
    }

    state.mode = 'ACTIVE';
    render();
}

function goBackToSelection() {
    if (state.currentSet > 1) {
        showEndSessionModal();
    } else {
        state.mode = 'SELECTION';
        render();
    }
}

function saveExercises() {
    localStorage.setItem('fitness_exercises', JSON.stringify(defaultExercises));
}

function updateState(key, value) {
    state[key] = Number(value);
    render();
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
}

// Title Editing Logic
function editExerciseTitle(titleElement) {
    if (titleElement.querySelector('input')) return; // Already editing

    const currentName = state.currentExercise.name;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentName;
    input.style.fontSize = 'inherit';
    input.style.fontWeight = 'inherit';
    input.style.fontFamily = 'inherit';
    input.style.color = 'inherit';
    input.style.background = 'transparent';
    input.style.border = 'none';
    input.style.borderBottom = '2px solid var(--active-color-primary)';
    input.style.textAlign = 'center';
    input.style.width = '100%';
    input.style.outline = 'none';
    input.style.padding = '0';
    input.style.margin = '0';

    titleElement.textContent = '';
    titleElement.appendChild(input);
    input.focus();
    input.select();

    const finish = () => {
        const newName = input.value.trim();
        if (newName && newName !== currentName) {
            showRenameConfirmationModal(currentName, newName);
        } else {
            render(); // Revert
        }
    };

    input.onblur = finish;
    input.onkeydown = (e) => {
        if (e.key === 'Enter') input.blur();
    };
    input.onclick = (e) => e.stopPropagation();
}

function showRenameConfirmationModal(oldName, newName) {
    const overlay = showModalUI(`
        <div class="modal-card">
            <div class="modal-title">Rename Exercise?</div>
            <div class="modal-body">
                Change "<strong>${oldName}</strong>" to "<strong>${newName}</strong>"?
            </div>
            <div class="modal-actions">
                <button class="modal-btn modal-btn-cancel" id="modal-cancel">Cancel</button>
                <button class="modal-btn modal-btn-confirm" id="modal-confirm">Confirm</button>
            </div>
        </div>
    `);

    overlay.querySelector('#modal-cancel').onclick = () => {
        closeActiveModal();
        render(); // Revert
    };

    overlay.querySelector('#modal-confirm').onclick = () => {
        // Update State
        state.currentExercise.name = newName;

        // Update main list
        const exIndex = defaultExercises.findIndex(e => e.id === state.currentExercise.id);
        if (exIndex !== -1) {
            defaultExercises[exIndex].name = newName;
            saveExercises();
        }

        closeActiveModal();
        render();
    };
}

// Init
render();
