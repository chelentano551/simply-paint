"use strict";

const canvas = document.getElementById("main");
const saveButton = document.getElementById("save");
const clearButton = document.getElementById("clear");

const ctx = canvas.getContext("2d");
const colors = ["black", "green", "blue", "yellow", "brown"];
const defaultColor = colors[0];
const brushesSizes = [10, 15, 20];
const defaultBrushSize = brushesSizes[0];
let mouseIsPressed = false;

const defaultState = {
    color: defaultColor,
    size: defaultBrushSize
};

const state = {
    _color: defaultColor,
    _size: defaultBrushSize,
    _points: [],
    set color(value) {
        this._color = value;
        ctx.strokeStyle = value;
    },
    get color() {
        return this._color;
    },
    set size(value) {
        this._size = value;
        ctx.lineWidth = value / 2;
    },
    get size() {
        return this._size;
    },
    set points(value) {
        this._points = value;
        drawPoints(value);
    },
    get points() {
        return this._points;
    }
}

const drawOptions = {
    begin: (x, y) => {
        ctx.beginPath();
        ctx.moveTo(x, y);
    },
    move: (x, y) => {
        ctx.lineTo(x, y);
        ctx.stroke();
    },
    end: (x, y) => {
        ctx.stroke();
        ctx.closePath();
    }
}

refreshState(localStorage.getItem("state"));

// create options of panels
fillPalette();
fillBrushes();

saveButton.addEventListener("click", onSave);
clearButton.addEventListener("click", onClear);

window.addEventListener("storage", onStorageChange);

/// canvas
canvas.addEventListener("mousedown", e => {
    mouseIsPressed = true;
    onDraw(e, "begin");
});

canvas.addEventListener("mousemove", e => {
    if (!mouseIsPressed)
        return;
    onDraw(e, "move");
});

canvas.addEventListener("mouseup", e => {
    mouseIsPressed = false;
    onDraw(e, "end");
});


function addPoint(target, x, y, type) {
    target.push({
        x,
        y,
        size: ctx.lineWidth,
        color: ctx.strokeStyle,
        type
    });
}

function onDraw(e, type) {
    const x = e.clientX - canvas.offsetLeft;
    const y = e.clientY - canvas.offsetTop;
    drawPoint({ x, y, type });

    addPoint(state.points, x, y, type);
}

function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawPoint(point, cl) {
    let drawMethod = drawOptions.move;
    if (cl === true)
        clear();
    ctx.lineWidth = point.size;
    ctx.strokeStyle = point.color;
    switch (point.type) {
        case "begin": drawMethod = drawOptions.begin; break;
        case "end": drawMethod = drawOptions.end; break;
        default: drawMethod = drawOptions.move; break;
    }
    drawMethod(point.x, point.y);
}

function drawPoints(points, cl) {
    if (cl === true)
        clear();
    points.forEach(point => drawPoint(point, false));
}

/// end canvas


function fillPalette() {
    panel("palette", colors.length, onColorClick,
        (newEl, index) => {
            newEl.style.backgroundColor = colors[index];
        },
        currOption => {
            currOption.style.backgroundColor = defaultColor;
        }
    );
}

function onColorClick(newOption, currentOption) {
    const newColor = newOption.style.backgroundColor;
    currentOption.style.backgroundColor = newColor;
    state.color = newColor;
}

function fillBrushes() {
    let brushesColor = "black"; // black?
    panel("brushes", brushesSizes.length, onBrushClick,
        (newEl, index) => {
            newEl.style.width = brushesSizes[index] + "px";
            newEl.style.height = brushesSizes[index] + "px";
            newEl.style.backgroundColor = brushesColor;
        },
        currOption => {
            currOption.style.width = defaultBrushSize + "px";
            currOption.style.height = defaultBrushSize + "px";
            currOption.style.backgroundColor = brushesColor;
            state.size = defaultBrushSize;
        }
    );
}

function onBrushClick(newOption, currentOption) {
    const newSize = newOption.style.width;
    currentOption.style.width = newSize;
    currentOption.style.height = newSize;
    state.size = parseInt(newSize);
}

function onSave(e) {
    localStorage.removeItem("state"); // sometimes browser can't detect changes with state
    localStorage.setItem("state", JSON.stringify(state));
}

function onClear(e) {
    clear();
    state.points = [];
    state.size = defaultState.size;
    state.color = defaultState.color;
}

function refreshState(newState) {
    if (!newState) {
        newState = defaultState;
        newState.points = [];
    }
    else
        newState = JSON.parse(newState);
    clear();
    state.color = newState.color;
    state.size = newState.size;
    state.points = state.points.concat(newState.points);
}

function onStorageChange(e) {

    const { key, newValue } = e;
    if (key === "state") {
        refreshState(newValue);
    }
}

function panel(id, count, onChange, onElementAppend, onFillEnd) {
    const domNode = document.getElementById(id);
    const optionsNode = domNode.getElementsByClassName("options")[0];

    optionsNode.addEventListener("click", onClick(domNode, onChange));

    fill(optionsNode, count, onElementAppend);
    onFillEnd(domNode.getElementsByClassName("current-option")[0]);
}


function onClick(main, onChange) {
    return function (e) {
        if (e.target.classList.contains("option"))
            onChange(e.target, main.getElementsByClassName("current-option")[0]);
    }
}

function fill(el, count, cb) {
    for (let i = 0; i < count; i++) {
        let newElement = document.createElement('div');
        newElement.classList.add('option');
        cb(newElement, i);
        el.appendChild(newElement);
    }
}