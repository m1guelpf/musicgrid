class Util {
	static pixelCoordsToTileCoords(x: number, y: number, gridWidth: number, gridHeight: number, canvasWidth: number, canvasHeight: number): false | { x: number; y: number } {
		const dx = canvasWidth / gridWidth
		const dy = canvasHeight / gridHeight
		const xCoord = Math.floor(x / dx)
		const yCoord = Math.floor(y / dy)

		if (xCoord >= gridWidth || yCoord >= gridWidth || xCoord < 0 || yCoord < 0) return false

		return { x: xCoord, y: yCoord }
	}

	static coordToIndex(x: number, y: number, gridHeight: number): number {
		return x * gridHeight + y
	}

	static indexToCoord(index: number, gridHeight: number): { x: number; y: number } {
		return { x: Math.floor(index / gridHeight), y: index % gridHeight }
	}

	// Adapted from https://stackoverflow.com/a/3368118/2234742
	static drawRoundedRectangle(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius = 5, fill = false, stroke = true): void {
		ctx.beginPath()
		ctx.moveTo(x + radius, y)
		ctx.lineTo(x + width - radius, y)
		ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
		ctx.lineTo(x + width, y + height - radius)
		ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
		ctx.lineTo(x + radius, y + height)
		ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
		ctx.lineTo(x, y + radius)
		ctx.quadraticCurveTo(x, y, x + radius, y)
		ctx.closePath()

		if (fill) ctx.fill()
		if (stroke) ctx.stroke()
	}
}

export default Util
