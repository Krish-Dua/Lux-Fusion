import { Button, Slider, Switch } from "@adobe/react-spectrum";
import "./App.css";
import React, { useEffect, useRef, useState } from "react";
function App() {
  const inputRef = useRef(null);
  const canvasRef = useRef(null);
  const [file, setFile] = useState(null);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);

  const isdisabled = !file;

  const handleFileSubmit = () => {
    const selectedFile = inputRef.current?.files?.[0];

    if (!selectedFile) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(selectedFile.type)) {
      console.log("Unsupported file type:", selectedFile.type);
      return;
    }
     setBrightness(100);
  setContrast(100);
  setSaturation(100);


    setFile(selectedFile);
  };

  useEffect(() => {
    if (!file || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const draw = () => {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        const scale = Math.min(
          canvas.width / img.width,
          canvas.height / img.height,
        );
         context.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

        const newWidth = img.width * scale;
        const newHeight = img.height * scale;

        const x = (canvas.width - newWidth) / 2;
        const y = (canvas.height - newHeight) / 2;

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, x, y, newWidth, newHeight);
      };

      draw();

      const handleResize = () => {
        draw();
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        URL.revokeObjectURL(objectUrl);
      };
    };

    img.src = objectUrl;
  }, [file,brightness,contrast,saturation]);

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-white">
      <input
        ref={inputRef}
        type="file"
        onChange={handleFileSubmit}
        accept="image/jpeg, image/png, image/webp"
        className="hidden"
      />
      <div className="flex items-center justify-between px-10">
        <h1 className="bg-linear-to-r from-sky-300 via-blue-400 to-blue-800 bg-clip-text text-3xl font-bold tracking-wide text-transparent">
          Lux Fusion
        </h1>
        <div className="top-controls flex gap-4 border-b border-amber-200/10 bg-slate-950 p-4 backdrop-blur-xl shadow-lg">
          <Button
            onPress={() => {
              inputRef.current.click();
            }}
            variant="cta"
          >
            Import
          </Button>
          <Button>Export</Button>
          <Button variant="accent">HDR Merge</Button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="flex flex-1 items-center justify-center bg-slate-900">
          {file ? (
            <canvas ref={canvasRef} className="w-[80%] h-[80%]"></canvas>
          ) : (
            <p className="text-slate-300  text-extrabold text-xl ">
              Import an Image to view it here{" "}
            </p>
          )}
        </div>

        <div className="right-panel flex w-[23%] min-w-75 flex-col items-center justify-between space-y-6 border-l border-amber-200/10 bg-slate-950 p-4 text-slate-50 shadow-2xl">
          <div className="flex flex-col items-center w-full gap-6">
            <h2 className="text-center text-2xl font-semibold text-amber-50">
              Adjustments
            </h2>

            <Slider
              label="Brightness"
              minValue={0}
              maxValue={200}
              defaultValue={100}
              isDisabled={isdisabled}
              isFilled
              value={brightness}
              onChange={setBrightness}
              width="80%"
              getValueLabel={(value) => `${value}%`}
            />

            <Slider
              label="Contrast"
              minValue={0}
              maxValue={200}
              defaultValue={100}
              isDisabled={isdisabled}
              value={contrast}
              onChange={setContrast}
              isFilled
              width="80%"
              getValueLabel={(value) => `${value}%`}
            />
              <Slider
              label="Saturation"
              minValue={0}
              maxValue={200}
              defaultValue={100}
              isDisabled={isdisabled}
              value={saturation}
              onChange={setSaturation}
              isFilled
              width="80%"
              getValueLabel={(value) => `${value}%`}
            />


            <Slider
              label="Zoom"
              minValue={50}
              isDisabled={isdisabled}
              maxValue={300}
              defaultValue={100}
              isFilled
              width="80%"
              getValueLabel={(value) => `${value}%`}
            />

          </div>

          <Button onPress={()=>{
            setBrightness(100)
            setContrast(100)
            setSaturation(100)
          }}>Reset Changes</Button>
        </div>
      </div>
    </div>
  );
}
export default App;
