import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export function CozyRoom3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const catHeadRef = useRef<THREE.Group | null>(null);
  const catEarsRef = useRef<THREE.Group | null>(null);
  const fireParticlesRef = useRef<THREE.Points[]>([]);
  const lampLightRef = useRef<THREE.PointLight | null>(null);

  // --- 모닥불 관련 Ref 추가 ---
  const campfireLightRef = useRef<THREE.PointLight | null>(null);
  const campfireParticlesRef = useRef<THREE.Points[]>([]);
  const smokeParticlesRef = useRef<THREE.Points | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffa987);
    scene.fog = new THREE.Fog(0xffa987, 20, 50);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      42,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(14, 11, 14);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 10;
    controls.maxDistance = 30;
    controls.maxPolarAngle = Math.PI / 2.1;
    controls.target.set(0, 2, 0);
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffa987, 0.6);
    scene.add(ambientLight);

    const eveningLight = new THREE.DirectionalLight(0xff7f50, 1.2);
    eveningLight.position.set(-15, 10, -10);
    eveningLight.castShadow = true;
    eveningLight.shadow.mapSize.width = 2048;
    eveningLight.shadow.mapSize.height = 2048;
    eveningLight.shadow.camera.left = -20;
    eveningLight.shadow.camera.right = 20;
    eveningLight.shadow.camera.top = 20;
    eveningLight.shadow.camera.bottom = -20;
    eveningLight.shadow.bias = -0.0001;
    scene.add(eveningLight);

    const fireLight = new THREE.PointLight(0xff7744, 3.0, 12);
    fireLight.position.set(2, 1.5, -2.5);
    fireLight.castShadow = true;
    fireLight.shadow.bias = -0.001;
    scene.add(fireLight);

    const lampLight = new THREE.PointLight(0xffddaa, 1.5, 7);
    lampLight.position.set(0.5, 1.5, 0.3);
    lampLight.castShadow = true;
    scene.add(lampLight);
    lampLightRef.current = lampLight;

    const hemiLight = new THREE.HemisphereLight(0xffa987, 0x6e5a4d, 0.6);
    scene.add(hemiLight);

    // Ground
    const groundGeometry = new THREE.CircleGeometry(30, 32);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x3a4a3f,
      roughness: 0.95,
      metalness: 0.0,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Cabin group
    const cabinGroup = new THREE.Group();

    // Wooden floor - warm wood
    const floorSize = 7;
    const floorGeometry = new THREE.PlaneGeometry(floorSize, floorSize);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x7a5f47,
      roughness: 0.85,
      metalness: 0.0,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0.01;
    floor.receiveShadow = true;
    cabinGroup.add(floor);

    // Floor planks
    for (let i = 0; i < 14; i++) {
      const plankGeometry = new THREE.PlaneGeometry(floorSize, 0.45);
      const plankMaterial = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0x7a5f47 : 0x6f5440,
        roughness: 0.9,
      });
      const plank = new THREE.Mesh(plankGeometry, plankMaterial);
      plank.rotation.x = -Math.PI / 2;
      plank.position.set(0, 0.02, -floorSize / 2 + i * 0.5);
      cabinGroup.add(plank);
    }

    // Walls - warm beige
    const wallHeight = 5;
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x5a4f45,
      roughness: 0.9,
    });

    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(floorSize, wallHeight, 0.25),
      wallMaterial
    );
    backWall.position.set(0, wallHeight / 2, -floorSize / 2);
    backWall.receiveShadow = true;
    backWall.castShadow = true;
    cabinGroup.add(backWall);

    const leftWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, wallHeight, floorSize),
      wallMaterial
    );
    leftWall.position.set(-floorSize / 2, wallHeight / 2, 0);
    leftWall.receiveShadow = true;
    leftWall.castShadow = true;
    cabinGroup.add(leftWall);

    // Ceiling with beams
    const ceilingMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a3f38,
      roughness: 0.9,
    });
    const ceiling = new THREE.Mesh(
      new THREE.BoxGeometry(floorSize + 0.5, 0.25, floorSize + 0.5),
      ceilingMaterial
    );
    ceiling.position.set(0, wallHeight, 0);
    ceiling.castShadow = true;
    cabinGroup.add(ceiling);

    // Ceiling beams
    for (let i = 0; i < 3; i++) {
      const beam = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.3, floorSize + 0.5),
        new THREE.MeshStandardMaterial({ color: 0x5a4a38, roughness: 0.85 })
      );
      beam.position.set(-2 + i * 2, wallHeight - 0.15, 0);
      beam.castShadow = true;
      cabinGroup.add(beam);
    }

    // Window with night view
    const windowGroup = new THREE.Group();

    const windowFrameOuter = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 2.2, 0.18),
      new THREE.MeshStandardMaterial({ color: 0x5a4a38, roughness: 0.75 })
    );
    windowFrameOuter.position.set(0, 0, 0);
    windowGroup.add(windowFrameOuter);

    // Window glass - evening sky
    const windowGlass = new THREE.Mesh(
      new THREE.BoxGeometry(1.9, 1.9, 0.12),
      new THREE.MeshStandardMaterial({
        color: 0x2a3f5a,
        transparent: true,
        opacity: 0.35,
        roughness: 0.1,
        metalness: 0.2,
        emissive: 0x1a2f4a,
        emissiveIntensity: 0.4,
      })
    );
    windowGlass.position.set(0, 0, 0.02);
    windowGroup.add(windowGlass);

    // Window panes
    const paneMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a3f38,
      roughness: 0.7,
    });

    const verticalBar = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 1.9, 0.1),
      paneMaterial
    );
    verticalBar.position.set(0, 0, 0.05);
    windowGroup.add(verticalBar);

    const horizontalBar = new THREE.Mesh(
      new THREE.BoxGeometry(1.9, 0.1, 0.1),
      paneMaterial
    );
    horizontalBar.position.set(0, 0, 0.05);
    windowGroup.add(horizontalBar);

    windowGroup.position.set(1.5, 2.8, -3.37);
    cabinGroup.add(windowGroup);

    // Window sill
    const windowSill = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.15, 0.35),
      new THREE.MeshStandardMaterial({ color: 0x5a4a38, roughness: 0.75 })
    );
    windowSill.position.set(1.5, 1.7, -3.25);
    windowSill.castShadow = true;
    cabinGroup.add(windowSill);

    // Plant on window sill
    const windowPlantPot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.12, 0.2, 12),
      new THREE.MeshStandardMaterial({ color: 0x6a5040, roughness: 0.85 })
    );
    windowPlantPot.position.set(1.5, 1.87, -3.15);
    windowPlantPot.castShadow = true;
    cabinGroup.add(windowPlantPot);

    // Plant leaves - medium green
    const leafMaterial = new THREE.MeshStandardMaterial({
      color: 0x5a7a45,
      roughness: 0.9,
    });
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const leaf = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 8, 8),
        leafMaterial
      );
      leaf.position.set(
        1.5 + Math.cos(angle) * 0.12,
        2.05 + Math.random() * 0.08,
        -3.15 + Math.sin(angle) * 0.12
      );
      leaf.scale.set(0.8, 1.5, 0.5);
      cabinGroup.add(leaf);
    }

    // Fireplace/Stove
    const stoveGroup = new THREE.Group();

    const stoveBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 1.3, 0.7),
      new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.4,
        metalness: 0.6,
      })
    );
    stoveBody.position.set(0, 0.65, 0);
    stoveBody.castShadow = true;
    stoveGroup.add(stoveBody);

    const stoveTop = new THREE.Mesh(
      new THREE.BoxGeometry(1, 0.08, 0.75),
      new THREE.MeshStandardMaterial({
        color: 0x0a0a0a,
        roughness: 0.3,
        metalness: 0.7,
      })
    );
    stoveTop.position.set(0, 1.32, 0);
    stoveGroup.add(stoveTop);

    // Chimney
    const chimneyPipe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 2.8, 12),
      new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.3,
        metalness: 0.7,
      })
    );
    chimneyPipe.position.set(0, 2.7, 0);
    chimneyPipe.castShadow = true;
    stoveGroup.add(chimneyPipe);

    // Stove door - bright glowing
    const stoveDoor = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.6, 0.08),
      new THREE.MeshStandardMaterial({
        color: 0xff4422,
        emissive: 0xff3300,
        emissiveIntensity: 1.5,
        roughness: 0.9,
      })
    );
    stoveDoor.position.set(0, 0.6, 0.36);
    stoveGroup.add(stoveDoor);

    // Door glow effect
    const glowGeometry = new THREE.PlaneGeometry(0.7, 0.7);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xff5522,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.set(0, 0.6, 0.4);
    stoveGroup.add(glow);

    // Door handle
    const doorHandle = new THREE.Mesh(
      new THREE.TorusGeometry(0.08, 0.02, 8, 12),
      new THREE.MeshStandardMaterial({
        color: 0x8b7355,
        roughness: 0.2,
        metalness: 0.8,
      })
    );
    doorHandle.position.set(0.2, 0.6, 0.42);
    doorHandle.rotation.x = Math.PI / 2;
    stoveGroup.add(doorHandle);

    // Stove legs
    for (let i = 0; i < 4; i++) {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.05, 0.35, 8),
        new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.6 })
      );
      const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
      leg.position.set(Math.cos(angle) * 0.35, 0.175, Math.sin(angle) * 0.28);
      stoveGroup.add(leg);
    }

    stoveGroup.position.set(2, 0, -2.5);
    cabinGroup.add(stoveGroup);

    // Fire particles - brighter
    for (let i = 0; i < 6; i++) {
      const particleGeometry = new THREE.BufferGeometry();
      const particleCount = 35;
      const positions = new Float32Array(particleCount * 3);

      for (let j = 0; j < particleCount * 3; j += 3) {
        positions[j] = 2 + (Math.random() - 0.5) * 0.4;
        positions[j + 1] = 0.5 + Math.random() * 1.3;
        positions[j + 2] = -2.5 + (Math.random() - 0.5) * 0.25;
      }

      particleGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );

      const colors = [
        0xff5522, 0xff7733, 0xffaa33, 0xffcc44, 0xffdd66, 0xffffaa,
      ];
      const particleMaterial = new THREE.PointsMaterial({
        color: colors[i],
        size: 0.12,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
      });

      const particles = new THREE.Points(particleGeometry, particleMaterial);
      cabinGroup.add(particles);
      fireParticlesRef.current.push(particles);
    }

    // Firewood basket
    const basketGroup = new THREE.Group();
    const basket = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.3, 0.4, 12),
      new THREE.MeshStandardMaterial({ color: 0x5a4530, roughness: 0.95 })
    );
    basket.position.set(0, 0.2, 0);
    basket.castShadow = true;
    basketGroup.add(basket);

    for (let i = 0; i < 4; i++) {
      const log = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 0.5, 8),
        new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 0.95 })
      );
      log.rotation.set(
        Math.random() * 0.5,
        Math.random() * Math.PI,
        Math.random() * 0.5
      );
      log.position.set(
        (Math.random() - 0.5) * 0.2,
        0.25 + i * 0.08,
        (Math.random() - 0.5) * 0.2
      );
      log.castShadow = true;
      basketGroup.add(log);
    }

    basketGroup.position.set(2.8, 0, -1.8);
    cabinGroup.add(basketGroup);

    // Bed
    const bedGroup = new THREE.Group();

    const bedFrame = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.35, 1.6),
      new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 0.9 })
    );
    bedFrame.position.set(0, 0.175, 0);
    bedFrame.castShadow = true;
    bedGroup.add(bedFrame);

    const mattress = new THREE.Mesh(
      new THREE.BoxGeometry(2.1, 0.35, 1.5),
      new THREE.MeshStandardMaterial({ color: 0x8a7a6a, roughness: 0.9 })
    );
    mattress.position.set(0, 0.525, 0);
    mattress.castShadow = true;
    bedGroup.add(mattress);

    // Blanket - warm brown
    const blanket = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 0.18, 1.3),
      new THREE.MeshStandardMaterial({ color: 0xaa8860, roughness: 0.95 })
    );
    blanket.position.set(0.1, 0.78, 0.1);
    blanket.castShadow = true;
    bedGroup.add(blanket);

    // Pillows
    for (let i = 0; i < 2; i++) {
      const pillow = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.2, 0.45),
        new THREE.MeshStandardMaterial({ color: 0xc0a585, roughness: 0.95 })
      );
      pillow.position.set(-0.7, 0.8, -0.25 + i * 0.5);
      pillow.rotation.z = 0.1;
      pillow.castShadow = true;
      bedGroup.add(pillow);
    }

    // Bed legs
    const bedLegPositions = [
      [-1.0, 0.175, -0.7],
      [-1.0, 0.175, 0.7],
      [1.0, 0.175, -0.7],
      [1.0, 0.175, 0.7],
    ];
    bedLegPositions.forEach((pos) => {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 0.35, 8),
        new THREE.MeshStandardMaterial({ color: 0x3d3025 })
      );
      leg.position.set(pos[0], pos[1], pos[2]);
      bedGroup.add(leg);
    });

    bedGroup.position.set(-1.8, 0, 1.2);
    bedGroup.rotation.y = Math.PI / 2;
    cabinGroup.add(bedGroup);

    // Round table
    const tableGroup = new THREE.Group();

    const tableTop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.7, 0.7, 0.12, 24),
      new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.8 })
    );
    tableTop.position.set(0, 0.85, 0);
    tableTop.castShadow = true;
    tableGroup.add(tableTop);

    const tablePedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.18, 0.8, 12),
      new THREE.MeshStandardMaterial({ color: 0x4f3f2f, roughness: 0.9 })
    );
    tablePedestal.position.set(0, 0.4, 0);
    tableGroup.add(tablePedestal);

    const tableBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.4, 0.08, 16),
      new THREE.MeshStandardMaterial({ color: 0x4f3f2f, roughness: 0.9 })
    );
    tableBase.position.set(0, 0.04, 0);
    tableGroup.add(tableBase);

    // Desk lamp - warm glow
    const lampGroup = new THREE.Group();

    // Lamp base
    const lampBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.05, 12),
      new THREE.MeshStandardMaterial({
        color: 0x3a3a3a,
        roughness: 0.5,
        metalness: 0.5,
      })
    );
    lampBase.position.set(0, 0, 0);
    lampGroup.add(lampBase);

    // Lamp pole
    const lampPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.5, 8),
      new THREE.MeshStandardMaterial({
        color: 0x3a3a3a,
        roughness: 0.4,
        metalness: 0.6,
      })
    );
    lampPole.position.set(0, 0.25, 0);
    lampGroup.add(lampPole);

    // Lamp shade
    const lampShade = new THREE.Mesh(
      new THREE.ConeGeometry(0.2, 0.25, 12, 1, true),
      new THREE.MeshStandardMaterial({
        color: 0xffe4b5,
        emissive: 0xffaa66,
        emissiveIntensity: 0.8,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
      })
    );
    lampShade.position.set(0, 0.55, 0);
    lampGroup.add(lampShade);

    lampGroup.position.set(0.5, 0.92, 0.3);
    tableGroup.add(lampGroup);

    // Coffee cup with steam
    const cupGroup = new THREE.Group();
    const cup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.08, 0.14, 16),
      new THREE.MeshStandardMaterial({ color: 0x4a3a3a, roughness: 0.4 })
    );
    cupGroup.add(cup);

    const cupHandle = new THREE.Mesh(
      new THREE.TorusGeometry(0.06, 0.015, 8, 12, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0x4a3a3a, roughness: 0.4 })
    );
    cupHandle.position.set(0.1, 0, 0);
    cupHandle.rotation.y = -Math.PI / 2;
    cupGroup.add(cupHandle);

    cupGroup.position.set(-0.35, 0.98, 0.15);
    tableGroup.add(cupGroup);

    // Book
    const book = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.04, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x5a3a2a, roughness: 0.95 })
    );
    book.position.set(-0.2, 0.93, -0.2);
    book.rotation.y = 0.3;
    book.castShadow = true;
    tableGroup.add(book);

    tableGroup.position.set(0.5, 0, 0.3);
    cabinGroup.add(tableGroup);

    // Chair
    const chairGroup = new THREE.Group();

    const chairSeat = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.1, 0.55),
      new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.9 })
    );
    chairSeat.position.set(0, 0.55, 0);
    chairSeat.castShadow = true;
    chairGroup.add(chairSeat);

    const chairBack = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.7, 0.1),
      new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.9 })
    );
    chairBack.position.set(0, 0.95, -0.225);
    chairBack.castShadow = true;
    chairGroup.add(chairBack);

    for (let i = 0; i < 3; i++) {
      const slat = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.5, 0.08),
        new THREE.MeshStandardMaterial({ color: 0x4f3f2f })
      );
      slat.position.set(-0.15 + i * 0.15, 0.95, -0.22);
      chairGroup.add(slat);
    }

    const chairLegs = [
      [-0.22, 0.275, -0.22],
      [-0.22, 0.275, 0.22],
      [0.22, 0.275, -0.22],
      [0.22, 0.275, 0.22],
    ];
    chairLegs.forEach((pos) => {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.55, 8),
        new THREE.MeshStandardMaterial({ color: 0x4a3a2a })
      );
      leg.position.set(pos[0], pos[1], pos[2]);
      chairGroup.add(leg);
    });

    chairGroup.position.set(-0.4, 0, 1.2);
    chairGroup.rotation.y = -Math.PI / 5;
    cabinGroup.add(chairGroup);

    // Shelf
    const shelfGroup = new THREE.Group();

    const shelf = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.1, 0.35),
      new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 0.85 })
    );
    shelf.castShadow = true;
    shelfGroup.add(shelf);

    for (let i = 0; i < 2; i++) {
      const bracket = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.35, 0.3),
        new THREE.MeshStandardMaterial({ color: 0x3d3025 })
      );
      bracket.position.set(i === 0 ? -0.7 : 0.7, -0.175, 0);
      shelfGroup.add(bracket);
    }

    shelfGroup.position.set(-1.5, 2.5, -3.3);
    cabinGroup.add(shelfGroup);

    // Items on shelf
    const shelfItems = [
      { type: "plant", x: -0.6 },
      { type: "book", x: -0.2 },
      { type: "book", x: 0 },
      { type: "plant", x: 0.5 },
    ];

    shelfItems.forEach((item) => {
      if (item.type === "plant") {
        const pot = new THREE.Mesh(
          new THREE.CylinderGeometry(0.12, 0.1, 0.18, 12),
          new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 0.9 })
        );
        pot.position.set(-1.5 + item.x, 2.64, -3.2);
        pot.castShadow = true;
        cabinGroup.add(pot);

        for (let i = 0; i < 3; i++) {
          const leaf = new THREE.Mesh(
            new THREE.SphereGeometry(0.08, 8, 8),
            new THREE.MeshStandardMaterial({ color: 0x5a7a45, roughness: 0.9 })
          );
          const angle = (i / 3) * Math.PI * 2;
          leaf.position.set(
            -1.5 + item.x + Math.cos(angle) * 0.1,
            2.75 + Math.random() * 0.05,
            -3.2 + Math.sin(angle) * 0.1
          );
          leaf.scale.set(0.7, 1.3, 0.4);
          cabinGroup.add(leaf);
        }
      } else if (item.type === "book") {
        const bookColor = item.x === -0.2 ? 0x5a3a2a : 0x4a3028;
        const shelfBook = new THREE.Mesh(
          new THREE.BoxGeometry(0.15, 0.25, 0.2),
          new THREE.MeshStandardMaterial({ color: bookColor, roughness: 0.95 })
        );
        shelfBook.position.set(-1.5 + item.x, 2.67, -3.2);
        shelfBook.castShadow = true;
        cabinGroup.add(shelfBook);
      }
    });

    // Floor plant
    const floorPlantGroup = new THREE.Group();
    const floorPot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.2, 0.35, 12),
      new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 0.95 })
    );
    floorPot.position.set(0, 0.175, 0);
    floorPot.castShadow = true;
    floorPlantGroup.add(floorPot);

    for (let i = 0; i < 6; i++) {
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.6, 6),
        new THREE.MeshStandardMaterial({ color: 0x4a6a35 })
      );
      const angle = (i / 6) * Math.PI * 2;
      stem.position.set(Math.cos(angle) * 0.12, 0.5, Math.sin(angle) * 0.12);
      stem.rotation.set(Math.cos(angle) * 0.3, 0, Math.sin(angle) * 0.3);
      floorPlantGroup.add(stem);

      const leaf = new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0x5a7a45, roughness: 0.9 })
      );
      leaf.position.set(Math.cos(angle) * 0.2, 0.75, Math.sin(angle) * 0.2);
      leaf.scale.set(0.9, 1.8, 0.5);
      floorPlantGroup.add(leaf);
    }

    floorPlantGroup.position.set(-2.5, 0, -1.2);
    cabinGroup.add(floorPlantGroup);

    // Cozy rug
    const rugGeometry = new THREE.CircleGeometry(1.3, 32);
    const rugMaterial = new THREE.MeshStandardMaterial({
      color: 0x8a7060,
      roughness: 1.0,
    });
    const rug = new THREE.Mesh(rugGeometry, rugMaterial);
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(0.8, 0.03, 0.5);
    rug.receiveShadow = true;
    cabinGroup.add(rug);

    // BROWN CAT - refined for dark scene
    const catGroup = new THREE.Group();

    const catMainColor = 0x8b6347;
    const catBellyColor = 0xa0826d;
    const catNoseColor = 0xd4a5a5;

    // Body
    const bodyGeometry = new THREE.SphereGeometry(0.35, 16, 16);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: catMainColor,
      roughness: 0.95,
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.scale.set(1, 0.9, 1.1);
    body.position.set(0, 0.35, 0);
    body.castShadow = true;
    catGroup.add(body);

    // Belly
    const belly = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 12, 12),
      new THREE.MeshStandardMaterial({ color: catBellyColor, roughness: 0.95 })
    );
    belly.position.set(0.1, 0.25, 0);
    belly.scale.set(1, 1.2, 0.9);
    catGroup.add(belly);

    // Head group
    const headGroup = new THREE.Group();

    const headGeometry = new THREE.SphereGeometry(0.32, 16, 16);
    const head = new THREE.Mesh(headGeometry, bodyMaterial);
    head.scale.set(1.05, 1, 1);
    head.castShadow = true;
    headGroup.add(head);

    // Muzzle
    const muzzleLeft = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 12, 12),
      new THREE.MeshStandardMaterial({ color: catBellyColor, roughness: 0.95 })
    );
    muzzleLeft.position.set(0.22, -0.08, -0.12);
    muzzleLeft.scale.set(1.2, 0.9, 1);
    headGroup.add(muzzleLeft);

    const muzzleRight = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 12, 12),
      new THREE.MeshStandardMaterial({ color: catBellyColor, roughness: 0.95 })
    );
    muzzleRight.position.set(0.22, -0.08, 0.12);
    muzzleRight.scale.set(1.2, 0.9, 1);
    headGroup.add(muzzleRight);

    // Ears group
    const earsGroup = new THREE.Group();

    const earGeometry = new THREE.ConeGeometry(0.14, 0.3, 4);

    const leftEar = new THREE.Mesh(earGeometry, bodyMaterial);
    leftEar.position.set(-0.02, 0.3, -0.18);
    leftEar.rotation.z = 0.25;
    leftEar.rotation.x = -0.2;
    leftEar.castShadow = true;
    earsGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earGeometry, bodyMaterial);
    rightEar.position.set(-0.02, 0.3, 0.18);
    rightEar.rotation.z = -0.25;
    rightEar.rotation.x = -0.2;
    rightEar.castShadow = true;
    earsGroup.add(rightEar);

    // Inner ears
    const innerEarGeometry = new THREE.ConeGeometry(0.08, 0.18, 4);
    const innerEarMaterial = new THREE.MeshStandardMaterial({
      color: catNoseColor,
      roughness: 0.9,
    });

    const leftInnerEar = new THREE.Mesh(innerEarGeometry, innerEarMaterial);
    leftInnerEar.position.set(0.02, 0.28, -0.18);
    leftInnerEar.rotation.z = 0.25;
    leftInnerEar.rotation.x = -0.2;
    earsGroup.add(leftInnerEar);

    const rightInnerEar = new THREE.Mesh(innerEarGeometry, innerEarMaterial);
    rightInnerEar.position.set(0.02, 0.28, 0.18);
    rightInnerEar.rotation.z = -0.25;
    rightInnerEar.rotation.x = -0.2;
    earsGroup.add(rightInnerEar);

    headGroup.add(earsGroup);
    catEarsRef.current = earsGroup;

    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.08, 12, 12);
    const eyeWhiteMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
      emissive: 0xffffff,
      emissiveIntensity: 0.1,
    });

    const leftEyeWhite = new THREE.Mesh(eyeGeometry, eyeWhiteMaterial);
    leftEyeWhite.position.set(0.25, 0.06, -0.14);
    leftEyeWhite.scale.set(1.3, 1.1, 1);
    headGroup.add(leftEyeWhite);

    const rightEyeWhite = new THREE.Mesh(eyeGeometry, eyeWhiteMaterial);
    rightEyeWhite.position.set(0.25, 0.06, 0.14);
    rightEyeWhite.scale.set(1.3, 1.1, 1);
    headGroup.add(rightEyeWhite);

    // Pupils
    const pupilGeometry = new THREE.SphereGeometry(0.045, 12, 12);
    const pupilMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a2f15,
      emissive: 0x3a5f2e,
      emissiveIntensity: 0.4,
    });

    const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    leftPupil.position.set(0.31, 0.06, -0.14);
    leftPupil.scale.set(1, 1.5, 0.4);
    headGroup.add(leftPupil);

    const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    rightPupil.position.set(0.31, 0.06, 0.14);
    rightPupil.scale.set(1, 1.5, 0.4);
    headGroup.add(rightPupil);

    // Eye highlights
    const highlightGeometry = new THREE.SphereGeometry(0.025, 8, 8);
    const highlightMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 1.0,
    });

    const leftHighlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
    leftHighlight.position.set(0.32, 0.09, -0.13);
    headGroup.add(leftHighlight);

    const rightHighlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
    rightHighlight.position.set(0.32, 0.09, 0.15);
    headGroup.add(rightHighlight);

    // Nose
    const noseGeometry = new THREE.SphereGeometry(0.045, 8, 8);
    const noseMaterial = new THREE.MeshStandardMaterial({
      color: catNoseColor,
      roughness: 0.5,
      emissive: catNoseColor,
      emissiveIntensity: 0.2,
    });
    const nose = new THREE.Mesh(noseGeometry, noseMaterial);
    nose.position.set(0.3, -0.05, 0);
    nose.scale.set(1, 0.8, 0.7);
    headGroup.add(nose);

    headGroup.position.set(0.25, 0.6, 0);
    catGroup.add(headGroup);
    catHeadRef.current = headGroup;

    // Tail
    const tailCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(-0.15, 0.1, -0.05),
      new THREE.Vector3(-0.25, 0.25, -0.08),
      new THREE.Vector3(-0.3, 0.4, -0.05),
    ]);

    const tailGeometry = new THREE.TubeGeometry(tailCurve, 12, 0.08, 8, false);
    const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
    tail.position.set(-0.25, 0.35, 0.05);
    tail.castShadow = true;
    catGroup.add(tail);

    const tailTip = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 12, 12),
      new THREE.MeshStandardMaterial({ color: catBellyColor, roughness: 0.95 })
    );
    tailTip.position.set(-0.55, 0.75, 0);
    tailTip.scale.set(0.8, 1, 0.8);
    catGroup.add(tailTip);

    // Paws
    const pawMaterial = new THREE.MeshStandardMaterial({
      color: catMainColor,
      roughness: 0.95,
    });
    const pawPadMaterial = new THREE.MeshStandardMaterial({
      color: 0x6d5545,
      roughness: 0.95,
    });

    const pawPositions = [
      { x: 0.18, z: -0.2 },
      { x: 0.18, z: 0.2 },
      { x: -0.15, z: -0.2 },
      { x: -0.15, z: 0.2 },
    ];

    pawPositions.forEach((pos) => {
      const paw = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 12, 12),
        pawMaterial
      );
      paw.position.set(pos.x, 0.09, pos.z);
      paw.scale.set(1, 0.7, 1);
      paw.castShadow = true;
      catGroup.add(paw);

      const pawPad = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 8, 8),
        pawPadMaterial
      );
      pawPad.position.set(pos.x + 0.02, 0.05, pos.z);
      pawPad.scale.set(1, 0.5, 0.9);
      catGroup.add(pawPad);
    });

    // Headphones
    const headphoneMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a2a2a,
      roughness: 0.2,
      metalness: 0.8,
    });

    // Headband
    const headbandCurve = new THREE.EllipseCurve(
      0,
      0,
      0.35,
      0.35,
      0,
      Math.PI,
      false,
      0
    );
    const headbandPoints = headbandCurve.getPoints(24);
    const headbandPoints3D = headbandPoints.map(
      (p) => new THREE.Vector3(p.x, p.y, 0)
    );

    const headbandGeometry = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(headbandPoints3D),
      24,
      0.03,
      8,
      false
    );
    const headband = new THREE.Mesh(headbandGeometry, headphoneMaterial);
    headband.position.set(0.25, 0.9, 0);
    headband.rotation.y = Math.PI / 2;
    headband.rotation.z = Math.PI / 2;
    catGroup.add(headband);

    // Ear cups
    const cupGeometry = new THREE.CylinderGeometry(0.13, 0.13, 0.1, 16);

    const leftCup = new THREE.Mesh(cupGeometry, headphoneMaterial);
    leftCup.position.set(0.25, 0.6, -0.32);
    leftCup.rotation.x = Math.PI / 2;
    leftCup.castShadow = true;
    catGroup.add(leftCup);

    const rightCup = new THREE.Mesh(cupGeometry, headphoneMaterial);
    rightCup.position.set(0.25, 0.6, 0.32);
    rightCup.rotation.x = Math.PI / 2;
    rightCup.castShadow = true;
    catGroup.add(rightCup);

    // Cushions
    const cushionMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a4a4a,
      roughness: 1.0,
    });
    const cushionGeometry = new THREE.CylinderGeometry(0.11, 0.11, 0.05, 16);

    const leftCushion = new THREE.Mesh(cushionGeometry, cushionMaterial);
    leftCushion.position.set(0.25, 0.6, -0.36);
    leftCushion.rotation.x = Math.PI / 2;
    catGroup.add(leftCushion);

    const rightCushion = new THREE.Mesh(cushionGeometry, cushionMaterial);
    rightCushion.position.set(0.25, 0.6, 0.36);
    rightCushion.rotation.x = Math.PI / 2;
    catGroup.add(rightCushion);

    // Logo detail
    for (let i = 0; i < 2; i++) {
      const logo = new THREE.Mesh(
        new THREE.CircleGeometry(0.03, 12),
        new THREE.MeshStandardMaterial({
          color: 0x8b7355,
          metalness: 0.9,
          roughness: 0.1,
        })
      );
      logo.position.set(0.3, 0.6, i === 0 ? -0.32 : 0.32);
      logo.rotation.y = Math.PI / 2;
      catGroup.add(logo);
    }

    catGroup.position.set(1.2, 0.03, 0.6);
    catGroup.rotation.y = -Math.PI / 8;
    cabinGroup.add(catGroup);

    scene.add(cabinGroup);

    // Evening trees
    const createNightTree = (x: number, z: number, scale: number) => {
      const treeGroup = new THREE.Group();

      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18 * scale, 0.22 * scale, 1.8 * scale, 8),
        new THREE.MeshStandardMaterial({
          color: 0x4a3f38,
          roughness: 0.95,
          flatShading: true,
        })
      );
      trunk.position.y = 0.9 * scale;
      trunk.castShadow = true;
      treeGroup.add(trunk);

      const foliageColors = [0x4a6a35, 0x5a7a45, 0x3a5a2a];
      for (let i = 0; i < 3; i++) {
        const size = (1.4 - i * 0.3) * scale;
        const cone = new THREE.Mesh(
          new THREE.ConeGeometry(size, size * 1.6, 7),
          new THREE.MeshStandardMaterial({
            color: foliageColors[i],
            roughness: 0.95,
            flatShading: true,
          })
        );
        cone.position.y = 1.5 * scale + i * 0.7 * scale;
        cone.castShadow = true;
        cone.rotation.y = i * 0.5;
        treeGroup.add(cone);
      }

      treeGroup.position.set(x, 0, z);
      return treeGroup;
    };

    const treePositions = [
      [-10, -9, 1.3],
      [-7, -11, 1.1],
      [-12, -6, 1.4],
      [-9, -13, 1.0],
      [9, -9, 1.2],
      [7, -11, 1.4],
      [11, -7, 1.1],
      [10, -12, 1.0],
      [-9, 10, 1.3],
      [-11, 12, 1.2],
      [8, 11, 1.1],
      [11, 9, 1.3],
      [6, 9, 0.9],
      [-6, 11, 1.0],
      [13, 7, 1.2],
      [-13, 8, 1.1],
    ];

    treePositions.forEach(([x, z, scale]) => {
      scene.add(createNightTree(x, z, scale));
    });

    // Evening rocks
    for (let i = 0; i < 8; i++) {
      const rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.3 + Math.random() * 0.3, 0),
        new THREE.MeshStandardMaterial({
          color: 0x5a5a5a,
          roughness: 0.95,
          flatShading: true,
        })
      );
      const angle = (i / 8) * Math.PI * 2;
      const distance = 8 + Math.random() * 4;
      rock.position.set(
        Math.cos(angle) * distance,
        0.15,
        Math.sin(angle) * distance
      );
      rock.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      rock.castShadow = true;
      rock.receiveShadow = true;
      scene.add(rock);
    }

    // --- 모닥불 생성 코드 시작 ---
    const campfireGroup = new THREE.Group();
    scene.add(campfireGroup);
    campfireGroup.position.set(-5, 0.1, 5); // 숲속 위치 지정

    // 모닥불 주변 돌
    const rockMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a4a4a,
      roughness: 0.9,
    });
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const radius = 1.2;
      const rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.2 + Math.random() * 0.15, 0),
        rockMaterial
      );
      rock.position.set(
        Math.cos(angle) * radius + (Math.random() - 0.5) * 0.2,
        0.1,
        Math.sin(angle) * radius + (Math.random() - 0.5) * 0.2
      );
      rock.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      rock.castShadow = true;
      campfireGroup.add(rock);
    }

    // 모닥불 장작
    const logMaterial = new THREE.MeshStandardMaterial({
      color: 0x4d3a2a,
      roughness: 0.9,
    });
    const logGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1.5, 8);
    for (let i = 0; i < 4; i++) {
      const log = new THREE.Mesh(logGeometry, logMaterial);
      const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
      log.position.set(Math.cos(angle) * 0.4, 0.6, Math.sin(angle) * 0.4);
      log.rotation.z = Math.PI / 2 - 0.4; // 안쪽으로 기울이기
      log.rotation.y = -angle; // 중심을 향하도록 회전
      log.castShadow = true;
      campfireGroup.add(log);
    }

    // 모닥불 조명
    const campfireLight = new THREE.PointLight(0xff7a00, 2.0, 15);
    campfireLight.position.set(0, 0.8, 0);
    campfireLight.castShadow = true;
    campfireLight.shadow.bias = -0.001;
    campfireGroup.add(campfireLight);
    campfireLightRef.current = campfireLight;

    // 모닥불 불꽃 파티클
    const fireColors = [0xff6a00, 0xff8c00, 0xffa500, 0xffd700];
    fireColors.forEach((color, index) => {
      const particleGeometry = new THREE.BufferGeometry();
      const particleCount = 20;
      const positions = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 0.6;
        positions[i + 1] = Math.random() * 1.5;
        positions[i + 2] = (Math.random() - 0.5) * 0.6;
      }
      particleGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );

      const particleMaterial = new THREE.PointsMaterial({
        color: color,
        size: 0.15,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const particles = new THREE.Points(particleGeometry, particleMaterial);
      campfireGroup.add(particles);
      campfireParticlesRef.current.push(particles);
    });

    // 연기 파티클
    const smokeGeometry = new THREE.BufferGeometry();
    const smokeCount = 25;
    const smokePositions = new Float32Array(smokeCount * 3);
    for (let i = 0; i < smokeCount * 3; i += 3) {
      smokePositions[i] = (Math.random() - 0.5) * 1.0;
      smokePositions[i + 1] = Math.random() * 3.0;
      smokePositions[i + 2] = (Math.random() - 0.5) * 1.0;
    }
    smokeGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(smokePositions, 3)
    );
    const smokeMaterial = new THREE.PointsMaterial({
      color: 0x666666,
      size: 0.3,
      transparent: true,
      opacity: 0.25,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });
    const smoke = new THREE.Points(smokeGeometry, smokeMaterial);
    smoke.position.y = 1;
    campfireGroup.add(smoke);
    smokeParticlesRef.current = smoke;
    // --- 모닥불 생성 코드 끝 ---

    // Animation
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;

      // Cat head bobbing
      if (catHeadRef.current) {
        catHeadRef.current.rotation.z = Math.sin(time * 2.2) * 0.12;
        catHeadRef.current.rotation.x = Math.sin(time * 1.8) * 0.06;
        catHeadRef.current.position.y = 0.6 + Math.sin(time * 2.2) * 0.015;
      }

      // Ears wiggle
      if (catEarsRef.current) {
        catEarsRef.current.rotation.x = Math.sin(time * 1.5) * 0.03;
      }

      // (Stove) Fire particles
      fireParticlesRef.current.forEach((particles) => {
        const positions = particles.geometry.attributes.position
          .array as Float32Array;
        for (let i = 0; i < positions.length; i += 3) {
          positions[i + 1] += 0.014 + Math.random() * 0.014;
          positions[i] += (Math.random() - 0.5) * 0.01;

          if (positions[i + 1] > 2.5) {
            positions[i + 1] = 0.5;
            positions[i] = 2 + (Math.random() - 0.5) * 0.4;
            positions[i + 2] = -2.5 + (Math.random() - 0.5) * 0.25;
          }
        }
        particles.geometry.attributes.position.needsUpdate = true;
      });

      // Fire light flicker
      fireLight.intensity =
        2.5 + Math.sin(time * 4.5) * 0.4 + Math.random() * 0.3;
      fireLight.color.setHex(time % 1 < 0.5 ? 0xff6b35 : 0xff7744);

      // Lamp light subtle flicker
      if (lampLightRef.current) {
        lampLightRef.current.intensity = 1.2 + Math.sin(time * 2) * 0.1;
      }

      // --- 모닥불 애니메이션 시작 ---
      // 모닥불 조명 깜빡임
      if (campfireLightRef.current) {
        campfireLightRef.current.intensity =
          1.8 + Math.sin(time * 6) * 0.5 + Math.random() * 0.4;
      }

      // 모닥불 불꽃 애니메이션
      campfireParticlesRef.current.forEach((particles) => {
        const positions = particles.geometry.attributes.position
          .array as Float32Array;
        for (let i = 0; i < positions.length; i += 3) {
          positions[i + 1] += 0.01 + Math.random() * 0.01; // 위로 상승
          positions[i] += (Math.random() - 0.5) * 0.01;
          positions[i + 2] += (Math.random() - 0.5) * 0.01;

          if (positions[i + 1] > 2.0) {
            // 일정 높이 도달 시 리셋
            positions[i + 1] = Math.random() * 0.5;
            positions[i] = (Math.random() - 0.5) * 0.6;
            positions[i + 2] = (Math.random() - 0.5) * 0.6;
          }
        }
        particles.geometry.attributes.position.needsUpdate = true;
      });

      // 연기 애니메이션
      if (smokeParticlesRef.current) {
        const positions = smokeParticlesRef.current.geometry.attributes.position
          .array as Float32Array;
        for (let i = 0; i < positions.length; i += 3) {
          positions[i + 1] += 0.008 + Math.random() * 0.002; // 천천히 상승
          positions[i] += (Math.random() - 0.5) * 0.008; // 바람 효과
          positions[i + 2] += (Math.random() - 0.5) * 0.002;

          if (positions[i + 1] > 4.0) {
            // 일정 높이 도달 시 리셋
            positions[i + 1] = Math.random() * 0.5;
            positions[i] = (Math.random() - 0.5) * 1.0;
            positions[i + 2] = (Math.random() - 0.5) * 1.0;
          }
        }
        smokeParticlesRef.current.geometry.attributes.position.needsUpdate =
          true;
      }
      // --- 모닥불 애니메이션 끝 ---

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
}
