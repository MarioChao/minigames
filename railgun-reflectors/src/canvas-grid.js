export class CanvasGrid {
	/**
	 * 
	 * @param {CanvasRenderingContext2D} ctx 
	 */
	setContext(ctx) {
		this.ctx = ctx;
		this.setScale();
		this.setTranslate();
		this.setStrokeStyle();
		this.setLineWidth();
		this.setLineDash();
		return this;
	}

	setGridDimension(size) {
		this.size = size;
		this.squareWidth = this.getCanvasWidth() / size;
		this.squareHeight = this.getCanvasHeight() / size;
		return this;
	}

	updateGridDimension() {
		this.setGridDimension(this.size);
		return this;
	}

	getCanvasWidth() {
		return this.ctx.canvas.width;
	}

	getCanvasHeight() {
		return this.ctx.canvas.height;
	}

	setScale(xy = {x: 1, y: 1}) {
		this.scale = xy;
		return this;
	}

	setTranslate(xy = {x: 0, y: 0}) {
		this.translate = xy;
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

	_transformations() {
		this.ctx.resetTransform();
		this.ctx.translate(this.translate.x, this.translate.y);
		this.ctx.scale(this.scale.x, this.scale.y);
		return this;
	}

	_detailedStrokeStyle() {
		this.ctx.strokeStyle = this.strokeStyle;
		this.ctx.lineWidth = this.lineWidth;
		this.ctx.setLineDash(this.lineDash);
		return this;
	}

	_detailedStroke() {
		this._detailedStrokeStyle();
		this.ctx.stroke();
		return this;
	}

	drawGrid() {
		this._transformations();
		this.ctx.beginPath();

		let startX = Math.floor((-this.translate.x) / this.scale.x / this.squareWidth);
		let endX = Math.ceil((-this.translate.x + this.getCanvasWidth()) / this.scale.x / this.squareWidth);
		let startY = Math.floor((-this.translate.y) / this.scale.y / this.squareHeight);
		let endY = Math.ceil((-this.translate.y + this.getCanvasHeight()) / this.scale.y / this.squareHeight);
		const totalSquaresCount = (endX - startX) * (endY - startY);
		const totalLinesCount = (endX - startX) + (endY - startY);

		if (totalLinesCount > 1000) {
			this.ctx.rect(0, 0, this.getCanvasWidth(), this.getCanvasHeight());
			this.ctx.fillStyle = "lightgrey";
			this.ctx.fill();
		} else {
			this.ctx.fillStyle = "white";
			this.ctx.fillRect(0, 0, this.getCanvasWidth(), this.getCanvasHeight());
			
			// this._detailedStrokeStyle();
			// for (let x = startX; x < endX; x++) {
			// 	for (let y = startY; y < endY; y++) {
			// 		this.ctx.strokeRect(x * this.squareWidth, y * this.squareHeight, this.squareWidth, this.squareHeight);
			// 		// this.ctx.rect(x * this.squareWidth, y * this.squareHeight, this.squareWidth, this.squareHeight);
			// 	}
			// }
			// this.ctx.fill();

			for (let x = startX; x < endX; x++) {
				this.ctx.moveTo(x * this.squareWidth, startY * this.squareHeight);
				this.ctx.lineTo(x * this.squareWidth, endY * this.squareHeight);
			}
			for (let y = startY; y < endY; y++) {
				this.ctx.moveTo(startX * this.squareWidth, y * this.squareHeight);
				this.ctx.lineTo(endX * this.squareWidth, y * this.squareHeight);
			}
		}
		this._detailedStroke();
		return this;
	}

	drawLine(cellX1, cellY1, cellX2, cellY2) {
		this._transformations();
		this.ctx.beginPath();
		this.ctx.moveTo(cellX1 * this.squareWidth, cellY1 * this.squareHeight);
		this.ctx.lineTo(cellX2 * this.squareWidth, cellY2 * this.squareHeight);
		this._detailedStroke();
		return this;
	}
}
