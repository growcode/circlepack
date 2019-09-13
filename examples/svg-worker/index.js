/* eslint-disable prefer-destructuring */
/* global dat */

const gui = new dat.GUI();

const viewportWidth = window.innerWidth;
const viewportHeight = window.innerHeight;
let circles = [];

// used to size elements relative to screensize so they fit in view
const smallerDimension = viewportWidth > viewportHeight ? viewportHeight : viewportWidth;

// import from UMD bundle
const { WorkerWrapper } = window['@thisisgrow/circlepack'];

const blob = new Blob(['('+WorkerWrapper.toString()+')()'], {type: 'application/javascript'});
const circlePackWorker = new Worker(URL.createObjectURL(blob));

circlePackWorker.addEventListener('message', e => {
  const points = new Float32Array(e.data.points);

  for (let i = 0; i < pointConfig.total; i += 1) {
    circles[i].setAttributeNS(null, 'cx', points[i * 2]);
    circles[i].setAttributeNS(null, 'cy', points[i * 2 + 1]);
  }
});

const pointConfig = {
  total: 200,
  radius: smallerDimension / 50,
  mouseInteractive: true,
  mouseRadius: smallerDimension / 5,
  tightness: 1,
};

/**
 * sets up instanced circles
 *
 * @param {number} total - number of points to create
 */
function setupCircles(total) {
  circlePackWorker.postMessage({
    action: 'setup',
    pointCount: pointConfig.total,
  });

  circles = [];

  const containerSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  containerSVG.setAttributeNS(null, 'viewBox', `${viewportWidth / -2} ${viewportHeight / -2} ${viewportWidth} ${viewportHeight}`);
  containerSVG.setAttribute('width', '100%');
  containerSVG.setAttribute('height', '100%');
  document.body.appendChild(containerSVG);

  for (let i = 0; i < total; i += 1) {
    const x = (Math.random() - 0.5) * viewportWidth / 3;
    const y = (Math.random() - 0.5) * viewportHeight / 3;
    const radius = (Math.random() + 0.4) * pointConfig.radius;

    circlePackWorker.postMessage({
      action: 'add',
      point: {
        x, y, radius,
      },
    });

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttributeNS(null, 'cx', x);
    circle.setAttributeNS(null, 'cy', y);
    circle.setAttributeNS(null, 'r', radius);
    circle.setAttributeNS(null, 'style', `fill: hsla(
      -50,
      ${Math.floor((Math.min(0.9, (4 / (i % 10))) - 0.2) * 100)}%,
      ${Math.floor((Math.min(0.9, (3 / (i % 10))) - 0.2) * 100)}%,
      1
    )`);
    circles.push(circle);
    containerSVG.appendChild(circle);
  }

  circlePackWorker.postMessage({ action: 'calculateArea' });
}

setupCircles(pointConfig.total);

const handleMouseMove = e => {
  if (e.touches) {
    e.preventDefault();

    e.clientX = e.touches[0].clientX;
    e.clientY = e.touches[0].clientY;
  }

  circlePackWorker.postMessage({
    action: 'updateMouse',
    x: (e.clientX - (window.innerWidth) / 2) - 1,
    y: (e.clientY - (window.innerHeight) / 2) + 1,
  });
};


window.addEventListener('mousemove', handleMouseMove);
window.addEventListener('touchmove', handleMouseMove);


gui.add(pointConfig, 'total').step(1).onChange(() => setupCircles(pointConfig.total));
gui.add(pointConfig, 'radius').onChange(() => setupCircles(pointConfig.total));
gui.add(pointConfig, 'mouseInteractive').onChange(() => {
  circlePackWorker.postMessage({
    action: 'updateValue',
    key: 'mouseInteractive',
    value: pointConfig.mouseInteractive,
  });
});

gui.add(pointConfig, 'mouseRadius').onChange(() => {
  circlePackWorker.postMessage({
    action: 'updateValue',
    key: 'mouseRadius',
    value: pointConfig.mouseRadius,
  });
});

gui.add(pointConfig, 'tightness')
  .max(1).min(0).step(0.01)
  .onChange(() => {
    circlePackWorker.postMessage({
      action: 'updateValue',
      key: 'tightness',
      value: pointConfig.tightness,
    });
  });

const render = () => {
  circlePackWorker.postMessage({
    action: 'update',
  });

  requestAnimationFrame(render);
};

render();
