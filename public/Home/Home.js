// === THREE.JS BEE ANIMATION ===
import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';

const canvas = document.getElementById('bee-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 2, 10);
camera.lookAt(0, 2, 0);

scene.add(new THREE.AmbientLight(0xffffff, 1.5));

// Constants
const BEE_Y = 1;
const BEE_Z = 0;
const LEFT_X = -6;
const RIGHT_X = 6;
const CENTER_X = 0;
const SPEED = 2;
const SLOW_ZONE_RADIUS = 1.5;
const CENTER_SLOW_FACTOR = 0.4;
const TURN_SPEED = 0.08;
const ROTATION_THRESHOLD = 0.05;

let bee, mixer, clock = new THREE.Clock();
let direction = 1;
let beeRotationTarget = Math.PI / 2;
let isTurning = false;
let hasSlowedInCenter = false;

const loader = new GLTFLoader();
loader.load('./Assets/bee.glb', (gltf) => {
  bee = gltf.scene;
  bee.scale.set(0.7, 0.7, 0.7);
  bee.position.set(LEFT_X, BEE_Y, BEE_Z);
  bee.rotation.y = beeRotationTarget;
  scene.add(bee);

  mixer = new THREE.AnimationMixer(bee);
  gltf.animations.forEach((clip) => mixer.clipAction(clip).play());

  animate();
});

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);
  if (!bee) return;

  if (isTurning) {
    bee.rotation.y += (beeRotationTarget - bee.rotation.y) * TURN_SPEED;
    if (Math.abs(bee.rotation.y - beeRotationTarget) < ROTATION_THRESHOLD) {
      bee.rotation.y = beeRotationTarget;
      isTurning = false;
    }
    renderer.render(scene, camera);
    return;
  }

  const distanceFromCenter = Math.abs(bee.position.x - CENTER_X);
  let speedFactor = 1;
  if (distanceFromCenter < SLOW_ZONE_RADIUS) {
    speedFactor = CENTER_SLOW_FACTOR + (distanceFromCenter / SLOW_ZONE_RADIUS) * (1 - CENTER_SLOW_FACTOR);

    if (!hasSlowedInCenter && speedFactor <= 0.45) {
      hasSlowedInCenter = true;
      triggerHoneyButtonEffect();
    }
  }

  bee.position.x += direction * delta * SPEED * speedFactor;

  if (bee.position.x >= RIGHT_X) {
    bee.position.x = RIGHT_X;
    direction = -1;
    beeRotationTarget = -Math.PI / 2;
    isTurning = true;
  } else if (bee.position.x <= LEFT_X) {
    bee.position.x = LEFT_X;
    direction = 1;
    beeRotationTarget = Math.PI / 2;
    isTurning = true;
  }

  bee.position.y = BEE_Y;
  bee.position.z = BEE_Z;
  bee.rotation.x = 0;
  bee.rotation.z = 0;

  renderer.render(scene, camera);
}

// Responsive canvas
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

// === BUTTON HONEY EFFECT ===
function triggerHoneyButtonEffect() {
  const btn = document.getElementById('startChecking');
  if (!btn) return;
  btn.classList.add('honey-animate');
}
