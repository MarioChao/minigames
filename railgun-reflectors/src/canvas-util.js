import { CanvasGrid } from "./canvas-grid.js";

export class CanvasUtil {
	constructor() {
		this.setScale(1, 1)
			.setTranslate(0, 0);
		this.setRedraw(() => {});
	}

	/**
	 * 
	 * @param {HTMLCanvasElement} canvas 
	 */
	setCanvas(canvas){
		if (this.canvas) {
			return this;
		}
		this.canvas = canvas;
		this._initializedDrag();
		this._initializeZoom();
		return this;
	}

	/**
	 * 
	 * @param {CanvasGrid} grid 
	 */
	setGrid(grid) {
		this.grid = grid;
		return this;
	}

	setTranslate(x, y) {
		this.ctxTranslate = {x, y};
		return this;
	}

	setScale(x, y) {
		this.ctxScale = {x, y};
		return this;
	}

	setRedraw(callback) {
		this.redraw = callback;
		return this;
	}

	setOnClicked(callback) {
		this.onClicked = callback;
		return this;
	}

	getPositionOnCanvas(absoluteX, absoluteY) {
		const rect = this.canvas.getBoundingClientRect();
		const canvasX = (absoluteX - rect.left - this.ctxTranslate.x) / this.ctxScale.x;
		const canvasY = (absoluteY - rect.top - this.ctxTranslate.y) / this.ctxScale.y ;
		return [canvasX, canvasY];
	}

	getTransformedPosition(canvasX, canvasY) {
		const transformedX = canvasX * this.ctxScale.x + this.ctxTranslate.x;
		const transformedY = canvasY * this.ctxScale.y + + this.ctxTranslate.y;
		return [transformedX, transformedY];
	}

	setDrag(enabled) {
		if (this.dragEnabled == enabled) {
			return this;
		}
		this.dragEnabled = enabled;
		return this;
	}

	setZoom(enabled) {
		if (this.zoomEnabled == enabled) {
			return this;
		}
		this.zoomEnabled = enabled;
		return this;
	}

	_translateOriginTo(x, y) {
		// Clamp boundary
		if (x > 0) {
			x = 0;
		}
		if (x + this.canvas.width * this.ctxScale.x < this.canvas.width) {
			x = this.canvas.width - this.canvas.width * this.ctxScale.x;
		}
		if (y > 0) {
			y = 0;
		}
		if (y + this.canvas.height * this.ctxScale.y < this.canvas.height) {
			y = this.canvas.height - this.canvas.height * this.ctxScale.y;
		}

		// Update
		this.ctxTranslate.x = x;
		this.ctxTranslate.y = y;

		return this;
	}

	_translateCanvasPointTo(canvasX, canvasY, x, y) {
		let newX = x - canvasX * this.ctxScale.x;
		let newY = y - canvasY * this.ctxScale.y;
		return this._translateOriginTo(newX, newY);
	}

	_scaleTo(x, y) {
		// Clamp boundary
		x = Math.max(1, x);
		y = Math.max(1, y);

		// Update
		this.ctxScale.x = x;
		this.ctxScale.y = y;

		return this;
	}

	_initializedDrag() {
		// Drag and click

		const canvas = this;
		let canvasInitial;
		let startPosition, isDragging;

		this.canvas.addEventListener("mousedown", function(ev) {
			ev.preventDefault();
			if (!canvas.dragEnabled) {
				return;
			}
			canvasInitial = {x: canvas.ctxTranslate.x, y: canvas.ctxTranslate.y};
			startPosition = {
				x: ev.clientX,
				y: ev.clientY
			};
			isDragging = false;
		});

		document.addEventListener("mousemove", function(ev) {
			if (startPosition) {
				let offsetX = ev.clientX - startPosition.x;
				let offsetY = ev.clientY - startPosition.y;
				let newX = canvasInitial.x + offsetX;
				let newY = canvasInitial.y + offsetY;
				
				canvas._translateOriginTo(newX, newY);
				if (canvas.ctxTranslate.x != canvasInitial.x
					|| canvas.ctxTranslate.y != canvasInitial.y) {
					isDragging = true;
				}

				canvas.grid.setTranslate(canvas.ctxTranslate);
				canvas.redraw();
			}
		});

		document.addEventListener("mouseup", function(ev) {
			if (canvas.dragEnabled) {
				canvasInitial = null;
				startPosition = null;
			} else {
				return;
			}
		});
		
		this.canvas.addEventListener("mouseup", function(ev) {
			if (canvas.dragEnabled) {
				if (!isDragging) {
					canvas.onClicked(ev);
				}
			} else {
				canvas.onClicked(ev);
			}
		});
	}

	_initializeZoom() {
		const canvas = this;

		this.canvas.addEventListener("wheel", function(ev) {
			if (!canvas.zoomEnabled) {
				return;
			}
			ev.preventDefault();

			let zoom = -ev.deltaY * 0.03;
			let newScaleX = canvas.ctxScale.x + zoom;
			let newScaleY = canvas.ctxScale.y + zoom;

			let [canvasX, canvasY] = canvas.getPositionOnCanvas(ev.clientX, ev.clientY);
			let [transformedX, transformedY] = canvas.getTransformedPosition(canvasX, canvasY);

			canvas._scaleTo(newScaleX, newScaleY)
				._translateCanvasPointTo(canvasX, canvasY, transformedX, transformedY);

			canvas.grid.setScale(canvas.ctxScale).setTranslate(canvas.ctxTranslate);
			canvas.redraw();
		}, false);
	}
}
