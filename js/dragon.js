// Dragon's Flight - Dragon Hero Class

class Dragon {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.speed = 5;

        // Health and lives
        this.maxHealth = 5;
        this.health = this.maxHealth;
        this.lives = 3;

        // Animation
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.animationSpeed = 8; // frames per animation update
        this.frames = ['frame1', 'frame2', 'frame3', 'frame2'];

        // Movement state
        this.moving = {
            up: false,
            down: false,
            left: false,
            right: false
        };

        // Shooting
        this.canShoot = true;
        this.shootCooldown = 200; // ms
        this.lastShootTime = 0;

        // Invincibility after taking damage
        this.invincible = false;
        this.invincibleTimer = 0;
        this.invincibleDuration = 2000; // 2 seconds
        this.blinkTimer = 0;
        this.visible = true;

        // Head bob for animation
        this.headOffset = 0;
        this.headBobTimer = 0;

        // Tail wag
        this.tailOffset = 0;
        this.tailWagTimer = 0;
    }

    update(deltaTime, canvasWidth, canvasHeight) {
        // Update animation
        this.animationTimer++;
        if (this.animationTimer >= this.animationSpeed) {
            this.animationTimer = 0;
            this.animationFrame = (this.animationFrame + 1) % this.frames.length;
        }

        // Head bob animation
        this.headBobTimer += deltaTime;
        this.headOffset = Math.sin(this.headBobTimer * 0.005) * 2;

        // Tail wag animation
        this.tailWagTimer += deltaTime;
        this.tailOffset = Math.sin(this.tailWagTimer * 0.008) * 3;

        // Movement
        if (this.moving.up && this.y > 60) {
            this.y -= this.speed;
        }
        if (this.moving.down && this.y < canvasHeight - this.height - 10) {
            this.y += this.speed;
        }
        if (this.moving.left && this.x > 10) {
            this.x -= this.speed;
        }
        if (this.moving.right && this.x < canvasWidth - this.width - 10) {
            this.x += this.speed;
        }

        // Update invincibility
        if (this.invincible) {
            this.invincibleTimer += deltaTime;
            this.blinkTimer += deltaTime;

            // Blink effect
            if (this.blinkTimer >= 100) {
                this.blinkTimer = 0;
                this.visible = !this.visible;
            }

            // End invincibility
            if (this.invincibleTimer >= this.invincibleDuration) {
                this.invincible = false;
                this.visible = true;
            }
        }
    }

    draw(ctx, spriteRenderer) {
        if (!this.visible) return;

        const sprite = DRAGON_SPRITES[this.frames[this.animationFrame]];

        // Draw dragon with slight head bob effect
        // For simplicity, we draw the whole sprite - in a more complex version,
        // we could separate head/body/tail for individual animation
        spriteRenderer.drawSprite(sprite, this.x, this.y + this.headOffset, 1);
    }

    shoot(fireballs) {
        const now = Date.now();
        if (now - this.lastShootTime >= this.shootCooldown) {
            this.lastShootTime = now;

            // Create fireball at dragon's position (from mouth area)
            const fireball = new Fireball(
                this.x + this.width / 2 - 4,
                this.y - 8
            );
            fireballs.push(fireball);

            window.audioManager.playShoot();
            return true;
        }
        return false;
    }

    takeDamage(amount = 1) {
        if (this.invincible) return false;

        this.health -= amount;
        window.audioManager.playHit();

        if (this.health <= 0) {
            this.lives--;
            if (this.lives > 0) {
                // Respawn with full health
                this.health = this.maxHealth;
                this.invincible = true;
                this.invincibleTimer = 0;
                window.audioManager.playDeath();
            }
            return true; // Indicates a life was lost
        } else {
            // Brief invincibility after damage
            this.invincible = true;
            this.invincibleTimer = 0;
        }
        return false;
    }

    getHitbox() {
        // Smaller hitbox than sprite for fair gameplay
        return {
            x: this.x + 8,
            y: this.y + 8,
            width: this.width - 16,
            height: this.height - 16
        };
    }

    reset(x, y) {
        this.x = x;
        this.y = y;
        this.health = this.maxHealth;
        this.invincible = true;
        this.invincibleTimer = 0;
        this.visible = true;
    }

    fullReset(x, y) {
        this.reset(x, y);
        this.lives = 3;
        this.invincible = false;
    }

    isAlive() {
        return this.lives > 0;
    }
}

// Fireball projectile class
class Fireball {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 8;
        this.height = 8;
        this.speed = 8;
        this.active = true;

        // Animation
        this.animationTimer = 0;
        this.rotation = 0;
    }

    update(deltaTime) {
        this.y -= this.speed;
        this.animationTimer += deltaTime;
        this.rotation += 0.2;

        // Deactivate if off screen
        if (this.y < -this.height) {
            this.active = false;
        }
    }

    draw(ctx, spriteRenderer) {
        // Add glow effect
        ctx.save();

        // Draw glow
        const gradient = ctx.createRadialGradient(
            this.x + 4, this.y + 4, 0,
            this.x + 4, this.y + 4, 12
        );
        gradient.addColorStop(0, 'rgba(255, 200, 50, 0.5)');
        gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x + 4, this.y + 4, 12, 0, Math.PI * 2);
        ctx.fill();

        // Draw sprite
        spriteRenderer.drawSprite(FIREBALL_SPRITE, this.x, this.y, 1);

        ctx.restore();
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

// Export classes
window.Dragon = Dragon;
window.Fireball = Fireball;
