import Tile from './Tile'
import * as Tone from 'tone'
import SynthInstrument from './SynthInstrument'
import GridRenderer from './GridRenderer'
import Util from './Util'

class Grid {
	data: Tile[]
	width: number
	height: number
	renderer: GridRenderer
	currentInstrument: number
	instruments: SynthInstrument[]

	constructor(width: number, height: number, canvas: HTMLCanvasElement) {
		this.data = [...Array(width * height)].map(() => new Tile())
		this.width = width
		this.height = height
		this.renderer = new GridRenderer(width, height, canvas)
		this.currentInstrument = 0
		this.instruments = [
			new SynthInstrument(
				width,
				height,
				{
					// @ts-ignore
					oscillator: { type: 'sine' },
					// @ts-ignore
					envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 },
				},
				{ frequency: 1100, rolloff: -12 }
			),
			new SynthInstrument(
				width,
				height,
				{
					// @ts-ignore
					oscillator: { type: 'sawtooth' },
					// @ts-ignore
					envelope: {
						attack: 0.005,
						decay: 0.1,
						sustain: 0.3,
						release: 2,
					},
				},
				{ frequency: 1100, rolloff: -12 }
			),
		]
	}

	update(mouseX: number, mouseY: number): void {
		this.renderer.update(this, mouseX, mouseY)
	}

	/**
	 * @dev Returns wether the specified tile is armed.
	 */
	getTileValue(x: number, y: number): boolean {
		return this.data[Util.coordToIndex(x, y, this.height)].hasNote(this.currentInstrument)
	}

	setTileValue(x: number, y: number, armed: boolean): void {
		if (armed) {
			if (this.getTileValue(x, y)) return
			// Turning on, schedule note

			this.data[Util.coordToIndex(x, y, this.height)].addNote(this.currentInstrument, this.instruments[this.currentInstrument].scheduleNote(x, y))
		} else {
			if (!this.getTileValue(x, y)) return
			// Turning off, unschedule note
			this.instruments[this.currentInstrument].unscheduleNote(this.data[Util.coordToIndex(x, y, this.height)].getNote(this.currentInstrument))
			this.data[Util.coordToIndex(x, y, this.height)].removeNote(this.currentInstrument)
		}
	}

	toggleTileValue(x: number, y: number): void {
		this.setTileValue(x, y, !this.getTileValue(x, y))
	}

	/**
	 * Turns off all tiles and removes all notes
	 */
	clearAllTiles(): void {
		this.data.forEach(e => e.removeAllNotes())

		Tone.Transport.cancel()
	}

	setCurrentInstrument(instrumentId: number): void {
		if (instrumentId >= this.instruments.length) throw new Error('tried to switch to nonexistent instrument')

		this.currentInstrument = instrumentId
	}

	setMuted(muted: boolean): void {
		Tone.Destination.mute = muted
	}

	serialize(): string {
		let dataflag = false
		const bytes = new Uint8Array(this.data.length / 8)

		for (let i = 0; i < this.data.length / 8; i += 1) {
			let str = ''

			for (let j = 0; j < 8; j += 1) {
				const tile = !this.data[Util.coordToIndex(i, j, 8)].isEmpty()
				if (tile) {
					str += '1'
					dataflag = true
				} else str += '0'
			}

			bytes[i] = parseInt(str, 2)
		}

		if (!dataflag) return ''

		let binary = ''
		for (let i = 0; i < bytes.byteLength; i += 1) binary += String.fromCharCode(bytes[i])

		return Buffer.from(binary, 'binary').toString('base64')
	}

	unserialize(base64enc: string): void {
		const binary = Buffer.from(base64enc, 'base64').toString('binary')
		let str = ''

		for (let i = 0; i < this.data.length / 8; i += 1) str += binary.charCodeAt(i).toString(2).padStart(8, '0')
		for (let i = 0; i < str.length; i += 1) this.setTileValue(Math.floor(i / this.width), i % this.width, str[i] === '1')
	}
}

export default Grid
