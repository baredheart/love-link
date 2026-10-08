// ==========================================
// BARED HEART
// DESKTOP + MOBILE
// ==========================================

const canvas = document.getElementById("canvas");
const SVG_NS = "http://www.w3.org/2000/svg";

// ==========================================
// DEVICE
// ==========================================

const isMobile = window.innerWidth <= 768;

// ==========================================
// SUPABASE
// ==========================================

const SUPABASE_URL =
    "https://ibsdnsqavmrugzobgitr.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_KTmiZGedhB2yst5FvPhOJQ_E97k4Jno";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

// ==========================================
// URLS
// ==========================================

const SITE_URL =
    "https://baredheart.github.io/love-link/";

const FRAMER_URL =
    "https://baredheart.framer.website/";

// ==========================================
// PAGE SETTINGS
// ==========================================

const LEFT_MARGIN = isMobile ? 20 : 30;
const RIGHT_MARGIN = isMobile ? 20 : 30;
const TOP_MARGIN = isMobile ? 30 : 40;

const LETTER_HEIGHT = isMobile ? 40 : 80;
const LINE_HEIGHT = isMobile ? 48 : 88;

const LETTER_GAP = isMobile ? 2 : 3;
const SPACE_WIDTH = isMobile ? 18 : 35;

// ==========================================
// RHYTHM SETTINGS
// ==========================================

const MIN_TIME = 50;
const MIN_STRETCH = 0.12;

const MAX_TIME = 1500;
const MAX_STRETCH = 10;

// ==========================================
// CURSOR SETTINGS
// ==========================================

const CURSOR_GAP = isMobile ? 6 : 12;
const CURSOR_SCALE = 1;

const BLINK_FAST = 320;
const BLINK_SLOW = 1100;

const SLOWDOWN_START = 1200;
const SLOWDOWN_END = 4500;

// ==========================================
// BUTTON SETTINGS
// ==========================================

const BUTTON_RIGHT = 30;
const BUTTON_LEFT = 30;
const BUTTON_BOTTOM = isMobile ? 10 : 30;

const BUTTON_WIDTH = 115;
const BUTTON_TRANSITION = 280;

// ==========================================
// STATE
// ==========================================

let cursorX = LEFT_MARGIN;
let cursorY = TOP_MARGIN;

let lastKeyTime = null;

let isSealed = false;
let isCollected = false;
let isReadOnly = false;

let history = [];
let strikeIndex = -1;

let mobileInput = null;
let mobileKeyboardOpen = false;

let interfaceButton = null;
let backButton = null;

let cursorGroup = null;
let cursorAnimationFrame = null;

let cursorPauseStart = performance.now();
let lastBlinkTime = performance.now();
let cursorVisible = true;

let lastScrollLine = -1;

// ==========================================
// SVG FILES
// ==========================================

const glyphFiles = {
    A: "./glyphs/A.svg",
    B: "./glyphs/B.svg",
    C: "./glyphs/C.svg",
    D: "./glyphs/D.svg",
    E: "./glyphs/E.svg",
    F: "./glyphs/F.svg",
    G: "./glyphs/G.svg",
    H: "./glyphs/H.svg",
    I: "./glyphs/I.svg",
    J: "./glyphs/J.svg",
    K: "./glyphs/K.svg",
    L: "./glyphs/L.svg",
    M: "./glyphs/M.svg",
    N: "./glyphs/N.svg",
    O: "./glyphs/O.svg",
    P: "./glyphs/P.svg",
    Q: "./glyphs/Q.svg",
    R: "./glyphs/R.svg",
    S: "./glyphs/S.svg",
    T: "./glyphs/T.svg",
    U: "./glyphs/U.svg",
    V: "./glyphs/V.svg",
    W: "./glyphs/W.svg",
    X: "./glyphs/X.svg",
    Y: "./glyphs/Y.svg",
    Z: "./glyphs/Z.svg",

    "0": "./glyphs/0.svg",
    "1": "./glyphs/1.svg",
    "2": "./glyphs/2.svg",
    "3": "./glyphs/3.svg",
    "4": "./glyphs/4.svg",
    "5": "./glyphs/5.svg",
    "6": "./glyphs/6.svg",
    "7": "./glyphs/7.svg",
    "8": "./glyphs/8.svg",
    "9": "./glyphs/9.svg",

    "'": "./glyphs/apostrophe.svg",
    '"': "./glyphs/quotation.svg",

    ",": "./glyphs/comma.svg",
    ".": "./glyphs/period.svg",

    ":": "./glyphs/colon.svg",
    ";": "./glyphs/semicolon.svg",

    "?": "./glyphs/question.svg",
    "!": "./glyphs/exclamation.svg",

    "+": "./glyphs/plus.svg",
    "-": "./glyphs/hyphen.svg",
    "=": "./glyphs/equals.svg",
    "_": "./glyphs/underscore.svg",

    "%": "./glyphs/percent.svg",
    "$": "./glyphs/dollar.svg",
    "#": "./glyphs/hash.svg",
    "*": "./glyphs/asterisk.svg",

    "^": "./glyphs/caret.svg",
    "|": "./glyphs/vertical-bar.svg",

    "@": "./glyphs/at.svg",
    "&": "./glyphs/ampersand.svg",

    "/": "./glyphs/slash.svg",
    "\\": "./glyphs/backslash.svg",

    "<": "./glyphs/less-than.svg",
    ">": "./glyphs/greater-than.svg",

    "(": "./glyphs/left-parenthesis.svg",
    ")": "./glyphs/right-parenthesis.svg",

    "[": "./glyphs/left-square-bracket.svg",
    "]": "./glyphs/right-square-bracket.svg",

    "{": "./glyphs/left-curly-brace.svg",
    "}": "./glyphs/right-curly-brace.svg"
};

// ==========================================
// SVG STORAGE
// ==========================================

const glyphs = {};

let cursorSource = null;
let strikeSource = null;

// ==========================================
// LOAD SVG
// ==========================================

async function loadSVG(file) {
    try {
        const response = await fetch(file);

        if (!response.ok) {
            console.error("Could not load:", file);
            return null;
        }

        const svgText = await response.text();

        const parser = new DOMParser();

        const svgDocument = parser.parseFromString(
            svgText,
            "image/svg+xml"
        );

        return svgDocument.documentElement;

    } catch (error) {
        console.error("SVG loading error:", file, error);
        return null;
    }
}

// ==========================================
// MOBILE VIEWPORT
// ==========================================

function getMobileViewportWidth() {
    return document.documentElement.clientWidth ||
        window.innerWidth;
}

function getWritingWidth() {
    return isMobile
        ? getMobileViewportWidth()
        : window.innerWidth;
}

// ==========================================
// MOBILE PAGE SETUP
// ==========================================

function setupMobilePage() {
    if (!isMobile) return;

    document.documentElement.style.overflowX = "hidden";
    document.documentElement.style.overflowY = "auto";

    document.body.style.overflowX = "hidden";
    document.body.style.overflowY = "auto";

    document.body.style.width = "100%";
    document.body.style.maxWidth = "100%";

    canvas.style.maxWidth = "100%";
    canvas.style.touchAction = "pan-y";
}

// ==========================================
// MOBILE KEYBOARD — BUTTON VISIBILITY
// ==========================================

function updateMobileButtons() {
    if (!isMobile || isReadOnly) return;

    // Keep buttons visible when the keyboard opens.
    if (interfaceButton) {
        interfaceButton.style.visibility = "visible";

        interfaceButton.style.pointerEvents =
            isCollected ? "none" : "auto";
    }

    if (backButton) {
        backButton.style.visibility =
            isCollected ? "visible" : "hidden";

        backButton.style.pointerEvents =
            isCollected ? "auto" : "none";
    }
}

function setMobileKeyboardOpen(open) {
    if (!isMobile) return;

    mobileKeyboardOpen = open;
    updateMobileButtons();
}

// ==========================================
// MOBILE INPUT
// ==========================================

function createMobileInput() {
    if (!isMobile) return;

    mobileInput = document.createElement("textarea");

    mobileInput.id = "mobile-input";

    mobileInput.setAttribute("autocomplete", "off");
    mobileInput.setAttribute("autocorrect", "off");
    mobileInput.setAttribute("autocapitalize", "characters");
    mobileInput.setAttribute("spellcheck", "false");
    mobileInput.setAttribute("inputmode", "text");

    Object.assign(mobileInput.style, {
        position: "fixed",
        left: "0px",
        bottom: "0px",
        width: "1px",
        height: "1px",
        opacity: "0",
        border: "0",
        padding: "0",
        margin: "0",
        fontSize: "16px",
        zIndex: "9998",
        pointerEvents: "none"
    });

    document.body.appendChild(mobileInput);

    mobileInput.addEventListener("focus", function () {
        setMobileKeyboardOpen(true);

        setTimeout(function () {
            updateCanvasSize();
            followMobileCursor();
        }, 350);
    });

    mobileInput.addEventListener("blur", function () {
        setMobileKeyboardOpen(false);
    });

    mobileInput.addEventListener("input", function () {
        if (isSealed || isReadOnly) {
            mobileInput.value = "";
            return;
        }

        const value = mobileInput.value;

        if (!value) return;

        Array.from(value).forEach(function (character) {
            if (character === "\n") {
                handleReturn();
                return;
            }

            if (character === " ") {
                handleSpace();
                return;
            }

            processTypedCharacter(character);
        });

        mobileInput.value = "";
    });

    mobileInput.addEventListener("keydown", function (event) {
        if (isSealed || isReadOnly) return;

        if (event.key === "Backspace") {
            event.preventDefault();
            strikePreviousCharacter();
            mobileInput.value = "";
        }
    });

    canvas.addEventListener("click", function () {
        if (isSealed || isReadOnly) return;

        focusMobileInput();
    });
}

function focusMobileInput() {
    if (!mobileInput || isSealed || isReadOnly) return;

    mobileInput.focus({
        preventScroll: true
    });

    setMobileKeyboardOpen(true);
}

// ==========================================
// MOBILE KEYBOARD — SAFARI FALLBACK
// ==========================================

let keyboardCheckTimer = null;

function checkMobileKeyboardViewport() {
    if (!isMobile || isReadOnly) return;

    const viewport = window.visualViewport;

    if (!viewport) return;

    const heightDifference =
        window.innerHeight - viewport.height;

    if (heightDifference > 150) {
        setMobileKeyboardOpen(true);
        return;
    }

    clearTimeout(keyboardCheckTimer);

    keyboardCheckTimer = setTimeout(function () {
        const currentViewport = window.visualViewport;

        if (!currentViewport) return;

        const currentDifference =
            window.innerHeight - currentViewport.height;

        if (currentDifference <= 150) {
            setMobileKeyboardOpen(false);
        }
    }, 120);
}

if (isMobile && window.visualViewport) {
    window.visualViewport.addEventListener("resize", function () {
        checkMobileKeyboardViewport();

        if (!isSealed && !isReadOnly) {
            updateCanvasSize();
            followMobileCursor();
        }
    });

    window.visualViewport.addEventListener(
        "scroll",
        checkMobileKeyboardViewport
    );
}

// ==========================================
// HEART ID
// ==========================================

function generateHeartID() {
    const characters =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let id = "";

    for (let i = 0; i < 5; i++) {
        const randomIndex = Math.floor(
            Math.random() * characters.length
        );

        id += characters[randomIndex];
    }

    return id;
}

function getHeartIDFromURL() {
    if (!window.location.hash) return null;

    const id = window.location.hash
        .substring(1)
        .trim()
        .toUpperCase();

    if (!/^[A-Z2-9]{5}$/.test(id)) return null;

    return id;
}

// ==========================================
// SAVE HEART
// ==========================================

async function saveHeartToSupabase(letterData) {
    for (let attempt = 0; attempt < 10; attempt++) {
        const heartID = generateHeartID();

        const { error } = await supabaseClient
            .from("hearts")
            .insert({
                id: heartID,
                letter_data: letterData
            });

        if (!error) return heartID;

        if (error.code === "23505") continue;

        console.error("Could not save heart:", error);
        throw error;
    }

    throw new Error("Could not create unique heart ID.");
}

// ==========================================
// LOAD HEART
// ==========================================

async function loadHeartFromSupabase(heartID) {
    const { data, error } = await supabaseClient
        .from("hearts")
        .select("letter_data")
        .eq("id", heartID)
        .maybeSingle();

    if (error) {
        console.error("Could not load heart:", error);
        return;
    }

    if (!data || !data.letter_data) {
        console.error("Heart not found:", heartID);
        return;
    }

    loadSavedLetter(data.letter_data);
}

// ==========================================
// TIMING → WIDTH
// ==========================================

function getStretch(interval) {
    const time = Math.min(
        Math.max(interval, MIN_TIME),
        MAX_TIME
    );

    let amount =
        (time - MIN_TIME) /
        (MAX_TIME - MIN_TIME);

    amount = Math.pow(amount, 1.1);

    return MIN_STRETCH +
        amount * (MAX_STRETCH - MIN_STRETCH);
}

// ==========================================
// PRESERVE STROKE WIDTH
// ==========================================

function preserveStrokeWidth(element) {
    const selectors =
        "path, line, polyline, polygon, circle, ellipse, rect";

    if (element.matches && element.matches(selectors)) {
        element.setAttribute(
            "vector-effect",
            "non-scaling-stroke"
        );
    }

    if (element.querySelectorAll) {
        element.querySelectorAll(selectors).forEach(function (shape) {
            shape.setAttribute(
                "vector-effect",
                "non-scaling-stroke"
            );
        });
    }
}

// ==========================================
// BUTTONS
// ==========================================

function createInterfaceButton() {
    interfaceButton = document.createElement("img");

    interfaceButton.id = "heart-button";

    Object.assign(interfaceButton.style, {
        position: "fixed",
        right: BUTTON_RIGHT + "px",
        bottom: BUTTON_BOTTOM + "px",
        width: BUTTON_WIDTH + "px",
        height: "auto",
        zIndex: "9999",
        cursor: "pointer",
        opacity: "1",
        transition: `opacity ${BUTTON_TRANSITION}ms ease-in-out`,
        userSelect: "none",
        webkitUserSelect: "none",
        webkitTouchCallout: "none"
    });

    interfaceButton.draggable = false;

    interfaceButton.addEventListener("mouseenter", function () {
        if (!isCollected) {
            interfaceButton.style.opacity = "0.7";
        }
    });

    interfaceButton.addEventListener("mouseleave", function () {
        interfaceButton.style.opacity = "1";
    });

    interfaceButton.addEventListener("click", handleButtonClick);

    document.body.appendChild(interfaceButton);
}

function createBackButton() {
    backButton = document.createElement("img");

    backButton.id = "back-button";
    backButton.src = "./glyphs/back-button.svg";

    Object.assign(backButton.style, {
        position: "fixed",
        left: BUTTON_LEFT + "px",
        bottom: BUTTON_BOTTOM + "px",
        width: BUTTON_WIDTH + "px",
        height: "auto",
        zIndex: "9999",
        cursor: "pointer",
        opacity: "0",
        visibility: "hidden",
        pointerEvents: "none",
        transition: `opacity ${BUTTON_TRANSITION}ms ease-in-out`,
        userSelect: "none",
        webkitUserSelect: "none"
    });

    backButton.draggable = false;

    backButton.addEventListener("mouseenter", function () {
        backButton.style.opacity = "0.7";
    });

    backButton.addEventListener("mouseleave", function () {
        backButton.style.opacity = "1";
    });

    backButton.addEventListener("click", function () {
        window.location.href = FRAMER_URL;
    });

    document.body.appendChild(backButton);
}

function showBackButton() {
    if (!backButton) return;

    backButton.style.visibility = "visible";
    backButton.style.pointerEvents = "auto";
    backButton.style.opacity = "0";

    requestAnimationFrame(function () {
        requestAnimationFrame(function () {
            backButton.style.opacity = "1";
        });
    });
}

// ==========================================
// BUTTON STATE
// ==========================================

function setButtonState(state, animate = true) {
    if (!interfaceButton) return;

    let newSource = "";

    if (state === "seal") {
        newSource = "./glyphs/seal-button.svg";
        interfaceButton.style.cursor = "pointer";
    }

    if (state === "collect") {
        newSource = "./glyphs/collect-button.svg";
        interfaceButton.style.cursor = "pointer";
    }

    if (state === "collected") {
        newSource = "./glyphs/collected-button.svg";
        interfaceButton.style.cursor = "default";
    }

    if (!newSource) return;

    if (!animate) {
        interfaceButton.src = newSource;
        interfaceButton.style.opacity = "1";

        interfaceButton.style.pointerEvents =
            state === "collected" ? "none" : "auto";

        updateMobileButtons();
        return;
    }

    interfaceButton.style.pointerEvents = "none";
    interfaceButton.style.opacity = "0";

    setTimeout(function () {
        interfaceButton.src = newSource;

        requestAnimationFrame(function () {
            interfaceButton.style.opacity = "1";

            if (state !== "collected") {
                interfaceButton.style.pointerEvents = "auto";
            }

            updateMobileButtons();
        });

        if (state === "collected") {
            showBackButton();
        }

    }, BUTTON_TRANSITION);
}

// ==========================================
// BUTTON CLICK
// ==========================================

async function handleButtonClick() {
    if (isReadOnly || isCollected) return;

    if (!isSealed) {
        sealLetter();
        return;
    }

    await collectLetter();
}

// ==========================================
// SEAL
// ==========================================

function sealLetter() {
    isSealed = true;

    if (mobileInput) {
        mobileInput.blur();
    }

    if (cursorGroup) {
        cursorGroup.style.display = "none";
    }

    if (cursorAnimationFrame) {
        cancelAnimationFrame(cursorAnimationFrame);
        cursorAnimationFrame = null;
    }

    setButtonState("collect");
}

// ==========================================
// COLLECT
// ==========================================

async function collectLetter() {
    if (interfaceButton) {
        interfaceButton.style.pointerEvents = "none";
    }

    try {
        const letterData = createLetterData();

        const heartID = await saveHeartToSupabase(letterData);

        const shareURL = SITE_URL + "#" + heartID;

        try {
            await navigator.clipboard.writeText(shareURL);
        } catch (error) {
            fallbackCopy(shareURL);
        }

        isCollected = true;
        setButtonState("collected");

    } catch (error) {
        console.error("Heart could not be collected:", error);

        if (interfaceButton) {
            interfaceButton.style.pointerEvents = "auto";
        }
    }
}

// ==========================================
// FALLBACK COPY
// ==========================================

function fallbackCopy(text) {
    const textArea = document.createElement("textarea");

    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";

    document.body.appendChild(textArea);

    textArea.focus();
    textArea.select();

    try {
        document.execCommand("copy");
    } catch (error) {
        console.error("Copy failed:", error);
    }

    textArea.remove();
}

// ==========================================
// CREATE LETTER DATA
// ==========================================

function createLetterData() {
    return history.map(function (item) {
        if (item.type === "glyph") {
            return {
                type: "glyph",
                character: item.character,

                x: Math.round(item.x * 100) / 100,
                y: Math.round(item.y * 100) / 100,

                width: Math.round(item.width * 100) / 100,
                height: item.height,

                stretch: Math.round(item.stretch * 10000) / 10000,
                struck: item.struck
            };
        }

        return {
            type: item.type,
            x: Math.round(item.x * 100) / 100,
            y: Math.round(item.y * 100) / 100
        };
    });
}

// ==========================================
// CURSOR
// ==========================================

function createCursor() {
    if (!cursorSource || isSealed || isReadOnly) return;

    cursorGroup = document.createElementNS(SVG_NS, "g");

    Array.from(cursorSource.children).forEach(function (child) {
        const copy = document.importNode(child, true);

        preserveStrokeWidth(copy);
        cursorGroup.appendChild(copy);
    });

    canvas.appendChild(cursorGroup);

    cursorPauseStart = performance.now();
    lastBlinkTime = performance.now();
    cursorVisible = true;

    animateCursor();
}

function animateCursor() {
    if (!cursorGroup || !cursorSource || isSealed || isReadOnly) return;

    const now = performance.now();
    const pausedFor = now - cursorPauseStart;

    let blinkSpeed = BLINK_FAST;

    if (pausedFor > SLOWDOWN_START) {
        let progress =
            (pausedFor - SLOWDOWN_START) /
            (SLOWDOWN_END - SLOWDOWN_START);

        progress = Math.min(Math.max(progress, 0), 1);
        progress = progress * progress * (3 - 2 * progress);

        blinkSpeed =
            BLINK_FAST +
            (BLINK_SLOW - BLINK_FAST) * progress;
    }

    if (now - lastBlinkTime >= blinkSpeed) {
        cursorVisible = !cursorVisible;
        lastBlinkTime = now;
    }

    cursorGroup.style.opacity = cursorVisible ? "1" : "0";

    const viewBox = cursorSource.viewBox.baseVal;

    const baseScale = LETTER_HEIGHT / viewBox.height;
    const finalScale = baseScale * CURSOR_SCALE;

    const centreX = viewBox.x + viewBox.width / 2;
    const centreY = viewBox.y + viewBox.height / 2;

    const anchorX = cursorX + CURSOR_GAP;
    const anchorY = cursorY + LETTER_HEIGHT / 2;

    cursorGroup.setAttribute(
        "transform",
        `
        translate(${anchorX} ${anchorY})
        scale(${finalScale})
        translate(${-centreX} ${-centreY})
        `
    );

    canvas.appendChild(cursorGroup);

    cursorAnimationFrame = requestAnimationFrame(animateCursor);
}

function resetCursor() {
    if (isSealed || isReadOnly) return;

    cursorPauseStart = performance.now();
    lastBlinkTime = performance.now();
    cursorVisible = true;

    if (cursorGroup) {
        cursorGroup.style.opacity = "1";
    }
}

// ==========================================
// CURSOR FOLLOW
// ==========================================

function followDesktopCursor() {
    if (isMobile || isSealed || isReadOnly) return;

    const currentLine = Math.round(
        (cursorY - TOP_MARGIN) / LINE_HEIGHT
    );

    const cursorOnScreen = cursorY - window.scrollY;
    const safeBottom = window.innerHeight * 0.75;

    if (
        cursorOnScreen > safeBottom &&
        currentLine !== lastScrollLine
    ) {
        lastScrollLine = currentLine;

        window.scrollTo({
            top: Math.max(
                0,
                cursorY - window.innerHeight * 0.55
            ),
            behavior: "smooth"
        });
    }
}

// ==========================================
// MOBILE CURSOR FOLLOW
// ==========================================

// Mobile only: begin scrolling when the
// typing cursor reaches halfway down the
// visible screen, including when the
// keyboard is open.

function followMobileCursor() {
    if (!isMobile || isSealed || isReadOnly) return;

    const viewport = window.visualViewport;

    const visibleHeight = viewport
        ? viewport.height
        : window.innerHeight;

    const visibleTop = viewport
        ? viewport.offsetTop
        : 0;

    const halfwayPoint =
        visibleTop + visibleHeight * 0.5;

    const cursorScreenY =
        cursorY + LETTER_HEIGHT / 2 - window.scrollY;

    if (cursorScreenY > halfwayPoint) {
        const targetScroll =
            cursorY + LETTER_HEIGHT / 2 - halfwayPoint;

        window.scrollTo({
            top: Math.max(0, targetScroll),
            behavior: "auto"
        });
    }
}

function followCursor() {
    if (isMobile) {
        followMobileCursor();
    } else {
        followDesktopCursor();
    }
}

// ==========================================
// CANVAS SIZE
// ==========================================

function updateCanvasSize() {
    const requiredHeight = Math.max(
        cursorY + LINE_HEIGHT +
            (isMobile ? window.innerHeight : 150),
        window.innerHeight
    );

    if (!isMobile) {
        canvas.setAttribute("width", "100%");
        canvas.setAttribute("height", requiredHeight);

        canvas.style.width = "100%";
        canvas.style.height = requiredHeight + "px";
        return;
    }

    const mobileWidth = getMobileViewportWidth();

    canvas.setAttribute("width", mobileWidth);
    canvas.setAttribute("height", requiredHeight);

    canvas.style.width = mobileWidth + "px";
    canvas.style.height = requiredHeight + "px";
    canvas.style.maxWidth = "100%";
}

// ==========================================
// CREATE GLYPH
// ==========================================

function createGlyphElement(
    character,
    x,
    y,
    stretch,
    glyphHeight = LETTER_HEIGHT
) {
    const sourceSVG = glyphs[character];

    if (!sourceSVG) return null;

    const viewBox = sourceSVG.viewBox.baseVal;

    const originalWidth = viewBox.width;
    const originalHeight = viewBox.height;

    const scaleY = glyphHeight / originalHeight;
    const scaleX = scaleY * stretch;

    const newWidth =
        originalWidth * scaleY * stretch;

    const group = document.createElementNS(SVG_NS, "g");

    Array.from(sourceSVG.children).forEach(function (child) {
        const copy = document.importNode(child, true);

        preserveStrokeWidth(copy);
        group.appendChild(copy);
    });

    group.setAttribute(
        "transform",
        `
        translate(${x} ${y})
        scale(${scaleX} ${scaleY})
        translate(${-viewBox.x} ${-viewBox.y})
        `
    );

    canvas.appendChild(group);

    return {
        element: group,
        width: newWidth
    };
}

// ==========================================
// DRAW GLYPH
// ==========================================

function drawGlyph(character, interval) {
    const sourceSVG = glyphs[character];

    if (!sourceSVG) return;

    const viewBox = sourceSVG.viewBox.baseVal;

    let stretch = getStretch(interval);

    const scaleY = LETTER_HEIGHT / viewBox.height;
    const baseWidth = viewBox.width * scaleY;

    // Mobile letters fit within the phone width.
    if (isMobile) {
        const maximumWidth = Math.max(
            1,
            getWritingWidth() -
            LEFT_MARGIN -
            RIGHT_MARGIN -
            CURSOR_GAP -
            LETTER_GAP
        );

        stretch = Math.min(
            stretch,
            maximumWidth / baseWidth
        );
    }

    const newWidth = baseWidth * stretch;

    const availableWidth =
        getWritingWidth() - RIGHT_MARGIN;

    if (
        cursorX !== LEFT_MARGIN &&
        cursorX + newWidth + CURSOR_GAP > availableWidth
    ) {
        cursorX = LEFT_MARGIN;
        cursorY += LINE_HEIGHT;
    }

    const startX = cursorX;
    const startY = cursorY;

    const result = createGlyphElement(
        character,
        startX,
        startY,
        stretch,
        LETTER_HEIGHT
    );

    if (!result) return;

    if (cursorGroup) {
        canvas.appendChild(cursorGroup);
    }

    history.push({
        type: "glyph",
        character: character,
        element: result.element,

        x: startX,
        y: startY,

        width: result.width,
        height: LETTER_HEIGHT,
        stretch: stretch,

        struck: false,
        strikeElement: null
    });

    strikeIndex = history.length - 1;

    cursorX += result.width + LETTER_GAP;

    resetCursor();
    updateCanvasSize();

    requestAnimationFrame(followCursor);
}

// ==========================================
// RETURN
// ==========================================

function handleReturn() {
    if (isSealed || isReadOnly) return;

    history.push({
        type: "return",
        x: cursorX,
        y: cursorY
    });

    cursorX = LEFT_MARGIN;
    cursorY += LINE_HEIGHT;

    lastKeyTime = null;
    strikeIndex = history.length - 1;

    resetCursor();
    updateCanvasSize();

    requestAnimationFrame(followCursor);
}

// ==========================================
// SPACE
// ==========================================

function handleSpace() {
    if (isSealed || isReadOnly) return;

    history.push({
        type: "space",
        x: cursorX,
        y: cursorY
    });

    cursorX += SPACE_WIDTH;

    if (cursorX > getWritingWidth() - RIGHT_MARGIN) {
        cursorX = LEFT_MARGIN;
        cursorY += LINE_HEIGHT;
    }

    strikeIndex = history.length - 1;

    resetCursor();
    updateCanvasSize();

    requestAnimationFrame(followCursor);
}

// ==========================================
// PROCESS CHARACTER
// ==========================================

function processTypedCharacter(character) {
    if (isSealed || isReadOnly) return;

    if (/^[a-zA-Z]$/.test(character)) {
        character = character.toUpperCase();
    }

    if (!glyphs[character]) {
        console.warn("Unsupported character:", character);
        return;
    }

    const now = performance.now();

    let interval = 200;

    if (lastKeyTime !== null) {
        interval = now - lastKeyTime;
    }

    lastKeyTime = now;

    drawGlyph(character, interval);
}

// ==========================================
// STRIKE HELPERS
// ==========================================

function removeStrikeGroups(items) {
    const removedGroups = new Set();

    items.forEach(function (item) {
        if (
            item.strikeElement &&
            !removedGroups.has(item.strikeElement)
        ) {
            removedGroups.add(item.strikeElement);
            item.strikeElement.remove();
        }

        item.strikeElement = null;
    });
}

function drawContinuousStrike(items) {
    if (!strikeSource || items.length === 0) return;

    let startX = Infinity;
    let endX = -Infinity;

    items.forEach(function (item) {
        startX = Math.min(startX, item.x);
        endX = Math.max(endX, item.x + item.width);
    });

    const totalWidth = endX - startX;
    const lineY = items[0].y;

    removeStrikeGroups(items);

    const strikeViewBox = strikeSource.viewBox.baseVal;

    const glyphHeight = items[0].height || 80;

    const scaleX = totalWidth / strikeViewBox.width;
    const scaleY = glyphHeight / strikeViewBox.height;

    const strikeGroup = document.createElementNS(SVG_NS, "g");

    Array.from(strikeSource.children).forEach(function (child) {
        const copy = document.importNode(child, true);

        preserveStrokeWidth(copy);
        strikeGroup.appendChild(copy);
    });

    strikeGroup.setAttribute(
        "transform",
        `
        translate(${startX} ${lineY})
        scale(${scaleX} ${scaleY})
        translate(${-strikeViewBox.x} ${-strikeViewBox.y})
        `
    );

    canvas.appendChild(strikeGroup);

    items.forEach(function (item) {
        item.strikeElement = strikeGroup;
    });

    if (cursorGroup && !isSealed) {
        canvas.appendChild(cursorGroup);
    }
}

function redrawAllStrikes() {
    const struckItems = history.filter(function (item) {
        return item.type === "glyph" && item.struck;
    });

    const lines = new Map();

    struckItems.forEach(function (item) {
        if (!lines.has(item.y)) {
            lines.set(item.y, []);
        }

        lines.get(item.y).push(item);
    });

    lines.forEach(function (lineItems) {
        lineItems.sort((a, b) => a.x - b.x);

        let group = [];

        lineItems.forEach(function (item) {
            if (group.length === 0) {
                group.push(item);
                return;
            }

            const previous = group[group.length - 1];

            const gap =
                item.x - (previous.x + previous.width);

            if (gap <= LETTER_GAP + 2) {
                group.push(item);
            } else {
                drawContinuousStrike(group);
                group = [item];
            }
        });

        if (group.length > 0) {
            drawContinuousStrike(group);
        }
    });
}

// ==========================================
// BACKSPACE
// ==========================================

function strikePreviousCharacter() {
    if (isSealed || isReadOnly) return;

    while (strikeIndex >= 0) {
        const item = history[strikeIndex];

        strikeIndex--;

        if (!item || item.type !== "glyph") continue;
        if (item.struck) continue;

        item.struck = true;

        const sameLineStruck = history.filter(function (historyItem) {
            return (
                historyItem.type === "glyph" &&
                historyItem.struck &&
                historyItem.y === item.y
            );
        });

        sameLineStruck.sort((a, b) => a.x - b.x);

        const connected = [item];

        let changed = true;

        while (changed) {
            changed = false;

            sameLineStruck.forEach(function (candidate) {
                if (connected.includes(candidate)) return;

                const candidateStart = candidate.x;
                const candidateEnd =
                    candidate.x + candidate.width;

                const connectedStart = Math.min(
                    ...connected.map(glyph => glyph.x)
                );

                const connectedEnd = Math.max(
                    ...connected.map(glyph => glyph.x + glyph.width)
                );

                const tolerance = LETTER_GAP + 2;

                if (
                    candidateEnd >= connectedStart - tolerance &&
                    candidateStart <= connectedEnd + tolerance
                ) {
                    connected.push(candidate);
                    changed = true;
                }
            });
        }

        drawContinuousStrike(connected);
        break;
    }

    resetCursor();
    updateCanvasSize();

    requestAnimationFrame(followCursor);
}

// ==========================================
// LOAD RECEIVED LETTER
// ==========================================

function loadSavedLetter(data) {
    history = [];

    let maximumX = window.innerWidth;
    let maximumY = window.innerHeight;

    data.forEach(function (item) {
        if (item.type === "glyph") {
            // Letters saved before the mobile update
            // were created at 80px.
            const savedHeight = item.height || 80;

            const result = createGlyphElement(
                item.character,
                item.x,
                item.y,
                item.stretch,
                savedHeight
            );

            if (!result) return;

            history.push({
                type: "glyph",
                character: item.character,
                element: result.element,

                x: item.x,
                y: item.y,

                width: item.width,
                height: savedHeight,
                stretch: item.stretch,

                struck: item.struck,
                strikeElement: null
            });

            maximumX = Math.max(
                maximumX,
                item.x + item.width + 100
            );

            maximumY = Math.max(
                maximumY,
                item.y + savedHeight + 150
            );

        } else {
            history.push({
                type: item.type,
                x: item.x,
                y: item.y
            });

            maximumX = Math.max(maximumX, item.x + 100);
            maximumY = Math.max(maximumY, item.y + 150);
        }
    });

    redrawAllStrikes();

    // Preserve sender's original layout.
    canvas.setAttribute("width", maximumX);
    canvas.setAttribute("height", maximumY);

    canvas.style.width = maximumX + "px";
    canvas.style.height = maximumY + "px";
    canvas.style.maxWidth = "none";

    document.documentElement.style.overflowX = "auto";
    document.documentElement.style.overflowY = "auto";

    document.body.style.overflowX = "auto";
    document.body.style.overflowY = "auto";

    document.body.style.width = "max-content";
    document.body.style.maxWidth = "none";
    document.body.style.minWidth = "100%";

    document.body.style.touchAction = "pan-x pan-y";
    canvas.style.touchAction = "pan-x pan-y";

    if (interfaceButton) {
        interfaceButton.style.display = "none";
    }

    if (backButton) {
        backButton.style.display = "none";
    }

    if (cursorGroup) {
        cursorGroup.style.display = "none";
    }

    if (mobileInput) {
        mobileInput.blur();
        mobileInput.style.display = "none";
    }
}

// ==========================================
// DESKTOP KEYBOARD
// ==========================================

window.addEventListener("keydown", function (event) {
    if (
        mobileInput &&
        document.activeElement === mobileInput
    ) {
        return;
    }

    if (isSealed || isReadOnly) return;

    if (event.key === "Enter") {
        event.preventDefault();
        handleReturn();
        return;
    }

    if (event.key === "Backspace") {
        event.preventDefault();
        strikePreviousCharacter();
        return;
    }

    if (
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
    ) {
        return;
    }

    if (event.key.length !== 1) return;

    event.preventDefault();

    if (event.key === " ") {
        handleSpace();
        return;
    }

    processTypedCharacter(event.key);
});

// ==========================================
// RESIZE
// ==========================================

window.addEventListener("resize", function () {
    if (!isReadOnly) {
        updateCanvasSize();
    }

    if (isMobile) {
        checkMobileKeyboardViewport();
        followMobileCursor();
    }
});

// ==========================================
// LOAD EVERYTHING
// ==========================================

async function loadEverything() {
    setupMobilePage();

    if (isMobile) {
        createMobileInput();
    }

    const characters = Object.keys(glyphFiles);

    await Promise.all(
        characters.map(async function (character) {
            glyphs[character] = await loadSVG(
                glyphFiles[character]
            );
        })
    );

    cursorSource = await loadSVG(
        "./glyphs/cursor.svg"
    );

    strikeSource = await loadSVG(
        "./glyphs/strike-through.svg"
    );

    createInterfaceButton();
    createBackButton();

    const heartID = getHeartIDFromURL();

    if (heartID) {
        isReadOnly = true;
        isSealed = true;

        await loadHeartFromSupabase(heartID);
        return;
    }

    if (cursorSource) {
        createCursor();
    }

    setButtonState("seal", false);

    updateCanvasSize();
    updateMobileButtons();

    console.log("Bared Heart loaded.");
}

// ==========================================
// START
// ==========================================

loadEverything();