/* eslint-disable prefer-destructuring */
/* global dat, THREE */

import { Renderer, Camera, Transform, Texture, Program, Geometry,  Mesh } from './ogl/src/Core.js';
import { Plane } from './ogl/src/Extras.js';
import CirclePackManager from './es/CirclePackManager.js';
import Vector2 from './es/Vector2.js';

const gui = new dat.GUI();

const viewportWidth = window.innerWidth;
const viewportHeight = window.innerHeight;

const renderer = new Renderer();
const gl = renderer.gl;
gl.clearColor(1, 1, 1, 1);
renderer.setSize(viewportWidth, viewportHeight);

document.body.appendChild(gl.canvas);

const camera = new Camera(gl, {
  left: viewportWidth / -2,
  right: viewportWidth / 2,
  top: viewportHeight / 2,
  bottom: viewportHeight / -2,
});
camera.position.z = 1;

const scene = new Transform();

// used to size elements relative to screensize so they fit in view
const smallerDimension = viewportWidth > viewportHeight ? viewportHeight : viewportWidth;

const circlePackManager = new CirclePackManager();
circlePackManager.mouseRadius = smallerDimension / 5;

const pointConfig = {
  total: 200,
  radius: smallerDimension / 15,
  mouseInteractive: circlePackManager.mouseInteractive,
  mouseRadius: circlePackManager.mouseRadius,
  tightness: circlePackManager.tightness,
};

let indices;
let scales;
let mesh;

/**
 * return a shader material to handle instances circles
 *
 * @returns {object} - a shader material
 */
function createShaderMaterial() {
  return new Program(gl, {
    vertex: `
      precision highp float;

      varying vec2 vUv;
      varying vec3 v_pos;
      uniform float time;
      uniform vec2 u_resolution;
      uniform mat4 modelViewMatrix;
      uniform mat4 projectionMatrix;

      attribute vec2 uv;
      attribute vec3 position;
      attribute vec2 instancePosition;
      attribute float instanceID;
      attribute float instanceScale;
      varying vec2 v_instancePosition;
      varying float v_instanceID;

      void main () {
        vUv = uv;
        v_instancePosition = instancePosition;
        v_instanceID = float(instanceID);

        v_pos = instanceScale * position + vec3(instancePosition.xy, 0);

        gl_Position = projectionMatrix * modelViewMatrix * vec4(v_pos, 1.0);
      }
    `,
    fragment: `
      precision highp float;

      varying vec2 vUv;
      varying vec3 v_pos;
      varying vec2 v_instancePosition;
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

        // gl_FragColor = vec4(vec3(
        //   0.
        // ), 1. - value);
      }
    `,
    depthWrite: false,
    depthTest: false,
    uniforms: {
      time: { value: 0, type: 'f' },
      u_mousepos: { value: new Vector2(0, 0) },
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
  indices = new Float32Array(total * 2);
  scales = new Float32Array(total);
  circlePackManager.reset(total);

  if (mesh) {
    scene.removeChild(mesh);
  }

  for (let i = 0; i < total; i += 1) {
    scales[i] = Math.random() / 3 + 0.1;
    indices[i] = i;

    circlePackManager.addPoint(
      (Math.random() - 0.5) * viewportWidth / 3,
      (Math.random() - 0.5) * viewportHeight / 3,
      scales[i] * pointConfig.radius,
    );
  }

  circlePackManager.calculateArea();

  const planeGeometry = new Plane(gl, { width: 2.8 * pointConfig.radius, height: 2.8 * pointConfig.radius });

  // planeGeometry.attributes.position.instanced = 1;
  // planeGeometry.attributes.uv.instanced = 1;
  // planeGeometry.attributes.index.instanced = 1;

  mesh = new Mesh(gl, {
    // new THREE.InstancedBufferGeometry().copy(new THREE.PlaneBufferGeometry(pointConfig.radius * 2.8, pointConfig.radius * 2.8)),
    geometry: new Geometry(gl, {
      position: planeGeometry.attributes.position,
      uv: planeGeometry.attributes.uv,
      index: planeGeometry.attributes.index,
      instancePosition: { instanced: 1, size: 2, data: circlePackManager.pointsArray },
      instanceScale: { instanced: 1, size: 1, data: scales },
      instanceID: { instanced: 1, size: 1, data: indices },
    }),
    program: createShaderMaterial(),
  });

  mesh.setParent(scene);
}

setupCircles(pointConfig.total);

const handleMouseMove = e => {
  if (e.touches) {
    e.preventDefault();

    e.clientX = e.touches[0].clientX;
    e.clientY = e.touches[0].clientY;
  }

  circlePackManager.mouse.x = (e.clientX - (window.innerWidth) / 2) - 1;
  circlePackManager.mouse.y = -(e.clientY - (window.innerHeight) / 2) + 1;

  mesh.program.uniforms.u_mousepos.value = circlePackManager.mouse;
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

gui.add(pointConfig, 'tightness')
  .max(1).min(0).step(0.01)
  .onChange(() => {
    circlePackManager.tightness = pointConfig.tightness;
  });

const render = () => {
  circlePackManager.update();

  // mesh.geometry.attributes.instancePosition.needsUpdate = true;
  // mesh.material.uniforms.time.value = performance.now() / 1000;

  mesh.program.uniforms.time.value = performance.now() / 1000;
  mesh.geometry.attributes.instancePosition.needsUpdate = true;

  renderer.render({ scene, camera });
  requestAnimationFrame(render);
};

render();
