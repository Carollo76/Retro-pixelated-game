// Dragon's Flight - Level System and Backgrounds

class Level {
    constructor(levelNumber, canvasWidth, canvasHeight) {
        this.levelNumber = levelNumber;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        // Scrolling background
        this.scrollY = 0;
        this.scrollSpeed = 1;

        // Background elements
        this.backgroundElements = [];
        this.parallaxElements = [];

        // Initialize background based on level
        this.initBackground();
    }

    initBackground() {
        switch (this.levelNumber) {
            case 1:
                this.initGrassland();
                break;
            case 2:
                this.initBeach();
                break;
            case 3:
                this.initDesert();
                break;
            case 4:
                this.initSpace();
                break;
        }
    }

    initGrassland() {
        this.skyColor = '#87CEEB';
        this.groundColor = '#228B22';

        // Generate grass patches
        for (let i = 0; i < 30; i++) {
            this.backgroundElements.push({
                type: 'grass',
                x: Math.random() * this.canvasWidth,
                y: Math.random() * this.canvasHeight * 2,
                width: 10 + Math.random() * 20,
                height: 15 + Math.random() * 10,
                color: Math.random() > 0.5 ? '#32CD32' : '#228B22'
            });
        }

        // Generate flowers
        for (let i = 0; i < 15; i++) {
            this.backgroundElements.push({
                type: 'flower',
                x: Math.random() * this.canvasWidth,
                y: Math.random() * this.canvasHeight * 2,
                size: 4 + Math.random() * 4,
                color: ['#FF69B4', '#FFD700', '#FF4500', '#9370DB'][Math.floor(Math.random() * 4)]
            });
        }

        // Clouds (parallax)
        for (let i = 0; i < 8; i++) {
            this.parallaxElements.push({
                type: 'cloud',
                x: Math.random() * this.canvasWidth,
                y: Math.random() * this.canvasHeight,
                width: 40 + Math.random() * 60,
                speed: 0.3 + Math.random() * 0.3
            });
        }
    }

    initBeach() {
        this.skyColor = '#87CEEB';
        this.groundColor = '#F4A460';

        // Sand texture
        for (let i = 0; i < 50; i++) {
            this.backgroundElements.push({
                type: 'sandDot',
                x: Math.random() * this.canvasWidth,
                y: Math.random() * this.canvasHeight * 2,
                size: 1 + Math.random() * 2,
                color: Math.random() > 0.5 ? '#DEB887' : '#D2B48C'
            });
        }

        // Waves (water)
        for (let i = 0; i < 10; i++) {
            this.backgroundElements.push({
                type: 'wave',
                x: 0,
                y: i * 150 + Math.random() * 50,
                width: this.canvasWidth,
                phase: Math.random() * Math.PI * 2
            });
        }

        // Seashells
        for (let i = 0; i < 8; i++) {
            this.backgroundElements.push({
                type: 'shell',
                x: Math.random() * this.canvasWidth,
                y: Math.random() * this.canvasHeight * 2,
                size: 5 + Math.random() * 5,
                rotation: Math.random() * Math.PI * 2
            });
        }

        // Clouds
        for (let i = 0; i < 6; i++) {
            this.parallaxElements.push({
                type: 'cloud',
                x: Math.random() * this.canvasWidth,
                y: Math.random() * this.canvasHeight * 0.3,
                width: 50 + Math.random() * 50,
                speed: 0.2 + Math.random() * 0.2
            });
        }
    }

    initDesert() {
        this.skyColor = '#FFD89B';
        this.groundColor = '#DEB887';

        // Sand dunes
        for (let i = 0; i < 8; i++) {
            this.backgroundElements.push({
                type: 'dune',
                x: Math.random() * this.canvasWidth,
                y: i * 200,
                width: 100 + Math.random() * 150,
                height: 30 + Math.random() * 20
            });
        }

        // Cacti
        for (let i = 0; i < 6; i++) {
            this.backgroundElements.push({
                type: 'cactus',
                x: Math.random() * this.canvasWidth,
                y: Math.random() * this.canvasHeight * 2,
                height: 20 + Math.random() * 30
            });
        }

        // Desert rocks
        for (let i = 0; i < 10; i++) {
            this.backgroundElements.push({
                type: 'rock',
                x: Math.random() * this.canvasWidth,
                y: Math.random() * this.canvasHeight * 2,
                size: 8 + Math.random() * 12
            });
        }

        // Heat shimmer (parallax)
        for (let i = 0; i < 3; i++) {
            this.parallaxElements.push({
                type: 'shimmer',
                y: 100 + i * 200,
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    initSpace() {
        this.skyColor = '#0a0a1f';
        this.groundColor = '#0a0a1f';

        // Stars (multiple layers)
        for (let i = 0; i < 100; i++) {
            this.backgroundElements.push({
                type: 'star',
                x: Math.random() * this.canvasWidth,
                y: Math.random() * this.canvasHeight * 2,
                size: 1 + Math.random() * 2,
                brightness: 0.5 + Math.random() * 0.5,
                twinkleSpeed: 0.002 + Math.random() * 0.003
            });
        }

        // Distant galaxies
        for (let i = 0; i < 3; i++) {
            this.backgroundElements.push({
                type: 'galaxy',
                x: Math.random() * this.canvasWidth,
                y: Math.random() * this.canvasHeight * 2,
                size: 30 + Math.random() * 50,
                rotation: Math.random() * Math.PI * 2,
                color: ['#4a0080', '#000080', '#800040'][i]
            });
        }

        // Nebula clouds (parallax)
        for (let i = 0; i < 4; i++) {
            this.parallaxElements.push({
                type: 'nebula',
                x: Math.random() * this.canvasWidth,
                y: Math.random() * this.canvasHeight,
                width: 100 + Math.random() * 100,
                height: 80 + Math.random() * 80,
                color: ['rgba(100, 0, 150, 0.2)', 'rgba(0, 100, 150, 0.2)', 'rgba(150, 50, 100, 0.2)'][i % 3],
                speed: 0.1 + Math.random() * 0.1
            });
        }

        // Shooting stars
        for (let i = 0; i < 2; i++) {
            this.parallaxElements.push({
                type: 'shootingStar',
                x: Math.random() * this.canvasWidth,
                y: Math.random() * this.canvasHeight,
                speed: 3 + Math.random() * 2,
                length: 20 + Math.random() * 30,
                active: false,
                timer: Math.random() * 5000
            });
        }
    }

    update(deltaTime) {
        // Scroll background
        this.scrollY += this.scrollSpeed;

        // Update parallax elements
        this.parallaxElements.forEach(elem => {
            if (elem.type === 'cloud') {
                elem.x -= elem.speed;
                if (elem.x + elem.width < 0) {
                    elem.x = this.canvasWidth;
                }
            } else if (elem.type === 'nebula') {
                elem.y += elem.speed;
                if (elem.y > this.canvasHeight) {
                    elem.y = -elem.height;
                }
            } else if (elem.type === 'shootingStar') {
                elem.timer += deltaTime;
                if (!elem.active && elem.timer > 5000 + Math.random() * 10000) {
                    elem.active = true;
                    elem.x = Math.random() * this.canvasWidth;
                    elem.y = -20;
                    elem.timer = 0;
                }
                if (elem.active) {
                    elem.x += elem.speed;
                    elem.y += elem.speed * 1.5;
                    if (elem.y > this.canvasHeight) {
                        elem.active = false;
                    }
                }
            } else if (elem.type === 'shimmer') {
                elem.phase += deltaTime * 0.005;
            }
        });

        // Update wave phases
        this.backgroundElements.forEach(elem => {
            if (elem.type === 'wave') {
                elem.phase += deltaTime * 0.002;
            } else if (elem.type === 'star') {
                elem.phase = (elem.phase || 0) + deltaTime * elem.twinkleSpeed;
            }
        });
    }

    draw(ctx) {
        // Draw sky/background color
        ctx.fillStyle = this.skyColor;
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

        // Draw level-specific background
        switch (this.levelNumber) {
            case 1:
                this.drawGrassland(ctx);
                break;
            case 2:
                this.drawBeach(ctx);
                break;
            case 3:
                this.drawDesert(ctx);
                break;
            case 4:
                this.drawSpace(ctx);
                break;
        }
    }

    drawGrassland(ctx) {
        // Draw ground
        ctx.fillStyle = this.groundColor;
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

        // Draw clouds (parallax, behind)
        this.parallaxElements.forEach(elem => {
            if (elem.type === 'cloud') {
                this.drawCloud(ctx, elem.x, elem.y, elem.width);
            }
        });

        // Draw grass and flowers
        this.backgroundElements.forEach(elem => {
            const y = (elem.y + this.scrollY) % (this.canvasHeight * 2) - this.canvasHeight * 0.5;

            if (elem.type === 'grass') {
                ctx.fillStyle = elem.color;
                // Draw grass blades
                for (let i = 0; i < 3; i++) {
                    ctx.beginPath();
                    ctx.moveTo(elem.x + i * 5, y + elem.height);
                    ctx.lineTo(elem.x + i * 5 + 2, y);
                    ctx.lineTo(elem.x + i * 5 + 4, y + elem.height);
                    ctx.fill();
                }
            } else if (elem.type === 'flower') {
                // Stem
                ctx.fillStyle = '#228B22';
                ctx.fillRect(elem.x + elem.size / 2 - 1, y, 2, elem.size * 2);

                // Petals
                ctx.fillStyle = elem.color;
                ctx.beginPath();
                ctx.arc(elem.x + elem.size / 2, y, elem.size, 0, Math.PI * 2);
                ctx.fill();

                // Center
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.arc(elem.x + elem.size / 2, y, elem.size / 3, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }

    drawBeach(ctx) {
        // Draw sand base
        ctx.fillStyle = this.groundColor;
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

        // Draw water sections
        this.backgroundElements.forEach(elem => {
            const y = (elem.y + this.scrollY * 0.5) % (this.canvasHeight * 2) - 200;

            if (elem.type === 'wave') {
                // Water
                ctx.fillStyle = 'rgba(0, 150, 200, 0.3)';
                ctx.beginPath();
                ctx.moveTo(0, y + 50);
                for (let x = 0; x <= this.canvasWidth; x += 20) {
                    const waveY = y + Math.sin(x * 0.02 + elem.phase) * 10 + 50;
                    ctx.lineTo(x, waveY);
                }
                ctx.lineTo(this.canvasWidth, y + 100);
                ctx.lineTo(0, y + 100);
                ctx.fill();

                // Foam
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.beginPath();
                for (let x = 0; x <= this.canvasWidth; x += 10) {
                    const foamY = y + Math.sin(x * 0.03 + elem.phase * 1.5) * 5 + 45;
                    ctx.fillRect(x, foamY, 6, 3);
                }
            } else if (elem.type === 'shell') {
                ctx.fillStyle = '#FFF8DC';
                ctx.save();
                ctx.translate(elem.x, y);
                ctx.rotate(elem.rotation);
                ctx.beginPath();
                ctx.arc(0, 0, elem.size, 0, Math.PI);
                ctx.fill();
                ctx.restore();
            } else if (elem.type === 'sandDot') {
                ctx.fillStyle = elem.color;
                ctx.fillRect(elem.x, y, elem.size, elem.size);
            }
        });

        // Draw clouds
        this.parallaxElements.forEach(elem => {
            if (elem.type === 'cloud') {
                this.drawCloud(ctx, elem.x, elem.y, elem.width);
            }
        });
    }

    drawDesert(ctx) {
        // Gradient sky
        const gradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
        gradient.addColorStop(0, '#FFD89B');
        gradient.addColorStop(0.5, '#FFCC66');
        gradient.addColorStop(1, '#DEB887');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

        // Draw dunes
        this.backgroundElements.forEach(elem => {
            const y = (elem.y + this.scrollY * 0.3) % (this.canvasHeight * 2);

            if (elem.type === 'dune') {
                ctx.fillStyle = '#D2B48C';
                ctx.beginPath();
                ctx.moveTo(elem.x - elem.width / 2, y + elem.height);
                ctx.quadraticCurveTo(elem.x, y - elem.height, elem.x + elem.width / 2, y + elem.height);
                ctx.fill();
            } else if (elem.type === 'cactus') {
                // Main stem
                ctx.fillStyle = '#228B22';
                ctx.fillRect(elem.x, y, 8, elem.height);

                // Arms
                ctx.fillRect(elem.x - 8, y + elem.height * 0.3, 8, 6);
                ctx.fillRect(elem.x - 8, y + elem.height * 0.3 - 10, 6, 10);

                ctx.fillRect(elem.x + 8, y + elem.height * 0.5, 8, 6);
                ctx.fillRect(elem.x + 10, y + elem.height * 0.5 - 8, 6, 8);
            } else if (elem.type === 'rock') {
                ctx.fillStyle = '#8B7355';
                ctx.beginPath();
                ctx.arc(elem.x, y, elem.size, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#6B5344';
                ctx.beginPath();
                ctx.arc(elem.x - 2, y - 2, elem.size * 0.7, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        // Heat shimmer effect
        this.parallaxElements.forEach(elem => {
            if (elem.type === 'shimmer') {
                ctx.save();
                ctx.globalAlpha = 0.1;
                ctx.fillStyle = '#fff';
                for (let x = 0; x < this.canvasWidth; x += 30) {
                    const shimmerY = elem.y + Math.sin(x * 0.1 + elem.phase) * 5;
                    ctx.fillRect(x, shimmerY, 20, 2);
                }
                ctx.restore();
            }
        });
    }

    drawSpace(ctx) {
        // Deep space background
        ctx.fillStyle = this.skyColor;
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

        // Draw nebulae (parallax)
        this.parallaxElements.forEach(elem => {
            if (elem.type === 'nebula') {
                const gradient = ctx.createRadialGradient(
                    elem.x + elem.width / 2, elem.y + elem.height / 2, 0,
                    elem.x + elem.width / 2, elem.y + elem.height / 2, elem.width / 2
                );
                gradient.addColorStop(0, elem.color);
                gradient.addColorStop(1, 'transparent');
                ctx.fillStyle = gradient;
                ctx.fillRect(elem.x, elem.y, elem.width, elem.height);
            }
        });

        // Draw galaxies
        this.backgroundElements.forEach(elem => {
            const y = (elem.y + this.scrollY * 0.2) % (this.canvasHeight * 2) - 200;

            if (elem.type === 'galaxy') {
                ctx.save();
                ctx.translate(elem.x, y);
                ctx.rotate(elem.rotation);

                const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, elem.size);
                gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
                gradient.addColorStop(0.3, elem.color);
                gradient.addColorStop(1, 'transparent');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.ellipse(0, 0, elem.size, elem.size * 0.4, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
            } else if (elem.type === 'star') {
                const brightness = elem.brightness * (0.7 + Math.sin(elem.phase || 0) * 0.3);
                ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
                ctx.beginPath();
                ctx.arc(elem.x, y, elem.size, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        // Draw shooting stars
        this.parallaxElements.forEach(elem => {
            if (elem.type === 'shootingStar' && elem.active) {
                ctx.save();
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(elem.x, elem.y);
                ctx.lineTo(elem.x - elem.length, elem.y - elem.length * 1.5);
                ctx.stroke();

                // Glow
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(elem.x, elem.y);
                ctx.lineTo(elem.x - elem.length * 0.5, elem.y - elem.length * 0.75);
                ctx.stroke();

                ctx.restore();
            }
        });
    }

    drawCloud(ctx, x, y, width) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';

        // Main cloud body
        ctx.beginPath();
        ctx.arc(x + width * 0.3, y + 15, 15, 0, Math.PI * 2);
        ctx.arc(x + width * 0.5, y + 10, 20, 0, Math.PI * 2);
        ctx.arc(x + width * 0.7, y + 15, 15, 0, Math.PI * 2);
        ctx.fill();
    }

    getLevelName() {
        const names = ['Grassland', 'Beach', 'Desert', 'Space'];
        return names[this.levelNumber - 1] || 'Unknown';
    }
}

// Export
window.Level = Level;
