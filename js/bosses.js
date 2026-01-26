// Dragon's Flight - Boss System

class Boss {
    constructor(canvasWidth, level) {
        this.level = level;
        this.canvasWidth = canvasWidth;

        // Position
        this.scale = 2; // Render scale
        this.width = 48 * this.scale;  // 96 pixels
        this.height = 48 * this.scale; // 96 pixels
        this.x = canvasWidth / 2 - this.width / 2;
        this.y = -this.height;
        this.targetY = 50;

        // State
        this.active = true;
        this.entering = true;
        this.defeated = false;
        this.defeatTimer = 0;

        // Set properties based on level
        this.setProperties();

        // Movement
        this.movementTimer = 0;
        this.attackTimer = 0;
        this.currentPattern = 0;

        // Flash effect
        this.isFlashing = false;
        this.flashTimer = 0;

        // Get sprite
        this.sprite = BOSS_SPRITES[`boss${level}`];
    }

    setProperties() {
        // Health scales with level (10-20 hits)
        this.maxHealth = 10 + (this.level - 1) * 3;
        this.health = this.maxHealth;

        // Score
        this.score = 1000 * this.level;

        // Attack cooldown
        this.attackCooldown = Math.max(800, 1500 - (this.level - 1) * 200);

        // Movement speed
        this.speed = 1 + this.level * 0.3;

        // Pattern timings
        this.patternDuration = 5000;
        this.patternTimer = 0;

        // Define attack patterns per boss
        this.patterns = this.getPatterns();
    }

    getPatterns() {
        switch (this.level) {
            case 1: // Grassland Guardian - Simple patterns
                return [
                    'sideToSide',
                    'spreadShot',
                    'sideToSide',
                    'tripleShot'
                ];

            case 2: // Beach Bomber - Faster movement
                return [
                    'zigzag',
                    'spreadShot',
                    'charge',
                    'circleShot'
                ];

            case 3: // Desert Destroyer - Aggressive
                return [
                    'trackPlayer',
                    'rapidFire',
                    'zigzag',
                    'spreadShot'
                ];

            case 4: // Space Emperor - All patterns
                return [
                    'trackPlayer',
                    'circleShot',
                    'charge',
                    'rapidFire',
                    'spreadShot'
                ];

            default:
                return ['sideToSide', 'spreadShot'];
        }
    }

    update(deltaTime, dragonX, dragonY, enemyBullets, canvasWidth) {
        if (this.defeated) {
            this.defeatTimer += deltaTime;
            return;
        }

        // Enter screen
        if (this.entering) {
            this.y += 1;
            if (this.y >= this.targetY) {
                this.y = this.targetY;
                this.entering = false;
            }
            return;
        }

        // Update timers
        this.movementTimer += deltaTime;
        this.attackTimer += deltaTime;
        this.patternTimer += deltaTime;

        // Change pattern periodically
        if (this.patternTimer >= this.patternDuration) {
            this.patternTimer = 0;
            this.currentPattern = (this.currentPattern + 1) % this.patterns.length;
        }

        // Execute current pattern
        this.executePattern(deltaTime, dragonX, dragonY, enemyBullets, canvasWidth);

        // Update flash
        if (this.isFlashing) {
            this.flashTimer += deltaTime;
            if (this.flashTimer >= 100) {
                this.isFlashing = false;
                this.flashTimer = 0;
            }
        }
    }

    executePattern(deltaTime, dragonX, dragonY, enemyBullets, canvasWidth) {
        const pattern = this.patterns[this.currentPattern];

        switch (pattern) {
            case 'sideToSide':
                this.x += Math.sin(this.movementTimer * 0.002) * this.speed * 2;
                if (this.attackTimer >= this.attackCooldown) {
                    this.shootStraight(enemyBullets);
                    this.attackTimer = 0;
                }
                break;

            case 'zigzag':
                this.x += Math.sin(this.movementTimer * 0.004) * this.speed * 3;
                this.y = this.targetY + Math.sin(this.movementTimer * 0.002) * 20;
                if (this.attackTimer >= this.attackCooldown) {
                    this.shootStraight(enemyBullets);
                    this.attackTimer = 0;
                }
                break;

            case 'trackPlayer':
                const targetX = dragonX - this.width / 2;
                const diff = targetX - this.x;
                this.x += Math.sign(diff) * Math.min(Math.abs(diff) * 0.03, this.speed * 2);
                if (this.attackTimer >= this.attackCooldown * 0.8) {
                    this.shootAtPlayer(enemyBullets, dragonX, dragonY);
                    this.attackTimer = 0;
                }
                break;

            case 'charge':
                // Periodic charge towards player
                const chargePhase = (this.movementTimer % 3000) / 3000;
                if (chargePhase < 0.3) {
                    // Wind up
                    this.y = this.targetY - Math.sin(chargePhase * Math.PI / 0.3) * 10;
                } else if (chargePhase < 0.5) {
                    // Charge
                    this.y = this.targetY + (chargePhase - 0.3) * 200;
                } else {
                    // Return
                    this.y = this.targetY + (1 - chargePhase) * 80;
                }
                this.x += Math.sin(this.movementTimer * 0.003) * this.speed;
                if (this.attackTimer >= this.attackCooldown) {
                    this.shootStraight(enemyBullets);
                    this.attackTimer = 0;
                }
                break;

            case 'spreadShot':
                this.x += Math.sin(this.movementTimer * 0.002) * this.speed;
                if (this.attackTimer >= this.attackCooldown * 1.5) {
                    this.shootSpread(enemyBullets, 5);
                    this.attackTimer = 0;
                }
                break;

            case 'tripleShot':
                this.x += Math.sin(this.movementTimer * 0.002) * this.speed;
                if (this.attackTimer >= this.attackCooldown) {
                    this.shootSpread(enemyBullets, 3);
                    this.attackTimer = 0;
                }
                break;

            case 'circleShot':
                this.x = canvasWidth / 2 - this.width / 2 + Math.sin(this.movementTimer * 0.002) * 100;
                if (this.attackTimer >= this.attackCooldown * 2) {
                    this.shootCircle(enemyBullets, 8);
                    this.attackTimer = 0;
                }
                break;

            case 'rapidFire':
                this.x += Math.sin(this.movementTimer * 0.003) * this.speed * 2;
                if (this.attackTimer >= this.attackCooldown * 0.4) {
                    this.shootAtPlayer(enemyBullets, dragonX, dragonY);
                    this.attackTimer = 0;
                }
                break;
        }

        // Keep within bounds
        this.x = Math.max(10, Math.min(canvasWidth - this.width - 10, this.x));
        this.y = Math.max(35, Math.min(180, this.y));
    }

    shootStraight(enemyBullets) {
        const bullet = new EnemyBullet(
            this.x + this.width / 2 - 2,
            this.y + this.height,
            0,
            5
        );
        enemyBullets.push(bullet);
        window.audioManager.playEnemyShoot();
    }

    shootAtPlayer(enemyBullets, dragonX, dragonY) {
        const dx = dragonX - (this.x + this.width / 2);
        const dy = dragonY - (this.y + this.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            const speed = 5;
            const bullet = new EnemyBullet(
                this.x + this.width / 2 - 2,
                this.y + this.height,
                (dx / distance) * speed,
                (dy / distance) * speed
            );
            enemyBullets.push(bullet);
            window.audioManager.playEnemyShoot();
        }
    }

    shootSpread(enemyBullets, count) {
        const spreadAngle = Math.PI / 4; // 45 degrees total spread
        const startAngle = Math.PI / 2 - spreadAngle / 2;
        const angleStep = spreadAngle / (count - 1);

        for (let i = 0; i < count; i++) {
            const angle = startAngle + angleStep * i;
            const speed = 4;
            const bullet = new EnemyBullet(
                this.x + this.width / 2 - 2,
                this.y + this.height,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed
            );
            enemyBullets.push(bullet);
        }
        window.audioManager.playEnemyShoot();
    }

    shootCircle(enemyBullets, count) {
        const angleStep = (Math.PI * 2) / count;

        for (let i = 0; i < count; i++) {
            const angle = angleStep * i;
            const speed = 3;
            const bullet = new EnemyBullet(
                this.x + this.width / 2 - 2,
                this.y + this.height / 2,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed
            );
            enemyBullets.push(bullet);
        }
        window.audioManager.playEnemyShoot();
    }

    takeDamage(amount = 1) {
        if (this.defeated || this.entering) return false;

        this.health -= amount;
        this.isFlashing = true;
        this.flashTimer = 0;

        if (this.health <= 0) {
            this.defeated = true;
            this.defeatTimer = 0;
            window.audioManager.playBossExplosion();
            return true;
        }
        return false;
    }

    draw(ctx, spriteRenderer) {
        if (this.defeated) {
            // Draw defeat explosion animation
            this.drawDefeatAnimation(ctx);
            return;
        }

        // Draw boss
        if (this.isFlashing) {
            ctx.save();
            spriteRenderer.drawSprite(this.sprite, this.x, this.y, this.scale);
            ctx.globalCompositeOperation = 'source-atop';
            ctx.fillStyle = 'white';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.restore();
        } else {
            spriteRenderer.drawSprite(this.sprite, this.x, this.y, this.scale);
        }

        // Draw health bar
        if (!this.entering) {
            const barWidth = 200;
            const barHeight = 8;
            const barX = (this.canvasWidth - barWidth) / 2;
            const barY = 20;

            // Background
            ctx.fillStyle = '#333';
            ctx.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);

            // Health
            const healthPercent = this.health / this.maxHealth;
            let healthColor = '#00ff00';
            if (healthPercent < 0.3) healthColor = '#ff0000';
            else if (healthPercent < 0.6) healthColor = '#ffff00';

            ctx.fillStyle = healthColor;
            ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

            // Border
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.strokeRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);

            // Boss name
            ctx.fillStyle = '#fff';
            ctx.font = '10px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(this.getBossName(), this.canvasWidth / 2, barY + barHeight + 14);
        }
    }

    drawDefeatAnimation(ctx) {
        // Multiple explosions during defeat
        const numExplosions = Math.floor(this.defeatTimer / 200);

        for (let i = 0; i < Math.min(numExplosions, 10); i++) {
            const offsetX = (Math.sin(i * 1234.5) * 0.5 + 0.5) * this.width;
            const offsetY = (Math.cos(i * 5678.9) * 0.5 + 0.5) * this.height;
            const size = 15 + Math.random() * 10;
            const alpha = Math.max(0, 1 - (this.defeatTimer - i * 200) / 500);

            if (alpha > 0) {
                ctx.save();
                ctx.globalAlpha = alpha;

                const gradient = ctx.createRadialGradient(
                    this.x + offsetX, this.y + offsetY, 0,
                    this.x + offsetX, this.y + offsetY, size
                );
                gradient.addColorStop(0, '#fff');
                gradient.addColorStop(0.3, '#ff0');
                gradient.addColorStop(0.6, '#f00');
                gradient.addColorStop(1, 'transparent');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(this.x + offsetX, this.y + offsetY, size, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
            }
        }
    }

    getBossName() {
        const names = [
            'GRASSLAND GUARDIAN',
            'BEACH BOMBER',
            'DESERT DESTROYER',
            'SPACE EMPEROR'
        ];
        return names[this.level - 1] || 'BOSS';
    }

    getHitbox() {
        return {
            x: this.x + 8,
            y: this.y + 8,
            width: this.width - 16,
            height: this.height - 16
        };
    }

    isDefeated() {
        return this.defeated && this.defeatTimer > 2000;
    }
}

// Export
window.Boss = Boss;
