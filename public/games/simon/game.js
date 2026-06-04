(function () {
    const pads = Array.from(document.querySelectorAll('.pad'));
    const board = document.getElementById('board');
    const startButton = document.getElementById('start');
    const resetButton = document.getElementById('reset');
    const soundButton = document.getElementById('sound');
    const statusEl = document.getElementById('status');
    const levelEl = document.getElementById('level');
    const bestEl = document.getElementById('best');

    const tones = [329.63, 261.63, 220, 392];
    const bestKey = 'tft-simon-best';
    let sequence = [];
    let inputIndex = 0;
    let acceptingInput = false;
    let playing = false;
    let soundOn = true;
    let audioContext = null;
    let best = Number(readBest() || 0);

    bestEl.textContent = String(best);

    function setStatus(text) {
        statusEl.textContent = text;
    }

    function setLevel(value) {
        levelEl.textContent = String(value);
        if (value > best) {
            best = value;
            bestEl.textContent = String(best);
            writeBest(best);
        }
    }

    function readBest() {
        try {
            return localStorage.getItem(bestKey);
        } catch {
            return null;
        }
    }

    function writeBest(value) {
        try {
            localStorage.setItem(bestKey, String(value));
        } catch {
            return;
        }
    }

    function ensureAudio() {
        if (!soundOn) return null;
        if (!audioContext) {
            const AudioCtor = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtor) return null;
            audioContext = new AudioCtor();
        }
        if (audioContext.state === 'suspended') audioContext.resume();
        return audioContext;
    }

    function playTone(index, duration = 230) {
        const ctx = ensureAudio();
        if (!ctx) return;

        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.value = tones[index];
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + 0.018);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration / 1000);
        oscillator.connect(gain);
        gain.connect(ctx.destination);
        oscillator.start();
        oscillator.stop(ctx.currentTime + duration / 1000 + 0.02);
    }

    function sleep(ms) {
        return new Promise((resolve) => window.setTimeout(resolve, ms));
    }

    async function flash(index, duration = 360) {
        const pad = pads[index];
        pad.classList.add('active');
        playTone(index, duration - 80);
        await sleep(duration);
        pad.classList.remove('active');
        await sleep(110);
    }

    function setPadState(enabled) {
        pads.forEach((pad) => {
            pad.disabled = !enabled;
        });
    }

    async function playSequence() {
        acceptingInput = false;
        setPadState(false);
        startButton.disabled = true;
        setStatus('Watch');
        await sleep(450);

        for (const index of sequence) {
            if (!playing) return;
            await flash(index);
        }

        inputIndex = 0;
        acceptingInput = true;
        setPadState(true);
        setStatus('Your Turn');
    }

    function addStep() {
        sequence.push(Math.floor(Math.random() * pads.length));
        setLevel(sequence.length);
    }

    async function nextRound() {
        addStep();
        await playSequence();
    }

    async function startGame() {
        playing = true;
        sequence = [];
        inputIndex = 0;
        setLevel(0);
        startButton.textContent = 'Restart';
        await nextRound();
        startButton.disabled = false;
    }

    async function handlePad(index) {
        if (!acceptingInput) return;
        acceptingInput = false;
        await flash(index, 220);

        if (index !== sequence[inputIndex]) {
            endGame();
            return;
        }

        inputIndex++;
        if (inputIndex === sequence.length) {
            setStatus('Good');
            setPadState(false);
            await sleep(550);
            await nextRound();
        } else {
            acceptingInput = true;
            setPadState(true);
        }
    }

    function endGame() {
        playing = false;
        acceptingInput = false;
        setPadState(false);
        setStatus('Try Again');
        board.classList.add('mistake');
        pads.forEach((pad) => pad.classList.add('error'));
        window.setTimeout(() => {
            board.classList.remove('mistake');
            pads.forEach((pad) => pad.classList.remove('error'));
        }, 500);
        startButton.disabled = false;
        startButton.textContent = 'Start';
    }

    function resetGame() {
        playing = false;
        acceptingInput = false;
        sequence = [];
        inputIndex = 0;
        setPadState(false);
        setLevel(0);
        setStatus('Tap Start');
        startButton.disabled = false;
        startButton.textContent = 'Start';
        pads.forEach((pad) => pad.classList.remove('active', 'error'));
    }

    startButton.addEventListener('click', startGame);
    resetButton.addEventListener('click', resetGame);
    soundButton.addEventListener('click', () => {
        soundOn = !soundOn;
        soundButton.textContent = soundOn ? 'Sound On' : 'Sound Off';
        soundButton.setAttribute('aria-pressed', String(soundOn));
    });

    pads.forEach((pad) => {
        pad.disabled = true;
        pad.addEventListener('pointerdown', () => handlePad(Number(pad.dataset.pad)));
    });
})();
