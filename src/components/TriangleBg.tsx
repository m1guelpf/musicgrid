import { FC, memo, useMemo } from 'react'
import trianglify from 'trianglify'
import { colors } from '../data/colors'
import Util from '../lib/Util'

const TriangleBg: FC<{ width: number; height: number; className?: string }> = ({ width, height, className = '' }) => {
	const randColors = useMemo(() => Util.arrayRandom(colors, Util.randomBetween(2, colors.length)), [])
	const triangle = trianglify({ width, height, xColors: randColors, yColors: randColors }).toSVGTree()

	return (
		<svg className={className} {...triangle.attrs}>
			{triangle.children.map((path, i) => (
				<path key={i} {...path.attrs} />
			))}
		</svg>
	)
}

export default memo(TriangleBg)
