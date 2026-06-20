const appShell = document.querySelector(".app-shell");
const homeView = document.querySelector(".view-home");
const beginButton = document.querySelector("#beginButton");
const archiveButton = document.querySelector("#archiveButton");
const glimpseButton = document.querySelector("#glimpseButton");
const languageButtons = document.querySelectorAll("[data-booth-lang]");
const glimpseTitle = document.querySelector("#glimpse-title");
const glimpseBody = document.querySelector("#glimpse-body");
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
const archiveNoiseMontage = document.querySelector("#archiveNoiseMontage");
const resultBody = document.querySelector(".result-body");
const traceNumber = document.querySelector("#traceNumber");
const qrCanvas = document.querySelector("#qrCanvas");
const qrStatus = document.querySelector("#qrStatus");
const exportButton = document.querySelector("#exportButton");
const airdropButton = document.querySelector("#airdropButton");
const gifButton = document.querySelector("#gifButton");
const storyContinueButton = document.querySelector("#storyContinueButton");
const startAgainButton = document.querySelector("#startAgainButton");
const scanBackButton = document.querySelector("#scanBackButton");
const scanStartAgainButton = document.querySelector("#scanStartAgainButton");
const soundToggleButton = document.querySelector("#soundToggleButton");
const storyShell = document.querySelector("#storyShell");
const storyChaptersContainer = document.querySelector("#storyChapters");
const storyProgress = document.querySelector("#storyProgress");
const storyCloseButton = document.querySelector("#storyCloseButton");
const tapHaloLayer = document.querySelector("#tapHaloLayer");
const guidanceHint = document.querySelector("#guidanceHint");
const saveConfirmation = document.querySelector("#saveConfirmation");
const confirmArchiveButton = document.querySelector("#confirmArchiveButton");
const finishButton = document.querySelector("#finishButton");
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
const traceCounterKey = "marvell20-trace-count";
const hintDelayByView = {
  home: 4000,
  glimpse: 5000,
  format: 5000,
  camera: 5000,
  review: 5000,
  tone: 5000,
  paper: 5000,
  final: 5000,
  scan: 5000,
  story: 5000,
  archive: 5000,
};
const hintTextByView = {
  home: "Ketuk untuk mulai",
  glimpse: "Ketuk untuk meninggalkan jejak",
  format: "Pilih format foto",
  camera: "Posisikan diri, lalu tekan tombol capture",
  review: "Pilih foto, lalu lanjut",
  tone: "Pilih tone foto",
  paper: "Pilih paper",
  final: "Simpan foto, lalu lanjut ke arsip",
  scan: "Scan untuk menyimpan",
  story: "Geser untuk membaca",
  archive: "Pilih arsip foto",
};
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
  { id: "burgundy", name: "Burgundy Velvet", background: "#4f0718", ink: "#ffffff", accent: "#e0bf78", margin: 112, assets: { single: "burgundy.png", strip: "stripburgundy.jpeg" } },
  { id: "noir", name: "Noir Satin", background: "#030303", ink: "#b12c2d", accent: "#b12c2d", margin: 112, safeTextStart: 0.792, assets: { single: "singleblack.png", strip: "stripblack.png" } },
  { id: "garden", name: "Garden Reverie", background: "#edf2df", ink: "#241c18", accent: "#9a7b49", margin: 112, safeTextStart: 0.792, assets: { single: "singlegarden.webp", strip: "stripgarden.png" } },
];
const paperImages = createPaperImages();

const GARDEN_STORAGE_KEYS = {
  flowers: "marvell20:gardenFlowers",
  selectedFlower: "marvell20:selectedFlower",
  visitorName: "marvell20:visitorName",
  lastPlantedFlower: "marvell20:lastPlantedFlower",
  lastPhoto: "marvell20:lastPhoto",
};

const PHOTO_STORAGE_KEYS = [
  "marvell20:lastPhoto",
  "marvell20:photo",
  "marvell20:lastCapture",
  "photobooth:lastPhoto",
  "photobooth:lastCapture",
  "lastPhoto",
  "capturedPhoto",
  "photoDataUrl",
];

const FLOWERS = [
  { id: "rose", displayName: "Rose", meaning: "Love / courage", visitorLine: "I leave love here.", occasion: "love, anniversaries, apologies", color: "#b90f3a", cssClass: "flower-rose" },
  { id: "orchid", displayName: "Orchid", meaning: "Becoming / elegance", visitorLine: "I leave growth here.", occasion: "growth, new chapters, self-respect", color: "#b277d8", cssClass: "flower-orchid" },
  { id: "carnation", displayName: "Carnation", meaning: "Gratitude / care", visitorLine: "I leave thanks here.", occasion: "mothers, family, quiet support", color: "#de7c90", cssClass: "flower-carnation" },
  { id: "anthurium", displayName: "Anthurium", meaning: "Presence / warmth", visitorLine: "I leave a sign that I was here.", occasion: "welcome, hospitality, being remembered", color: "#c3202f", cssClass: "flower-anthurium" },
  { id: "lily", displayName: "Lily", meaning: "Memory / grace", visitorLine: "I leave remembrance here.", occasion: "remembrance, goodbye, peace", color: "#efe6d2", cssClass: "flower-lily" },
  { id: "tulip", displayName: "Tulip", meaning: "Hope / renewal", visitorLine: "I leave hope here.", occasion: "beginnings, forgiveness, fresh starts", color: "#d85843", cssClass: "flower-tulip" },
  { id: "chrysanthemum", displayName: "Chrysanthemum", meaning: "Honor / lasting memory", visitorLine: "I leave honor here.", occasion: "respect, family, remembrance", color: "#d6a847", cssClass: "flower-chrysanthemum" },
  { id: "hydrangea", displayName: "Hydrangea", meaning: "Understanding / sincerity", visitorLine: "I leave understanding here.", occasion: "apology, reconciliation, deep feeling", color: "#7aa7c8", cssClass: "flower-hydrangea" },
];

const STORY_ASSETS = {
  room: {
    hero: "storybackground.png",
    atmosphere: "marvell20 indoor.jpeg",
    bloom: "current closeup bouquet 2.jpeg",
  },
  childMarvell: [
    { src: "young marvell.jpeg", caption: "" },
    { src: "kid marvell.jpeg", caption: "" },
    { src: "kid marvell;.jpeg", caption: "" },
  ],
  adultMarvell: {
    src: "currentmarvell.png",
    caption: "",
  },
  oldStore: [
    { src: "store in 2017 ..jpeg", caption: "" },
    { src: "2021 store.jpeg", caption: "" },
  ],
  currentStore: [
    { src: "storenowindoor.jpeg", caption: "" },
    { src: "storenow.jpeg", caption: "" },
  ],
  floristWorking: [
    { src: "labor.jpeg", caption: "" },
  ],
  papanBunga: [
    { src: "old papan.jpeg", caption: "" },
    { src: "another old papan.jpeg", caption: "" },
  ],
  arrangements: [
    { src: "current bouquet.jpeg", caption: "" },
    { src: "current bouquetr closeup.jpeg", caption: "" },
  ],
  occasionImages: [
    { src: "current campaign.jpeg", caption: "" },
  ],
  timeline: {
    bloomVideo: "lily.mp4",
    slider: "slider.png",
  },
  nameIntro: {
    portrait: "young marvell.jpeg",
  },
  photoboothArchive: [],
  overlays: {
    dust: "dustoverlay.png",
    grain: "",
    paper: "",
  },
  audio: {
    click: "sound drops (1).mp3",
    softClick: "sound drops (1).mp3",
    paperSlide: "Paper Slide - Sound Effect - Sound God (128k).mp3",
    ambient: "kiddo.mp3",
  },
};

const storyAudioSources = {
  click: [STORY_ASSETS.audio.click].filter(Boolean),
  soft: [STORY_ASSETS.audio.softClick].filter(Boolean),
  paper: [STORY_ASSETS.audio.paperSlide].filter(Boolean),
  ambient: [STORY_ASSETS.audio.ambient].filter(Boolean),
};

const archiveScenes = [
  {
    id: "gate",
    label: "Trace 01",
    title: "The Memory Garden",
    hint: "Tap to open the garden.",
    intent: "tap",
  },
  {
    id: "nameIntro",
    label: "Trace 02",
    title: "Before the Letter",
    hint: "Swipe the fog.",
    intent: "wipe",
  },
  {
    id: "name",
    label: "Trace 02",
    title: "A Name Before Birth",
    hint: "Tap the letter.",
    intent: "tap",
  },
  {
    id: "bridgeFlower",
    label: "Trace 03",
    title: "The First Flower",
    hint: "Read",
    intent: "read",
  },
  {
    id: "flowersOccasion",
    label: "Trace 03",
    title: "Flowers for Every Occasion",
    hint: "Wait",
    intent: "wait",
  },
  {
    id: "roomNotice",
    label: "Trace 04",
    title: "Look Around",
    hint: "Look around",
    intent: "read",
  },
  {
    id: "timeline",
    label: "Trace 05",
    title: "The Years That Carried the Name",
    hint: "Drag the years forward.",
    intent: "drag",
  },
  {
    id: "flowerSelect",
    label: "Trace 06",
    title: "Choose a Flower",
    hint: "Choose",
    intent: "tap",
  },
  {
    id: "gardenPlant",
    label: "Trace 07",
    title: "Plant Your Flower",
    hint: "Plant",
    intent: "tap",
  },
  {
    id: "markFinal",
    label: "Final",
    title: "You Left Your Mark",
    hint: "Finish",
    intent: "tap",
  },
];

const boothCopy = {
  en: {
    homeTap: "TAP TO BEGIN",
    glimpseTitle: "Leave your mark first.",
    glimpseBody: "Take your portrait first. After it is saved, the memory garden opens around it.",
    glimpseButton: "LEAVE A MARK",
    formatTitle: "Choose Paper Shape",
    singleFormat: "Portrait",
    stripFormat: "Strip",
    reviewSingle: "Choose Portrait",
    reviewStrip: "Choose Strip",
    toneTitle: "Choose Tone",
    paperTitle: "Choose Paper",
    usePhoto: "Use Photo",
    retake: "Retake",
    continue: "Continue",
    finalTitle: "Trace Captured",
    finalBody: "Your portrait is saved. Now continue into the memory garden around it.",
    savePhoto: "Save Photo",
    continueArchive: "Continue to Garden",
    highQuality: "High Quality QR",
    gif: "GIF",
    again: "Retake",
    saveAgain: "Save Photo",
    startBooth: "Take a Photo",
    restart: "Start Again",
    done: "Done",
    storyTitle: "The Memory Garden",
    storyNext: "Continue",
    storyFinish: "Done",
    tapPrompt: "Tap",
    scrollPrompt: "Scroll",
    wipePrompt: "Swipe",
    waitPrompt: "Wait",
    readPrompt: "Read",
    lookPrompt: "Look around",
    dragPrompt: "Drag",
    selectPrompt: "Choose",
    plantPrompt: "Plant",
    traceTitle: "You Were Here",
    traceLineOne: "The portrait comes first.",
    traceLineTwo: "Then the history gathers around it.",
    memoryGardenTitle: "The Memory Garden",
    nameTitle: "A Name Before Birth",
    nameBeats: [
      "Marvell Florist opened on June 1, 2006.",
      "The name came from a child already loved, even before he arrived.",
      "The store carried his name first. A few weeks later, the child was born, and both kept growing.",
    ],
    nameTap: "Tap the Letter",
    nameIntroFirst: "This is Marvell.",
    nameIntroSecond: "At that time, he did not yet know his name already existed somewhere.",
    nameIntroHint: "Swipe the fog",
    roomNoticeLines: [
      "Now, look around you.",
      "For 20 days, this name becomes a room.",
      "On July 4, 2026, this room will no longer exist.",
    ],
    timelineTitle: "The Years That Carried the Name",
    timelineHint: "Pull the years forward.",
    timelineBeats: [
      {
        label: "2006",
        title: "A Name Begins",
        lines: [
          "Marvell Florist opened on June 1, 2006.",
          "The name came from a child already loved, even before he arrived.",
        ],
        assetGroup: "childMarvell",
      },
      {
        label: "Early Years",
        title: "Flower Boards",
        lines: [
          "In the beginning, flowers often arrived in a larger form.",
          "Flower boards carried congratulations, condolences, openings, and farewells.",
          "Some messages were too large to be said alone.",
        ],
        assetGroup: "papanBunga",
      },
      {
        label: "Years Passing",
        title: "A Name Kept",
        lines: [
          "A name does not survive by itself.",
          "It is kept by working hands, long days, and orders that keep coming.",
        ],
        assetGroup: "floristWorking",
      },
      {
        label: "Over Time",
        title: "The Shape Changed",
        lines: [
          "Time changed the shape of flowers.",
          "From large messages by the road, Marvell Florist grew toward arrangements that felt closer, smaller, and more personal.",
        ],
        assetGroup: "arrangements",
      },
      {
        label: "2026",
        title: "MARVELL20",
        lines: [
          "Twenty years later, the name became a room.",
          "For a while, it appeared as flowers, photos, drinks, and small traces from the people who came.",
        ],
        assetGroup: "room",
      },
    ],
    timelineFinalLines: [
      "Twenty years is not only a number.",
      "It is time making something grow, change, and remain.",
      "After twenty years, what remains is not only history. Something is still growing.",
    ],
    bridgeTitle: "The First Flower",
    bridgeLines: [
      "The name became the first flower.",
      "Not a flower held in a hand, but one kept by a family.",
      "From that first bloom, many others followed.",
      "Some were given for love.",
      "Some for apology.",
      "Some for goodbye.",
      "Some simply to make a room feel less empty.",
    ],
    bridgeButton: "Flowers for every occasion",
    occasionTitle: "Flowers for Every Occasion",
    occasionLines: [
      "Flowers for every occasion.",
      "For the first hello.",
      "For the room waiting at home.",
      "For the apology that arrived late.",
      "For the birthday that almost passed quietly.",
      "For the table where people gathered.",
      "For love, when words were not enough.",
      "For goodbye.",
      "For memory.",
      "For every time a feeling needed a form.",
      "For 20 years, Marvell Florist has carried these moments.",
    ],
    occasionButton: "Enter the archive",
    occasionReadyHint: "Enter the archive",
    plantFlowerButton: "Plant your flower",
    flowerSelectTitle: "Choose what you want to leave here.",
    flowerSelectSubtitle: "Each flower carries a different meaning.",
    visitorNameLabel: "Your name, initials, or leave it blank",
    plantThisFlower: "Plant this flower",
    plantingTitle: "Tap the garden to plant your flower.",
    plantingSubtitle: "Your photo is yours. Your flower stays with the garden.",
    leaveMyMark: "Leave my mark",
    finalMarkTitle: "You left your mark.",
    finalMarkBody: "Your portrait is yours. Your flower stays with the garden.",
    plantedDynamic: "I planted a {flower} at MARVELL 20.",
    finalMarkFooter: "Marvell Florist - 20 years",
    returnBooth: "Return to Photo Booth",
    viewGarden: "View the Garden",
    hintHome: "Tap",
    hintGlimpse: "Tap",
    hintFormat: "Tap",
    hintCamera: "Tap",
    hintReview: "Tap",
    hintTone: "Tap",
    hintPaper: "Tap",
    hintFinal: "Tap",
    hintScan: "Scan",
    hintStory: "Tap to open the garden.",
    soundOn: "Pause sound",
    soundOff: "Play sound",
    savePrompt: "Photo saved. Continue to the memory garden?",
  },
  id: {
    homeTap: "KETUK UNTUK MULAI",
    glimpseTitle: "Tinggalkan jejakmu dulu.",
    glimpseBody: "Ambil portrait-mu dulu. Setelah tersimpan, taman kenangan akan terbuka di sekelilingnya.",
    glimpseButton: "TINGGALKAN JEJAK",
    formatTitle: "Pilih Bentuk Foto",
    singleFormat: "Portrait",
    stripFormat: "Strip",
    reviewSingle: "Pilih Portrait",
    reviewStrip: "Pilih Strip",
    toneTitle: "Pilih Tone",
    paperTitle: "Pilih Paper",
    usePhoto: "Gunakan Foto",
    retake: "Ulangi",
    continue: "Lanjut",
    finalTitle: "Jejak Tertangkap",
    finalBody: "Portrait-mu sudah tersimpan. Sekarang lanjut ke taman kenangan di sekelilingnya.",
    savePhoto: "Simpan Foto",
    continueArchive: "Lanjut Ke Arsip",
    highQuality: "QR Kualitas Tinggi",
    gif: "GIF",
    again: "Ulangi",
    saveAgain: "Simpan Foto",
    startBooth: "Mulai Photobooth",
    restart: "Mulai Ulang",
    done: "Selesai",
    storyTitle: "Taman Kenangan",
    storyNext: "Lanjut",
    storyFinish: "Selesai",
    tapPrompt: "Ketuk",
    scrollPrompt: "Gulir",
    wipePrompt: "Usap",
    waitPrompt: "Tunggu",
    readPrompt: "Baca",
    lookPrompt: "Lihat sekeliling",
    dragPrompt: "Tarik",
    selectPrompt: "Pilih",
    plantPrompt: "Tanam",
    traceTitle: "Kamu Pernah Di Sini",
    traceLineOne: "Portrait-mu datang lebih dulu.",
    traceLineTwo: "Lalu sejarah berkumpul di sekelilingnya.",
    memoryGardenTitle: "Taman Kenangan",
    nameTitle: "Nama Sebelum Lahir",
    nameBeats: [
      "Marvell Florist dibuka pada 1 Juni 2006.",
      "Nama itu datang dari seorang anak yang sudah lebih dulu dicintai, bahkan sebelum ia lahir.",
      "Toko membawa namanya lebih dulu. Beberapa minggu kemudian, anak itu lahir, lalu keduanya terus tumbuh.",
    ],
    nameTap: "Ketuk Surat",
    nameIntroFirst: "Ini adalah Marvell.",
    nameIntroSecond: "Pada saat itu, ia belum tahu namanya sudah ada di suatu tempat.",
    nameIntroHint: "Usap kabutnya",
    roomNoticeLines: [
      "Sekarang, lihat sekelilingmu.",
      "Selama 20 hari, nama ini menjadi sebuah ruang.",
      "Pada 4 Juli 2026, ruang ini tidak akan ada lagi.",
    ],
    timelineTitle: "Tahun yang Membawa Nama",
    timelineHint: "Tarik tahun-tahunnya ke depan.",
    timelineBeats: [
      {
        label: "2006",
        title: "Sebuah Nama Dimulai",
        lines: [
          "Marvell Florist dibuka pada 1 Juni 2006.",
          "Nama itu datang dari seorang anak yang sudah lebih dulu dicintai, bahkan sebelum ia lahir.",
        ],
        assetGroup: "childMarvell",
      },
      {
        label: "Awal Tahun",
        title: "Papan Bunga",
        lines: [
          "Pada awalnya, bunga hadir dalam bentuk yang besar.",
          "Papan bunga membawa ucapan selamat, duka cita, pembukaan, dan perpisahan.",
          "Ada pesan yang terlalu besar untuk dikatakan sendiri.",
        ],
        assetGroup: "papanBunga",
      },
      {
        label: "Bertahun-tahun",
        title: "Nama yang Dijaga",
        lines: [
          "Sebuah nama tidak bertahan sendiri.",
          "Ia dijaga oleh tangan yang bekerja, hari yang panjang, dan pesanan yang terus datang.",
        ],
        assetGroup: "floristWorking",
      },
      {
        label: "Seiring Waktu",
        title: "Bentuk Bunga Berubah",
        lines: [
          "Waktu mengubah bentuk bunga.",
          "Dari pesan besar di pinggir jalan, Marvell Florist tumbuh ke rangkaian yang lebih dekat, lebih kecil, lebih personal.",
        ],
        assetGroup: "arrangements",
      },
      {
        label: "2026",
        title: "MARVELL20",
        lines: [
          "Dua puluh tahun kemudian, nama itu menjadi sebuah ruang.",
          "Untuk sementara, ia hadir sebagai bunga, foto, minuman, dan jejak kecil dari orang-orang yang datang.",
        ],
        assetGroup: "room",
      },
    ],
    timelineFinalLines: [
      "Dua puluh tahun bukan hanya angka.",
      "Ia adalah waktu yang membuat sesuatu tumbuh, berubah, dan tetap tinggal.",
      "Setelah dua puluh tahun, yang tersisa bukan hanya sejarah. Ada sesuatu yang masih tumbuh.",
    ],
    bridgeTitle: "Bunga Pertama",
    bridgeLines: [
      "Nama itu menjadi bunga pertama.",
      "Bukan bunga yang dipegang di tangan, tetapi yang dijaga oleh keluarga.",
      "Dari bunga pertama itu, banyak bunga lain menyusul.",
      "Ada yang diberikan untuk cinta.",
      "Ada yang diberikan untuk maaf.",
      "Ada yang diberikan untuk perpisahan.",
      "Ada yang diberikan agar sebuah ruang terasa tidak terlalu kosong.",
    ],
    bridgeButton: "Bunga untuk setiap rasa",
    occasionTitle: "Bunga Untuk Setiap Rasa",
    occasionLines: [
      "Bunga untuk setiap rasa.",
      "Untuk sapaan pertama.",
      "Untuk ruang yang menunggu di rumah.",
      "Untuk maaf yang datang terlambat.",
      "Untuk ulang tahun yang hampir lewat diam-diam.",
      "Untuk meja tempat orang berkumpul.",
      "Untuk cinta, ketika kata tidak cukup.",
      "Untuk perpisahan.",
      "Untuk kenangan.",
      "Untuk setiap kali sebuah rasa membutuhkan bentuk.",
      "Selama 20 tahun, Marvell Florist membawa momen-momen itu.",
    ],
    occasionButton: "Masuk ke arsip",
    occasionReadyHint: "Masuk ke arsip",
    plantFlowerButton: "Tanam bungamu",
    flowerSelectTitle: "Pilih apa yang ingin kamu tinggalkan di sini.",
    flowerSelectSubtitle: "Setiap bunga membawa makna yang berbeda.",
    visitorNameLabel: "Namamu, inisial, atau biarkan kosong",
    plantThisFlower: "Tanam bunga ini",
    plantingTitle: "Ketuk taman untuk menanam bungamu.",
    plantingSubtitle: "Portrait-mu milikmu. Bungamu tinggal bersama taman.",
    leaveMyMark: "Tinggalkan jejakku",
    finalMarkTitle: "Kamu meninggalkan jejak.",
    finalMarkBody: "Portrait-mu milikmu. Bungamu tinggal bersama taman.",
    plantedDynamic: "Aku menanam {flower} di MARVELL 20.",
    finalMarkFooter: "Marvell Florist - 20 tahun",
    returnBooth: "Kembali ke Photobooth",
    viewGarden: "Lihat Taman",
    hintHome: "Ketuk",
    hintGlimpse: "Ketuk",
    hintFormat: "Ketuk",
    hintCamera: "Ketuk",
    hintReview: "Ketuk",
    hintTone: "Ketuk",
    hintPaper: "Ketuk",
    hintFinal: "Ketuk",
    hintScan: "Scan",
    hintStory: "Ketuk untuk membuka arsip.",
    soundOn: "Matikan suara",
    soundOff: "Nyalakan suara",
    savePrompt: "Foto tersimpan. Lanjutkan arsip?",
  },
};

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
  isSoundEnabled: false,
  language: "en",
  audioUnlocked: false,
  hintTimer: 0,
  hintHideTimer: 0,
  storyRendered: false,
  storyPhotoRecord: null,
  currentScene: 0,
  sceneUnlocked: false,
  navLocked: false,
  sceneTimers: [],
  storyScrollFrame: 0,
  storyTweenFrame: 0,
};

function getCopy(language = state.language) {
  return boothCopy[language] || boothCopy.en;
}

function textFrom(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") return value;
  return value?.[state.language] || value?.en || "";
}

function getStoryBody(chapter) {
  const body = chapter.body?.[state.language] || chapter.body?.en || [];
  return Array.isArray(body) ? body : [body].filter(Boolean);
}

function setText(selector, value) {
  const node = document.querySelector(selector);
  if (node) node.textContent = value;
}

function applyLanguage(language = state.language) {
  state.language = boothCopy[language] ? language : "en";
  const copy = getCopy();
  document.documentElement.lang = state.language;

  languageButtons.forEach((button) => {
    const isActive = button.dataset.boothLang === state.language;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  if (beginButton) beginButton.textContent = copy.homeTap;
  if (glimpseTitle) glimpseTitle.textContent = copy.glimpseTitle;
  if (glimpseBody) glimpseBody.textContent = copy.glimpseBody;
  if (glimpseButton) glimpseButton.textContent = copy.glimpseButton;
  if (resultBody) resultBody.textContent = copy.finalBody;
  setText("#format-title", copy.formatTitle);
  setText("#tone-title", copy.toneTitle);
  setText("#paper-title", copy.paperTitle);
  setText("#final-title", copy.finalTitle);
  setText("#finalNextButton", copy.usePhoto);
  setText("#retakeButton", copy.retake);
  setText("#toneNextButton", copy.continue);
  setText("#paperNextButton", copy.continue);
  setText("#airdropButton", copy.savePhoto);
  setText("#storyContinueButton", copy.continueArchive);
  setText("#exportButton", copy.highQuality);
  setText("#gifButton", copy.gif);
  setText("#startAgainButton", copy.again);
  setText("#story-title", copy.storyTitle);
  setText("#storyCloseButton", copy.done);
  setText("#confirmArchiveButton", copy.continueArchive);
  setText("#finishButton", copy.done);
  const savePrompt = saveConfirmation?.querySelector("p");
  if (savePrompt) savePrompt.textContent = copy.savePrompt;
  document.querySelectorAll("[data-format-choice]").forEach((button) => {
    button.querySelector("span").textContent = button.dataset.formatChoice === "single"
      ? copy.singleFormat
      : copy.stripFormat;
  });
  syncSoundToggle();
  updateFormatUi();
  if (appShell.dataset.view === "story" && state.storyRendered) {
    const sceneIndex = state.currentScene;
    renderStory(state.storyPhotoRecord);
    goToScene(sceneIndex, { silent: true, instant: true });
  }
}

function setView(view) {
  if (view !== "final") stopFinalPreviewLoop();
  if (view !== "story") {
    stopAmbientSound();
    window.cancelAnimationFrame(state.storyTweenFrame);
    clearStoryTimers();
  }
  appShell.dataset.view = view;
  document.documentElement.dataset.view = view;
  saveConfirmation.hidden = true;
  resetInactivityTimer();
  scheduleGuidanceHint();
  if (view === "story") {
    startAmbientSound();
    scheduleGuidanceHint(3800);
  }
}

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function guardedNavigate(callback, delay = 750) {
  if (state.navLocked) return;
  state.navLocked = true;
  try {
    callback();
  } finally {
    window.setTimeout(() => {
      state.navLocked = false;
    }, delay);
  }
}

function showTapHalo(event) {
  if (!tapHaloLayer || !event.isTrusted) return;
  if (event.target.closest(".home-tap, .glimpse-next")) return;
  const halo = document.createElement("span");
  halo.className = "tap-halo";
  halo.style.left = `${event.clientX}px`;
  halo.style.top = `${event.clientY}px`;
  tapHaloLayer.append(halo);
  window.setTimeout(() => halo.remove(), 900);
}

function hideGuidanceHint() {
  window.clearTimeout(state.hintTimer);
  window.clearTimeout(state.hintHideTimer);
  guidanceHint?.classList.remove("is-visible");
}

function scheduleGuidanceHint(delayOverride) {
  hideGuidanceHint();
  if (!guidanceHint || state.isCapturing) return;
  const view = appShell.dataset.view || "home";
  const delay = delayOverride ?? hintDelayByView[view] ?? 5000;
  state.hintTimer = window.setTimeout(() => {
    const latestView = appShell.dataset.view || "home";
    const copy = getCopy();
    const activeStoryPage = latestView === "story"
      ? storyChaptersContainer?.querySelector(".archive-scene.is-active")
      : null;
    const text = activeStoryPage?.dataset.hint
      || copy[`hint${latestView.charAt(0).toUpperCase()}${latestView.slice(1)}`]
      || hintTextByView[latestView]
      || copy.storyNext;
    guidanceHint.textContent = text;
    guidanceHint.dataset.intent = activeStoryPage?.dataset.intent
      || (text === copy.scrollPrompt || text === "Scroll" || text === "Gulir" ? "scroll" : "tap");
    guidanceHint.classList.add("is-visible");
    state.hintHideTimer = window.setTimeout(() => {
      guidanceHint.classList.remove("is-visible");
    }, 4800);
  }, delay);
}

function setBusy(isBusy) {
  state.isCapturing = isBusy;
  captureButton.disabled = isBusy;
  changeCameraButton.disabled = isBusy;
  cameraStage.classList.toggle("is-capturing", isBusy);
  if (isBusy) hideGuidanceHint();
  else scheduleGuidanceHint();
}

async function beginSession() {
  await unlockStoryAudio(false);
  playInteractionSound("click");
  resetSession();
  setView("glimpse");
}

async function startPhotoboothFromGlimpse() {
  await unlockStoryAudio(false);
  playInteractionSound("soft");
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
  const copy = getCopy();
  exportButton.textContent = copy.highQuality;
  airdropButton.textContent = copy.savePhoto;
  gifButton.textContent = copy.gif;
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
  const copy = getCopy();
  formatButtons.forEach((button) => {
    const isActive = button.dataset.formatChoice === state.selectedFormat;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  reviewTitle.textContent = state.selectedFormat === "single" ? copy.reviewSingle : copy.reviewStrip;
  finalTitle.textContent = copy.finalTitle;
  exportButton.textContent = copy.highQuality;
  airdropButton.textContent = copy.savePhoto;
  gifButton.textContent = copy.gif;
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
  const shouldRecordContinuousStrip = shouldRecordClip && !isRetake && state.selectedFormat === "strip" && targetCount > 1;
  if (shouldRecordClip && !isRetake) clearVideoClip();

  if (state.retakeIndex === null) {
    state.captures = [];
    state.selectedIndex = 0;
    state.videoClipBlob = null;
    state.videoSegments = Array.from({ length: targetCount }, () => null);
  }

  const sequenceRecording = shouldRecordContinuousStrip ? startCameraRecording() : null;
  const sequenceStartedAt = performance.now();
  const sequenceWindows = Array.from({ length: targetCount }, () => null);

  for (let index = 0; index < targetCount; index += 1) {
    const slotIndex = isRetake ? retakeSlot : index;
    const recording = shouldRecordClip && !sequenceRecording ? startCameraRecording() : null;
    let videoClip = null;

    try {
      if (sequenceRecording) {
        sequenceWindows[slotIndex] = {
          startSeconds: Math.max(0, (performance.now() - sequenceStartedAt) / 1000),
          endSeconds: 0,
        };
      }
      await runCountdown();
    } finally {
      if (sequenceRecording && sequenceWindows[slotIndex]) {
        sequenceWindows[slotIndex].endSeconds = Math.max(
          sequenceWindows[slotIndex].startSeconds + 0.65,
          (performance.now() - sequenceStartedAt) / 1000
        );
      }
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
    if (!sequenceRecording && videoClip?.size) {
      state.videoSegments[slotIndex] = createGifSegment(videoClip, 0, 1, stripGifSegmentDuration);
    } else if (!sequenceRecording) {
      state.videoSegments[slotIndex] = null;
    }
    invalidatePreviewCache();
    playShutterSound();
    document.body.classList.add("flash");
    await sleep(260);
    document.body.classList.remove("flash");
    await sleep(300);
  }

  if (sequenceRecording) {
    const videoClip = await stopCameraRecording(sequenceRecording).catch((error) => {
      console.warn("MARVELL20 strip sequence recording stop failed", error);
      return null;
    });
    if (videoClip?.size) {
      state.videoClipBlob = videoClip;
      sequenceWindows.forEach((window, index) => {
        state.videoSegments[index] = window
          ? createGifSegment(videoClip, 0, 1, stripGifSegmentDuration, {
            startTime: window.startSeconds,
            endTime: Math.min(window.endSeconds, window.startSeconds + stripGifSegmentDuration),
          })
          : null;
      });
    }
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
  context.fillStyle = "#050505";
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

const storyAudio = {
  click: createManagedAudio(storyAudioSources.click, { volume: 0.18 }),
  soft: createManagedAudio(storyAudioSources.soft, { volume: 0.14 }),
  paper: createManagedAudio(storyAudioSources.paper, { volume: 0.16 }),
  ambient: createManagedAudio(storyAudioSources.ambient, { volume: 0.045, loop: true }),
};

function createManagedAudio(sources, options = {}) {
  const audio = new Audio();
  let sourceIndex = 0;
  audio.preload = "auto";
  audio.volume = options.volume ?? 0.12;
  audio.loop = Boolean(options.loop);
  audio.src = sources[sourceIndex] || "";
  audio.addEventListener("error", () => {
    sourceIndex += 1;
    if (sourceIndex >= sources.length) return;
    audio.src = sources[sourceIndex];
    audio.load();
  });
  return audio;
}

async function unlockStoryAudio(enableSound = state.isSoundEnabled) {
  await unlockAudio().catch(() => {});
  state.audioUnlocked = true;
  if (!enableSound) return;
  await Promise.all(Object.values(storyAudio).map((audio) => {
    if (!audio?.src) return Promise.resolve();
    audio.muted = true;
    return audio.play()
      .then(() => {
        audio.pause();
        audio.currentTime = 0;
        audio.muted = false;
      })
      .catch(() => {
        audio.muted = false;
      });
  }));
}

function syncSoundToggle() {
  if (!soundToggleButton) return;
  const copy = getCopy();
  soundToggleButton.classList.toggle("is-active", state.isSoundEnabled);
  soundToggleButton.setAttribute("aria-pressed", state.isSoundEnabled ? "true" : "false");
  soundToggleButton.setAttribute("aria-label", state.isSoundEnabled ? copy.soundOn : copy.soundOff);
}

async function toggleSound() {
  state.isSoundEnabled = !state.isSoundEnabled;
  syncSoundToggle();
  await unlockStoryAudio(state.isSoundEnabled);
  if (state.isSoundEnabled) {
    playInteractionSound("soft");
    if (appShell.dataset.view === "story") startAmbientSound();
  } else {
    stopAmbientSound();
  }
}

function playInteractionSound(type = "click") {
  if (!state.isSoundEnabled) return;
  const audio = storyAudio[type] || storyAudio.click;
  if (!audio?.src) return;
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

function playLetterSound() {
  playInteractionSound("paper");
}

function playDustWipeSound() {
  if (!state.audioUnlocked) return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const context = state.audioContext || new AudioContextClass();
    state.audioContext = context;
    if (context.state === "suspended") context.resume();
    const now = context.currentTime;
    const duration = 0.18;
    const bufferSize = Math.max(1, Math.floor(context.sampleRate * duration));
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < bufferSize; index += 1) {
      data[index] = (Math.random() * 2 - 1) * (1 - index / bufferSize);
    }
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    source.buffer = buffer;
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1150, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.018, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    source.connect(filter).connect(gain).connect(context.destination);
    source.start(now);
    source.stop(now + duration);
  } catch (error) {
    // Decorative sound only.
  }
}

function startAmbientSound() {
  if (!state.isSoundEnabled || !storyAudio.ambient?.src) return;
  storyAudio.ambient.play().catch(() => {});
}

function stopAmbientSound() {
  if (!storyAudio.ambient) return;
  storyAudio.ambient.pause();
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
      const targetTime = Math.max(
        source.startTime,
        Math.min(source.endTime - 0.03, source.startTime + sourceOffset)
      );
      await seekVideo(source.video, targetTime);
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
  context.fillStyle = "#050505";
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
  if (activeSessionRecord) {
    const existingImage = getRecordImageUrl(activeSessionRecord);
    saveLatestPhotoReference(existingImage);
    return activeSessionRecord;
  }

  const exportSize = getFinalExportSize();
  const images = await preloadCaptureImages();
  await renderComposition(finalCanvas, { width: exportSize.width, height: exportSize.height, images });
  const finalImage = finalCanvas.toDataURL("image/png");
  state.sessionId = state.sessionId || createSessionId();
  const traceNo = getNextTraceNumber();
  activeSessionRecord = {
    id: state.sessionId,
    timestamp: new Date().toISOString(),
    finalImage,
    selectedFormat: state.selectedFormat,
    selectedFilter: state.selectedTone,
    selectedPaper: state.selectedPaper,
    traceNo,
    exportStatus: "ready",
  };
  saveLatestPhotoReference(finalImage);
  updateTraceLabel(activeSessionRecord);

  saveSessionRecord(activeSessionRecord).catch((error) => {
    console.warn("MARVELL20 archive save failed", error);
  });

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

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, size, size);
  context.fillStyle = "#050505";
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

async function renderArchiveNoiseMontage(record) {
  if (!archiveNoiseMontage) return;
  let records = archiveRecords;
  try {
    records = await getArchiveRecords();
  } catch (error) {
    records = archiveRecords;
  }

  const currentImage = getRecordImageUrl(record);
  const archiveSources = records
    .filter((item) => item?.id !== record?.id)
    .map(getRecordImageUrl)
    .filter(Boolean)
    .slice(0, 14);
  if (currentImage) archiveSources.push(currentImage);

  const nodes = archiveSources.map((source, index) => {
    const image = document.createElement("img");
    image.src = source;
    image.alt = "";
    if (source === currentImage) image.className = "is-current";
    image.style.setProperty("--montage-delay", `${index * 0.42}s`);
    image.style.setProperty("--montage-x", `${10 + (index * 19) % 80}%`);
    image.style.setProperty("--montage-y", `${12 + (index * 29) % 72}%`);
    image.style.setProperty("--montage-rotate", `${-12 + (index * 7) % 24}deg`);
    return image;
  });

  archiveNoiseMontage.replaceChildren(...nodes);
}

async function showFinal() {
  if (!state.selectedPaper) return;
  qrCanvas.hidden = true;
  qrStatus.textContent = "Preparing high-quality link...";
  const record = await prepareFinalSession();
  updateTraceLabel(record);
  setView("final");
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

function readJsonStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
}

function writeJsonStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn("MARVELL20 localStorage write failed", error);
  }
}

function getLatestPhoto(record = state.storyPhotoRecord || activeSessionRecord) {
  const recordImage = getRecordImageUrl(record);
  if (recordImage) return recordImage;
  for (const key of PHOTO_STORAGE_KEYS) {
    try {
      const value = localStorage.getItem(key);
      if (value) return value;
    } catch (error) {
      // Ignore unavailable storage and keep looking for a photo.
    }
  }
  return "";
}

function getFlowerById(id) {
  return FLOWERS.find((flower) => flower.id === id) || FLOWERS[0];
}

function getSelectedFlower() {
  return getFlowerById(localStorage.getItem(GARDEN_STORAGE_KEYS.selectedFlower) || FLOWERS[0].id);
}

function getGardenFlowers() {
  return readJsonStorage(GARDEN_STORAGE_KEYS.flowers, []);
}

function saveGardenFlowers(flowers) {
  writeJsonStorage(GARDEN_STORAGE_KEYS.flowers, Array.isArray(flowers) ? flowers : []);
}

function saveLastPlantedFlower(flower) {
  writeJsonStorage(GARDEN_STORAGE_KEYS.lastPlantedFlower, flower);
}

function saveLatestPhotoReference(photo) {
  if (!photo) return;
  try {
    localStorage.setItem(GARDEN_STORAGE_KEYS.lastPhoto, photo);
  } catch (error) {
    console.warn("MARVELL20 latest photo storage skipped", error);
  }
}

function getNextTraceNumber() {
  const current = Number.parseInt(localStorage.getItem(traceCounterKey) || "0", 10) || 0;
  const next = current + 1;
  localStorage.setItem(traceCounterKey, String(next));
  return next;
}

function formatTraceNumber(value) {
  return `Trace No. ${String(value || 1).padStart(3, "0")}`;
}

function updateTraceLabel(record = activeSessionRecord) {
  if (!traceNumber) return;
  traceNumber.textContent = formatTraceNumber(record?.traceNo || Number.parseInt(localStorage.getItem(traceCounterKey) || "1", 10));
}

function normalizeStoryAsset(asset) {
  if (!asset) return null;
  if (typeof asset === "string") return asset ? { src: asset, caption: "" } : null;
  if (typeof asset === "object") {
    const src = asset.src || "";
    if (!src) return null;
    return { src, caption: asset.caption || "" };
  }
  return null;
}

function getStoryAssetValue(path) {
  return path.split(".").reduce((value, key) => value?.[key], STORY_ASSETS);
}

function getStoryAssetList(path) {
  const value = getStoryAssetValue(path);
  if (Array.isArray(value)) return value.map(normalizeStoryAsset).filter(Boolean);
  const normalized = normalizeStoryAsset(value);
  return normalized ? [normalized] : [];
}

function getStoryAsset(path) {
  return getStoryAssetList(path)[0] || null;
}

function cssUrl(source) {
  return `url("${String(source).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}")`;
}

function createArchivePlaceholder(className = "") {
  const placeholder = document.createElement("div");
  placeholder.className = `archive-image-placeholder ${className}`.trim();
  placeholder.setAttribute("aria-hidden", "true");
  return placeholder;
}

function createArchiveFigure(asset, options = {}) {
  const normalized = normalizeStoryAsset(asset);
  const figure = document.createElement("figure");
  figure.className = ["archive-photo", options.className].filter(Boolean).join(" ");

  if (!normalized?.src) {
    if (!options.placeholder) return null;
    figure.append(createArchivePlaceholder());
    return figure;
  }

  const image = document.createElement("img");
  image.loading = "lazy";
  image.decoding = "async";
  image.src = normalized.src;
  image.alt = options.alt || normalized.caption || "";
  image.addEventListener("error", () => {
    if (options.placeholder) {
      image.replaceWith(createArchivePlaceholder());
      return;
    }
    figure.remove();
  });
  figure.append(image);

  if (normalized.caption) {
    const caption = document.createElement("figcaption");
    caption.textContent = normalized.caption;
    figure.append(caption);
  }

  return figure;
}

function createArchiveButton(text, className = "archive-plain-button") {
  const button = document.createElement("button");
  button.className = className;
  button.type = "button";
  button.textContent = text;
  return button;
}

function appendLines(parent, lines, className = "") {
  lines.filter(Boolean).forEach((line) => {
    const paragraph = document.createElement("p");
    if (className) paragraph.className = className;
    paragraph.textContent = line;
    parent.append(paragraph);
  });
}

function appendSceneCopy(parent, { kicker, title, lines = [], className = "archive-scene-copy" }) {
  const copy = document.createElement("div");
  copy.className = className;
  if (kicker) {
    const label = document.createElement("p");
    label.className = "archive-kicker";
    label.textContent = kicker;
    copy.append(label);
  }
  if (title) {
    const heading = document.createElement("h3");
    heading.textContent = title;
    copy.append(heading);
  }
  appendLines(copy, lines);
  parent.append(copy);
  return copy;
}

function getArchiveSceneTitle(scene) {
  const copy = getCopy();
  const titles = {
    gate: copy.memoryGardenTitle,
    name: copy.nameTitle,
    bridgeFlower: copy.bridgeTitle,
    flowersOccasion: copy.occasionTitle,
    timeline: copy.timelineTitle,
    flowerSelect: copy.flowerSelectTitle,
    gardenPlant: copy.plantingTitle,
    markFinal: copy.finalMarkTitle,
    montage: copy.traceTitle,
  };
  return titles[scene?.id] || scene?.title || copy.storyTitle;
}

function getArchiveSceneHint(scene) {
  const copy = getCopy();
  const hints = {
    gate: copy.hintStory,
    nameIntro: copy.nameIntroHint,
    name: copy.nameTap,
    bridgeFlower: copy.readPrompt,
    flowersOccasion: copy.waitPrompt,
    roomNotice: copy.lookPrompt,
    timeline: copy.timelineHint,
    flowerSelect: copy.selectPrompt,
    gardenPlant: copy.plantPrompt,
    markFinal: copy.done,
    montage: copy.done,
  };
  return hints[scene?.id] || scene?.hint || copy.hintStory;
}

function addArchiveNext(section, index, text = getCopy().storyNext) {
  if (index >= archiveScenes.length - 1) return null;
  const button = createArchiveButton(text, "archive-scene-next");
  button.hidden = true;
  button.disabled = true;
  button.addEventListener("click", () => {
    hideGuidanceHint();
    guardedNavigate(() => goToScene(index + 1));
  });
  section.append(button);
  return button;
}

function clearStoryTimers() {
  state.sceneTimers.forEach((timer) => window.clearTimeout(timer));
  state.sceneTimers = [];
}

function resetStoryExperience() {
  clearStoryTimers();
  window.cancelAnimationFrame(state.storyScrollFrame);
  window.cancelAnimationFrame(state.storyTweenFrame);
  state.storyRendered = false;
  state.storyPhotoRecord = null;
  state.currentScene = 0;
  state.sceneUnlocked = false;
  if (storyChaptersContainer) {
    storyChaptersContainer.replaceChildren();
    storyChaptersContainer.dataset.currentScene = "";
    storyChaptersContainer.style.removeProperty("--archive-progress");
  }
  storyProgress?.replaceChildren();
  setText("#story-title", getCopy().storyTitle);
}

function queueSceneTimer(callback, delay) {
  const timer = window.setTimeout(() => {
    state.sceneTimers = state.sceneTimers.filter((item) => item !== timer);
    callback();
  }, delay);
  state.sceneTimers.push(timer);
  return timer;
}

function completeInteraction(sceneId) {
  const activeScene = archiveScenes[state.currentScene];
  if (sceneId && activeScene?.id !== sceneId) return;
  unlockScene();
}

function showNextButton() {
  const active = storyChaptersContainer?.querySelector(".archive-scene.is-active");
  const next = active?.querySelector(".archive-scene-next");
  if (!next) return;
  next.hidden = false;
  next.disabled = false;
}

function unlockScene() {
  if (state.sceneUnlocked) return;
  state.sceneUnlocked = true;
  const active = storyChaptersContainer?.querySelector(".archive-scene.is-active");
  active?.classList.add("is-unlocked");
  showNextButton();
  playInteractionSound("soft");
  scheduleGuidanceHint(900);
}

function buildArchiveScene(scene, index) {
  const section = document.createElement("section");
  section.className = `archive-scene archive-scene-${scene.id}`;
  section.dataset.sceneIndex = String(index);
  section.dataset.sceneId = scene.id;
  section.dataset.hint = getArchiveSceneHint(scene);
  section.dataset.intent = scene.intent;

  if (scene.id === "gate") buildGateScene(section, index);
  if (scene.id === "nameIntro") buildNameIntroScene(section, index);
  if (scene.id === "name") buildNameScene(section, index);
  if (scene.id === "bridgeFlower") buildBridgeFlowerScene(section, index);
  if (scene.id === "flowersOccasion") buildFlowersOccasionScene(section, index);
  if (scene.id === "roomNotice") buildRoomNoticeScene(section, index);
  if (scene.id === "hands") buildHandsScene(section, index);
  if (scene.id === "papan") buildPapanScene(section, index);
  if (scene.id === "store") buildStoreScene(section, index);
  if (scene.id === "arrangements") buildArrangementsScene(section, index);
  if (scene.id === "room") buildRoomScene(section, index);
  if (scene.id === "timeline") buildTimelineScene(section, index);
  if (scene.id === "flowerSelect") buildFlowerSelectScene(section, index);
  if (scene.id === "gardenPlant") buildGardenPlantScene(section, index);
  if (scene.id === "markFinal") buildMarkFinalScene(section, index);
  if (scene.id === "montage") buildMontageScene(section, index);
  if (scene.id === "epilogue") buildEpilogueScene(section, index);

  if (scene.id === "timeline") addArchiveNext(section, index, getCopy().plantFlowerButton);
  if (!["nameIntro", "bridgeFlower", "flowersOccasion", "roomNotice", "timeline", "flowerSelect", "gardenPlant", "markFinal", "montage", "epilogue"].includes(scene.id)) addArchiveNext(section, index);
  return section;
}

function buildGateScene(section) {
  const copy = getCopy();
  const youngMarvell = getStoryAssetList("childMarvell")[0];
  if (youngMarvell?.src) {
    section.style.setProperty("--scene-bg", cssUrl(youngMarvell.src));
    section.classList.add("has-scene-bg");
    section.classList.add("archive-gate-young");
  }
  const gate = document.createElement("div");
  gate.className = "archive-gate-copy";
  const title = document.createElement("h3");
  title.className = "archive-gate-title";
  title.textContent = copy.memoryGardenTitle;
  gate.append(title);
  section.append(gate);
  const open = () => {
    if (section.classList.contains("is-opened")) return;
    hideGuidanceHint();
    section.classList.add("is-opened");
    playInteractionSound("soft");
    queueSceneTimer(() => guardedNavigate(() => goToScene(state.currentScene + 1), 750), 1050);
  };
  section.addEventListener("click", (event) => {
    if (event.target.closest(".archive-scene-next")) return;
    open();
  });
}

function buildNameScene(section) {
  const copy = getCopy();
  const photos = getStoryAssetList("childMarvell");
  const beats = copy.nameBeats || [];

  const stage = document.createElement("div");
  stage.className = "archive-name-stage";
  const stack = document.createElement("div");
  stack.className = "archive-memory-stack";
  photos.forEach((asset, photoIndex) => {
    const figure = createArchiveFigure(asset, { className: "archive-memory-card", placeholder: true });
    if (!figure) return;
    figure.style.setProperty("--card-index", photoIndex);
    stack.append(figure);
  });

  const letterCopy = appendSceneCopy(stage, {
    kicker: "Trace 02",
    title: copy.nameTitle,
    lines: [],
    className: "archive-name-copy",
  });
  const beatList = document.createElement("div");
  beatList.className = "archive-beats";
  beats.forEach((beat) => {
    const line = document.createElement("p");
    line.textContent = beat;
    beatList.append(line);
  });
  letterCopy.append(beatList);
  const cue = createArchiveButton(copy.nameTap, "archive-open-button archive-tap-through");
  const hitbox = createArchiveButton("Buka surat", "archive-name-hitbox");
  letterCopy.append(cue);
  stage.append(stack, hitbox);
  section.append(stage);

  let beatIndex = 0;
  const revealBeat = () => {
    if (archiveScenes[state.currentScene]?.id !== "name") return;
    if (section.classList.contains("is-opened")) return;
    if (beatIndex >= beats.length) return;
    hideGuidanceHint();
    const cards = stack.querySelectorAll(".archive-memory-card");
    cards[Math.min(beatIndex, cards.length - 1)]?.classList.add("is-visible");
    beatList.children[beatIndex]?.classList.add("is-visible");
    beatIndex += 1;
    if (beatIndex >= beats.length) {
      cue.classList.add("is-reserved-hidden");
      completeInteraction("name");
    }
  };
  section.addEventListener("click", (event) => {
    if (event.target.closest(".archive-scene-next")) return;
    revealBeat();
  });
}

function buildNameIntroScene(section) {
  const copy = getCopy();
  const portrait = getStoryAsset("nameIntro.portrait") || getStoryAssetList("childMarvell")[0];
  const dust = getStoryAsset("overlays.dust");

  const stage = document.createElement("div");
  stage.className = "archive-name-intro-stage";

  const polaroid = document.createElement("div");
  polaroid.className = "archive-name-intro-polaroid";
  const image = createArchiveFigure(portrait, { className: "archive-name-intro-photo", placeholder: true });
  if (image) polaroid.append(image);

  const fog = document.createElement("canvas");
  fog.className = "archive-name-fog-canvas";
  fog.setAttribute("aria-label", copy.nameIntroHint);
  fog.style.pointerEvents = "auto";
  fog.style.touchAction = "none";
  polaroid.append(fog);

  if (dust?.src) {
    const dustLayer = document.createElement("div");
    dustLayer.className = "archive-name-dust-layer";
    dustLayer.style.backgroundImage = cssUrl(dust.src);
    polaroid.append(dustLayer);
  }

  const text = document.createElement("div");
  text.className = "archive-name-intro-copy";
  const first = document.createElement("p");
  first.textContent = copy.nameIntroFirst;
  const second = document.createElement("p");
  second.textContent = copy.nameIntroSecond;
  text.append(first, second);

  const hitbox = createArchiveButton(copy.nameIntroHint, "archive-name-intro-hitbox");
  stage.append(polaroid, text, hitbox);
  section.append(stage);

  let wipeProgress = 0;
  let hasTriggeredHalfReveal = false;
  let isWiping = false;
  let introStep = 0;
  let fogContext = null;
  let lastDustSoundAt = 0;

  const drawFog = () => {
    const rect = polaroid.getBoundingClientRect();
    const ratio = Math.max(1, window.devicePixelRatio || 1);
    fog.width = Math.max(1, Math.round(rect.width * ratio));
    fog.height = Math.max(1, Math.round(rect.height * ratio));
    fog.style.width = `${rect.width}px`;
    fog.style.height = `${rect.height}px`;
    fogContext = fog.getContext("2d");
    if (!fogContext) return;
    fogContext.setTransform(ratio, 0, 0, ratio, 0, 0);
    fogContext.globalCompositeOperation = "source-over";
    fogContext.fillStyle = "rgba(226, 226, 222, 0.16)";
    fogContext.fillRect(0, 0, rect.width, rect.height);
    fogContext.fillStyle = "rgba(255, 255, 255, 0.14)";
    for (let index = 0; index < 180; index += 1) {
      const x = (index * 47 + 19) % rect.width;
      const y = (index * 83 + 31) % rect.height;
      fogContext.beginPath();
      fogContext.arc(x, y, 0.8 + (index % 5) * 0.42, 0, Math.PI * 2);
      fogContext.fill();
    }
  };

  const revealAt = (event) => {
    if (!fogContext) drawFog();
    if (!fogContext) return;
    const rect = fog.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    fogContext.globalCompositeOperation = "destination-out";
    fogContext.beginPath();
    fogContext.arc(x, y, Math.max(56, Math.min(rect.width, rect.height) * 0.16), 0, Math.PI * 2);
    fogContext.fill();
    const now = performance.now();
    if (now - lastDustSoundAt > 240) {
      lastDustSoundAt = now;
      playDustWipeSound();
    }
    wipeProgress = Math.min(1, wipeProgress + 0.08);
    if (wipeProgress >= 0.5 && !hasTriggeredHalfReveal) {
      hasTriggeredHalfReveal = true;
      section.classList.add("is-revealed");
      fog.style.pointerEvents = "none";
      first.classList.add("is-visible");
      scheduleGuidanceHint(900);
    }
  };

  const advanceText = () => {
    if (!section.classList.contains("is-revealed")) return;
    hideGuidanceHint();
    if (introStep === 0) {
      second.classList.add("is-visible");
      introStep = 1;
      playInteractionSound("soft");
      return;
    }
    section.classList.add("is-opened");
    queueSceneTimer(() => guardedNavigate(() => goToScene(state.currentScene + 1), 650), 520);
  };

  ["pointerdown", "pointermove"].forEach((eventName) => {
    fog.addEventListener(eventName, (event) => {
      if (section.classList.contains("is-revealed") && eventName === "pointerdown") return;
      if (eventName === "pointerdown") {
        isWiping = true;
        fog.setPointerCapture?.(event.pointerId);
      }
      if (!isWiping) return;
      event.preventDefault();
      revealAt(event);
    });
  });
  ["pointerup", "pointercancel", "pointerleave"].forEach((eventName) => {
    fog.addEventListener(eventName, () => {
      isWiping = false;
    });
  });
  hitbox.addEventListener("click", (event) => {
    event.stopPropagation();
    advanceText();
  });
  section.addEventListener("click", (event) => {
    if (event.target.closest(".archive-name-intro-polaroid")) return;
    advanceText();
  });
  section.resetNameIntroFog = drawFog;
  window.requestAnimationFrame(drawFog);
}

function buildHandsScene(section) {
  const asset = getStoryAssetList("floristWorking")[0];
  const photo = createArchiveFigure(asset, { className: "archive-hands-photo", placeholder: true });
  if (photo) section.append(photo);
  const copy = appendSceneCopy(section, {
    kicker: "Trace 03",
    title: "Built by Hands",
    lines: [
      "Dekorasi datang belakangan.",
      "Yang lebih dulu adalah tangan yang bekerja, hari yang panjang, dan pesanan yang terus datang.",
    ],
    className: "archive-hands-copy",
  });
  const reveal = document.createElement("p");
  reveal.className = "archive-hands-reveal";
  reveal.textContent = "Dari pekerjaan itu, Marvell Florist menjadi salah satu tulang punggung keluarga.";
  copy.append(reveal);
  attachArchiveDustWipe(section);
}

function attachArchiveDustWipe(section) {
  const canvas = document.createElement("canvas");
  canvas.className = "archive-dust-canvas";
  const cue = document.createElement("span");
  cue.className = "archive-dust-cue";
  cue.textContent = "Usap Debu";
  section.append(canvas, cue);

  let isDrawing = false;
  let lastPoint = null;
  let didReveal = false;
  let coverageColumns = 1;
  let coverageRows = 1;
  const wipedCells = new Set();

  const sizeCanvas = () => {
    const rect = section.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    coverageColumns = Math.max(6, Math.ceil(rect.width / 72));
    coverageRows = Math.max(6, Math.ceil(rect.height / 72));
    wipedCells.clear();
    const context = canvas.getContext("2d");
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, rect.width, rect.height);
    const dust = getStoryAsset("overlays.dust");
    if (dust?.src) {
      drawDustSurface(context, rect);
      const image = new Image();
      image.onload = () => {
        context.clearRect(0, 0, rect.width, rect.height);
        context.globalAlpha = 0.28;
        context.drawImage(image, 0, 0, rect.width, rect.height);
        context.globalAlpha = 1;
        drawDustNoise(context, rect);
      };
      image.onerror = () => drawDustSurface(context, rect);
      image.src = dust.src;
      return;
    }
    drawDustSurface(context, rect);
  };

  const reveal = () => {
    if (didReveal) return;
    didReveal = true;
    section.classList.add("is-revealed");
    canvas.style.pointerEvents = "none";
    completeInteraction("hands");
  };

  const markCoverage = (x, y, rect) => {
    const radius = 112;
    const cellWidth = rect.width / coverageColumns;
    const cellHeight = rect.height / coverageRows;
    const minColumn = Math.max(0, Math.floor((x - radius) / cellWidth));
    const maxColumn = Math.min(coverageColumns - 1, Math.ceil((x + radius) / cellWidth));
    const minRow = Math.max(0, Math.floor((y - radius) / cellHeight));
    const maxRow = Math.min(coverageRows - 1, Math.ceil((y + radius) / cellHeight));

    for (let row = minRow; row <= maxRow; row += 1) {
      for (let column = minColumn; column <= maxColumn; column += 1) {
        const centerX = (column + 0.5) * cellWidth;
        const centerY = (row + 0.5) * cellHeight;
        if (Math.hypot(centerX - x, centerY - y) <= radius) {
          wipedCells.add(`${column}:${row}`);
        }
      }
    }

    return wipedCells.size / Math.max(1, coverageColumns * coverageRows);
  };

  const eraseAt = (x, y) => {
    const context = canvas.getContext("2d");
    context.save();
    context.globalCompositeOperation = "destination-out";
    const gradient = context.createRadialGradient(x, y, 6, x, y, 110);
    gradient.addColorStop(0, "rgba(0,0,0,0.96)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(x, y, 112, 0, Math.PI * 2);
    context.fill();
    context.restore();
  };

  const updatePointer = (event) => {
    const rect = canvas.getBoundingClientRect();
    const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    lastPoint = point;
    eraseAt(point.x, point.y);
    hideGuidanceHint();
    if (markCoverage(point.x, point.y, rect) >= 0.7) reveal();
  };

  canvas.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    isDrawing = true;
    lastPoint = null;
    canvas.setPointerCapture?.(event.pointerId);
    updatePointer(event);
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!isDrawing) return;
    event.preventDefault();
    updatePointer(event);
  });
  ["pointerup", "pointerleave", "pointercancel"].forEach((eventName) => {
    canvas.addEventListener(eventName, () => {
      isDrawing = false;
      lastPoint = null;
    });
  });
  window.requestAnimationFrame(sizeCanvas);
}

function drawDustSurface(context, rect) {
  context.fillStyle = "rgba(232, 228, 220, 0.24)";
  context.fillRect(0, 0, rect.width, rect.height);
  drawDustNoise(context, rect);
}

function drawDustNoise(context, rect) {
  context.globalAlpha = 0.16;
  for (let index = 0; index < 620; index += 1) {
    const radius = 0.45 + Math.random() * 2.6;
    context.beginPath();
    context.arc(Math.random() * rect.width, Math.random() * rect.height, radius, 0, Math.PI * 2);
    context.fillStyle = Math.random() > 0.58 ? "#fffdf4" : "#6f6a63";
    context.fill();
  }
  context.globalAlpha = 1;
}

function buildPapanScene(section) {
  appendSceneCopy(section, {
    kicker: "Trace 04",
    title: "Papan Bunga",
    lines: [
      "Sebelum buket dan rangkaian kecil, ada papan bunga.",
      "Ucapan selamat, duka cita, pembukaan usaha, dan perpisahan pernah menjadi bahasa awal Marvell Florist.",
    ],
    className: "archive-papan-copy",
  });
  const track = document.createElement("div");
  track.className = "archive-papan-track";
  const assets = getStoryAssetList("papanBunga");
  const panels = assets.length ? assets : [null, null];
  panels.forEach((asset, panelIndex) => {
    const panel = document.createElement("div");
    panel.className = "archive-papan-panel";
    panel.style.setProperty("--panel-index", panelIndex);
    const figure = createArchiveFigure(asset, { className: "archive-papan-photo", placeholder: true });
    if (figure) panel.append(figure);
    track.append(panel);
  });
  section.append(track);

  let isDragging = false;
  let startX = 0;
  let startScroll = 0;
  const checkEnd = () => {
    const max = track.scrollWidth - track.clientWidth;
    if (max <= 8 || track.scrollLeft >= max - 12) completeInteraction("papan");
  };
  track.addEventListener("scroll", () => {
    hideGuidanceHint();
    checkEnd();
  }, { passive: true });
  track.addEventListener("pointerdown", (event) => {
    isDragging = true;
    startX = event.clientX;
    startScroll = track.scrollLeft;
    track.setPointerCapture?.(event.pointerId);
  });
  track.addEventListener("pointermove", (event) => {
    if (!isDragging) return;
    event.preventDefault();
    track.scrollLeft = startScroll - (event.clientX - startX);
  });
  ["pointerup", "pointercancel", "pointerleave"].forEach((eventName) => {
    track.addEventListener(eventName, () => {
      isDragging = false;
      checkEnd();
    });
  });
}

function buildStoreScene(section) {
  appendSceneCopy(section, {
    kicker: "Trace 05",
    title: "The Store Keeps Moving",
    lines: [
      "Toko berubah.",
      "Ruang berubah.",
      "Cara orang memesan bunga juga berubah.",
      "Tapi nama itu tetap berdiri.",
    ],
    className: "archive-store-copy",
  });
  const oldAsset = getStoryAssetList("oldStore")[0];
  const currentAsset = getStoryAssetList("currentStore")[0];
  const wipe = document.createElement("div");
  wipe.className = "archive-wipe";
  wipe.style.setProperty("--wipe-percent", "12%");
  const before = createArchiveFigure(oldAsset, { className: "archive-wipe-photo archive-wipe-before", placeholder: true });
  const after = createArchiveFigure(currentAsset, { className: "archive-wipe-photo archive-wipe-after", placeholder: true });
  if (before) wipe.append(before);
  if (after) wipe.append(after);
  const handle = document.createElement("span");
  handle.className = "archive-wipe-handle";
  wipe.append(handle);
  section.append(wipe);

  let isDragging = false;
  const updateWipe = (clientX) => {
    const rect = wipe.getBoundingClientRect();
    const progress = Math.max(0.08, Math.min(0.96, (clientX - rect.left) / rect.width));
    wipe.style.setProperty("--wipe-percent", `${progress * 100}%`);
    hideGuidanceHint();
    if (progress >= 0.82) {
      section.classList.add("is-revealed");
      completeInteraction("store");
    }
  };
  wipe.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    isDragging = true;
    wipe.setPointerCapture?.(event.pointerId);
    updateWipe(event.clientX);
  });
  wipe.addEventListener("pointermove", (event) => {
    if (!isDragging) return;
    event.preventDefault();
    updateWipe(event.clientX);
  });
  ["pointerup", "pointercancel", "pointerleave"].forEach((eventName) => {
    wipe.addEventListener(eventName, () => {
      isDragging = false;
    });
  });
}

function buildArrangementsScene(section) {
  const stage = document.createElement("div");
  stage.className = "archive-arrangement-stage";
  const copy = appendSceneCopy(stage, {
    kicker: "Trace 06",
    title: "A Closer Gesture",
    lines: [
      "Tidak semua pesan datang dengan suara besar.",
      "Sebagian hadir pelan, di meja, di tangan, di ruang kecil seseorang.",
      "Di sana, bunga menjadi cara untuk menjaga rasa.",
    ],
    className: "archive-arrangement-copy",
  });
  const photos = document.createElement("div");
  photos.className = "archive-arrangement-photos";
  const assets = getStoryAssetList("arrangements");
  const panels = assets.length ? assets : [null, null];
  panels.forEach((asset, photoIndex) => {
    const figure = createArchiveFigure(asset, { className: "archive-arrangement-photo", placeholder: true });
    if (!figure) return;
    figure.style.setProperty("--arrangement-index", photoIndex);
    photos.append(figure);
  });
  stage.append(photos);
  const cue = createArchiveButton("Ketuk untuk menyimpan rasa", "archive-open-button archive-arrangement-button");
  copy.append(cue);
  section.append(stage);

  let tapCount = 0;
  const progress = () => {
    hideGuidanceHint();
    const figures = photos.querySelectorAll(".archive-arrangement-photo");
    figures[Math.min(tapCount, figures.length - 1)]?.classList.add("is-visible");
    copy.querySelectorAll("p:not(.archive-kicker)")[tapCount]?.classList.add("is-visible");
    tapCount += 1;
    if (tapCount >= Math.max(3, figures.length)) {
      cue.hidden = true;
      completeInteraction("arrangements");
    }
  };
  cue.addEventListener("click", progress);
  section.addEventListener("click", (event) => {
    if (event.target.closest(".archive-scene-next")) return;
    progress();
  });
  queueSceneTimer(progress, 700);
}

function buildRoomScene(section) {
  const room = getStoryAsset("room.atmosphere") || getStoryAsset("room.hero");
  if (room?.src) {
    section.style.setProperty("--scene-bg", cssUrl(room.src));
    section.classList.add("has-scene-bg");
  }
  const copy = appendSceneCopy(section, {
    kicker: "Trace 07",
    title: "What the Room Keeps",
    lines: [],
    className: "archive-room-copy",
  });
  const lines = [
    "Ruang ini tidak meminta untuk tinggal selamanya.",
    "Ia hanya meminta orang berhenti sebentar, melihat bunga, mengambil foto, lalu meninggalkan sedikit bukti.",
    "Besok bentuknya bisa berubah. Jejaknya tetap tinggal.",
  ];
  const lineWrap = document.createElement("div");
  lineWrap.className = "archive-room-lines";
  lines.forEach((line) => {
    const paragraph = document.createElement("p");
    paragraph.textContent = line;
    lineWrap.append(paragraph);
  });
  copy.append(lineWrap);

  const bloom = createArchiveFigure(getStoryAsset("room.bloom"), { className: "archive-room-bloom" });
  if (bloom) section.append(bloom);

  let lineIndex = 0;
  const revealLine = () => {
    hideGuidanceHint();
    lineWrap.children[lineIndex]?.classList.add("is-visible");
    lineIndex += 1;
    if (lineIndex >= lines.length) completeInteraction("room");
  };
  section.addEventListener("click", (event) => {
    if (event.target.closest(".archive-scene-next")) return;
    revealLine();
  });
  queueSceneTimer(revealLine, 650);
}

function buildRoomNoticeScene(section) {
  const copy = getCopy();
  const lines = copy.roomNoticeLines || [];
  const stage = document.createElement("div");
  stage.className = "archive-room-notice-stage";
  const text = document.createElement("div");
  text.className = "archive-room-notice-copy";
  lines.forEach((line) => {
    const paragraph = document.createElement("p");
    paragraph.textContent = line;
    text.append(paragraph);
  });
  const hitbox = createArchiveButton(copy.tapPrompt, "archive-room-notice-hitbox");
  stage.append(text, hitbox);
  section.append(stage);

  let index = 0;
  const reveal = () => {
    if (archiveScenes[state.currentScene]?.id !== "roomNotice") return;
    hideGuidanceHint();
    text.children[index]?.classList.add("is-visible");
    index += 1;
    playInteractionSound("soft");
    if (index >= lines.length) {
      section.classList.add("is-opened");
      queueSceneTimer(() => guardedNavigate(() => goToScene(state.currentScene + 1), 750), 700);
    }
  };
  hitbox.addEventListener("click", (event) => {
    event.stopPropagation();
    reveal();
  });
  section.addEventListener("click", (event) => {
    if (event.target.closest(".archive-scene-next")) return;
    reveal();
  });
  queueSceneTimer(reveal, 900);
}

function createCssFlower(flower = FLOWERS[0], className = "") {
  const wrap = document.createElement("span");
  wrap.className = ["css-flower", flower.cssClass, className].filter(Boolean).join(" ");
  wrap.style.setProperty("--flower-color", flower.color);
  const stem = document.createElement("span");
  stem.className = "css-flower-stem";
  const bloom = document.createElement("span");
  bloom.className = "css-flower-bloom";
  const petalCount = flower.id === "chrysanthemum" ? 16 : flower.id === "hydrangea" ? 12 : flower.id === "lily" ? 6 : 8;
  for (let index = 0; index < petalCount; index += 1) {
    const petal = document.createElement("span");
    petal.className = "css-flower-petal";
    petal.style.setProperty("--petal-index", index);
    petal.style.setProperty("--petal-count", petalCount);
    bloom.append(petal);
  }
  const core = document.createElement("span");
  core.className = "css-flower-core";
  bloom.append(core);
  wrap.append(stem, bloom);
  return wrap;
}

function createFlowerVariation() {
  return {
    rotation: -18 + Math.random() * 36,
    scale: 0.78 + Math.random() * 0.42,
    stemHeight: 74 + Math.random() * 54,
    headTilt: -18 + Math.random() * 36,
    bloomScale: 0.78 + Math.random() * 0.38,
    xOffset: -2.4 + Math.random() * 4.8,
    yOffset: -2.2 + Math.random() * 4.4,
    glowStrength: 0.18 + Math.random() * 0.32,
    variant: Math.floor(Math.random() * 4),
  };
}

function formatPlantDate(timestamp) {
  try {
    return new Intl.DateTimeFormat(state.language === "id" ? "id-ID" : undefined, {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(timestamp));
  } catch (error) {
    return "";
  }
}

function formatPlantTime(timestamp) {
  try {
    return new Intl.DateTimeFormat(state.language === "id" ? "id-ID" : undefined, {
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(timestamp));
  } catch (error) {
    return "";
  }
}

function closePlantedFlowerPanel(section) {
  section?.querySelector(".archive-flower-panel")?.remove();
}

function openPlantedFlowerPanel(section, flowerId) {
  const data = getGardenFlowers().find((flower) => flower.id === flowerId);
  if (!data) return;
  closePlantedFlowerPanel(section);
  const flower = getFlowerById(data.flowerId);
  const panel = document.createElement("aside");
  panel.className = "archive-flower-panel";
  const title = document.createElement("strong");
  title.textContent = flower.displayName;
  panel.append(title);
  [data.visitorName, data.meaning || flower.meaning, `${state.language === "id" ? "Ditanam pada" : "Planted on"} ${formatPlantDate(data.timestamp || data.createdAt)}`, formatPlantTime(data.timestamp || data.createdAt)]
    .filter(Boolean)
    .forEach((line) => {
      const item = document.createElement("span");
      item.textContent = line;
      panel.append(item);
    });
  section.querySelector(".archive-garden-stage")?.append(panel);
}

function buildBridgeFlowerScene(section) {
  const copy = getCopy();
  const stage = document.createElement("div");
  stage.className = "archive-flower-bridge";
  const vine = document.createElement("span");
  vine.className = "archive-flower-bridge-line";
  const bloom = createCssFlower(FLOWERS[0], "archive-flower-bridge-bloom");
  const copyBlock = appendSceneCopy(stage, {
    kicker: "Trace 03",
    title: copy.bridgeTitle,
    lines: copy.bridgeLines || [],
    className: "archive-flower-bridge-copy",
  });
  const button = createArchiveButton(copy.bridgeButton, "archive-flower-bridge-button");
  button.addEventListener("click", () => {
    hideGuidanceHint();
    guardedNavigate(() => goToScene(state.currentScene + 1));
  });
  copyBlock.append(button);
  stage.append(vine, bloom);
  section.append(stage);
}

function buildFlowersOccasionScene(section) {
  const copy = getCopy();
  const stage = document.createElement("div");
  stage.className = "archive-occasion-stage";
  const imageLayer = document.createElement("div");
  imageLayer.className = "archive-occasion-image-layer";
  getStoryAssetList("occasionImages").forEach((asset, imageIndex) => {
    const figure = createArchiveFigure(asset, { className: "archive-occasion-image", placeholder: false });
    if (!figure) return;
    figure.style.setProperty("--occasion-image-index", imageIndex);
    imageLayer.append(figure);
  });
  const petals = document.createElement("div");
  petals.className = "archive-occasion-particles";
  for (let index = 0; index < 18; index += 1) {
    const petal = document.createElement("span");
    petal.style.setProperty("--particle-index", index);
    petals.append(petal);
  }
  const title = document.createElement("h3");
  title.textContent = copy.occasionTitle;
  const line = document.createElement("p");
  line.className = "archive-occasion-line";
  const controls = document.createElement("div");
  controls.className = "archive-occasion-actions";
  const skip = createArchiveButton(copy.occasionButton, "archive-occasion-button");
  skip.disabled = true;
  skip.hidden = true;
  controls.append(skip);
  stage.append(imageLayer, petals, title, line, controls);
  section.append(stage);

  let lineIndex = 0;
  const lines = copy.occasionLines || [];
  const showLine = () => {
    if (archiveScenes[state.currentScene]?.id !== "flowersOccasion") return;
    line.classList.remove("is-visible");
    queueSceneTimer(() => {
      line.textContent = lines[lineIndex] || "";
      line.classList.add("is-visible");
      lineIndex += 1;
      if (lineIndex >= lines.length) {
        section.classList.add("is-complete");
        section.dataset.hint = copy.occasionReadyHint || copy.occasionButton;
        section.dataset.intent = "tap";
        skip.hidden = false;
        skip.disabled = false;
        scheduleGuidanceHint(900);
        return;
      }
      queueSceneTimer(showLine, 3300);
    }, lineIndex === 0 ? 80 : 620);
  };

  section.startOccasionSequence = () => {
    if (section.classList.contains("is-started")) return;
    section.classList.add("is-started");
    lineIndex = 0;
    showLine();
  };

  skip.addEventListener("click", () => {
    if (!section.classList.contains("is-complete")) return;
    hideGuidanceHint();
    guardedNavigate(() => goToScene(state.currentScene + 1));
  });
  section.addEventListener("click", (event) => {
    if (event.target.closest(".archive-occasion-button")) return;
    if (section.classList.contains("is-complete")) guardedNavigate(() => goToScene(state.currentScene + 1));
  });
}

function buildFlowerSelectScene(section) {
  const copy = getCopy();
  const selectedId = localStorage.getItem(GARDEN_STORAGE_KEYS.selectedFlower) || FLOWERS[0].id;
  const stage = document.createElement("div");
  stage.className = "archive-flower-select-stage";
  const intro = appendSceneCopy(stage, {
    kicker: "Trace 06",
    title: copy.flowerSelectTitle,
    lines: [copy.flowerSelectSubtitle],
    className: "archive-flower-select-copy",
  });
  const grid = document.createElement("div");
  grid.className = "archive-flower-grid";
  const input = document.createElement("input");
  input.className = "archive-flower-name";
  input.type = "text";
  input.maxLength = 32;
  input.placeholder = copy.visitorNameLabel;
  input.value = localStorage.getItem(GARDEN_STORAGE_KEYS.visitorName) || "";
  const button = createArchiveButton(copy.plantThisFlower, "archive-flower-plant-button action action-primary");
  const selectFlower = (flower) => {
    localStorage.setItem(GARDEN_STORAGE_KEYS.selectedFlower, flower.id);
    grid.querySelectorAll(".archive-flower-card").forEach((card) => {
      card.classList.toggle("is-selected", card.dataset.flowerId === flower.id);
    });
    button.disabled = false;
    playInteractionSound("soft");
  };
  FLOWERS.forEach((flower) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "archive-flower-card";
    card.dataset.flowerId = flower.id;
    card.classList.toggle("is-selected", flower.id === selectedId);
    card.style.setProperty("--flower-color", flower.color);
    const mark = createCssFlower(flower, "archive-flower-card-mark");
    const name = document.createElement("strong");
    name.textContent = flower.displayName;
    const meaning = document.createElement("span");
    meaning.textContent = flower.meaning;
    const visitor = document.createElement("em");
    visitor.textContent = flower.visitorLine;
    card.append(mark, name, meaning, visitor);
    card.addEventListener("click", () => selectFlower(flower));
    grid.append(card);
  });
  input.addEventListener("input", () => {
    localStorage.setItem(GARDEN_STORAGE_KEYS.visitorName, input.value.trim());
  });
  button.addEventListener("click", () => {
    localStorage.setItem(GARDEN_STORAGE_KEYS.visitorName, input.value.trim());
    localStorage.setItem(GARDEN_STORAGE_KEYS.selectedFlower, localStorage.getItem(GARDEN_STORAGE_KEYS.selectedFlower) || selectedId);
    hideGuidanceHint();
    guardedNavigate(() => goToScene(state.currentScene + 1));
  });
  intro.append(input, button);
  stage.append(grid);
  section.append(stage);
}

function playPlantRevealSound() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const context = state.audioContext || new AudioContextClass();
    state.audioContext = context;
    if (context.state === "suspended") context.resume();
    const now = context.currentTime;
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.045, now + 0.035);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.05);
    gain.connect(context.destination);
    [880, 1318.51, 1975.53].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      oscillator.type = index === 1 ? "triangle" : "sine";
      oscillator.frequency.setValueAtTime(frequency, now + index * 0.035);
      oscillator.connect(gain);
      oscillator.start(now + index * 0.035);
      oscillator.stop(now + 1.08);
    });
  } catch (error) {
    // The reveal should still work when Web Audio is unavailable.
  }
}

function createPlantedFlowerElement(data, options = {}) {
  const flower = getFlowerById(data.flowerId);
  const node = document.createElement("button");
  node.type = "button";
  node.className = `planted-flower${options.final ? " planted-flower-final" : ""}`;
  node.dataset.plantedFlowerId = data.id || "";
  node.style.left = `${(data.xPercent ?? 50) + (data.xOffset ?? 0)}%`;
  node.style.top = `${(data.yPercent ?? 70) + (data.yOffset ?? 0)}%`;
  node.style.setProperty("--plant-rotation", `${data.rotation ?? 0}deg`);
  node.style.setProperty("--plant-scale", data.scale ?? 1);
  node.style.setProperty("--stem-height", `${data.stemHeight ?? 92}px`);
  node.style.setProperty("--head-tilt", `${data.headTilt ?? 0}deg`);
  node.style.setProperty("--bloom-scale", data.bloomScale ?? 1);
  node.style.setProperty("--plant-glow", data.glowStrength ?? 0.26);
  node.style.setProperty("--flower-color", flower.color);
  node.style.zIndex = String(Math.round(data.yPercent ?? 70));
  node.append(createCssFlower(flower, "planted-flower-mark"));
  if (!options.final) node.setAttribute("aria-label", `${flower.displayName} planted flower`);
  return node;
}

function buildGardenPlantScene(section) {
  const copy = getCopy();
  const stage = document.createElement("div");
  stage.className = "archive-garden-stage";
  const plantedLayer = document.createElement("div");
  plantedLayer.className = "archive-garden-planted";
  const dreamLayer = document.createElement("div");
  dreamLayer.className = "archive-garden-dreams";
  for (let index = 0; index < 16; index += 1) {
    const spark = document.createElement("span");
    spark.style.setProperty("--spark-index", index);
    dreamLayer.append(spark);
  }
  const reaction = document.createElement("span");
  reaction.className = "archive-garden-reaction";
  const copyBlock = appendSceneCopy(stage, {
    kicker: "Trace 07",
    title: copy.plantingTitle,
    lines: [copy.plantingSubtitle],
    className: "archive-garden-copy",
  });
  const button = createArchiveButton(copy.leaveMyMark, "archive-garden-finish action action-primary");
  button.hidden = true;
  copyBlock.append(button);
  stage.append(dreamLayer, plantedLayer, reaction);
  section.append(stage);

  let pendingFlower = null;
  const renderStored = () => {
    plantedLayer.replaceChildren();
    getGardenFlowers().forEach((flower) => {
      const node = createPlantedFlowerElement(flower);
      node.addEventListener("click", (event) => {
        event.stopPropagation();
        openPlantedFlowerPanel(section, flower.id);
      });
      plantedLayer.append(node);
    });
  };
  const plantAt = (event) => {
    if (event.target.closest("button, input, .archive-flower-panel")) return;
    const selected = getSelectedFlower();
    const rect = stage.getBoundingClientRect();
    const xPercent = Math.max(8, Math.min(92, ((event.clientX - rect.left) / rect.width) * 100));
    const yPercent = Math.max(36, Math.min(88, ((event.clientY - rect.top) / rect.height) * 100));
    const visitorName = localStorage.getItem(GARDEN_STORAGE_KEYS.visitorName) || "";
    pendingFlower = {
      id: `flower-${state.sessionId || Date.now()}`,
      flowerId: selected.id,
      flowerName: selected.displayName,
      meaning: selected.meaning,
      visitorLine: selected.visitorLine,
      visitorName,
      xPercent,
      yPercent,
      ...createFlowerVariation(),
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    section.dataset.lastPlantedFlowerId = selected.id;
    const flowers = getGardenFlowers().filter((flower) => flower.id !== pendingFlower.id);
    flowers.push(pendingFlower);
    saveGardenFlowers(flowers);
    saveLastPlantedFlower(pendingFlower);
    renderStored();
    reaction.style.left = `${xPercent}%`;
    reaction.style.top = `${yPercent}%`;
    reaction.classList.remove("is-active");
    void reaction.offsetWidth;
    reaction.classList.add("is-active");
    button.hidden = false;
    section.classList.add("has-planted");
    playPlantRevealSound();
  };
  stage.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button, input, .archive-flower-panel")) return;
    event.preventDefault();
    closePlantedFlowerPanel(section);
    plantAt(event);
  });
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    hideGuidanceHint();
    guardedNavigate(() => goToScene(state.currentScene + 1));
  });
  renderStored();
}

function buildMarkFinalScene(section) {
  const copy = getCopy();
  const planted = readJsonStorage(GARDEN_STORAGE_KEYS.lastPlantedFlower, null) || {
    flowerId: getSelectedFlower().id,
    flowerName: getSelectedFlower().displayName,
    visitorLine: getSelectedFlower().visitorLine,
    xPercent: 26,
    yPercent: 57,
    rotation: -8,
    scale: 1,
  };
  const flower = getFlowerById(planted.flowerId);
  const photo = getLatestPhoto();
  const stage = document.createElement("div");
  stage.className = "archive-mark-stage";
  const card = document.createElement("article");
  card.className = "archive-mark-card";
  const frame = document.createElement("figure");
  frame.className = `archive-mark-photo${photo ? "" : " is-placeholder"}`;
  if (photo) {
    const image = document.createElement("img");
    image.src = photo;
    image.alt = "";
    frame.append(image);
  } else {
    const placeholder = document.createElement("span");
    placeholder.textContent = "MARVELL20";
    frame.append(placeholder);
  }
  const pressed = createPlantedFlowerElement({ ...planted, xPercent: 0, yPercent: 52, rotation: -9, scale: 1.08 }, { final: true });
  frame.append(pressed);
  const copyBlock = appendSceneCopy(card, {
    kicker: "Final",
    title: copy.finalMarkTitle,
    lines: [
      copy.finalMarkBody,
      copy.plantedDynamic.replace("{flower}", flower.displayName),
      flower.visitorLine,
    ],
    className: "archive-mark-copy",
  });
  const footer = document.createElement("p");
  footer.className = "archive-mark-footer";
  footer.textContent = copy.finalMarkFooter;
  const actions = document.createElement("div");
  actions.className = "archive-mark-actions";
  const viewGarden = createArchiveButton(copy.viewGarden, "action action-secondary");
  const finish = createArchiveButton(copy.returnBooth, "action action-primary");
  viewGarden.addEventListener("click", () => guardedNavigate(() => goToScene(archiveScenes.findIndex((scene) => scene.id === "gardenPlant"))));
  finish.addEventListener("click", () => guardedNavigate(finishArchiveExperience));
  actions.append(viewGarden, finish);
  copyBlock.append(footer, actions);
  card.append(frame, copyBlock);
  stage.append(card);
  section.append(stage);
}

function getTimelineAssets(assetGroup) {
  if (assetGroup === "room") {
    return [
      getStoryAsset("room.atmosphere"),
      getStoryAsset("room.bloom"),
      getStoryAsset("room.hero"),
    ].filter((asset) => asset?.src);
  }
  return getStoryAssetList(assetGroup);
}

function buildTimelineScene(section) {
  const copy = getCopy();
  const beats = copy.timelineBeats || [];
  const worldWidth = 3300;
  const worldHeight = 1240;
  const timelineStops = beats.map((beat, index) => {
    const stopLayout = [
      { x: 300, y: 670, anchorX: 0.46, anchorY: 0.5, scale: 0.98, textPosition: "above" },
      { x: 840, y: 310, anchorX: 0.48, anchorY: 0.5, scale: 0.98, textPosition: "below" },
      { x: 1430, y: 900, anchorX: 0.5, anchorY: 0.5, scale: 0.98, textPosition: "above" },
      { x: 2020, y: 340, anchorX: 0.52, anchorY: 0.5, scale: 0.98, textPosition: "below" },
      { x: 2560, y: 760, anchorX: 0.54, anchorY: 0.5, scale: 0.98, textPosition: "above" },
    ][index] || { x: 300 + index * 540, y: 620, anchorX: 0.5, anchorY: 0.5, scale: 0.98, textPosition: "below" };
    return {
      ...beat,
      ...stopLayout,
      progress: beats.length <= 1 ? 0 : (index / (beats.length - 1)) * 0.86,
    };
  });
  const finalStop = { x: 3040, y: 620, progress: 1, anchorX: 0.54, anchorY: 0.5, scale: 0.98 };
  const pathEndProgress = 0.88;
  const pathData = "M300 670 C470 180 650 160 840 310 C1040 470 1130 1040 1430 900 C1660 770 1760 150 2020 340 C2260 520 2310 1010 2560 760 C2680 650 2740 620 2820 620";
  section.style.setProperty("--timeline-progress", "0");

  const stage = document.createElement("div");
  stage.className = "archive-timeline-viewport";

  const video = document.createElement("video");
  video.className = "archive-timeline-video";
  video.src = getStoryAsset("timeline.bloomVideo")?.src || STORY_ASSETS.timeline?.bloomVideo || "lily.mp4";
  video.muted = true;
  video.loop = false;
  video.autoplay = false;
  video.playsInline = true;
  video.setAttribute("aria-hidden", "true");
  video.setAttribute("preload", "auto");

  const header = document.createElement("div");
  header.className = "archive-timeline-header";
  const title = document.createElement("h3");
  title.textContent = state.language === "id" ? "MARVELL20 ARSIP / WAKTU" : "MARVELL20 ARCHIVE / TIMELINE";
  const hint = document.createElement("p");
  hint.textContent = copy.timelineHint;
  header.append(title, hint);

  const world = document.createElement("div");
  world.className = "archive-timeline-world";
  world.style.setProperty("--timeline-world-width", `${worldWidth}px`);
  world.style.setProperty("--timeline-world-height", `${worldHeight}px`);

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "archive-timeline-string");
  svg.setAttribute("viewBox", `0 0 ${worldWidth} ${worldHeight}`);
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  const paths = {};
  ["archive-timeline-base", "archive-timeline-draw", "archive-timeline-active"].forEach((className) => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("class", className);
    path.setAttribute("d", pathData);
    paths[className] = path;
    svg.append(path);
  });
  world.append(svg);

  const beatLayer = document.createElement("div");
  beatLayer.className = "archive-timeline-beats";
  timelineStops.forEach((beat, beatIndex) => {
    const item = document.createElement("article");
    item.className = "archive-timeline-beat";
    item.classList.add(`is-${beat.textPosition}`);
    item.style.setProperty("--beat-index", beatIndex);
    item.style.setProperty("--beat-x", `${beat.x}px`);
    item.style.setProperty("--beat-y", `${beat.y}px`);
    item.dataset.stopIndex = String(beatIndex);

    const label = document.createElement("p");
    label.className = "archive-timeline-label";
    label.textContent = beat.label;
    const heading = document.createElement("h4");
    heading.textContent = beat.title;
    const lines = document.createElement("div");
    lines.className = "archive-timeline-lines";
    appendLines(lines, beat.lines || []);

    const fragments = document.createElement("div");
    fragments.className = "archive-timeline-fragments";
    getTimelineAssets(beat.assetGroup).slice(0, 2).forEach((asset, imageIndex) => {
      const figure = createArchiveFigure(asset, { className: "archive-timeline-fragment", placeholder: true });
      if (!figure) return;
      figure.style.setProperty("--fragment-index", imageIndex);
      figure.style.setProperty("--fragment-rotate", `${-7 + imageIndex * 13}deg`);
      fragments.append(figure);
    });

    item.append(label, heading, lines, fragments);
    beatLayer.append(item);
  });
  world.append(beatLayer);

  const slider = document.createElement("img");
  slider.className = "archive-timeline-slider draggable-trace";
  slider.src = getStoryAsset("timeline.slider")?.src || STORY_ASSETS.timeline?.slider || "slider.png";
  slider.alt = "";
  slider.setAttribute("aria-hidden", "true");
  world.append(slider);

  const finalLine = document.createElement("div");
  finalLine.className = "archive-timeline-final";
  finalLine.style.left = `${finalStop.x}px`;
  finalLine.style.top = `${finalStop.y}px`;
  appendLines(finalLine, copy.timelineFinalLines || []);
  world.append(finalLine);

  stage.append(video, world, header);
  section.append(stage);

  let progress = 0;
  let isDragging = false;
  let startX = 0;
  let startProgress = 0;
  let pathLength = 1;

  const easeProgress = (value) => value * value * (3 - 2 * value);

  const getCamera = () => {
    const cameraStops = [...timelineStops, finalStop];
    if (cameraStops.length <= 1) return cameraStops[0] || { x: 0, y: 620, anchorX: 0.5, anchorY: 0.5, scale: 0.98 };
    const toIndex = Math.max(1, cameraStops.findIndex((stop) => progress <= stop.progress));
    const fromIndex = Math.max(0, toIndex - 1);
    const from = cameraStops[fromIndex];
    const to = cameraStops[toIndex] || cameraStops[cameraStops.length - 1];
    const span = Math.max(0.001, to.progress - from.progress);
    const local = easeProgress((progress - from.progress) / span);
    return {
      x: from.x + (to.x - from.x) * local,
      anchorX: from.anchorX + (to.anchorX - from.anchorX) * local,
      scale: from.scale + (to.scale - from.scale) * local,
    };
  };

  const setVideoTime = () => {
    if (!Number.isFinite(video.duration) || video.duration <= 0) return;
    const frameRate = 30;
    const rawTarget = Math.min(video.duration - 0.05, Math.max(0, video.duration * progress));
    const target = Math.round(rawTarget * frameRate) / frameRate;
    if (Math.abs(video.currentTime - target) > 0.05) video.currentTime = target;
  };

  const updateProgress = (nextProgress) => {
    progress = Math.max(0, Math.min(1, nextProgress));
    const viewportWidth = Math.max(1, stage.clientWidth || window.innerWidth);
    const viewportHeight = Math.max(1, stage.clientHeight || window.innerHeight);
    const camera = getCamera();
    const translateX = viewportWidth * camera.anchorX - camera.x * camera.scale;
    const translateY = viewportHeight * 0.5 - (worldHeight * 0.52) * camera.scale;
    const stringProgress = Math.min(1, progress / pathEndProgress);
    const activePoint = paths["archive-timeline-draw"].getPointAtLength(pathLength * stringProgress);
    const activeIndex = progress >= 0.92
      ? timelineStops.length
      : Math.max(0, timelineStops.reduce((closestIndex, stop, stopIndex) => {
        const currentDistance = Math.abs(progress - stop.progress);
        const closestDistance = Math.abs(progress - (timelineStops[closestIndex]?.progress ?? 0));
        return currentDistance < closestDistance ? stopIndex : closestIndex;
      }, 0));

    section.style.setProperty("--timeline-progress", progress.toFixed(3));
    section.style.setProperty("--timeline-offset", String(pathLength * (1 - stringProgress)));
    section.style.setProperty("--timeline-video-opacity", (0.18 + progress * 0.26).toFixed(3));
    world.style.transform = `translate3d(${translateX.toFixed(1)}px, ${translateY.toFixed(1)}px, 0) scale(${camera.scale.toFixed(3)})`;
    slider.style.left = `${activePoint.x}px`;
    slider.style.top = `${activePoint.y}px`;
    beatLayer.querySelectorAll(".archive-timeline-beat").forEach((beat) => {
      const stopIndex = Number(beat.dataset.stopIndex || 0);
      const distance = Math.abs(stopIndex - activeIndex);
      beat.classList.toggle("is-visible", progress >= Math.max(0, (timelineStops[stopIndex]?.progress ?? 0) - 0.04));
      beat.classList.toggle("is-active", distance === 0 && progress < 0.92);
      beat.classList.toggle("is-past", stopIndex < activeIndex);
    });
    finalLine.classList.toggle("is-active", progress >= 0.92);
    setVideoTime();
    hideGuidanceHint();
    if (progress >= 0.98) {
      completeInteraction("timeline");
    }
  };

  const updateTimelineFromDrag = (clientX) => {
    updateProgress(startProgress + ((clientX - startX) / Math.max(240, stage.clientWidth)) * 1.32);
  };

  const snapToNearestTracePoint = () => {
    const stops = timelineStops.map((stop) => stop.progress).concat(1);
    const nearest = stops.reduce((closest, stop) => (
      Math.abs(stop - progress) < Math.abs(closest - progress) ? stop : closest
    ), stops[0] ?? progress);
    if (Math.abs(nearest - progress) < 0.035) updateProgress(nearest);
  };

  const initTimelineDrag = (target) => {
    target.addEventListener("pointerdown", (event) => {
      if (event.target.closest(".archive-scene-next")) return;
      if (target === stage && event.target.closest(".draggable-trace")) return;
      event.preventDefault();
      isDragging = true;
      startX = event.clientX;
      startProgress = progress;
      try {
        target.setPointerCapture?.(event.pointerId);
      } catch (error) {
        // Synthetic tests and older Safari builds can reject capture; dragging still works.
      }
    });
  };

  initTimelineDrag(stage);
  initTimelineDrag(slider);

  stage.addEventListener("pointerdown", (event) => {
    if (event.target.closest(".archive-scene-next")) return;
    if (event.target === slider) return;
  });
  stage.addEventListener("pointermove", (event) => {
    if (!isDragging) return;
    event.preventDefault();
    updateTimelineFromDrag(event.clientX);
  });
  ["pointerup", "pointercancel", "pointerleave"].forEach((eventName) => {
    stage.addEventListener(eventName, () => {
      isDragging = false;
      snapToNearestTracePoint();
    });
    slider.addEventListener(eventName, () => {
      isDragging = false;
      snapToNearestTracePoint();
    });
  });
  stage.addEventListener("wheel", (event) => {
    event.preventDefault();
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    updateProgress(progress + delta / 1600);
  }, { passive: false });
  video.addEventListener("loadedmetadata", setVideoTime);

  pathLength = paths["archive-timeline-draw"].getTotalLength();
  ["archive-timeline-draw", "archive-timeline-active"].forEach((className) => {
    paths[className].style.strokeDasharray = String(pathLength);
    paths[className].style.strokeDashoffset = String(pathLength);
  });
  updateProgress(0);
}

function getMontageArchiveItems(record = state.storyPhotoRecord) {
  const currentImage = getRecordImageUrl(record);
  const staticItems = getStoryAssetList("photoboothArchive").map((asset) => ({ src: asset.src, caption: asset.caption }));
  const savedItems = archiveRecords
    .filter((item) => item?.id !== record?.id)
    .map(getRecordImageUrl)
    .filter(Boolean)
    .map((src) => ({ src, caption: "" }));
  return {
    traces: [...staticItems, ...savedItems].slice(0, 22),
    currentImage,
  };
}

function createMontagePrint(item, index, isCurrent = false) {
  const print = document.createElement("figure");
  print.className = `montage-print${isCurrent ? " is-current" : ""}${item?.src ? "" : " is-empty"}`;
  const positions = [
    [5, 14], [24, 9], [45, 13], [66, 8], [88, 16],
    [12, 39], [34, 34], [58, 38], [79, 33], [96, 44],
    [4, 68], [25, 74], [48, 66], [70, 75], [92, 68],
    [16, 88], [39, 91], [63, 88], [84, 91], [98, 82],
    [10, 6], [54, 92], [76, 5], [31, 55],
  ];
  const [x, y] = positions[index % positions.length];
  print.style.setProperty("--print-index", index);
  print.style.setProperty("--print-x", `${x}%`);
  print.style.setProperty("--print-y", `${y}%`);
  print.style.setProperty("--print-rotate", `${-13 + (index * 7) % 26}deg`);
  print.style.setProperty("--print-scale", `${0.86 + ((index % 5) * 0.05)}`);

  if (item?.src) {
    const image = document.createElement("img");
    image.loading = "lazy";
    image.decoding = "async";
    image.src = item.src;
    image.alt = item.caption || "";
    image.addEventListener("error", () => {
      image.replaceWith(createArchivePlaceholder());
      print.classList.add("is-empty");
    });
    print.append(image);
  } else {
    print.append(createArchivePlaceholder());
  }

  if (item?.caption) {
    const caption = document.createElement("figcaption");
    caption.textContent = item.caption;
    print.append(caption);
  }
  return print;
}

function buildMontageScene(section) {
  const copy = getCopy();
  const { traces, currentImage } = getMontageArchiveItems();
  const field = document.createElement("div");
  field.className = "archive-montage-field";
  const prints = traces.length ? traces : Array.from({ length: 24 }, () => null);
  prints.forEach((item, index) => field.append(createMontagePrint(item, index)));
  if (currentImage) {
    field.append(createMontagePrint({ src: currentImage, caption: "" }, prints.length, true));
  }
  section.append(field);

  const copyBlock = appendSceneCopy(section, {
    kicker: "Final",
    title: copy.traceTitle,
    lines: [],
    className: "archive-montage-copy archive-montage-aftercopy",
  });

  const bottom = document.createElement("div");
  bottom.className = "archive-montage-bottom";
  appendLines(bottom, [copy.traceLineOne, copy.traceLineTwo]);
  const actions = document.createElement("div");
  actions.className = "archive-montage-actions";
  actions.hidden = true;
  const save = createArchiveButton(copy.saveAgain, "action action-secondary");
  const done = createArchiveButton(copy.done, "action action-primary");
  save.addEventListener("click", () => {
    if (state.storyPhotoRecord) shareFinalImage();
  });
  done.addEventListener("click", () => guardedNavigate(finishArchiveExperience));
  actions.append(save, done);
  bottom.append(actions);
  copyBlock.append(bottom);
}

function startArchiveMontage(section) {
  if (!section || section.classList.contains("is-playing") || section.classList.contains("is-complete")) return;
  const field = section.querySelector(".archive-montage-field");
  const actions = section.querySelector(".archive-montage-actions");
  hideGuidanceHint();
  playInteractionSound("soft");
  section.classList.add("is-playing");
  field?.querySelectorAll(".montage-print:not(.is-current)").forEach((print, index) => {
    queueSceneTimer(() => print.classList.add("is-visible"), 180 + index * 260);
  });
  const current = field?.querySelector(".montage-print.is-current");
  if (current) queueSceneTimer(() => current.classList.add("is-visible"), 6100);
  queueSceneTimer(() => {
    section.classList.add("is-complete");
    if (actions) actions.hidden = false;
    scheduleGuidanceHint(900);
  }, 8200);
}

function buildEpilogueScene(section) {
  const gate = document.createElement("div");
  gate.className = "archive-epilogue-gate";
  const copy = appendSceneCopy(gate, {
    kicker: "15 Juni - 4 Juli 2026",
    title: "MARVELL20",
    lines: [
      "Marvell kini telah tumbuh dewasa.",
      "Nama yang dulu diberikan kepada toko kecil kini hidup pada seseorang yang terus berjalan ke depan.",
      "Nama itu juga tinggal pada Marvell Florist yang masih berdiri di Batam.",
    ],
    className: "archive-epilogue-copy",
  });
  const adult = createArchiveFigure(STORY_ASSETS.adultMarvell, { className: "archive-epilogue-photo" });
  if (adult) gate.append(adult);
  const quote = document.createElement("div");
  quote.className = "archive-epilogue-quote";
  appendLines(quote, [
    "Waktu tidak pernah menunggu.",
    "Ia hanya meninggalkan bukti bahwa sesuatu pernah tumbuh.",
  ]);
  copy.append(quote);
  const date = document.createElement("p");
  date.className = "archive-epilogue-date";
  date.textContent = "MARVELL20  15 Juni - 4 Juli 2026";
  copy.append(date);
  const done = createArchiveButton("Selesai", "action action-primary archive-epilogue-done");
  done.addEventListener("click", () => guardedNavigate(finishArchiveExperience));
  copy.append(done);
  section.append(gate);
  queueSceneTimer(() => section.classList.add("is-unlocked"), 1200);
}

function renderStory(record = state.storyPhotoRecord) {
  if (!storyChaptersContainer) return;
  clearStoryTimers();
  state.storyPhotoRecord = record || activeSessionRecord || null;
  state.storyRendered = true;
  state.currentScene = 0;
  state.sceneUnlocked = false;

  const fragment = document.createDocumentFragment();
  const bloom = document.createElement("div");
  bloom.className = "archive-bloom";
  for (let index = 0; index < 6; index += 1) {
    const petal = document.createElement("span");
    petal.style.setProperty("--petal-index", index);
    bloom.append(petal);
  }
  fragment.append(bloom);
  archiveScenes.forEach((scene, index) => fragment.append(buildArchiveScene(scene, index)));
  storyChaptersContainer.replaceChildren(fragment);
  if (storyProgress) {
    storyProgress.replaceChildren(...archiveScenes.map((scene, index) => {
      const dot = document.createElement("span");
      dot.dataset.sceneId = scene.id;
      if (index === 0) dot.classList.add("is-active");
      return dot;
    }));
  }
  goToScene(0, { silent: true, instant: true });
}

function goToScene(index, options = {}) {
  if (!storyChaptersContainer) return;
  const nextIndex = Math.max(0, Math.min(archiveScenes.length - 1, index));
  clearStoryTimers();
  state.currentScene = nextIndex;
  state.sceneUnlocked = false;
  const progress = archiveScenes.length <= 1 ? 1 : nextIndex / (archiveScenes.length - 1);
  storyChaptersContainer.style.setProperty("--archive-progress", String(progress));
  storyChaptersContainer.dataset.currentScene = archiveScenes[nextIndex]?.id || "";
  if (!options.silent) {
    if (archiveScenes[nextIndex]?.id === "name") playLetterSound();
    else playInteractionSound("soft");
  }

  storyChaptersContainer.querySelectorAll(".archive-scene").forEach((section, sectionIndex) => {
    const isActive = sectionIndex === nextIndex;
    section.classList.toggle("is-active", isActive);
    if (!isActive) section.classList.remove("is-unlocked");
  });
  storyProgress?.querySelectorAll("span").forEach((dot, dotIndex) => {
    dot.classList.toggle("is-active", dotIndex === nextIndex);
    dot.classList.toggle("is-past", dotIndex < nextIndex);
  });
  setText("#story-title", getArchiveSceneTitle(archiveScenes[nextIndex]));
  if (archiveScenes[nextIndex]?.id === "nameIntro") {
    const activeIntro = storyChaptersContainer.querySelector(".archive-scene-nameIntro.is-active");
    queueSceneTimer(() => activeIntro?.resetNameIntroFog?.(), 120);
  }
  if (archiveScenes[nextIndex]?.id === "flowersOccasion") {
    const activeOccasion = storyChaptersContainer.querySelector(".archive-scene-flowersOccasion.is-active");
    queueSceneTimer(() => activeOccasion?.startOccasionSequence?.(), 500);
  }
  if (archiveScenes[nextIndex]?.id === "montage") {
    const activeMontage = storyChaptersContainer.querySelector(".archive-scene-montage.is-active");
    queueSceneTimer(() => startArchiveMontage(activeMontage), 450);
  }
  if (archiveScenes[nextIndex]?.id === "roomNotice") {
    const activeNotice = storyChaptersContainer.querySelector(".archive-scene-roomNotice.is-active");
    queueSceneTimer(() => activeNotice?.querySelector(".archive-room-notice-hitbox")?.click(), 900);
  }
  scheduleGuidanceHint(nextIndex === 0 ? 4000 : 3600);
}

async function enterArchive(record = activeSessionRecord) {
  stopCamera();
  try {
    archiveRecords = await getArchiveRecords();
  } catch (error) {
    console.warn("MARVELL20 archive portrait montage load failed", error);
  }
  renderStory(record);
  state.isSoundEnabled = true;
  syncSoundToggle();
  unlockStoryAudio(true).then(startAmbientSound).catch(() => {});
  setView("story");
  storyChaptersContainer?.focus({ preventScroll: true });
}

function finishArchiveExperience() {
  stopAmbientSound();
  resetStoryExperience();
  startAgain();
}

function scheduleStoryParallax() {}

function updateStoryParallax() {}

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
  storyContinueButton.disabled = isBusy;
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
      exportButton.textContent = getCopy().highQuality;
    }, 1400);
    setExportBusy(false);
  }
}

function showSaveConfirmation() {
  if (!saveConfirmation) return;
  saveConfirmation.hidden = false;
  window.setTimeout(() => {
    saveConfirmation.classList.add("is-visible");
  }, 20);
}

function hideSaveConfirmation() {
  if (!saveConfirmation) return;
  saveConfirmation.classList.remove("is-visible");
  window.setTimeout(() => {
    saveConfirmation.hidden = true;
  }, 260);
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
        showSaveConfirmation();
        return;
      }
    }

    downloadBlob(blob, fileName);
    airdropButton.textContent = "Downloaded";
    await updateSessionRecord({ exportStatus: "downloaded_png" });
    showSaveConfirmation();
  } catch (error) {
    if (error?.name !== "AbortError") {
      console.warn("MARVELL20 AirDrop export failed", error);
      airdropButton.textContent = "Try Again";
    }
  } finally {
    window.setTimeout(() => {
      airdropButton.textContent = getCopy().savePhoto;
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

function createGifSegment(blob, startFraction = 0, durationFraction = 1, expectedDuration = 0, timing = {}) {
  return { blob, startFraction, durationFraction, expectedDuration, ...timing };
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
      const fallbackStartTime = duration * (segment.startFraction ?? 0);
      const unclampedStartTime = Number.isFinite(segment.startTime) ? segment.startTime : fallbackStartTime;
      const startTime = Math.max(0, Math.min(duration - 0.1, unclampedStartTime));
      const rawDuration = expectedDuration || duration * (segment.durationFraction ?? 1);
      const rawEndTime = Number.isFinite(segment.endTime) ? segment.endTime : startTime + rawDuration;
      const endTime = Math.min(duration - 0.03, Math.max(startTime + 0.65, rawEndTime));
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
      gifButton.textContent = getCopy().gif;
    }, 1400);
  } finally {
    setExportBusy(false);
  }
}

function startAgain() {
  stopCamera();
  hideSaveConfirmation();
  stopAmbientSound();
  resetSession();
  setView("home");
}

function resetInactivityTimer() {
  window.clearTimeout(inactivityTimer);
  scheduleGuidanceHint();
  if (state.isCapturing) return;
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
    navigator.serviceWorker.register("service-worker.js?v=photobooth-75").catch(() => {});
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
glimpseButton?.addEventListener("click", startPhotoboothFromGlimpse);
archiveButton?.addEventListener("click", () => enterArchive(activeSessionRecord));
soundToggleButton.addEventListener("click", toggleSound);
languageButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    applyLanguage(button.dataset.boothLang);
    playInteractionSound("soft");
  });
});
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
storyContinueButton.addEventListener("click", () => enterArchive(activeSessionRecord));
gifButton.addEventListener("click", showGifQr);
startAgainButton.addEventListener("click", startAgain);
scanBackButton.addEventListener("click", () => {
  setView("final");
});
scanStartAgainButton.addEventListener("click", startAgain);
archiveRefreshButton.addEventListener("click", showArchive);
archiveBackButton.addEventListener("click", startAgain);
storyCloseButton?.addEventListener("click", () => guardedNavigate(finishArchiveExperience));
storyChaptersContainer.addEventListener("scroll", scheduleStoryParallax, { passive: true });
confirmArchiveButton.addEventListener("click", () => {
  hideSaveConfirmation();
  enterArchive(activeSessionRecord);
});
finishButton.addEventListener("click", startAgain);

["pointerdown", "keydown", "touchstart"].forEach((eventName) => {
  document.addEventListener(eventName, resetInactivityTimer, { passive: true });
});

document.addEventListener("pointerdown", (event) => {
  showTapHalo(event);
  if (event.target.closest("button, .format-choice, .visual-choice, .archive-link")) {
    playInteractionSound("click");
  }
}, { passive: true });

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
applyLanguage("en");
scheduleGuidanceHint();
refreshRenderedPreviews();
