const EVENT_SETTINGS = {
  eventDate: "2026-06-15T10:00:00+07:00",
  eventEnd: "2026-07-04T18:00:00+07:00",
  mapsUrl: "https://maps.app.goo.gl/QiyWQqzRmfjGzMBH7",
  websiteUrl: "https://marvellflorist.com/",
  instagramUrl: "https://www.instagram.com/marvellflorist/",
  eventTitle: "MARVELL 20",
  locationDisplay: "RUKO KINTAMANI, BLOK C NO. 11, SECOND FLOOR",
  locationFull:
    "Komp. Ruko Kintamani, Jl. Raja H. Fisabilillah Blok C11, second floor, Teluk Tering, Batam Kota, Batam City, Riau Islands 29444",
};

const VIDEO_FALLBACK_DURATION = 33;
const REVEAL_DURATION = 2000;
const INVITE_CROSSFADE_AT = 1050;
const HOLD_FRAME_OFFSET = 0.12;
const FINAL_LOOP_DURATION = 3;
const FINAL_LOOP_FPS = 30;

const openingScreen = document.querySelector("#openingScreen");
const beginInvitation = document.querySelector("#beginInvitation");
const openingVideo = document.querySelector("#openingVideo");
const backgroundSound = document.querySelector("#backgroundSound");
const soundToggle = document.querySelector("#soundToggle");
const scrollPrompt = document.querySelector("#scrollPrompt");
const mainInvitation = document.querySelector("#mainInvitation");
const mapsLink = document.querySelector("#mapsLink");
const calendarButton = document.querySelector("#calendarButton");
const websiteLink = document.querySelector("#websiteLink");
const instagramLink = document.querySelector("#instagramLink");
const countdownTitle = document.querySelector("#countdown-title");
const countdownElement = document.querySelector(".countdown");
const languageButtons = document.querySelectorAll("[data-lang]");
const translatedElements = document.querySelectorAll("[data-en][data-id]");
const days = document.querySelector("#days");
const hours = document.querySelector("#hours");
const minutes = document.querySelector("#minutes");
const seconds = document.querySelector("#seconds");
const countdownDigits = [days, hours, minutes, seconds];
const LANGUAGE_LABELS = {
  en: {
    saveDate: "Save the date",
    closing: "Until closing",
    ended: "Thank you for joining us",
    soundOn: "Pause sound",
    soundOff: "Play sound",
  },
  id: {
    saveDate: "Catat tanggalnya",
    closing: "Menuju penutupan",
    ended: "Terima kasih sudah hadir",
    soundOn: "Matikan suara",
    soundOff: "Putar suara",
  },
};

let hasBegun = false;
let revealPlaybackStarted = false;
let revealTimer = 0;
let crossfadeTimer = 0;
let revealTimeHandler = null;
let finalLoopFrame = 0;
let finalLoopStartedAt = 0;
let finalLoopLastSeek = 0;
let scrollPromptTimer = 0;
let activeLanguage = "en";

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}
window.scrollTo({ top: 0, left: 0, behavior: "auto" });
document.body.classList.add("is-locked");
mapsLink.href = EVENT_SETTINGS.mapsUrl;
websiteLink.href = EVENT_SETTINGS.websiteUrl;
instagramLink.href = EVENT_SETTINGS.instagramUrl;

function setLanguage(language) {
  activeLanguage = language === "id" ? "id" : "en";
  document.documentElement.lang = activeLanguage;

  translatedElements.forEach((element) => {
    element.textContent = element.dataset[activeLanguage];
  });

  languageButtons.forEach((button) => {
    const isActive = button.dataset.lang === activeLanguage;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  updateSoundToggle(!backgroundSound.paused);

  updateCountdown();
}

function updateSoundToggle(isPlaying) {
  soundToggle.classList.toggle("is-active", isPlaying);
  soundToggle.setAttribute("aria-pressed", String(isPlaying));
  soundToggle.setAttribute(
    "aria-label",
    isPlaying ? LANGUAGE_LABELS[activeLanguage].soundOn : LANGUAGE_LABELS[activeLanguage].soundOff
  );
}

function startBackgroundSound() {
  soundToggle.disabled = false;
  backgroundSound.volume = 0.56;
  backgroundSound.play().catch(() => updateSoundToggle(false));
}

function toggleSound() {
  if (!hasBegun) return;

  backgroundSound.volume = 0.56;

  if (backgroundSound.paused) {
    backgroundSound.play().catch(() => updateSoundToggle(false));
    return;
  }

  backgroundSound.pause();
}

function hideScrollPrompt() {
  window.clearTimeout(scrollPromptTimer);
  scrollPrompt.classList.remove("is-visible");

  window.setTimeout(() => {
    if (!scrollPrompt.classList.contains("is-visible")) {
      scrollPrompt.hidden = true;
    }
  }, 540);
}

function scheduleScrollPrompt() {
  window.clearTimeout(scrollPromptTimer);
  scrollPromptTimer = window.setTimeout(() => {
    if (window.scrollY > 18) return;

    scrollPrompt.hidden = false;
    window.requestAnimationFrame(() => {
      scrollPrompt.classList.add("is-visible");
    });
  }, 1800);
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function formatCalendarDate(value) {
  return new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escapeCalendarText(value) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/\n/g, "\\n");
}

function downloadCalendarInvite() {
  const now = formatCalendarDate(new Date());
  const title = escapeCalendarText(EVENT_SETTINGS.eventTitle);
  const location = escapeCalendarText(EVENT_SETTINGS.locationFull);
  const description = escapeCalendarText(
    "A small anniversary pop-up experience by Marvell Florist."
  );
  const calendarText = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Marvell Florist//MARVELL 20//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:marvell-20-${Date.now()}@marvellflorist.com`,
    `DTSTAMP:${now}`,
    `DTSTART:${formatCalendarDate(EVENT_SETTINGS.eventDate)}`,
    `DTEND:${formatCalendarDate(EVENT_SETTINGS.eventEnd)}`,
    `SUMMARY:${title}`,
    `LOCATION:${location}`,
    `DESCRIPTION:${description}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const file = new Blob([calendarText], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(file);
  link.download = "marvell-20.ics";
  link.click();
  URL.revokeObjectURL(link.href);
}

function getVideoDuration() {
  return Number.isFinite(openingVideo.duration) && openingVideo.duration > 0
    ? openingVideo.duration
    : VIDEO_FALLBACK_DURATION;
}

function getLastFrameTime(video = openingVideo) {
  const duration = Number.isFinite(video.duration) && video.duration > 0
    ? video.duration
    : getVideoDuration();
  return Math.max(0, duration - HOLD_FRAME_OFFSET);
}

function getFinalLoopRange(video = openingVideo) {
  const loopEnd = getLastFrameTime(video);
  const loopStart = Math.max(0, loopEnd - FINAL_LOOP_DURATION);
  return { loopStart, loopEnd };
}

function stopFinalVideoLoop() {
  if (finalLoopFrame) {
    window.cancelAnimationFrame(finalLoopFrame);
    finalLoopFrame = 0;
  }
  finalLoopStartedAt = 0;
  finalLoopLastSeek = 0;
}

function startFinalVideoLoop() {
  stopFinalVideoLoop();

  const { loopStart, loopEnd } = getFinalLoopRange(openingVideo);
  const loopDuration = loopEnd - loopStart;
  if (loopDuration <= 0.2) return;

  openingVideo.playbackRate = 1;
  openingVideo.currentTime = loopStart;
  openingVideo.style.opacity = "1";
  openingVideo.style.zIndex = "0";
  openingVideo.pause();
  finalLoopStartedAt = 0;
  finalLoopLastSeek = 0;

  const animate = (timestamp) => {
    if (!finalLoopStartedAt) finalLoopStartedAt = timestamp;

    const minimumFrameGap = 1000 / FINAL_LOOP_FPS;
    if (timestamp - finalLoopLastSeek >= minimumFrameGap) {
      const elapsed = (timestamp - finalLoopStartedAt) / 1000;
      const cycleDuration = loopDuration * 2;
      const phase = elapsed % cycleDuration;
      const targetTime = phase <= loopDuration
        ? loopStart + phase
        : loopEnd - (phase - loopDuration);

      openingVideo.currentTime = targetTime;
      finalLoopLastSeek = timestamp;
    }

    finalLoopFrame = window.requestAnimationFrame(animate);
  };

  finalLoopFrame = window.requestAnimationFrame(animate);
}

function setAnimatedNumber(element, value) {
  const nextValue = pad(value);
  if (element.textContent === nextValue) return;

  element.textContent = nextValue;
  element.classList.remove("is-ticking");
  void element.offsetWidth;
  element.classList.add("is-ticking");
}

function updateCountdown() {
  const now = Date.now();
  const launch = new Date(EVENT_SETTINGS.eventDate).getTime();
  const end = new Date(EVENT_SETTINGS.eventEnd).getTime();
  const labels = LANGUAGE_LABELS[activeLanguage];
  const isBeforeLaunch = now < launch;
  const isBeforeClose = now <= end;
  const target = isBeforeLaunch ? launch : end;
  const remaining = Math.max(0, target - now);
  const totalSeconds = Math.floor(remaining / 1000);

  countdownTitle.textContent = isBeforeLaunch ? labels.saveDate : labels.closing;
  if (!isBeforeClose) {
    countdownTitle.textContent = labels.ended;
  }
  countdownElement?.setAttribute(
    "aria-label",
    isBeforeLaunch
      ? "Countdown to MARVELL20 launch"
      : isBeforeClose
        ? "Countdown until MARVELL20 closes on 4 July 2026 at 18.00"
        : "MARVELL20 countdown complete"
  );
  setAnimatedNumber(days, Math.floor(totalSeconds / 86400));
  setAnimatedNumber(hours, Math.floor((totalSeconds % 86400) / 3600));
  setAnimatedNumber(minutes, Math.floor((totalSeconds % 3600) / 60));
  setAnimatedNumber(seconds, totalSeconds % 60);
}

function finishReveal() {
  window.clearTimeout(revealTimer);
  window.clearTimeout(crossfadeTimer);
  if (revealTimeHandler) {
    openingVideo.removeEventListener("timeupdate", revealTimeHandler);
    revealTimeHandler = null;
  }
  openingVideo.currentTime = getLastFrameTime(openingVideo);
  startFinalVideoLoop();

  document.body.classList.remove("is-locked");
  document.body.classList.add("is-crossfading");
  document.body.classList.add("is-open");

  window.setTimeout(() => {
    openingScreen.setAttribute("aria-hidden", "true");
  }, 820);

  scheduleScrollPrompt();
}

function beginRevealPlayback() {
  if (revealPlaybackStarted) return;
  revealPlaybackStarted = true;

  const holdFrame = getLastFrameTime(openingVideo);
  openingVideo.pause();
  openingVideo.currentTime = 0;
  openingVideo.playbackRate = Math.min(Math.max(holdFrame / (REVEAL_DURATION / 1000), 1), 16);

  crossfadeTimer = window.setTimeout(() => {
    if (!document.body.classList.contains("is-open")) {
      document.body.classList.add("is-crossfading");
    }
  }, INVITE_CROSSFADE_AT);

  revealTimeHandler = () => {
    if (openingVideo.currentTime >= holdFrame - 0.05) {
      finishReveal();
    }
  };

  openingVideo.addEventListener("timeupdate", revealTimeHandler);
  revealTimer = window.setTimeout(() => {
    finishReveal();
  }, REVEAL_DURATION);

  openingVideo.play().catch(() => {
    finishReveal();
  });
}

function beginReveal() {
  if (hasBegun) return;
  hasBegun = true;

  document.body.classList.add("is-revealing");
  startBackgroundSound();

  if (openingVideo.readyState >= 2) {
    beginRevealPlayback();
    return;
  }

  openingVideo.load();
  openingVideo.addEventListener("loadeddata", beginRevealPlayback, { once: true });
  window.setTimeout(() => {
    if (!document.body.classList.contains("is-open")) beginRevealPlayback();
  }, 900);
}

function prepareOpeningFrame() {
  openingVideo.pause();
  openingVideo.currentTime = 0.001;
  openingScreen.classList.add("is-video-ready");
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  { threshold: 0.18 }
);

document.querySelectorAll(".reveal-section").forEach((section) => observer.observe(section));

openingVideo.addEventListener("loadeddata", prepareOpeningFrame, { once: true });
openingVideo.addEventListener("error", () => {
  openingScreen.classList.add("has-video-error");
});
openingVideo.load();
beginInvitation.addEventListener("click", beginReveal);
calendarButton.addEventListener("click", downloadCalendarInvite);
soundToggle.addEventListener("click", toggleSound);
scrollPrompt.addEventListener("click", () => {
  hideScrollPrompt();
  mainInvitation.scrollIntoView({ block: "start", behavior: "smooth" });
});
window.addEventListener("scroll", hideScrollPrompt, { passive: true });
backgroundSound.addEventListener("play", () => updateSoundToggle(true));
backgroundSound.addEventListener("pause", () => updateSoundToggle(false));
backgroundSound.addEventListener("ended", () => updateSoundToggle(false));
languageButtons.forEach((button) => {
  button.addEventListener("click", () => setLanguage(button.dataset.lang));
});

setLanguage("en");
updateCountdown();
countdownDigits.forEach((digit) => digit.classList.remove("is-ticking"));
window.setInterval(updateCountdown, 1000);
