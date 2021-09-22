import * as Tone from 'tone'
import { FilterOptions, SynthOptions } from 'tone'

const PENTATONIC_SCALE = ['B#', 'D', 'F', 'G', 'A']
const BASE_OCTAVE = 3
const OCTAVE_OFFSET = 4

class SynthInstrument {
	gridWidth: number
	gridHeight: number
	scale: string[]
	numVoices: number // Number of voices (players) *per note*
	noteOffset: number // Total note duration, including release. Used to offset the sound sprites
	players: Tone.Player[]
	currentPlayer: number
	polyphony: number[]
	notes: Array<{ x: number; y: number }>

	constructor(gridWidth: number, gridHeight: number, options: SynthOptions, filterOptions: FilterOptions) {
		this.gridWidth = gridWidth
		this.gridHeight = gridHeight

		this.scale = [...Array(gridHeight)]
			.map((_, i: number) => {
				return PENTATONIC_SCALE[i % PENTATONIC_SCALE.length] + (BASE_OCTAVE + Math.floor((i + OCTAVE_OFFSET) / PENTATONIC_SCALE.length))
			})
			.reverse()

		this.numVoices = 3
		this.noteOffset = (Tone.Time('1m').toSeconds() / gridWidth) * 6

		this.players = []
		this.currentPlayer = 0

		this.polyphony = Array(gridWidth).fill(0)
		this.notes = []

		Tone.Offline(() => {
			const filter = new Tone.Filter(filterOptions).toDestination()
			const synth = new Tone.Synth(options).connect(filter)

			this.scale.forEach((el, idx) => synth.triggerAttackRelease(el, Tone.Time('1m').toSeconds() / this.gridWidth, idx * this.noteOffset))
		}, this.noteOffset * this.scale.length).then(buffer => {
			for (let i = 0; i < this.scale.length * this.numVoices; i += 1) {
				Tone.setContext(Tone.context)
				const player = new Tone.Player(buffer)
				Tone.connect(player, Tone.Destination)
				this.players.push(player)
			}
		})
	}

	scheduleNote(gridX: number, gridY: number): number {
		const noteDuration = Tone.Time('1m').toSeconds() / this.gridWidth

		const playEvent = Tone.Transport.schedule(time => {
			const highVolume = -10 // When one note is playing
			const lowVolume = -20 // When all notes are playing (lower volume to prevent peaking)

			const volume = ((this.gridHeight - this.polyphony[gridX]) / this.gridHeight) * (highVolume - lowVolume) + lowVolume

			this.players[this.currentPlayer].volume.setValueAtTime(volume, time)
			this.players[this.currentPlayer].start(time, gridY * this.noteOffset, this.noteOffset)
			this.currentPlayer = (this.currentPlayer + 1) % this.players.length
		}, gridX * noteDuration)

		this.notes[playEvent] = { x: gridX, y: gridY }
		this.polyphony[gridX] += 1

		return playEvent
	}

	unscheduleNote(id: number): void {
		const { x } = this.notes[id]
		delete this.notes[id]

		this.polyphony[x] -= 1
		Tone.Transport.clear(id)
	}

	getPlayheadX(): number {
		const adjustedSeconds = Tone.Transport.seconds % ((Tone.Transport.loopEnd as number) - (Tone.Transport.loopStart as number))
		const adjustedProgress = adjustedSeconds / ((Tone.Transport.loopEnd as number) - (Tone.Transport.loopStart as number))

		return Math.floor(adjustedProgress * this.gridWidth)
	}
}

export default SynthInstrument
