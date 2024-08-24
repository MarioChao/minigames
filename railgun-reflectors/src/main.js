import { CanvasGrid } from "./canvas-grid.js";

let grid = new CanvasGrid();

const rainbowColors = ['red', 'orange', 'gold', 'lime', 'green', 'cyan', 'blue',
	'indigo', 'violet', 'hotpink', 'deeppink', 'black', 'grey'];

const reflectors = [];
let railgunCount;

function initializeReflectors() {
	for (let i = 0; i < railgunCount + 2; i++) {
		if (reflectors[i]) {
			continue;
		}
		reflectors[i] = [];
	}

	for (let i = 1; i <= railgunCount + 1; i++) {
		for (let j = 1; j <= railgunCount; j++) {
			if (!reflectors[i][j]) {
				reflectors[i][j] = -1;
			}
		}
	}
	// console.log(reflectors);
}

function updateReflectorAt(x, y) {
	let reflectorX = Math.floor(x / grid.squareWidth) + 1;
	let reflectorY = Math.round(y / grid.squareHeight) + 1;
	reflectors[reflectorY][reflectorX] *= -1;
}

function clearGrid() {
	grid.setStrokeStyle("black").setLineWidth(0.5).drawGrid();
}

function drawReflectors() {
	grid.setStrokeStyle("darkcyan").setLineWidth(3);
	for (let i = 1; i <= railgunCount + 1; i++) {
		for (let j = 1; j <= railgunCount; j++) {
			if (reflectors[i][j] == 1) {
				grid.drawLine(j - 1, i - 1, j, i - 1);
			}
		}
	}
}

function _drawRailgun(startRow) {
	let railRow = startRow;
	let railDirection = -1;
	for (let j = 1; j <= railgunCount; j++) {
		// Draw first half
		let halfRailRow = railRow + railDirection / 2;
		grid.drawLine(j - 1, railRow - 0.5, j - 0.5, halfRailRow - 0.5);

		// Get info
		let reflectorRow = railRow + (railDirection == 1);

		// Reflect
		let isRowValid = (1 <= reflectorRow) && (reflectorRow <= railgunCount + 1);
		if (isRowValid && reflectors[reflectorRow][j] == 1) {
			railDirection *= -1;
		} else {
			railRow += railDirection;
		}

		// Draw second half
		grid.drawLine(j - 0.5, halfRailRow - 0.5, j, railRow - 0.5);
	}
}

function drawRailguns() {
	for (let i = 1; i <= railgunCount; i++) {
		grid.setStrokeStyle(rainbowColors[(i - 1) % rainbowColors.length]).setLineWidth(1);
		_drawRailgun(i);
	}
}

function updateCanvas() {
	clearGrid();
	drawReflectors();
	drawRailguns();
}

function updateRailgunCount(count) {
	railgunCount = parseInt(count);
	grid.setGridDimension(count);
	initializeReflectors();
	updateCanvas();
}

/**
 * 
 * @param {HTMLCanvasElement} canvas 
 * @param {MouseEvent} event 
 */
function onCanvasClicked(canvas, event) {
	const rect = canvas.getBoundingClientRect();
	const mouseX = event.clientX - rect.left;
	const mouseY = event.clientY - rect.top;
	updateReflectorAt(mouseX, mouseY);
	updateCanvas();
}

function initializeCanvas() {
	const railgunCanvas = document.getElementById("railgun-canvas");
	const ctx = railgunCanvas.getContext("2d");

	grid.setContext(ctx);

	railgunCanvas.addEventListener("click", function(ev) {
		onCanvasClicked(railgunCanvas, ev);
	});
}

function initializeRailgunCountInput() {
	const inputRailgunCount = document.getElementById("input-railgun-count");
	const railgunCountDisplay = document.getElementById("railgun-count-display");
	
	railgunCountDisplay.innerText = inputRailgunCount.value;
	updateRailgunCount(inputRailgunCount.value);
	
	inputRailgunCount.addEventListener("input", function(ev) {
		railgunCountDisplay.innerText = this.value;
		updateRailgunCount(this.value);
	});
}

function initializeButtonInput() {
	const fillTopRowButton = document.getElementById("fill-top-row");
	const fillBottomRowButton = document.getElementById("fill-bottom-row");

	fillTopRowButton.addEventListener("click", function(ev) {
		for (let j = 1; j <= railgunCount; j++) {
			reflectors[1][j] = 1;
		}
		updateCanvas();
	});
	fillBottomRowButton.addEventListener("click", function(ev) {
		for (let j = 1; j <= railgunCount; j++) {
			reflectors[railgunCount + 1][j] = 1;
		}
		updateCanvas();
	});
}

function initializeInput() {
	initializeRailgunCountInput();
	initializeButtonInput();
}

function onDOMContentLoaded() {
	initializeCanvas();
	initializeInput();
}

window.addEventListener("DOMContentLoaded", onDOMContentLoaded);
