/**
 * @file src/features/particles.logic.js
 * @description Оптимизированная система интерактивных частиц на Canvas.
 */

let canvas, ctx;
let particles = [];
let animationId;
let mouse = { x: null, y: null, radius: 150 };
let isInitialized = false;

// Настройки
const PARTICLE_COUNT = 60;
const MAX_SPEED = 0.5;
const LINE_DIST = 120;

class Particle {
    constructor(w, h) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * MAX_SPEED;
        this.vy = (Math.random() - 0.5) * MAX_SPEED;
        this.radius = Math.random() * 2 + 1;
    }

    update(w, h) {
        this.x += this.vx;
        this.y += this.vy;

        // Отталкивание от мыши
        if (mouse.x != null && mouse.y != null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < mouse.radius) {
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const force = (mouse.radius - distance) / mouse.radius;
                this.x -= forceDirectionX * force * 5;
                this.y -= forceDirectionY * force * 5;
            }
        }

        // Отскок от краев
        if (this.x < 0 || this.x > w) this.vx *= -1;
        if (this.y < 0 || this.y > h) this.vy *= -1;
        
        if (this.x < 0) this.x = 0;
        if (this.x > w) this.x = w;
        if (this.y < 0) this.y = 0;
        if (this.y > h) this.y = h;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();
    }
}

function initParticles() {
    if (isInitialized) return;
    
    canvas = document.createElement('canvas');
    canvas.id = 'particles-canvas';
    // ФИКС: Подняли z-index с -2 на -1
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:-1;pointer-events:none;';
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');

    resizeCanvas();
    particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle(canvas.width, canvas.height));

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleClick);

    isInitialized = true;
    animate();
}

function destroyParticles() {
    if (!isInitialized) return;
    cancelAnimationFrame(animationId);
    window.removeEventListener('resize', resizeCanvas);
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mousedown', handleClick);
    if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
    particles = [];
    isInitialized = false;
}

function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function handleMouseMove(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
}

function handleClick(e) {
    particles.forEach(p => {
        let dx = p.x - e.clientX;
        let dy = p.y - e.clientY;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 200) {
            p.vx += (dx / distance) * 2;
            p.vy += (dy / distance) * 2;
        }
    });
}

function animate() {
    if (!canvas || !ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p, index) => {
        p.update(canvas.width, canvas.height);
        p.draw();

        for (let j = index + 1; j < particles.length; j++) {
            let p2 = particles[j];
            let dx = p.x - p2.x;
            let dy = p.y - p2.y;
            let dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < LINE_DIST) {
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 - dist / (LINE_DIST * 5)})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }

        if (mouse.x != null && mouse.y != null) {
            let dx = p.x - mouse.x;
            let dy = p.y - mouse.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < mouse.radius) {
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 - dist / (mouse.radius * 3)})`;
                ctx.stroke();
            }
        }
    });

    particles.forEach(p => {
        if (p.vx > MAX_SPEED) p.vx *= 0.98;
        if (p.vy > MAX_SPEED) p.vy *= 0.98;
    });

    animationId = requestAnimationFrame(animate);
}

export { initParticles, destroyParticles };