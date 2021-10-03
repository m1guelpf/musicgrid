import { FC, useEffect, useState } from 'react'
import ToneGrid from '../components/ToneGrid'
import { VolumeOffIcon, VolumeUpIcon } from '@heroicons/react/solid'
import { useRouter } from 'next/dist/client/router'

const Home: FC = () => {
	const router = useRouter()
	const [seed, setSeed] = useState('')
	const [muted, setMuted] = useState<boolean>(false)

	useEffect(() => {
		if (!seed) {
			router.replace({ search: '' }, null, { shallow: true })
			return
		}

		router.replace({ search: new URLSearchParams({ s: seed }).toString() }, null, { shallow: true })
	}, [seed])

	return (
		<div className="bg-black">
			<div className="flex flex-col items-center justify-center space-y-8 min-h-screen max-w-xl mx-auto px-4 md:px-0">
				<div className="space-y-4 flex flex-col items-center">
					<h1 className="text-gray-400 font-thin text-4xl">ToneMatrix Redux</h1>
					<p className="text-gray-500 text-center">A pentatonic step sequencer. Click tiles and make music.</p>
				</div>
				<ToneGrid seed={seed} setSeed={setSeed} muted={muted} />
				<div className="flex flex-col md:flex-row items-center justify-between w-full space-y-4 md:space-y-0">
					<div className="flex items-center space-x-4">
						<button onClick={() => setMuted(muted => !muted)}>{muted ? <VolumeOffIcon className="w-6 h-6 text-gray-300" /> : <VolumeUpIcon className="w-6 h-6 text-gray-300" />}</button>
						<button className="bg-gray-800 py-1 px-2 text-gray-100 font-medium border border-gray-600 rounded-lg">Clear Notes</button>
					</div>
					<p className="text-gray-500 text-center md:text-left">
						Based on{' '}
						<a href="https://github.com/MaxLaumeister/ToneMatrixRedux" className="underline">
							ToneMatrixRedux
						</a>{' '}
						- By{' '}
						<a className="underline" href="https://twitter.com/m1guelpf">
							Miguel Piedrafita
						</a>
					</p>
				</div>
			</div>
		</div>
	)
}

export default Home
