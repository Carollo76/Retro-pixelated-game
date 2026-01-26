// Dragon's Flight - Main Game Controller

class Game {
    constructor() {
        // Canvas setup
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;

        // Game dimensions
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        // Sprite renderer
        this.spriteRenderer = new SpriteRenderer(this.ctx);

        // Game state
        this.state = 'menu'; // menu, intro, playing, paused, bossWarning, boss, levelComplete, gameOver, victory
        this.currentLevel = 1;
        this.maxLevels = 4;

        // Score
        this.score = 0;
        this.highScore = this.loadHighScore();

        // Game objects
        this.dragon = null;
        this.fireballs = [];
        this.enemies = [];
        this.enemyBullets = [];
        this.explosions = [];
        this.boss = null;
        this.level = null;
        this.enemySpawner = null;

        // Timers
        this.lastTime = 0;
        this.bossWarningTimer = 0;
        this.levelCompleteTimer = 0;

        // Input
        this.keys = {};

        // Intro animation
        this.introPhase = 0;
        this.introTimer = 0;

        // Initialize
        this.init();
    }

    init() {
        // Set up event listeners
        this.setupEventListeners();

        // Update high score display
        document.getElementById('high-score').textContent = this.highScore;

        // Initialize audio on first interaction
        document.addEventListener('click', () => {
            window.audioManager.init();
        }, { once: true });

        document.addEventListener('keydown', () => {
            window.audioManager.init();
        }, { once: true });

        // Start game loop
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    setupEventListeners() {
        // Keyboard input
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));

        // Menu buttons
        document.getElementById('start-btn').addEventListener('click', () => this.startIntro());
        document.getElementById('controls-btn').addEventListener('click', () => this.showControls());
        document.getElementById('back-btn').addEventListener('click', () => this.showMenu());

        // Pause menu
        document.getElementById('resume-btn').addEventListener('click', () => this.resumeGame());
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
        document.getElementById('quit-btn').addEventListener('click', () => this.quitToMenu());

        // Game over
        document.getElementById('retry-btn').addEventListener('click', () => this.restartGame());
        document.getElementById('menu-btn').addEventListener('click', () => this.quitToMenu());

        // Level complete
        document.getElementById('next-level-btn').addEventListener('click', () => this.nextLevel());

        // Victory
        document.getElementById('victory-restart-btn').addEventListener('click', () => this.restartGame());
        document.getElementById('victory-menu-btn').addEventListener('click', () => this.quitToMenu());
    }

    handleKeyDown(e) {
        this.keys[e.code] = true;

        // Prevent default for game keys
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
            e.preventDefault();
        }

        // Pause toggle
        if ((e.code === 'KeyP' || e.code === 'Escape') && this.state === 'playing') {
            this.pauseGame();
        } else if ((e.code === 'KeyP' || e.code === 'Escape') && this.state === 'paused') {
            this.resumeGame();
        }

        // Skip intro
        if (e.code === 'Space' && this.state === 'intro') {
            this.startGame();
        }
    }

    handleKeyUp(e) {
        this.keys[e.code] = false;
    }

    gameLoop(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Update and draw based on state
        switch (this.state) {
            case 'menu':
                this.drawMenuBackground();
                break;

            case 'intro':
                this.updateIntro(deltaTime);
                this.drawIntro();
                break;

            case 'playing':
            case 'boss':
                this.update(deltaTime);
                this.draw();
                break;

            case 'bossWarning':
                this.updateBossWarning(deltaTime);
                this.draw();
                break;

            case 'paused':
                this.draw();
                break;

            case 'levelComplete':
                this.updateLevelComplete(deltaTime);
                this.draw();
                break;

            case 'gameOver':
            case 'victory':
                this.draw();
                break;
        }

        requestAnimationFrame((time) => this.gameLoop(time));
    }

    // Menu functions
    showMenu() {
        this.state = 'menu';
        this.hideAllMenus();
        document.getElementById('start-menu').classList.remove('hidden');
        document.getElementById('hud').classList.add('hidden');
    }

    showControls() {
        this.hideAllMenus();
        document.getElementById('controls-screen').classList.remove('hidden');
        window.audioManager.playMenuSelect();
    }

    hideAllMenus() {
        document.querySelectorAll('.menu').forEach(menu => menu.classList.add('hidden'));
    }

    // Intro sequence
    startIntro() {
        window.audioManager.init();
        window.audioManager.playMenuSelect();
        this.state = 'intro';
        this.introPhase = 0;
        this.introTimer = 0;
        this.hideAllMenus();
    }

    updateIntro(deltaTime) {
        this.introTimer += deltaTime;

        // Intro phases:
        // 0: Show title (0-2s)
        // 1: Show dragon (2-4s)
        // 2: Dragon takes off (4-6s)
        // 3: Start game

        if (this.introTimer > 6000) {
            this.startGame();
        } else if (this.introTimer > 4000) {
            this.introPhase = 2;
        } else if (this.introTimer > 2000) {
            this.introPhase = 1;
        }
    }

    drawIntro() {
        // Background
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Stars
        for (let i = 0; i < 50; i++) {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.random() * 0.7})`;
            this.ctx.fillRect(
                (i * 73) % this.width,
                (i * 137) % this.height,
                2, 2
            );
        }

        // Title
        this.ctx.fillStyle = '#ff6b35';
        this.ctx.font = '24px "Press Start 2P", monospace';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        const titleY = this.introPhase >= 1 ? 100 : this.height / 2 - 50;
        this.ctx.fillText("DRAGON'S", this.width / 2, titleY);
        this.ctx.fillText("FLIGHT", this.width / 2, titleY + 35);

        // Dragon
        if (this.introPhase >= 1) {
            let dragonY = this.height / 2;
            if (this.introPhase === 2) {
                // Take off animation
                const takeoffProgress = (this.introTimer - 4000) / 2000;
                dragonY = this.height / 2 - takeoffProgress * 200;
            }

            // Draw dragon
            const frame = Math.floor(this.introTimer / 100) % 3;
            const frameNames = ['frame1', 'frame2', 'frame3'];
            this.spriteRenderer.drawSprite(
                DRAGON_SPRITES[frameNames[frame]],
                this.width / 2 - 16,
                dragonY,
                2
            );

            // Draw fire trail during takeoff
            if (this.introPhase === 2) {
                for (let i = 0; i < 5; i++) {
                    const alpha = 1 - i * 0.2;
                    this.ctx.fillStyle = `rgba(255, ${100 + i * 30}, 0, ${alpha})`;
                    this.ctx.beginPath();
                    this.ctx.arc(
                        this.width / 2 + Math.random() * 10 - 5,
                        dragonY + 70 + i * 15 + Math.random() * 10,
                        8 - i,
                        0, Math.PI * 2
                    );
                    this.ctx.fill();
                }
            }
        }

        // Press space to start
        if (this.introPhase >= 1) {
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '10px "Press Start 2P", monospace';
            const alpha = 0.5 + Math.sin(this.introTimer * 0.005) * 0.5;
            this.ctx.globalAlpha = alpha;
            this.ctx.fillText('PRESS SPACE TO START', this.width / 2, this.height - 50);
            this.ctx.globalAlpha = 1;
        }
    }

    // Game functions
    startGame() {
        this.state = 'playing';
        this.currentLevel = 1;
        this.score = 0;

        // Initialize dragon
        this.dragon = new Dragon(this.width / 2 - 16, this.height - 100);

        // Initialize level
        this.initLevel(this.currentLevel);

        // Show HUD
        document.getElementById('hud').classList.remove('hidden');
        this.updateHUD();

        // Start music
        window.audioManager.startMusic(this.currentLevel);
    }

    initLevel(levelNum) {
        // Clear objects
        this.fireballs = [];
        this.enemies = [];
        this.enemyBullets = [];
        this.explosions = [];
        this.boss = null;

        // Create level
        this.level = new Level(levelNum, this.width, this.height);

        // Create enemy spawner
        this.enemySpawner = new EnemySpawner(this.width);
        this.enemySpawner.setLevel(levelNum);

        // Reset dragon position
        if (this.dragon) {
            this.dragon.reset(this.width / 2 - 16, this.height - 100);
        }

        // Update HUD
        document.getElementById('current-level').textContent = levelNum;
    }

    update(deltaTime) {
        // Update level background
        if (this.level) {
            this.level.update(deltaTime);
        }

        // Update dragon input
        if (this.dragon) {
            this.dragon.moving.up = this.keys['ArrowUp'];
            this.dragon.moving.down = this.keys['ArrowDown'];
            this.dragon.moving.left = this.keys['ArrowLeft'];
            this.dragon.moving.right = this.keys['ArrowRight'];

            // Shooting
            if (this.keys['Space']) {
                this.dragon.shoot(this.fireballs);
            }

            // Update dragon
            this.dragon.update(deltaTime, this.width, this.height);
        }

        // Update fireballs
        this.fireballs.forEach(fb => fb.update(deltaTime));
        this.fireballs = this.fireballs.filter(fb => fb.active);

        // Update enemies or boss
        if (this.state === 'playing') {
            // Spawn enemies
            const stillSpawning = this.enemySpawner.update(deltaTime, this.enemies);

            // Update enemies
            this.enemies.forEach(enemy => {
                enemy.update(deltaTime, this.width, this.height, this.dragon.x, this.dragon.y);
                enemy.shoot(this.enemyBullets, this.dragon.x + 16, this.dragon.y + 16);
            });
            this.enemies = this.enemies.filter(e => e.active);

            // Check for boss phase
            if (!stillSpawning && this.enemies.length === 0) {
                this.startBossWarning();
            }
        } else if (this.state === 'boss' && this.boss) {
            this.boss.update(deltaTime, this.dragon.x, this.dragon.y, this.enemyBullets, this.width);

            if (this.boss.isDefeated()) {
                this.onBossDefeated();
            }
        }

        // Update enemy bullets
        this.enemyBullets.forEach(b => b.update(deltaTime, this.height));
        this.enemyBullets = this.enemyBullets.filter(b => b.active);

        // Update explosions
        this.explosions.forEach(e => e.update(deltaTime));
        this.explosions = this.explosions.filter(e => e.active);

        // Collision detection
        this.checkCollisions();

        // Update HUD
        this.updateHUD();

        // Check game over
        if (this.dragon && !this.dragon.isAlive()) {
            this.gameOver();
        }
    }

    checkCollisions() {
        const dragonHitbox = this.dragon.getHitbox();

        // Fireballs vs Enemies
        this.fireballs.forEach(fb => {
            if (!fb.active) return;
            const fbHitbox = fb.getHitbox();

            // Check enemies
            this.enemies.forEach(enemy => {
                if (!enemy.active) return;
                if (this.checkHitboxCollision(fbHitbox, enemy.getHitbox())) {
                    fb.active = false;
                    if (enemy.takeDamage(1)) {
                        // Enemy destroyed
                        this.score += enemy.score;
                        this.explosions.push(new Explosion(
                            enemy.x + enemy.width / 2,
                            enemy.y + enemy.height / 2,
                            'small'
                        ));
                        window.audioManager.playExplosion();
                    }
                }
            });

            // Check boss
            if (this.boss && !this.boss.defeated) {
                if (this.checkHitboxCollision(fbHitbox, this.boss.getHitbox())) {
                    fb.active = false;
                    this.boss.takeDamage(1);
                }
            }
        });

        // Enemy bullets vs Dragon
        if (!this.dragon.invincible) {
            this.enemyBullets.forEach(bullet => {
                if (!bullet.active) return;
                if (this.checkHitboxCollision(bullet.getHitbox(), dragonHitbox)) {
                    bullet.active = false;
                    this.dragon.takeDamage(1);
                }
            });
        }

        // Enemies vs Dragon (collision damage)
        if (!this.dragon.invincible) {
            this.enemies.forEach(enemy => {
                if (!enemy.active) return;
                if (this.checkHitboxCollision(enemy.getHitbox(), dragonHitbox)) {
                    this.dragon.takeDamage(1);
                    enemy.takeDamage(enemy.health); // Destroy enemy on collision
                    this.explosions.push(new Explosion(
                        enemy.x + enemy.width / 2,
                        enemy.y + enemy.height / 2,
                        'small'
                    ));
                }
            });
        }

        // Boss vs Dragon
        if (this.boss && !this.boss.defeated && !this.dragon.invincible) {
            if (this.checkHitboxCollision(this.boss.getHitbox(), dragonHitbox)) {
                this.dragon.takeDamage(2); // Boss collision does more damage
            }
        }
    }

    checkHitboxCollision(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }

    draw() {
        // Draw level background
        if (this.level) {
            this.level.draw(this.ctx);
        }

        // Draw explosions (behind)
        this.explosions.forEach(e => e.draw(this.ctx));

        // Draw enemies
        this.enemies.forEach(enemy => enemy.draw(this.ctx, this.spriteRenderer));

        // Draw boss
        if (this.boss) {
            this.boss.draw(this.ctx, this.spriteRenderer);
        }

        // Draw enemy bullets
        this.enemyBullets.forEach(b => b.draw(this.ctx, this.spriteRenderer));

        // Draw fireballs
        this.fireballs.forEach(fb => fb.draw(this.ctx, this.spriteRenderer));

        // Draw dragon
        if (this.dragon) {
            this.dragon.draw(this.ctx, this.spriteRenderer);
        }

        // Draw boss warning
        if (this.state === 'bossWarning') {
            this.drawBossWarning();
        }
    }

    drawMenuBackground() {
        // Simple animated background for menu
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Animated stars
        const time = Date.now() * 0.001;
        for (let i = 0; i < 30; i++) {
            const x = (i * 73 + time * 20) % this.width;
            const y = (i * 137) % this.height;
            const brightness = 0.3 + Math.sin(time + i) * 0.3;
            this.ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
            this.ctx.fillRect(x, y, 2, 2);
        }
    }

    // Boss warning
    startBossWarning() {
        this.state = 'bossWarning';
        this.bossWarningTimer = 0;
        window.audioManager.playBossWarning();
    }

    updateBossWarning(deltaTime) {
        this.bossWarningTimer += deltaTime;

        if (this.bossWarningTimer > 2000) {
            this.startBoss();
        }

        // Still update background and dragon
        if (this.level) this.level.update(deltaTime);
        if (this.dragon) {
            this.dragon.moving.up = this.keys['ArrowUp'];
            this.dragon.moving.down = this.keys['ArrowDown'];
            this.dragon.moving.left = this.keys['ArrowLeft'];
            this.dragon.moving.right = this.keys['ArrowRight'];
            this.dragon.update(deltaTime, this.width, this.height);
        }
    }

    drawBossWarning() {
        // Flashing warning text
        const alpha = 0.5 + Math.sin(this.bossWarningTimer * 0.01) * 0.5;
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = '#ff0000';
        this.ctx.font = '20px "Press Start 2P", monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('WARNING', this.width / 2, this.height / 2 - 20);
        this.ctx.fillText('BOSS APPROACHING', this.width / 2, this.height / 2 + 20);
        this.ctx.restore();
    }

    startBoss() {
        this.state = 'boss';
        this.boss = new Boss(this.width, this.currentLevel);
        window.audioManager.startMusic('boss');
    }

    onBossDefeated() {
        this.score += this.boss.score;

        if (this.currentLevel >= this.maxLevels) {
            this.victory();
        } else {
            this.levelComplete();
        }
    }

    // Level management
    levelComplete() {
        this.state = 'levelComplete';
        this.levelCompleteTimer = 0;

        document.getElementById('level-score-value').textContent = this.score;
        document.getElementById('level-complete').classList.remove('hidden');

        window.audioManager.stopMusic();
        window.audioManager.playLevelComplete();
    }

    updateLevelComplete(deltaTime) {
        this.levelCompleteTimer += deltaTime;

        // Still draw background
        if (this.level) this.level.update(deltaTime);
    }

    nextLevel() {
        this.hideAllMenus();
        this.currentLevel++;
        this.initLevel(this.currentLevel);
        this.state = 'playing';
        window.audioManager.startMusic(this.currentLevel);
        window.audioManager.playMenuSelect();
    }

    // Game state management
    pauseGame() {
        this.state = 'paused';
        document.getElementById('pause-menu').classList.remove('hidden');
        window.audioManager.stopMusic();
    }

    resumeGame() {
        this.state = this.boss ? 'boss' : 'playing';
        this.hideAllMenus();
        window.audioManager.playMenuSelect();
        window.audioManager.startMusic(this.boss ? 'boss' : this.currentLevel);
    }

    restartGame() {
        this.hideAllMenus();
        this.startGame();
        window.audioManager.playMenuSelect();
    }

    quitToMenu() {
        window.audioManager.stopMusic();
        window.audioManager.playMenuSelect();
        this.showMenu();
    }

    gameOver() {
        this.state = 'gameOver';

        // Check high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
            document.getElementById('new-high-score').classList.remove('hidden');
            document.getElementById('high-score').textContent = this.highScore;
        } else {
            document.getElementById('new-high-score').classList.add('hidden');
        }

        document.getElementById('final-score-value').textContent = this.score;
        document.getElementById('game-over').classList.remove('hidden');

        window.audioManager.stopMusic();
        window.audioManager.playGameOver();
    }

    victory() {
        this.state = 'victory';

        // Check high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
            document.getElementById('victory-high-score').classList.remove('hidden');
            document.getElementById('high-score').textContent = this.highScore;
        } else {
            document.getElementById('victory-high-score').classList.add('hidden');
        }

        document.getElementById('victory-score-value').textContent = this.score;
        document.getElementById('victory-screen').classList.remove('hidden');

        window.audioManager.stopMusic();
        window.audioManager.playLevelComplete();
    }

    // HUD
    updateHUD() {
        if (!this.dragon) return;

        // Update health hearts
        const heartsContainer = document.getElementById('health-hearts');
        heartsContainer.innerHTML = '';
        for (let i = 0; i < this.dragon.maxHealth; i++) {
            const heart = document.createElement('div');
            heart.className = 'heart' + (i >= this.dragon.health ? ' empty' : '');
            heartsContainer.appendChild(heart);
        }

        // Update lives
        document.getElementById('lives-count').textContent = this.dragon.lives;

        // Update score
        document.getElementById('current-score').textContent = this.score;
    }

    // High score management
    loadHighScore() {
        const saved = localStorage.getItem('dragonsFlight_highScore');
        return saved ? parseInt(saved, 10) : 0;
    }

    saveHighScore() {
        localStorage.setItem('dragonsFlight_highScore', this.highScore.toString());
    }
}

// Start game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
