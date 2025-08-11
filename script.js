
        class PlexusBackground {
            constructor(canvas, options = {}) {
                this.canvas = canvas;
                this.ctx = canvas.getContext('2d');
                this.particles = [];
                this.mouse = { x: 0, y: 0 };
                this.animationId = null;
                
                // Configuration
                this.config = {
                    particleCount: options.particleCount || 80,
                    maxDistance: options.maxDistance || 120,
                    particleSpeed: options.particleSpeed || 0.5,
                    mouseInfluence: options.mouseInfluence || 100,
                    particleSize: options.particleSize || 2,
                    lineOpacity: options.lineOpacity || 0.15,
                    particleOpacity: options.particleOpacity || 0.8,
                    ...options
                };
                
                // Bind methods to preserve 'this' context
                this.handleMouseMove = this.handleMouseMove.bind(this);
                this.handleResize = this.handleResize.bind(this);
                
                this.init();
                this.bindEvents();
                this.animate();
            }
            
            init() {
                this.resize();
                this.createParticles();
            }
            
            resize() {
                const rect = this.canvas.parentElement.getBoundingClientRect();
                this.canvas.width = rect.width;
                this.canvas.height = rect.height;
            }
            
            createParticles() {
                this.particles = [];
                for (let i = 0; i < this.config.particleCount; i++) {
                    this.particles.push({
                        x: Math.random() * this.canvas.width,
                        y: Math.random() * this.canvas.height,
                        vx: (Math.random() - 0.5) * this.config.particleSpeed,
                        vy: (Math.random() - 0.5) * this.config.particleSpeed,
                        originalX: 0,
                        originalY: 0,
                        size: Math.random() * this.config.particleSize + 1
                    });
                    
                    // Store original positions
                    this.particles[i].originalX = this.particles[i].x;
                    this.particles[i].originalY = this.particles[i].y;
                }
            }
            
            handleMouseMove(e) {
                const rect = this.canvas.getBoundingClientRect();
                this.mouse.x = e.clientX - rect.left;
                this.mouse.y = e.clientY - rect.top;
            }
            
            handleResize() {
                this.resize();
                this.createParticles();
            }
            
            bindEvents() {
                // Mouse move event for parallax effect
                document.addEventListener('mousemove', this.handleMouseMove, { passive: true });
                
                // Resize event
                window.addEventListener('resize', this.handleResize, { passive: true });
            }
            
            updateParticles() {
                this.particles.forEach(particle => {
                    // Mouse parallax effect
                    const dx = this.mouse.x - particle.x;
                    const dy = this.mouse.y - particle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < this.config.mouseInfluence && distance > 0) {
                        const force = (this.config.mouseInfluence - distance) / this.config.mouseInfluence;
                        const angle = Math.atan2(dy, dx);
                        particle.vx -= Math.cos(angle) * force * 0.02;
                        particle.vy -= Math.sin(angle) * force * 0.02;
                    }
                    
                    // Update position
                    particle.x += particle.vx;
                    particle.y += particle.vy;
                    
                    // Boundary check with wrap-around
                    if (particle.x < 0) particle.x = this.canvas.width;
                    if (particle.x > this.canvas.width) particle.x = 0;
                    if (particle.y < 0) particle.y = this.canvas.height;
                    if (particle.y > this.canvas.height) particle.y = 0;
                    
                    // Apply damping to return to natural movement
                    particle.vx *= 0.995;
                    particle.vy *= 0.995;
                    
                    // Add slight random movement for natural flow
                    particle.vx += (Math.random() - 0.5) * 0.02;
                    particle.vy += (Math.random() - 0.5) * 0.02;
                    
                    // Limit velocity
                    const maxVel = this.config.particleSpeed * 2;
                    if (Math.abs(particle.vx) > maxVel) particle.vx = maxVel * Math.sign(particle.vx);
                    if (Math.abs(particle.vy) > maxVel) particle.vy = maxVel * Math.sign(particle.vy);
                });
            }
            
            drawParticles() {
                // Get theme colors
                const isDark = document.body.getAttribute('data-theme') === 'dark';
                const particleColor = isDark ? 'rgba(59, 130, 246, 0.8)' : 'rgba(59, 130, 246, 0.6)';
                const lineColor = isDark ? 'rgba(6, 182, 212, 0.4)' : 'rgba(6, 182, 212, 0.3)';
                
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                
                // Draw connections
                this.ctx.strokeStyle = lineColor;
                this.ctx.lineWidth = 1;
                
                for (let i = 0; i < this.particles.length; i++) {
                    for (let j = i + 1; j < this.particles.length; j++) {
                        const dx = this.particles[i].x - this.particles[j].x;
                        const dy = this.particles[i].y - this.particles[j].y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        
                        if (distance < this.config.maxDistance) {
                            const opacity = (this.config.maxDistance - distance) / this.config.maxDistance;
                            this.ctx.globalAlpha = opacity * this.config.lineOpacity;
                            this.ctx.beginPath();
                            this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                            this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                            this.ctx.stroke();
                        }
                    }
                }
                
                // Draw particles
                this.ctx.fillStyle = particleColor;
                this.ctx.globalAlpha = this.config.particleOpacity;
                
                this.particles.forEach(particle => {
                    this.ctx.beginPath();
                    this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    this.ctx.fill();
                });
                
                this.ctx.globalAlpha = 1;
            }
            
            animate() {
                this.updateParticles();
                this.drawParticles();
                this.animationId = requestAnimationFrame(() => this.animate());
            }
            
            destroy() {
                if (this.animationId) {
                    cancelAnimationFrame(this.animationId);
                    this.animationId = null;
                }
                document.removeEventListener('mousemove', this.handleMouseMove);
                window.removeEventListener('resize', this.handleResize);
            }
        }

        // Initialize plexus backgrounds for all sections (except hero)
        let plexusInstances = [];
        
        
        // Initialize plexus backgrounds for all sections (except hero)
        
        
        function initPlexusBackgrounds() {
            console.log('Initializing plexus backgrounds...'); // Debug log
            
            // Clean up existing instances
            plexusInstances.forEach(instance => {
                if (instance && typeof instance.destroy === 'function') {
                    instance.destroy();
                }
            });
            plexusInstances = [];
            
            // Remove existing plexus containers
            document.querySelectorAll('.plexus-background').forEach(element => {
                element.remove();
            });
            
            // Get all sections except hero
            const sections = document.querySelectorAll('.section:not(#home)');
            console.log(`Found ${sections.length} sections for plexus`); // Debug log
            
            sections.forEach((section, index) => {
                // Create plexus container
                const plexusContainer = document.createElement('div');
                plexusContainer.className = 'plexus-background';
                
                // Create canvas
                const canvas = document.createElement('canvas');
                canvas.className = 'plexus-canvas';
                plexusContainer.appendChild(canvas);
                
                // Insert plexus background at the beginning of section
                section.insertBefore(plexusContainer, section.firstChild);
                
                // Create plexus instance with different configurations for variety
                const configs = [
                    { particleCount: 60, maxDistance: 100, particleSpeed: 0.4, mouseInfluence: 120 }, // About
                    { particleCount: 80, maxDistance: 120, particleSpeed: 0.6, mouseInfluence: 140 }, // Projects
                    { particleCount: 70, maxDistance: 110, particleSpeed: 0.5, mouseInfluence: 130 }, // Certifications
                    { particleCount: 90, maxDistance: 130, particleSpeed: 0.7, mouseInfluence: 150 }, // Services
                    { particleCount: 50, maxDistance: 90, particleSpeed: 0.3, mouseInfluence: 100 },  // Testimonials
                    { particleCount: 75, maxDistance: 115, particleSpeed: 0.55, mouseInfluence: 135 } // Contact
                ];
                
                const config = configs[index % configs.length] || configs[0];
                
                // Adjust config for mobile
                if (window.innerWidth <= 768) {
                    config.particleCount = Math.floor(config.particleCount * 0.7);
                    config.mouseInfluence = Math.floor(config.mouseInfluence * 0.8);
                    config.maxDistance = Math.floor(config.maxDistance * 0.8);
                }
                
                try {
                    const plexus = new PlexusBackground(canvas, config);
                    plexusInstances.push(plexus);
                    console.log(`Created plexus instance ${index + 1}`); // Debug log
                } catch (error) {
                    console.error('Error creating plexus instance:', error);
                }
            });
            
            console.log(`Total plexus instances created: ${plexusInstances.length}`); // Debug log
        }
        
        function setupSmoothScrolling() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function(e) {
                    const href = this.getAttribute('href');
                    if (href === '#') return;
                    
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (!target) return;
                    
                    gsap.to(window, {
                        duration: 1,
                        scrollTo: {
                            y: target,
                            offsetY: 80,
                            autoKill: true
                        },
                        ease: "power3.inOut"
                    });
                });
            });
        }





        // Add to your existing DOMContentLoaded event

        
        document.addEventListener('DOMContentLoaded', function() {
            setupSmoothScrolling();
            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
            
            // Disable scroll restoration
            if ('scrollRestoration' in history) {
                history.scrollRestoration = 'manual';
            }

            // Hide loading screen
            setTimeout(() => {
                document.getElementById('loading').classList.add('hidden');
                document.documentElement.classList.add('page-loaded');
            }, 3000);

            // Load saved theme
            const savedTheme = localStorage.getItem('theme');
            const themeIcon = document.querySelector('.theme-toggle i');
            
            if (savedTheme === 'dark') {
                document.body.setAttribute('data-theme', 'dark');
                themeIcon.className = 'fas fa-sun';
            }
            
            // Initialize Three.js particles
            initParticles();
            
            // Initialize plexus backgrounds after a short delay
            setTimeout(() => {
                initPlexusBackgrounds();
            }, 3800);
            
            // Initialize GSAP animations
            setTimeout(() => {
                initAnimations();
            }, 3500);
            
            // Event listeners
            document.getElementById('start-game').addEventListener('click', startGame);
            document.getElementById('close-game').addEventListener('click', hideGame);

           
        });

        
        // Handle window resize
        window.addEventListener('resize', () => {
            setTimeout(() => {
                initPlexusBackgrounds();
            }, 100);
        });

        // Initialize GSAP and ScrollTrigger
        gsap.registerPlugin(ScrollTrigger);

        // Variables
        let scene, camera, renderer, particles;
        const cursorTrails = [];
        let gameActive = false;
        let score = 0;
        let timeLeft = 30;
        let gameTimer;
        let spawnTimer;

        // Custom Cursor
        const cursor = document.getElementById('cursor');
        let mouseX = 0, mouseY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
             gsap.to(cursor, {
                x: mouseX - 10,
                y: mouseY - 10,
                duration: 0.1
            });
            // Create cursor trail
          //  createCursorTrail(mouseX, mouseY);
        });

        function createCursorTrail(x, y) {
            const trail = document.createElement('div');
            trail.className = 'cursor-trail';
            trail.style.left = x - 3 + 'px';
            trail.style.top = y - 3 + 'px';
            document.body.appendChild(trail);

            gsap.to(trail, {
                scale: 0,
                opacity: 0,
                duration: 0.5,
                ease: "power2.out",
                onComplete: () => trail.remove()
            });


             const cursor = document.querySelector('.custom-cursor');

            document.addEventListener('mousedown', () => {
            cursor.classList.add('click');
            });

            document.addEventListener('mouseup', () => {
            cursor.classList.remove('click');
            });

            document.addEventListener('mouseleave', () => {
            cursor.classList.remove('click');
            });
        }

       


        function typeWriter(element, text, speed = 100) {
            let i = 0;
            element.innerHTML = '';
            
            function typing() {
                if (i < text.length) {
                    element.innerHTML += text.charAt(i);
                    i++;
                    setTimeout(typing, speed);
                } else {
                    // Add blinking cursor after typing is complete
                    element.innerHTML += '<span class="typing-cursor"></span>';
                }
            }
            typing();
        }

        // Three.js Particles
        function initParticles() {
            const container = document.getElementById('particles-container');
            
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            renderer = new THREE.WebGLRenderer({ alpha: true });
            
            renderer.setSize(window.innerWidth, window.innerHeight);
            container.appendChild(renderer.domElement);

            // Create particles
            const particleCount = 150;
            const positions = new Float32Array(particleCount * 3);
            const colors = new Float32Array(particleCount * 3);

            for (let i = 0; i < particleCount * 3; i += 3) {

                const isBottomParticle = Math.random() > 0.3;
                 if (isBottomParticle) {
                    positions[i] = (Math.random() - 0.5) * 15;
                    positions[i + 1] = (Math.random() - 1) * 15; // More particles in bottom (-15 to 0)
                    positions[i + 2] = (Math.random() - 0.5) * 15;
                } else {
                    positions[i] = (Math.random() - 0.5) * 20;
                    positions[i + 1] = (Math.random() - 0.5) * 20; // Normal distribution
                    positions[i + 2] = (Math.random() - 0.5) * 20;
                }

                colors[i] = Math.random() * 0.5 + 0.5;
                colors[i + 1] = Math.random() * 0.5 + 0.5;
                colors[i + 2] = 1;
            }

            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

            const material = new THREE.PointsMaterial({
                size: 0.05,
                vertexColors: true,
                transparent: true,
                opacity: 0.8
            });

            particles = new THREE.Points(geometry, material);
            scene.add(particles);

            camera.position.z = 5;
            camera.position.y = -1;

            animate();
        }

        function animate() {
            requestAnimationFrame(animate);

            particles.rotation.x += 0.001;
            particles.rotation.y += 0.002;

            // Mouse interaction
            const mouseXNorm = (mouseX / window.innerWidth) * 2 - 1;
            const mouseYNorm = -(mouseY / window.innerHeight) * 2 + 1;
            
            particles.rotation.x += mouseYNorm * 0.001;
            particles.rotation.y += mouseXNorm * 0.001;

            renderer.render(scene, camera);
        }

        // GSAP Animations
        function initAnimations() {
            // Hero animations
            const tl = gsap.timeline();
            
            tl.to('.hero-text h1', {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: "power3.out"
            })
            .call(() => {
                // Start typing effect after h1 animation
                const subtitle = document.getElementById('typing-subtitle');
                const text = "Web Designer | Cloud & Cybersecurity Student | Network Engineering | Hardware Project Developer";
                typeWriter(subtitle, text, 50);
            }, null, "-=0.3")
            .to('.hero-text .subtitle', {
                opacity: 1,
                y: 0,
                duration: 0.1,
                ease: "power3.out"
            }, "-=0.5")
            .to('.hero-text p', {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power3.out"
            }, "-=0.4")
            .to('.cta-buttons', {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power3.out"
            }, "-=0.4")
            .to('.hero-image', {
                opacity: 1,
                scale: 1,
                duration: 1,
                ease: "power3.out"
            }, "-=0.8");

            // Section titles
            gsap.utils.toArray('.section-title').forEach(title => {
                gsap.fromTo(title, {
                    opacity: 0,
                    y: 50
                }, {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: title,
                        start: "top 80%",
                        end: "bottom 20%"
                    }
                });
            });

            // Section subtitles
            gsap.utils.toArray('.section-subtitle').forEach(subtitle => {
                gsap.fromTo(subtitle, {
                    opacity: 0,
                    y: 30
                }, {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: subtitle,
                        start: "top 80%"
                    }
                });
            });

            // Project cards
            gsap.utils.toArray('.project-card').forEach((card, index) => {
                gsap.fromTo(card, {
                    opacity: 0,
                    y: 50,
                    rotateX: 5
                }, {
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                    duration: 0.8,
                    ease: "power3.out",
                    delay: index * 0.1,
                    scrollTrigger: {
                        trigger: card,
                        start: "top 80%"
                    }
                });
            });

            // Certification cards
            gsap.utils.toArray('.cert-card').forEach((card, index) => {
                gsap.fromTo(card, {
                    opacity: 0,
                    y: 50,
                    scale: 0.9
                }, {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.8,
                    ease: "back.out(1.7)",
                    delay: index * 0.1,
                    scrollTrigger: {
                        trigger: card,
                        start: "top 80%"
                    }
                });
            });

            // Service cards
            gsap.utils.toArray('.service-card').forEach((card, index) => {
                gsap.fromTo(card, {
                    opacity: 0,
                    y: 30
                }, {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: "power3.out",
                    delay: index * 0.1,
                    scrollTrigger: {
                        trigger: card,
                        start: "top 80%"
                    }
                });
            });

            // Education items
            gsap.utils.toArray('.education-item').forEach((item, index) => {
                gsap.fromTo(item, {
                    opacity: 0,
                    x: -50
                }, {
                    opacity: 1,
                    x: 0,
                    duration: 0.8,
                    ease: "power3.out",
                    delay: index * 0.2,
                    scrollTrigger: {
                        trigger: item,
                        start: "top 80%"
                    }
                });
            });

            // Contact section
            gsap.fromTo('.contact-content', {
                opacity: 0,
                y: 50
            }, {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: '.contact-content',
                    start: "top 80%"
                }
            });

            // Parallax effects
            gsap.utils.toArray('.parallax-bg').forEach(bg => {
                gsap.to(bg, {
                    yPercent: -50,
                    ease: "none",
                    scrollTrigger: {
                        trigger: bg,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: true
                    }
                });
            });

            gsap.utils.toArray('.parallax-mid').forEach(mid => {
                gsap.to(mid, {
                    yPercent: -25,
                    ease: "none",
                    scrollTrigger: {
                        trigger: mid,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: true
                    }
                });
            });
        }

        // Theme Toggle
        function toggleTheme() {
            const body = document.body;
            const themeIcon = document.querySelector('.theme-toggle i');
            
            if (body.getAttribute('data-theme') === 'dark') {
                body.removeAttribute('data-theme');
                themeIcon.className = 'fas fa-moon';
                localStorage.setItem('theme', 'light');
            } else {
                body.setAttribute('data-theme', 'dark');
                themeIcon.className = 'fas fa-sun';
                localStorage.setItem('theme', 'dark');
            }
            
            // Reinitialize plexus with new theme colors
            setTimeout(() => {
                initPlexusBackgrounds();
            }, 150);
        }
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                initPlexusBackgrounds();
                if (renderer) {
                    camera.aspect = window.innerWidth / window.innerHeight;
                    camera.updateProjectionMatrix();
                    renderer.setSize(window.innerWidth, window.innerHeight);
                }
                ScrollTrigger.refresh();
            }, 250);
        });

        // Game functionality
        function startGame() {
            document.getElementById('game-section').style.display = 'block';
            
            gsap.fromTo('#game-section', {
                opacity: 0,
                y: 100
            }, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power3.out"
            });
            
            document.getElementById('game-section').scrollIntoView({ behavior: 'smooth' });
            
            gameActive = true;
            score = 0;
            timeLeft = 30;
            
            document.getElementById('score').textContent = score;
            document.getElementById('timer').textContent = timeLeft;
            document.getElementById('start-game').textContent = 'Restart Game';
            
            document.getElementById('game-area').innerHTML = '';
            
            gameTimer = setInterval(updateTimer, 1000);
            spawnTimer = setInterval(spawnBug, 800);
        }

        function hideGame() {
            gsap.to('#game-section', {
                opacity: 0,
                y: -100,
                duration: 0.5,
                ease: "power3.in",
                onComplete: () => {
                    document.getElementById('game-section').style.display = 'none';
                    document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
                }
            });
            resetGame();
        }

        function resetGame() {
            gameActive = false;
            clearInterval(gameTimer);
            clearInterval(spawnTimer);
            document.getElementById('game-area').innerHTML = '';
        }

        function updateTimer() {
            timeLeft--;
            document.getElementById('timer').textContent = timeLeft;
            
            if (timeLeft <= 0) {
                endGame();
            }
        }

        function endGame() {
            gameActive = false;
            clearInterval(gameTimer);
            clearInterval(spawnTimer);
            
            setTimeout(() => {
                alert(`Game Over! Your final score: ${score} points`);
            }, 500);
        }

        function spawnBug() {
            if (!gameActive) return;
            
            const gameArea = document.getElementById('game-area');
            const bug = document.createElement('div');
            bug.className = 'bug';
            bug.innerHTML = '<i class="fas fa-bug"></i>';
            
            const maxX = gameArea.offsetWidth - 40;
            const maxY = gameArea.offsetHeight - 40;
            const posX = Math.random() * maxX;
            const posY = Math.random() * maxY;
            bug.style.left = posX + 'px';
            bug.style.top = posY + 'px';
            
            const size = 30 + Math.random() * 20;
            bug.style.width = size + 'px';
            bug.style.height = size + 'px';
            
            const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            bug.style.backgroundColor = randomColor;
            
            bug.addEventListener('click', catchBug);
            
            gameArea.appendChild(bug);
            
            gsap.from(bug, {
                scale: 0,
                rotation: 360,
                duration: 0.3,
                ease: "back.out(1.7)"
            });
            
            setTimeout(() => {
                if (bug.parentNode) {
                    gsap.to(bug, {
                        scale: 0,
                        rotation: -360,
                        duration: 0.3,
                        ease: "back.in(1.7)",
                        onComplete: () => bug.remove()
                    });
                }
            }, 3000);
        }

        function catchBug(event) {
            event.stopPropagation();
            const bug = event.currentTarget;
            
            const bugSize = parseInt(bug.style.width);
            const points = Math.floor(50 - (bugSize / 2));
            score += points;
            document.getElementById('score').textContent = score;
            
            const popup = document.createElement('div');
            popup.className = 'score-popup';
            popup.textContent = `+${points}`;
            popup.style.left = bug.style.left;
            popup.style.top = bug.style.top;
            
            document.getElementById('game-area').appendChild(popup);
            
            gsap.fromTo(popup, {
                scale: 0,
                y: 0
            }, {
                scale: 1.2,
                y: -50,
                opacity: 0,
                duration: 1,
                ease: "power3.out",
                onComplete: () => popup.remove()
            });
            
            gsap.to(bug, {
                scale: 0,
                rotation: 720,
                duration: 0.3,
                ease: "power3.in",
                onComplete: () => bug.remove()
            });
        }

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    gsap.to(window, {
                        duration: 1,
                        scrollTo: {
                            y: target,
                            offsetY: 80
                        },
                        ease: "power3.inOut"
                    });
                }
            });
        });

        // Enhanced hover effects
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                gsap.to(btn, {
                    scale: 1.05,
                    duration: 0.3,
                    ease: "power3.out"
                });
            });
            
            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, {
                    scale: 1,
                    duration: 0.3,
                    ease: "power3.out"
                });
            });
        });

        // Project card mouse tracking
        document.querySelectorAll('.project-card, .cert-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;
         N       
                gsap.to(card, {
                    rotateX: rotateX,
                    rotateY: rotateY,
                    transformPerspective: 1000,
                    duration: 0.3,
                    ease: "power3.out"
                });
            });
            
            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    rotateX: 0,
                    rotateY: 0,
                    duration: 0.5,
                    ease: "power3.out"
                });
            });
        });

        // Contact form submission
       document.querySelector('.contact-form').addEventListener('submit', function(e) {
            e.preventDefault();

            const form = this;
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;

            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            btn.disabled = true;

            // Send data to Formspree
            fetch(form.action, {
                method: form.method,
                body: new FormData(form),
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    btn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
                    form.reset();
                } else {
                    btn.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error!';
                }
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }, 2000);
            })
            .catch(() => {
                btn.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error!';
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }, 2000);
            });
        });


        // Window resize handler
        window.addEventListener('resize', () => {
            if (renderer) {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            }
            ScrollTrigger.refresh();
        });

        // Initialize everything when DOM is loaded
        

        // Navbar background on scroll
        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 100) {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                if (document.body.getAttribute('data-theme') === 'dark') {
                    navbar.style.background = 'rgba(10, 10, 10, 0.95)';
                }
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 0.1)';
                if (document.body.getAttribute('data-theme') === 'dark') {
                    navbar.style.background = 'rgba(10, 10, 10, 0.1)';
                }
            }
        });

        // Add some interactive particle effects on click
        document.addEventListener('click', (e) => {
            createClickEffect(e.clientX, e.clientY);
        });

        function createClickEffect(x, y) {
            for (let i = 0; i < 6; i++) {
                const particle = document.createElement('div');
                particle.style.position = 'fixed';
                particle.style.left = x + 'px';
                particle.style.top = y + 'px';
                particle.style.width = '4px';
                particle.style.height = '4px';
                particle.style.background = 'var(--primary-color)';
                particle.style.borderRadius = '50%';
                particle.style.pointerEvents = 'none';
                particle.style.zIndex = '9999';
                document.body.appendChild(particle);

                const angle = (i / 6) * Math.PI * 2;
                const distance = 50 + Math.random() * 50;
                const finalX = Math.cos(angle) * distance;
                const finalY = Math.sin(angle) * distance;

                gsap.to(particle, {
                    x: finalX,
                    y: finalY,
                    scale: 0,
                    opacity: 0,
                    duration: 0.8,
                    ease: "power3.out",
                    onComplete: () => particle.remove()
                });
            }
        }

        // Add floating animation to skill items
        gsap.utils.toArray('.skill-item').forEach((item, index) => {
            gsap.to(item, {
                y: "random(-10, 10)",
                rotation: "random(-2, 2)",
                duration: "random(3, 5)",
                ease: "sine.inOut",
                yoyo: true,
                repeat: -1,
                delay: index * 0.1
            });
        });

        // Add pulse animation to social links
        gsap.utils.toArray('.social-link').forEach(link => {
            const tl = gsap.timeline({ repeat: -1, yoyo: true });
            tl.to(link, {
                scale: 1.1,
                duration: 2,
                ease: "sine.inOut",
                delay: Math.random() * 2
            });
        });

        document.querySelectorAll('.nav-links a[href^="#"]').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            target?.scrollIntoView({ behavior: 'smooth' });
        });
        });

