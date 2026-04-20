
async function processFilesToMatVector(files) {
  const matVector = new cv.MatVector();


  // 1. Load all images first
  const getImg = (file) => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });

  const imgs = await Promise.all(Array.from(files).map(getImg));
  const baseSize = new cv.Size(imgs[0].naturalWidth || imgs[0].width, imgs[0].naturalHeight || imgs[0].height);

  for (const img of imgs) {
    const mat = cv.imread(img);
    const resizedMat = new cv.Mat();

    // 2. Ensure all images have the exact same dimensions
    if (mat.cols !== baseSize.width || mat.rows !== baseSize.height) {
      cv.resize(mat, resizedMat, baseSize);
    } else {
      mat.copyTo(resizedMat);
    }

    // 3. Convert from RGBA (imread default) to RGB. MergeMertens fails with 4-channel images.
    const rgbMat = new cv.Mat();
    cv.cvtColor(resizedMat, rgbMat, cv.COLOR_RGBA2RGB);
    
    matVector.push_back(rgbMat);
    
    mat.delete();
    resizedMat.delete();
    URL.revokeObjectURL(img.src);
  }

  return matVector;
}

export const handleHDRMerge = async (files) => {

  if (files.length < 2) return alert("Select at least 2 images!");

  try {  
    const srcImages = await processFilesToMatVector(files);


    const mergeMertens = new cv.MergeMertens();
    const fusion = new cv.Mat();
    const times = new cv.Mat();
    const response = new cv.Mat();

  
    mergeMertens.process(srcImages, fusion, times, response);

    
    const finalOutput = new cv.Mat();
    fusion.convertTo(finalOutput, cv.CV_8U, 255);

    const canvas = document.createElement("canvas");
    cv.imshow(canvas, finalOutput);

    const mergedFile = await new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(new File([blob], "lux-fusion-hdr.jpg", { type: "image/jpeg", lastModified: Date.now() }));
        } else {
          reject(new Error("Failed to create blob from canvas"));
        }
      }, "image/jpeg", 0.95);
    });

   
    srcImages.delete();
    mergeMertens.delete();
    fusion.delete();
    times.delete();
    response.delete();
    finalOutput.delete();

    return mergedFile;
  } catch (err) {
      console.error("Error during HDR merge:", err);
  }
};
