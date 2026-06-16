const appShell = document.querySelector(".app-shell");
const homeView = document.querySelector(".view-home");
const beginButton = document.querySelector("#beginButton");
const archiveButton = document.querySelector("#archiveButton");
const formatButtons = document.querySelectorAll("[data-format-choice]");
const singleFormatCanvas = document.querySelector("#singleFormatCanvas");
const stripFormatCanvas = document.querySelector("#stripFormatCanvas");
const sourceButton = document.querySelector("#sourceButton");
const changeCameraButton = document.querySelector("#changeCameraButton");
const applyCameraButton = document.querySelector("#applyCameraButton");
const cameraDialog = document.querySelector("#cameraDialog");
const cameraSelect = document.querySelector("#cameraSelect");
const cameraStage = document.querySelector("#cameraStage");
const cameraPreviewCanvas = document.querySelector("#cameraPreviewCanvas");
const cameraVideo = document.querySelector("#cameraVideo");
const cameraFallback = document.querySelector("#cameraFallback");
const captureCanvas = document.querySelector("#captureCanvas");
const countdown = document.querySelector("#countdown");
const captureButton = document.querySelector("#captureButton");
const reviewTitle = document.querySelector("#review-title");
const reviewImage = document.querySelector("#reviewImage");
const reviewGallery = document.querySelector("#reviewGallery");
const retakeButton = document.querySelector("#retakeButton");
const toneNextButton = document.querySelector("#toneNextButton");
const toneCanvas = document.querySelector("#toneCanvas");
const toneControls = document.querySelector("#toneControls");
const paperNextButton = document.querySelector("#paperNextButton");
const paperCanvas = document.querySelector("#paperCanvas");
const paperControls = document.querySelector("#paperControls");
const finalNextButton = document.querySelector("#finalNextButton");
const finalTitle = document.querySelector("#final-title");
const finalCanvas = document.querySelector("#finalCanvas");
const finalGifPreview = document.querySelector("#finalGifPreview");
const finalFocus = document.querySelector(".final-focus");
const qrCanvas = document.querySelector("#qrCanvas");
const qrStatus = document.querySelector("#qrStatus");
const exportButton = document.querySelector("#exportButton");
const airdropButton = document.querySelector("#airdropButton");
const gifButton = document.querySelector("#gifButton");
const startAgainButton = document.querySelector("#startAgainButton");
const scanBackButton = document.querySelector("#scanBackButton");
const scanStartAgainButton = document.querySelector("#scanStartAgainButton");
const archiveGrid = document.querySelector("#archiveGrid");
const archivePreviewImage = document.querySelector("#archivePreviewImage");
const archiveEmpty = document.querySelector("#archiveEmpty");
const archiveRefreshButton = document.querySelector("#archiveRefreshButton");
const archiveBackButton = document.querySelector("#archiveBackButton");

const portraitSize = { width: 1600, height: 2400 };
const singleFrameSize = { width: 1600, height: 2000 };
const stripFrameSize = { width: 1600, height: 1200 };
const stripSize = { width: 1200, height: 3600 };
const tonePreviewSize = { width: 360, height: 1080 };
const paperPreviewSize = { width: 360, height: 1080 };
const gifFrameSize = { width: 720, height: 540 };
const gifPaperSize = { width: 360, height: 1080 };
const singleGifFrameSize = { width: 480, height: 600 };
const singleGifPaperSize = { width: 600, height: 900 };
const maxExportScale = 2;
const maxExportCanvasArea = 16000000;
const finalImageQuality = 0.96;
const gifFrameDelayMs = 90;
const maxGifFrames = 24;
const stripGifSegmentDuration = 5;
const countdownVisibleMs = 820;
const countdownHiddenMs = 180;
const archiveStoreName = "sessions";
const cloudinaryCloudName = "dz2ajhfsm";
const cloudinaryUploadPreset = "marvell20_upload";
const cloudinaryUploadFolder = "marvell20";
const inactivityTimeoutMs = 7 * 60 * 1000;
const imageCache = new Map();
const previewCache = new Map();
let inactivityTimer = null;
let activeSessionRecord = null;
let archiveRecords = [];
let selectedArchiveId = "";
let gifEncoderModulePromise = null;
let cameraTapCount = 0;
let cameraTapTimer = null;

const tones = [
  { id: "natural", name: "Natural", filter: "contrast(1.02) saturate(0.96) sepia(0.025) brightness(1.02)" },
  { id: "archive", name: "Archive", filter: "grayscale(1) saturate(0) contrast(1.32) brightness(1.05)" },
];

const papers = [
  { id: "burgundy", name: "Burgundy Velvet", background: "#4f0718", ink: "#fff1d6", accent: "#e0bf78", margin: 112, assets: { single: "burgundy.png", strip: "stripburgundy.jpeg" } },
  { id: "noir", name: "Noir Satin", background: "#030303", ink: "#b12c2d", accent: "#b12c2d", margin: 112, safeTextStart: 0.792, assets: { single: "singleblack.png", strip: "stripblack.png" } },
  { id: "garden", name: "Garden Reverie", background: "#edf2df", ink: "#241c18", accent: "#9a7b49", margin: 112, safeTextStart: 0.792, assets: { single: "singlegarden.webp", strip: "stripgarden.png" } },
];
const paperImages = createPaperImages();

const state = {
  stream: null,
  devices: [],
  captures: [],
  selectedIndex: 0,
  retakeIndex: null,
  selectedTone: "",
  selectedPaper: "",
  selectedFormat: "strip",
  isCapturing: false,
  audioContext: null,
  sessionId: "",
  previewVersion: 0,
  selectedDeviceId: "",
  videoClipBlob: null,
  videoSegments: [],
  activeRecorder: null,
  cameraPreviewFrame: 0,
  isCameraPreviewing: false,
  finalPreviewTimer: 0,
  finalPreviewGifBlob: null,
  finalPreviewGifUrl: "",
  finalPreviewToken: 0,
};

function setView(view) {
  if (view !== "final") stopFinalPreviewLoop();
  appShell.dataset.view = view;
  document.documentElement.dataset.view = view;
  resetInactivityTimer();
}

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function setBusy(isBusy) {
  state.isCapturing = isBusy;
  captureButton.disabled = isBusy;
  changeCameraButton.disabled = isBusy;
  cameraStage.classList.toggle("is-capturing", isBusy);
}

async function beginSession() {
  resetSession();
  setView("format");
}

async function chooseFormat(format) {
  state.selectedFormat = format === "single" ? "single" : "strip";
  appShell.dataset.format = state.selectedFormat;
  document.documentElement.dataset.format = state.selectedFormat;
  syncCameraStageRatio();
  updateFormatUi();
  setView("camera");
  await startCamera();
}

function resetSession() {
  state.captures = [];
  state.selectedIndex = 0;
  state.retakeIndex = null;
  state.selectedTone = "";
  state.selectedPaper = "";
  state.selectedFormat = "strip";
  state.sessionId = "";
  activeSessionRecord = null;
  clearVideoClip();
  imageCache.clear();
  previewCache.clear();
  state.previewVersion += 1;
  appShell.dataset.format = state.selectedFormat;
  document.documentElement.dataset.format = state.selectedFormat;
  syncCameraStageRatio();
  exportButton.textContent = "High Quality";
  airdropButton.textContent = "AirDrop";
  gifButton.textContent = "GIF";
  qrStatus.textContent = "Preparing high-quality link...";
  qrCanvas.hidden = true;
  exportButton.disabled = false;
  airdropButton.disabled = false;
  gifButton.disabled = false;
  gifButton.hidden = false;
  updateFormatUi();
  updateStepButtons();
  renderAll().catch(() => {});
}

function updateFormatUi() {
  formatButtons.forEach((button) => {
    const isActive = button.dataset.formatChoice === state.selectedFormat;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  reviewTitle.textContent = state.selectedFormat === "single" ? "Review Your Photo" : "Review Your Strip";
  finalTitle.textContent = state.selectedFormat === "single" ? "Photo Ready" : "Strip Ready";
  exportButton.textContent = "High Quality";
  airdropButton.textContent = "AirDrop";
  gifButton.textContent = "GIF";
  gifButton.hidden = false;
  gifButton.disabled = false;
}

function getCaptureCount() {
  return state.selectedFormat === "single" ? 1 : 4;
}

function getCaptureFrameSize(format = state.selectedFormat) {
  return format === "single" ? singleFrameSize : stripFrameSize;
}

function getCaptureSize(format = state.selectedFormat) {
  return getCaptureFrameSize(format);
}

function getCaptureAspectRatio(format = state.selectedFormat) {
  const size = getCaptureFrameSize(format);
  return size.width / size.height;
}

function getOutputSize() {
  return state.selectedFormat === "single" ? portraitSize : stripSize;
}

function getFinalExportSize(format = state.selectedFormat) {
  const baseSize = format === "single" ? portraitSize : stripSize;
  const areaSafeScale = Math.sqrt(maxExportCanvasArea / (baseSize.width * baseSize.height));
  const ratio = Math.max(1, Math.min(window.devicePixelRatio || 1, maxExportScale, areaSafeScale));
  return {
    width: Math.round(baseSize.width * ratio),
    height: Math.round(baseSize.height * ratio),
  };
}

function syncCameraStageRatio() {
  const size = getCaptureFrameSize();
  const ratio = `${size.width} / ${size.height}`;
  cameraStage.style.aspectRatio = ratio;
  appShell.style.setProperty("--camera-frame-ratio", ratio);
}

function setHighQualityCanvas(context) {
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
}

async function startCamera(deviceId = state.selectedDeviceId) {
  stopCamera();

  if (!navigator.mediaDevices?.getUserMedia) {
    showCameraFallback();
    return;
  }

  const captureSize = getCaptureSize();
  const constraints = {
    audio: false,
    video: {
      width: { ideal: captureSize.width },
      height: { ideal: captureSize.height },
      aspectRatio: { ideal: captureSize.width / captureSize.height },
      frameRate: { ideal: 30, max: 60 },
      facingMode: "user",
    },
  };

  if (deviceId) {
    constraints.video.deviceId = { exact: deviceId };
    delete constraints.video.facingMode;
  }

  try {
    state.stream = await navigator.mediaDevices.getUserMedia(constraints);
    cameraVideo.srcObject = state.stream;
    cameraFallback.classList.add("is-hidden");
    await cameraVideo.play();
    startCameraPreview();
    state.selectedDeviceId =
      state.stream.getVideoTracks()[0]?.getSettings().deviceId || deviceId || "";
    await refreshCameraDevices();
  } catch (error) {
    showCameraFallback();
  }
}

function stopCamera() {
  stopCameraPreview();
  if (!state.stream) return;
  state.stream.getTracks().forEach((track) => track.stop());
  state.stream = null;
}

function showCameraFallback() {
  stopCameraPreview();
  cameraFallback.classList.remove("is-hidden");
}

async function refreshCameraDevices() {
  if (!navigator.mediaDevices?.enumerateDevices) return;

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    state.devices = devices.filter((device) => device.kind === "videoinput");
    cameraSelect.innerHTML = "";

    state.devices.forEach((device, index) => {
      const option = document.createElement("option");
      option.value = device.deviceId;
      option.textContent = device.label || `Camera ${index + 1}`;
      option.selected = device.deviceId === state.selectedDeviceId;
      cameraSelect.append(option);
    });

    if (!state.devices.length) {
      const option = document.createElement("option");
      option.textContent = "No camera found";
      option.disabled = true;
      cameraSelect.append(option);
    }
  } catch (error) {
    cameraSelect.innerHTML = "<option>Camera unavailable</option>";
  }
}

async function cycleCamera() {
  if (state.isCapturing) return;
  await refreshCameraDevices();
  if (state.devices.length < 2) return;

  const currentIndex = state.devices.findIndex((device) => device.deviceId === state.selectedDeviceId);
  const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % state.devices.length : 0;
  await startCamera(state.devices[nextIndex].deviceId);
}

async function openCameraDialog() {
  await refreshCameraDevices();
  applyCameraButton.disabled = !state.devices.length;
  cameraDialog.showModal();
}

async function captureFlow() {
  if (state.isCapturing) return;

  setBusy(true);
  await unlockAudio();

  const retakeSlot = state.retakeIndex;
  const isRetake = retakeSlot !== null;
  const targetCount = state.retakeIndex === null ? getCaptureCount() : 1;
  const shouldRecordClip = true;
  if (shouldRecordClip && !isRetake) clearVideoClip();

  if (state.retakeIndex === null) {
    state.captures = [];
    state.selectedIndex = 0;
    state.videoClipBlob = null;
    state.videoSegments = Array.from({ length: targetCount }, () => null);
  }

  for (let index = 0; index < targetCount; index += 1) {
    const slotIndex = isRetake ? retakeSlot : index;
    const recording = shouldRecordClip ? startCameraRecording() : null;
    let videoClip = null;

    try {
      await runCountdown();
    } finally {
      if (recording) {
        videoClip = await stopCameraRecording(recording).catch((error) => {
          console.warn("MARVELL20 clip recording stop failed", error);
          return null;
        });
      }
    }

    const capture = capturePortrait();
    if (state.retakeIndex === null) {
      state.captures.push(capture);
      state.selectedIndex = state.captures.length - 1;
    } else {
      state.captures[retakeSlot] = capture;
      state.selectedIndex = retakeSlot;
      state.retakeIndex = null;
    }
    if (videoClip?.size) {
      state.videoSegments[slotIndex] = createGifSegment(videoClip, 0, 1, stripGifSegmentDuration);
    } else {
      state.videoSegments[slotIndex] = null;
    }
    invalidatePreviewCache();
    playShutterSound();
    document.body.classList.add("flash");
    await sleep(260);
    document.body.classList.remove("flash");
    await sleep(300);
  }

  state.selectedTone = "";
  state.selectedPaper = "";
  try {
    await preloadSelectedCaptureImage();
    await renderAll();
  } finally {
    setBusy(false);
  }
  setView("review");
}

function getSupportedRecordingType() {
  if (!window.MediaRecorder) return "";
  return [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ].find((type) => MediaRecorder.isTypeSupported(type)) || "";
}

function drawCameraFrame(context, width, height) {
  setHighQualityCanvas(context);
  context.fillStyle = "#211b18";
  context.fillRect(0, 0, width, height);

  if (cameraVideo.videoWidth && cameraVideo.videoHeight) {
    context.save();
    context.translate(width, 0);
    context.scale(-1, 1);
    drawCoverImage(context, cameraVideo, 0, 0, width, height);
    context.restore();
    return;
  }

  drawFallbackPortrait(context, width, height);
}

function syncCameraPreviewSize() {
  const bounds = cameraStage.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.round(bounds.width * ratio));
  const height = Math.max(1, Math.round(width / getCaptureAspectRatio()));

  if (cameraPreviewCanvas.width !== width || cameraPreviewCanvas.height !== height) {
    cameraPreviewCanvas.width = width;
    cameraPreviewCanvas.height = height;
  }
}

function drawCameraPreview() {
  if (!state.isCameraPreviewing) return;

  syncCameraPreviewSize();
  const context = cameraPreviewCanvas.getContext("2d");
  drawCameraFrame(context, cameraPreviewCanvas.width, cameraPreviewCanvas.height);
  state.cameraPreviewFrame = window.requestAnimationFrame(drawCameraPreview);
}

function startCameraPreview() {
  if (state.isCameraPreviewing) return;

  state.isCameraPreviewing = true;
  drawCameraPreview();
}

function stopCameraPreview() {
  state.isCameraPreviewing = false;
  window.cancelAnimationFrame(state.cameraPreviewFrame);
  state.cameraPreviewFrame = 0;
}

function startCameraRecording() {
  if (!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) return null;

  const mimeType = getSupportedRecordingType();
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const recordSize = state.selectedFormat === "single" ? singleGifFrameSize : gifFrameSize;
  let animationFrame = 0;
  let isStopped = false;

  canvas.width = recordSize.width;
  canvas.height = recordSize.height;
  setHighQualityCanvas(context);

  const drawRecordingFrame = () => {
    drawCameraFrame(context, canvas.width, canvas.height);

    if (!isStopped) {
      animationFrame = window.requestAnimationFrame(drawRecordingFrame);
    }
  };

  const stream = canvas.captureStream(12);
  const chunks = [];
  let recorder;

  try {
    recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
  } catch (error) {
    stream.getTracks().forEach((track) => track.stop());
    return null;
  }

  state.activeRecorder = recorder;

  const cleanup = () => {
    isStopped = true;
    window.cancelAnimationFrame(animationFrame);
    stream.getTracks().forEach((track) => track.stop());
  };

  const complete = new Promise((resolve) => {
    recorder.addEventListener("dataavailable", (event) => {
      if (event.data?.size) chunks.push(event.data);
    });
    recorder.addEventListener("stop", () => {
      cleanup();
      state.activeRecorder = null;
      resolve(new Blob(chunks, { type: recorder.mimeType || "video/webm" }));
    }, { once: true });
  });

  try {
    drawRecordingFrame();
    recorder.start();
  } catch (error) {
    cleanup();
    state.activeRecorder = null;
    return null;
  }

  return { recorder, complete, cleanup };
}

async function stopCameraRecording(recording) {
  if (!recording) return null;
  if (recording.recorder.state === "recording") recording.recorder.stop();
  else recording.cleanup?.();
  return recording.complete;
}

async function runCountdown() {
  for (const beat of ["5", "4", "3", "2", "1"]) {
    countdown.textContent = beat;
    countdown.classList.add("is-visible");
    await sleep(countdownVisibleMs);
    countdown.classList.remove("is-visible");
    await sleep(countdownHiddenMs);
  }
}

function capturePortrait() {
  const captureSize = getCaptureSize();

  captureCanvas.width = captureSize.width;
  captureCanvas.height = captureSize.height;
  const context = captureCanvas.getContext("2d");
  setHighQualityCanvas(context);
  drawCameraFrame(context, captureSize.width, captureSize.height);

  return captureCanvas.toDataURL("image/jpeg", finalImageQuality);
}

function drawFallbackPortrait(context, width, height) {
  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#6a2029");
  gradient.addColorStop(0.48, "#e4d2b6");
  gradient.addColorStop(1, "#efe5d2");
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
  context.fillStyle = "rgba(238,229,213,0.74)";
  context.font = `${Math.round(width * 0.08)}px Inter Variable`;
  context.textAlign = "center";
  context.fillText("MARVELL20", width / 2, height / 2);
}

async function unlockAudio() {
  if (state.audioContext) return;

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  state.audioContext = new AudioContext();
  if (state.audioContext.state === "suspended") {
    await state.audioContext.resume();
  }
}

function playShutterSound() {
  if (!state.audioContext) return;

  const now = state.audioContext.currentTime;
  const oscillator = state.audioContext.createOscillator();
  const gain = state.audioContext.createGain();
  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(620, now);
  oscillator.frequency.exponentialRampToValueAtTime(210, now + 0.07);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.09, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
  oscillator.connect(gain).connect(state.audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.1);
}

function getSelectedCapture() {
  return state.captures[state.selectedIndex] || state.captures[0] || "";
}

function invalidatePreviewCache(clearImages = false) {
  state.previewVersion += 1;
  previewCache.clear();
  if (clearImages) imageCache.clear();
  markFinalDirty();
}

function markFinalDirty() {
  activeSessionRecord = null;
}

function clearVideoClip() {
  if (state.activeRecorder?.state === "recording") {
    try {
      state.activeRecorder.stop();
    } catch (error) {
      console.warn("MARVELL20 recorder stop failed", error);
    }
  }
  state.activeRecorder = null;
  state.videoClipBlob = null;
  state.videoSegments = [];
}

function updateStepButtons() {
  paperNextButton.disabled = !state.selectedTone;
  finalNextButton.disabled = !state.selectedPaper;
}

async function renderAll() {
  renderReview();
  const images = await preloadCaptureImages();
  const outputSize = getOutputSize();
  await Promise.all([
    renderToneControls(images),
    renderPaperControls(images),
    renderComposition(finalCanvas, { width: outputSize.width, height: outputSize.height, images }),
  ]);
}

function getTonePreviewSize() {
  return state.selectedFormat === "single" ? { width: 560, height: 700 } : tonePreviewSize;
}

function getPaperPreviewSize() {
  return state.selectedFormat === "single" ? { width: 560, height: 840 } : paperPreviewSize;
}

function createSessionId() {
  const datePart = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `M20-${datePart}-${randomPart}`;
}

function renderReview() {
  const selected = getSelectedCapture();
  reviewImage.src = selected;
  reviewImage.toggleAttribute("hidden", !selected);

  reviewGallery.innerHTML = "";
  state.captures.forEach((capture, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "thumb-button";
    button.classList.toggle("is-active", index === state.selectedIndex);
    button.setAttribute("aria-label", `Portrait ${index + 1}`);
    button.innerHTML = `<img src="${capture}" alt="" />`;
    button.addEventListener("click", async () => {
      state.selectedIndex = index;
      invalidatePreviewCache();
      markFinalDirty();
      await preloadSelectedCaptureImage();
      await renderAll();
    });
    reviewGallery.append(button);
  });
}

function drawFormatSamples() {
  drawSingleFormatSample(singleFormatCanvas);
  drawStripFormatSample(stripFormatCanvas);
}

function drawSingleFormatSample(canvas) {
  if (!canvas) return;
  const context = canvas.getContext("2d");
  const { width, height } = canvas;
  context.clearRect(0, 0, width, height);
  context.fillStyle = "#fff";
  context.fillRect(0, 0, width, height);
  context.strokeStyle = "#000";
  context.lineWidth = 1;
  context.strokeRect(0.5, 0.5, width - 1, height - 1);

  const margin = Math.round(width * 0.1);
  const imageWidth = width - margin * 2;
  const imageHeight = Math.round(imageWidth * 1.25);
  drawFormatImageSlot(context, margin, margin, imageWidth, imageHeight);
}

function drawStripFormatSample(canvas) {
  if (!canvas) return;
  const context = canvas.getContext("2d");
  const { width, height } = canvas;
  context.clearRect(0, 0, width, height);
  context.fillStyle = "#fff";
  context.fillRect(0, 0, width, height);
  context.strokeStyle = "#000";
  context.lineWidth = 1;
  context.strokeRect(0.5, 0.5, width - 1, height - 1);

  const margin = Math.round(width * 0.11);
  const imageWidth = width - margin * 2;
  const imageHeight = Math.round(imageWidth * 0.75);
  const gap = (height - margin * 2 - imageHeight * 4) / 3;
  for (let index = 0; index < 4; index += 1) {
    drawFormatImageSlot(context, margin, margin + index * (imageHeight + gap), imageWidth, imageHeight);
  }
}

function drawFormatImageSlot(context, x, y, width, height) {
  context.fillStyle = "#151515";
  context.fillRect(x, y, width, height);
  context.strokeStyle = "#000";
  context.lineWidth = 0.75;
  context.strokeRect(x, y, width, height);
}

function updateChoiceActiveState(container, selectedId) {
  container.querySelectorAll(".visual-choice").forEach((button) => {
    const isActive = button.dataset.choiceId === selectedId;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

async function renderToneControls(images) {
  const currentPreviewSize = getTonePreviewSize();
  const renderedButtons = await Promise.all(tones.map(async (tone) => {
    const canvas = document.createElement("canvas");
    canvas.width = currentPreviewSize.width;
    canvas.height = currentPreviewSize.height;
    canvas.style.aspectRatio = `${currentPreviewSize.width} / ${currentPreviewSize.height}`;
    canvas.style.height = "auto";
    await renderCachedComposition(canvas, {
      width: currentPreviewSize.width,
      height: currentPreviewSize.height,
      toneId: tone.id,
      paperless: true,
      compact: true,
      images,
    });

    const button = document.createElement("button");
    button.type = "button";
    button.className = "visual-choice";
    button.dataset.choiceId = tone.id;
    button.classList.toggle("is-active", tone.id === state.selectedTone);
    button.setAttribute("aria-pressed", tone.id === state.selectedTone ? "true" : "false");
    button.innerHTML = `<span>${tone.name}</span>`;
    button.prepend(canvas);
    button.addEventListener("click", async () => {
      state.selectedTone = tone.id;
      state.selectedPaper = "";
      markFinalDirty();
      updateChoiceActiveState(toneControls, tone.id);
      updateChoiceActiveState(paperControls, "");
      updateStepButtons();
      const selectedImages = await preloadCaptureImages();
      const outputSize = getOutputSize();
      await Promise.all([
        renderPaperControls(selectedImages),
        renderComposition(finalCanvas, { width: outputSize.width, height: outputSize.height, images: selectedImages }),
      ]);
    });
    return button;
  }));

  toneControls.replaceChildren(...renderedButtons);
  updateStepButtons();
}

async function renderPaperControls(images) {
  const currentPreviewSize = getPaperPreviewSize();
  const renderedChoices = await Promise.all(getAvailablePapers().map(async (paper) => {
    const canvas = document.createElement("canvas");
    canvas.width = currentPreviewSize.width;
    canvas.height = currentPreviewSize.height;
    canvas.style.aspectRatio = `${currentPreviewSize.width} / ${currentPreviewSize.height}`;
    await renderCachedComposition(canvas, {
      width: currentPreviewSize.width,
      height: currentPreviewSize.height,
      toneId: state.selectedTone,
      paperId: paper.id,
      compact: true,
      images,
    });

    const button = document.createElement("button");
    button.type = "button";
    button.className = "visual-choice";
    button.dataset.choiceId = paper.id;
    button.style.aspectRatio = `${currentPreviewSize.width} / ${currentPreviewSize.height}`;
    button.classList.toggle("is-active", paper.id === state.selectedPaper);
    button.setAttribute("aria-pressed", paper.id === state.selectedPaper ? "true" : "false");
    button.setAttribute("aria-label", paper.name);
    button.append(canvas);
    button.addEventListener("click", async () => {
      state.selectedPaper = paper.id;
      markFinalDirty();
      updateChoiceActiveState(paperControls, paper.id);
      updateStepButtons();
      const selectedImages = await preloadCaptureImages();
      const outputSize = getOutputSize();
      await Promise.all([
        renderCachedComposition(paperCanvas, { width: outputSize.width, height: outputSize.height, images: selectedImages }),
        renderComposition(finalCanvas, { width: outputSize.width, height: outputSize.height, images: selectedImages }),
      ]);
    });

    const label = document.createElement("span");
    label.className = "paper-choice-label";
    label.textContent = paper.name;

    const choice = document.createElement("div");
    choice.className = "paper-choice-wrap";
    choice.append(button, label);
    return choice;
  }));

  paperControls.replaceChildren(...renderedChoices);
  updateStepButtons();
}

function getTone(id = state.selectedTone) {
  return tones.find((tone) => tone.id === id) || tones[0];
}

function getAvailablePapers(format = state.selectedFormat) {
  return papers.filter((paper) => paper.assets?.[format]);
}

function getPaper(id = state.selectedPaper) {
  const availablePapers = getAvailablePapers();
  return availablePapers.find((paper) => paper.id === id) || availablePapers[0] || papers[0];
}

function createPaperImages() {
  return papers.reduce((images, paper) => {
    Object.values(paper.assets || {}).forEach((source) => {
      if (images[source]) return;

      const image = new Image();
      image.src = source;
      image.addEventListener("load", refreshRenderedPreviews);
      images[source] = image;
    });

    return images;
  }, {});
}

function getPaperImage(paper, format = state.selectedFormat) {
  return paperImages[paper.assets?.[format]] || null;
}

async function loadImage(source) {
  if (!source) return null;
  if (imageCache.has(source)) return imageCache.get(source);

  const promise = new Promise((resolve) => {
    const image = new Image();
    image.decoding = "sync";
    image.onload = () => {
      if (image.decode) {
        image.decode().catch(() => {}).finally(() => resolve(image));
        return;
      }

      resolve(image);
    };
    image.onerror = () => resolve(null);
    image.src = source;
  });

  imageCache.set(source, promise);
  return promise;
}

async function preloadSelectedCaptureImage() {
  return loadImage(getSelectedCapture());
}

async function preloadCaptureImages() {
  return Promise.all(state.captures.map((capture) => loadImage(capture)));
}

function createPreviewCacheKey(options) {
  const width = options.width || portraitSize.width;
  const height = options.height || portraitSize.height;
  return [
    state.previewVersion,
    width,
    height,
    options.toneId || state.selectedTone,
    options.paperId || state.selectedPaper,
    options.format || state.selectedFormat,
    options.paperless ? "paperless" : "paper",
    options.compact ? "compact" : "full",
  ].join(":");
}

async function renderCachedComposition(canvas, options = {}) {
  const key = createPreviewCacheKey(options);
  const width = options.width || portraitSize.width;
  const height = options.height || portraitSize.height;
  const cachedPreview = previewCache.get(key);

  if (cachedPreview) {
    const context = canvas.getContext("2d");
    const image = await loadImage(cachedPreview);
    canvas.width = width;
    canvas.height = height;
    canvas.dataset.ratio = `${width}x${height}`;
    setHighQualityCanvas(context);
    if (image) drawCoverImage(context, image, 0, 0, width, height);
    return;
  }

  await renderComposition(canvas, options);
  if (options.compact || options.paperless) {
    previewCache.set(key, canvas.toDataURL("image/png"));
  }
}

async function renderComposition(canvas, options = {}) {
  const format = options.format || state.selectedFormat;
  const outputSize = format === "single" ? portraitSize : stripSize;
  const width = options.width || outputSize.width;
  const height = options.height || outputSize.height;
  const tone = getTone(options.toneId);
  const paper = getPaper(options.paperId);
  const context = canvas.getContext("2d");
  const images = options.images || await preloadCaptureImages();

  canvas.width = width;
  canvas.height = height;
  canvas.dataset.ratio = `${width}x${height}`;
  setHighQualityCanvas(context);

  if (options.paperless) {
    drawToneOnlyComposition(context, images, tone, width, height, options.compact, format);
    return;
  }

  if (format === "single") {
    drawSingleComposition(context, images[0], tone, paper, width, height, options.compact);
    return;
  }

  drawStripComposition(context, images, tone, paper, width, height, options.compact);
}

function drawSingleComposition(context, image, tone, paper, width, height, compact = false) {
  drawPaper(context, paper, width, height);

  const margin = compact ? Math.round(width * 0.07) : Math.round(paper.margin * (width / portraitSize.width));
  const imageWidth = width - margin * 2;
  const imageFrame = {
    x: margin,
    y: margin,
    width: imageWidth,
    height: Math.min(Math.round(imageWidth * 1.25), height - margin * 2),
  };

  drawTonedImage(context, image, tone, imageFrame);
  if (tone.id === "archive") {
    drawFineGrain(context, width, height, compact ? 7 : 11);
  }
}

function drawStripComposition(context, images, tone, paper, width, height, compact = false) {
  drawPaper(context, paper, width, height);

  const layout = getStripLayout(width, height, compact);
  layout.frames.forEach((frame, index) => {
    drawTonedImage(context, images[index], tone, frame);
  });

  if (tone.id === "archive") {
    drawFineGrain(context, width, height, compact ? 7 : 11);
  }
}

function getStripLayout(width, height, compact = false) {
  const ratio = getCaptureAspectRatio("strip");
  const count = getCaptureCount();
  const sideMargin = Math.round(width * (compact ? 0.085 : 0.085));
  const gap = Math.round(width * (compact ? 0.035 : 0.035));
  const frameWidth = width - sideMargin * 2;
  const frameHeight = Math.floor(frameWidth / ratio);
  const stackHeight = frameHeight * count + gap * Math.max(0, count - 1);
  const top = sideMargin;

  const left = Math.round((width - frameWidth) / 2);
  return {
    frames: Array.from({ length: count }, (_, index) => ({
      x: left,
      y: top + index * (frameHeight + gap),
      width: frameWidth,
      height: frameHeight,
    })),
  };
}

async function drawParallelVideoStripComposition(context, sources, tone, paper, width, height, localTime) {
  drawPaper(context, paper, width, height);

  const layout = getStripLayout(width, height, true);
  for (let index = 0; index < layout.frames.length; index += 1) {
    const source = sources[index];
    const frame = layout.frames[index];

    if (source?.video) {
      const duration = Math.max(0.05, source.duration || 0.65);
      const playbackDuration = Math.max(duration, source.playbackDuration || duration);
      const sourceOffset = Math.min(duration - 0.05, (Math.max(0, localTime) / playbackDuration) * duration);
      await seekVideo(source.video, Math.max(source.startTime, Math.min(source.endTime, source.startTime + sourceOffset)));
      drawTonedImage(context, source.video, tone, frame);
    } else {
      drawTonedImage(context, source?.image, tone, frame);
    }
  }

  if (tone.id === "archive") {
    drawFineGrain(context, width, height, 7);
  }
}

function drawToneOnlyComposition(context, images, tone, width, height, compact = false, format = state.selectedFormat) {
  context.fillStyle = "#211b18";
  context.fillRect(0, 0, width, height);

  if (format === "single") {
    drawTonedImage(context, images[0], tone, { x: 0, y: 0, width, height });
    if (tone.id === "archive") {
      drawFineGrain(context, width, height, compact ? 7 : 11);
    }
    return;
  }

  const layout = getStripLayout(width, height, true);
  for (let index = 0; index < layout.frames.length; index += 1) {
    drawTonedImage(context, images[index], tone, layout.frames[index]);
  }

  if (tone.id === "archive") {
    drawFineGrain(context, width, height, compact ? 7 : 11);
  }
}

function drawPaper(context, paper, width, height) {
  context.fillStyle = paper.background;
  context.fillRect(0, 0, width, height);

  const paperImage = getPaperImage(paper);
  if (paperImage?.complete && paperImage.naturalWidth) {
    context.save();
    drawCoverImage(context, paperImage, 0, 0, width, height);
    context.restore();
  }

  if (paper.tint) {
    context.save();
    context.globalCompositeOperation = "multiply";
    context.fillStyle = paper.tint;
    context.fillRect(0, 0, width, height);
    context.restore();
  }
}

function drawTonedImage(context, image, tone, frame) {
  context.save();
  context.shadowColor = "rgba(28, 12, 10, 0.2)";
  context.shadowBlur = Math.round(frame.width * 0.035);
  context.shadowOffsetY = Math.round(frame.width * 0.018);
  context.fillStyle = "rgba(35, 20, 18, 0.22)";
  context.fillRect(frame.x, frame.y, frame.width, frame.height);
  context.restore();

  context.save();
  context.filter = tone.filter;
  if (image) {
    drawCoverImage(context, image, frame.x, frame.y, frame.width, frame.height);
  } else {
    drawPlaceholder(context, frame);
  }
  context.filter = "none";
  if (tone.id === "archive") {
    applyArchivePhotoboothGrade(context, frame);
  }
  applyToneWash(context, tone, frame);
  if (tone.id === "archive") {
    drawArchiveImperfections(context, frame);
  }
  context.restore();
}

function drawPlaceholder(context, frame) {
  const gradient = context.createLinearGradient(frame.x, frame.y, frame.x + frame.width, frame.y + frame.height);
  gradient.addColorStop(0, "#5b1d25");
  gradient.addColorStop(0.52, "#2a201d");
  gradient.addColorStop(1, "#3b141a");
  context.fillStyle = gradient;
  context.fillRect(frame.x, frame.y, frame.width, frame.height);
}

function getCoverCrop(sourceWidth, sourceHeight, targetWidth, targetHeight, alignX = 0.5, alignY = 0.5) {
  if (!sourceWidth || !sourceHeight || !targetWidth || !targetHeight) {
    return { sx: 0, sy: 0, sw: sourceWidth || 0, sh: sourceHeight || 0 };
  }

  const sourceRatio = sourceWidth / sourceHeight;
  const targetRatio = targetWidth / targetHeight;
  let sw = sourceWidth;
  let sh = sourceHeight;

  // Shared object-fit: cover crop for live preview, capture, review/export, and GIF.
  // Keep the default centered for subject safety; adjust alignX/alignY here if needed later.
  if (sourceRatio > targetRatio) {
    sw = sourceHeight * targetRatio;
  } else {
    sh = sourceWidth / targetRatio;
  }

  return {
    sx: Math.max(0, (sourceWidth - sw) * alignX),
    sy: Math.max(0, (sourceHeight - sh) * alignY),
    sw,
    sh,
  };
}

function drawCoverImage(context, image, x, y, width, height, alignX = 0.5, alignY = 0.5) {
  const sourceWidth = image.videoWidth || image.naturalWidth || image.width;
  const sourceHeight = image.videoHeight || image.naturalHeight || image.height;
  const { sx, sy, sw, sh } = getCoverCrop(sourceWidth, sourceHeight, width, height, alignX, alignY);

  setHighQualityCanvas(context);
  context.drawImage(image, sx, sy, sw, sh, x, y, width, height);
}

function drawContainImage(context, image, x, y, width, height) {
  const sourceWidth = image.videoWidth || image.naturalWidth || image.width;
  const sourceHeight = image.videoHeight || image.naturalHeight || image.height;
  const imageRatio = sourceWidth / sourceHeight;
  const frameRatio = width / height;
  let targetWidth = width;
  let targetHeight = height;
  let targetX = x;
  let targetY = y;

  if (imageRatio > frameRatio) {
    targetWidth = width;
    targetHeight = width / imageRatio;
    targetY = y + (height - targetHeight) / 2;
  } else {
    targetHeight = height;
    targetWidth = height * imageRatio;
    targetX = x + (width - targetWidth) / 2;
  }

  setHighQualityCanvas(context);
  context.drawImage(image, targetX, targetY, targetWidth, targetHeight);
}

function applyToneWash(context, tone, frame) {
  context.globalCompositeOperation = "source-atop";

  if (tone.id === "archive") {
    context.fillStyle = "rgba(250, 241, 217, 0.08)";
    context.fillRect(frame.x, frame.y, frame.width, frame.height);
    context.globalCompositeOperation = "screen";
    context.fillStyle = "rgba(255, 249, 232, 0.035)";
    context.fillRect(frame.x, frame.y, frame.width, frame.height);
    context.globalCompositeOperation = "multiply";
    context.fillStyle = "rgba(24, 20, 18, 0.11)";
    context.fillRect(frame.x, frame.y, frame.width, frame.height);
  }

  context.globalCompositeOperation = "source-over";

  const vignette = context.createRadialGradient(
    frame.x + frame.width / 2,
    frame.y + frame.height / 2,
    frame.width * 0.18,
    frame.x + frame.width / 2,
    frame.y + frame.height / 2,
    frame.width * 0.82,
  );
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, tone.id === "archive" ? "rgba(16,13,10,0.28)" : "rgba(34,18,16,0.11)");
  context.fillStyle = vignette;
  context.fillRect(frame.x, frame.y, frame.width, frame.height);
}

function applyArchivePhotoboothGrade(context, frame) {
  const x = Math.max(0, Math.round(frame.x));
  const y = Math.max(0, Math.round(frame.y));
  const width = Math.max(1, Math.round(frame.width));
  const height = Math.max(1, Math.round(frame.height));
  const imageData = context.getImageData(x, y, width, height);
  const data = imageData.data;

  for (let index = 0; index < data.length; index += 4) {
    const luminance = (data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114) / 255;
    let value = (luminance - 0.5) * 1.22 + 0.5;
    value = Math.max(0, Math.min(1, value));
    value = Math.pow(value, 0.96);

    if (value < 0.18) value = 0.06 + value * 0.82;
    if (value < 0.5) value = Math.max(0.055, value - 0.01);
    if (value > 0.86) value = 0.86 + (value - 0.86) * 0.58;

    data[index] = Math.round(22 + value * 226);
    data[index + 1] = Math.round(21 + value * 221);
    data[index + 2] = Math.round(20 + value * 210);
  }

  context.putImageData(imageData, x, y);
}

function drawArchiveImperfections(context, frame) {
  context.save();
  context.globalCompositeOperation = "source-over";
  context.globalAlpha = 0.08;
  context.fillStyle = "rgba(255, 245, 215, 0.8)";
  for (let index = 0; index < 28; index += 1) {
    const x = frame.x + Math.random() * frame.width;
    const y = frame.y + Math.random() * frame.height;
    const width = 1 + Math.random() * 1.5;
    const height = 3 + Math.random() * 12;
    context.fillRect(x, y, width, height);
  }

  context.globalAlpha = 0.055;
  context.fillStyle = "#2a201d";
  for (let y = frame.y; y < frame.y + frame.height; y += 20) {
    context.fillRect(frame.x, y, frame.width, 1);
  }
  context.restore();
}

function drawFineGrain(context, width, height, amount) {
  const imageData = context.getImageData(0, 0, width, height);
  const data = imageData.data;
  for (let index = 0; index < data.length; index += 4) {
    const noise = (Math.random() - 0.5) * amount;
    data[index] = Math.max(0, Math.min(255, data[index] + noise));
    data[index + 1] = Math.max(0, Math.min(255, data[index + 1] + noise));
    data[index + 2] = Math.max(0, Math.min(255, data[index + 2] + noise));
  }
  context.putImageData(imageData, 0, 0);
}

function openArchiveDb() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("IndexedDB is unavailable"));
      return;
    }

    const request = indexedDB.open("marvell20-archive", 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(archiveStoreName)) {
        const store = database.createObjectStore(archiveStoreName, { keyPath: "id" });
        store.createIndex("timestamp", "timestamp");
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveSessionRecord(record) {
  const database = await openArchiveDb();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(archiveStoreName, "readwrite");
    transaction.objectStore(archiveStoreName).put(record);
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error);
    };
  });
}

async function getArchiveRecords() {
  const database = await openArchiveDb();
  return new Promise((resolve, reject) => {
    const records = [];
    const transaction = database.transaction(archiveStoreName, "readonly");
    const store = transaction.objectStore(archiveStoreName);
    const source = store.indexNames.contains("timestamp") ? store.index("timestamp") : store;
    const request = source.openCursor(null, "prev");

    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) return;
      if (cursor.value?.finalImage) {
        records.push(cursor.value);
      }
      cursor.continue();
    };

    transaction.oncomplete = () => {
      database.close();
      resolve(records);
    };

    transaction.onerror = () => {
      database.close();
      reject(transaction.error);
    };
  });
}

async function updateSessionRecord(updates) {
  if (!activeSessionRecord) return;
  activeSessionRecord = { ...activeSessionRecord, ...updates };
  try {
    await saveSessionRecord(activeSessionRecord);
  } catch (error) {
    console.warn("MARVELL20 archive update failed", error);
  }
}

function formatArchiveTimestamp(timestamp) {
  if (!timestamp) return "Saved portrait";

  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(timestamp));
  } catch (error) {
    return "Saved portrait";
  }
}

function renderArchive() {
  archiveGrid.innerHTML = "";
  archiveEmpty.hidden = archiveRecords.length > 0;
  archivePreviewImage.hidden = archiveRecords.length === 0;

  if (!archiveRecords.length) {
    archivePreviewImage.removeAttribute("src");
    return;
  }

  if (!archiveRecords.some((record) => record.id === selectedArchiveId)) {
    selectedArchiveId = archiveRecords[0].id;
  }

  const selectedRecord = archiveRecords.find((record) => record.id === selectedArchiveId) || archiveRecords[0];
  archivePreviewImage.src = getRecordImageUrl(selectedRecord);

  archiveRecords.forEach((record) => {
    const button = document.createElement("button");
    const time = formatArchiveTimestamp(record.timestamp);
    button.type = "button";
    button.className = "archive-item";
    button.classList.toggle("is-active", record.id === selectedRecord.id);
    button.setAttribute("aria-label", `Archived portrait ${time}`);
    button.innerHTML = `
      <img src="${getRecordImageUrl(record)}" alt="" />
      <span>${time}</span>
    `;
    button.addEventListener("click", () => {
      selectedArchiveId = record.id;
      renderArchive();
    });
    archiveGrid.append(button);
  });
}

async function showArchive() {
  stopCamera();
  setView("archive");

  const recordsById = new Map();

  try {
    const browserRecords = await getArchiveRecords();
    browserRecords.forEach((record) => {
      if (!recordsById.has(record.id)) {
        recordsById.set(record.id, { ...record, archiveSource: "browser" });
      }
    });
  } catch (error) {
    console.warn("MARVELL20 browser archive load failed", error);
  }

  archiveRecords = Array.from(recordsById.values()).sort((left, right) => {
    return new Date(right.timestamp || 0).getTime() - new Date(left.timestamp || 0).getTime();
  });
  renderArchive();
}

async function prepareFinalSession() {
  if (activeSessionRecord) return activeSessionRecord;

  const exportSize = getFinalExportSize();
  const images = await preloadCaptureImages();
  await renderComposition(finalCanvas, { width: exportSize.width, height: exportSize.height, images });
  const finalImage = finalCanvas.toDataURL("image/png");
  state.sessionId = state.sessionId || createSessionId();
  activeSessionRecord = {
    id: state.sessionId,
    timestamp: new Date().toISOString(),
    finalImage,
    selectedFormat: state.selectedFormat,
    selectedFilter: state.selectedTone,
    selectedPaper: state.selectedPaper,
    exportStatus: "ready",
  };

  try {
    await saveSessionRecord(activeSessionRecord);
  } catch (error) {
    console.warn("MARVELL20 archive save failed", error);
  }

  return activeSessionRecord;
}

function createBitBuffer() {
  const bits = [];
  return {
    bits,
    put(value, length) {
      for (let shift = length - 1; shift >= 0; shift -= 1) {
        bits.push(((value >>> shift) & 1) === 1);
      }
    },
  };
}

const qrVersionConfigs = [
  { version: 1, dataCodewords: 19, ecCodewords: 7, alignment: [] },
  { version: 2, dataCodewords: 34, ecCodewords: 10, alignment: [6, 18] },
  { version: 3, dataCodewords: 55, ecCodewords: 15, alignment: [6, 22] },
  { version: 4, dataCodewords: 80, ecCodewords: 20, alignment: [6, 26] },
  { version: 5, dataCodewords: 108, ecCodewords: 26, alignment: [6, 30] },
];

function encodeQrBytes(text) {
  if (window.TextEncoder) {
    return Array.from(new TextEncoder().encode(String(text)));
  }

  return Array.from(unescape(encodeURIComponent(String(text))), (character) => character.charCodeAt(0));
}

function getQrByteBitLength(byteLength) {
  return 4 + 8 + byteLength * 8;
}

function getQrVersionConfig(bytes) {
  const bitLength = getQrByteBitLength(bytes.length);
  const config = qrVersionConfigs.find((candidate) => {
    const maxBits = candidate.dataCodewords * 8;
    if (bitLength > maxBits) return false;
    const terminatedLength = bitLength + Math.min(4, maxBits - bitLength);
    const byteAlignedLength = Math.ceil(terminatedLength / 8) * 8;
    return byteAlignedLength <= maxBits;
  });
  if (!config) {
    throw new Error("QR payload is too long");
  }
  return config;
}

function createQrDataCodewords(text, config) {
  const bytes = encodeQrBytes(text);
  const buffer = createBitBuffer();
  buffer.put(0x4, 4);
  buffer.put(bytes.length, 8);
  bytes.forEach((byte) => buffer.put(byte, 8));

  const maxBits = config.dataCodewords * 8;
  buffer.put(0, Math.min(4, maxBits - buffer.bits.length));
  while (buffer.bits.length % 8 !== 0) buffer.bits.push(false);

  const codewords = [];
  for (let index = 0; index < buffer.bits.length; index += 8) {
    let value = 0;
    for (let offset = 0; offset < 8; offset += 1) {
      value = (value << 1) | (buffer.bits[index + offset] ? 1 : 0);
    }
    codewords.push(value);
  }

  for (let padIndex = 0; codewords.length < config.dataCodewords; padIndex += 1) {
    codewords.push(padIndex % 2 === 0 ? 0xec : 0x11);
  }

  return codewords;
}

function createGaloisTables() {
  const exp = new Array(512);
  const log = new Array(256);
  let value = 1;
  for (let index = 0; index < 255; index += 1) {
    exp[index] = value;
    log[value] = index;
    value <<= 1;
    if (value & 0x100) value ^= 0x11d;
  }
  for (let index = 255; index < 512; index += 1) exp[index] = exp[index - 255];
  return { exp, log };
}

const qrGalois = createGaloisTables();

function multiplyGalois(left, right) {
  if (left === 0 || right === 0) return 0;
  return qrGalois.exp[qrGalois.log[left] + qrGalois.log[right]];
}

function createQrGeneratorPolynomial(degree) {
  let polynomial = [1];
  for (let index = 0; index < degree; index += 1) {
    const next = new Array(polynomial.length + 1).fill(0);
    polynomial.forEach((coefficient, coefficientIndex) => {
      next[coefficientIndex] ^= coefficient;
      next[coefficientIndex + 1] ^= multiplyGalois(coefficient, qrGalois.exp[index]);
    });
    polynomial = next;
  }
  return polynomial;
}

function createErrorCorrectionCodewords(data, degree = 7) {
  const generator = createQrGeneratorPolynomial(degree);
  const result = data.concat(new Array(degree).fill(0));
  for (let index = 0; index < data.length; index += 1) {
    const coefficient = result[index];
    if (coefficient === 0) continue;
    generator.forEach((generatorCoefficient, generatorIndex) => {
      result[index + generatorIndex] ^= multiplyGalois(generatorCoefficient, coefficient);
    });
  }
  return result.slice(result.length - degree);
}

function createQrMatrix(text) {
  const bytes = encodeQrBytes(text);
  const config = getQrVersionConfig(bytes);
  const version = config.version;
  const size = 17 + version * 4;
  const matrix = Array.from({ length: size }, () => new Array(size).fill(false));
  const reserved = Array.from({ length: size }, () => new Array(size).fill(false));

  const setModule = (x, y, value, reserve = true) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    matrix[y][x] = value;
    if (reserve) reserved[y][x] = true;
  };

  const drawFinder = (x, y) => {
    for (let yy = -1; yy <= 7; yy += 1) {
      for (let xx = -1; xx <= 7; xx += 1) {
        const inBounds = xx >= 0 && xx <= 6 && yy >= 0 && yy <= 6;
        const ring = xx === 0 || xx === 6 || yy === 0 || yy === 6;
        const center = xx >= 2 && xx <= 4 && yy >= 2 && yy <= 4;
        setModule(x + xx, y + yy, inBounds && (ring || center));
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(size - 7, 0);
  drawFinder(0, size - 7);

  for (let index = 8; index < size - 8; index += 1) {
    setModule(index, 6, index % 2 === 0);
    setModule(6, index, index % 2 === 0);
  }

  setModule(8, size - 8, true);

  const drawAlignment = (centerX, centerY) => {
    for (let y = -2; y <= 2; y += 1) {
      for (let x = -2; x <= 2; x += 1) {
        const distance = Math.max(Math.abs(x), Math.abs(y));
        setModule(centerX + x, centerY + y, distance !== 1);
      }
    }
  };

  config.alignment.forEach((centerY) => {
    config.alignment.forEach((centerX) => {
      if (!reserved[centerY]?.[centerX]) {
        drawAlignment(centerX, centerY);
      }
    });
  });

  const reserveFormat = () => {
    const formatPositionsA = [
      [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8],
      [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8],
    ];
    const formatPositionsB = [
      [size - 1, 8], [size - 2, 8], [size - 3, 8], [size - 4, 8], [size - 5, 8],
      [size - 6, 8], [size - 7, 8], [size - 8, 8], [8, size - 7], [8, size - 6],
      [8, size - 5], [8, size - 4], [8, size - 3], [8, size - 2], [8, size - 1],
    ];
    formatPositionsA.concat(formatPositionsB).forEach(([x, y]) => setModule(x, y, false));
  };

  reserveFormat();

  const data = createQrDataCodewords(text, config);
  const codewords = data.concat(createErrorCorrectionCodewords(data, config.ecCodewords));
  const bits = [];
  codewords.forEach((codeword) => {
    for (let shift = 7; shift >= 0; shift -= 1) {
      bits.push(((codeword >>> shift) & 1) === 1);
    }
  });

  let bitIndex = 0;
  let upward = true;
  for (let x = size - 1; x > 0; x -= 2) {
    if (x === 6) x -= 1;
    for (let rowOffset = 0; rowOffset < size; rowOffset += 1) {
      const y = upward ? size - 1 - rowOffset : rowOffset;
      for (let column = 0; column < 2; column += 1) {
        const xx = x - column;
        if (reserved[y][xx]) continue;
        const masked = ((xx + y) % 2 === 0);
        matrix[y][xx] = (bits[bitIndex] || false) !== masked;
        bitIndex += 1;
      }
    }
    upward = !upward;
  }

  const format = createQrFormatBits(1, 0);
  const formatPositionsA = [
    [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8],
    [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8],
  ];
  const formatPositionsB = [
    [size - 1, 8], [size - 2, 8], [size - 3, 8], [size - 4, 8], [size - 5, 8],
    [size - 6, 8], [size - 7, 8], [size - 8, 8], [8, size - 7], [8, size - 6],
    [8, size - 5], [8, size - 4], [8, size - 3], [8, size - 2], [8, size - 1],
  ];

  for (let index = 0; index < 15; index += 1) {
    const bit = ((format >>> index) & 1) === 1;
    setModule(formatPositionsA[index][0], formatPositionsA[index][1], bit);
    setModule(formatPositionsB[index][0], formatPositionsB[index][1], bit);
  }

  return matrix;
}

function createQrFormatBits(errorCorrectionLevel, mask) {
  let data = (errorCorrectionLevel << 3) | mask;
  let bits = data << 10;
  const generator = 0x537;
  for (let shift = 14; shift >= 10; shift -= 1) {
    if ((bits >>> shift) & 1) bits ^= generator << (shift - 10);
  }
  return ((data << 10) | bits) ^ 0x5412;
}

function drawSessionQrCode(canvas, payload) {
  const matrix = createQrMatrix(payload);
  const context = canvas.getContext("2d");
  const size = canvas.width;
  const quiet = 4;
  const cell = Math.floor(size / (matrix.length + quiet * 2));
  const total = cell * (matrix.length + quiet * 2);
  const offset = Math.floor((size - total) / 2) + quiet * cell;

  context.fillStyle = "#fffaf0";
  context.fillRect(0, 0, size, size);
  context.fillStyle = "#211b18";
  matrix.forEach((row, y) => {
    row.forEach((isDark, x) => {
      if (isDark) context.fillRect(offset + x * cell, offset + y * cell, cell, cell);
    });
  });
  canvas.dataset.payload = payload;
}

function beginRetake(index = state.selectedIndex) {
  if (!state.captures.length) return;
  state.retakeIndex = index;
  setView("camera");
}

async function showFinal() {
  if (!state.selectedPaper) return;
  qrCanvas.hidden = true;
  qrStatus.textContent = "Preparing high-quality link...";
  await prepareFinalSession();
  setView("final");
  prepareFinalPreviewLoop();
}

async function showToneStep() {
  toneNextButton.disabled = true;

  try {
    const images = await preloadCaptureImages();
    await renderToneControls(images);
    setView("tone");
  } finally {
    toneNextButton.disabled = false;
  }
}

async function showPaperStep() {
  if (!state.selectedTone) return;
  paperNextButton.disabled = true;

  try {
    const images = await preloadCaptureImages();
    await renderPaperControls(images);
    setView("paper");
  } finally {
    paperNextButton.disabled = false;
  }
}

function createPortraitFileName(record, extension = "png") {
  const id = (record?.id || state.sessionId || Date.now().toString())
    .replace(/[^a-z0-9-]/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return `${id || Date.now()}.${extension}`;
}

function getRecordImageUrl(record) {
  return record?.cloudinaryUrl || record?.finalImage || "";
}

function getCloudinaryPublicId(record, extension) {
  const base = createPortraitFileName(record, extension).replace(/\.[^.]+$/, "");
  return extension === "gif" ? `${base}-gif` : base;
}

function getCloudinaryDeliveryUrl(upload, extension) {
  const resourceType = upload.resource_type || "image";
  const format = upload.format || extension;
  const publicId = upload.public_id || "";
  return `https://res.cloudinary.com/${cloudinaryCloudName}/${resourceType}/upload/${publicId}.${format}`;
}

async function uploadToCloudinary(blob, record, extension = "png") {
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/auto/upload`;
  const formData = new FormData();
  formData.append("upload_preset", cloudinaryUploadPreset);
  formData.append("folder", cloudinaryUploadFolder);
  formData.append("public_id", getCloudinaryPublicId(record, extension));
  formData.append("tags", ["MARVELL20", record.selectedFormat, record.selectedFilter, record.selectedPaper].filter(Boolean).join(","));
  formData.append("file", blob, createPortraitFileName(record, extension));

  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Cloudinary upload failed with ${response.status}`);
  }

  return response.json();
}

async function ensureCloudinaryImage(record) {
  if (record.cloudinaryUrl) return record;

  const finalBlob = await canvasToBlob(finalCanvas, "image/png");
  try {
    const upload = await uploadToCloudinary(finalBlob, record, "png");
    activeSessionRecord = {
      ...record,
      cloudinaryUrl: getCloudinaryDeliveryUrl(upload, "png"),
      cloudinaryPublicId: upload.public_id,
      cloudinaryAssetId: upload.asset_id,
      cloudinaryResourceType: upload.resource_type,
      exportStatus: "cloudinary_ready",
    };
    await saveSessionRecord(activeSessionRecord);
    return activeSessionRecord;
  } catch (error) {
    console.warn("MARVELL20 Cloudinary upload failed", error);
    qrCanvas.hidden = true;
    qrStatus.textContent = "Cloudinary upload failed. Try again.";
    activeSessionRecord = {
      ...record,
      exportStatus: "cloudinary_failed",
    };
    await saveSessionRecord(activeSessionRecord).catch(() => {});
    return activeSessionRecord;
  }
}

function showCloudinaryQr(record, type = "photo") {
  const url = type === "gif" ? record.gifCloudinaryUrl : record.cloudinaryUrl;
  if (!url) {
    qrCanvas.hidden = true;
    qrStatus.textContent = record.exportStatus === "cloudinary_failed"
      ? "Cloudinary upload failed. Try again."
      : "Cloudinary link unavailable.";
    setView("scan");
    return;
  }

  try {
    drawSessionQrCode(qrCanvas, url);
    qrCanvas.hidden = false;
    qrStatus.textContent = type === "gif" ? "Scan for GIF" : "Scan for high quality";
    setView("scan");
  } catch (error) {
    console.warn("MARVELL20 QR render failed", error);
    qrCanvas.hidden = true;
    qrStatus.textContent = "Cloudinary QR unavailable. Try again.";
    setView("scan");
  }
}

function canvasToBlob(canvas, type = "image/jpeg", quality = finalImageQuality) {
  return new Promise((resolve, reject) => {
    if (canvas.toBlob) {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Portrait image could not be created"));
      }, type, quality);
      return;
    }

    fetch(canvas.toDataURL(type, quality))
      .then((response) => response.blob())
      .then(resolve)
      .catch(reject);
  });
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function setExportBusy(isBusy) {
  exportButton.disabled = isBusy;
  airdropButton.disabled = isBusy;
  gifButton.disabled = isBusy;
  finalNextButton.disabled = isBusy || !state.selectedPaper;
}

async function showPhotoQr() {
  const record = await prepareFinalSession();
  setExportBusy(true);
  exportButton.textContent = "Preparing...";

  try {
    const uploadedRecord = await ensureCloudinaryImage(record);
    showCloudinaryQr(uploadedRecord, "photo");
    if (uploadedRecord.cloudinaryUrl) {
      await updateSessionRecord({ exportStatus: "scanned_png" });
    }
  } catch (error) {
    console.warn("MARVELL20 Cloudinary scan failed", error);
    exportButton.textContent = "Try Again";
  } finally {
    window.setTimeout(() => {
      exportButton.textContent = "High Quality";
    }, 1400);
    setExportBusy(false);
  }
}

async function shareFinalImage() {
  const record = await prepareFinalSession();
  setExportBusy(true);
  airdropButton.textContent = "Preparing...";

  try {
    const blob = await canvasToBlob(finalCanvas, "image/png");
    const fileName = `marvell-20-${createPortraitFileName(record, "png")}`;

    if (typeof File === "function" && navigator.share && navigator.canShare) {
      const file = new File([blob], fileName, { type: "image/png" });
      if (navigator.canShare({ files: [file] })) {
        airdropButton.textContent = "Share...";
        await navigator.share({
          files: [file],
          title: "MARVELL20",
          text: "MARVELL20 portrait",
        });
        await updateSessionRecord({ exportStatus: "airdropped_png" });
        return;
      }
    }

    downloadBlob(blob, fileName);
    airdropButton.textContent = "Downloaded";
    await updateSessionRecord({ exportStatus: "downloaded_png" });
  } catch (error) {
    if (error?.name !== "AbortError") {
      console.warn("MARVELL20 AirDrop export failed", error);
      airdropButton.textContent = "Try Again";
    }
  } finally {
    window.setTimeout(() => {
      airdropButton.textContent = "AirDrop";
    }, 1400);
    setExportBusy(false);
  }
}

function drawGifFrame(canvas, image, tone) {
  const context = canvas.getContext("2d");
  canvas.width = gifFrameSize.width;
  canvas.height = gifFrameSize.height;
  setHighQualityCanvas(context);
  context.fillStyle = "#211b18";
  context.fillRect(0, 0, canvas.width, canvas.height);
  drawTonedImage(context, image, tone, { x: 0, y: 0, width: canvas.width, height: canvas.height });
}

function createGifSegment(blob, startFraction = 0, durationFraction = 1, expectedDuration = 0) {
  return { blob, startFraction, durationFraction, expectedDuration };
}

function createGifSegments(blob, count) {
  return Array.from({ length: count }, (_, index) => {
    return createGifSegment(blob, index / count, 1 / count);
  });
}

function hasGifVideoSegments() {
  const count = getCaptureCount();
  return state.selectedFormat === "strip"
    && state.videoSegments.length >= count
    && state.videoSegments.slice(0, count).some((segment) => segment?.blob);
}

function getGifFrameTiming(loopDuration, maxFrames = maxGifFrames) {
  const frameCount = Math.max(10, Math.min(maxFrames, Math.ceil((loopDuration * 1000) / gifFrameDelayMs)));
  return {
    frameCount,
    frameDelay: Math.max(gifFrameDelayMs, Math.round((loopDuration * 1000) / frameCount)),
  };
}

async function createStripGifBlob() {
  if (state.selectedFormat === "single") {
    return createSingleGifBlob();
  }

  try {
    if (hasGifVideoSegments()) {
      return await createSegmentedVideoPaperGifBlob(state.videoSegments);
    }

    if (state.videoClipBlob) {
      return await createSegmentedVideoPaperGifBlob(createGifSegments(state.videoClipBlob, getCaptureCount()));
    }
  } catch (error) {
    console.warn("MARVELL20 video GIF fallback used", error);
  }

  return createStillStripGifBlob();
}

async function createSingleGifBlob() {
  try {
    const segment = state.videoSegments[0]?.blob
      ? state.videoSegments[0]
      : state.videoClipBlob
        ? createGifSegment(state.videoClipBlob)
        : null;

    if (segment?.blob) {
      return await createSingleVideoPaperGifBlob(segment);
    }
  } catch (error) {
    console.warn("MARVELL20 single video GIF fallback used", error);
  }

  return createStillSingleGifBlob();
}

async function createStillSingleGifBlob() {
  const gifenc = await loadGifEncoder();
  const { GIFEncoder, applyPalette, quantize } = gifenc;
  const images = await preloadCaptureImages();
  const canvas = document.createElement("canvas");
  const gif = GIFEncoder();

  canvas.width = singleGifPaperSize.width;
  canvas.height = singleGifPaperSize.height;
  await renderComposition(canvas, { width: canvas.width, height: canvas.height, images });
  const context = canvas.getContext("2d");
  setHighQualityCanvas(context);
  const frame = context.getImageData(0, 0, canvas.width, canvas.height).data;
  const palette = quantize(frame, 256);
  const indexed = applyPalette(frame, palette);
  gif.writeFrame(indexed, canvas.width, canvas.height, { palette, delay: 1500 });
  gif.writeFrame(indexed, canvas.width, canvas.height, { palette, delay: 1500 });
  gif.finish();
  return new Blob([gif.bytes()], { type: "image/gif" });
}

async function createStillStripGifBlob() {
  const gifenc = await loadGifEncoder();
  const { GIFEncoder, applyPalette, quantize } = gifenc;
  const images = await preloadCaptureImages();
  const canvas = document.createElement("canvas");
  const gif = GIFEncoder();

  canvas.width = gifPaperSize.width;
  canvas.height = gifPaperSize.height;
  await renderComposition(canvas, { width: canvas.width, height: canvas.height, images });
  const context = canvas.getContext("2d");
  setHighQualityCanvas(context);
  const frame = context.getImageData(0, 0, canvas.width, canvas.height).data;
  const palette = quantize(frame, 256);
  const indexed = applyPalette(frame, palette);
  gif.writeFrame(indexed, canvas.width, canvas.height, { palette, delay: 1500 });
  gif.writeFrame(indexed, canvas.width, canvas.height, { palette, delay: 1500 });

  gif.finish();
  return new Blob([gif.bytes()], { type: "image/gif" });
}

function waitForVideoEvent(video, eventName) {
  return new Promise((resolve, reject) => {
    const handleEvent = () => {
      cleanup();
      resolve();
    };
    const handleError = () => {
      cleanup();
      reject(video.error || new Error(`Video ${eventName} failed`));
    };
    const cleanup = () => {
      video.removeEventListener(eventName, handleEvent);
      video.removeEventListener("error", handleError);
    };
    video.addEventListener(eventName, handleEvent, { once: true });
    video.addEventListener("error", handleError, { once: true });
  });
}

async function seekVideo(video, time) {
  if (Math.abs(video.currentTime - time) < 0.04) return;
  const seeked = waitForVideoEvent(video, "seeked");
  video.currentTime = time;
  await seeked;
}

async function createSegmentedVideoPaperGifBlob(segments) {
  const gifenc = await loadGifEncoder();
  const { GIFEncoder, applyPalette, quantize } = gifenc;
  const tone = getTone();
  const paper = getPaper();
  const images = await preloadCaptureImages();
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const urls = [];
  const sources = [];
  const gif = GIFEncoder();

  canvas.width = gifPaperSize.width;
  canvas.height = gifPaperSize.height;
  setHighQualityCanvas(context);

  try {
    const count = getCaptureCount();
    for (let index = 0; index < count; index += 1) {
      const segment = segments[index];
      if (!segment?.blob) {
        sources[index] = { image: images[index], duration: 0.65, playbackDuration: stripGifSegmentDuration };
        continue;
      }

      const video = document.createElement("video");
      const url = URL.createObjectURL(segment.blob);
      urls.push(url);
      video.src = url;
      video.muted = true;
      video.playsInline = true;
      video.preload = "auto";
      await waitForVideoEvent(video, "loadedmetadata");

      const expectedDuration = segment.expectedDuration || 0;
      const duration = Number.isFinite(video.duration) && video.duration > 0
        ? video.duration
        : expectedDuration || stripGifSegmentDuration;
      const startTime = duration * (segment.startFraction ?? 0);
      const segmentDuration = Math.max(0.65, expectedDuration || duration * (segment.durationFraction ?? 1));
      const endTime = Math.max(startTime, Math.min(duration - 0.05, startTime + segmentDuration));
      sources[index] = {
        image: images[index],
        video,
        startTime,
        endTime,
        duration: Math.max(0.65, endTime - startTime),
        playbackDuration: expectedDuration || stripGifSegmentDuration,
      };
    }

    const loopDuration = Math.max(0.9, ...sources.map((source) => source.playbackDuration || source.duration || 0.65));
    const { frameCount, frameDelay } = getGifFrameTiming(loopDuration);

    for (let frameIndex = 0; frameIndex < frameCount; frameIndex += 1) {
      const localTime = Math.min(loopDuration - 0.05, (loopDuration * frameIndex) / frameCount);
      await drawParallelVideoStripComposition(
        context,
        sources,
        tone,
        paper,
        canvas.width,
        canvas.height,
        localTime
      );
      const frame = context.getImageData(0, 0, canvas.width, canvas.height).data;
      const palette = quantize(frame, 256);
      const indexed = applyPalette(frame, palette);
      gif.writeFrame(indexed, canvas.width, canvas.height, { palette, delay: frameDelay });
    }

    gif.finish();
    return new Blob([gif.bytes()], { type: "image/gif" });
  } finally {
    urls.forEach((url) => URL.revokeObjectURL(url));
  }
}

async function createSingleVideoPaperGifBlob(segment) {
  const gifenc = await loadGifEncoder();
  const { GIFEncoder, applyPalette, quantize } = gifenc;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const video = document.createElement("video");
  const url = URL.createObjectURL(segment.blob);
  const gif = GIFEncoder();

  canvas.width = singleGifPaperSize.width;
  canvas.height = singleGifPaperSize.height;
  setHighQualityCanvas(context);
  video.src = url;
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";

  try {
    await waitForVideoEvent(video, "loadedmetadata");
    const expectedDuration = segment.expectedDuration || 0;
    const duration = Number.isFinite(video.duration) && video.duration > 0
      ? video.duration
      : expectedDuration || stripGifSegmentDuration;
    const startTime = duration * (segment.startFraction ?? 0);
    const segmentDuration = Math.max(0.9, expectedDuration || duration * (segment.durationFraction ?? 1));
    const endTime = Math.max(startTime, Math.min(duration - 0.05, startTime + segmentDuration));
    const loopDuration = Math.max(0.9, endTime - startTime);
    const { frameCount, frameDelay } = getGifFrameTiming(loopDuration);
    const tone = getTone();
    const paper = getPaper();

    for (let index = 0; index < frameCount; index += 1) {
      const localTime = Math.min(loopDuration - 0.05, (loopDuration * index) / frameCount);
      await seekVideo(video, Math.max(startTime, Math.min(endTime, startTime + localTime)));
      drawSingleComposition(context, video, tone, paper, canvas.width, canvas.height, false);
      const frame = context.getImageData(0, 0, canvas.width, canvas.height).data;
      const palette = quantize(frame, 256);
      const indexed = applyPalette(frame, palette);
      gif.writeFrame(indexed, canvas.width, canvas.height, { palette, delay: frameDelay });
    }

    gif.finish();
    return new Blob([gif.bytes()], { type: "image/gif" });
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function loadGifEncoder() {
  if (window.gifenc?.GIFEncoder) {
    return window.gifenc;
  }

  gifEncoderModulePromise ||= import("./vendor/gifenc.esm.js").then((module) => {
    return module.default || module;
  });

  return gifEncoderModulePromise;
}

function stopFinalPreviewLoop() {
  window.clearTimeout(state.finalPreviewTimer);
  state.finalPreviewTimer = 0;
  state.finalPreviewToken += 1;
  finalFocus.classList.remove("is-showing-gif");
  finalGifPreview.hidden = true;
  finalGifPreview.removeAttribute("src");
  state.finalPreviewGifBlob = null;

  if (state.finalPreviewGifUrl) {
    URL.revokeObjectURL(state.finalPreviewGifUrl);
    state.finalPreviewGifUrl = "";
  }
}

function scheduleFinalPreviewLoop(showGif = false) {
  window.clearTimeout(state.finalPreviewTimer);
  if (!state.finalPreviewGifBlob || appShell.dataset.view !== "final") return;

  if (showGif) {
    if (state.finalPreviewGifUrl) URL.revokeObjectURL(state.finalPreviewGifUrl);
    state.finalPreviewGifUrl = URL.createObjectURL(state.finalPreviewGifBlob);
    let didReveal = false;
    const revealGif = () => {
      if (didReveal || appShell.dataset.view !== "final") return;
      didReveal = true;
      finalFocus.classList.add("is-showing-gif");
      state.finalPreviewTimer = window.setTimeout(() => {
        scheduleFinalPreviewLoop(false);
      }, 3000);
    };

    finalGifPreview.onload = revealGif;
    finalGifPreview.removeAttribute("src");
    finalGifPreview.src = state.finalPreviewGifUrl;
    window.setTimeout(revealGif, 120);
    return;
  }

  finalFocus.classList.remove("is-showing-gif");
  state.finalPreviewTimer = window.setTimeout(() => {
    scheduleFinalPreviewLoop(true);
  }, 3000);
}

async function prepareFinalPreviewLoop() {
  stopFinalPreviewLoop();
  finalFocus.classList.remove("is-showing-gif");

  const token = state.finalPreviewToken;
  try {
    const blob = await createStripGifBlob();
    if (token !== state.finalPreviewToken || appShell.dataset.view !== "final") return;

    state.finalPreviewGifBlob = blob;
    finalGifPreview.hidden = false;
    scheduleFinalPreviewLoop(false);
  } catch (error) {
    console.warn("MARVELL20 final GIF preview failed", error);
  }
}

async function showGifQr() {
  const record = await prepareFinalSession();
  setExportBusy(true);
  gifButton.textContent = "Preparing...";

  try {
    const blob = state.finalPreviewGifBlob || await createStripGifBlob();
    const upload = await uploadToCloudinary(blob, record, "gif");
    await updateSessionRecord({
      gifCloudinaryUrl: getCloudinaryDeliveryUrl(upload, "gif"),
      gifCloudinaryPublicId: upload.public_id,
      exportStatus: "scanned_gif",
    });
    showCloudinaryQr(activeSessionRecord, "gif");
  } catch (error) {
    console.warn("MARVELL20 GIF export failed", error);
    gifButton.textContent = "Try Again";
    window.setTimeout(() => {
      gifButton.textContent = "GIF";
    }, 1400);
  } finally {
    setExportBusy(false);
  }
}

function startAgain() {
  stopCamera();
  resetSession();
  setView("home");
}

function resetInactivityTimer() {
  window.clearTimeout(inactivityTimer);
  if (appShell.dataset.view === "home") return;
  inactivityTimer = window.setTimeout(() => {
    document.body.classList.add("is-resetting");
    window.setTimeout(() => {
      document.body.classList.remove("is-resetting");
      startAgain();
    }, 420);
  }, inactivityTimeoutMs);
}

function refreshRenderedPreviews() {
  renderAll().catch((error) => {
    console.warn("MARVELL20 preview render failed", error);
  });
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js?v=photobooth-40").catch(() => {});
  });
}

beginButton.addEventListener("click", (event) => {
  event.stopPropagation();
  beginSession();
});
homeView.addEventListener("pointerup", (event) => {
  if (event.target.closest("button")) return;
  beginSession();
});
archiveButton.addEventListener("click", showArchive);
formatButtons.forEach((button) => {
  button.addEventListener("click", () => chooseFormat(button.dataset.formatChoice));
});
sourceButton.addEventListener("click", openCameraDialog);
changeCameraButton.hidden = true;
changeCameraButton.addEventListener("click", openCameraDialog);
applyCameraButton.addEventListener("click", () => startCamera(cameraSelect.value));
captureButton.addEventListener("click", captureFlow);
retakeButton.addEventListener("click", () => beginRetake());
toneNextButton.addEventListener("click", showToneStep);
paperNextButton.addEventListener("click", showPaperStep);
finalNextButton.addEventListener("click", showFinal);
exportButton.addEventListener("click", showPhotoQr);
airdropButton.addEventListener("click", shareFinalImage);
gifButton.addEventListener("click", showGifQr);
startAgainButton.addEventListener("click", startAgain);
scanBackButton.addEventListener("click", () => {
  setView("final");
  prepareFinalPreviewLoop();
});
scanStartAgainButton.addEventListener("click", startAgain);
archiveRefreshButton.addEventListener("click", showArchive);
archiveBackButton.addEventListener("click", startAgain);

["pointerdown", "keydown", "touchstart"].forEach((eventName) => {
  document.addEventListener(eventName, resetInactivityTimer, { passive: true });
});

document.addEventListener("keydown", (event) => {
  if (event.key === " " && appShell.dataset.view === "camera") {
    event.preventDefault();
    captureFlow();
  }

  if (event.key === "Escape" && appShell.dataset.view !== "home") {
    startAgain();
  }
});

appShell.addEventListener("pointerup", (event) => {
  if (appShell.dataset.view !== "camera") return;
  if (event.target.closest("button, select, dialog")) return;

  window.clearTimeout(cameraTapTimer);
  cameraTapCount += 1;
  cameraTapTimer = window.setTimeout(() => {
    cameraTapCount = 0;
  }, 900);

  if (cameraTapCount >= 3) {
    cameraTapCount = 0;
    window.clearTimeout(cameraTapTimer);
    cycleCamera().catch((error) => console.warn("MARVELL20 camera switch failed", error));
  }
});

drawFormatSamples();
syncCameraStageRatio();
refreshRenderedPreviews();
