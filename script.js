// ==========================================
// BARED HEART
// RESPONSIVE DIGITAL LOVE LETTER
// ==========================================

const canvas = document.getElementById("canvas");
const SVG_NS = "http://www.w3.org/2000/svg";


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
// LETTER WIDTH SETTINGS
// ==========================================

const MIN_TIME = 50;
const MIN_STRETCH = 0.12;

const MAX_TIME = 1500;
const MAX_STRETCH = 10;


// ==========================================
// CURSOR SETTINGS
// ==========================================

const CURSOR_GAP = 12;
const CURSOR_SCALE = 1;


// ==========================================
// CURSOR BLINK SETTINGS
// ==========================================

const BLINK_FAST = 320;
const BLINK_SLOW = 1100;

const SLOWDOWN_START = 1200;
const SLOWDOWN_END = 4500;


// ==========================================
// BUTTON SETTINGS
// ==========================================

const BUTTON_RIGHT = 30;
const BUTTON_LEFT = 30;
const BUTTON_BOTTOM = 30;

const BUTTON_WIDTH = 120;

// Fade duration in milliseconds
const BUTTON_TRANSITION = 280;

// Framer website
const FRAMER_URL =
    "https://baredheart.framer.website/";


// ==========================================
// WRITING STATE
// ==========================================

let cursorX = LEFT_MARGIN;
let cursorY = TOP_MARGIN;

let lastKeyTime = null;

let isSealed = false;
let isCollected = false;
let isReadOnly = false;


// ==========================================
// WRITING HISTORY
// ==========================================

let history = [];

let strikeIndex = -1;


// ==========================================
// SVG FILE MAP
// ==========================================

const glyphFiles = {

    // LETTERS

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

    // NUMBERS

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

    // PUNCTUATION

    "'": "./glyphs/apostrophe.svg",
    '"': "./glyphs/quotation.svg",

    ",": "./glyphs/comma.svg",
    ".": "./glyphs/period.svg",

    ":": "./glyphs/colon.svg",
    ";": "./glyphs/semicolon.svg",

    "?": "./glyphs/question.svg",
    "!": "./glyphs/exclamation.svg",

    // SYMBOLS

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

    // SLASHES

    "/": "./glyphs/slash.svg",
    "\\": "./glyphs/backslash.svg",

    // ANGLE BRACKETS

    "<": "./glyphs/less-than.svg",
    ">": "./glyphs/greater-than.svg",

    // PARENTHESES

    "(": "./glyphs/left-parenthesis.svg",
    ")": "./glyphs/right-parenthesis.svg",

    // SQUARE BRACKETS

    "[": "./glyphs/left-square-bracket.svg",
    "]": "./glyphs/right-square-bracket.svg",

    // CURLY BRACES

    "{": "./glyphs/left-curly-brace.svg",
    "}": "./glyphs/right-curly-brace.svg"
};


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
// SVG STORAGE
// ==========================================

const glyphs = {};

let cursorSource = null;
let strikeSource = null;


// ==========================================
// LOAD EVERYTHING
// ==========================================

async function loadEverything() {

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

    const savedLetter =
        getLetterFromURL();

    if (savedLetter) {

        isReadOnly = true;
        isSealed = true;

        loadSavedLetter(
            savedLetter
        );

    } else {

        if (cursorSource) {

            createCursor();
        }

        setButtonState(
            "seal",
            false
        );
    }

    console.log(
        "Bared Heart loaded!"
    );
}


loadEverything();


// ==========================================
// TYPING TIME → LETTER WIDTH
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
// KEEP STROKE THICKNESS CONSTANT
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
// MAIN INTERFACE BUTTON
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

    interfaceButton.draggable =
        false;


    // HOVER

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


    // CLICK

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

    // Hidden initially
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

    backButton.draggable =
        false;


    // HOVER

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


    // CLICK

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
// SHOW BACK BUTTON
// ==========================================

function showBackButton() {

    if (!backButton) {
        return;
    }

    backButton.style.visibility =
        "visible";

    backButton.style.pointerEvents =
        "auto";


    // Start transparent

    backButton.style.opacity =
        "0";


    // Let browser register initial state
    // before fading it in.

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


    // No animation needed on
    // first page load.

    if (!animate) {

        interfaceButton.src =
            newSource;

        interfaceButton.style.opacity =
            "1";

        return;
    }


    // ======================================
    // FADE OLD BUTTON OUT
    // ======================================

    interfaceButton.style.pointerEvents =
        "none";

    interfaceButton.style.opacity =
        "0";


    // ======================================
    // CHANGE SVG WHILE INVISIBLE
    // ======================================

    setTimeout(

        function () {

            interfaceButton.src =
                newSource;


            // ==================================
            // FADE NEW BUTTON IN
            // ==================================

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


            // When COLLECTED appears,
            // BACK appears with it.

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

    if (isReadOnly) {
        return;
    }


    // FIRST CLICK = SEAL

    if (!isSealed) {

        sealLetter();

        return;
    }


    // SECOND CLICK = COLLECT

    if (
        isSealed &&
        !isCollected
    ) {

        await collectLetter();

        return;
    }
}


// ==========================================
// SEAL LETTER
// ==========================================

function sealLetter() {

    isSealed = true;


    // Hide cursor

    if (cursorGroup) {

        cursorGroup.style.display =
            "none";
    }


    // Stop cursor animation

    if (cursorAnimationFrame) {

        cancelAnimationFrame(
            cursorAnimationFrame
        );

        cursorAnimationFrame =
            null;
    }


    // SEAL → COLLECT

    setButtonState(
        "collect"
    );


    console.log(
        "Heart sealed."
    );
}


// ==========================================
// COLLECT LETTER
// ==========================================

async function collectLetter() {

    const letterData =
        createLetterData();


    const encoded =
        encodeLetterData(
            letterData
        );


    const baseURL =
        window.location.origin +
        window.location.pathname;


    const shareURL =
        baseURL +
        "#heart=" +
        encoded;


    try {

        await navigator.clipboard.writeText(
            shareURL
        );


        isCollected = true;


        setButtonState(
            "collected"
        );


        console.log(
            "Heart collected. Link copied."
        );

    } catch (error) {

        console.error(
            "Could not copy link:",
            error
        );


        fallbackCopy(
            shareURL
        );


        isCollected = true;


        setButtonState(
            "collected"
        );
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


    textArea.value =
        text;


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
            "Fallback copy failed:",
            error
        );
    }


    textArea.remove();
}


// ==========================================
// CREATE LETTER DATA
// ==========================================

function createLetterData() {

    return history.map(

        function (item) {

            if (
                item.type === "glyph"
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
// ENCODE LETTER INTO URL
// ==========================================

function encodeLetterData(data) {

    const json =
        JSON.stringify(
            data
        );


    const bytes =
        new TextEncoder().encode(
            json
        );


    let binary = "";


    bytes.forEach(

        function (byte) {

            binary +=
                String.fromCharCode(
                    byte
                );
        }

    );


    return btoa(binary)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");
}


// ==========================================
// DECODE LETTER FROM URL
// ==========================================

function decodeLetterData(encoded) {

    try {

        let base64 =
            encoded
                .replace(/-/g, "+")
                .replace(/_/g, "/");


        while (
            base64.length % 4
        ) {

            base64 += "=";
        }


        const binary =
            atob(base64);


        const bytes =
            Uint8Array.from(

                binary,

                function (character) {

                    return character.charCodeAt(
                        0
                    );
                }

            );


        const json =
            new TextDecoder().decode(
                bytes
            );


        return JSON.parse(
            json
        );

    } catch (error) {

        console.error(
            "Could not read collected heart:",
            error
        );


        return null;
    }
}


// ==========================================
// CHECK URL FOR SAVED LETTER
// ==========================================

function getLetterFromURL() {

    const prefix =
        "#heart=";


    if (
        !window.location.hash.startsWith(
            prefix
        )
    ) {

        return null;
    }


    const encoded =
        window.location.hash.slice(
            prefix.length
        );


    if (!encoded) {
        return null;
    }


    return decodeLetterData(
        encoded
    );
}


// ==========================================
// CURSOR
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


    cursorVisible =
        true;


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
            )
            *
            progress;
    }


    if (
        now -
        lastBlinkTime >=
        blinkSpeed
    ) {

        cursorVisible =
            !cursorVisible;


        lastBlinkTime =
            now;
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


    ensureCursorVisible();


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


    cursorVisible =
        true;


    if (cursorGroup) {

        cursorGroup.style.opacity =
            "1";
    }
}


// ==========================================
// AUTOMATIC PAGE SCROLL
// ==========================================

let lastScrollLine = -1;


function ensureCursorVisible() {

    if (
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
// CANVAS HEIGHT
// ==========================================

function updateCanvasHeight() {

    const requiredHeight =
        cursorY +
        LINE_HEIGHT +
        150;


    const minimumHeight =
        window.innerHeight;


    canvas.setAttribute(

        "height",

        Math.max(
            requiredHeight,
            minimumHeight
        )

    );
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
// DRAW CHARACTER
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
        window.innerWidth -
        RIGHT_MARGIN;


    if (
        cursorX !== LEFT_MARGIN &&
        cursorX +
        newWidth +
        CURSOR_GAP >
        availableWidth
    ) {

        cursorX =
            LEFT_MARGIN;


        cursorY +=
            LINE_HEIGHT;


        updateCanvasHeight();
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
        history.length - 1;


    cursorX +=
        result.width +
        LETTER_GAP;


    resetCursor();


    updateCanvasHeight();
}


// ==========================================
// REMOVE OLD STRIKE GROUPS
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


            item.strikeElement =
                null;
        }

    );
}


// ==========================================
// DRAW ONE CONTINUOUS STRIKE
// ==========================================

function drawContinuousStrike(items) {

    if (
        !strikeSource ||
        items.length === 0
    ) {

        return;
    }


    let startX =
        Infinity;


    let endX =
        -Infinity;


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
// REDRAW ALL STRIKES
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

                    return (
                        a.x -
                        b.x
                    );
                }

            );


            let group = [];


            lineItems.forEach(

                function (item) {

                    if (
                        group.length ===
                        0
                    ) {

                        group.push(
                            item
                        );

                        return;
                    }


                    const previous =
                        group[
                            group.length -
                            1
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


                        group = [
                            item
                        ];
                    }
                }

            );


            if (
                group.length >
                0
            ) {

                drawContinuousStrike(
                    group
                );
            }
        }

    );
}


// ==========================================
// STRIKE PREVIOUS CHARACTER
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


        if (
            item.struck
        ) {

            continue;
        }


        item.struck =
            true;


        const sameLineStruck =
            history.filter(

                function (
                    historyItem
                ) {

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

                return (
                    a.x -
                    b.x
                );
            }

        );


        const connected =
            [item];


        let changed =
            true;


        while (changed) {

            changed =
                false;


            sameLineStruck.forEach(

                function (
                    candidate
                ) {

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


                        changed =
                            true;
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
}


// ==========================================
// LOAD SAVED / COLLECTED LETTER
// ==========================================

function loadSavedLetter(data) {

    history = [];


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


                cursorY =
                    Math.max(
                        cursorY,
                        item.y
                    );
            }
        }

    );


    redrawAllStrikes();


    updateCanvasHeight();


    // Received heart = read only.
    // Hide all controls.

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
}


// ==========================================
// KEYBOARD
// ==========================================

window.addEventListener(

    "keydown",

    function (event) {


        // ==================================
        // SEALED / READ-ONLY
        // ==================================

        if (
            isSealed ||
            isReadOnly
        ) {

            // Keyboard no longer edits.
            // Normal browser scrolling
            // remains available.

            return;
        }


        // ==================================
        // ENTER
        // ==================================

        if (
            event.key ===
            "Enter"
        ) {

            event.preventDefault();


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


            lastKeyTime =
                null;


            strikeIndex =
                history.length -
                1;


            resetCursor();


            updateCanvasHeight();


            return;
        }


        // ==================================
        // BACKSPACE
        // ==================================

        if (
            event.key ===
            "Backspace"
        ) {

            event.preventDefault();


            strikePreviousCharacter();


            return;
        }


        // ==================================
        // IGNORE COMPUTER SHORTCUTS
        // ==================================

        if (
            event.metaKey ||
            event.ctrlKey ||
            event.altKey
        ) {

            return;
        }


        if (
            event.key.length !==
            1
        ) {

            return;
        }


        event.preventDefault();


        // ==================================
        // SPACE
        // ==================================

        if (
            event.key === " "
        ) {

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
                window.innerWidth -
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


            updateCanvasHeight();


            return;
        }


        // ==================================
        // CHARACTER
        // ==================================

        let character =
            event.key;


        if (
            /^[a-zA-Z]$/.test(
                character
            )
        ) {

            character =
                character.toUpperCase();
        }


        if (
            !glyphs[
                character
            ]
        ) {

            console.warn(
                "Unsupported character:",
                character
            );


            return;
        }


        // ==================================
        // MEASURE KEYSTROKE INTERVAL
        // ==================================

        const now =
            performance.now();


        let interval =
            200;


        if (
            lastKeyTime !==
            null
        ) {

            interval =
                now -
                lastKeyTime;
        }


        lastKeyTime =
            now;


        // ==================================
        // DRAW
        // ==================================

        drawGlyph(
            character,
            interval
        );
    }

);


// ==========================================
// WINDOW RESIZE
// ==========================================

window.addEventListener(

    "resize",

    function () {

        updateCanvasHeight();
    }

);


// ==========================================
// INITIAL CANVAS HEIGHT
// ==========================================

updateCanvasHeight();