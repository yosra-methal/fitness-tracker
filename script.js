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
    Trash: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`
};

// Render Functions
function render() {
    container.innerHTML = '';

    if (state.mode === 'SELECTION') {
        renderSelectionMode();
    } else if (state.mode === 'ACTIVE') {
        if (state.activeSubMode === 'EFFORT') {
            renderActiveEffortMode();
        } else {
            renderActiveRestMode();
        }
    } else if (state.mode === 'SETTINGS') {
        renderSettingsMode();
    }
}

function renderSelectionMode() {
    const view = document.createElement('div');
    view.className = 'view';

    // Header with Grid Layout
    const header = document.createElement('div');
    header.className = 'header';

    // Empty Left
    const leftDiv = document.createElement('div');

    // Center Title
    const title = document.createElement('h2');
    title.textContent = 'Exercises';

    // Right Add Button
    const addBtn = document.createElement('button');
    addBtn.className = 'btn btn-icon';
    addBtn.innerHTML = Icons.Plus;
    addBtn.onclick = addNewExercise;

    header.appendChild(leftDiv);
    header.appendChild(title);
    header.appendChild(addBtn);

    // Subtitle "Favorites"
    const subtitle = document.createElement('div');
    subtitle.className = 'subtitle-container';
    subtitle.innerHTML = `Favorites ${Icons.Star}`;

    // List
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
        deleteBtn.innerHTML = Icons.Trash;
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteExercise(index);
        };

        item.appendChild(nameSpan);
        item.appendChild(deleteBtn);
        list.appendChild(item);
    });

    view.appendChild(header);
    view.appendChild(subtitle);
    view.appendChild(list);
    container.appendChild(view);
}

function renderActiveEffortMode() {
    const view = document.createElement('div');
    view.className = 'view';

    // Header
    const header = document.createElement('div');
    header.className = 'header';
    header.innerHTML = `
        <button class="btn btn-icon" onclick="goBackToSelection()">${Icons.ChevronLeft}</button>
        <div class="title-text">${state.currentExercise.name}</div>
        <button class="btn btn-icon" onclick="openSettings()">${Icons.Gear}</button>
    `;

    // Body
    const content = document.createElement('div');
    content.className = 'content';

    // Set Counter
    const setDisplay = document.createElement('div');
    setDisplay.style.textAlign = 'center';
    setDisplay.innerHTML = `
        <div class="text-secondary" style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Current Set</div>
        <div style="font-size: 48px; font-weight: 800; color: var(--text-primary); margin-top: 4px;">${state.currentSet} <span style="color: var(--text-secondary); font-size: 24px;">/ ${state.targetSets}</span></div>
    `;

    // Controls Row
    const controlsRow = document.createElement('div');
    controlsRow.className = 'row';

    // Reps Control
    const repsControl = createStepperControl('Reps', state.currentReps, (val) => updateState('currentReps', val));
    // Weight Control
    const weightControl = createStepperControl('Kg', state.currentWeight, (val) => updateState('currentWeight', val), 2.5);

    controlsRow.appendChild(repsControl);
    controlsRow.appendChild(weightControl);

    content.appendChild(setDisplay);
    content.appendChild(controlsRow);

    // Footer
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
    container.appendChild(view);
}

function renderActiveRestMode() {
    const view = document.createElement('div');
    view.className = 'view';

    // Header
    const header = document.createElement('div');
    header.className = 'header';
    header.innerHTML = `
        <div style="width: 40px"></div>
        <div class="title-text">Rest</div>
        <button class="btn btn-icon" onclick="openSettings()">${Icons.Gear}</button>
    `;

    // Body
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

    // Controls to adjust timer on fly
    const timerControls = document.createElement('div');
    timerControls.className = 'row';
    timerControls.style.marginTop = '16px';
    timerControls.innerHTML = `
        <button class="btn btn-secondary" onclick="adjustTimer(-10)">-10s</button>
        <button class="btn btn-secondary" onclick="adjustTimer(10)">+10s</button>
    `;
    content.appendChild(timerControls);

    // Footer
    const footer = document.createElement('div');
    footer.className = 'footer';
    const skipBtn = document.createElement('button');
    skipBtn.className = 'btn btn-primary'; // Blue for resume
    skipBtn.textContent = 'Resume';
    skipBtn.onclick = finishRest;

    footer.appendChild(skipBtn);

    view.appendChild(header);
    view.appendChild(content);
    view.appendChild(footer);
    container.appendChild(view);
}

function renderSettingsMode() {
    const view = document.createElement('div');
    view.className = 'view';

    const header = document.createElement('div');
    header.className = 'header';

    const leftDiv = document.createElement('div');

    const title = document.createElement('h3');
    title.textContent = 'Settings';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn btn-secondary';
    closeBtn.style.cssText = "padding: 8px 16px; height: 32px; font-size: 14px;";
    closeBtn.textContent = 'OK';
    closeBtn.onclick = closeSettings;

    header.appendChild(leftDiv);
    header.appendChild(title);
    header.appendChild(closeBtn);

    const content = document.createElement('div');
    content.className = 'content';
    content.style.justifyContent = 'flex-start';

    // Settings inputs
    content.innerHTML = `
        <div style="margin-bottom: 20px;">
            <label class="text-label">Target Sets</label>
            <input type="number" class="setting-input" value="${state.targetSets}" onchange="updateState('targetSets', this.value)">
        </div>
        <div style="margin-bottom: 20px;">
            <label class="text-label">Rest Time (sec)</label>
            <input type="number" class="setting-input" value="${state.restTimer}" onchange="updateState('restTimer', this.value)">
        </div>
        <div>
            <label class="text-label">Exercise</label>
            <div class="text-secondary" style="margin-top: 8px; font-size: 16px;">${state.currentExercise ? state.currentExercise.name : 'None'}</div>
        </div>
    `;

    view.appendChild(header);
    view.appendChild(content);
    container.appendChild(view);
}

// Helper Components
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
        // Exercise Complete
        alert("Exercise Complete!");
        state.mode = 'SELECTION';
        render();
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
            // Update timer display directly
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
    state.previousMode = state.mode; // Should capture 'ACTIVE'
    state.mode = 'SETTINGS';
    render();
}

function closeSettings() {
    state.mode = 'ACTIVE'; // Return to active
    render();
}

function goBackToSelection() {
    if (confirm("End current session?")) {
        state.mode = 'SELECTION';
        render();
    }
}

function addNewExercise() {
    const name = prompt("Enter new exercise name:");
    if (name) {
        const newEx = {
            id: 'ex_' + Date.now(),
            name: name,
            defaultSets: 4,
            defaultReps: 10,
            defaultWeight: 20
        };
        defaultExercises.push(newEx);
        saveExercises();
        render();
    }
}

function deleteExercise(index) {
    if (confirm(`Delete "${defaultExercises[index].name}"?`)) {
        defaultExercises.splice(index, 1);
        saveExercises();
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
