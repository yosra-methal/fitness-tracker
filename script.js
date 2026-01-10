// Initial State
let defaultExercises = [
    { id: 'bench', name: 'Bench Press', defaultSets: 4, defaultReps: 10, defaultWeight: 60 },
    { id: 'squat', name: 'Squat', defaultSets: 5, defaultReps: 5, defaultWeight: 80 },
    { id: 'pullup', name: 'Pull-ups', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
    { id: 'dl', name: 'Deadlift', defaultSets: 3, defaultReps: 5, defaultWeight: 100 }
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

    // Session State
    currentSet: 1,
    targetSets: 4,
    currentReps: 10,
    currentWeight: 60,

    // Timer
    restTimer: 90, // seconds
    timerRemaining: 90,
    timerInterval: null
};

// DOM Elements
const container = document.getElementById('widget-container');

// Icons
const Icons = {
    Gear: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
    ChevronLeft: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`,
    Plus: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
    Minus: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
    Star: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
    Trash: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>`
};

// Render Functions
function render() {
    container.innerHTML = '';

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

    const subtitle = document.createElement('div');
    subtitle.className = 'subtitle-container';
    subtitle.innerHTML = `Favorites ${Icons.Star}`;

    const list = document.createElement('div');
    list.className = 'exercise-list';

    defaultExercises.forEach((ex, index) => {
        const item = document.createElement('div');
        item.className = 'exercise-item';

        const nameSpan = document.createElement('span');
        nameSpan.textContent = ex.name;
        nameSpan.style.flex = '1';
        nameSpan.onclick = () => selectExercise(ex);

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
    view.appendChild(subtitle);
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
        <div class="title-text">${state.currentExercise.name}</div>
        <button class="btn btn-icon" id="settings-btn">${Icons.Gear}</button>
    `;

    header.querySelector('#back-btn').onclick = goBackToSelection;
    header.querySelector('#settings-btn').onclick = openSettings;

    const content = document.createElement('div');
    content.className = 'content';

    const setDisplay = document.createElement('div');
    setDisplay.style.textAlign = 'center';
    setDisplay.innerHTML = `
        <div class="text-secondary" style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Current Set</div>
        <div style="font-size: 48px; font-weight: 800; color: var(--text-primary); margin-top: 4px;">${state.currentSet} <span style="color: var(--text-secondary); font-size: 24px;">/ ${state.targetSets}</span></div>
    `;

    const controlsRow = document.createElement('div');
    controlsRow.className = 'row';

    const repsControl = createStepperControl('Reps', state.currentReps, (val) => updateState('currentReps', val));
    const weightControl = createStepperControl('Kg', state.currentWeight, (val) => updateState('currentWeight', val), 2.5);

    controlsRow.appendChild(repsControl);
    controlsRow.appendChild(weightControl);

    content.appendChild(setDisplay);
    content.appendChild(controlsRow);

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
        <div class="title-text">Rest</div>
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

    const header = document.createElement('div');
    header.className = 'header';

    const leftDiv = document.createElement('div');

    const title = document.createElement('h3');
    title.textContent = 'Settings';

    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn btn-primary';
    saveBtn.style.cssText = "padding: 0 16px; height: 32px; font-size: 14px; width: auto;";
    saveBtn.textContent = 'Save';
    saveBtn.onclick = saveSettingsAndClose;

    header.appendChild(leftDiv);
    header.appendChild(title);
    header.appendChild(saveBtn);

    const content = document.createElement('div');
    content.className = 'content';
    content.style.justifyContent = 'flex-start';

    content.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
            <div>
                <label class="text-label">Sets</label>
                <input type="number" id="setting-sets" class="setting-input" value="${state.targetSets}">
            </div>
            <div>
                <label class="text-label">Reps</label>
                <input type="number" id="setting-reps" class="setting-input" value="${state.currentReps}">
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
            <div>
                <label class="text-label">Weight (Kg)</label>
                <input type="number" id="setting-weight" class="setting-input" value="${state.currentWeight}">
            </div>
            <div>
                <label class="text-label">Rest (sec)</label>
                <input type="number" id="setting-rest" class="setting-input" value="${state.restTimer}">
            </div>
        </div>
        
        <div class="text-secondary" style="font-size: 13px; margin-top: 8px; text-align: center;">
            Saving will update the defaults for this exercise.
        </div>
    `;

    view.appendChild(header);
    view.appendChild(content);
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

        if (name && sets > 0 && reps > 0) {
            const newEx = {
                id: 'ex_' + Date.now(),
                name: name,
                defaultSets: sets,
                defaultReps: reps,
                defaultWeight: weight
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

function createStepperControl(label, value, onUpdate, step = 1) {
    const div = document.createElement('div');
    div.className = 'control-group';

    div.innerHTML = `
        <div class="text-label">${label}</div>
        <div class="stepper">
            <button class="btn stepper-btn minus">${Icons.Minus}</button>
            <div class="input-display">${value}</div>
            <button class="btn stepper-btn plus">${Icons.Plus}</button>
        </div>
    `;

    div.querySelector('.minus').onclick = () => onUpdate(Number(value) - step);
    div.querySelector('.plus').onclick = () => onUpdate(Number(value) + step);

    return div;
}

// Logic
function selectExercise(ex) {
    state.currentExercise = ex;
    state.currentSet = 1;
    state.targetSets = ex.defaultSets;
    state.currentReps = ex.defaultReps;
    state.currentWeight = ex.defaultWeight;
    state.mode = 'ACTIVE';
    state.activeSubMode = 'EFFORT';
    render();
}

function validateSet() {
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
    state.activeSubMode = 'EFFORT';
    render();
}

function adjustTimer(seconds) {
    state.timerRemaining += seconds;
    if (state.timerRemaining < 0) state.timerRemaining = 0;
    render();
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

    // Update current session state
    state.targetSets = sets;
    state.currentReps = reps;
    state.currentWeight = weight;
    state.restTimer = rest;

    // Update persistent defaults for this exercise
    if (state.currentExercise) {
        const exIndex = defaultExercises.findIndex(e => e.id === state.currentExercise.id);
        if (exIndex !== -1) {
            defaultExercises[exIndex].defaultSets = sets;
            defaultExercises[exIndex].defaultReps = reps;
            defaultExercises[exIndex].defaultWeight = weight;
            saveExercises();

            // Update the currentExercise reference too
            state.currentExercise = defaultExercises[exIndex];
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

// Init
render();
