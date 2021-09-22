class Tile {
	notes: number[]
	numberOfNotes: number

	constructor() {
		this.notes = []
		this.numberOfNotes = 0
	}

	isEmpty(): boolean {
		return this.numberOfNotes === 0
	}

	getNote(i: number): number {
		return this.notes[i]
	}

	hasNote(i: number): boolean {
		return typeof this.notes[i] !== 'undefined'
	}

	addNote(i: number, noteId: number): void {
		this.notes[i] = noteId
		this.numberOfNotes += 1
	}

	removeNote(i: number): void {
		delete this.notes[i]
		this.numberOfNotes -= 1
	}

	removeAllNotes(): void {
		this.notes = []
		this.numberOfNotes = 0
	}
}

export default Tile
