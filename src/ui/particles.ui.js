/**
 * @file src/ui/particles.ui.js
 * @description Оптимизированная система частиц на Canvas.
 */

let canvas, ctx;
let particles = [];
let animationId;
let mouse = { x: null, y: null, radius: 150 };
let isInitialized = false;
let isPaused = false;

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
    if (isInitialized) destroyParticles();
    
    canvas = document.createElement('canvas');
    canvas.id = 'particles-canvas';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:-1;pointer-events:none;';
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');

    resizeCanvas();
    particles = Array.from({ length: count }, () => new Particle(window.innerWidth, window.innerHeight));

    window.addEventListener('resize', resizeCanvas);
    if (window.matchMedia('(pointer: fine)').matches) {
        window.addEventListener('mousemove', handleMouseMove);
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);

    isInitialized = true;
    isPaused = false;
    animate();
}

export function destroyParticles() {
    if (!isInitialized) return;
    cancelAnimationFrame(animationId);
    window.removeEventListener('resize', resizeCanvas);
    window.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
    particles = [];
    isInitialized = false;
    isPaused = false;
}

function resizeCanvas() {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function handleMouseMove(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
}

function handleVisibilityChange() {
    if (document.hidden) {
        isPaused = true;
        cancelAnimationFrame(animationId);
    } else if (isInitialized) {
        isPaused = false;
        animate();
    }
}

function animate() {
    if (!canvas || !ctx || isPaused) return;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    particles.forEach(p => {
        p.update(window.innerWidth, window.innerHeight);
        p.draw();
    });
    animationId = requestAnimationFrame(animate);
}