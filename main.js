import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// Configuration
const SIZE = 4;
const CUBIE_SIZE = 1;
const GAP = 0.05;
const COLORS = [
    0xffffff, // Right - White (usually Red, but let's stick to standard layout later)
    0xffff00, // Left - Yellow
    0xff0000, // Top - Red
    0xffa500, // Bottom - Orange
    0x00ff00, // Front - Green
    0x0000ff  // Back - Blue
];

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(8, 8, 12);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = THREE.ReinhardToneMapping;
document.body.appendChild(renderer.domElement);

// Post-processing for Glow (Bloom)
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.6, 0.4, 0.85);
const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.minDistance = 5;
controls.maxDistance = 20;

const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 2);
pointLight.position.set(10, 10, 10);
scene.add(pointLight);

// Audio
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let clickBuffer = null;
fetch('rotate.mp3')
    .then(res => res.arrayBuffer())
    .then(data => audioCtx.decodeAudioData(data))
    .then(buffer => clickBuffer = buffer);

function playClick() {
    if (!clickBuffer) return;
    const source = audioCtx.createBufferSource();
    source.buffer = clickBuffer;
    source.connect(audioCtx.destination);
    source.start(0);
}

// Cube state
let cubies = [];
let moveHistory = [];
const cubeGroup = new THREE.Group();
scene.add(cubeGroup);

function createCube() {
    // Clear existing
    cubies.forEach(c => cubeGroup.remove(c));
    cubies = [];
    moveHistory = [];

    const offset = (SIZE - 1) * (CUBIE_SIZE + GAP) / 2;

    for (let x = 0; x < SIZE; x++) {
        for (let y = 0; y < SIZE; y++) {
            for (let z = 0; z < SIZE; z++) {
                // Only create outer cubies to save performance (optional for 4x4)
                const isSurface = x === 0 || x === SIZE - 1 || y === 0 || y === SIZE - 1 || z === 0 || z === SIZE - 1;
                if (!isSurface) continue;

                const geometry = new THREE.BoxGeometry(CUBIE_SIZE, CUBIE_SIZE, CUBIE_SIZE);
                
                // Materials for each face
                const materials = [];
                for (let i = 0; i < 6; i++) {
                    let color = 0x222222; // Interior is dark
                    
                    // Determine if this face is on the outside
                    if (i === 0 && x === SIZE - 1) color = 0xff0000; // Right - Red
                    if (i === 1 && x === 0) color = 0xffa500;        // Left - Orange
                    if (i === 2 && y === SIZE - 1) color = 0xffffff; // Top - White
                    if (i === 3 && y === 0) color = 0xffff00;        // Bottom - Yellow
                    if (i === 4 && z === SIZE - 1) color = 0x00ff00; // Front - Green
                    if (i === 5 && z === 0) color = 0x0000ff;        // Back - Blue

                    materials.push(new THREE.MeshStandardMaterial({ 
                        color, 
                        roughness: 0.05, 
                        metalness: 0.4,
                        emissive: color,
                        emissiveIntensity: 0.1 
                    }));
                }

                const cubie = new THREE.Mesh(geometry, materials);
                cubie.position.set(
                    x * (CUBIE_SIZE + GAP) - offset,
                    y * (CUBIE_SIZE + GAP) - offset,
                    z * (CUBIE_SIZE + GAP) - offset
                );
                
                // Store initial logical positions for solving check
                cubie.userData.gridPos = { x, y, z };
                cubie.userData.initialPos = cubie.position.clone();
                
                cubeGroup.add(cubie);
                cubies.push(cubie);
            }
        }
    }
}

createCube();

// Interaction Logic
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let isDragging = false;
let dragStartCubie = null;
let dragStartFaceNormal = null;
let dragStartPosition = null;

window.addEventListener('mousedown', onMouseDown);
window.addEventListener('mousemove', onMouseMove);
window.addEventListener('mouseup', onMouseUp);

window.addEventListener('touchstart', (e) => onMouseDown(e.touches[0]), { passive: false });
window.addEventListener('touchmove', (e) => onMouseMove(e.touches[0]), { passive: false });
window.addEventListener('touchend', (e) => onMouseUp(e.changedTouches[0]), { passive: false });

function onMouseDown(e) {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(cubies);

    if (intersects.length > 0) {
        controls.enabled = false;
        isDragging = true;
        dragStartCubie = intersects[0].object;
        dragStartFaceNormal = intersects[0].face.normal.clone().applyQuaternion(dragStartCubie.quaternion);
        dragStartPosition = intersects[0].point;
    }
}

function onMouseMove(e) {
    if (!isDragging) return;
    // We handle the actual rotation trigger on mouse up based on distance moved
}

function onMouseUp(e) {
    if (!isDragging) return;

    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(cubies);

    if (intersects.length > 0) {
        const endPosition = intersects[0].point;
        const moveVec = endPosition.clone().sub(dragStartPosition);

        if (moveVec.length() > 0.3) {
            handleRotation(dragStartCubie, dragStartFaceNormal, moveVec);
        }
    }

    isDragging = false;
    dragStartCubie = null;
    controls.enabled = true;
}

function handleRotation(cubie, normal, moveVec) {
    if (isRotating) return;

    // Projection of move vector onto the face plane
    // We need to find the primary direction of movement relative to the cube axes
    const axes = [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1)];
    
    // Find direction perpendicular to normal and aligned with movement
    let bestAxis = null;
    let maxDot = -1;
    let rotationAxis = new THREE.Vector3();

    axes.forEach(axis => {
        if (Math.abs(axis.dot(normal)) < 0.1) { // Axis is parallel to face
            const dot = Math.abs(axis.dot(moveVec));
            if (dot > maxDot) {
                maxDot = dot;
                bestAxis = axis;
            }
        }
    });

    if (!bestAxis) return;

    // The actual axis of rotation is the cross product of the face normal and the movement direction
    // But since it's a cube, it must be one of the principal axes
    const worldMoveDir = moveVec.clone().normalize();
    const cross = new THREE.Vector3().crossVectors(normal, worldMoveDir);
    
    // Snap cross to nearest principal axis
    let finalRotationAxis = new THREE.Vector3(1,0,0);
    let maxAlign = -1;
    [new THREE.Vector3(1,0,0), new THREE.Vector3(0,1,0), new THREE.Vector3(0,0,1)].forEach(a => {
        const d = Math.abs(a.dot(cross));
        if (d > maxAlign) {
            maxAlign = d;
            finalRotationAxis = a.clone().multiplyScalar(Math.sign(a.dot(cross)));
        }
    });

    // Determine which slice to rotate
    // Slice is determined by the coordinate of the cubie along the rotation axis
    const pos = cubie.position;
    const coord = pos.dot(finalRotationAxis);
    
    // Threshold for 4x4 (slices are roughly at -1.57, -0.52, 0.52, 1.57)
    // We can just find all cubies whose position on this axis is close to this cubie
    rotateSlice(finalRotationAxis, coord, Math.PI / 2, false, true);
}

let isRotating = false;
function rotateSlice(axis, coord, angle = Math.PI / 2, instant = false, track = false) {
    if (isRotating && !instant) return;
    if (!instant) isRotating = true;

    if (track) {
        moveHistory.push({ axis: axis.clone(), coord, angle });
    }

    const slice = [];
    const epsilon = 0.1;
    cubies.forEach(c => {
        if (Math.abs(c.position.dot(axis) - coord) < epsilon) {
            slice.push(c);
        }
    });

    if (instant) {
        const matrix = new THREE.Matrix4().makeRotationAxis(axis, angle);
        slice.forEach(c => {
            c.position.applyMatrix4(matrix);
            c.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(axis, angle));
        });
        return;
    }

    const group = new THREE.Group();
    scene.add(group);
    slice.forEach(c => group.add(c));

    const startTime = performance.now();
    const duration = 250;

    function animate(time) {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentAngle = progress * angle;
        
        group.setRotationFromAxisAngle(axis, currentAngle);

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Finish
            slice.forEach(c => {
                c.applyQuaternion(group.quaternion);
                c.position.applyQuaternion(group.quaternion);
                cubeGroup.add(c);
            });
            scene.remove(group);
            isRotating = false;
            playClick();
            checkSolved();
        }
    }
    requestAnimationFrame(animate);
}

function undo() {
    if (isRotating || moveHistory.length === 0) return;
    const lastMove = moveHistory.pop();
    rotateSlice(lastMove.axis, lastMove.coord, -lastMove.angle, false, false);
}

function scramble() {
    if (isRotating) return;
    moveHistory = [];
    const moves = 20;
    const axes = [new THREE.Vector3(1,0,0), new THREE.Vector3(0,1,0), new THREE.Vector3(0,0,1)];
    const coords = [-(1.5 * (CUBIE_SIZE + GAP)), -(0.5 * (CUBIE_SIZE + GAP)), 0.5 * (CUBIE_SIZE + GAP), 1.5 * (CUBIE_SIZE + GAP)];

    for (let i = 0; i < moves; i++) {
        const axis = axes[Math.floor(Math.random() * 3)];
        const coord = coords[Math.floor(Math.random() * 4)];
        const dir = Math.random() > 0.5 ? Math.PI / 2 : -Math.PI / 2;
        rotateSlice(axis, coord, dir, true);
    }
}

function checkSolved() {
    // A 4x4 is solved if all cubies on each of the 6 faces have the same world-space normal pointing to the same color
    // More simply: each cubie's current rotation should align its original colors with the world axes
    
    let solved = true;
    const threshold = 0.01;

    for (const cubie of cubies) {
        // The cubie's current quaternion should result in its materials facing the correct world directions.
        // But simpler: since we start solved, if all cubies are at integer-ish rotations and 
        // every cubie on a face has the same material color, it's solved.
        
        // Let's check if the current orientation of the cubie matches its position
        // If the cube is rotated as a whole, it's still "solved".
        // But OrbitControls rotates the camera, so cubeGroup stays at identity.
        
        // For each cubie, check if its "up" is one of world axes, etc.
        // Actually, for a rubik's cube, the simplest solve check is:
        // For each of the 6 directions (X, -X, Y, -Y, Z, -Z), all visible faces must have the same color.
    }

    // Reliable Solve Check:
    const directions = [
        new THREE.Vector3(1, 0, 0), new THREE.Vector3(-1, 0, 0),
        new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, -1, 0),
        new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, -1)
    ];

    for (const dir of directions) {
        const faceColors = [];
        for (const cubie of cubies) {
            // Find if this cubie is on the surface in this direction
            const dot = cubie.position.dot(dir);
            if (dot > 1.5) { // It's on the outer layer for this direction
                // Find which of the 6 materials is facing 'dir'
                for (let i = 0; i < 6; i++) {
                    const normal = new THREE.Vector3();
                    if (i === 0) normal.set(1, 0, 0);
                    if (i === 1) normal.set(-1, 0, 0);
                    if (i === 2) normal.set(0, 1, 0);
                    if (i === 3) normal.set(0, -1, 0);
                    if (i === 4) normal.set(0, 0, 1);
                    if (i === 5) normal.set(0, 0, -1);
                    
                    normal.applyQuaternion(cubie.quaternion);
                    if (normal.dot(dir) > 0.9) {
                        const color = cubie.material[i].color.getHex();
                        if (color !== 0x222222) { // Ignore internal faces
                            faceColors.push(color);
                        }
                    }
                }
            }
        }
        
        if (faceColors.length > 0) {
            const firstColor = faceColors[0];
            if (!faceColors.every(c => c === firstColor)) {
                solved = false;
                break;
            }
        }
    }

    if (solved) {
        document.getElementById('win-overlay').style.display = 'flex';
    }
}

// UI events
document.getElementById('undo-btn').addEventListener('click', () => {
    undo();
});

document.getElementById('scramble-btn').addEventListener('click', () => {
    scramble();
});

document.getElementById('reset-btn').addEventListener('click', () => {
    createCube();
});

document.getElementById('close-win').addEventListener('click', () => {
    document.getElementById('win-overlay').style.display = 'none';
});

// Rendering
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    composer.render();
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});

animate();