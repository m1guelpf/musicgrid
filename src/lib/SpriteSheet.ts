import Util from './Util'

class SpriteSheet {
	spriteSheet: HTMLCanvasElement
	tileWidth: number
	tileHeight: number

	constructor(gridWidth: number, gridHeight: number, canvasWidth: number, canvasHeight: number) {
		this.spriteSheet = document.createElement('canvas')
		const ssctx = this.spriteSheet.getContext('2d')
		this.tileWidth = canvasWidth / gridWidth
		this.tileHeight = canvasHeight / gridHeight
		this.spriteSheet.width = 3 * this.tileWidth // 3 sprites
		this.spriteSheet.height = this.tileHeight

		const currentDevicePixelRatio = window.devicePixelRatio || 1

		// For all rectangles

		let margin, x, y
		const dx = this.tileWidth
		const dy = this.tileHeight
		ssctx.fillStyle = '#fff'

		// Rectangle id 0 - unarmed white rectangle
		margin = 4 * currentDevicePixelRatio
		x = 0
		y = 0
		ssctx.filter = 'none'
		Util.drawRoundedRectangle(ssctx, x + margin, y + margin, dx - 2 * margin, dy - 2 * margin, 2, true, false)

		// Rectangle id 1 - armed white rectangle
		margin = 3 * currentDevicePixelRatio
		x = dx
		y = 0
		ssctx.filter = `blur(${currentDevicePixelRatio}px)`
		Util.drawRoundedRectangle(ssctx, x + margin, y + margin, dx - 2 * margin, dy - 2 * margin, 2, true, false)

		// Rectangle id 2 - activated white rectangle
		margin = 2 * currentDevicePixelRatio
		x = 2 * dx
		y = 0
		ssctx.filter = `blur(${currentDevicePixelRatio * 2}px)`
		Util.drawRoundedRectangle(ssctx, x + margin, y + margin, dx - 2 * margin, dy - 2 * margin, 2, true, false)
	}

	drawSprite(spriteId: number, context: CanvasRenderingContext2D, x: number, y: number): void {
		context.drawImage(this.spriteSheet, spriteId * this.tileWidth, 0, this.tileWidth, this.tileHeight, x, y, this.tileWidth, this.tileHeight)
	}
}

export default SpriteSheet
