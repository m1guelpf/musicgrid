import Grid from './Grid'
import Util from './Util'
import SpriteSheet from './SpriteSheet'
import ParticleSystem, { MAX_PARTICLE_BRIGHTNESS, PARTICLE_LIFETIME, PARTICLE_POOL_SIZE } from './ParticleSystem'

class GridRenderer {
	spriteSheet: SpriteSheet
	particleSystem: ParticleSystem
	gridWidth: number
	gridHeight: number
	canvas: HTMLCanvasElement
	ctx: CanvasRenderingContext2D
	lastPlayheadX: number

	constructor(gridWidth: number, gridHeight: number, canvas: HTMLCanvasElement) {
		this.spriteSheet = new SpriteSheet(gridWidth, gridHeight, canvas.width, canvas.height)
		this.particleSystem = new ParticleSystem(canvas.width, canvas.height)
		this.gridWidth = gridWidth
		this.gridHeight = gridHeight
		this.canvas = canvas
		this.ctx = canvas.getContext('2d')
		this.lastPlayheadX = -1
	}

	update(grid: Grid, mouseX: number, mouseY: number): void {
		this.particleSystem.update()

		this.draw(grid, mouseX, mouseY)
	}

	private draw(grid: Grid, mouseX: number, mouseY: number) {
		const playheadX = grid.instruments[grid.currentInstrument].getPlayheadX()
		const dpr = window.devicePixelRatio || 1

		// Defaults
		this.ctx.globalAlpha = 1
		this.ctx.filter = 'none'

		this.ctx.beginPath()
		this.ctx.rect(0, 0, this.canvas.width, this.canvas.height)
		this.ctx.fillStyle = 'black'
		this.ctx.fill()

		// Get particle heatmap

		const heatmap = this.getParticleHeatMap()

		const mousedOverTile = Util.pixelCoordsToTileCoords(mouseX, mouseY, this.gridWidth, this.gridHeight, this.canvas.width, this.canvas.height) as { x: number; y: number }

		// Draw each tile
		for (let i = 0; i < grid.data.length; i += 1) {
			const dx = this.canvas.width / this.gridWidth
			const dy = this.canvas.height / this.gridHeight
			const { x: gridx, y: gridy } = Util.indexToCoord(i, this.gridHeight)
			const x = dx * gridx
			const y = dy * gridy

			const on = !grid.data[i].isEmpty()

			if (grid.data[i].hasNote(1)) this.ctx.filter = 'brightness(50%) sepia(100) saturate(100) hue-rotate(25deg)'
			else this.ctx.filter = 'none'

			if (on) {
				if (gridx === playheadX) {
					this.ctx.globalAlpha = 1
					this.spriteSheet.drawSprite(2, this.ctx, x, y)
					if (playheadX !== this.lastPlayheadX) this.particleSystem.createParticleBurst(dx * (gridx + 0.5), dy * (gridy + 0.5), 8 * dpr, 20)
				} else {
					this.ctx.globalAlpha = 0.85
					this.spriteSheet.drawSprite(1, this.ctx, x, y)
				}
			} else {
				if (gridx === mousedOverTile.x && gridy === mousedOverTile.y) this.ctx.globalAlpha = 0.3
				else this.ctx.globalAlpha = (heatmap[i] * MAX_PARTICLE_BRIGHTNESS * (204 / 255)) / PARTICLE_LIFETIME + 51 / 255

				this.spriteSheet.drawSprite(0, this.ctx, x, y)
			}
		}

		this.lastPlayheadX = playheadX
	}

	private getParticleHeatMap(): number[] {
		const heatmap = Array(this.gridWidth * this.gridHeight).fill(0)

		for (let i = 0; i < PARTICLE_POOL_SIZE; i += 1) {
			const p = this.particleSystem.particles[i]

			if (p.life <= 0) continue

			const tile = Util.pixelCoordsToTileCoords(p.x, p.y, this.gridWidth, this.gridHeight, this.canvas.width, this.canvas.height)
			if (tile) heatmap[Util.coordToIndex(tile.x, tile.y, this.gridHeight)] += p.life
		}

		return heatmap
	}
}

export default GridRenderer
