// Dragon's Flight - Enemy System

class Enemy {
    constructor(x, y, type = 'basic', level = 1) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.level = level;

        // Set properties based on type
        this.setProperties();

        this.active = true;
        this.shootTimer = Math.random() * this.shootCooldown;

        // Movement pattern
        this.movementTimer = 0;
        this.movementPhase = Math.random() * Math.PI * 2;

        // Flash when hit
        this.flashTimer = 0;
        this.isFlashing = false;
    }

    setProperties() {
        const levelMultiplier = 1 + (this.level - 1) * 0.2;

        switch (this.type) {
            case 'basic':
                this.width = 24;
                this.height = 24;
                this.speed = 1.5 * levelMultiplier;
                this.health = 1;
                this.maxHealth = 1;
                this.score = 100;
                this.shootCooldown = 2000 / levelMultiplier;
                this.bulletSpeed = 4;
                this.sprite = ENEMY_SPRITES.basic;
                break;

            case 'scout':
                this.width = 24;
                this.height = 24;
                this.speed = 3 * levelMultiplier;
                this.health = 1;
                this.maxHealth = 1;
                this.score = 150;
                this.shootCooldown = 1500 / levelMultiplier;
                this.bulletSpeed = 5;
                this.sprite = ENEMY_SPRITES.scout;
                break;

            case 'bomber':
                this.width = 24;
                this.height = 24;
                this.speed = 1 * levelMultiplier;
                this.health = 3;
                this.maxHealth = 3;
                this.score = 300;
                this.shootCooldown = 1000 / levelMultiplier;
                this.bulletSpeed = 3;
                this.sprite = ENEMY_SPRITES.bomber;
                break;

            default:
                this.width = 24;
                this.height = 24;
                this.speed = 1.5;
                this.health = 1;
                this.maxHealth = 1;
                this.score = 100;
                this.shootCooldown = 2000;
                this.bulletSpeed = 4;
                this.sprite = ENEMY_SPRITES.basic;
        }
    }

    update(deltaTime, canvasWidth, canvasHeight, dragonX, dragonY) {
        // Update movement
        this.movementTimer += deltaTime;

        // Different movement patterns based on type
        switch (this.type) {
            case 'basic':
                // Move down with slight sine wave
                this.y += this.speed;
                this.x += Math.sin(this.movementTimer * 0.003 + this.movementPhase) * 1;
                break;

            case 'scout':
                // Fast diagonal movement
                this.y += this.speed * 0.5;
                this.x += Math.sin(this.movementTimer * 0.005 + this.movementPhase) * 3;
                break;

            case 'bomber':
                // Slow descent, tracks player horizontally
                this.y += this.speed;
                const targetX = dragonX - this.width / 2;
                const diff = targetX - this.x;
                this.x += Math.sign(diff) * Math.min(Math.abs(diff) * 0.02, 1);
                break;
        }

        // Keep within bounds
        this.x = Math.max(0, Math.min(canvasWidth - this.width, this.x));

        // Update shoot timer
        this.shootTimer += deltaTime;

        // Update flash effect
        if (this.isFlashing) {
            this.flashTimer += deltaTime;
            if (this.flashTimer >= 100) {
                this.isFlashing = false;
                this.flashTimer = 0;
            }
        }

        // Deactivate if off screen
        if (this.y > canvasHeight + 50) {
            this.active = false;
        }
    }

    canShoot() {
        if (this.shootTimer >= this.shootCooldown) {
            this.shootTimer = 0;
            return true;
        }
        return false;
    }

    shoot(enemyBullets, dragonX, dragonY) {
        if (!this.canShoot()) return;

        // Calculate direction to dragon
        const dx = dragonX - (this.x + this.width / 2);
        const dy = dragonY - (this.y + this.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);

        let vx = 0;
        let vy = this.bulletSpeed;

        // Only aim if dragon is below enemy
        if (dy > 0 && distance > 0) {
            // Add some aiming for harder enemies
            if (this.type === 'bomber') {
                vx = (dx / distance) * this.bulletSpeed * 0.5;
                vy = (dy / distance) * this.bulletSpeed;
            } else if (this.type === 'scout') {
                vx = (dx / distance) * this.bulletSpeed * 0.3;
                vy = this.bulletSpeed;
            }
        }

        const bullet = new EnemyBullet(
            this.x + this.width / 2 - 2,
            this.y + this.height,
            vx,
            vy
        );
        enemyBullets.push(bullet);

        window.audioManager.playEnemyShoot();
    }

    takeDamage(amount = 1) {
        this.health -= amount;
        this.isFlashing = true;
        this.flashTimer = 0;

        if (this.health <= 0) {
            this.active = false;
            return true; // Destroyed
        }
        return false;
    }

    draw(ctx, spriteRenderer) {
        if (this.isFlashing) {
            // Draw white flash
            ctx.save();
            ctx.globalCompositeOperation = 'source-over';

            // Draw sprite
            spriteRenderer.drawSprite(this.sprite, this.x, this.y, 1);

            // Overlay white
            ctx.globalCompositeOperation = 'source-atop';
            ctx.fillStyle = 'white';
            ctx.fillRect(this.x, this.y, this.width, this.height);

            ctx.restore();
        } else {
            spriteRenderer.drawSprite(this.sprite, this.x, this.y, 1);
        }

        // Draw health bar for multi-health enemies
        if (this.maxHealth > 1 && this.health > 0) {
            const barWidth = this.width;
            const barHeight = 3;
            const barX = this.x;
            const barY = this.y - 6;

            ctx.fillStyle = '#333';
            ctx.fillRect(barX, barY, barWidth, barHeight);

            ctx.fillStyle = '#00ff00';
            ctx.fillRect(barX, barY, barWidth * (this.health / this.maxHealth), barHeight);
        }
    }

    getHitbox() {
        return {
            x: this.x + 2,
            y: this.y + 2,
            width: this.width - 4,
            height: this.height - 4
        };
    }
}

// Enemy bullet class
class EnemyBullet {
    constructor(x, y, vx = 0, vy = 4) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.width = 4;
        this.height = 12;
        this.active = true;
    }

    update(deltaTime, canvasHeight) {
        this.x += this.vx;
        this.y += this.vy;

        if (this.y > canvasHeight + 20 || this.y < -20 ||
            this.x < -20 || this.x > 500) {
            this.active = false;
        }
    }

    draw(ctx, spriteRenderer) {
        // Draw glow
        ctx.save();
        const gradient = ctx.createRadialGradient(
            this.x + 2, this.y + 6, 0,
            this.x + 2, this.y + 6, 10
        );
        gradient.addColorStop(0, 'rgba(0, 255, 0, 0.4)');
        gradient.addColorStop(1, 'rgba(0, 255, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x + 2, this.y + 6, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        spriteRenderer.drawSprite(ENEMY_LASER_SPRITE, this.x, this.y, 1);
    }

    getHitbox() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

// Enemy spawner class
class EnemySpawner {
    constructor(canvasWidth) {
        this.canvasWidth = canvasWidth;
        this.spawnTimer = 0;
        this.waveTimer = 0;
        this.currentWave = 0;
        this.enemiesSpawned = 0;
        this.totalEnemiesForLevel = 0;
    }

    setLevel(level) {
        this.level = level;
        this.currentWave = 0;
        this.enemiesSpawned = 0;

        // More enemies in later levels
        this.totalEnemiesForLevel = 15 + (level - 1) * 5;

        // Spawn rate increases with level
        this.baseSpawnRate = Math.max(800, 1500 - (level - 1) * 200);
    }

    update(deltaTime, enemies) {
        if (this.enemiesSpawned >= this.totalEnemiesForLevel) {
            return false; // Level complete (enemies-wise)
        }

        this.spawnTimer += deltaTime;

        // Dynamic spawn rate
        const spawnRate = this.baseSpawnRate - Math.min(this.currentWave * 50, 300);

        if (this.spawnTimer >= spawnRate) {
            this.spawnTimer = 0;
            this.spawnEnemy(enemies);
        }

        return true;
    }

    spawnEnemy(enemies) {
        // Determine enemy type based on level and randomness
        const rand = Math.random();
        let type = 'basic';

        if (this.level >= 2 && rand > 0.7) {
            type = 'scout';
        }
        if (this.level >= 3 && rand > 0.85) {
            type = 'bomber';
        }

        // Spawn position
        const margin = 30;
        const x = margin + Math.random() * (this.canvasWidth - margin * 2 - 24);
        const y = -30;

        const enemy = new Enemy(x, y, type, this.level);
        enemies.push(enemy);

        this.enemiesSpawned++;
        this.currentWave++;
    }

    isLevelComplete() {
        return this.enemiesSpawned >= this.totalEnemiesForLevel;
    }

    getProgress() {
        return this.enemiesSpawned / this.totalEnemiesForLevel;
    }

    reset() {
        this.spawnTimer = 0;
        this.waveTimer = 0;
        this.currentWave = 0;
        this.enemiesSpawned = 0;
    }
}

// Explosion effect class
class Explosion {
    constructor(x, y, size = 'small') {
        this.x = x;
        this.y = y;
        this.size = size;
        this.frame = 0;
        this.maxFrames = size === 'large' ? 20 : 12;
        this.frameTimer = 0;
        this.frameSpeed = 30;
        this.active = true;

        this.maxRadius = size === 'large' ? 40 : 20;
        this.particles = [];

        // Create particles
        const particleCount = size === 'large' ? 12 : 6;
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 / particleCount) * i;
            this.particles.push({
                x: 0,
                y: 0,
                vx: Math.cos(angle) * (2 + Math.random() * 2),
                vy: Math.sin(angle) * (2 + Math.random() * 2),
                size: 3 + Math.random() * 3
            });
        }
    }

    update(deltaTime) {
        this.frameTimer += deltaTime;

        if (this.frameTimer >= this.frameSpeed) {
            this.frameTimer = 0;
            this.frame++;

            if (this.frame >= this.maxFrames) {
                this.active = false;
            }
        }

        // Update particles
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.95;
            p.vy *= 0.95;
        });
    }

    draw(ctx) {
        const progress = this.frame / this.maxFrames;
        const alpha = 1 - progress;
        const radius = this.maxRadius * (0.5 + progress * 0.5);

        ctx.save();

        // Draw explosion circle
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, radius
        );
        gradient.addColorStop(0, `rgba(255, 255, 200, ${alpha})`);
        gradient.addColorStop(0.3, `rgba(255, 150, 50, ${alpha * 0.8})`);
        gradient.addColorStop(0.6, `rgba(255, 50, 0, ${alpha * 0.5})`);
        gradient.addColorStop(1, `rgba(100, 0, 0, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw particles
        this.particles.forEach(p => {
            ctx.fillStyle = `rgba(255, ${150 + Math.random() * 100}, 0, ${alpha})`;
            ctx.beginPath();
            ctx.arc(this.x + p.x, this.y + p.y, p.size * (1 - progress), 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore();
    }
}

// Export classes
window.Enemy = Enemy;
window.EnemyBullet = EnemyBullet;
window.EnemySpawner = EnemySpawner;
window.Explosion = Explosion;
