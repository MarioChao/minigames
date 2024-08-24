export class CanvasGrid {
	/**
	 * 
	 * @param {CanvasRenderingContext2D} ctx 
	 */
	setContext(ctx) {
		this.ctx = ctx;
		this.totalWidth = ctx.canvas.width;
		this.totalHeight = ctx.canvas.height;
		this.setStrokeStyle();
		this.setLineWidth();
		this.setLineDash();
		return this;
	}

	setGridDimension(size) {
		this.size = size;
		this.squareWidth = this.totalWidth / size;
		this.squareHeight = this.totalHeight / size;
		return this;
	}

	setStrokeStyle(strokeStyle = "black") {
		this.strokeStyle = strokeStyle
		return this;
	}

	setLineWidth(lineWidth = 1) {
		this.lineWidth = lineWidth;
		return this;
	}

	setLineDash(lineDash = []) {
		this.lineDash = lineDash;
		return this;
	}

	_detailedStroke() {
		this.ctx.strokeStyle = this.strokeStyle;
		this.ctx.lineWidth = this.lineWidth;
		this.ctx.setLineDash(this.lineDash);
		this.ctx.stroke();
	}

	drawGrid() {
		this.ctx.beginPath()
		for (let x = 0; x < this.size; x++) {
			for (let y = 0; y < this.size; y++) {
				this.ctx.rect(x * this.squareWidth, y * this.squareHeight, this.squareWidth, this.squareHeight);
			}
		}
		this.ctx.fillStyle = "white";
		this.ctx.fill();
		this._detailedStroke();
		return this;
	}

	drawLine(cellX1, cellY1, cellX2, cellY2) {
		this.ctx.beginPath();
		this.ctx.moveTo(cellX1 * this.squareWidth, cellY1 * this.squareHeight);
		this.ctx.lineTo(cellX2 * this.squareWidth, cellY2 * this.squareHeight);
		this._detailedStroke();
		return this;
	}
}
