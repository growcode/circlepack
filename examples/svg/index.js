/* eslint-disable prefer-destructuring */
/* global dat */

const gui = new dat.GUI();

const viewportWidth = window.innerWidth;
const viewportHeight = window.innerHeight;
let circles = [];

// used to size elements relative to screensize so they fit in view
const smallerDimension = viewportWidth > viewportHeight ? viewportHeight : viewportWidth;

// import from UMD bundle
const { CirclePackManager } = window['@thisisgrow/circlepack'];
const circlePackManager = new CirclePackManager({
  onUpdate: () => {
    circles.forEach((circle, i) => {
      circle.setAttributeNS(null, 'cx', circlePackManager.points[i].position.x);
      circle.setAttributeNS(null, 'cy', circlePackManager.points[i].position.y);
    });
  },
});
circlePackManager.mouseRadius = smallerDimension / 5;

const pointConfig = {
  total: 200,
  radius: smallerDimension / 50,
  mouseInteractive: circlePackManager.mouseInteractive,
  mouseRadius: circlePackManager.mouseRadius,
  tightness: circlePackManager.tightness,
};

/**
 * sets up instanced circles
 *
 * @param {number} total - number of points to create
 */
function setupCircles(total) {
  circlePackManager.reset(pointConfig.total);
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

    circlePackManager.addPoint(x, y, radius);

    // min(vec3(.9 + sin(time) / 100.), vec3(
    //   10. / (mod(v_instanceID, 2.)),
    //   4. / (mod(v_instanceID, 10.) + 1.),
    //   3. / (mod(v_instanceID, 10.) + 1.)
    // ))

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

  circlePackManager.calculateArea();
}

setupCircles(pointConfig.total);

const handleMouseMove = e => {
  if (e.touches) {
    e.preventDefault();

    e.clientX = e.touches[0].clientX;
    e.clientY = e.touches[0].clientY;
  }

  circlePackManager.mouse.x = (e.clientX - (window.innerWidth) / 2) - 1;
  circlePackManager.mouse.y = (e.clientY - (window.innerHeight) / 2) + 1;
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

  requestAnimationFrame(render);
};

render();
