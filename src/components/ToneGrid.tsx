import { CanvasHTMLAttributes, Dispatch, FC, MouseEvent, SetStateAction, TouchEvent, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import Grid from '../lib/Grid'
import Util from '../lib/Util'
import * as Tone from 'tone'
import { PlayIcon } from '@heroicons/react/solid'
import { colors } from '../data/colors'
import TriangleBg from './TriangleBg'

const GRID_SIZE = {
	WIDTH: 16,
	HEIGHT: 16,
}

const ToneGrid: FC<{ seed: string; setSeed: Dispatch<SetStateAction<string>>; muted: boolean } & CanvasHTMLAttributes<HTMLCanvasElement>> = ({ seed, setSeed, muted, ...props }) => {
	const canvasRef = useRef<HTMLCanvasElement>()
	const mousePos = useRef<{ x: number; y: number }>({ x: -1, y: -1 })
	const arming = useRef<boolean>(null)
	const [needsPreloader, setNeedsPreloader] = useState<boolean>(false)
	const [grid, setGrid] = useState<Grid>(null)
	useLayoutEffect(() => {
		setGrid(new Grid(GRID_SIZE.WIDTH, GRID_SIZE.HEIGHT, canvasRef.current))
	}, [])

	useEffect(() => {
		if (!grid) return

		grid.setMuted(muted)
	}, [grid, muted])

	useLayoutEffect(() => {
		if (!grid) return

		const initSeed = new URLSearchParams(window.location.search).get('s')
		if (initSeed) {
			setNeedsPreloader(true)
			grid.unserialize(initSeed)
			setSeed(initSeed)
		}

		const canvas = canvasRef.current
		const rect = canvas.getBoundingClientRect()

		const dpr = window.devicePixelRatio || 1
		canvas.height = rect.height * dpr
		canvas.width = rect.height * (GRID_SIZE.WIDTH / GRID_SIZE.HEIGHT) * dpr

		Tone.Transport.loopEnd = '1m' // loop at one measure
		Tone.Transport.loop = true
		Tone.Transport.start()

		// Kick off game loop
		function updateContinuous() {
			generateFrame()
			requestAnimationFrame(updateContinuous)
		}

		requestAnimationFrame(updateContinuous)
	}, [grid])

	const generateFrame = () => grid.update(mousePos.current.x, mousePos.current.y)

	const updateCanvasMousePosition = (e: { clientX: number; clientY: number }): void => {
		const currentRect = canvasRef.current.getBoundingClientRect() // abs. size of element
		const scaleX = canvasRef.current.width / currentRect.width // relationship bitmap vs. element for X
		const scaleY = canvasRef.current.height / currentRect.height // relationship bitmap vs. element for Y

		const x = (e.clientX - currentRect.left) * scaleX
		const y = (e.clientY - currentRect.top) * scaleY

		mousePos.current = { x, y }
	}

	const canvasClick = () => {
		const tile = Util.pixelCoordsToTileCoords(mousePos.current.x, mousePos.current.y, GRID_SIZE.WIDTH, GRID_SIZE.HEIGHT, canvasRef.current.width, canvasRef.current.height) as { x: number; y: number }
		if (arming.current === null) arming.current = !grid.getTileValue(tile.x, tile.y)

		grid.setTileValue(tile.x, tile.y, arming.current)
		setSeed(grid.serialize())

		Tone.context.resume()
	}

	const canvasMouseMove = (event: MouseEvent) => {
		updateCanvasMousePosition(event)

		if (event.buttons !== 1) return // Only if left button is held

		canvasClick()
	}

	const canvasMouseDown = (event: MouseEvent) => {
		updateCanvasMousePosition(event)

		arming.current = null

		canvasClick()
	}

	const canvasTouchStart = (e: TouchEvent) => {
		if (e.touches.length === 1) arming.current = null

		Array.from(e.touches).forEach((touch: Touch) => {
			updateCanvasMousePosition(touch)

			canvasClick()
		})
	}

	const canvasTouchMove = (e: TouchEvent) => {
		Array.from(e.touches).forEach(touch => {
			updateCanvasMousePosition(touch)

			canvasClick()
		})
	}

	const startPlaying = () => {
		Tone.context.resume()

		setNeedsPreloader(false)
	}

	return (
		<div className="relative">
			{needsPreloader && (
				<button onClick={startPlaying} className="bg-gray-500 bg-opacity-50 backdrop-filter backdrop-blur-sm absolute inset-0 w-full flex items-center justify-center">
					<PlayIcon className="w-32 h-32 text-white filter drop-shadow-xl" />
				</button>
			)}
			<canvas className="h-[300px] md:h-[500px] w-auto cursor-pointer" width="1000" height="1000" ref={canvasRef} onMouseMove={canvasMouseMove} onMouseDown={canvasMouseDown} onMouseLeave={() => (mousePos.current = { x: -1, y: -1 })} onTouchStart={canvasTouchStart} onTouchEnd={() => (mousePos.current = { x: -1, y: -1 })} onTouchMove={canvasTouchMove} {...props} />
		</div>
	)
}

export default ToneGrid
