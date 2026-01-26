// Dragon's Flight - 8-bit Audio System
// Uses Web Audio API to generate retro sound effects and music

class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;
        this.currentMusic = null;
        this.musicEnabled = true;
        this.sfxEnabled = true;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;

        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = 0.3;

            this.musicGain = this.audioContext.createGain();
            this.musicGain.connect(this.masterGain);
            this.musicGain.gain.value = 0.4;

            this.sfxGain = this.audioContext.createGain();
            this.sfxGain.connect(this.masterGain);
            this.sfxGain.gain.value = 0.6;

            this.initialized = true;
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
        }
    }

    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    // Create an oscillator with envelope
    createOscillator(type, frequency, startTime, duration, gainValue = 0.3) {
        if (!this.initialized || !this.sfxEnabled) return;

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(gainValue, startTime + 0.01);
        gain.gain.linearRampToValueAtTime(gainValue * 0.7, startTime + duration * 0.3);
        gain.gain.linearRampToValueAtTime(0, startTime + duration);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(startTime);
        osc.stop(startTime + duration);

        return { osc, gain };
    }

    // Sound Effects
    playShoot() {
        if (!this.initialized || !this.sfxEnabled) return;
        this.resume();

        const now = this.audioContext.currentTime;

        // Fireball sound - descending tone with noise
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.15);
    }

    playEnemyShoot() {
        if (!this.initialized || !this.sfxEnabled) return;
        this.resume();

        const now = this.audioContext.currentTime;

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);

        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.1);
    }

    playExplosion() {
        if (!this.initialized || !this.sfxEnabled) return;
        this.resume();

        const now = this.audioContext.currentTime;

        // White noise for explosion
        const bufferSize = this.audioContext.sampleRate * 0.3;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;

        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, now);
        filter.frequency.exponentialRampToValueAtTime(100, now + 0.3);

        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        noise.start(now);
        noise.stop(now + 0.3);

        // Low frequency boom
        const osc = this.audioContext.createOscillator();
        const oscGain = this.audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.2);

        oscGain.gain.setValueAtTime(0.3, now);
        oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

        osc.connect(oscGain);
        oscGain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.2);
    }

    playBossExplosion() {
        if (!this.initialized || !this.sfxEnabled) return;
        this.resume();

        const now = this.audioContext.currentTime;

        // Multiple explosions
        for (let i = 0; i < 5; i++) {
            setTimeout(() => this.playExplosion(), i * 150);
        }

        // Victory fanfare
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            this.createOscillator('square', freq, now + 0.8 + i * 0.15, 0.2, 0.15);
        });
    }

    playHit() {
        if (!this.initialized || !this.sfxEnabled) return;
        this.resume();

        const now = this.audioContext.currentTime;

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.setValueAtTime(150, now + 0.05);
        osc.frequency.setValueAtTime(100, now + 0.1);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.15);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.15);
    }

    playDeath() {
        if (!this.initialized || !this.sfxEnabled) return;
        this.resume();

        const now = this.audioContext.currentTime;

        // Descending tone
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.5);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.5);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.5);

        // Explosion after
        setTimeout(() => this.playExplosion(), 200);
    }

    playPowerUp() {
        if (!this.initialized || !this.sfxEnabled) return;
        this.resume();

        const now = this.audioContext.currentTime;
        const notes = [262, 330, 392, 523];

        notes.forEach((freq, i) => {
            this.createOscillator('square', freq, now + i * 0.08, 0.15, 0.15);
        });
    }

    playLevelComplete() {
        if (!this.initialized || !this.sfxEnabled) return;
        this.resume();

        const now = this.audioContext.currentTime;
        // Victory melody
        const melody = [
            { freq: 523, time: 0 },
            { freq: 587, time: 0.15 },
            { freq: 659, time: 0.3 },
            { freq: 784, time: 0.45 },
            { freq: 880, time: 0.6 },
            { freq: 1047, time: 0.8 }
        ];

        melody.forEach(note => {
            this.createOscillator('square', note.freq, now + note.time, 0.2, 0.2);
        });
    }

    playGameOver() {
        if (!this.initialized || !this.sfxEnabled) return;
        this.resume();

        const now = this.audioContext.currentTime;
        // Sad descending melody
        const melody = [
            { freq: 392, time: 0 },
            { freq: 349, time: 0.3 },
            { freq: 330, time: 0.6 },
            { freq: 262, time: 0.9 }
        ];

        melody.forEach(note => {
            this.createOscillator('sawtooth', note.freq, now + note.time, 0.4, 0.2);
        });
    }

    playMenuSelect() {
        if (!this.initialized || !this.sfxEnabled) return;
        this.resume();

        const now = this.audioContext.currentTime;
        this.createOscillator('square', 440, now, 0.1, 0.15);
    }

    playBossWarning() {
        if (!this.initialized || !this.sfxEnabled) return;
        this.resume();

        const now = this.audioContext.currentTime;

        // Warning siren
        for (let i = 0; i < 3; i++) {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.type = 'square';
            const startTime = now + i * 0.4;
            osc.frequency.setValueAtTime(440, startTime);
            osc.frequency.setValueAtTime(880, startTime + 0.2);

            gain.gain.setValueAtTime(0.2, startTime);
            gain.gain.setValueAtTime(0.2, startTime + 0.35);
            gain.gain.linearRampToValueAtTime(0, startTime + 0.4);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(startTime);
            osc.stop(startTime + 0.4);
        }
    }

    // Background Music
    startMusic(level) {
        if (!this.initialized || !this.musicEnabled) return;
        this.stopMusic();
        this.resume();

        this.currentMusic = {
            playing: true,
            level: level
        };

        this.playMusicLoop(level);
    }

    playMusicLoop(level) {
        if (!this.currentMusic || !this.currentMusic.playing) return;

        const now = this.audioContext.currentTime;

        // Different melodies for each level
        const melodies = {
            1: [ // Grassland - upbeat
                { freq: 262, dur: 0.2 }, { freq: 330, dur: 0.2 }, { freq: 392, dur: 0.2 }, { freq: 330, dur: 0.2 },
                { freq: 294, dur: 0.2 }, { freq: 349, dur: 0.2 }, { freq: 392, dur: 0.4 },
                { freq: 262, dur: 0.2 }, { freq: 392, dur: 0.2 }, { freq: 523, dur: 0.4 }
            ],
            2: [ // Beach - relaxed
                { freq: 392, dur: 0.3 }, { freq: 330, dur: 0.3 }, { freq: 262, dur: 0.3 }, { freq: 294, dur: 0.3 },
                { freq: 330, dur: 0.6 }, { freq: 392, dur: 0.3 }, { freq: 330, dur: 0.3 }
            ],
            3: [ // Desert - tense
                { freq: 220, dur: 0.2 }, { freq: 233, dur: 0.2 }, { freq: 220, dur: 0.2 }, { freq: 196, dur: 0.4 },
                { freq: 220, dur: 0.2 }, { freq: 262, dur: 0.2 }, { freq: 247, dur: 0.4 },
                { freq: 220, dur: 0.2 }, { freq: 196, dur: 0.4 }
            ],
            4: [ // Space - epic
                { freq: 196, dur: 0.4 }, { freq: 262, dur: 0.4 }, { freq: 247, dur: 0.2 }, { freq: 220, dur: 0.2 },
                { freq: 196, dur: 0.4 }, { freq: 294, dur: 0.4 }, { freq: 262, dur: 0.8 }
            ],
            boss: [ // Boss battle - intense
                { freq: 147, dur: 0.15 }, { freq: 147, dur: 0.15 }, { freq: 175, dur: 0.15 }, { freq: 147, dur: 0.15 },
                { freq: 139, dur: 0.3 }, { freq: 131, dur: 0.3 },
                { freq: 147, dur: 0.15 }, { freq: 147, dur: 0.15 }, { freq: 196, dur: 0.15 }, { freq: 185, dur: 0.45 }
            ]
        };

        const melody = melodies[level] || melodies[1];
        let time = 0;

        melody.forEach(note => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.type = 'square';
            osc.frequency.setValueAtTime(note.freq, now + time);

            gain.gain.setValueAtTime(0, now + time);
            gain.gain.linearRampToValueAtTime(0.15, now + time + 0.02);
            gain.gain.setValueAtTime(0.15, now + time + note.dur - 0.02);
            gain.gain.linearRampToValueAtTime(0, now + time + note.dur);

            osc.connect(gain);
            gain.connect(this.musicGain);

            osc.start(now + time);
            osc.stop(now + time + note.dur);

            time += note.dur;
        });

        // Bass line
        const bassNotes = level === 'boss' ?
            [{ freq: 73, dur: 0.3 }, { freq: 73, dur: 0.3 }, { freq: 65, dur: 0.3 }, { freq: 73, dur: 0.3 }] :
            [{ freq: 65, dur: 0.4 }, { freq: 73, dur: 0.4 }, { freq: 82, dur: 0.4 }, { freq: 73, dur: 0.4 }];

        let bassTime = 0;
        bassNotes.forEach(note => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(note.freq, now + bassTime);

            gain.gain.setValueAtTime(0.1, now + bassTime);
            gain.gain.setValueAtTime(0.1, now + bassTime + note.dur - 0.05);
            gain.gain.linearRampToValueAtTime(0, now + bassTime + note.dur);

            osc.connect(gain);
            gain.connect(this.musicGain);

            osc.start(now + bassTime);
            osc.stop(now + bassTime + note.dur);

            bassTime += note.dur;
        });

        // Schedule next loop
        const loopDuration = time * 1000;
        this.musicTimeout = setTimeout(() => {
            if (this.currentMusic && this.currentMusic.playing) {
                this.playMusicLoop(level);
            }
        }, loopDuration);
    }

    stopMusic() {
        if (this.currentMusic) {
            this.currentMusic.playing = false;
        }
        if (this.musicTimeout) {
            clearTimeout(this.musicTimeout);
        }
    }

    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        if (!this.musicEnabled) {
            this.stopMusic();
        }
        return this.musicEnabled;
    }

    toggleSFX() {
        this.sfxEnabled = !this.sfxEnabled;
        return this.sfxEnabled;
    }

    setMasterVolume(value) {
        if (this.masterGain) {
            this.masterGain.gain.value = value;
        }
    }
}

// Create global audio manager
window.audioManager = new AudioManager();
