/* eslint-disable prefer-destructuring */
/* global dat, THREE, CirclePackManager, CirclePackPoint */

const gui = new dat.GUI();

const viewportWidth = window.innerWidth;
const viewportHeight = window.innerHeight;

const renderer = new THREE.WebGLRenderer();
renderer.setClearColor('#fff', 1);
renderer.setSize(viewportWidth, viewportHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

const camera = new THREE.OrthographicCamera(viewportWidth / -2, viewportWidth / 2, viewportHeight / 2, viewportHeight / -2, 0.01, 1000);
camera.position.set(0, 0, 1);
camera.lookAt(new THREE.Vector3(0, 0, 0));

const scene = new THREE.Scene();

// used to size elements relative to screensize so they fit in view
const smallerDimension = viewportWidth > viewportHeight ? viewportHeight : viewportWidth;

// import from UMD bundle
const { CirclePackManager, CirclePackPoint } = window['@thisisgrow/circlepack'];
const circlePackManager = new CirclePackManager();
circlePackManager.mouseRadius = smallerDimension / 5;

const pointConfig = {
  total: 200,
  radius: smallerDimension / 4,
  mouseInteractive: circlePackManager.mouseInteractive,
  mouseRadius: circlePackManager.mouseRadius
};

let points;
let indices;
let scales;
let mesh;

/**
 * return a shader material to handle instances circles
 *
 * @returns {object} - a shader material
 */
function createShaderMaterial() {
  return new THREE.RawShaderMaterial({
    vertexShader: `
      precision highp float;

      varying vec2 vUv;
      varying vec3 v_pos;
      uniform float time;
      uniform vec2 u_resolution;
      uniform mat4 modelViewMatrix;
      uniform mat4 projectionMatrix;

      attribute vec2 uv;
      attribute vec3 position;
      attribute vec3 instancePosition;
      attribute float instanceID;
      attribute float instanceScale;
      varying vec3 v_instancePosition;
      varying float v_instanceID;

      void main () {
        vUv = uv;
        v_instancePosition = instancePosition;
        v_instanceID = instanceID;

        v_pos = instanceScale * position + instancePosition;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(v_pos, 1.0);
      }
    `,
    fragmentShader: `
      precision highp float;

      varying vec2 vUv;
      varying vec3 v_pos;
      varying vec3 v_instancePosition;
      varying float v_instanceID;
      uniform float time;
      uniform vec2 u_resolution;
      uniform vec2 u_mousepos;
      uniform sampler2D textures[3];

      float sdf_circle(vec2 sampleAt, vec2 center, float radius) {
        return (length(center - sampleAt) - radius / 100.) / radius;
      }

      vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }

      void main() {
        float value = step(.6, sdf_circle(vUv.xy, vec2(.5), 0.6));

        if (value == 1.) {
          discard;
        }

        gl_FragColor = vec4(hsv2rgb(
          min(vec3(.9 + sin(time) / 100.), vec3(
            10. / (mod(v_instanceID, 2.)),
            4. / (mod(v_instanceID, 10.) + 1.),
            3. / (mod(v_instanceID, 10.) + 1.)
          ))
        ), 1. - value);
      }
    `,
    depthWrite: false,
    depthTest: false,
    uniforms: {
      time: { value: 0, type: 'f' },
      u_mousepos: { value: new THREE.Vector2(0, 0) },
      u_resolution: { value: [ window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio ] },
    },
  });
}

/**
 * sets up instanced circles
 *
 * @param {number} total - number of points to create
 */
function setupCircles(total) {
  points = new Float32Array(pointConfig.total * 2);
  indices = new Uint8Array(pointConfig.total);
  scales = new Float32Array(pointConfig.total);
  circlePackManager.points = [];

  if (mesh) {
    scene.remove(mesh);
  }

  for (let i = 0; i < total; i += 1) {
    scales[i] = Math.random() / 3 + 0.1;
    indices[i] = i;

    circlePackManager.points.push(new CirclePackPoint({
      x: (Math.random() - 0.5) * viewportWidth / 3,
      y: (Math.random() - 0.5) * viewportHeight / 3,
      index: i * 2,
      radius: scales[i] * pointConfig.radius,
      manager: circlePackManager,
      pointsArray: points,
    }));
  }

  circlePackManager.calculateVolume();

  mesh = new THREE.Mesh(
    new THREE.InstancedBufferGeometry().copy(new THREE.PlaneBufferGeometry(pointConfig.radius, pointConfig.radius)),
    createShaderMaterial(),
  );

  mesh.geometry.addAttribute('instancePosition', new THREE.InstancedBufferAttribute(points, 2));
  mesh.geometry.addAttribute('instanceID', new THREE.InstancedBufferAttribute(indices, 1));
  mesh.geometry.addAttribute('instanceScale', new THREE.InstancedBufferAttribute(scales, 1));

  scene.add(mesh);
}

setupCircles(pointConfig.total);

const guiEl = document.querySelector('.dg.ac');
guiEl.style.zIndex = 10;

const handleMouseMove = e => {
  if (e.touches) {
    e.preventDefault();

    e.clientX = e.touches[0].clientX;
    e.clientY = e.touches[0].clientY;
  }

  circlePackManager.mouse.x = (e.clientX - (window.innerWidth) / 2) - 1;
  circlePackManager.mouse.y = -(e.clientY - (window.innerHeight) / 2) + 1;

  mesh.material.uniforms.u_mousepos.value = circlePackManager.mouse;
};


window.addEventListener('mousemove', handleMouseMove);
window.addEventListener('touchmove', handleMouseMove);


gui.add(pointConfig, 'total').step(1).onChange(() => setupCircles(pointConfig.total));
gui.add(pointConfig, 'radius').onChange(() => setupCircles(pointConfig.total));
gui.add(pointConfig, 'mouseInteractive').onChange(() => {
  circlePackManager.mouseInteractive = pointConfig.mouseInteractive;
});
gui.add(pointConfig, 'mouseRadius').onChange(() => {
  circlePackManager.mouseRadius = pointConfig.mouseRadius;
});

const render = () => {
  circlePackManager.update();

  mesh.geometry.attributes.instancePosition.needsUpdate = true;
  mesh.material.uniforms.time.value = performance.now() / 1000;

  renderer.render(scene, camera);

  requestAnimationFrame(render);
};

render();
