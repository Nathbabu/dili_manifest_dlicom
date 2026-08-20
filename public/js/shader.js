// WebGL Cyber Ambient Shader
const CyberShader = (function() {
  let canvas = null;
  let gl = null;
  let prog = null;
  let animId = null;
  let isEnabled = true;
  let startTime = Date.now();
  let mouse = { x: 0.5, y: 0.5 };

  const vsSource = `
    attribute vec2 a_position;
    varying vec2 v_texCoord;
    void main() {
      v_texCoord = a_position * 0.5 + 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  const fsSource = `
    precision highp float;
    varying vec2 v_texCoord;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec2 uv = v_texCoord;
      vec2 center = vec2(0.5, 0.5);
      
      // Cyber Neon Colors
      vec3 colorMint = vec3(0.0, 1.0, 0.76);     // #00ffc2
      vec3 colorPink = vec3(1.0, 0.0, 0.89);     // #ff00e5
      vec3 colorPurple = vec3(0.61, 0.0, 1.0);   // #9d00ff
      vec3 colorGold = vec3(1.0, 0.84, 0.0);     // #ffd700

      float t = u_time * 0.4;
      float pulse = sin(t * 0.8) * 0.5 + 0.5;
      
      // Base blend
      vec3 base = mix(colorMint, colorPink, pulse);
      base = mix(base, colorPurple, sin(t * 0.5) * 0.5 + 0.5);

      // Distance from center with wave modulation
      float d = distance(uv, center);
      float mouseDist = distance(uv, u_mouse);

      // Energy wave
      float wave = sin(d * 12.0 - t * 2.0) * 0.5 + 0.5;
      float mouseGlow = 0.03 / (mouseDist + 0.05);

      // Grain / Noise
      float noiseVal = hash(uv * 4.0 + vec2(t * 0.1, t * 0.05));
      
      float intensity = (0.04 / (d + 0.12)) * (0.8 + 0.2 * noiseVal);
      intensity += mouseGlow * 0.3;
      intensity += wave * 0.05;

      vec3 finalColor = base * intensity;
      finalColor += base * (1.0 - d) * 0.12;

      gl_FragColor = vec4(finalColor * 0.32, 1.0);
    }
  `;

  function createShader(gl, type, source) {
    const s = gl.createShader(type);
    gl.shaderSource(s, source);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn(gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  function resize() {
    if (!canvas || !gl) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  }

  function render() {
    if (!isEnabled || !gl || !prog) return;

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_resolution');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');

    gl.uniform1f(uTime, (Date.now() - startTime) * 0.001);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform2f(uMouse, mouse.x, 1.0 - mouse.y);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    animId = requestAnimationFrame(render);
  }

  return {
    init: function(canvasId = 'cyber-shader-canvas') {
      canvas = document.getElementById(canvasId);
      if (!canvas) return;

      gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return;

      const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
      const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
      if (!vs || !fs) return;

      prog = gl.createProgram();
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);

      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        console.warn(gl.getProgramInfoLog(prog));
        return;
      }

      gl.useProgram(prog);

      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
         1,  1
      ]), gl.STATIC_DRAW);

      const pos = gl.getAttribLocation(prog, 'a_position');
      gl.enableVertexAttribArray(pos);
      gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

      window.addEventListener('resize', resize);
      window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX / window.innerWidth;
        mouse.y = e.clientY / window.innerHeight;
      });

      resize();
      render();
    },

    toggle: function() {
      isEnabled = !isEnabled;
      if (isEnabled) {
        if (canvas) canvas.style.display = 'block';
        render();
      } else {
        if (canvas) canvas.style.display = 'none';
        if (animId) cancelAnimationFrame(animId);
      }
      return isEnabled;
    },

    isEnabled: () => isEnabled
  };
})();
