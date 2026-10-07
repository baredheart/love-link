// ==========================================
// BARED HEART
// DESKTOP + MOBILE
// ==========================================

const canvas = document.getElementById("canvas");
const SVG_NS = "http://www.w3.org/2000/svg";


// ==========================================
// DEVICE
// ==========================================

const isMobile =
    window.matchMedia("(pointer: coarse)").matches ||
    "ontouchstart" in window;


// ==========================================
// SUPABASE
// ==========================================

const SUPABASE_URL =
    "https://ibsdnsqavmrugzobgitr.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_KTmiZGedhB2yst5FvPhOJQ_E97k4Jno";

const supabaseClient =
    window.supabase.createClient(
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

const LEFT_MARGIN = 30;
const RIGHT_MARGIN = 30;
const TOP_MARGIN = 40;

const LETTER_HEIGHT = 80;
const LINE_HEIGHT = 88;

const LETTER_GAP = 3;
const SPACE_WIDTH = 35;


// ==========================================
// MOBILE SETTINGS
// ==========================================

// Only used on touch/mobile devices.
// Desktop still uses the browser width exactly
// as it did previously.

const MOBILE_CANVAS_WIDTH = 900;


// ==========================================
// WIDTH BEHAVIOUR
// ==========================================

const MIN_TIME = 50;
const MIN_STRETCH = 0.12;

const MAX_TIME = 1500;
const MAX_STRETCH = 10;


// ==========================================
// CURSOR
// ==========================================

const CURSOR_GAP = 12;
const CURSOR_SCALE = 1;

const BLINK_FAST = 320;
const BLINK_SLOW = 1100;

const SLOWDOWN_START = 1200;
const SLOWDOWN_END = 4500;


// ==========================================
// BUTTONS
// ==========================================

const BUTTON_RIGHT = 30;
const BUTTON_LEFT = 30;
const BUTTON_BOTTOM = 30;

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

    const response = await fetch(file);

    if (!response.ok) {

        console.error(
            "Could not load:",
            file
        );

        return null;
    }

    const svgText =
        await response.text();

    const parser =
        new DOMParser();

    const svgDocument =
        parser.parseFromString(
            svgText,
            "image/svg+xml"
        );

    return svgDocument.documentElement;
}


// ==========================================
// INITIALISE
// ==========================================

async function loadEverything() {

    // Only alter page scrolling on mobile.
    if (isMobile) {

        setupMobilePage();
        createMobileInput();
    }

    const characters =
        Object.keys(glyphFiles);

    await Promise.all(

        characters.map(

            async function (character) {

                glyphs[character] =
                    await loadSVG(
                        glyphFiles[character]
                    );
            }

        )
    );

    cursorSource =
        await loadSVG(
            "./glyphs/cursor.svg"
        );

    strikeSource =
        await loadSVG(
            "./glyphs/strike-through.svg"
        );

    createInterfaceButton();
    createBackButton();

    const heartID =
        getHeartIDFromURL();

    if (heartID) {

        isReadOnly = true;
        isSealed = true;

        await loadHeartFromSupabase(
            heartID
        );

        return;
    }

    if (cursorSource) {

        createCursor();
    }

    setButtonState(
        "seal",
        false
    );

    updateCanvasSize();

    console.log(
        "Bared Heart loaded."
    );
}


loadEverything();


// ==========================================
// MOBILE PAGE SETUP
// ==========================================

function setupMobilePage() {

    document.documentElement.style.overflowX =
        "auto";

    document.documentElement.style.overflowY =
        "auto";

    document.body.style.overflowX =
        "auto";

    document.body.style.overflowY =
        "auto";

    document.body.style.touchAction =
        "pan-x pan-y";

    canvas.style.maxWidth =
        "none";

    canvas.style.touchAction =
        "pan-x pan-y";
}


// ==========================================
// MOBILE INPUT
// ==========================================

let mobileInput = null;


function createMobileInput() {

    mobileInput =
        document.createElement(
            "textarea"
        );

    mobileInput.setAttribute(
        "autocomplete",
        "off"
    );

    mobileInput.setAttribute(
        "autocorrect",
        "off"
    );

    mobileInput.setAttribute(
        "autocapitalize",
        "characters"
    );

    mobileInput.setAttribute(
        "spellcheck",
        "false"
    );

    mobileInput.setAttribute(
        "inputmode",
        "text"
    );


    // Invisible, but still focusable by iOS.

    mobileInput.style.position =
        "fixed";

    mobileInput.style.left =
        "0";

    mobileInput.style.bottom =
        "0";

    mobileInput.style.width =
        "1px";

    mobileInput.style.height =
        "1px";

    mobileInput.style.opacity =
        "0";

    mobileInput.style.border =
        "0";

    mobileInput.style.padding =
        "0";

    mobileInput.style.margin =
        "0";

    mobileInput.style.fontSize =
        "16px";

    mobileInput.style.pointerEvents =
        "none";

    mobileInput.style.zIndex =
        "-1";

    document.body.appendChild(
        mobileInput
    );


    // ======================================
    // MOBILE CHARACTER INPUT
    // ======================================

    mobileInput.addEventListener(

        "input",

        function () {

            if (
                isSealed ||
                isReadOnly
            ) {

                mobileInput.value = "";
                return;
            }

            const value =
                mobileInput.value;

            if (!value) {
                return;
            }

            const inputCharacters =
                Array.from(value);

            inputCharacters.forEach(

                function (character) {

                    if (
                        character === "\n"
                    ) {

                        handleReturn();
                        return;
                    }

                    if (
                        character === " "
                    ) {

                        handleSpace();
                        return;
                    }

                    processTypedCharacter(
                        character
                    );
                }
            );

            mobileInput.value = "";
        }
    );


    // ======================================
    // MOBILE BACKSPACE
    // ======================================

    mobileInput.addEventListener(

        "keydown",

        function (event) {

            if (
                isSealed ||
                isReadOnly
            ) {

                return;
            }

            if (
                event.key ===
                "Backspace"
            ) {

                event.preventDefault();

                strikePreviousCharacter();

                mobileInput.value = "";
            }
        }
    );


    // ======================================
    // TAP PAGE → KEYBOARD
    // ======================================

    canvas.addEventListener(

        "click",

        function () {

            if (
                isSealed ||
                isReadOnly
            ) {

                return;
            }

            focusMobileInput();
        }
    );
}


// ==========================================
// FOCUS MOBILE INPUT
// ==========================================

function focusMobileInput() {

    if (
        !mobileInput ||
        isSealed ||
        isReadOnly
    ) {

        return;
    }

    mobileInput.focus({
        preventScroll: true
    });
}


// ==========================================
// WRITING WIDTH
// ==========================================

function getWritingWidth() {

    if (isMobile) {

        return Math.max(
            MOBILE_CANVAS_WIDTH,
            window.innerWidth
        );
    }

    // IMPORTANT:
    // Desktop behaves exactly as before.

    return window.innerWidth;
}


// ==========================================
// HEART ID
// ==========================================

function generateHeartID() {

    const characters =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let id = "";

    for (
        let i = 0;
        i < 5;
        i++
    ) {

        const randomIndex =
            Math.floor(
                Math.random() *
                characters.length
            );

        id +=
            characters[randomIndex];
    }

    return id;
}


function getHeartIDFromURL() {

    if (!window.location.hash) {

        return null;
    }

    const id =
        window.location.hash
            .substring(1)
            .trim()
            .toUpperCase();

    if (
        !/^[A-Z2-9]{5}$/.test(id)
    ) {

        return null;
    }

    return id;
}


// ==========================================
// SUPABASE SAVE
// ==========================================

async function saveHeartToSupabase(
    letterData
) {

    for (
        let attempt = 0;
        attempt < 10;
        attempt++
    ) {

        const heartID =
            generateHeartID();

        const { error } =
            await supabaseClient
                .from("hearts")
                .insert({

                    id:
                        heartID,

                    letter_data:
                        letterData
                });

        if (!error) {

            return heartID;
        }

        if (
            error.code ===
            "23505"
        ) {

            continue;
        }

        console.error(
            "Could not save heart:",
            error
        );

        throw error;
    }

    throw new Error(
        "Could not create unique heart ID."
    );
}


// ==========================================
// SUPABASE LOAD
// ==========================================

async function loadHeartFromSupabase(
    heartID
) {

    const { data, error } =
        await supabaseClient
            .from("hearts")
            .select("letter_data")
            .eq(
                "id",
                heartID
            )
            .maybeSingle();

    if (error) {

        console.error(
            "Could not load heart:",
            error
        );

        return;
    }

    if (
        !data ||
        !data.letter_data
    ) {

        console.error(
            "Heart not found:",
            heartID
        );

        return;
    }

    loadSavedLetter(
        data.letter_data
    );
}


// ==========================================
// TIMING → WIDTH
// ==========================================

function getStretch(interval) {

    const time =
        Math.min(
            Math.max(
                interval,
                MIN_TIME
            ),
            MAX_TIME
        );

    let amount =
        (
            time -
            MIN_TIME
        )
        /
        (
            MAX_TIME -
            MIN_TIME
        );

    amount =
        Math.pow(
            amount,
            1.1
        );

    return (
        MIN_STRETCH +
        amount *
        (
            MAX_STRETCH -
            MIN_STRETCH
        )
    );
}


// ==========================================
// PRESERVE STROKE
// ==========================================

function preserveStrokeWidth(element) {

    const selectors =
        "path, line, polyline, polygon, circle, ellipse, rect";

    if (
        element.matches &&
        element.matches(selectors)
    ) {

        element.setAttribute(
            "vector-effect",
            "non-scaling-stroke"
        );
    }

    if (element.querySelectorAll) {

        element
            .querySelectorAll(selectors)
            .forEach(

                function (shape) {

                    shape.setAttribute(
                        "vector-effect",
                        "non-scaling-stroke"
                    );
                }

            );
    }
}


// ==========================================
// MAIN BUTTON
// ==========================================

let interfaceButton = null;


function createInterfaceButton() {

    interfaceButton =
        document.createElement(
            "img"
        );

    interfaceButton.id =
        "heart-button";

    interfaceButton.style.position =
        "fixed";

    interfaceButton.style.right =
        BUTTON_RIGHT + "px";

    interfaceButton.style.bottom =
        BUTTON_BOTTOM + "px";

    interfaceButton.style.width =
        BUTTON_WIDTH + "px";

    interfaceButton.style.height =
        "auto";

    interfaceButton.style.zIndex =
        "9999";

    interfaceButton.style.cursor =
        "pointer";

    interfaceButton.style.opacity =
        "1";

    interfaceButton.style.transition =
        `opacity ${BUTTON_TRANSITION}ms ease-in-out`;

    interfaceButton.style.userSelect =
        "none";

    interfaceButton.style.webkitUserSelect =
        "none";

    interfaceButton.style.webkitTouchCallout =
        "none";

    interfaceButton.draggable =
        false;


    interfaceButton.addEventListener(

        "mouseenter",

        function () {

            if (!isCollected) {

                interfaceButton.style.opacity =
                    "0.7";
            }
        }
    );


    interfaceButton.addEventListener(

        "mouseleave",

        function () {

            interfaceButton.style.opacity =
                "1";
        }
    );


    interfaceButton.addEventListener(

        "click",

        handleButtonClick
    );


    document.body.appendChild(
        interfaceButton
    );
}


// ==========================================
// BACK BUTTON
// ==========================================

let backButton = null;


function createBackButton() {

    backButton =
        document.createElement(
            "img"
        );

    backButton.id =
        "back-button";

    backButton.src =
        "./glyphs/back-button.svg";

    backButton.style.position =
        "fixed";

    backButton.style.left =
        BUTTON_LEFT + "px";

    backButton.style.bottom =
        BUTTON_BOTTOM + "px";

    backButton.style.width =
        BUTTON_WIDTH + "px";

    backButton.style.height =
        "auto";

    backButton.style.zIndex =
        "9999";

    backButton.style.cursor =
        "pointer";

    backButton.style.opacity =
        "0";

    backButton.style.visibility =
        "hidden";

    backButton.style.pointerEvents =
        "none";

    backButton.style.transition =
        `opacity ${BUTTON_TRANSITION}ms ease-in-out`;

    backButton.style.userSelect =
        "none";

    backButton.style.webkitUserSelect =
        "none";

    backButton.draggable =
        false;


    backButton.addEventListener(

        "mouseenter",

        function () {

            backButton.style.opacity =
                "0.7";
        }
    );


    backButton.addEventListener(

        "mouseleave",

        function () {

            backButton.style.opacity =
                "1";
        }
    );


    backButton.addEventListener(

        "click",

        function () {

            window.location.href =
                FRAMER_URL;
        }
    );


    document.body.appendChild(
        backButton
    );
}


// ==========================================
// SHOW BACK
// ==========================================

function showBackButton() {

    if (!backButton) {
        return;
    }

    backButton.style.visibility =
        "visible";

    backButton.style.pointerEvents =
        "auto";

    backButton.style.opacity =
        "0";

    requestAnimationFrame(

        function () {

            requestAnimationFrame(

                function () {

                    backButton.style.opacity =
                        "1";
                }
            );
        }
    );
}


// ==========================================
// BUTTON STATE
// ==========================================

function setButtonState(
    state,
    animate = true
) {

    if (!interfaceButton) {
        return;
    }

    let newSource = "";

    if (state === "seal") {

        newSource =
            "./glyphs/seal-button.svg";

        interfaceButton.style.cursor =
            "pointer";
    }

    if (state === "collect") {

        newSource =
            "./glyphs/collect-button.svg";

        interfaceButton.style.cursor =
            "pointer";
    }

    if (state === "collected") {

        newSource =
            "./glyphs/collected-button.svg";

        interfaceButton.style.cursor =
            "default";
    }

    if (!newSource) {
        return;
    }

    if (!animate) {

        interfaceButton.src =
            newSource;

        interfaceButton.style.opacity =
            "1";

        interfaceButton.style.pointerEvents =
            state === "collected"
                ? "none"
                : "auto";

        return;
    }

    interfaceButton.style.pointerEvents =
        "none";

    interfaceButton.style.opacity =
        "0";

    setTimeout(

        function () {

            interfaceButton.src =
                newSource;

            requestAnimationFrame(

                function () {

                    interfaceButton.style.opacity =
                        "1";

                    if (
                        state !==
                        "collected"
                    ) {

                        interfaceButton.style.pointerEvents =
                            "auto";
                    }
                }
            );

            if (
                state ===
                "collected"
            ) {

                showBackButton();
            }

        },

        BUTTON_TRANSITION
    );
}


// ==========================================
// BUTTON CLICK
// ==========================================

async function handleButtonClick() {

    if (
        isReadOnly ||
        isCollected
    ) {

        return;
    }

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

        cursorGroup.style.display =
            "none";
    }

    if (cursorAnimationFrame) {

        cancelAnimationFrame(
            cursorAnimationFrame
        );

        cursorAnimationFrame = null;
    }

    setButtonState(
        "collect"
    );
}


// ==========================================
// COLLECT
// ==========================================

async function collectLetter() {

    if (interfaceButton) {

        interfaceButton.style.pointerEvents =
            "none";
    }

    try {

        const letterData =
            createLetterData();

        const heartID =
            await saveHeartToSupabase(
                letterData
            );

        const shareURL =
            SITE_URL +
            "#" +
            heartID;

        try {

            await navigator.clipboard.writeText(
                shareURL
            );

        } catch (error) {

            fallbackCopy(
                shareURL
            );
        }

        isCollected = true;

        setButtonState(
            "collected"
        );

    } catch (error) {

        console.error(
            "Heart could not be collected:",
            error
        );

        if (interfaceButton) {

            interfaceButton.style.pointerEvents =
                "auto";
        }
    }
}


// ==========================================
// FALLBACK COPY
// ==========================================

function fallbackCopy(text) {

    const textArea =
        document.createElement(
            "textarea"
        );

    textArea.value = text;

    textArea.style.position =
        "fixed";

    textArea.style.opacity =
        "0";

    document.body.appendChild(
        textArea
    );

    textArea.focus();
    textArea.select();

    try {

        document.execCommand(
            "copy"
        );

    } catch (error) {

        console.error(
            "Copy failed:",
            error
        );
    }

    textArea.remove();
}


// ==========================================
// SAVE LETTER DATA
// ==========================================

function createLetterData() {

    return history.map(

        function (item) {

            if (
                item.type ===
                "glyph"
            ) {

                return {

                    type:
                        "glyph",

                    character:
                        item.character,

                    x:
                        Math.round(
                            item.x * 100
                        ) / 100,

                    y:
                        Math.round(
                            item.y * 100
                        ) / 100,

                    width:
                        Math.round(
                            item.width * 100
                        ) / 100,

                    stretch:
                        Math.round(
                            item.stretch * 10000
                        ) / 10000,

                    struck:
                        item.struck
                };
            }

            return {

                type:
                    item.type,

                x:
                    Math.round(
                        item.x * 100
                    ) / 100,

                y:
                    Math.round(
                        item.y * 100
                    ) / 100
            };
        }
    );
}


// ==========================================
// CURSOR STATE
// ==========================================

let cursorGroup = null;

let cursorPauseStart =
    performance.now();

let lastBlinkTime =
    performance.now();

let cursorVisible = true;

let cursorAnimationFrame = null;


// ==========================================
// CREATE CURSOR
// ==========================================

function createCursor() {

    if (
        !cursorSource ||
        isSealed ||
        isReadOnly
    ) {

        return;
    }

    cursorGroup =
        document.createElementNS(
            SVG_NS,
            "g"
        );

    Array.from(
        cursorSource.children
    ).forEach(

        function (child) {

            const copy =
                document.importNode(
                    child,
                    true
                );

            preserveStrokeWidth(
                copy
            );

            cursorGroup.appendChild(
                copy
            );
        }
    );

    canvas.appendChild(
        cursorGroup
    );

    cursorPauseStart =
        performance.now();

    lastBlinkTime =
        performance.now();

    cursorVisible = true;

    animateCursor();
}


// ==========================================
// ANIMATE CURSOR
// ==========================================

function animateCursor() {

    if (
        !cursorGroup ||
        !cursorSource ||
        isSealed ||
        isReadOnly
    ) {

        return;
    }

    const now =
        performance.now();

    const pausedFor =
        now -
        cursorPauseStart;

    let blinkSpeed =
        BLINK_FAST;

    if (
        pausedFor >
        SLOWDOWN_START
    ) {

        let progress =
            (
                pausedFor -
                SLOWDOWN_START
            )
            /
            (
                SLOWDOWN_END -
                SLOWDOWN_START
            );

        progress =
            Math.min(
                Math.max(
                    progress,
                    0
                ),
                1
            );

        progress =
            progress *
            progress *
            (
                3 -
                2 * progress
            );

        blinkSpeed =
            BLINK_FAST +
            (
                BLINK_SLOW -
                BLINK_FAST
            ) *
            progress;
    }

    if (
        now -
        lastBlinkTime >=
        blinkSpeed
    ) {

        cursorVisible =
            !cursorVisible;

        lastBlinkTime = now;
    }

    cursorGroup.style.opacity =
        cursorVisible
            ? "1"
            : "0";

    const viewBox =
        cursorSource.viewBox.baseVal;

    const baseScale =
        LETTER_HEIGHT /
        viewBox.height;

    const finalScale =
        baseScale *
        CURSOR_SCALE;

    const centreX =
        viewBox.x +
        viewBox.width / 2;

    const centreY =
        viewBox.y +
        viewBox.height / 2;

    const anchorX =
        cursorX +
        CURSOR_GAP;

    const anchorY =
        cursorY +
        LETTER_HEIGHT / 2;

    cursorGroup.setAttribute(

        "transform",

        `
        translate(${anchorX} ${anchorY})
        scale(${finalScale})
        translate(${-centreX} ${-centreY})
        `
    );

    canvas.appendChild(
        cursorGroup
    );

    cursorAnimationFrame =
        requestAnimationFrame(
            animateCursor
        );
}


// ==========================================
// RESET CURSOR
// ==========================================

function resetCursor() {

    if (
        isSealed ||
        isReadOnly
    ) {

        return;
    }

    cursorPauseStart =
        performance.now();

    lastBlinkTime =
        performance.now();

    cursorVisible = true;

    if (cursorGroup) {

        cursorGroup.style.opacity =
            "1";
    }
}


// ==========================================
// DESKTOP FOLLOW
// ORIGINAL VERTICAL BEHAVIOUR
// ==========================================

let lastScrollLine = -1;


function followDesktopCursor() {

    if (
        isMobile ||
        isSealed ||
        isReadOnly
    ) {

        return;
    }

    const currentLine =
        Math.round(
            (
                cursorY -
                TOP_MARGIN
            )
            /
            LINE_HEIGHT
        );

    const cursorOnScreen =
        cursorY -
        window.scrollY;

    const safeBottom =
        window.innerHeight *
        0.75;

    if (
        cursorOnScreen >
            safeBottom &&
        currentLine !==
            lastScrollLine
    ) {

        lastScrollLine =
            currentLine;

        window.scrollTo({

            top:
                Math.max(
                    0,
                    cursorY -
                    window.innerHeight *
                    0.55
                ),

            behavior:
                "smooth"
        });
    }
}


// ==========================================
// MOBILE FOLLOW
// HORIZONTAL + VERTICAL
// ==========================================

function followMobileCursor() {

    if (
        !isMobile ||
        isSealed ||
        isReadOnly
    ) {

        return;
    }

    const screenX =
        cursorX -
        window.scrollX;

    const screenY =
        cursorY -
        window.scrollY;


    // Keep the cursor around the middle-right
    // of the phone while typing.

    const safeRight =
        window.innerWidth *
        0.72;

    const safeLeft =
        window.innerWidth *
        0.15;

    const safeBottom =
        window.innerHeight *
        0.58;

    const safeTop =
        window.innerHeight *
        0.15;


    let targetX =
        window.scrollX;

    let targetY =
        window.scrollY;


    if (
        screenX >
        safeRight
    ) {

        targetX =
            cursorX -
            window.innerWidth *
            0.55;
    }


    if (
        screenX <
        safeLeft
    ) {

        targetX =
            cursorX -
            window.innerWidth *
            0.15;
    }


    if (
        screenY >
        safeBottom
    ) {

        targetY =
            cursorY -
            window.innerHeight *
            0.42;
    }


    if (
        screenY <
        safeTop
    ) {

        targetY =
            cursorY -
            window.innerHeight *
            0.15;
    }


    targetX =
        Math.max(
            0,
            targetX
        );

    targetY =
        Math.max(
            0,
            targetY
        );


    window.scrollTo({

        left:
            targetX,

        top:
            targetY,

        behavior:
            "smooth"
    });
}


// ==========================================
// FOLLOW CORRECT DEVICE
// ==========================================

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

    const requiredHeight =
        Math.max(
            cursorY +
                LINE_HEIGHT +
                150,
            window.innerHeight
        );


    // ======================================
    // DESKTOP
    // ======================================

    if (!isMobile) {

        // Preserve original desktop width.

        canvas.setAttribute(
            "width",
            "100%"
        );

        canvas.setAttribute(
            "height",
            requiredHeight
        );

        canvas.style.width =
            "100%";

        canvas.style.height =
            requiredHeight + "px";

        return;
    }


    // ======================================
    // MOBILE
    // ======================================

    let requiredWidth =
        Math.max(
            MOBILE_CANVAS_WIDTH,
            window.innerWidth
        );


    history.forEach(

        function (item) {

            if (
                item.type ===
                "glyph"
            ) {

                requiredWidth =
                    Math.max(
                        requiredWidth,
                        item.x +
                        item.width +
                        RIGHT_MARGIN +
                        100
                    );
            }
        }
    );


    canvas.setAttribute(
        "width",
        requiredWidth
    );

    canvas.setAttribute(
        "height",
        requiredHeight
    );

    canvas.style.width =
        requiredWidth + "px";

    canvas.style.height =
        requiredHeight + "px";
}


function updateCanvasHeight() {

    updateCanvasSize();
}


// ==========================================
// CREATE GLYPH ELEMENT
// ==========================================

function createGlyphElement(
    character,
    x,
    y,
    stretch
) {

    const sourceSVG =
        glyphs[character];

    if (!sourceSVG) {

        return null;
    }

    const viewBox =
        sourceSVG.viewBox.baseVal;

    const originalWidth =
        viewBox.width;

    const originalHeight =
        viewBox.height;

    const scaleY =
        LETTER_HEIGHT /
        originalHeight;

    const scaleX =
        scaleY *
        stretch;

    const newWidth =
        originalWidth *
        scaleY *
        stretch;

    const group =
        document.createElementNS(
            SVG_NS,
            "g"
        );

    Array.from(
        sourceSVG.children
    ).forEach(

        function (child) {

            const copy =
                document.importNode(
                    child,
                    true
                );

            preserveStrokeWidth(
                copy
            );

            group.appendChild(
                copy
            );
        }
    );

    group.setAttribute(

        "transform",

        `
        translate(${x} ${y})
        scale(${scaleX} ${scaleY})
        translate(${-viewBox.x} ${-viewBox.y})
        `
    );

    canvas.appendChild(
        group
    );

    return {

        element:
            group,

        width:
            newWidth
    };
}


// ==========================================
// DRAW GLYPH
// ==========================================

function drawGlyph(
    character,
    interval
) {

    const sourceSVG =
        glyphs[character];

    if (!sourceSVG) {
        return;
    }

    const viewBox =
        sourceSVG.viewBox.baseVal;

    const originalWidth =
        viewBox.width;

    const originalHeight =
        viewBox.height;

    const stretch =
        getStretch(
            interval
        );

    const scaleY =
        LETTER_HEIGHT /
        originalHeight;

    const baseWidth =
        originalWidth *
        scaleY;

    const newWidth =
        baseWidth *
        stretch;

    const availableWidth =
        getWritingWidth() -
        RIGHT_MARGIN;


    if (
        cursorX !==
            LEFT_MARGIN &&
        cursorX +
            newWidth +
            CURSOR_GAP >
            availableWidth
    ) {

        cursorX =
            LEFT_MARGIN;

        cursorY +=
            LINE_HEIGHT;
    }


    const startX =
        cursorX;

    const startY =
        cursorY;


    const result =
        createGlyphElement(
            character,
            startX,
            startY,
            stretch
        );

    if (!result) {
        return;
    }


    if (cursorGroup) {

        canvas.appendChild(
            cursorGroup
        );
    }


    history.push({

        type:
            "glyph",

        character:
            character,

        element:
            result.element,

        x:
            startX,

        y:
            startY,

        width:
            result.width,

        height:
            LETTER_HEIGHT,

        stretch:
            stretch,

        struck:
            false,

        strikeElement:
            null
    });


    strikeIndex =
        history.length -
        1;


    cursorX +=
        result.width +
        LETTER_GAP;


    resetCursor();

    updateCanvasSize();

    requestAnimationFrame(
        followCursor
    );
}


// ==========================================
// RETURN
// ==========================================

function handleReturn() {

    history.push({

        type:
            "return",

        x:
            cursorX,

        y:
            cursorY
    });


    cursorX =
        LEFT_MARGIN;

    cursorY +=
        LINE_HEIGHT;

    lastKeyTime = null;

    strikeIndex =
        history.length -
        1;

    resetCursor();

    updateCanvasSize();

    requestAnimationFrame(
        followCursor
    );
}


// ==========================================
// SPACE
// ==========================================

function handleSpace() {

    history.push({

        type:
            "space",

        x:
            cursorX,

        y:
            cursorY
    });


    cursorX +=
        SPACE_WIDTH;


    if (
        cursorX >
        getWritingWidth() -
        RIGHT_MARGIN
    ) {

        cursorX =
            LEFT_MARGIN;

        cursorY +=
            LINE_HEIGHT;
    }


    strikeIndex =
        history.length -
        1;

    resetCursor();

    updateCanvasSize();

    requestAnimationFrame(
        followCursor
    );
}


// ==========================================
// PROCESS CHARACTER
// ==========================================

function processTypedCharacter(
    character
) {

    if (
        isSealed ||
        isReadOnly
    ) {

        return;
    }


    if (
        /^[a-zA-Z]$/.test(
            character
        )
    ) {

        character =
            character.toUpperCase();
    }


    if (!glyphs[character]) {

        console.warn(
            "Unsupported character:",
            character
        );

        return;
    }


    // This timing measurement is shared by
    // desktop AND mobile.

    const now =
        performance.now();

    let interval = 200;

    if (
        lastKeyTime !==
        null
    ) {

        interval =
            now -
            lastKeyTime;
    }

    lastKeyTime = now;


    drawGlyph(
        character,
        interval
    );
}


// ==========================================
// REMOVE STRIKES
// ==========================================

function removeStrikeGroups(items) {

    const removedGroups =
        new Set();

    items.forEach(

        function (item) {

            if (
                item.strikeElement &&
                !removedGroups.has(
                    item.strikeElement
                )
            ) {

                removedGroups.add(
                    item.strikeElement
                );

                item.strikeElement.remove();
            }

            item.strikeElement = null;
        }
    );
}


// ==========================================
// DRAW STRIKE
// ==========================================

function drawContinuousStrike(items) {

    if (
        !strikeSource ||
        items.length === 0
    ) {

        return;
    }

    let startX = Infinity;
    let endX = -Infinity;

    items.forEach(

        function (item) {

            startX =
                Math.min(
                    startX,
                    item.x
                );

            endX =
                Math.max(
                    endX,
                    item.x +
                    item.width
                );
        }
    );


    const totalWidth =
        endX -
        startX;

    const lineY =
        items[0].y;


    removeStrikeGroups(
        items
    );


    const strikeViewBox =
        strikeSource.viewBox.baseVal;

    const scaleX =
        totalWidth /
        strikeViewBox.width;

    const scaleY =
        LETTER_HEIGHT /
        strikeViewBox.height;


    const strikeGroup =
        document.createElementNS(
            SVG_NS,
            "g"
        );


    Array.from(
        strikeSource.children
    ).forEach(

        function (child) {

            const copy =
                document.importNode(
                    child,
                    true
                );

            preserveStrokeWidth(
                copy
            );

            strikeGroup.appendChild(
                copy
            );
        }
    );


    strikeGroup.setAttribute(

        "transform",

        `
        translate(${startX} ${lineY})
        scale(${scaleX} ${scaleY})
        translate(${-strikeViewBox.x} ${-strikeViewBox.y})
        `
    );


    canvas.appendChild(
        strikeGroup
    );


    items.forEach(

        function (item) {

            item.strikeElement =
                strikeGroup;
        }
    );


    if (
        cursorGroup &&
        !isSealed
    ) {

        canvas.appendChild(
            cursorGroup
        );
    }
}


// ==========================================
// REDRAW STRIKES
// ==========================================

function redrawAllStrikes() {

    const struckItems =
        history.filter(

            function (item) {

                return (
                    item.type ===
                        "glyph" &&
                    item.struck
                );
            }
        );


    const lines =
        new Map();


    struckItems.forEach(

        function (item) {

            if (
                !lines.has(
                    item.y
                )
            ) {

                lines.set(
                    item.y,
                    []
                );
            }

            lines.get(
                item.y
            ).push(
                item
            );
        }
    );


    lines.forEach(

        function (lineItems) {

            lineItems.sort(

                function (a, b) {

                    return a.x - b.x;
                }
            );


            let group = [];


            lineItems.forEach(

                function (item) {

                    if (
                        group.length === 0
                    ) {

                        group.push(item);
                        return;
                    }


                    const previous =
                        group[
                            group.length - 1
                        ];


                    const gap =
                        item.x -
                        (
                            previous.x +
                            previous.width
                        );


                    if (
                        gap <=
                        LETTER_GAP + 2
                    ) {

                        group.push(
                            item
                        );

                    } else {

                        drawContinuousStrike(
                            group
                        );

                        group = [item];
                    }
                }
            );


            if (
                group.length > 0
            ) {

                drawContinuousStrike(
                    group
                );
            }
        }
    );
}


// ==========================================
// BACKSPACE → STRIKE
// ==========================================

function strikePreviousCharacter() {

    while (
        strikeIndex >= 0
    ) {

        const item =
            history[
                strikeIndex
            ];

        strikeIndex--;


        if (
            !item ||
            item.type !==
                "glyph"
        ) {

            continue;
        }


        if (item.struck) {

            continue;
        }


        item.struck = true;


        const sameLineStruck =
            history.filter(

                function (historyItem) {

                    return (
                        historyItem.type ===
                            "glyph" &&
                        historyItem.struck &&
                        historyItem.y ===
                            item.y
                    );
                }
            );


        sameLineStruck.sort(

            function (a, b) {

                return a.x - b.x;
            }
        );


        const connected =
            [item];

        let changed = true;


        while (changed) {

            changed = false;


            sameLineStruck.forEach(

                function (candidate) {

                    if (
                        connected.includes(
                            candidate
                        )
                    ) {

                        return;
                    }


                    const candidateStart =
                        candidate.x;

                    const candidateEnd =
                        candidate.x +
                        candidate.width;


                    const connectedStart =
                        Math.min(
                            ...connected.map(
                                glyph =>
                                    glyph.x
                            )
                        );


                    const connectedEnd =
                        Math.max(
                            ...connected.map(
                                glyph =>
                                    glyph.x +
                                    glyph.width
                            )
                        );


                    const tolerance =
                        LETTER_GAP + 2;


                    if (
                        candidateEnd >=
                            connectedStart -
                            tolerance
                        &&
                        candidateStart <=
                            connectedEnd +
                            tolerance
                    ) {

                        connected.push(
                            candidate
                        );

                        changed = true;
                    }
                }
            );
        }


        drawContinuousStrike(
            connected
        );

        break;
    }


    resetCursor();

    updateCanvasSize();

    requestAnimationFrame(
        followCursor
    );
}


// ==========================================
// LOAD SENT LETTER
// ==========================================

function loadSavedLetter(data) {

    history = [];

    let maximumX =
        window.innerWidth;

    let maximumY =
        window.innerHeight;


    data.forEach(

        function (item) {

            if (
                item.type ===
                "glyph"
            ) {

                const result =
                    createGlyphElement(
                        item.character,
                        item.x,
                        item.y,
                        item.stretch
                    );

                if (!result) {
                    return;
                }


                history.push({

                    type:
                        "glyph",

                    character:
                        item.character,

                    element:
                        result.element,

                    x:
                        item.x,

                    y:
                        item.y,

                    width:
                        item.width,

                    height:
                        LETTER_HEIGHT,

                    stretch:
                        item.stretch,

                    struck:
                        item.struck,

                    strikeElement:
                        null
                });


                maximumX =
                    Math.max(
                        maximumX,
                        item.x +
                        item.width +
                        RIGHT_MARGIN +
                        100
                    );


                maximumY =
                    Math.max(
                        maximumY,
                        item.y +
                        LETTER_HEIGHT +
                        150
                    );


                cursorY =
                    Math.max(
                        cursorY,
                        item.y
                    );

            } else {

                history.push({

                    type:
                        item.type,

                    x:
                        item.x,

                    y:
                        item.y
                });


                maximumX =
                    Math.max(
                        maximumX,
                        item.x +
                        100
                    );


                maximumY =
                    Math.max(
                        maximumY,
                        item.y +
                        LINE_HEIGHT +
                        150
                    );
            }
        }
    );


    redrawAllStrikes();


    // ======================================
    // MOBILE RECIPIENT
    // ======================================

    if (isMobile) {

        canvas.setAttribute(
            "width",
            maximumX
        );

        canvas.setAttribute(
            "height",
            maximumY
        );

        canvas.style.width =
            maximumX + "px";

        canvas.style.height =
            maximumY + "px";


        document.documentElement.style.overflowX =
            "auto";

        document.documentElement.style.overflowY =
            "auto";

        document.body.style.overflowX =
            "auto";

        document.body.style.overflowY =
            "auto";

        document.body.style.touchAction =
            "pan-x pan-y";

        canvas.style.touchAction =
            "pan-x pan-y";
    }


    // ======================================
    // DESKTOP RECIPIENT
    // ======================================

    else {

        // Keep desktop presentation behaving
        // as it did before.

        canvas.setAttribute(
            "height",
            maximumY
        );

        canvas.style.width =
            "100%";

        canvas.style.height =
            maximumY + "px";
    }


    if (interfaceButton) {

        interfaceButton.style.display =
            "none";
    }


    if (backButton) {

        backButton.style.display =
            "none";
    }


    if (cursorGroup) {

        cursorGroup.style.display =
            "none";
    }


    if (mobileInput) {

        mobileInput.blur();

        mobileInput.style.display =
            "none";
    }
}


// ==========================================
// DESKTOP KEYBOARD
// ==========================================

window.addEventListener(

    "keydown",

    function (event) {


        // Mobile textarea handles mobile input.

        if (
            mobileInput &&
            document.activeElement ===
                mobileInput
        ) {

            return;
        }


        if (
            isSealed ||
            isReadOnly
        ) {

            return;
        }


        // ENTER

        if (
            event.key ===
            "Enter"
        ) {

            event.preventDefault();

            handleReturn();

            return;
        }


        // BACKSPACE

        if (
            event.key ===
            "Backspace"
        ) {

            event.preventDefault();

            strikePreviousCharacter();

            return;
        }


        // SHORTCUTS

        if (
            event.metaKey ||
            event.ctrlKey ||
            event.altKey
        ) {

            return;
        }


        if (
            event.key.length !== 1
        ) {

            return;
        }


        event.preventDefault();


        // SPACE

        if (
            event.key === " "
        ) {

            handleSpace();

            return;
        }


        processTypedCharacter(
            event.key
        );
    }
);


// ==========================================
// RESIZE
// ==========================================

window.addEventListener(

    "resize",

    function () {

        if (!isReadOnly) {

            updateCanvasSize();
        }
    }
);


// ==========================================
// INITIAL SIZE
// ==========================================

updateCanvasSize();