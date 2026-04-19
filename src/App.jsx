import {
  ActionButton,
  Button,
  Item,
  Menu,
  MenuTrigger,
  Slider,
} from "@adobe/react-spectrum";
import "./App.css";
import React, { useEffect, useRef, useState } from "react";

function App() {
  const inputRef = useRef(null);
  const hdrInputRef = useRef(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const drawImageRef = useRef(() => {});
  const exportBoundsRef = useRef(null);
  const panOffsetRef = useRef({ x: 0, y: 0 });
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });

  const [file, setFile] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const [isHdrMode, setIsHdrMode] = useState(false);
  const [hdrFiles, setHdrFiles] = useState([]);
  const [hdrPreviewUrls, setHdrPreviewUrls] = useState([]);

  const isdisabled = !file;
  const MIN_ZOOM = 50;
  const MAX_ZOOM = 400;
  const MAX_HDR_FILES = 10;
  const MIN_HDR_FILES = 2;
  const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

  const clampZoom = (value) => {
    return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
  };

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

    if (!ALLOWED_IMAGE_TYPES.includes(selectedFile.type)) {
      console.log("Unsupported file type:", selectedFile.type);
      return;
    }

    panOffsetRef.current = { x: 0, y: 0 };
    setIsDragging(false);
    setZoom(100);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setHdrFiles([]);
    setIsHdrMode(false);
    setFile(selectedFile);
     if (inputRef.current) {
      console.log(inputRef.current.value);
    inputRef.current.value = "";
  }
  };

  const handleHdrFileSubmit = () => {
    const selectedFiles = Array.from(hdrInputRef.current?.files ?? []);

    if (!selectedFiles.length) return;

    const hasUnsupportedFile = selectedFiles.some(
      (selectedFile) => !ALLOWED_IMAGE_TYPES.includes(selectedFile.type),
    );

    if (hasUnsupportedFile) {
      console.log("One or more HDR files have an unsupported file type.");
      return;
    }

    setHdrFiles((currentFiles) => {
      if (currentFiles.length + selectedFiles.length > MAX_HDR_FILES) {
        console.log(`You can upload a maximum of ${MAX_HDR_FILES} HDR images.`);
        return currentFiles;
      }

      const nextFiles = [...currentFiles, ...selectedFiles];
      setIsHdrMode(nextFiles.length > 0);
      return nextFiles;
    });
setFile(null); 
resetAdjustments();
    if (hdrInputRef.current) {
      hdrInputRef.current.value = "";
    }
  };

  const handleRemoveHdrFile = (indexToRemove) => {
    setHdrFiles((currentFiles) => {
      const nextFiles = currentFiles.filter(
        (_, index) => index !== indexToRemove,
      );

      setIsHdrMode(nextFiles.length > 0);
      return nextFiles;
    });
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
    const nextPreviewUrls = hdrFiles.map((hdrFile) =>
      URL.createObjectURL(hdrFile),
    );

    setHdrPreviewUrls(nextPreviewUrls);

    return () => {
      nextPreviewUrls.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
    };
  }, [hdrFiles]);

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
      const drawnWidth = baseWidth * scale;
      const drawnHeight = baseHeight * scale;
      const drawnX = canvas.width / 2 + panX - drawnWidth / 2;
      const drawnY = canvas.height / 2 + panY - drawnHeight / 2;

      panOffsetRef.current = clampedPanOffset;
      exportBoundsRef.current = {
        x: drawnX,
        y: drawnY,
        width: drawnWidth,
        height: drawnHeight,
      };

      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";

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

  const handleCanvasWheel = (event) => {
    if (!file) return;

    event.preventDefault();

    const zoomStep = event.deltaY < 0 ? 10 : -10;
    setZoom((currentZoom) => clampZoom(currentZoom + zoomStep));
  };

  const handleExport = (format) => {
    const canvas = canvasRef.current;
    const bounds = exportBoundsRef.current;

    if (!canvas || !bounds) return;

    const cropX = Math.max(0, Math.floor(bounds.x));
    const cropY = Math.max(0, Math.floor(bounds.y));
    const cropWidth = Math.min(
      canvas.width - cropX,
      Math.ceil(bounds.width + Math.min(0, bounds.x)),
    );
    const cropHeight = Math.min(
      canvas.height - cropY,
      Math.ceil(bounds.height + Math.min(0, bounds.y)),
    );

    if (cropWidth <= 0 || cropHeight <= 0) return;

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = cropWidth;
    tempCanvas.height = cropHeight;

    const tempContext = tempCanvas.getContext("2d");

    if (!tempContext) return;

    tempContext.drawImage(
      canvas,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight,
    );

    const mimeType = format === "jpeg" ? "image/jpeg" : "image/png";

    tempCanvas.toBlob((blob) => {
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lux-fusion.${format}`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(url);
    }, mimeType);
  };

  return (
    <div className="flex h-screen flex-col bg-slate-950 text-white">
      <input
        ref={inputRef}
        type="file"
        onChange={handleFileSubmit}
        accept="image/jpeg, image/png, image/webp"
        className="hidden"
      />

      <input
        ref={hdrInputRef}
        type="file"
        onChange={handleHdrFileSubmit}
        multiple
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
              inputRef.current?.click();
            }}
            variant="cta"
          >
            Import
          </Button>
          <MenuTrigger>
            <ActionButton isDisabled={!file}>Export</ActionButton>
            <Menu onAction={handleExport}>
              <Item key="png">As PNG</Item>
              <Item key="jpeg">As JPEG</Item>
            </Menu>
          </MenuTrigger>
          <Button
            onPress={() => {
              hdrInputRef.current?.click();
            }}
            variant="accent"
          >
            HDR Merge
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <div className="flex flex-1 items-center justify-center bg-slate-900">
          {file ? (
            <canvas
              ref={canvasRef}
              onMouseDown={handleCanvasMouseDown}
              onWheel={handleCanvasWheel}
              className={`h-[80%] w-[80%] ${
                isDragging ? "cursor-grabbing" : "cursor-grab"
              }`}
            ></canvas>
          ) : (
            <p className="text-xl text-slate-300 text-extrabold">
              {isHdrMode
                ? `Click on Merge to create an HDR image and view the result here`
                : "Import an image to start editing"}
            </p>
          )}
        </div>

        {isHdrMode ? (
          <div className="right-panel flex w-[23%] min-w-75 flex-col border-l border-amber-200/10 bg-slate-950 p-4 text-slate-50 shadow-2xl">
            <div className="flex w-full flex-1 flex-col gap-4 overflow-hidden">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl text-center font-semibold text-amber-50">
                  HDR Merge
                </h2>
                <p className="text-sm text-slate-400">
                  {hdrFiles.length}/{MAX_HDR_FILES}
                </p>
              </div>

              <div className="flex justify-around">
                 <Button
                  onPress={() => {}}
                  variant="cta"
                  width="40%"
                  isDisabled={hdrFiles.length < 2}
                >
                  Merge
                </Button>
                <Button
                  onPress={() =>{ 
                    setIsHdrMode(false);
                    setHdrFiles([])}}
                  variant="negative"
                  width="40%"
                  isDisabled={hdrFiles.length === 0}
                >
                  Clear All
                </Button> 
              </div>

              <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-1">
                {hdrPreviewUrls.map((previewUrl, index) => (
                  <div
                    key={`${hdrFiles[index]?.name ?? "hdr-file"}-${index}`}
                    className="group relative  rounded-xl border border-slate-700/80 bg-slate-900/90"
                  >
                    <img
                      src={previewUrl}
                      alt={`HDR preview ${index + 1}`}
                      className="aspect-square h-full w-full object-cover transition duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveHdrFile(index)}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/80 text-sm font-semibold text-white opacity-0 transition hover:bg-rose-600 group-hover:opacity-100"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
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
                minValue={MIN_ZOOM}
                maxValue={MAX_ZOOM}
                defaultValue={100}
                isDisabled={isdisabled}
                isFilled
                value={zoom}
                onChange={setZoom}
                width="80%"
                getValueLabel={(value) => `${value}%`}
              />

              <div className="mt-2 flex w-full flex-col gap-2">
                <p className="text-md text-slate-300">
                  * Use mouse scroll wheel to zoom in/out
                </p>
                <p className="text-md text-slate-300">
                  * Click and hold over image to pan around
                </p>
                 <p className="text-md text-slate-300">
                  * Image will be exported as it is shown in the preview
                </p>
              </div>
            </div>

            <Button onPress={resetAdjustments}>Reset Changes</Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
