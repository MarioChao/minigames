import { CanvasGrid } from "./canvas-grid.js";
import { CanvasUtil } from "./canvas-util.js";
import { debounce } from "./utils.js";

let ctx;
const grid = new CanvasGrid();
const canvas = new CanvasUtil();
canvas.setGrid(grid)
	.setScale(1, 1)
	.setTranslate(0, 0)
	.setRedraw(updateCanvas)
	.setOnClicked(onCanvasClicked)
	.setDrag(true)
	.setZoom(true);

const rainbowColors = ["red", "orange", "gold", "lime", "green", "cyan", "blue",
	"indigo", "violet", "deeppink", "black", "grey"];
const rainbowLineDashes = [
	[],
	[5, 5],
	[15, 10, 5, 10],
	[15, 5],
	[15, 5, 5],
	[15, 5, 5, 5, 5, 5, 5, 5],
	[5, 15, 15],
	[15, 5, 5, 15],
	[10, 5, 10, 5, 10, 15],
];

const reflectors = [];
let railgunCount;

const gridMinimumWidth = 0.1;

const storedReflectorsStrings = [];

function adjustReflectorsStrings(i, j) {
	for (let x = storedReflectorsStrings.length; x <= i; x++) {
		storedReflectorsStrings[x] = Array(j + 1);
	}
}

function setReflectorState(i, j, state) {
	if (i < 1 || i > reflectors.length) {
		return;
	}
	if (j < 1 || j > reflectors[1].length) {
		return;
	}
	adjustReflectorsStrings(i, j);
	reflectors[i][j] = state;
	storedReflectorsStrings[i][j] = (state == 1 ? "1" : "0");
}

function swapReflectorState(i, j) {
	if (i < 1 || i > reflectors.length) {
		return;
	}
	if (j < 1 || j > reflectors[1].length) {
		return;
	}
	adjustReflectorsStrings(i, j);
	setReflectorState(i, j, -reflectors[i][j]);
}

function updateReflectorsSize() {
	for (let i = 0; i < railgunCount + 2; i++) {
		if (reflectors[i]) {
			continue;
		}
		reflectors[i] = [];
	}

	adjustReflectorsStrings(railgunCount + 1, railgunCount);
	for (let i = 1; i <= railgunCount + 1; i++) {
		for (let j = 1; j <= railgunCount; j++) {
			if (!reflectors[i][j]) {
				reflectors[i][j] = 0;
				setReflectorState(i, j, -1);
			}
		}
	}
	// console.log(reflectors);
}

function updateReflectorAt(x, y) {
	let reflectorX = Math.floor(x / grid.squareWidth) + 1;
	let reflectorY = Math.round(y / grid.squareHeight) + 1;
	swapReflectorState(reflectorY, reflectorX);
}

function parseReflectors() {
	let parseResult = "";
	for (let i = 1; i <= railgunCount + 1; i++) {
		parseResult += storedReflectorsStrings[i].join("").substring(0, railgunCount);
		if (i < railgunCount + 1) {
			parseResult += "\n";
		}
	}
	return parseResult;
}

function setReflectors(rawString) {
	// Update railgun count
	let reflectorStrings = rawString.toString().trim().split('\n');
	let count = reflectorStrings[0].length;
	let rows = reflectorStrings.length;
	updateRailgunCount(count);

	// Set reflectors
	let deltaI = 1 + Math.max(count - rows, 0);
	let deltaJ = 1;
	for (let i = 0; i < reflectorStrings.length; i++) {
		for (let j = 0; j < reflectorStrings[i].length; j++) {
			if (reflectorStrings[i][j] === "0") {
				setReflectorState(i + deltaI, j + deltaJ, -1);
			} else {
				setReflectorState(i + deltaI, j + deltaJ, 1);
			}
		}
	}
	updateCanvas();
	updateReflectorsDisplay();
}

function actuallyUpdateReflectorsDisplay() {
	// Update
	const reflectorsDisplay = document.getElementById("reflectors-display");
	reflectorsDisplay.innerHTML = parseReflectors();

	// Hide refresh button
	const refreshReflectorsDisplay = document.getElementById("refresh-reflectors-display");
	refreshReflectorsDisplay.setAttribute("hidden", true);
}

/**
 * Shows a visual indicator that the reflectors display can be updated.
 */
function updateReflectorsDisplay() {
	const refreshReflectorsDisplay = document.getElementById("refresh-reflectors-display");
	refreshReflectorsDisplay.removeAttribute("hidden");
}

const debouncedUpdateReflectorsDisplay = debounce(updateReflectorsDisplay, 0);

function clearGrid() {
	grid.setStrokeStyle("darkgray")
		.setLineWidth(gridMinimumWidth + (0.9 - gridMinimumWidth) / canvas.ctxScale.y)
		.setLineDash()
		.drawGrid();
}

function drawReflectors() {
	grid.setStrokeStyle("darkcyan")
		.setLineWidth(gridMinimumWidth + (5 - gridMinimumWidth) / canvas.ctxScale.y)
		.setLineDash();
	for (let i = 1; i <= railgunCount + 1; i++) {
		for (let j = 1; j <= railgunCount; j++) {
			if (reflectors[i][j] === 1) {
				grid.drawLine(j - 1, i - 1, j, i - 1);
			}
		}
	}
}

function _drawRailgun(startRow) {
	// Draw variables
	let previousJ = 0;
	let previousI = startRow;

	// Railgun variables
	let railRow = startRow;
	let railDirection = -1;

	// Fire railgun
	for (let j = 1; j <= railgunCount; j++) {
		// Get railgun's position at halfway
		let halfRailRow = railRow + railDirection / 2;
		
		// Get info
		let reflectorRow = railRow + (railDirection === 1);
		
		// Check reflector
		let isRowValid = (1 <= reflectorRow) && (reflectorRow <= railgunCount + 1);
		let willDrawLine = false;
		if (isRowValid && reflectors[reflectorRow][j] === 1) {
			// Reflect
			railDirection *= -1;
			
			willDrawLine = true;
		} else {
			railRow += railDirection;
		}

		// Draw line if reflected or last column
		if (willDrawLine) {
			grid.drawLine(previousJ, previousI - 0.5, j - 0.5, halfRailRow - 0.5);
			previousJ = j - 0.5;
			previousI = halfRailRow;
		}
		if (j == railgunCount) {
			grid.drawLine(previousJ, previousI - 0.5, j, railRow - 0.5);
		}
	}
}

function drawRailguns() {
	for (let i = 1; i <= railgunCount; i++) {
		grid.setStrokeStyle(rainbowColors[(i - 1) % rainbowColors.length])
			.setLineWidth(gridMinimumWidth + (1 - gridMinimumWidth) / canvas.ctxScale.y)
			.setLineDash(rainbowLineDashes[Math.floor((i - 1) / rainbowColors.length) % rainbowLineDashes.length].map(x => x / Math.sqrt(canvas.ctxScale.y)));
		_drawRailgun(i);
	}
}

function updateCanvas() {
	ctx.resetTransform();
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	clearGrid();
	drawRailguns();
	drawReflectors();
}

function updateRailgunCount(count) {
	const inputRailgunCount = document.getElementById("input-railgun-count");
	inputRailgunCount.value = count;
	const railgunCountDisplay = document.getElementById("railgun-count-display");
	railgunCountDisplay.innerText = count;
	railgunCount = parseInt(count);
	grid.setGridDimension(count);
	updateReflectorsSize();
	updateCanvas();
	debouncedUpdateReflectorsDisplay();
}

const debouncedUpdateRailgunCount = debounce(updateRailgunCount, 0);

/**
 * 
 * @param {MouseEvent} event 
 */
function onCanvasClicked(event) {
	const [mouseX, mouseY] = canvas.getPositionOnCanvas(event.clientX, event.clientY);
	updateReflectorAt(mouseX, mouseY);
	updateCanvas();
	updateReflectorsDisplay();
}

function resizeCanvas() {
	canvas.canvas.width = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.75);
	canvas.canvas.height = canvas.canvas.width;
	grid.updateGridDimension();
	updateCanvas();
}

function initializeCanvas() {
	const railgunCanvas = document.getElementById("railgun-canvas");
	ctx = railgunCanvas.getContext("2d");

	canvas.setCanvas(railgunCanvas);

	grid.setContext(ctx)
		.setScale(canvas.ctxScale)
		.setTranslate(canvas.ctxTranslate);

	window.addEventListener("resize", resizeCanvas);
	window.addEventListener("orientationchange", resizeCanvas);
	resizeCanvas();
}

function initializeRailgunCountInput() {
	const inputRailgunCount = document.getElementById("input-railgun-count");
	updateRailgunCount(inputRailgunCount.value);
	
	inputRailgunCount.addEventListener("input", function(ev) {
		let count = this.value;
		if (count <= 532) {
			updateRailgunCount(count);
			debouncedUpdateRailgunCount(this.value);
		} else {
			const railgunCountDisplay = document.getElementById("railgun-count-display");
			railgunCountDisplay.innerText = count;
			debouncedUpdateRailgunCount(this.value);
		}
	});
}

function initializeButtonInput() {
	const fillTopRowButton = document.getElementById("fill-top-row");
	const fillBottomRowButton = document.getElementById("fill-bottom-row");

	fillTopRowButton.addEventListener("click", function(ev) {
		for (let j = 1; j <= railgunCount; j++) {
			setReflectorState(1, j, 1);
		}
		updateCanvas();
		updateReflectorsDisplay();
	});
	fillBottomRowButton.addEventListener("click", function(ev) {
		for (let j = 1; j <= railgunCount; j++) {
			setReflectorState(railgunCount + 1, j, 1);
		}
		updateCanvas();
		updateReflectorsDisplay();
	});
}

function initializeReflectorsInput() {
	const inputReflectors = document.getElementById("input-reflectors");

	inputReflectors.addEventListener("change", function(ev) {
		setReflectors(this.value);
	});
}

function initializeReflectorsDisplay() {
	const refreshReflectorsDisplay = document.getElementById('refresh-reflectors-display');

	refreshReflectorsDisplay.addEventListener("click", function(ev) {
		actuallyUpdateReflectorsDisplay();
	});
}

function initializeInput() {
	initializeRailgunCountInput();
	initializeButtonInput();
	initializeReflectorsInput();
	initializeReflectorsDisplay();
}

function onDOMContentLoaded() {
	initializeCanvas();
	initializeInput();
}

window.addEventListener("DOMContentLoaded", onDOMContentLoaded);
