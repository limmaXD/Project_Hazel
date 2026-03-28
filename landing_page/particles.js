// Wait for OGL to load from CDN
window.addEventListener('DOMContentLoaded', async () => {
    // Import OGL from CDN
    let OGL;
    try {
        OGL = await import('https://cdn.skypack.dev/ogl');
    } catch (error) {
        console.error('Failed to load OGL for particle background.', error);
        return;
    }

    const { Renderer, Camera, Geometry, Program, Mesh } = OGL;

    // Configuration
    const config = {
        particleCount: 500,
        particleSpread: 7.5,
        speed: 0.1,
        particleColors: ['#0FFFC7', '#FFFFFF'], // Your accent color and white
        moveParticlesOnHover: true,
        particleHoverFactor: 1,
        alphaParticles: false,
        particleBaseSize: 100,
        sizeRandomness: 1,
        cameraDistance: 20,
        disableRotation: false
    };

    // Helper function
    const hexToRgb = hex => {
        hex = hex.replace(/^#/, '');
        if (hex.length === 3) {
            hex = hex.split('').map(c => c + c).join('');
        }
        const int = parseInt(hex, 16);
        const r = ((int >> 16) & 255) / 255;
        const g = ((int >> 8) & 255) / 255;
        const b = (int & 255) / 255;
        return [r, g, b];
    };

    // Shaders
    const vertex = `
        attribute vec3 position;
        attribute vec4 random;
        attribute vec3 color;
        uniform mat4 modelMatrix;
        uniform mat4 viewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;
        uniform float uSpread;
        uniform float uBaseSize;
        uniform float uSizeRandomness;
        varying vec4 vRandom;
        varying vec3 vColor;
        void main() {
            vRandom = random;
            vColor = color;
            vec3 pos = position * uSpread;
            pos.z *= 10.0;
            vec4 mPos = modelMatrix * vec4(pos, 1.0);
            float t = uTime;
            mPos.x += sin(t * random.z + 6.28 * random.w) * mix(0.1, 1.5, random.x);
            mPos.y += sin(t * random.y + 6.28 * random.x) * mix(0.1, 1.5, random.w);
            mPos.z += sin(t * random.w + 6.28 * random.y) * mix(0.1, 1.5, random.z);
            vec4 mvPos = viewMatrix * mPos;
            if (uSizeRandomness == 0.0) {
                gl_PointSize = uBaseSize;
            } else {
                gl_PointSize = (uBaseSize * (1.0 + uSizeRandomness * (random.x - 0.5))) / length(mvPos.xyz);
            }
            gl_Position = projectionMatrix * mvPos;
        }
    `;

    const fragment = `
        precision highp float;
        uniform float uTime;
        uniform float uAlphaParticles;
        varying vec4 vRandom;
        varying vec3 vColor;
        void main() {
            vec2 uv = gl_PointCoord.xy;
            float d = length(uv - vec2(0.5));
            if(uAlphaParticles < 0.5) {
                if(d > 0.5) {
                    discard;
                }
                gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), 1.0);
            } else {
                float circle = smoothstep(0.5, 0.4, d) * 0.8;
                gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), circle);
            }
        }
    `;

    // Initialize
    const container = document.getElementById('particles');
    if (!container) return;

    const mouse = { x: 0, y: 0 };

    const renderer = new Renderer({ depth: false, alpha: true });
    const gl = renderer.gl;
    container.appendChild(gl.canvas);
    gl.clearColor(0, 0, 0, 0);

    const camera = new Camera(gl, { fov: 15 });
    camera.position.set(0, 0, config.cameraDistance);

    // Resize handler
    const resize = () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        renderer.setSize(width, height);
        camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
    };
    window.addEventListener('resize', resize);
    resize();

    // Mouse handler
    if (config.moveParticlesOnHover) {
        container.addEventListener('pointermove', e => {
            const rect = container.getBoundingClientRect();
            mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        }, { passive: true });
    }

    // Create particle data
    const count = config.particleCount;
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count * 4);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
        let x, y, z, len;
        do {
            x = Math.random() * 2 - 1;
            y = Math.random() * 2 - 1;
            z = Math.random() * 2 - 1;
            len = x * x + y * y + z * z;
        } while (len > 1 || len === 0);

        const r = Math.cbrt(Math.random());
        positions.set([x * r, y * r, z * r], i * 3);
        randoms.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);

        const col = hexToRgb(config.particleColors[Math.floor(Math.random() * config.particleColors.length)]);
        colors.set(col, i * 3);
    }

    const geometry = new Geometry(gl, {
        position: { size: 3, data: positions },
        random: { size: 4, data: randoms },
        color: { size: 3, data: colors }
    });

    const program = new Program(gl, {
        vertex,
        fragment,
        uniforms: {
            uTime: { value: 0 },
            uSpread: { value: config.particleSpread },
            uBaseSize: { value: config.particleBaseSize },
            uSizeRandomness: { value: config.sizeRandomness },
            uAlphaParticles: { value: config.alphaParticles ? 1 : 0 }
        },
        transparent: true,
        depthTest: false
    });

    const particles = new Mesh(gl, {
        mode: gl.POINTS,
        geometry,
        program
    });

    // Animation loop
    let lastTime = performance.now();
    let elapsed = 0;

    const animate = t => {
        requestAnimationFrame(animate);

        const delta = t - lastTime;
        lastTime = t;
        elapsed += delta * config.speed;

        program.uniforms.uTime.value = elapsed * 0.001;

        if (config.moveParticlesOnHover) {
            particles.position.x = -mouse.x * config.particleHoverFactor;
            particles.position.y = -mouse.y * config.particleHoverFactor;
        }

        if (!config.disableRotation) {
            particles.rotation.x = Math.sin(elapsed * 0.0002) * 0.1;
            particles.rotation.y = Math.cos(elapsed * 0.0005) * 0.15;
            particles.rotation.z += 0.01 * config.speed;
        }

        renderer.render({ scene: particles, camera });
    };

    animate(performance.now());
});