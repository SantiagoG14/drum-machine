import { useEffect, useRef, useState } from "react"
import { useImmer } from "use-immer"

const SOURCES = [
  { src: "Heater-1.mp3", key: "q", display: "heater 1" },
  { src: "Heater-2.mp3", key: "w", display: "heater 2" },
  { src: "Heater-3.mp3", key: "e", display: "heater 3" },
  { src: "Heater-4_1.mp3", key: "a", display: "heater 4" },
  { src: "Heater-6.mp3", key: "s", display: "clap" },
  { src: "Dsc_Oh.mp3", key: "d", display: "open HH" },
  { src: "Kick_n_Hat.mp3", key: "z", display: "kick n' Hat" },
  { src: "RP4_KICK_1.mp3", key: "x", display: "kick" },
  { src: "Cev_H2.mp3", key: "c", display: "closed HH" },
]

type SoundType = {
  sound: string
  key: string
  playing: boolean
  display: string
}

type PlayButtonType = {
  children: string
  sound: SoundType
  position: number
  handlePlay: (sound: SoundType, position: number) => void
}

function App() {
  const [sounds, setSounds] = useImmer(
    SOURCES.map(({ src, key, display }) => {
      return {
        sound: `https://s3.amazonaws.com/freecodecamp/drums/${src}`,
        key: key,
        playing: false,
        display: display,
      }
    })
  )

  const [display, setDisplay] = useState("")

  const drumMachineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    window.addEventListener("keypress", handleKeydown, {})
    window.addEventListener("keyup", handleKeyUp)
    return () => {
      window.removeEventListener("keypress", handleKeydown)
    }
  }, [])

  function handleKeyUp(e: KeyboardEvent) {
    if (sounds.some((sound) => sound.key === e.key)) {
      setSounds((draft) => {
        const soundState = draft.find((el) => el.key === e.key)
        if (soundState === undefined) {
          throw new TypeError("there should be a key for this sound")
        }
        soundState.playing = false
      })
    }
  }

  function handlePlay(sound: SoundType, position: number) {
    const audio = drumMachineRef.current?.children[position]
      .children[0] as HTMLAudioElement
    audio.pause()

    audio.currentTime = 0
    audio.play()
    setDisplay(sound.display)
    setSounds((draft) => {
      const soundState = draft.find((el) => el.key === sound.key)
      if (soundState === undefined) {
        throw new TypeError("there should be a key for this sound")
      }
      soundState.playing = true
    })
  }
  function handleKeydown(e: KeyboardEvent) {
    e.preventDefault()
    if (sounds.some((sound) => sound.key === e.key.toLocaleLowerCase())) {
      const sound = sounds.find((el) => el.key === e.key.toLocaleLowerCase())
      const index = sounds.findIndex(
        (el) => el.key === e.key.toLocaleLowerCase()
      )
      if (sound === undefined) {
        throw new TypeError("The value was promised to always be there!")
      }
      if (!sound.playing) {
        handlePlay(sound, index)
      }
    }
  }

  return (
    <div className="App h-screen ">
      <div className=" flex h-full justify-center items-center ">
        <div className="w-full max-w-xl p-10 flex justify-between bg-gray-500 items-center rounded-md">
          <div
            className=" max-w-sm grid grid-cols-3 gap-4 flex-1 h-72 uppercase text-yellow-50 font-medium justify-center"
            id="drum-machine"
            ref={drumMachineRef}
          >
            {sounds.map((sound, index) => (
              <PlayButton
                sound={sound}
                position={index}
                handlePlay={handlePlay}
                key={sound.key}
              >
                {sound.key}
              </PlayButton>
            ))}
          </div>

          <div
            className=" capitalize ml-10 bg-slate-500 p-4 text-gray-100 w-32 text-center"
            id="display"
          >
            {display}
          </div>
        </div>
      </div>
    </div>
  )
}

function PlayButton({ sound, children, handlePlay, position }: PlayButtonType) {
  return (
    <div
      onClick={() => handlePlay(sound, position)}
      className={`p-6 text-center rounded-sm transition-colors duration-100  ${
        sound.playing ? "bg-gray-200" : "bg-gray-400 shadow-lg"
      } text-gray-800 drum-pad`}
      id={sound.display}
    >
      <audio
        src={sound.sound}
        className="clip"
        id={sound.key.toUpperCase()}
      ></audio>
      {children}
    </div>
  )
}

export default App
