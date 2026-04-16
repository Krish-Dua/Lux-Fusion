import { Button, Slider, Switch } from '@adobe/react-spectrum'
import './App.css'
import React,{useRef} from 'react'
function App() {
  const inputRef = useRef(null)
  return (
    <div className="h-screen flex flex-col bg-slate-950 text-white">
      <input ref={inputRef} type="file" accept="image/jpeg, image/png, image/webp" className='hidden' />
      <div className="flex items-center justify-between px-10">
        <h1 className="bg-gradient-to-r from-sky-300 via-blue-400 to-blue-800 bg-clip-text text-3xl font-bold tracking-wide text-transparent">
          Lux Fusion
        </h1>
        <div className="top-controls flex gap-4 border-b border-amber-200/10 bg-slate-950 p-4 backdrop-blur-xl shadow-lg">
          <Button onPress={()=>{inputRef.current.click()}} variant="cta">Import</Button>
          <Button>Export</Button>
          <Button variant="accent">HDR Merge</Button>
          <Switch isEmphasized>Show Original</Switch>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="flex flex-1 items-center justify-center bg-slate-900">
          
          <p className="text-slate-300  text-extrabold text-xl ">Import an Image to view it here </p>
        </div>

        <div className="right-panel flex w-[350px] flex-col items-center justify-between space-y-6 border-l border-amber-200/10 bg-slate-950 p-4 text-slate-50 shadow-2xl">
          <div className="flex flex-col items-center gap-8">
            <h2 className="text-center text-2xl font-semibold text-amber-50">Adjustments</h2>

            <Slider
              label="Brightness"
              minValue={0}
              maxValue={200}
              defaultValue={100}
              isFilled
              getValueLabel={(value) => `${value}%`}
            />

            <Slider
              label="Contrast"
              minValue={0}
              maxValue={200}
              defaultValue={100}
              isFilled
              getValueLabel={(value) => `${value}%`}
            />

            <Slider
              label="Zoom"
              minValue={0}
              maxValue={200}
              defaultValue={100}
              isFilled
              getValueLabel={(value) => `${value}%`}
            />
          </div>

          <Button>Reset Changes</Button>
        </div>
      </div>
    </div>
  )
}

export default App
