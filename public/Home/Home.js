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

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 1.5));

// Constants
const BEE_Y = 1.;
const BEE_Z = 0;
const LEFT_X = -6;
const RIGHT_X = 6;
const CENTER_X = 0;
const CENTER_STOP_DURATION = 2; // seconds

let bee, mixer, clock = new THREE.Clock();
let direction = 1; // 1: right, -1: left
let isPausing = false;
let pauseStartTime = null;

const loader = new GLTFLoader();
loader.load('./Assets/bee.glb', (gltf) => {
  bee = gltf.scene;

  // ✅ Scale up bee significantly
  bee.scale.set(0.7, 0.7, 0.7);

  bee.position.set(LEFT_X, BEE_Y, BEE_Z);
  scene.add(bee);

  // Optional animations
  mixer = new THREE.AnimationMixer(bee);
  gltf.animations.forEach((clip) => mixer.clipAction(clip).play());

  animate();
});

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);

  if (bee) {
    // Pause at center
    if (!isPausing && Math.abs(bee.position.x - CENTER_X) < 0.1) {
      isPausing = true;
      pauseStartTime = performance.now();
      bee.lookAt(camera.position); // ✅ Face camera
      return;
    }

    if (isPausing) {
      const elapsed = (performance.now() - pauseStartTime) / 1000;
      if (elapsed >= CENTER_STOP_DURATION) {
        isPausing = false;
        setBeeDirectionRotation();
      } else {
        renderer.render(scene, camera);
        return;
      }
    }

    // Move
    bee.position.x += direction * delta * 2;

    // Flip direction
    if (bee.position.x >= RIGHT_X) direction = -1;
    if (bee.position.x <= LEFT_X) direction = 1;

    // Set bee rotation to face moving direction
    setBeeDirectionRotation();

    // Lock y/z
    bee.position.y = BEE_Y;
    bee.position.z = BEE_Z;
  }

  renderer.render(scene, camera);
}

function setBeeDirectionRotation() {
  // ✅ Bee should face forward while flying
  bee.rotation.y = direction > 0 ? Math.PI / 2 : -Math.PI / 2;
}

// Resize
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
