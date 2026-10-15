const URL_BASE = "https://www.gstatic.com/delight/knowledge/animal_sounds";
const HELP_WITH_AUTOFOCUS = true;
const PLAY_DURATION = 2.5;

// Cargamos los recursos/listas grandes desde otro script como si fuera un modulo

const listaSonidos = window.listaSonidos;
const traducciones = window.traducciones;

if (!Array.isArray(listaSonidos) || listaSonidos.length < 3) {
    throw new Error("Lista de sonidos invalida.");
}

if (!traducciones || typeof traducciones !== "object" || Array.isArray(traducciones) || Object.keys(traducciones).length < 3) {
    throw new Error("Lista de traducciones invalida.");
}

function getNombreAnimalTraducido(rutaSonido) {
    let nombre = rutaSonido.split("/").pop() || "";
    nombre = nombre.replace(/\.mp3$/i, "").replace(/[0-9]/g, "").replace(/_/g, " ").replace(/\s+/g, " ").trim();
    
    const key = nombre.toLowerCase().trim();
    if (traducciones[key]) return traducciones[key];
    return key;
}

const animalesFull = [];
const animalesUnicos = [];
for (const sonido of listaSonidos) {
    const animalUpCase = getNombreAnimalTraducido(sonido);
    const animal = animalUpCase.toLowerCase().trim();

    if (!animalesUnicos.includes(animal)) {
        animalesUnicos.push(animal);
        animalesFull.push(animalUpCase.trim());
    }
}

if (animalesUnicos.length < 3) {
    throw new Error("No hay suficientes animales diferentes.");
}

// Variables que controlan el estado del juego.

let roundInfo = null;
let opcionSelected = null;
let gameStatus = "idle";

let gameOver = false;

let actualScore = 0;
let bestScore = 0; // No hacemos q se guarde, como el juego del dinosaurio de Chrome

let playingSound = false;
let playedSound = false;

let audioObj = null;

// Funciones generales.

function shuffle(table) {
    const copy = [...table];

    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }

    return copy;
}

function buildRound() {
    const sonido = listaSonidos[Math.floor(Math.random() * listaSonidos.length)];
    const correcto = getNombreAnimalTraducido(sonido);

    const opciones = [correcto];

    const animalesDisponibles = [];

    for (const animal of animalesFull) {
        if (animal.toLowerCase() !== correcto.toLowerCase().trim()) {
            animalesDisponibles.push(animal);
        }
    }

    while (opciones.length < 3) {
        const index = Math.floor(Math.random() * animalesDisponibles.length);

        opciones.push(animalesDisponibles[index]);
        animalesDisponibles.splice(index, 1);
    }

    return {
        sonido,
        correcto,
        opciones: shuffle(opciones)
    };
}

// Temporizadores de reproducción y accesibilidad.

const focusTimers = [];
let progressTimer = null;
let audioTimer = null;

function stopFocusTimers() {
    focusTimers.forEach(timer => clearTimeout(timer));
    focusTimers.length = 0;
}

function focusAfterDelay(callback, delay) {
    const timer = setTimeout(() => {
        const index = focusTimers.indexOf(timer);
        if (index !== -1) focusTimers.splice(index, 1);

        callback();
    }, delay);

    focusTimers.push(timer);
    return timer;
}

function stopPlayback(itsTimeout) {
    if (progressTimer !== null) {
        clearInterval(progressTimer);
        progressTimer = null;
    }

    if (audioTimer !== null) {
        clearTimeout(audioTimer);
        audioTimer = null;
    }

    if (audioObj) {
        audioObj.pause();
        audioObj.currentTime = 0;
    }

    playingSound = false;

    elements.btnTogglePlay.setAttribute("aria-label", "Reproducir sonido del animal");

    if (itsTimeout && HELP_WITH_AUTOFOCUS) {
        stopFocusTimers();

        const botones = elements.optionsContainer.querySelectorAll(".opcion-btn");
        let previous = elements.btnTogglePlay;

        botones.forEach((btn, index) => {
            focusAfterDelay(() => {
                if ( previous.isConnected && btn.isConnected && document.activeElement === previous && !btn.disabled && !gameOver ) {
                    previous = btn;
                    btn.focus();
                }
            }, (index + 0.5) * 3700);
        });
    }

    renderAudioPlayer(0, false);
}

function playSound() {
    if (!audioObj) return;

    stopFocusTimers();
    stopPlayback();

    audioObj.currentTime = 0;
    audioObj.play().catch(() => {
        window.location.reload();
    });

    playedSound = true;
    playingSound = true;
    elements.btnTogglePlay.setAttribute("aria-label", "Pausar sonido");

    const start = performance.now();

    progressTimer = setInterval(() => {
        const secs = Math.min(PLAY_DURATION, (performance.now() - start) / 1000);
        renderAudioPlayer(secs, true);
    }, 30);

    audioTimer = setTimeout(() => {
        stopPlayback(true);
    }, PLAY_DURATION * 1000);
}

function togglePlay() {
    if (playingSound) {
        stopFocusTimers();
        stopPlayback();
    } else {
        playSound();
    }
}

const elements = {
    cabecera: document.getElementById("cabecera"),
    scoreDisplay: document.getElementById("score-display"),
    bestDisplay: document.getElementById("best-display"),
    optionsContainer: document.getElementById("options-container"),
    resultMessage: document.getElementById("result-message"),
    progressBarFill: document.getElementById("progress-bar-fill"),
    progressBarKnob: document.getElementById("progress-bar-knob"),
    elapsedTime: document.getElementById("elapsed-time"),
    btnTogglePlay: document.getElementById("btn-toggle-play"),
    iconPlay: document.getElementById("icon-play"),
    iconPause: document.getElementById("icon-pause"),
    btnNuevoAnimal: document.getElementById("btn-nuevo-animal"),
    gameOverModal: document.getElementById("game-over-modal"),
    correctAnimalDisplay: document.getElementById("correct-animal-display"),
    lostStreakDisplay: document.getElementById("lost-streak-display"),
    aciertosTexto: document.getElementById("aciertos-texto"),
    btnRestart: document.getElementById("btn-restart")
};

elements.btnTogglePlay.addEventListener("click", togglePlay);
elements.btnNuevoAnimal.addEventListener("click", () => nuevoAnimal(false));
elements.btnRestart.addEventListener("click", reiniciar);

function renderAudioPlayer(elapsedSec, isPlaying) {
    const pct = Math.min(100, (elapsedSec / PLAY_DURATION) * 100);

    if (isPlaying) {
        elements.progressBarFill.style.width = `calc(${pct}% + 4px)`;
    } else {
        const oldTransition = elements.progressBarFill.style.transition;

        elements.progressBarFill.style.transition = "none";
        elements.progressBarFill.style.width = `calc(${pct}% + 4px)`;

        elements.progressBarFill.offsetWidth;

        elements.progressBarFill.style.transition = oldTransition;
    }

    elements.progressBarKnob.style.left = `${pct}%`;
    elements.elapsedTime.innerText = elapsedSec.toFixed(1);
    elements.btnTogglePlay.classList.toggle("anim-playing", isPlaying);
    elements.iconPlay.classList.toggle("oculto", isPlaying);
    elements.iconPause.classList.toggle("oculto", !isPlaying);
}

function renderOpciones() {
    elements.optionsContainer.innerHTML = "";

    roundInfo.opciones.forEach(opcion => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.innerText = opcion;
        btn.disabled = gameStatus !== "idle" || gameOver;

        btn.className = "opcion-btn";

        if (gameStatus !== "idle") {
            const isCorrect = opcion.toLowerCase() === roundInfo.correcto.toLowerCase() && playedSound;
            const isSelected = opcionSelected !== null && opcion.toLowerCase() === opcionSelected.toLowerCase();

            if (isCorrect) {
                btn.classList.add("correcto", "anim-pop");
                btn.setAttribute("aria-label", opcion + ", respuesta correcta");
            } else if (isSelected) {
                btn.classList.add("incorrecto", "anim-shake");
                btn.setAttribute("aria-label", opcion + ", respuesta incorrecta");
            } else {
                btn.classList.add("inactivo");
            }
        }

        btn.addEventListener("click", () => responder(opcion));
        elements.optionsContainer.appendChild(btn);
    });
}

function renderResultado() {
    if (gameStatus === "correct") {
        elements.resultMessage.innerHTML = `<span class="exito anim-pop">¡Correcto!</span>`;
    } else if (gameStatus === "wrong" && !gameOver) {
        elements.resultMessage.innerHTML = `<span class="fallo">Era ${roundInfo.correcto}</span>`;
    } else if (gameStatus === "nosound" && !gameOver) {
        elements.resultMessage.innerHTML = `<span class="fallo">Hiciste trampa!</span>`;
    } else {
        elements.resultMessage.innerHTML = "";
    }
}

function animarScore() {
    elements.scoreDisplay.textContent = actualScore;
    elements.scoreDisplay.classList.remove("anim-pop");
    void elements.scoreDisplay.offsetWidth;
    elements.scoreDisplay.classList.add("anim-pop");
}

const audioCache = {};

function nuevoAnimal(itsNewParty) {
    stopFocusTimers();
    stopPlayback();

    gameOver = false;
    opcionSelected = null;
    gameStatus = "idle";

    elements.gameOverModal.classList.add("oculto");
    renderResultado();

    roundInfo = buildRound();

    playedSound = false;
    renderOpciones();

    // Es intencional, la persona debe poder cambiar de sonido al inicio
    elements.btnNuevoAnimal.disabled = actualScore >= 1;

    if (audioObj) {
        audioObj.pause();
        audioObj.currentTime = 0;
    }

    if (audioCache[roundInfo.sonido]) {
        audioObj = audioCache[roundInfo.sonido];
    } else {
        audioObj = new Audio(URL_BASE + roundInfo.sonido);
        audioObj.crossOrigin = "anonymous";
        audioObj.preload = "auto";
        audioObj.onended = () => stopPlayback();

        audioCache[roundInfo.sonido] = audioObj;
    }

    elements.resultMessage.innerHTML = `<span class="sr-only">Nuevo animal listo para escuchar.</span>`;

    if (!HELP_WITH_AUTOFOCUS) return;

    focusAfterDelay(() => {
        if (itsNewParty === true) {
            if (elements.btnTogglePlay.isConnected) {
                elements.btnTogglePlay.focus();
            }
        } else {
            if (elements.cabecera.isConnected) {
                elements.cabecera.focus();
            }

            focusAfterDelay(() => {
                if (elements.btnTogglePlay.isConnected && !gameOver && roundInfo) {
                  elements.btnTogglePlay.focus();
                }
            }, 22000);
        }
    }, 150);
}

function responder(opcion) {
    if (!roundInfo || gameStatus !== "idle" || gameOver) return;

    stopFocusTimers();

    opcionSelected = opcion;

    if (opcion.toLowerCase() === roundInfo.correcto.toLowerCase() && playedSound) {
        gameStatus = "correct";
        actualScore++;

        if (actualScore > bestScore) bestScore = actualScore;

        animarScore();
        elements.bestDisplay.innerText = bestScore;

        elements.btnNuevoAnimal.disabled = false;

        if (HELP_WITH_AUTOFOCUS) {
            focusAfterDelay(() => {
                if (elements.btnNuevoAnimal.isConnected && !elements.btnNuevoAnimal.disabled && !gameOver) {
                  elements.btnNuevoAnimal.focus();
                }
            }, 750);
        }
    } else {
        let hizoTrampa = false;

        if (!playedSound && opcion.toLowerCase() === roundInfo.correcto.toLowerCase()) {
            gameStatus = "nosound";
            hizoTrampa = true;
        } else {
            gameStatus = "wrong";
        }

        stopPlayback();

        gameOver = true;
        elements.btnNuevoAnimal.disabled = true;

        focusAfterDelay(() => {
            elements.correctAnimalDisplay.innerText = ((hizoTrampa && `${roundInfo.correcto}, pero hiciste trampa`) || roundInfo.correcto);
            elements.lostStreakDisplay.innerText = actualScore;
            elements.aciertosTexto.innerText = ((actualScore === 1 && "acierto") || "aciertos");
            elements.gameOverModal.classList.remove("oculto");

            if (HELP_WITH_AUTOFOCUS) {
                focusAfterDelay(() => {
                    if (gameOver && elements.gameOverModal.isConnected) {
                        elements.gameOverModal.focus();
                    }
                }, 50);
            }
        }, 750);
    }

    // Agregamos un delay porque TalkBack parece bugearse.
    setTimeout(() => {
        renderOpciones();
        renderResultado();
    }, 50);
}

function reiniciar() {
    stopFocusTimers();

    actualScore = 0;
    elements.scoreDisplay.textContent = actualScore;

    nuevoAnimal(true);
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => nuevoAnimal(false), { once: true });
} else {
    nuevoAnimal(false);
}