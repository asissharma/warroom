
INTEL·OS
SPATIAL COGNITIVE OPERATING SYSTEM
One Canvas · All Knowledge · 3D Depth · Zero Tab Switching


FULL IMPLEMENTATION PLAN
Triple Revalidated · PM × Design × Engineering
Pass 1 ✓  ·  Pass 2 ✓  ·  Pass 3 ✓


🧑‍💻 Lead Engineer	🎨 Product Designer	📋 Product Manager
 
0 · THE CONSTRAINT THAT MAKES THIS WORK

The failure mode of every spatial canvas app: it becomes a beautiful demo nobody uses daily. Roam Research graph view. Obsidian canvas. Miro boards. Everyone opens them once, says 'incredible', and never navigates them again because they are cognitively exhausting as a daily driver.

The guardrail principle: The canvas is the world. You don't live in the world — you live in your house. COMMAND is the house. The canvas is what you step into when you choose to.

// The workability contract
DAILY REALITY (80% of sessions):
  Boot app → COMMAND panel opens flat, clean, focused
  Today's 8-9 tasks. Carry-forwards at top. Nothing else.
  You do your work. You close.
  Zero canvas. Zero noise. Zero cognitive overhead.

INTENTIONAL EXPLORATION (20% of sessions):
  You choose to step into the world.
  Press [ ENTER BRAIN ] — canvas opens in WORK MODE (2D, fast)
  Press [ DEPTH MODE ] — canvas shifts to 3D spatial view
  You zoom, explore, connect, see your history.
  Press [ ESC ] or click COMMAND — you're home again.

RULE: The 3D canvas is NEVER the default.
RULE: COMMAND always boots first. Always.
RULE: One keypress or click returns you to safety.
RULE: Depth mode is a destination, not a home.
 
1 · THE SPATIAL OS ARCHITECTURE

1.1  Two Render Modes — One Data Layer
Brain is the canvas. But it has two distinct render modes that serve different purposes. The data layer (IntelNode schema, MongoDB) is shared between both. What changes is how that data is visualized.

// System architecture
┌─────────────────────────────────────────────────────────────┐
│                    INTEL·OS SURFACE MAP                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  COMMAND PANEL  ←  always visible, always flat, always fast  │
│  (CSS overlay, z-index: 9999, never on canvas)               │
│                                                               │
├──────────────────────┬──────────────────────────────────────┤
│   WORK MODE (2D)     │        DEPTH MODE (3D)               │
│   @xyflow/react      │        React Three Fiber             │
│                      │                                       │
│   Fast. Reliable.    │   Immersive. Spatial. Memorable.     │
│   Daily driver.      │   Intentional exploration only.      │
│   All nodes visible  │   Full 3D phase planes + fog        │
│   Ghost + real       │   Z-axis = TIME (phase depth)        │
│   Layer toggles      │   Instanced ghost meshes             │
│   1500+ nodes OK     │   WebWorker layout engine            │
│                      │                                       │
├──────────────────────┴──────────────────────────────────────┤
│              SHARED DATA LAYER (IntelNode / MongoDB)         │
│   projects.json  questions.json  tech-spine.json            │
│   skills.json    survival-areas.json  + all user data       │
└─────────────────────────────────────────────────────────────┘

1.2  What Happened to the 4 Tabs
MAP, Intel, Log, and COMMAND do not disappear. They dissolve into layers on the canvas. Nothing is lost — everything is repositioned.

// Tab dissolution into layers
OLD ARCHITECTURE:
  COMMAND  →  /today     (full page)
  INTEL    →  /intel     (full page, tech-spine only)
  MAP      →  /map       (full page, 180-day arc)
  BRAIN    →  /brain     (full page, hardcoded canvas)
  LOG      →  /log       (full page, journal)

NEW ARCHITECTURE:
  COMMAND  →  HUD panel, CSS overlay, always on top
              [home key / escape / home button = return here]

  INTEL    →  Slide-in side panel within canvas
              Feed view + manual input + clusters
              Domain-agnostic, receives from everywhere

  MAP      →  Timeline layer ON the canvas
              Toggle: [ MAP LAYER ] shows 180-day spine
              Phase boundaries visible as glowing arcs
              Your current day = pulsing cursor on the spine

  LOG      →  Log nodes ON the canvas
              Toggle: [ LOG LAYER ] shows journal entry nodes
              Day N log = node anchored to Day N position

  BRAIN    →  IS the canvas
              Not a section. The world itself.
 
2 · THE 3D DEPTH SYSTEM

2.1  The Core Metaphor — Z-Axis = Time
The Z-axis means something. It is not decorative depth. Z = your journey through the 180 days. Phase 1 (Foundation) is the deep past — far back in Z space, slightly hazy, receding. Phase 8 (Capstone) is closest to the camera. As you advance through the program, you literally watch your foundation recede into history behind you.

// Z-axis spatial mapping
// Z-AXIS LAYOUT — Phase planes in 3D space

Phase 1: Foundation          →  z = -1400  (deep past, high fog)
Phase 2: Distributed Systems →  z = -1200
Phase 3: Cloud Infrastructure→  z = -1000
Phase 4: Security            →  z =  -800
Phase 5: ML/AI Engineering   →  z =  -600
Phase 6: Frontend & Real-Time→  z =  -400
Phase 7: Mastery Integration →  z =  -200
Phase 8: Capstone            →  z =     0  (present, sharp, closest)

// WITHIN EACH PHASE PLANE:
X-axis = tech domain cluster (horizontal spread across spine areas)
Y-axis = day offset within phase (vertical progression)

// VISUAL DEPTH CUES:
Distance fog: THREE.FogExp2(0x000814, 0.0008)
Ghost nodes at depth: opacity 0.15–0.3 based on z distance
Phase plane: subtle glowing grid at each z = phase
Node scale: nodes slightly larger as they approach z=0

2.2  Three.js Scene Architecture
// React Three Fiber scene
// components/brain/DepthCanvas.tsx — React Three Fiber scene

export function DepthCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 200, 600], fov: 60 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: '#000814' }}
    >
      {/* Atmosphere */}
      <fog attach='fog' args={['#000814', 400, 2200]} />
      <ambientLight intensity={0.15} />
      <pointLight position={[0, 0, 0]} intensity={1.5} color='#4FC3F7' />

      {/* Phase plane grids — 8 glowing grids along Z */}
      <PhasePlanes />

      {/* Ghost nodes — ALL curriculum, single draw call via InstancedMesh */}
      <GhostNodeField />

      {/* Real IntelNodes — individual meshes, richer detail */}
      <RealNodeField />

      {/* Edges between real nodes */}
      <ConnectionLines />

      {/* Timeline spine running through Z-axis */}
      <TimelineSpine currentDay={dayN} />

      {/* Camera controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        minDistance={50}
        maxDistance={2000}
        target={[0, 0, -200]}
      />
    </Canvas>
  )
}

2.3  Ghost Nodes — 1500+ at 60fps via InstancedMesh
// Instanced ghost nodes — single draw call
// components/brain/GhostNodeField.tsx
// Renders ALL curriculum items as a single GPU draw call

export function GhostNodeField() {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const ghostPositions = useGhostPositions()  // from curriculum JSON, memoized

  useEffect(() => {
    if (!meshRef.current) return
    const matrix = new THREE.Matrix4()
    const color  = new THREE.Color()

    ghostPositions.forEach((pos, i) => {
      // Position: x=domain, y=dayOffset, z=phase
      matrix.setPosition(pos.x, pos.y, pos.z)
      meshRef.current!.setMatrixAt(i, matrix)

      // Color by type: task=orange, build=blue, question=purple...
      color.set(NODE_TYPE_COLORS[pos.type])
      meshRef.current!.setColorAt(i, color)
    })

    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor)
      meshRef.current.instanceColor.needsUpdate = true
  }, [ghostPositions])

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, ghostPositions.length]}
    >
      <sphereGeometry args={[1.5, 6, 6]} />  {/* Low-poly for perf */}
      <meshStandardMaterial
        transparent
        opacity={0.18}
        emissive='white'
        emissiveIntensity={0.3}
      />
    </instancedMesh>
  )
}

// useGhostPositions — maps curriculum JSON to 3D coordinates
// CRITICAL: wrap in useMemo — JSON is immutable, recompute never needed
function useGhostPositions() {
  return useMemo(() => {
    return [
      ...projectsJson.map(p  => jsonItemToPosition(p,  'projects')),
      ...questionsJson.map(q => jsonItemToPosition(q,  'questions')),
      ...techSpineJson.map(t => jsonItemToPosition(t,  'tech-spine')),
      ...skillsJson.map(s    => jsonItemToPosition(s,  'skills')),
      ...survivalJson.map(sv => jsonItemToPosition(sv, 'survival')),
    ]
  }, [])  // empty deps — JSON never changes
}

2.4  Phase Planes — Glowing Grid Boundaries
// Phase planes
// components/brain/PhasePlanes.tsx
// 8 glowing grids along Z — one per phase

const PHASE_Z = [-1400, -1200, -1000, -800, -600, -400, -200, 0]
const PHASE_COLORS = [
  '#4FC3F7',  // Foundation — blue
  '#FF6B35',  // Distributed — orange
  '#39FF14',  // Cloud — green
  '#FF4444',  // Security — red
  '#CE93D8',  // ML/AI — purple
  '#00E5FF',  // Frontend — cyan
  '#FFD700',  // Mastery — gold
  '#FF6B9D',  // Capstone — pink
]

export function PhasePlanes() {
  return PHASE_Z.map((z, i) => (
    <group key={i} position={[0, 0, z]}>
      {/* Grid plane */}
      <gridHelper args={[400, 20, PHASE_COLORS[i], PHASE_COLORS[i]]}
        rotation={[0, 0, 0]}
        position={[0, -50, 0]}
      />
      {/* Phase label — floating text */}
      <Text
        position={[-180, 20, 0]}
        color={PHASE_COLORS[i]}
        fontSize={8}
        font='/fonts/JetBrainsMono.woff'
        opacity={0.6}
      >
        {`PHASE ${i+1} · ${PHASE_NAMES[i]}`}
      </Text>
    </group>
  ))
}

2.5  Work Mode → Depth Mode Toggle
// Mode switching
// The single toggle that switches render modes
// Located in the COMMAND panel HUD — always visible

type RenderMode = 'command' | 'work' | 'depth'

// COMMAND mode: HUD only, no canvas behind it
// WORK mode: @xyflow/react 2D canvas, layers toggleable
// DEPTH mode: React Three Fiber 3D canvas, layers toggleable

// Transition: WORK ↔ DEPTH
// Canvas unmounts / remounts (different renderers)
// IntelNode data is fetched once, passed to both
// Ghost node positions computed once from JSON, passed to both

// Key bindings:
// [ Escape ]   →  always returns to COMMAND mode
// [ B ]        →  toggle WORK mode brain canvas
// [ D ]        →  toggle DEPTH mode (3D)
// [ M ]        →  toggle MAP layer (timeline spine)
// [ L ]        →  toggle LOG layer (journal nodes)
// [ I ]        →  toggle Intel panel
// [ 1-8 ]      →  jump camera to phase Z position

// Navigation in DEPTH mode:
// Mouse drag    →  orbit
// Scroll        →  zoom (dolly)
// WASD          →  pan
// 1-8           →  fly to phase (animated lerp)
// Click node    →  focus + open detail panel
 
3 · WORK MODE — 2D CANVAS (DAILY DRIVER)

Work Mode is the everyday canvas. It uses @xyflow/react — proven, fast, accessible. It shows everything the Depth Mode shows but flat. This is where the user will spend 80% of their canvas time.

3.1  Layer System in Work Mode
// Work Mode layer system
// Each layer is a toggle — off by default except NODES

LAYER: NODES (always on)
  All IntelNodes as xyflow nodes
  Ghost nodes from curriculum JSON
  Node type → color + shape (same as depth mode)
  Zoom-level LOD: galaxy → domain → node → detail

LAYER: MAP (toggle)
  The 180-day timeline spine overlaid on the canvas
  Horizontal line. Phase boundaries as vertical markers.
  Current day = glowing orange dot moving right over time
  Click any phase marker → pan canvas to that phase cluster

LAYER: LOG (toggle)
  Journal entry nodes visible on canvas
  Anchored to their day position
  Yellow oval nodes. Hover → preview log text.

LAYER: EDGES (toggle)
  All connections between real IntelNodes visible
  Color by connection type
  Toggle off to reduce visual noise when zoomed out

LAYER: INTEL PANEL (toggle)
  Slide-in panel from right side of canvas
  Shows: Feed / Clusters / Manual Input tabs
  Does NOT cover canvas — canvas reflows to accommodate

3.2  Zoom-Level LOD (Level of Detail)
// Zoom LOD
// xyflow viewport zoom → what renders

zoom < 0.15  →  GALAXY VIEW
  8 phase cluster bubbles, phase names, completion %
  No individual nodes rendered (performance: O(8))
  MAP layer shows full timeline spine

zoom 0.15–0.4  →  DOMAIN VIEW
  22 tech spine domain groupings
  Cluster by domain with node count badges
  No individual nodes (performance: O(22))

zoom 0.4–1.0  →  NODE VIEW
  Individual nodes visible: icon + short title
  Ghost nodes: 20% opacity, slow pulse
  Real nodes: full opacity, type color
  Edges visible between real nodes

zoom > 1.0  →  DETAIL VIEW
  Full node cards on hover
  Source badge, tags, score, body preview
  Manual edge drawing enabled
  Right-click canvas: quick-add Intel node here

// Implementation: useViewport() from @xyflow/react
const { zoom } = useViewport()
 
4 · COMMAND — THE HOME (ALWAYS BOOTS FIRST)

COMMAND is not a tab. It is not a canvas layer. It is a CSS HUD overlay rendered completely outside the canvas at maximum z-index. It is always home. It is where you start every session and where you return with a single keypress.

// COMMAND panel layout
// COMMAND PANEL — CSS overlay, NOT on canvas
// z-index: 9999. Fixed position. Dark blur backdrop.

┌──────────────────────────────────────────────────┐
│  INTEL·OS          DAY 47 / 180    [ENTER BRAIN] │
├──────────────────────────────────────────────────┤
│  ⚠ CARRIED FROM DAY 46 (3)                       │
│  ↳ [ ] Implement Redis caching layer             │
│  ↳ [ ] Write load balancer unit tests            │
│  ↳ [ ] SURVIVAL: Explain CAP theorem cold        │
├──────────────────────────────────────────────────┤
│  TODAY'S MISSION                                  │
│  [ ] PROJECT: gRPC service mesh — step 3/5       │
│  [ ] QUESTION: What is consistent hashing?       │
│  [ ] QUESTION: Explain Raft consensus protocol   │
│  [ ] SKILL: Technical writing — ADR document     │
│  [ ] QUESTION: Bloom filter use cases            │
│  [ ] PROJECT: gRPC service mesh — step 4/5       │
│  [ ] SURVIVAL: Debug memory leak in prod         │
│  [ ] QUESTION: Redis vs Memcached tradeoffs      │
├──────────────────────────────────────────────────┤
│  [MARK DAY COMPLETE]              47% complete   │
└──────────────────────────────────────────────────┘

// [ENTER BRAIN] button → opens Work Mode canvas
// Carried tasks: orange badge, always at top
// COMMAND has ZERO canvas dependency
// Works perfectly if Brain is never opened

4.1  COMMAND → Canvas Bridge
When a task is checked in COMMAND, it emits to Intel (IntelNode created). When the user clicks ENTER BRAIN, the canvas opens with that node already rendered and glowing — the Cockpit action is immediately visible in the graph world.
// COMMAND to canvas bridge
// The bridge: task completion → canvas update

// 1. User checks task in COMMAND panel
// 2. POST /api/task fires
// 3. IntelNode emitted via intelEmitter.ts
// 4. SWR on /api/intel/graph revalidates
// 5. If canvas is open in Work Mode → node appears
// 6. If canvas is open in Depth Mode → node glows at its 3D position

// Ghost → Real node promotion:
// The ghost node for this task was already at its position
// On IntelNode creation, ghost is replaced by real node
// Visual: ghost fades, real node pulses in at same position
// Animation: scale 0 → 1.2 → 1.0 with glow burst
 
5 · INTEL — UNIVERSAL LAYER (ALL DOMAINS, ALL SOURCES)

Critical: Intel is NOT tech-spine only. It accepts any domain. A Marwari Mandis supply chain observation is a valid IntelNode. An Ayurveda concept is a valid IntelNode. A business framework note is a valid IntelNode. The type system is open. Tags are free-form. Domain is user-defined.

5.1  Universal IntelNode Schema
// Universal IntelNode schema
// lib/models/IntelNode.ts

interface IntelNode {
  _id:          ObjectId
  userId:       string

  // OPEN type system — not a closed enum
  // Users can define their own types via customType field
  type:         IntelNodeType
  customType?:  string          // if type === 'custom'
  source:       IntelSource

  title:        string
  body?:        string          // markdown
  url?:         string

  // FULLY OPEN taxonomy — no domain restriction
  tags:         string[]        // e.g. ['marwari-mandis', 'supply-chain']
  domain?:      string          // e.g. 'business', 'health', 'engineering'

  // Curriculum reference (for ghost promotion tracking)
  phase?:       number          // 1-8 if from curriculum
  dayN?:        number
  curriculumRef?: {
    sourceJson: 'projects'|'questions'|'tech-spine'|'skills'|'survival-areas'
    refId:      string
  }

  status:       'active' | 'completed' | 'archived'
  score?:       number          // 0-100
  connections:  Connection[]

  // 3D canvas position (set on first render, persisted)
  canvasPosition?: { x: number; y: number; z: number }

  createdAt:    Date
  updatedAt:    Date
  sourceRefId?: string
}

// OPEN type union
type IntelNodeType =
  | 'task' | 'build' | 'question' | 'skill' | 'survival' | 'log'
  | 'concept'   // abstract knowledge
  | 'insight'   // cross-domain insight (business, personal, etc)
  | 'resource'  // URL, reference, bookmark
  | 'custom'    // user-defined — label stored in customType

type IntelSource =
  | 'cockpit' | 'evidence-locker' | 'log' | 'manual' | 'system'

interface Connection {
  targetId:     ObjectId
  label:        'led-to'|'required'|'related'|'contradicts'|'extends'|'custom'
  customLabel?: string
  direction:    'uni' | 'bi'
  createdBy:    'auto' | 'user'
  strength:     number  // 0.0–1.0 for layout gravity
}

5.2  Intel Panel (Slide-in within Canvas)
// Intel panel
// Intel panel: slides in from canvas right edge
// Does NOT leave the canvas — it IS a canvas overlay

TAB 1: FEED
  Reverse-chronological stream of all IntelNodes
  Filter bar: Source · Type · Domain (free tag) · Status
  Click any node → camera flies to its canvas position

TAB 2: CLUSTERS
  Nodes grouped by primary tag/domain
  Cross-source: shows tasks + builds + manual notes with same tag
  'distributed-systems' cluster shows EVERYTHING tagged with it
  regardless of whether it came from cockpit, brain, or manual input

TAB 3: ADD NODE (Manual Input)
  Title (required)
  Body (markdown, optional)
  Type (open selector — choose existing or type new)
  Tags (free-form, comma-separated — ANY domain)
  URL (optional)
  Connect to: (search existing nodes)
  [ADD TO BRAIN] → creates IntelNode + places on canvas
 
6 · TECH STACK DECISIONS

6.1  The Critical Choice — xyflow vs R3F
// xyflow vs R3F decision
// WHY BOTH, not one or the other:

xyflow (@xyflow/react):
  ✓ Proven for node graphs — handles 1000+ nodes reliably
  ✓ Built-in pan/zoom/minimap/edge routing
  ✓ CSS-based — fast to style, easy to iterate
  ✓ Accessibility baked in
  ✗ Cannot do true 3D — only CSS perspective tricks
  → USE FOR: Work Mode (daily driver)

React Three Fiber (R3F) + @react-three/drei:
  ✓ True WebGL 3D — real depth, real fog, real lighting
  ✓ InstancedMesh for 1500+ ghost nodes at 60fps
  ✓ OrbitControls for intuitive 3D navigation
  ✓ drei Text, Float, Sparkles for premium polish
  ✗ Steeper learning curve
  ✗ Accessibility harder
  ✗ Can't reuse xyflow's edge routing
  → USE FOR: Depth Mode (intentional exploration)

// SHARED between both:
  IntelNode data from /api/intel/graph
  Ghost positions from curriculum JSON (computed once)
  Node position logic (deterministic, not force-directed)
  useBrainGraph() hook — feeds both renderers

6.2  New Dependencies to Add
// New dependencies
// Install:
npm install three @react-three/fiber @react-three/drei

// @react-three/drei components used:
  OrbitControls      — 3D camera navigation
  Text               — 3D text labels (JetBrains Mono font)
  Float              — subtle floating animation on real nodes
  Sparkles           — particle effect on node completion
  Billboard          — node labels always face camera
  Html               — DOM overlays anchored to 3D positions
  useProgress        — loading state for 3D scene
  Environment        — ambient 3D lighting preset

// Keep existing:
  @xyflow/react      — Work Mode canvas (unchanged)
  swr                — data fetching
  zustand            — global UI state (mode: command|work|depth)
  mongoose           — MongoDB

// Performance tools:
  // Web Worker for layout calculation (if force-directed needed)
  // THREE.InstancedMesh — ghost nodes (1500+) in one draw call
  // React Suspense + lazy — defer R3F bundle until Depth Mode opened

6.3  Bundle Strategy — Lazy Load 3D
// Lazy loading 3D
// DO NOT load Three.js on boot — it's 600KB+
// Lazy load only when user enters Depth Mode for first time

// app/(routes)/brain/page.tsx
const DepthCanvas = lazy(() => import('@/components/brain/DepthCanvas'))

function BrainPage() {
  const mode = useStore(s => s.renderMode)
  return (
    <>
      <WorkCanvas active={mode === 'work'} />
      {mode === 'depth' && (
        <Suspense fallback={<DepthLoadingScreen />}>
          <DepthCanvas />
        </Suspense>
      )}
    </>
  )
}

// Result: First load is fast (no Three.js)
// 3D loads only on demand, shown behind a loading transition
// After first load, it's cached — instant on subsequent opens
 
7 · COMPLETE FILE MAP

7.1  New Files to Create
// New files
// ── Data Layer ─────────────────────────────────────────────────
lib/models/IntelNode.ts              ← Universal schema + 9 indexes
lib/intelEmitter.ts                  ← Emission pipeline (pure fn)
lib/intelUtils.ts                    ← Ghost builders, auto-taggers
lib/nodePositions.ts                 ← 3D/2D position calculators

// ── API Routes ──────────────────────────────────────────────────
app/api/intel/route.ts               ← GET feed + POST manual create
app/api/intel/graph/route.ts         ← GET nodes+edges for canvas
app/api/intel/clusters/route.ts      ← GET grouped by tag/domain
app/api/intel/[id]/route.ts          ← PATCH edit node
app/api/intel/[id]/connect/route.ts  ← POST+DELETE manage edges

// ── State ───────────────────────────────────────────────────────
store/brainStore.ts                  ← Zustand: renderMode, layers
hooks/useBrainGraph.ts               ← Ghost+real merge, memoized
hooks/useIntelFeed.ts                ← SWR intel feed + clusters
hooks/useGhostPositions.ts           ← Curriculum JSON → positions

// ── COMMAND (HUD) ───────────────────────────────────────────────
components/command/CommandHUD.tsx    ← CSS overlay, always on top
components/command/CarryForwardBar.tsx
components/command/MissionList.tsx
components/command/DayCompleteBtn.tsx
components/command/EnterBrainBtn.tsx

// ── Work Mode (2D) ──────────────────────────────────────────────
components/brain/WorkCanvas.tsx      ← xyflow 2D canvas wrapper
components/brain/WorkNode.tsx        ← 2D node renderer (ghost+real)
components/brain/WorkEdge.tsx        ← 2D edge renderer
components/brain/LODController.tsx   ← Zoom level LOD switching
components/brain/ZoomMinimap.tsx     ← Bottom-right minimap

// ── Depth Mode (3D) ─────────────────────────────────────────────
components/brain/DepthCanvas.tsx     ← R3F scene root (lazy loaded)
components/brain/GhostNodeField.tsx  ← InstancedMesh all curriculum
components/brain/RealNodeField.tsx   ← Individual real IntelNodes
components/brain/PhasePlanes.tsx     ← 8 glowing Z-plane grids
components/brain/TimelineSpine.tsx   ← 180-day Z-axis spine
components/brain/ConnectionLines.tsx ← 3D edge lines
components/brain/NodeDetailCard.tsx  ← Html overlay on 3D node
components/brain/DepthLoadingScreen.tsx

// ── Layers ──────────────────────────────────────────────────────
components/brain/MapLayer.tsx        ← 180-day timeline overlay
components/brain/LogLayer.tsx        ← Journal node overlay
components/brain/LayerToggles.tsx    ← B/D/M/L/I key bindings

// ── Intel Panel ─────────────────────────────────────────────────
components/intel/IntelPanel.tsx      ← Slide-in panel container
components/intel/IntelFeed.tsx       ← Node feed with filters
components/intel/IntelClusters.tsx   ← Tag-grouped view
components/intel/IntelManualInput.tsx← Universal add form
components/intel/IntelNodeCard.tsx   ← Individual node card

// ── Shared ──────────────────────────────────────────────────────
components/brain/EdgeLabelPicker.tsx ← Connection label picker
components/brain/NodeTypeIcon.tsx    ← Type → icon mapping
constants/nodeColors.ts             ← Type → color mapping
constants/phaseConfig.ts            ← Phase Z positions + colors

7.2  Files to Modify
// Files to modify
app/api/task/route.ts            ← + emitToIntel()
app/api/brain/[...]/route.ts     ← + emitToIntel()
app/api/log/route.ts             ← + emitToIntel()
app/api/day/complete/route.ts    ← + loop emitToIntel for each task
app/(routes)/page.tsx            ← Boot → render CommandHUD only
app/(routes)/brain/page.tsx      ← Replace with WorkCanvas+DepthCanvas
app/layout.tsx                   ← Mount CommandHUD at root level

7.3  Files to Retire
// Files to retire
Old Intel stats page (tech-spine scoped)
Old Brain canvas with hardcoded topic nodes
Any static Intel computation limited to engineering domains
Any tab navigation components (tabs become layers/panels)
 
8 · MIGRATION — 5 PHASES, NO BIG BANG

Phase A — Foundation (3 days) — No Visible Change to User
→	A1: Create IntelNode schema + all indexes
→	A2: Create lib/intelEmitter.ts
→	A3: Wire emitter to POST /api/task, /api/brain/build, /api/log
→	A4: Create /api/intel GET/POST routes
→	A5: Create zustand brainStore (renderMode, layerToggles)
→	Validate: Complete task → IntelNode in DB. No UI change yet.

Phase B — Command HUD + Intel Panel (3 days) — Big UX Win
→	B1: Build CommandHUD as fixed CSS overlay — replaces current today page
→	B2: Build IntelPanel (Feed + Manual Input + Clusters)
→	B3: Mount both at app/layout.tsx root — always available
→	B4: Wire EnterBrainBtn to toggle canvas open
→	Validate: Daily workflow fully functional via CommandHUD. Intel panel shows nodes from all sources. Manual entry accepts any domain.

Phase C — Work Mode Canvas (4 days) — Full 2D Brain
→	C1: Build useBrainGraph hook — ghost + real node merge + memoization
→	C2: Build WorkCanvas with xyflow — ghost nodes + real nodes + LOD
→	C3: Build MapLayer (timeline spine overlay)
→	C4: Build LogLayer (journal nodes on canvas)
→	C5: Build LayerToggles + key bindings
→	C6: Manual edge drawing (drag-to-connect) + EdgeLabelPicker
→	Validate: Full curriculum visible as ghost nodes. Completed tasks light up. MAP layer shows 180-day spine. Log layer shows journal nodes.

Phase D — Depth Mode 3D Canvas (5 days) — The Wow
→	D1: Install three, @react-three/fiber, @react-three/drei
→	D2: Build DepthCanvas (R3F scene root) — lazy loaded
→	D3: Build GhostNodeField with InstancedMesh
→	D4: Build PhasePlanes (8 glowing Z-plane grids)
→	D5: Build RealNodeField (individual meshes with Float animation)
→	D6: Build TimelineSpine (Z-axis 180-day line)
→	D7: Build NodeDetailCard (Html overlay on 3D nodes)
→	D8: Phase fly-to navigation (keyboard 1-8, animated camera lerp)
→	Validate: Enter Depth Mode → galaxy of ghost nodes in 8 phase planes. Completed nodes glow. Camera flies through phases. 60fps with 1500+ instances.

Phase E — Polish + Node Promotion Effects (2 days) — The Feel
→	E1: Ghost → real node promotion animation (scale pulse + glow burst)
→	E2: Sparkles effect on node completion (drei Sparkles component)
→	E3: Fog density tuning (deeper phases = more atmospheric)
→	E4: WASD navigation in Depth Mode
→	E5: Mobile: Depth Mode disabled, Work Mode with touch gestures
 
9 · SPRINT TASK TABLE


Priority	Phase	Task	Owner	Effort	Pass
🔴 P0	A	IntelNode schema + 9 MongoDB indexes	Eng	4h	Pass 3
🔴 P0	A	lib/intelEmitter.ts pure function	Eng	3h	Pass 3
🔴 P0	A	Wire emitter: /api/task + /api/build + /api/log	Eng	3h	Pass 1
🔴 P0	A	GET+POST /api/intel routes	Eng	4h	Pass 1
🔴 P0	A	Zustand brainStore (renderMode + layers)	Eng	2h	Pass 2
🟠 P1	B	CommandHUD CSS overlay component	D+E	1d	Pass 1
🟠 P1	B	IntelPanel: Feed + Manual Input + Clusters	D+E	2d	Pass 1,2
🟠 P1	B	Mount HUD at layout root + EnterBrainBtn	Eng	2h	Pass 1
🟠 P1	C	useBrainGraph hook — ghost+real merge+memo	Eng	1d	Pass 3
🟠 P1	C	WorkCanvas xyflow — all nodes + LOD	D+E	3d	Pass 2,3
🟡 P2	C	MapLayer — 180-day timeline spine overlay	D+E	1d	Pass 2
🟡 P2	C	LogLayer — journal nodes on canvas	Eng	4h	Pass 2
🟡 P2	C	LayerToggles + key bindings (B/D/M/L/I)	Eng	3h	Pass 2
🟡 P2	C	Manual edge drawing + EdgeLabelPicker	D+E	2d	Pass 3
🟡 P2	D	Install R3F + drei, DepthCanvas skeleton	Eng	4h	Pass 3
🟡 P2	D	GhostNodeField — InstancedMesh 1500+ nodes	Eng	2d	Pass 3
🟡 P2	D	PhasePlanes — 8 glowing Z-plane grids	D+E	1d	Pass 2
🟢 P3	D	RealNodeField — individual meshes + Float	D+E	2d	Pass 2
🟢 P3	D	TimelineSpine + phase camera fly-to (1-8 keys)	D+E	2d	Pass 1
🟢 P3	D	NodeDetailCard — Html overlay on 3D nodes	D+E	1d	Pass 2
🟢 P3	E	Ghost→real promotion animation (pulse+glow)	D+E	1d	Pass 2
🟢 P3	E	Sparkles on completion + fog density tuning	D+E	1d	Pass 2
🟢 P3	E	PATCH /api/intel/:id + inline editing	Eng	3h	Pass 1

Total estimated effort: ~20–25 engineering days for all phases. Phase A+B alone deliver daily-usable improvement. 3D is Phase D — ship A+B+C first.
 
10 · TRIPLE REVALIDATION LOG

Pass 1 — PM Lens — CLEAR ✓
Issue caught: 3D canvas without a workability contract = beautiful demo nobody uses. Fixed by establishing COMMAND as the permanent daily home that boots first every session. Canvas is always opt-in. Escape always returns you. Also caught: Z-axis needs a strong meaning or it's just decorative noise. Assigned Z = TIME — phase progression through the program. This makes depth informational, not aesthetic.

Pass 2 — Design Lens — CLEAR ✓
Issue caught: 1500+ nodes in a single 3D scene with naive rendering = single-digit FPS. Fixed via InstancedMesh for ghost nodes (single draw call regardless of count) + LOD for 2D Work Mode. Also caught: COMMAND must be a CSS HUD overlay, NOT a 3D object on the canvas, or it becomes unusable. Fixed by mounting CommandHUD at layout root, always above z-index 9999, completely independent of any canvas renderer.

Pass 3 — Engineering Lens — CLEAR ✓
Issue caught: Cannot use xyflow AND React Three Fiber on the same canvas — they are fundamentally different renderers (DOM vs WebGL). Fixed by designing two explicit render modes: Work Mode (xyflow, 2D) and Depth Mode (R3F, 3D). Shared data layer feeds both. Also caught: Three.js is 600KB+ — must lazy load behind Suspense. Also caught: force-directed layout for 1500 nodes is CPU-blocking — but deterministic phase positioning (Z=phase, X=domain, Y=day) eliminates the need for force-directed entirely. Positions are computed once from the JSON, not continuously calculated.

ALL THREE PASSES — CLEAR ✓
 
11 · THE VISION — WHAT THIS FEELS LIKE


You boot INTEL·OS at 6am.
COMMAND opens. Clean. Flat. Day 47.
Three carry-forwards in orange. Eight missions below.
You work. You check. You complete.

Then you press [ ENTER BRAIN ].
The 2D canvas opens. Your completed nodes glow orange.
Hundreds of ghost nodes pulse around them. The road ahead.
You add a business insight manually. It joins the graph.

Then you press [ D ].
The canvas drops into 3D.
Eight phase planes recede into the dark. Fog in the distance.
1,510 ghost hexagons float across the deep past.
Your 400 completed nodes blaze at the front.
You press [ 1 ]. The camera flies through Phase 2, 3, 4, 5...
arriving at the Foundation — everything you built.

On Day 180, the canvas is your proof of work.
Every node is something you actually did.
A universe you built. In 180 days. Starting from nothing.
Denser than any resume. More honest than any GitHub profile.
The graph IS the product.
