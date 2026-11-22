
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x080d18);
scene.fog = new THREE.Fog(0x080d18, 15, 35);

const camera = new THREE.PerspectiveCamera(
  45, window.innerWidth / window.innerHeight, 0.1, 100
);
camera.position.set(9, 7, 13);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0, 0);

scene.add(new THREE.HemisphereLight(0x9abaff, 0x26303c, 2));

const keyLight = new THREE.DirectionalLight(0xffffff, 3);
keyLight.position.set(5, 10, 8);
scene.add(keyLight);

const metal = new THREE.MeshStandardMaterial({
  color: 0x71869a,
  metalness: 0.85,
  roughness: 0.27,
  side: THREE.DoubleSide
});

const darkMetal = new THREE.MeshStandardMaterial({
  color: 0x26394c,
  metalness: 0.8,
  roughness: 0.35,
  side: THREE.DoubleSide
});

const blue = new THREE.MeshBasicMaterial({ color: 0x168cff });
const orange = new THREE.MeshBasicMaterial({ color: 0xff5b20 });

const hotGlow = new THREE.MeshBasicMaterial({
  color: 0xff4015,
  transparent: true,
  opacity: 0.24,
  side: THREE.DoubleSide
});

// Build a tapered longitudinal surface.
// Each profile point is [x, y].
function makeSurface(profile, material, z1, z2) {
  const vertices = [];
  const indices = [];

  for (const [x, y] of profile) {
    vertices.push(x, y, z1);
    vertices.push(x, y, z2);
  }

  for (let i = 0; i < profile.length - 1; i++) {
    const a = i * 2;
    const b = a + 2;

    indices.push(a, b, a + 1);
    indices.push(b, b + 1, a + 1);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(vertices, 3)
  );
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  return mesh;
}

// Engine profile: inlet, isolator, combustor and nozzle.
// This is a conceptual visualization, not a dimensioned engine.
const upperProfile = [
  [-5, 1.0],
  [-3.5, 0.65],
  [-2.5, 0.35],
  [-1.2, 0.35],
  [0.8, 0.35],
  [2.0, 0.55],
  [3.5, 1.05],
  [4.5, 1.35]
];

const lowerProfile = [
  [-5, -0.55],
  [-3.5, -0.45],
  [-2.5, -0.25],
  [-1.2, -0.25],
  [0.8, -0.25],
  [2.0, -0.45],
  [3.5, -0.85],
  [4.5, -1.15]
];

// Engine top and bottom surfaces
makeSurface(upperProfile, metal, -0.9, 0.9);
makeSurface(lowerProfile, darkMetal, -0.9, 0.9);

// Side panels
makeSurface(upperProfile, metal, -0.94, -0.9);
makeSurface(upperProfile, metal, 0.9, 0.94);
makeSurface(lowerProfile, darkMetal, -0.94, -0.9);
makeSurface(lowerProfile, darkMetal, 0.9, 0.94);

// Internal combustion glow
const glowGeometry = new THREE.BufferGeometry();
const glowVertices = [
  -1.2, -0.22, -0.65,
  1.0, -0.22, -0.65,
  2.0, 0.5, -0.65,
  -1.2, 0.33, -0.65,
  1.0, 0.33, -0.65,
  2.0, 0.5, -0.65
];

glowGeometry.setAttribute(
  'position',
  new THREE.Float32BufferAttribute(glowVertices, 3)
);
glowGeometry.setIndex([0, 1, 4, 0, 4, 3, 1, 2, 4, 2, 5, 4]);
glowGeometry.computeVertexNormals();

scene.add(new THREE.Mesh(glowGeometry, hotGlow));

 // =================================
 // SHOCKWAVE VISUALIZATION
 // =================================


// =================================
// ENHANCED SHOCKWAVE VISUALIZATION
// =================================


// =================================
// FULL-WIDTH 3D SHOCKWAVE SYSTEM
// =================================

const shockwaveGroup = new THREE.Group();
scene.add(shockwaveGroup);

const shockMaterials = [];


function createShockSurface(x1, y1, x2, y2, opacity) {

  const zFront = -0.82;
  const zBack = 0.82;

  const lengthSegments = 12;
  const widthSegments = 32;

  const vertices = [];
  const indices = [];

  // Build a curved 3D shockwave surface
  for (let i = 0; i <= lengthSegments; i++) {

    const t = i / lengthSegments;

    for (let j = 0; j <= widthSegments; j++) {

      const v = j / widthSegments;
      const z = zFront + v * (zBack - zFront);

      // Curvature across the engine width
      const curve = Math.sin(v * Math.PI);

      const x =
        x1 + (x2 - x1) * t +
        curve * 0.20;

      const y =
        y1 + (y2 - y1) * t +
        curve * 0.12;

      vertices.push(x, y, z);
    }
  }

  // Connect vertices into triangles
  for (let i = 0; i < lengthSegments; i++) {

    for (let j = 0; j < widthSegments; j++) {

      const a = i * (widthSegments + 1) + j;
      const b = a + widthSegments + 1;

      indices.push(a, b, a + 1);
      indices.push(b, b + 1, a + 1);
    }
  }

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(vertices, 3)
  );

  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  const material = new THREE.MeshBasicMaterial({
    color: 0x36baff,
    transparent: true,
    opacity: opacity,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const surface = new THREE.Mesh(geometry, material);

  surface.renderOrder = 3;
  shockwaveGroup.add(surface);
  shockMaterials.push(material);

  // Draw the curved outer boundary
  const edgePoints = [];

  for (let j = 0; j <= widthSegments; j++) {
    const v = j / widthSegments;
    const z = zFront + v * (zBack - zFront);
    const curve = Math.sin(v * Math.PI);

    edgePoints.push(new THREE.Vector3(
      x1 + curve * 0.20,
      y1 + curve * 0.12,
      z
    ));
  }

  for (let j = widthSegments; j >= 0; j--) {
    const v = j / widthSegments;
    const z = zFront + v * (zBack - zFront);
    const curve = Math.sin(v * Math.PI);

    edgePoints.push(new THREE.Vector3(
      x2 + curve * 0.20,
      y2 + curve * 0.12,
      z
    ));
  }

  const edgeGeometry = new THREE.BufferGeometry()
    .setFromPoints(edgePoints);

  const edgeMaterial = new THREE.LineBasicMaterial({
    color: 0x9deaff,
    transparent: true,
    opacity: 0.95,
    depthWrite: false
  });

  const edges = new THREE.LineLoop(
    edgeGeometry,
    edgeMaterial
  );

  edges.renderOrder = 4;
  shockwaveGroup.add(edges);
}


// Primary inlet shock
createShockSurface(
  -3.5, -0.42,
  -2.55, 0.20,
  0.38
);

// Secondary compression shock
createShockSurface(
  -3.1, -0.32,
  -2.25, 0.19,
  0.30
);

// Third compression structure
createShockSurface(
  -2.7, -0.25,
  -1.95, 0.18,
  0.25
);

// Fourth, weaker compression structure
createShockSurface(
  -2.35, -0.20,
  -1.65, 0.16,
  0.20
);

// Combustion illumination
const combustionLight = new THREE.PointLight(
  0xff481c,
  2,
  5
);


combustionLight.position.set(0, 0, 0);
scene.add(combustionLight);

// =================================
// 3D COMBUSTION FLAME
// =================================

const flameGroup = new THREE.Group();
scene.add(flameGroup);

const outerFlame = new THREE.Mesh(
  new THREE.SphereGeometry(1, 32, 24),
  new THREE.MeshBasicMaterial({
    color: 0xff2400,
    transparent: true,
    opacity: 0.20,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
);

outerFlame.scale.set(1.45, 0.32, 0.75);
outerFlame.position.set(0.55, 0.02, 0);
flameGroup.add(outerFlame);

const middleFlame = new THREE.Mesh(
  new THREE.SphereGeometry(1, 32, 24),
  new THREE.MeshBasicMaterial({
    color: 0xff6500,
    transparent: true,
    opacity: 0.30,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
);

middleFlame.scale.set(1.05, 0.23, 0.55);
middleFlame.position.set(0.65, 0.02, 0);
flameGroup.add(middleFlame);

const innerFlame = new THREE.Mesh(
  new THREE.SphereGeometry(1, 32, 24),
  new THREE.MeshBasicMaterial({
    color: 0xffd447,
    transparent: true,
    opacity: 0.38,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
);

innerFlame.scale.set(0.55, 0.13, 0.34);
innerFlame.position.set(0.65, 0.02, 0);
flameGroup.add(innerFlame);

let shockwaveTime = 0;



// =================================
// SHOCKWAVE SCIENCE INFORMATION
// =================================


 // =================================
 // COLLAPSIBLE SHOCKWAVE INFORMATION
 // =================================

 const shockInfo = document.createElement('div');

 shockInfo.id = 'shockInfo';
 
 shockInfo.innerHTML = `
   <button id="shockClose" class="info-close">×</button>
 
   <div class="shock-eyebrow">FLIGHT PHYSICS // 01</div>
 
   <h2>OBLIQUE SHOCKWAVES</h2>
 
   <div class="shock-divider"></div>
 
   <p>
     When supersonic air encounters an angled surface,
     it can form an oblique shockwave.
   </p>
 
   <h3>WHAT HAPPENS?</h3>
 
   <ul>
     <li>Air pressure increases across the shock.</li>
     <li>Air temperature increases.</li>
     <li>Air density increases.</li>
     <li>The airflow direction changes.</li>
   </ul>
 
   <h3>WHY DOES IT MATTER?</h3>
 
   <p>
     The inlet uses shockwave compression to prepare
     incoming air for the combustion process.
     In a scramjet, the airflow remains supersonic
     through the combustor.
   </p>
 
   <div class="shock-note">
     BLUE SHEETS = CONCEPTUAL SHOCKWAVE LOCATIONS
   </div>
 `;
 
 document.body.appendChild(shockInfo);
 
 // Create the information button
 const shockButton = document.createElement('button');
 
 shockButton.id = 'shockButton';
 shockButton.textContent = 'ⓘ  SHOCKWAVES';
 document.body.appendChild(shockButton);
 
 // Styling
 const shockInfoStyle = document.createElement('style');
 
 shockInfoStyle.textContent = `
   #shockButton {
     position: fixed;
     left: 20px;
     bottom: 20px;
     padding: 13px 18px;
     color: #78c9ff;
     background: rgba(9, 19, 34, 0.95);
     border: 1px solid #3285bd;
     border-radius: 8px;
     font-family: Arial, sans-serif;
     font-size: 11px;
     letter-spacing: 1px;
     cursor: pointer;
     z-index: 20;
     transition: 0.2s;
   }
 
   #shockButton:hover {
     background: #163451;
     border-color: #70caff;
   }
 
   #shockInfo {
     display: none;
     position: fixed;
     left: 20px;
     bottom: 75px;
     width: 310px;
     max-height: 65vh;
     overflow-y: auto;
     padding: 20px;
     color: #e8f1ff;
     background: rgba(9, 19, 34, 0.97);
     border: 1px solid #3285bd;
     border-radius: 10px;
     font-family: Arial, sans-serif;
     z-index: 20;
     backdrop-filter: blur(12px);
     box-shadow: 0 10px 35px #0008;
   }
 
   #shockInfo.open {
     display: block;
   }
 
   .info-close {
     float: right;
     color: #a9c7df;
     background: transparent;
     border: none;
     font-size: 22px;
     cursor: pointer;
   }
 
   .info-close:hover {
     color: white;
   }
 
   .shock-eyebrow {
     color: #62c5ff;
     font-size: 9px;
     letter-spacing: 2px;
     margin-bottom: 9px;
   }
 
   #shockInfo h2 {
     font-size: 17px;
     margin-bottom: 12px;
   }
 
   .shock-divider {
     height: 1px;
     background: #31516f;
     margin-bottom: 14px;
   }
 
   #shockInfo p {
     color: #b9cce0;
     font-size: 11px;
     line-height: 1.7;
     margin-bottom: 14px;
   }
 
   #shockInfo h3 {
     font-size: 10px;
     letter-spacing: 1px;
     color: #65baff;
     margin: 13px 0 8px;
   }
 
   #shockInfo ul {
     padding-left: 17px;
     color: #b9cce0;
     font-size: 11px;
     line-height: 1.9;
   }
 
   .shock-note {
     border-top: 1px solid #31516f;
     padding-top: 12px;
     margin-top: 14px;
     color: #65baff;
     font-size: 8px;
     letter-spacing: 1px;
   }
 
   @media (max-width: 700px) {
     #shockInfo {
       width: 245px;
       left: 10px;
       bottom: 65px;
       padding: 13px;
     }
 
     #shockButton {
       left: 10px;
       bottom: 10px;
     }
   }
 `;
 
 document.head.appendChild(shockInfoStyle);

 // =================================
 // INTERACTIVE ENGINE GUIDE
 // =================================

const engineGuide = document.createElement('div');

engineGuide.id = 'engineGuide';

engineGuide.innerHTML = `
  <button id="guideClose" class="guide-close">×</button>

  <div class="guide-eyebrow">ENGINE EXPLORER</div>
  <h2 id="guideTitle">ENGINE GUIDE</h2>

  <div class="guide-divider"></div>

  <div id="guideTopics">
    <button class="guide-topic" data-section="INLET">
      01 — INLET
    </button>

    <button class="guide-topic" data-section="ISOLATOR">
      02 — ISOLATOR
    </button>

    <button class="guide-topic" data-section="COMBUSTOR">
      03 — COMBUSTOR
    </button>

    <button class="guide-topic" data-section="NOZZLE">
      04 — NOZZLE
    </button>
  </div>

  <div id="guideContent">
    <p>Select an engine section above to learn how it works.</p>
  </div>
`;

document.body.appendChild(engineGuide);

// Engine Guide button
const guideButton = document.createElement('button');

guideButton.id = 'guideButton';
guideButton.textContent = 'ENGINE GUIDE';
document.body.appendChild(guideButton);

// Engine Guide styles
const guideStyle = document.createElement('style');

guideStyle.textContent = `
  #guideButton {
    position: fixed;
    left: 165px;
    bottom: 20px;
    padding: 13px 18px;
    color: #8ce0b5;
    background: rgba(9, 19, 34, 0.95);
    border: 1px solid #3a9271;
    border-radius: 8px;
    font-family: Arial, sans-serif;
    font-size: 11px;
    letter-spacing: 1px;
    cursor: pointer;
    z-index: 20;
  }

  #guideButton:hover {
    background: #163b34;
  }

  #engineGuide {
    display: none;
    position: fixed;
    left: 165px;
    bottom: 75px;
    width: 320px;
    max-height: 65vh;
    overflow-y: auto;
    padding: 20px;
    color: #e8f1ff;
    background: rgba(9, 19, 34, 0.97);
    border: 1px solid #3a9271;
    border-radius: 10px;
    font-family: Arial, sans-serif;
    z-index: 20;
    backdrop-filter: blur(12px);
    box-shadow: 0 10px 35px #0008;
  }

  #engineGuide.open {
    display: block;
  }

  .guide-close {
    float: right;
    color: #a9c7df;
    background: transparent;
    border: none;
    font-size: 22px;
    cursor: pointer;
  }

  .guide-eyebrow {
    color: #79d9aa;
    font-size: 9px;
    letter-spacing: 2px;
    margin-bottom: 8px;
  }

  #engineGuide h2 {
    font-size: 17px;
    margin: 8px 0 14px;
  }

  .guide-divider {
    height: 1px;
    background: #31516f;
    margin-bottom: 14px;
  }

  .guide-topic {
    display: block;
    width: 100%;
    padding: 11px;
    margin-bottom: 7px;
    text-align: left;
    color: #c6ddf4;
    background: #14263c;
    border: 1px solid #294767;
    border-radius: 6px;
    cursor: pointer;
    font-size: 11px;
    letter-spacing: 1px;
  }

  .guide-topic:hover {
    background: #1d3a58;
    border-color: #65baff;
  }

  .guide-topic.active {
    background: #173c36;
    border-color: #67d6a4;
    color: #9cf0c5;
  }

  #guideContent {
    margin-top: 16px;
    padding-top: 14px;
    border-top: 1px solid #31516f;
  }

  #guideContent h3 {
    color: #79d9aa;
    font-size: 12px;
    letter-spacing: 1px;
    margin-bottom: 10px;
  }

  #guideContent p {
    color: #b9cce0;
    font-size: 11px;
    line-height: 1.8;
    margin-bottom: 12px;
  }

  #guideContent strong {
    color: #e8f1ff;
  }

  @media (max-width: 650px) {
    #guideButton {
      left: 125px;
      bottom: 10px;
    }

    #engineGuide {
      left: 10px;
      bottom: 65px;
      width: 260px;
    }
  }
`;

document.head.appendChild(guideStyle);

// Engine guide descriptions
const engineGuideDescriptions = {
  INLET: `
    <h3>INLET — CAPTURING THE AIR</h3>

    <p>
      A scramjet inlet captures incoming air traveling at
      hypersonic speeds and directs it into the engine.
    </p>

    <p>
      The inlet geometry creates compression that increases
      the air's pressure and temperature. This prepares the
      airflow for combustion while it remains supersonic.
    </p>

    <p>
      <strong>Key role:</strong> Capture and compress incoming airflow.
    </p>
  `,

  ISOLATOR: `
    <h3>ISOLATOR — MANAGING THE FLOW</h3>

    <p>
      The isolator is a section between the inlet and
      combustor that helps manage interactions between
      compression waves and the airflow.
    </p>

    <p>
      Changes in pressure from the combustor can influence
      upstream airflow. The isolator provides a region where
      these interactions can occur.
    </p>

    <p>
      <strong>Key role:</strong> Help manage pressure
      disturbances and airflow stability.
    </p>
  `,

  COMBUSTOR: `
    <h3>COMBUSTOR — ADDING ENERGY</h3>

    <p>
      Fuel mixes with the incoming air and releases chemical
      energy through combustion.
    </p>

    <p>
      Unlike a conventional jet engine, a scramjet is designed
      to keep the airflow supersonic through the combustor.
      This makes mixing and maintaining combustion especially
      challenging because the air moves through the engine
      extremely quickly.
    </p>

    <p>
      <strong>Key role:</strong> Release energy into the
      moving airflow.
    </p>
  `,

  NOZZLE: `
    <h3>NOZZLE — PRODUCING THRUST</h3>

    <p>
      The nozzle directs the hot gases toward the rear of
      the engine.
    </p>

    <p>
      As exhaust expands through the nozzle, its pressure
      energy is converted into directed momentum. The engine
      produces thrust as it accelerates exhaust backward,
      generating a forward reaction force.
    </p>

    <p>
      <strong>Key role:</strong> Accelerate and direct the
      exhaust to generate thrust.
    </p>
  `
};

// Open and close guide
guideButton.addEventListener('click', () => {
  engineGuide.classList.toggle('open');
});

document.getElementById('guideClose').addEventListener('click', () => {
  engineGuide.classList.remove('open');
});

// Select engine sections
document.querySelectorAll('.guide-topic').forEach(button => {
  button.addEventListener('click', () => {

    const section = button.dataset.section;

    document.querySelectorAll('.guide-topic').forEach(topic => {
      topic.classList.remove('active');
    });

    button.classList.add('active');

    document.getElementById('guideTitle').textContent = section;

    document.getElementById('guideContent').innerHTML =
      engineGuideDescriptions[section];
  });
});
// =================================
// FLOW VISUALIZATION LEGEND
// =================================

const flowLegend = document.createElement('div');

flowLegend.id = 'flowLegend';

flowLegend.innerHTML = `
  <div class="legend-title">FLOW VISUALIZATION</div>

  <div class="legend-item">
    <span class="legend-dot blue"></span>
    <span>Incoming Flow</span>
  </div>

  <div class="legend-item">
  <span class="legend-dot purple"></span>
  <span>Fuel Injection</span>
</div>

  <div class="legend-item">
    <span class="legend-dot orange"></span>
    <span>Hot Flow</span>
  </div>

  <div class="legend-item">
    <span class="legend-dot yellow"></span>
    <span>Energy Visualization</span>
  </div>

  <div class="legend-note">
    Colors are illustrative and do not represent
    calibrated temperature or pressure values.
  </div>
`;

document.body.appendChild(flowLegend);

// Flow legend styles
const flowLegendStyle = document.createElement('style');

flowLegendStyle.textContent = `
  #flowLegend {
    position: fixed;
    left: 20px;
    top: 20px;
    width: 190px;
    padding: 16px;
    background: rgba(9, 19, 34, 0.94);
    border: 1px solid #294767;
    border-radius: 10px;
    font-family: Arial, sans-serif;
    color: #e8f1ff;
    z-index: 20;
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 25px #0006;
  }

  .legend-title {
    font-size: 10px;
    letter-spacing: 2px;
    color: #8ce0b5;
    margin-bottom: 14px;
    font-weight: bold;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 11px;
    font-size: 11px;
    color: #c6ddf4;
  }

  .legend-dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .legend-dot.blue {
    background: #42a5ff;
    box-shadow: 0 0 8px #42a5ff88;
  }

  .legend-dot.purple {
    background: #a16aff;
    box-shadow: 0 0 8px #a16aff88;
  }

  .legend-dot.orange {
    background: #ff922b;
    box-shadow: 0 0 8px #ff922b88;
  }

  .legend-dot.yellow {
    background: #ffe34d;
    box-shadow: 0 0 8px #ffe34d88;
  }

  .legend-note {
    margin-top: 12px;
    padding-top: 10px;
    border-top: 1px solid #294767;
    color: #8198b1;
    font-size: 9px;
    line-height: 1.6;
  }

  @media (max-width: 650px) {
    #flowLegend {
      left: 20px;
      top: 20px;
      width: 155px;
      padding: 12px;
    }
  }
`;

document.head.appendChild(flowLegendStyle);

 
 // Open and close the information panel
 shockButton.addEventListener('click', () => {
   shockInfo.classList.toggle('open');
 });
 
 document.getElementById('shockClose').addEventListener('click', () => {
   shockInfo.classList.remove('open');
 });
 

 
// =================================
// CFD-STYLE TEMPERATURE / PRESSURE MAP
// =================================

let fieldMode = 'temperature';

const fieldGeometry = new THREE.BufferGeometry();

const xSteps = 100;
const zSteps = 24;

const fieldPositions = [];
const fieldColors = [];
const fieldIndices = [];

const colorBlue = new THREE.Color(0x087bff);
const colorCyan = new THREE.Color(0x00d9ff);
const colorGreen = new THREE.Color(0x30dc86);
const colorYellow = new THREE.Color(0xffe52e);
const colorOrange = new THREE.Color(0xff861c);
const colorRed = new THREE.Color(0xff2515);

const colorStops = [
  [0, colorBlue],
  [0.2, colorCyan],
  [0.4, colorGreen],
  [0.6, colorYellow],
  [0.8, colorOrange],
  [1, colorRed]
];

// Find the lower engine wall height at a given x position
function getFloorHeight(x) {
  for (let i = 0; i < lowerProfile.length - 1; i++) {
    const a = lowerProfile[i];
    const b = lowerProfile[i + 1];

    if (x >= a[0] && x <= b[0]) {
      const t = (x - a[0]) / (b[0] - a[0]);
      return a[1] + (b[1] - a[1]) * t;
    }
  }

  return -0.5;
}

// Illustrative temperature and pressure fields
function getFieldValue(x, mode) {
  if (mode === 'temperature') {
    if (x < -3.5) return 0.08;
    if (x < -2.5) return 0.08 + (x + 3.5) * 0.30;
    if (x < -1.0) return 0.38 + (x + 2.5) * 0.20;
    if (x < 1.0) return 0.68 + (x + 1.0) * 0.14;
    if (x < 2.5) return 0.96 - (x - 1.0) * 0.12;
    return Math.max(0.45, 0.78 - (x - 2.5) * 0.18);
  }

  // Illustrative relative pressure distribution
  if (x < -3.5) return 0.25;
  if (x < -2.5) return 0.25 + (x + 3.5) * 0.55;
  if (x < -1.0) return 0.8;
  if (x < 1.0) return 0.8 - (x + 1.0) * 0.12;
  if (x < 2.5) return 0.56 - (x - 1.0) * 0.20;
  return Math.max(0.12, 0.26 - (x - 2.5) * 0.08);
}

function getFieldColor(value) {
  for (let i = 0; i < colorStops.length - 1; i++) {
    const [v1, c1] = colorStops[i];
    const [v2, c2] = colorStops[i + 1];

    if (value >= v1 && value <= v2) {
      return c1.clone().lerp(c2, (value - v1) / (v2 - v1));
    }
  }

  return colorRed.clone();
}

// Build a grid over the engine's internal floor
for (let i = 0; i <= xSteps; i++) {
  const x = -5 + (i / xSteps) * 9.5;
  const floorY = getFloorHeight(x) + 0.045;

  for (let j = 0; j <= zSteps; j++) {
    const z = -0.79 + (j / zSteps) * 1.58;

    fieldPositions.push(x, floorY, z);

    const value = getFieldValue(x, fieldMode);
    const color = getFieldColor(value);

    fieldColors.push(color.r, color.g, color.b);
  }
}

// Connect the grid into triangles
for (let i = 0; i < xSteps; i++) {
  for (let j = 0; j < zSteps; j++) {
    const a = i * (zSteps + 1) + j;
    const b = a + zSteps + 1;

    fieldIndices.push(a, b, a + 1);
    fieldIndices.push(b, b + 1, a + 1);
  }
}

fieldGeometry.setAttribute(
  'position',
  new THREE.Float32BufferAttribute(fieldPositions, 3)
);

fieldGeometry.setAttribute(
  'color',
  new THREE.Float32BufferAttribute(fieldColors, 3)
);

fieldGeometry.setIndex(fieldIndices);
fieldGeometry.computeVertexNormals();

const fieldMaterial = new THREE.MeshBasicMaterial({
  vertexColors: true,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.82,
  depthWrite: false
});

const fieldMesh = new THREE.Mesh(fieldGeometry, fieldMaterial);
fieldMesh.renderOrder = 2;
scene.add(fieldMesh);

// Switch between temperature and pressure
function updateField(mode) {
  fieldMode = mode;

  const colors = fieldGeometry.attributes.color;

  for (let i = 0; i <= xSteps; i++) {
    const x = -5 + (i / xSteps) * 9.5;
    const value = getFieldValue(x, mode);
    const color = getFieldColor(value);

    for (let j = 0; j <= zSteps; j++) {
      const index = i * (zSteps + 1) + j;

      colors.setXYZ(
        index,
        color.r,
        color.g,
        color.b
      );
    }
  }

  colors.needsUpdate = true;
}


// Internal airflow particles

// =================================
// AIRFLOW + FUEL INJECTION SYSTEM
// =================================

const particles = [];
const fuelParticles = [];

// Airflow colour stages
const airBlue = new THREE.MeshBasicMaterial({
  color: 0x168cff
});

const airOrange = new THREE.MeshBasicMaterial({
  color: 0xff571c
});

const exhaustYellow = new THREE.MeshBasicMaterial({
  color: 0xffd36a
});

const fuelPurple = new THREE.MeshBasicMaterial({
  color: 0xb34dff
});

// Fuel after entering combustion
const burningFuel = new THREE.MeshBasicMaterial({
  color: 0xff681f
});

// Exhaust colour
const exhaustWhite = new THREE.MeshBasicMaterial({
  color: 0xffe9b0
});

// =================================
// MAIN AIRFLOW PARTICLES
// =================================

for (let i = 0; i < 180; i++) {

  const particle = new THREE.Mesh(
    new THREE.SphereGeometry(0.035, 8, 8),
    airBlue
  );

  const baseY = Math.random() * 0.18 - 0.06;
  const baseZ = Math.random() * 1.4 - 0.7;

  particle.position.set(
    Math.random() * 12 - 5,
    baseY,
    baseZ
  );

  scene.add(particle);

  particles.push({
    mesh: particle,
    speed: 0.025 + Math.random() * 0.025,
    baseY: baseY,
    baseZ: baseZ,
    plumeY: (Math.random() - 0.5) * 0.16,
    plumeZ: (Math.random() - 0.5) * 0.16
  });
}

// =================================
// FUEL INJECTOR VISUALIZATION
// =================================

const injectorMaterial = new THREE.MeshBasicMaterial({
  color: 0xa94dff
});

const injectorPositions = [-0.55, 0, 0.55];

injectorPositions.forEach(z => {

  const injector = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.045, 0.20, 12),
    injectorMaterial
  );

  injector.position.set(-0.35, 0.36, z);

  scene.add(injector);
});

// =================================
// FUEL PARTICLES
// =================================

for (let i = 0; i < 65; i++) {

  const particle = new THREE.Mesh(
    new THREE.SphereGeometry(0.025, 8, 8),
    fuelPurple
  );

  particle.position.set(
    -0.35,
    0.20,
    Math.random() * 1.2 - 0.6
  );

  scene.add(particle);

  fuelParticles.push({
    mesh: particle,
    speed: 0.025 + Math.random() * 0.018,
    verticalSpeed: 0.004 + Math.random() * 0.005,
    baseZ: particle.position.z
  });
}


// Section labels
function addLabel(text, x, y) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;

  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 42px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(text, 256, 75);

  const texture = new THREE.CanvasTexture(canvas);
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture, transparent: true })
  );

  sprite.position.set(x, y, 1.3);
  sprite.scale.set(2.3, 0.58, 1);
  scene.add(sprite);
}

addLabel('INLET', -4, 1.5);
addLabel('ISOLATOR', -2, 1.1);
addLabel('COMBUSTOR', 0, 1.5);
addLabel('NOZZLE', 3, 1.8);

// Grid

// =================================
// SCRAMJET SIMULATION DASHBOARD
// =================================

let airflowMultiplier = 1;
let combustionEnabled = true;
let particlesEnabled = true;
let machNumber = 5;

const dashboard = document.createElement('div');

dashboard.innerHTML = `
  <div class="dashboard-header">
    <div>
      <div class="eyebrow">AEROSPACE ENGINEERING</div>
      <h2>SCRAMJET <span>SIMULATOR</span></h2>
    </div>
    <div class="live"><span></span> LIVE</div>
  </div>

  <div class="metric-grid">
    <div class="metric">
      <small>MACH NUMBER</small>
      <strong id="machValue">5.0</strong>
    </div>
    <div class="metric">
      <small>COMBUSTION</small>
      <strong id="combustionStatus">ACTIVE</strong>
    </div>
    <div class="metric">
      <small>AIRFLOW</small>
      <strong id="airflowStatus">ACTIVE</strong>
    </div>
    <div class="metric">
      <small>VISUAL TEMP.</small>
      <strong id="tempValue">1200 K</strong>
    </div>
  </div>

  <div class="control-section">
    <h3>SIMULATION CONTROLS</h3>

    <label>
      Mach number
      <span id="machLabel">5.0</span>
    </label>
    <input id="machSlider" type="range"
      min="3" max="10" step="0.5" value="5">

    <label>
      Airflow speed
      <span id="speedLabel">1.0x</span>
    </label>
    <input id="speedSlider" type="range"
      min="0" max="3" step="0.1" value="1">

    <div class="toggle-row">
      <span>Combustion visualization</span>
      <input id="combustionToggle" type="checkbox" checked>
    </div>

    <div class="toggle-row">
      <span>Airflow particles</span>
      <input id="particleToggle" type="checkbox" checked>
    </div>
  </div>



  <div class="dashboard-footer">
    CONCEPTUAL SIMULATION • NOT EXPERIMENTAL DATA
  </div>
`;

dashboard.id = 'simulationDashboard';
document.body.appendChild(dashboard);

// Dashboard styling
const dashboardStyle = document.createElement('style');

dashboardStyle.textContent = `
  #simulationDashboard {
    position: fixed;
    top: 20px;
    right: 20px;
    width: 310px;
    max-height: calc(100vh - 40px);
    overflow-y: auto;
    padding: 22px;
    color: #e8f1ff;
    background: rgba(9, 19, 34, 0.94);
    border: 1px solid #29415d;
    border-radius: 12px;
    font-family: Arial, sans-serif;
    z-index: 10;
    backdrop-filter: blur(15px);
    box-shadow: 0 10px 40px #0008;
  }

  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 22px;
  }

  .eyebrow {
    font-size: 9px;
    letter-spacing: 2px;
    color: #69a9e8;
    margin-bottom: 6px;
  }

  .dashboard-header h2 {
    font-size: 17px;
    letter-spacing: 1px;
  }

  .dashboard-header h2 span {
    color: #58aaff;
  }

  .live {
    font-size: 10px;
    color: #63e6a0;
  }

  .live span {
    display: inline-block;
    width: 7px;
    height: 7px;
    background: #63e6a0;
    border-radius: 50%;
    margin-right: 4px;
  }

  .metric-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 9px;
  }

  .metric {
    background: #14263c;
    padding: 13px;
    border-radius: 7px;
  }

  .metric small {
    display: block;
    color: #8ca9c7;
    font-size: 9px;
    margin-bottom: 9px;
  }

  .metric strong {
    font-size: 20px;
    color: #57b3ff;
  }

  .control-section {
    margin-top: 23px;
  }

  .control-section h3 {
    color: #78b9f5;
    font-size: 11px;
    letter-spacing: 1.5px;
    margin-bottom: 15px;
  }

  .control-section label {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    margin: 14px 0 8px;
  }

  .control-section label span {
    color: #65b5ff;
  }

  .control-section input[type=range] {
    width: 100%;
    accent-color: #339cff;
    cursor: pointer;
  }

  .toggle-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 17px;
    font-size: 11px;
  }

  .toggle-row input {
    accent-color: #339cff;
    width: 16px;
    height: 16px;
  }




  .dashboard-footer {
    margin-top: 23px;
    padding-top: 13px;
    border-top: 1px solid #29415d;
    font-size: 8px;
    color: #7890a9;
    letter-spacing: 1px;
  }

  @media (max-width: 650px) {
    #simulationDashboard {
      width: 250px;
      right: 10px;
      top: 10px;
      padding: 14px;
    }
  }
`;

document.head.appendChild(dashboardStyle);

// =================================
// HEAT MAP DASHBOARD CONTROLS
// =================================

dashboard.insertAdjacentHTML('beforeend', `
  <div class="control-section">
    <h3>FLOW FIELD VISUALIZATION</h3>

    <select id="fieldSelect">
      <option value="temperature">Temperature distribution</option>
      <option value="pressure">Relative pressure distribution</option>
    </select>

    <div class="field-legend">
      <div class="legend-gradient"></div>
      <div class="legend-labels">
        <span>LOW</span>
        <span>HIGH</span>
      </div>
      <p id="fieldDescription">
        Illustrative temperature distribution
      </p>
    </div>
  </div>
`);

const fieldStyle = document.createElement('style');

fieldStyle.textContent = `
  .field-legend {
    margin-top: 15px;
  }

  .legend-gradient {
    height: 12px;
    border-radius: 5px;
    background: linear-gradient(
      to right,
      #087bff,
      #00d9ff,
      #30dc86,
      #ffe52e,
      #ff861c,
      #ff2515
    );
  }

  .legend-labels {
    display: flex;
    justify-content: space-between;
    margin-top: 6px;
    color: #a9bfd6;
    font-size: 9px;
  }

  #fieldDescription {
    font-size: 10px;
    color: #9cb2c9;
    margin-top: 12px;
    line-height: 1.5;
  }
`;

document.head.appendChild(fieldStyle);

document.getElementById('fieldSelect')
  .addEventListener('change', event => {
    const mode = event.target.value;

    updateField(mode);

    document.getElementById('fieldDescription').textContent =
      mode === 'temperature'
        ? 'Illustrative temperature distribution along the engine.'
        : 'Illustrative relative pressure distribution along the engine.';
  });

// Control references
const machSlider = document.getElementById('machSlider');
const speedSlider = document.getElementById('speedSlider');

machSlider.addEventListener('input', () => {
  machNumber = Number(machSlider.value);

  document.getElementById('machValue').textContent =
    machNumber.toFixed(1);

  document.getElementById('machLabel').textContent =
    machNumber.toFixed(1);

  // Illustrative display value, not a calculated temperature
  const visualTemp = Math.round(400 + machNumber * 160);

  document.getElementById('tempValue').textContent =
    visualTemp + ' K';
});

speedSlider.addEventListener('input', () => {
  airflowMultiplier = Number(speedSlider.value);

  document.getElementById('speedLabel').textContent =
    airflowMultiplier.toFixed(1) + 'x';

  document.getElementById('airflowStatus').textContent =
    airflowMultiplier === 0 ? 'PAUSED' : 'ACTIVE';
});

document.getElementById('combustionToggle')
  .addEventListener('change', event => {
    combustionEnabled = event.target.checked;

    document.getElementById('combustionStatus').textContent =
      combustionEnabled ? 'ACTIVE' : 'OFF';

    hotGlow.visible = combustionEnabled;
  });

document.getElementById('particleToggle')
  .addEventListener('change', event => {
    particlesEnabled = event.target.checked;

    document.getElementById('airflowStatus').textContent =
      particlesEnabled && airflowMultiplier > 0
        ? 'ACTIVE' : 'PAUSED';

    particles.forEach(p => {
      p.mesh.visible = particlesEnabled;
    });
  });

const descriptions = {
  INLET: 'Captures incoming air and uses compression to raise its pressure.',
  ISOLATOR: 'Provides a transition region for managing shock waves and airflow disturbances.',
  COMBUSTOR: 'Fuel and air mix and release energy while the flow remains supersonic.',
  NOZZLE: 'Expands and accelerates the hot exhaust flow.',
  EXHAUST: 'The exhaust leaves the engine and produces thrust.'
};




// Animation
function animate() {
  requestAnimationFrame(animate);
// Animate shockwave intensity
shockwaveTime += 0.025;

shockMaterials.forEach((material, index) => {
  const pulse = Math.sin(
    shockwaveTime * 1.5 + index * 0.7
  );

  material.opacity = 0.25 + pulse * 0.10;
});


// =================================
// ANIMATED COMBUSTION
// =================================

const flamePulse = Math.sin(shockwaveTime * 4);
const flamePulse2 = Math.sin(shockwaveTime * 6);

flameGroup.visible = combustionEnabled;

combustionLight.intensity = combustionEnabled
  ? 1.8 + flamePulse * 0.45
  : 0;

outerFlame.scale.set(
  1.45 + flamePulse * 0.08,
  0.32 + flamePulse * 0.025,
  0.75 + flamePulse * 0.06
);

middleFlame.scale.set(
  1.05 + flamePulse2 * 0.07,
  0.23 + flamePulse2 * 0.025,
  0.55 + flamePulse2 * 0.04
);

innerFlame.scale.set(
  0.55 + flamePulse * 0.04,
  0.13 + flamePulse * 0.015,
  0.34 + flamePulse * 0.03
);

  
// =================================
// ANIMATED AIRFLOW
// =================================

particles.forEach(p => {

  if (!particlesEnabled) return;

  p.mesh.position.x +=
    p.speed * airflowMultiplier;

  const x = p.mesh.position.x;

  // Reset particles after leaving the exhaust plume
  if (x > 7) {
    p.mesh.position.x = -5;
  }

  // Airflow colour stages
  if (x < -1) {

    p.mesh.material = airBlue;

  } else if (x < 2.3 && combustionEnabled) {

    p.mesh.material = airOrange;

  } else if (x >= 2.3) {

    p.mesh.material = exhaustYellow;

  } else {

    p.mesh.material = airBlue;
  }

  // Spread particles into an exhaust plume
  if (x > 4.5) {

    const distance = x - 4.5;

    p.mesh.position.y =
      p.baseY + distance * p.plumeY;

    p.mesh.position.z =
      p.baseZ + distance * p.plumeZ;

    p.mesh.material = exhaustWhite;

  } else {

    p.mesh.position.y = p.baseY;
    p.mesh.position.z = p.baseZ;
  }
});

// =================================
// ANIMATED FUEL INJECTION
// =================================

fuelParticles.forEach(p => {

  if (!particlesEnabled) return;

  p.mesh.position.x +=
    p.speed * airflowMultiplier;

  // Fuel enters from the upper injector
  if (p.mesh.position.y > -0.06) {

    p.mesh.position.y -=
      p.verticalSpeed * airflowMultiplier;

  }

  const x = p.mesh.position.x;

  // Fuel enters the exhaust and cycles back
  if (x > 4.5) {

    p.mesh.position.x = -0.35;
    p.mesh.position.y = 0.20;

    p.mesh.position.z = p.baseZ;
  }

  // Fuel colour stages
  if (combustionEnabled && x > 0.4) {

    p.mesh.material = burningFuel;

  } else {

    p.mesh.material = fuelPurple;
  }

});

  controls.update();
  renderer.render(scene, camera);
}

animate();

// Responsive display
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
