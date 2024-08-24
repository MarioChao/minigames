import { CanvasGrid } from "./canvas-grid.js";

let grid = new CanvasGrid();

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

function updateReflectorsSize() {
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

function parseReflectors() {
	let parseResult = "";
	for (let i = 1; i <= railgunCount + 1; i++) {
		for (let j = 1; j <= railgunCount; j++) {
			if (reflectors[i][j] === 1) {
				parseResult += "1";
			} else {
				parseResult += "0";
			}
		}
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
				reflectors[i + deltaI][j + deltaJ] = -1;
			} else {
				reflectors[i + deltaI][j + deltaJ] = 1;
			}
		}
	}
	updateCanvas();
}

function updateReflectorsDisplay() {
	const reflectorsDisplay = document.getElementById("reflectors-display");
	reflectorsDisplay.innerHTML = parseReflectors();
}

function clearGrid() {
	grid.setStrokeStyle("black")
		.setLineWidth(0.25)
		.setLineDash()
		.drawGrid();
}

function drawReflectors() {
	grid.setStrokeStyle("darkcyan")
		.setLineWidth(5)
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
			.setLineWidth(1)
			.setLineDash(rainbowLineDashes[Math.floor((i - 1) / rainbowColors.length) % rainbowLineDashes.length]);
		_drawRailgun(i);
	}
}

function updateCanvas() {
	clearGrid();
	drawRailguns();
	drawReflectors();
	updateReflectorsDisplay();
}

function updateRailgunCount(count) {
	const railgunCountDisplay = document.getElementById("railgun-count-display");
	railgunCountDisplay.innerText = count;
	railgunCount = parseInt(count);
	grid.setGridDimension(count);
	updateReflectorsSize();
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
	updateRailgunCount(inputRailgunCount.value);
	
	inputRailgunCount.addEventListener("input", function(ev) {
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

function initializeReflectorsInput() {
	const inputReflectors = document.getElementById("input-reflectors");

	inputReflectors.addEventListener("change", function(ev) {
		setReflectors(this.value)
	});
}

function initializeInput() {
	initializeRailgunCountInput();
	initializeButtonInput();
	initializeReflectorsInput();
}

function onDOMContentLoaded() {
	initializeCanvas();
	initializeInput();
}

window.addEventListener("DOMContentLoaded", onDOMContentLoaded);
