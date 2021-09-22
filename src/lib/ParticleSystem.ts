export const PARTICLE_POOL_SIZE = 2000
export const PARTICLE_LIFETIME = 40
export const MAX_PARTICLE_BRIGHTNESS = 0.05

class ParticleSystem {
	width: number
	height: number
	oldestParticle: number
	lastUpdate: number
	particles: Array<{ x?: number; y?: number; vx?: number; vy?: number; life?: number }>

	constructor(width: number, height: number) {
		this.width = width
		this.height = height

		this.oldestParticle = 0
		this.lastUpdate = 0

		this.particles = [...new Array(PARTICLE_POOL_SIZE)].map(() => ({}))
	}

	/**
	 * Updates all particle positions based on their current position, velocity, and the amount of time that's passed.
	 */
	update(): void {
		if (this.lastUpdate === 0) {
			this.lastUpdate = Date.now()

			return
		}

		const now = Date.now()
		const deltaTime = (now - this.lastUpdate) / 16.67 // 60fps is a time factor of 1

		for (let i = 0; i < PARTICLE_POOL_SIZE; i += 1) {
			const p = this.particles[i]
			if (p.life <= 0) continue

			const pvx = p.vx * deltaTime
			const pvy = p.vy * deltaTime
			p.x += pvx

			if (p.x > this.width || p.x < 0) {
				// x overflow/underflow
				p.vx = -p.vx
				p.x += pvx
			}

			p.y += pvy

			if (p.y > this.height || p.y < 0) {
				// y overflow/underflow
				p.vy = -p.vy
				p.y += pvy
			}

			p.life -= deltaTime
		}

		this.lastUpdate = now
	}

	createParticle(x: number, y: number, vx: number, vy: number): void {
		this.particles[this.oldestParticle] = { x, y, vx, vy, life: PARTICLE_LIFETIME }
		this.oldestParticle += 1

		if (this.oldestParticle >= PARTICLE_POOL_SIZE) this.oldestParticle = 0
	}

	createParticleBurst(x: number, y: number, v: number, n: number): void {
		const randomOffset = Math.random() * 2 * Math.PI

		for (let j = 0; j < 2 * Math.PI; j += (2 * Math.PI) / n) this.createParticle(x, y, Math.cos(j + randomOffset) * v, Math.sin(j + randomOffset) * v)
	}
}

export default ParticleSystem
