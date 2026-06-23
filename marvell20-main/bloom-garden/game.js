const STORAGE_KEY = "bloom-garden-contributions-v1";

const FLOWERS = [
  { id: "rose", label: "Rose", color: "#cf3f60", accent: "#8d1732" },
  { id: "orchid", label: "Orchid", color: "#b884df", accent: "#6e3d9a" },
  { id: "carnation", label: "Carnation", color: "#f08b9c", accent: "#b54861" },
  { id: "anthurium", label: "Anthurium", color: "#de3843", accent: "#8e1126" },
  { id: "lily", label: "Lily", color: "#fff2d9", accent: "#d1a35d" },
  { id: "tulip", label: "Tulip", color: "#f07c52", accent: "#b93631" },
  { id: "chrysanthemum", label: "Chrysanthemum", color: "#efc95a", accent: "#b8811e" },
  { id: "hydrangea", label: "Hydrangea", color: "#8fb8e6", accent: "#5577b6" },
];

const ZONES = [
  { id: "zone-01", x: 11, y: 78, scale: 1.10 },
  { id: "zone-02", x: 23, y: 69, scale: 0.90 },
  { id: "zone-03", x: 34, y: 82, scale: 1.00 },
  { id: "zone-04", x: 45, y: 72, scale: 0.86 },
  { id: "zone-05", x: 56, y: 82, scale: 1.05 },
  { id: "zone-06", x: 68, y: 70, scale: 0.92 },
  { id: "zone-07", x: 84, y: 79, scale: 1.12 },
  { id: "zone-08", x: 16, y: 60, scale: 0.78 },
  { id: "zone-09", x: 30, y: 58, scale: 0.72 },
  { id: "zone-10", x: 50, y: 61, scale: 0.76 },
  { id: "zone-11", x: 70, y: 59, scale: 0.74 },
  { id: "zone-12", x: 88, y: 63, scale: 0.78 },
];

const COPY = {
  defaultInstruction: "Tap an empty patch to plant your flower.",
  joined: "Your bloom has joined the garden.",
  occupied: "This patch is already blooming.",
  missingName: "Please enter your name.",
  missingFlower: "Please choose a flower.",
  full: "The garden is full for now.",
  reset: "Garden reset.",
};

const game = document.querySelector(".game");
const garden = document.querySelector(".garden");
const picker = document.querySelector("#flowerPicker");
const nameInput = document.querySelector("#nameInput");
const instructionText = document.querySelector("#instructionText");
const plantedCount = document.querySelector("#plantedCount");
const selectedPreview = document.querySelector("#selectedPreview");
const tooltip = document.querySelector("#tooltip");
const toast = document.querySelector("#toast");
const cornerReset = document.querySelector("#cornerReset");

let selectedFlower = null;
let contributions = [];
let toastTimer = 0;
let tooltipTimer = 0;
let resetPresses = [];
let longPressTimer = 0;

function flowerById(id) {
  return FLOWERS.find((flower) => flower.id === id) || FLOWERS[0];
}

function safeReadStorage() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function saveStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contributions));
}

function getMoodForDate(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 6 && hour <= 15) return "morning";
  if (hour >= 16 && hour <= 18) return "dusk";
  return "night";
}

function updateMood() {
  game.dataset.mood = getMoodForDate();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2200);
}

function showTooltip(message, zoneElement) {
  const rect = zoneElement.getBoundingClientRect();
  tooltip.textContent = message;
  tooltip.style.setProperty("--tooltip-x", `${rect.left + rect.width / 2}px`);
  tooltip.style.setProperty("--tooltip-y", `${rect.top + rect.height * 0.15}px`);
  tooltip.hidden = false;
  window.clearTimeout(tooltipTimer);
  tooltipTimer = window.setTimeout(() => {
    tooltip.hidden = true;
  }, 2400);
}

function setInstruction(message) {
  instructionText.textContent = message;
}

function updateCount() {
  plantedCount.textContent = `${contributions.length} / ${ZONES.length} blooms`;
}

function updateSelectedPreview() {
  if (!selectedFlower) {
    selectedPreview.textContent = "No bloom selected";
    return;
  }

  selectedPreview.replaceChildren();
  const image = createCssFlower(selectedFlower, "preview-flower");
  const text = document.createElement("span");
  text.textContent = selectedFlower.label;
  selectedPreview.append(image, text);
}

function createCssFlower(flower, className = "") {
  const mark = document.createElement("span");
  mark.className = `css-bloom flower-${flower.id} ${className}`.trim();
  mark.style.setProperty("--flower-color", flower.color);
  mark.style.setProperty("--flower-accent", flower.accent);

  const stem = document.createElement("span");
  stem.className = "css-bloom-stem";
  const leaves = document.createElement("span");
  leaves.className = "css-bloom-leaves";
  const head = document.createElement("span");
  head.className = "css-bloom-head";
  const count = flower.id === "chrysanthemum" ? 18 : flower.id === "hydrangea" ? 13 : flower.id === "lily" ? 6 : flower.id === "anthurium" ? 5 : 8;

  for (let index = 0; index < count; index += 1) {
    const petal = document.createElement("span");
    petal.className = "css-bloom-petal";
    petal.style.setProperty("--petal-index", index);
    petal.style.setProperty("--petal-count", count);
    head.append(petal);
  }

  const core = document.createElement("span");
  core.className = "css-bloom-core";
  head.append(core);
  mark.append(stem, leaves, head);
  return mark;
}

function renderFlowerPicker() {
  picker.replaceChildren();
  FLOWERS.forEach((flower) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "flower-choice";
    button.dataset.flower = flower.id;
    button.setAttribute("aria-label", flower.label);

    const image = createCssFlower(flower, "choice-flower");

    const label = document.createElement("span");
    label.textContent = flower.label;

    button.append(image, label);
    button.addEventListener("click", () => {
      selectedFlower = flower;
      picker.querySelectorAll(".flower-choice").forEach((choice) => {
        choice.classList.toggle("is-selected", choice.dataset.flower === flower.id);
      });
      updateSelectedPreview();
      setInstruction(COPY.defaultInstruction);
    });
    picker.append(button);
  });
}

function renderZones() {
  garden.replaceChildren();
  ZONES.forEach((zone) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `plant-zone empty ${zone.y < 65 ? "depth-back" : "depth-front"}`;
    button.dataset.zoneId = zone.id;
    button.style.setProperty("--x", `${zone.x}%`);
    button.style.setProperty("--y", `${zone.y}%`);
    button.style.setProperty("--zone-scale", zone.scale);
    button.style.zIndex = String(Math.round(zone.y));
    button.setAttribute("aria-label", `Planting patch ${zone.id}`);

    ["zone-glow", "zone-shadow", "zone-back-grass", "flower-anchor", "zone-front-grass", "zone-haze", "zone-particles"].forEach((className) => {
      const layer = document.createElement("div");
      layer.className = className;
      button.append(layer);
    });

    button.addEventListener("click", () => handleZoneClick(zone, button));
    garden.append(button);
  });
}

function contributionForZone(zoneId) {
  return contributions.find((item) => item.zoneId === zoneId);
}

function renderSavedFlowers() {
  ZONES.forEach((zone) => {
    const zoneElement = garden.querySelector(`[data-zone-id="${zone.id}"]`);
    const contribution = contributionForZone(zone.id);
    renderZoneState(zoneElement, zone, contribution, false);
  });
  updateCount();
}

function renderZoneState(zoneElement, zone, contribution, isNew = false) {
  const anchor = zoneElement.querySelector(".flower-anchor");
  anchor.replaceChildren();
  zoneElement.classList.toggle("empty", !contribution);
  zoneElement.classList.toggle("planted", Boolean(contribution));
  zoneElement.classList.remove("just-planted");

  if (!contribution) return;

  const flower = flowerById(contribution.flower);
  const wrap = document.createElement("div");
  wrap.className = `flower-wrap flower-${flower.id}${isNew ? " is-new" : ""}`;
  wrap.style.setProperty("--offset-x", `${contribution.offsetX || 0}px`);
  wrap.style.setProperty("--rotation", `${contribution.rotation || 0}deg`);
  wrap.style.setProperty("--flower-scale", contribution.scale || 1);

  const image = createCssFlower(flower, "planted-flower");
  image.setAttribute("aria-label", `${flower.label} planted by ${contribution.name}`);

  wrap.append(image);
  anchor.append(wrap);

  if (isNew) {
    zoneElement.classList.add("just-planted");
    createLocalBurst(zoneElement);
    window.setTimeout(() => {
      zoneElement.classList.remove("just-planted");
      wrap.classList.remove("is-new");
    }, 1100);
  }
}

function validatePlanting(zone) {
  const name = nameInput.value.trim();
  if (contributions.length >= ZONES.length && !contributionForZone(zone.id)) {
    showToast(COPY.full);
    setInstruction(COPY.full);
    return null;
  }
  if (!name) {
    showToast(COPY.missingName);
    setInstruction(COPY.missingName);
    nameInput.focus();
    return null;
  }
  if (!selectedFlower) {
    showToast(COPY.missingFlower);
    setInstruction(COPY.missingFlower);
    return null;
  }
  return name.slice(0, 18);
}

function handleZoneClick(zone, zoneElement) {
  const existing = contributionForZone(zone.id);
  if (existing) {
    showTooltip(`${existing.name} planted ${existing.flowerLabel}`, zoneElement);
    showToast(COPY.occupied);
    return;
  }

  const name = validatePlanting(zone);
  if (!name) return;

  const contribution = {
    id: `bloom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    flower: selectedFlower.id,
    flowerLabel: selectedFlower.label,
    zoneId: zone.id,
    offsetX: Math.round(-8 + Math.random() * 16),
    offsetY: Math.round(-4 + Math.random() * 8),
    rotation: Math.round(-7 + Math.random() * 14),
    scale: Number((0.92 + Math.random() * 0.2).toFixed(2)),
    createdAt: new Date().toISOString(),
  };

  contributions.push(contribution);
  saveStorage();
  renderZoneState(zoneElement, zone, contribution, true);
  updateCount();
  showToast(COPY.joined);
  setInstruction(COPY.joined);
  nameInput.value = "";
  selectedFlower = null;
  picker.querySelectorAll(".flower-choice").forEach((choice) => choice.classList.remove("is-selected"));
  updateSelectedPreview();
}

function createGlobalParticles() {
  const particleCount = Math.min(50, Math.max(30, Math.round(window.innerWidth / 28)));
  document.querySelectorAll(".particles").forEach((layer) => layer.replaceChildren());

  for (let index = 0; index < particleCount; index += 1) {
    const layer = index % 3 === 0 ? document.querySelector(".particles-front") : document.querySelector(".particles-back");
    const particle = document.createElement("span");
    const type = index % 7 === 0 ? "petal" : index % 5 === 0 ? "spark" : "dust";
    particle.className = `particle ${type}`;
    particle.style.setProperty("--x", `${Math.random() * 100}%`);
    particle.style.setProperty("--y", `${Math.random() * 100}%`);
    particle.style.setProperty("--size", `${3 + Math.random() * 9}px`);
    particle.style.setProperty("--opacity", `${0.18 + Math.random() * 0.62}`);
    particle.style.setProperty("--duration", `${9 + Math.random() * 16}s`);
    particle.style.setProperty("--delay", `${Math.random() * -18}s`);
    particle.style.setProperty("--drift-x", `${-28 + Math.random() * 56}vw`);
    particle.style.setProperty("--blur", `${Math.random() * 2.2}px`);
    particle.style.setProperty("--particle-animation", type === "petal" ? "petalDrift" : type === "spark" ? "fireflyFloat" : "dustFloat");
    layer.append(particle);
  }
}

function createLocalBurst(zoneElement) {
  const layer = zoneElement.querySelector(".zone-particles");
  layer.replaceChildren();
  const count = 8 + Math.floor(Math.random() * 7);
  for (let index = 0; index < count; index += 1) {
    const particle = document.createElement("span");
    particle.className = "local-particle";
    particle.style.setProperty("--burst-size", `${4 + Math.random() * 7}px`);
    particle.style.setProperty("--burst-x", `${-52 + Math.random() * 104}px`);
    particle.style.setProperty("--burst-y", `${-66 + Math.random() * 38}px`);
    particle.style.animationDelay = `${index * 18}ms`;
    layer.append(particle);
  }
  window.setTimeout(() => layer.replaceChildren(), 1000);
}

function resetGarden() {
  if (!window.confirm("Reset Bloom Garden?")) return;
  localStorage.removeItem(STORAGE_KEY);
  contributions = [];
  renderSavedFlowers();
  tooltip.hidden = true;
  showToast(COPY.reset);
}

function initHiddenReset() {
  window.addEventListener("keydown", (event) => {
    if (!event.shiftKey || event.key.toLowerCase() !== "r") return;
    const now = Date.now();
    resetPresses = resetPresses.filter((time) => now - time < 2000);
    resetPresses.push(now);
    if (resetPresses.length >= 3) {
      resetPresses = [];
      resetGarden();
    }
  });

  const startLongPress = () => {
    window.clearTimeout(longPressTimer);
    longPressTimer = window.setTimeout(resetGarden, 3000);
  };
  const cancelLongPress = () => window.clearTimeout(longPressTimer);
  cornerReset.addEventListener("pointerdown", startLongPress);
  cornerReset.addEventListener("pointerup", cancelLongPress);
  cornerReset.addEventListener("pointercancel", cancelLongPress);
  cornerReset.addEventListener("pointerleave", cancelLongPress);
}

function init() {
  contributions = safeReadStorage().filter((item) => ZONES.some((zone) => zone.id === item.zoneId));
  updateMood();
  window.setInterval(updateMood, 60000);
  renderFlowerPicker();
  renderZones();
  renderSavedFlowers();
  updateSelectedPreview();
  createGlobalParticles();
  initHiddenReset();
  window.addEventListener("resize", () => {
    window.clearTimeout(window.__bloomResizeTimer);
    window.__bloomResizeTimer = window.setTimeout(createGlobalParticles, 180);
  });
}

init();
