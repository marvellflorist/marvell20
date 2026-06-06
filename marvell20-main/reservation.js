const RESERVATION_SESSION_KEY = "marvell20ReservationSubmitted";
const EVENT_DATE_MIN = "2026-06-15";
const EVENT_DATE_MAX = "2026-07-04";

const reservationForm = document.querySelector("#reservationForm");
const reservationFrame = document.querySelector('iframe[name="hidden_iframe"]');
const reservationStatus = document.querySelector("#reservationStatus");
const reservationDate = document.querySelector("#reservationDate");

let reservationSubmissionStarted = false;

function setSubmitDisabled(isDisabled) {
  const button = reservationForm.querySelector('button[type="submit"]');
  button.disabled = isDisabled;
}

function showSubmittedState(message) {
  reservationForm.hidden = true;
  reservationStatus.textContent = message;
}

function handleSubmit(event) {
  if (sessionStorage.getItem(RESERVATION_SESSION_KEY) === "true") {
    event.preventDefault();
    showSubmittedState(
      "You have already submitted a reservation in this browser session. Thank you for reserving a visit to MARVELL 20."
    );
    return;
  }

  if (reservationDate.value < EVENT_DATE_MIN || reservationDate.value > EVENT_DATE_MAX) {
    event.preventDefault();
    reservationDate.setCustomValidity("Please choose a date between 15 June and 4 July 2026.");
    reservationDate.reportValidity();
    return;
  }

  reservationSubmissionStarted = true;
  setSubmitDisabled(true);
  reservationStatus.textContent = "Submitting your reservation...";
}

function handleFrameLoad() {
  if (!reservationSubmissionStarted) return;

  reservationSubmissionStarted = false;
  sessionStorage.setItem(RESERVATION_SESSION_KEY, "true");
  reservationForm.reset();
  setSubmitDisabled(false);
  showSubmittedState(
    "Thank you for reserving a visit to MARVELL 20. We look forward to welcoming you."
  );
}

if (sessionStorage.getItem(RESERVATION_SESSION_KEY) === "true") {
  showSubmittedState(
    "You have already submitted a reservation in this browser session. Thank you for reserving a visit to MARVELL 20."
  );
}

reservationDate.min = EVENT_DATE_MIN;
reservationDate.max = EVENT_DATE_MAX;
reservationDate.addEventListener("input", () => {
  reservationDate.setCustomValidity("");
});
reservationForm.addEventListener("submit", handleSubmit);
reservationFrame.addEventListener("load", handleFrameLoad);
