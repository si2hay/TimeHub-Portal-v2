/**
 * @file src/features/particles.logic.js
 * @description Оптимизированная система частиц на Canvas (без линий).
 */

let canvas, ctx;
let particles = [];
let animationId;
let mouse = { x: null, y: null, radius: 150 };
let isInitialized = false;

class Particle {
    constructor(w, h) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
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

export function initParticles(count = 30) {
    // Если уже запущены, удаляем старые перед созданием новых
    if (isInitialized) {
        destroyParticles();
    }
    
    canvas = document.createElement('canvas');
    canvas.id = 'particles-canvas';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:-1;pointer-events:none;';
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');

    resizeCanvas();
    particles = Array.from({ length: count }, () => new Particle(canvas.width, canvas.height));

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);

    isInitialized = true;
    animate();
}

export function destroyParticles() {
    if (!isInitialized) return;
    cancelAnimationFrame(animationId);
    window.removeEventListener('resize', resizeCanvas);
    window.removeEventListener('mousemove', handleMouseMove);
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

function animate() {
    if (!canvas || !ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
        p.update(canvas.width, canvas.height);
        p.draw();
    });

    animationId = requestAnimationFrame(animate);
}