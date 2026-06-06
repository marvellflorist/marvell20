const appShell = document.querySelector(".app-shell");
const beginButton = document.querySelector("#beginButton");
const archiveButton = document.querySelector("#archiveButton");
const sourceButton = document.querySelector("#sourceButton");
const changeCameraButton = document.querySelector("#changeCameraButton");
const applyCameraButton = document.querySelector("#applyCameraButton");
const cameraDialog = document.querySelector("#cameraDialog");
const cameraSelect = document.querySelector("#cameraSelect");
const cameraStage = document.querySelector("#cameraStage");
const cameraVideo = document.querySelector("#cameraVideo");
const cameraFallback = document.querySelector("#cameraFallback");
const captureCanvas = document.querySelector("#captureCanvas");
const countdown = document.querySelector("#countdown");
const captureButton = document.querySelector("#captureButton");
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
const finalCanvas = document.querySelector("#finalCanvas");
const exportButton = document.querySelector("#exportButton");
const printButton = document.querySelector("#printButton");
const startAgainButton = document.querySelector("#startAgainButton");
const qrCanvas = document.querySelector("#qrCanvas");
const qrStatus = document.querySelector("#qrStatus");
const doneButton = document.querySelector("#doneButton");
const paymentConfirmedButton = document.querySelector("#paymentConfirmedButton");
const paymentBackButton = document.querySelector("#paymentBackButton");
const printDoneButton = document.querySelector("#printDoneButton");
const printStartAgainButton = document.querySelector("#printStartAgainButton");
const archiveGrid = document.querySelector("#archiveGrid");
const archivePreviewImage = document.querySelector("#archivePreviewImage");
const archiveEmpty = document.querySelector("#archiveEmpty");
const archiveRefreshButton = document.querySelector("#archiveRefreshButton");
const archiveBackButton = document.querySelector("#archiveBackButton");

const captureCount = 1;
const portraitSize = { width: 1600, height: 2400 };
const printSize = { width: 2400, height: 3600 };
const previewSize = { width: 600, height: 900 };
const paperPattern = new Image();
paperPattern.src = "pattern.webp";
const paperPatternArchive = new Image();
paperPatternArchive.src = "pattern2.webp";
const archiveStoreName = "sessions";
const cloudinaryCloudName = "dz2ajhfsm";
const cloudinaryUploadPreset = "marvell20_upload";
const exportReadyText = "Scan to save your portrait.";
const inactivityTimeoutMs = 7 * 60 * 1000;
const imageCache = new Map();
const previewCache = new Map();
let inactivityTimer = null;
let activeSessionRecord = null;
let activePrintDataUrl = "";
let activeExportDownloadUrl = "";
let activeExportFile = null;
let archiveRecords = [];
let selectedArchiveId = "";

const tones = [
  { id: "natural", name: "Natural", filter: "contrast(1.02) saturate(0.96) sepia(0.025) brightness(1.02)" },
  { id: "archive", name: "Archive", filter: "grayscale(1) saturate(0) contrast(1.32) brightness(1.05)" },
];

const papers = [
  { id: "classic", name: "Garden Reverie", background: "#f4e5cb", ink: "#241c18", accent: "#9a7b49", margin: 112, pattern: "classic" },
  { id: "archive", name: "Midnight Bloom", background: "#ead8b8", ink: "#4b3325", accent: "#8c724b", margin: 132, pattern: "archive" },
];

const state = {
  stream: null,
  devices: [],
  captures: [],
  selectedIndex: 0,
  retakeIndex: null,
  selectedTone: "",
  selectedPaper: "",
  isCapturing: false,
  audioContext: null,
  sessionId: "",
  previewVersion: 0,
  selectedDeviceId: "",
};

function setView(view) {
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
  setView("camera");
  await startCamera();
}

function resetSession() {
  state.captures = [];
  state.selectedIndex = 0;
  state.retakeIndex = null;
  state.selectedTone = "";
  state.selectedPaper = "";
  state.sessionId = "";
  activeSessionRecord = null;
  activePrintDataUrl = "";
  activeExportDownloadUrl = "";
  activeExportFile = null;
  imageCache.clear();
  previewCache.clear();
  state.previewVersion += 1;
  qrCanvas.hidden = false;
  qrStatus.textContent = exportReadyText;
  doneButton.disabled = false;
  paymentConfirmedButton.disabled = false;
  paymentBackButton.disabled = false;
  updateStepButtons();
  renderAll().catch(() => {});
}

async function startCamera(deviceId = state.selectedDeviceId) {
  stopCamera();

  if (!navigator.mediaDevices?.getUserMedia) {
    showCameraFallback();
    return;
  }

  const constraints = {
    audio: false,
    video: {
      width: { ideal: 1920 },
      height: { ideal: 2880 },
      aspectRatio: { ideal: portraitSize.width / portraitSize.height },
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
    state.selectedDeviceId =
      state.stream.getVideoTracks()[0]?.getSettings().deviceId || deviceId || "";
    await refreshCameraDevices();
  } catch (error) {
    showCameraFallback();
  }
}

function stopCamera() {
  if (!state.stream) return;
  state.stream.getTracks().forEach((track) => track.stop());
  state.stream = null;
}

function showCameraFallback() {
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

async function openCameraDialog() {
  await refreshCameraDevices();
  applyCameraButton.disabled = !state.devices.length;
  cameraDialog.showModal();
}

async function captureFlow() {
  if (state.isCapturing) return;

  setBusy(true);
  await unlockAudio();

  const targetCount = state.retakeIndex === null ? captureCount : 1;

  if (state.retakeIndex === null) {
    state.captures = [];
    state.selectedIndex = 0;
  }

  for (let index = 0; index < targetCount; index += 1) {
    await runCountdown();
    const capture = capturePortrait();
    if (state.retakeIndex === null) {
      state.captures.push(capture);
      state.selectedIndex = state.captures.length - 1;
    } else {
      state.captures[state.retakeIndex] = capture;
      state.selectedIndex = state.retakeIndex;
      state.retakeIndex = null;
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

async function runCountdown() {
  for (const beat of ["3", "2", "1"]) {
    countdown.textContent = beat;
    countdown.classList.add("is-visible");
    await sleep(560);
    countdown.classList.remove("is-visible");
    await sleep(150);
  }
}

function capturePortrait() {
  const hasVideo = cameraVideo.videoWidth && cameraVideo.videoHeight;
  const sourceWidth = hasVideo ? cameraVideo.videoWidth : 1920;
  const sourceHeight = hasVideo ? cameraVideo.videoHeight : 2400;
  const targetRatio = portraitSize.width / portraitSize.height;
  const sourceRatio = sourceWidth / sourceHeight;
  let sx = 0;
  let sy = 0;
  let sw = sourceWidth;
  let sh = sourceHeight;

  if (sourceRatio > targetRatio) {
    sw = sourceHeight * targetRatio;
    sx = (sourceWidth - sw) / 2;
  } else {
    sh = sourceWidth / targetRatio;
    sy = (sourceHeight - sh) / 2;
  }

  captureCanvas.width = portraitSize.width;
  captureCanvas.height = portraitSize.height;
  const context = captureCanvas.getContext("2d");

  if (hasVideo) {
    context.save();
    context.translate(portraitSize.width, 0);
    context.scale(-1, 1);
    context.drawImage(cameraVideo, sx, sy, sw, sh, 0, 0, portraitSize.width, portraitSize.height);
    context.restore();
  } else {
    drawFallbackPortrait(context, portraitSize.width, portraitSize.height);
  }

  return captureCanvas.toDataURL("image/jpeg", 0.94);
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
  context.fillText("MARVELL 20", width / 2, height / 2);
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
}

function markFinalDirty() {
  activeSessionRecord = null;
  activePrintDataUrl = "";
  activeExportDownloadUrl = "";
  activeExportFile = null;
}

function updateStepButtons() {
  paperNextButton.disabled = !state.selectedTone;
  finalNextButton.disabled = !state.selectedPaper;
}

async function renderAll() {
  renderReview();
  const image = await preloadSelectedCaptureImage();
  await Promise.all([
    renderToneControls(image),
    renderPaperControls(image),
    renderComposition(finalCanvas, { width: portraitSize.width, height: portraitSize.height, image }),
  ]);
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

function updateChoiceActiveState(container, selectedId) {
  container.querySelectorAll(".visual-choice").forEach((button) => {
    const isActive = button.dataset.choiceId === selectedId;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

async function renderToneControls(image) {
  const renderedButtons = await Promise.all(tones.map(async (tone) => {
    const canvas = document.createElement("canvas");
    canvas.width = previewSize.width;
    canvas.height = previewSize.height;
    await renderCachedComposition(canvas, {
      width: previewSize.width,
      height: previewSize.height,
      toneId: tone.id,
      paperless: true,
      compact: true,
      image,
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
      const selectedImage = await preloadSelectedCaptureImage();
      await Promise.all([
        renderPaperControls(selectedImage),
        renderComposition(finalCanvas, { width: portraitSize.width, height: portraitSize.height, image: selectedImage }),
      ]);
    });
    return button;
  }));

  toneControls.replaceChildren(...renderedButtons);
  updateStepButtons();
}

async function renderPaperControls(image) {
  const renderedButtons = await Promise.all(papers.map(async (paper) => {
    const canvas = document.createElement("canvas");
    canvas.width = previewSize.width;
    canvas.height = previewSize.height;
    await renderCachedComposition(canvas, {
      width: previewSize.width,
      height: previewSize.height,
      toneId: state.selectedTone,
      paperId: paper.id,
      compact: true,
      image,
    });

    const button = document.createElement("button");
    button.type = "button";
    button.className = "visual-choice";
    button.dataset.choiceId = paper.id;
    button.classList.toggle("is-active", paper.id === state.selectedPaper);
    button.setAttribute("aria-pressed", paper.id === state.selectedPaper ? "true" : "false");
    button.innerHTML = `<span>${paper.name}</span>`;
    button.prepend(canvas);
    button.addEventListener("click", async () => {
      state.selectedPaper = paper.id;
      markFinalDirty();
      updateChoiceActiveState(paperControls, paper.id);
      updateStepButtons();
      const selectedImage = await preloadSelectedCaptureImage();
      await Promise.all([
        renderCachedComposition(paperCanvas, { width: portraitSize.width, height: portraitSize.height, image: selectedImage }),
        renderComposition(finalCanvas, { width: portraitSize.width, height: portraitSize.height, image: selectedImage }),
      ]);
    });
    return button;
  }));

  paperControls.replaceChildren(...renderedButtons);
  updateStepButtons();
}

function getTone(id = state.selectedTone) {
  return tones.find((tone) => tone.id === id) || tones[0];
}

function getPaper(id = state.selectedPaper) {
  return papers.find((paper) => paper.id === id) || papers[0];
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

function createPreviewCacheKey(options) {
  const width = options.width || portraitSize.width;
  const height = options.height || portraitSize.height;
  return [
    state.previewVersion,
    width,
    height,
    options.toneId || state.selectedTone,
    options.paperId || state.selectedPaper,
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
    if (image) drawCoverImage(context, image, 0, 0, width, height);
    return;
  }

  await renderComposition(canvas, options);
  if (options.compact || options.paperless) {
    previewCache.set(key, canvas.toDataURL("image/png"));
  }
}

async function renderComposition(canvas, options = {}) {
  const width = options.width || portraitSize.width;
  const height = options.height || portraitSize.height;
  const tone = getTone(options.toneId);
  const paper = getPaper(options.paperId);
  const context = canvas.getContext("2d");
  const image = options.image || await preloadSelectedCaptureImage();

  canvas.width = width;
  canvas.height = height;
  canvas.dataset.ratio = `${width}x${height}`;

  if (options.paperless) {
    drawToneOnlyComposition(context, image, tone, width, height, options.compact);
    return;
  }

  drawPortraitComposition(context, image, tone, paper, width, height, options.compact);
}

function drawPortraitComposition(context, image, tone, paper, width, height, compact = false) {
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

function drawToneOnlyComposition(context, image, tone, width, height, compact = false) {
  context.fillStyle = "#211b18";
  context.fillRect(0, 0, width, height);
  drawTonedImage(context, image, tone, { x: 0, y: 0, width, height });
  if (tone.id === "archive") {
    drawFineGrain(context, width, height, compact ? 7 : 11);
  }
}

function drawPaper(context, paper, width, height) {
  context.fillStyle = paper.background;
  context.fillRect(0, 0, width, height);

  const patternImage = paper.pattern === "archive" ? paperPatternArchive : paperPattern;
  if (paper.pattern && patternImage.complete && patternImage.naturalWidth) {
    context.save();
    context.globalAlpha = paper.pattern === "archive" ? 0.9 : 0.82;
    drawCoverImage(context, patternImage, 0, 0, width, height);
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

function drawCoverImage(context, image, x, y, width, height) {
  const imageRatio = image.width / image.height;
  const frameRatio = width / height;
  let sw = image.width;
  let sh = image.height;
  let sx = 0;
  let sy = 0;

  if (imageRatio > frameRatio) {
    sw = image.height * frameRatio;
    sx = (image.width - sw) / 2;
  } else {
    sh = image.width / frameRatio;
    sy = (image.height - sh) / 2;
  }

  context.drawImage(image, sx, sy, sw, sh, x, y, width, height);
}

function drawContainImage(context, image, x, y, width, height) {
  const imageRatio = image.width / image.height;
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

async function saveWebsiteArchiveRecord(record) {
  const response = await fetch(new URL("/api/archive", window.location.origin), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: record.id,
      timestamp: record.timestamp,
      image: record.finalImage,
      selectedFilter: record.selectedFilter,
      selectedPaper: record.selectedPaper,
    }),
  });

  if (!response.ok) {
    throw new Error("Website archive save failed");
  }

  return response.json();
}

async function getWebsiteArchiveRecords() {
  const response = await fetch(new URL("/api/archive", window.location.origin), {
    method: "GET",
    headers: { "Accept": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Website archive is unavailable");
  }

  const payload = await response.json();
  return (payload.records || []).map((record) => ({
    id: record.id,
    timestamp: record.timestamp,
    selectedFilter: record.selectedFilter,
    selectedPaper: record.selectedPaper,
    finalImage: new URL(record.imageUrl, window.location.origin).href,
    archiveSource: "website",
  }));
}

async function updateSessionRecord(updates) {
  if (!activeSessionRecord) return;
  activeSessionRecord = { ...activeSessionRecord, ...updates };
  try {
    await saveSessionRecord(activeSessionRecord);
  } catch (error) {
    console.warn("MARVELL 20 archive update failed", error);
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
  archivePreviewImage.src = selectedRecord.finalImage;

  archiveRecords.forEach((record) => {
    const button = document.createElement("button");
    const time = formatArchiveTimestamp(record.timestamp);
    button.type = "button";
    button.className = "archive-item";
    button.classList.toggle("is-active", record.id === selectedRecord.id);
    button.setAttribute("aria-label", `Archived portrait ${time}`);
    button.innerHTML = `
      <img src="${record.finalImage}" alt="" />
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
    const websiteRecords = await getWebsiteArchiveRecords();
    websiteRecords.forEach((record) => recordsById.set(record.id, record));
  } catch (error) {
    console.warn("MARVELL 20 website archive load failed", error);
  }

  try {
    const browserRecords = await getArchiveRecords();
    browserRecords.forEach((record) => {
      if (!recordsById.has(record.id)) {
        recordsById.set(record.id, { ...record, archiveSource: "browser" });
      }
    });
  } catch (error) {
    console.warn("MARVELL 20 browser archive load failed", error);
  }

  archiveRecords = Array.from(recordsById.values()).sort((left, right) => {
    return new Date(right.timestamp || 0).getTime() - new Date(left.timestamp || 0).getTime();
  });
  renderArchive();
}

async function prepareFinalSession() {
  if (activeSessionRecord) return activeSessionRecord;

  await renderComposition(finalCanvas, portraitSize);
  const finalImage = finalCanvas.toDataURL("image/png");
  state.sessionId = state.sessionId || createSessionId();
  activeSessionRecord = {
    id: state.sessionId,
    timestamp: new Date().toISOString(),
    finalImage,
    selectedFilter: state.selectedTone,
    selectedPaper: state.selectedPaper,
    exportStatus: "ready",
    printStatus: "not_requested",
  };

  try {
    await saveSessionRecord(activeSessionRecord);
  } catch (error) {
    console.warn("MARVELL 20 archive save failed", error);
  }

  try {
    await saveWebsiteArchiveRecord(activeSessionRecord);
  } catch (error) {
    console.warn("MARVELL 20 website archive save failed", error);
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

async function createPortraitDownload(record) {
  const response = await fetch(new URL("/api/portraits", window.location.origin), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: record.id,
      image: record.finalImage,
    }),
  });

  let result = {};
  try {
    result = await response.json();
  } catch (error) {
    result = {};
  }

  if (!response.ok || !result.downloadUrl) {
    throw new Error(result.error || "Portrait download page could not be created");
  }

  return result;
}

async function sendPortraitToPrinter(record, imageDataUrl) {
  const response = await fetch(new URL("/api/print", window.location.origin), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: record.id,
      image: imageDataUrl,
    }),
  });

  let result = {};
  try {
    result = await response.json();
  } catch (error) {
    result = {};
  }

  if (!response.ok || !result.ok) {
    throw new Error(result.error || "Portrait could not be sent to the printer");
  }

  return result;
}

function beginRetake(index = state.selectedIndex) {
  if (!state.captures.length) return;
  state.retakeIndex = index;
  setView("camera");
}

async function showFinal() {
  if (!state.selectedPaper) return;
  await prepareFinalSession();
  setView("final");
}

async function showToneStep() {
  toneNextButton.disabled = true;

  try {
    const image = await preloadSelectedCaptureImage();
    await renderToneControls(image);
    setView("tone");
  } finally {
    toneNextButton.disabled = false;
  }
}

async function showPaperStep() {
  if (!state.selectedTone) return;
  paperNextButton.disabled = true;

  try {
    const image = await preloadSelectedCaptureImage();
    await renderPaperControls(image);
    setView("paper");
  } finally {
    paperNextButton.disabled = false;
  }
}

function isLocalQrExportEnabled() {
  const params = new URLSearchParams(window.location.search);
  const hostname = window.location.hostname;
  const isPublicPagesApp = hostname.endsWith("github.io");
  return params.get("qr") === "local" && !isPublicPagesApp;
}

function createPortraitFileName(record, extension = "jpg") {
  const id = (record?.id || state.sessionId || Date.now().toString())
    .replace(/[^a-z0-9-]/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return `${id || Date.now()}.${extension}`;
}

function createCloudinaryPublicId(record) {
  const sourceId = record?.id || state.sessionId || createSessionId();
  const sessionMatch = String(sourceId).match(/^M20-(\d{14})-([A-Z0-9]+)$/i);
  if (sessionMatch) {
    return `m20-${sessionMatch[1].slice(6)}-${sessionMatch[2].toLowerCase()}`;
  }

  return sourceId
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 20);
}

function canvasToBlob(canvas, type = "image/jpeg", quality = 0.92) {
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

async function createFinalPortraitJpegBlob() {
  await renderComposition(finalCanvas, portraitSize);
  return canvasToBlob(finalCanvas, "image/jpeg", 0.92);
}

function createCloudinaryUploadForm(blob, record, includePublicId = true) {
  const form = new FormData();
  form.append("file", blob, createPortraitFileName(record, "jpg"));
  form.append("upload_preset", cloudinaryUploadPreset);
  if (includePublicId) {
    form.append("public_id", createCloudinaryPublicId(record));
  }
  return form;
}

async function postCloudinaryUpload(form) {
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`, {
    method: "POST",
    body: form,
  });

  let payload = {};
  try {
    payload = await response.json();
  } catch (error) {
    payload = {};
  }

  if (!response.ok || !payload.secure_url) {
    throw new Error("Portrait upload failed");
  }

  return payload.secure_url;
}

async function uploadPortraitToCloudinary(record) {
  const blob = await createFinalPortraitJpegBlob();

  try {
    return await postCloudinaryUpload(createCloudinaryUploadForm(blob, record, true));
  } catch (error) {
    console.warn("MARVELL 20 Cloudinary named upload failed", error);
    return postCloudinaryUpload(createCloudinaryUploadForm(blob, record, false));
  }
}

function setExportBusy(isBusy) {
  exportButton.disabled = isBusy;
  finalNextButton.disabled = isBusy || !state.selectedPaper;
  doneButton.disabled = isBusy;
}

async function showCloudinaryExport() {
  const record = await prepareFinalSession();
  setView("qr");
  qrCanvas.hidden = true;
  qrStatus.textContent = "Preparing portrait...";
  setExportBusy(true);

  try {
    activeExportDownloadUrl = activeExportDownloadUrl || await uploadPortraitToCloudinary(record);
    drawSessionQrCode(qrCanvas, activeExportDownloadUrl);
    qrCanvas.hidden = false;
    qrStatus.textContent = exportReadyText;
    await updateSessionRecord({
      exportStatus: "cloudinary_ready",
      exportUrl: activeExportDownloadUrl,
    });
  } catch (error) {
    console.warn("MARVELL 20 Cloudinary export failed", error);
    qrStatus.textContent = "Portrait could not be prepared. Please ask the operator.";
    await updateSessionRecord({ exportStatus: "cloudinary_failed" });
  } finally {
    setExportBusy(false);
  }
}

async function showLocalQrExport() {
  const record = await prepareFinalSession();
  setView("qr");
  qrCanvas.hidden = true;
  qrStatus.textContent = "Preparing QR...";
  setExportBusy(true);

  try {
    const exportInfo = await createPortraitDownload(record);
    activeExportDownloadUrl = exportInfo.downloadUrl;
    drawSessionQrCode(qrCanvas, activeExportDownloadUrl);
    qrCanvas.hidden = false;
    qrStatus.textContent = exportReadyText;
    await updateSessionRecord({
      exportStatus: "qr_ready",
      exportUrl: activeExportDownloadUrl,
      exportToken: exportInfo.token,
    });
  } catch (error) {
    console.warn("MARVELL 20 QR export failed", error);
    qrStatus.textContent = "Portrait could not be prepared. Please ask the operator.";
    await updateSessionRecord({ exportStatus: "qr_failed" });
  } finally {
    setExportBusy(false);
  }
}

async function showExport() {
  if (isLocalQrExportEnabled()) {
    await showLocalQrExport();
    return;
  }

  await showCloudinaryExport();
}

function showPaymentScreen() {
  setView("payment");
  updateSessionRecord({ printStatus: "payment_requested" }).catch(() => {});
}

async function preparePrintHandoff() {
  const canvas = document.createElement("canvas");
  await renderComposition(canvas, printSize);
  activePrintDataUrl = canvas.toDataURL("image/jpeg", 0.92);
}

async function confirmPaymentAndShowPrintHandoff() {
  paymentConfirmedButton.disabled = true;
  paymentBackButton.disabled = true;
  try {
    const record = await prepareFinalSession();
    await preparePrintHandoff();
    await sendPortraitToPrinter(record, activePrintDataUrl);
    await updateSessionRecord({ printStatus: "sent_to_printer" });
    setView("print");
  } catch (error) {
    console.warn("MARVELL 20 print handoff failed", error);
    await updateSessionRecord({ printStatus: "print_failed" }).catch(() => {});
    setView("print");
  } finally {
    paymentConfirmedButton.disabled = false;
    paymentBackButton.disabled = false;
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
    console.warn("MARVELL 20 preview render failed", error);
  });
}

paperPattern.addEventListener("load", refreshRenderedPreviews);
paperPatternArchive.addEventListener("load", refreshRenderedPreviews);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js?v=flow-4").catch(() => {});
  });
}

beginButton.addEventListener("click", beginSession);
archiveButton.addEventListener("click", showArchive);
sourceButton.addEventListener("click", openCameraDialog);
changeCameraButton.addEventListener("click", openCameraDialog);
applyCameraButton.addEventListener("click", () => startCamera(cameraSelect.value));
captureButton.addEventListener("click", captureFlow);
retakeButton.addEventListener("click", () => beginRetake());
toneNextButton.addEventListener("click", showToneStep);
paperNextButton.addEventListener("click", showPaperStep);
finalNextButton.addEventListener("click", showFinal);
exportButton.addEventListener("click", showExport);
printButton.addEventListener("click", showPaymentScreen);
startAgainButton.addEventListener("click", startAgain);
paymentConfirmedButton.addEventListener("click", confirmPaymentAndShowPrintHandoff);
paymentBackButton.addEventListener("click", () => setView("final"));
doneButton.addEventListener("click", startAgain);
printDoneButton.addEventListener("click", startAgain);
printStartAgainButton.addEventListener("click", startAgain);
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

refreshRenderedPreviews();
