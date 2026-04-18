import { Button, Slider } from "@adobe/react-spectrum";
import "./App.css";
import React, { useEffect, useRef, useState } from "react";

function App() {
  const inputRef = useRef(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const drawImageRef = useRef(() => {});
  const panOffsetRef = useRef({ x: 0, y: 0 });
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });
  const [file, setFile] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const isdisabled = !file;

  const getClampedPanOffset = (nextOffset, canvas, img, currentZoom) => {
    if (!canvas || !img) return nextOffset;

    const fitScale = Math.min(
      canvas.width / img.width,
      canvas.height / img.height,
    );
    const scaledWidth = img.width * fitScale * (currentZoom / 100);
    const scaledHeight = img.height * fitScale * (currentZoom / 100);
    const maxPanX = Math.max(0, (scaledWidth - canvas.width) / 2);
    const maxPanY = Math.max(0, (scaledHeight - canvas.height) / 2);

    return {
      x: Math.min(maxPanX, Math.max(-maxPanX, nextOffset.x)),
      y: Math.min(maxPanY, Math.max(-maxPanY, nextOffset.y)),
    };
  };

  const resetAdjustments = () => {
    panOffsetRef.current = { x: 0, y: 0 };
    setZoom(100);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    drawImageRef.current();
  };

  const handleFileSubmit = () => {
    const selectedFile = inputRef.current?.files?.[0];

    if (!selectedFile) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(selectedFile.type)) {
      console.log("Unsupported file type:", selectedFile.type);
      return;
    }

    panOffsetRef.current = { x: 0, y: 0 };
    setIsDragging(false);
    setZoom(100);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setFile(selectedFile);
  };

  useEffect(() => {
    if (!file) {
      imageRef.current = null;
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      imageRef.current = img;
      panOffsetRef.current = { x: 0, y: 0 };
      drawImageRef.current();
    };

    img.src = objectUrl;

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  useEffect(() => {
    const drawImage = () => {
      const canvas = canvasRef.current;
      const img = imageRef.current;

      if (!canvas || !img) return;

      const context = canvas.getContext("2d");

      if (!context) return;

      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;

      const fitScale = Math.min(
        canvas.width / img.width,
        canvas.height / img.height,
      );
      const baseWidth = img.width * fitScale;
      const baseHeight = img.height * fitScale;
      const scale = zoom / 100;
      const clampedPanOffset = getClampedPanOffset(
        panOffsetRef.current,
        canvas,
        img,
        zoom,
      );
      const { x: panX, y: panY } = clampedPanOffset;

      panOffsetRef.current = clampedPanOffset;

      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";

      // Draw from canvas center so zoom and panning share one transform system.
      context.setTransform(
        scale,
        0,
        0,
        scale,
        canvas.width / 2 + panX,
        canvas.height / 2 + panY,
      );
      context.drawImage(
        img,
        -baseWidth / 2,
        -baseHeight / 2,
        baseWidth,
        baseHeight,
      );
    };

    drawImageRef.current = drawImage;
    drawImage();

    window.addEventListener("resize", drawImage);

    return () => {
      window.removeEventListener("resize", drawImage);
    };
  }, [file, zoom, brightness, contrast, saturation]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (event) => {
      const canvas = canvasRef.current;
      const img = imageRef.current;
      const deltaX = event.clientX - dragStartRef.current.x;
      const deltaY = event.clientY - dragStartRef.current.y;

      panOffsetRef.current = getClampedPanOffset(
        {
          x: panStartRef.current.x + deltaX,
          y: panStartRef.current.y + deltaY,
        },
        canvas,
        img,
        zoom,
      );

      drawImageRef.current();
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, zoom]);

  const handleCanvasMouseDown = (event) => {
    if (!file) return;

    event.preventDefault();
    dragStartRef.current = { x: event.clientX, y: event.clientY };
    panStartRef.current = { ...panOffsetRef.current };
    setIsDragging(true);
  };

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

        <div className="top-controls flex gap-4 border-b border-amber-200/10 bg-slate-950 p-4 shadow-lg backdrop-blur-xl">
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
            <canvas
              ref={canvasRef}
              onMouseDown={handleCanvasMouseDown}
              className={`h-[80%] w-[80%] ${
                isDragging ? "cursor-grabbing" : "cursor-grab"
              }`}
            ></canvas>
          ) : (
            <p className="text-slate-300 text-extrabold text-xl">
              Import an Image to view it here{" "}
            </p>
          )}
        </div>

        <div className="right-panel flex w-[23%] min-w-75 flex-col items-center justify-between space-y-6 border-l border-amber-200/10 bg-slate-950 p-4 text-slate-50 shadow-2xl">
          <div className="flex w-full flex-col items-center gap-6">
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
              maxValue={400}
              defaultValue={100}
              isDisabled={isdisabled}
              isFilled
              value={zoom}
              onChange={setZoom}
              width="80%"
              getValueLabel={(value) => `${value}%`}
            />
          </div>

          <Button onPress={resetAdjustments}>Reset Changes</Button>
        </div>
      </div>
    </div>
  );
}

export default App;
