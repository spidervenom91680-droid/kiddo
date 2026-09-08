import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Grid, Billboard, Text, useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { ZoneId } from "@/components/nbcm-rooms";
import { HudChip } from "@/components/hud-chip";
import { Fx, LookRig, NodeCloud, Packets, Starfield } from "@/components/vr-fx";
import { Interior, type CoreId } from "@/components/vr-interior";

const BAYS: Array<{ id: ZoneId; label: string; angle: number }> = [
  { id: "control", label: "MASTER CONTROL", angle: 0 },
  { id: "studio", label: "KH4 STUDIO", angle: Math.PI / 4 },
  { id: "ghost", label: "GHOSTWRITER", angle: Math.PI / 2 },
  { id: "code", label: "CODEWRITER", angle: (3 * Math.PI) / 4 },
  { id: "aera", label: "AERADUE", angle: Math.PI },
  { id: "store", label: "STORAGE / TANK", angle: (5 * Math.PI) / 4 },
  { id: "net", label: "NET RUNNER", angle: (3 * Math.PI) / 2 },
];

const FLOOR_HOME: [number, number, number] = [0, 15, 9];
const FLOOR_TARGET: [number, number, number] = [0, 1.1, 0];

type Props = {
  onExit: () => void;
  onEnter: (id: ZoneId) => void;
};

function FloorBrain({ onEnter }: { onEnter: () => void }) {
  const tex = useTexture("/brain.webp");
  tex.colorSpace = THREE.SRGBColorSpace;
  const [hot, setHot] = useState(false);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <circleGeometry args={[3.4, 48]} />
        <meshStandardMaterial color="#041018" emissive="#00343c" metalness={0.7} roughness={0.25} />
      </mesh>
      <mesh
        position={[0, 1.35, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onEnter();
        }}
        onPointerOver={() => {
          setHot(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHot(false);
          document.body.style.cursor = "default";
        }}
      >
        <sphereGeometry args={[1.45, 48, 32]} />
        <meshStandardMaterial
          map={tex}
          emissive="#00e5ff"
          emissiveIntensity={hot ? 0.7 : 0.32}
          metalness={0.2}
          roughness={0.4}
        />
      </mesh>
      <mesh position={[0, 1.35, 0]}>
        <icosahedronGeometry args={[1.62, 1]} />
        <meshBasicMaterial color="#00e5ff" wireframe transparent opacity={0.4} />
      </mesh>
      <NodeCloud radius={1.9} color="#00e5ff" y={1.35} />
      <Billboard position={[0, 3.15, 0]}>
        <Text fontSize={0.26} color={hot ? "#7dffb3" : "#00e5ff"} anchorX="center" outlineWidth={0.01} outlineColor="#02080c">
          LYRA CORE · ENTER
        </Text>
      </Billboard>
    </group>
  );
}

function Table({
  id,
  label,
  angle,
  onEnter,
}: {
  id: ZoneId;
  label: string;
  angle: number;
  onEnter: (id: ZoneId) => void;
}) {
  const [hot, setHot] = useState(false);
  const mesh = useRef<THREE.Mesh>(null);
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(2.5, 0.08, 1.55)), []);
  const r = 6.6;
  const x = Math.sin(angle) * r;
  const z = Math.cos(angle) * r;

  useFrame((_, delta) => {
    const d = Math.min(delta, 0.1);
    if (!mesh.current) return;
    const target = hot ? 1.18 : 1;
    mesh.current.scale.y += (target - mesh.current.scale.y) * Math.min(1, d * 8);
  });

  return (
    <group position={[x, 0, z]} rotation={[0, angle, 0]}>
      <mesh position={[0, 0.72, 0]}>
        <boxGeometry args={[2.5, 0.08, 1.55]} />
        <meshStandardMaterial
          color={hot ? "#0a3a44" : "#071820"}
          emissive={hot ? "#00e5ff" : "#00343c"}
          emissiveIntensity={hot ? 1.1 : 0.4}
          metalness={0.5}
          roughness={0.25}
        />
      </mesh>
      {[
        [-1.05, 0.35, -0.6],
        [1.05, 0.35, -0.6],
        [-1.05, 0.35, 0.6],
        [1.05, 0.35, 0.6],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <boxGeometry args={[0.08, 0.7, 0.08]} />
          <meshStandardMaterial color="#0a2a30" emissive="#00e5ff" emissiveIntensity={0.2} />
        </mesh>
      ))}
      <mesh
        ref={mesh}
        position={[0, 0.78, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onEnter(id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHot(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHot(false);
          document.body.style.cursor = "default";
        }}
      >
        <boxGeometry args={[2.5, 0.12, 1.55]} />
        <meshStandardMaterial
          color={hot ? "#0c4a55" : "#082028"}
          emissive={hot ? "#7dffb3" : "#00444c"}
          emissiveIntensity={hot ? 0.8 : 0.25}
        />
      </mesh>
      <lineSegments geometry={edges} position={[0, 0.72, 0]}>
        <lineBasicMaterial color={hot ? "#7dffb3" : "#00e5ff"} />
      </lineSegments>
      <Billboard position={[0, 1.28, 0]}>
        <Text
          fontSize={0.2}
          color={hot ? "#7dffb3" : "#00e5ff"}
          anchorX="center"
          outlineWidth={0.008}
          outlineColor="#02080c"
        >
          {label}
        </Text>
      </Billboard>
    </group>
  );
}

function FloorScene({
  onDesk,
  onBrain,
}: {
  onDesk: (id: ZoneId) => void;
  onBrain: () => void;
}) {
  return (
    <>
      <color attach="background" args={["#01060a"]} />
      <fog attach="fog" args={["#01060a", 18, 46]} />
      <ambientLight intensity={0.16} />
      <pointLight position={[0, 12, 0]} intensity={70} color="#00e5ff" distance={36} />
      <pointLight position={[8, 5, -5]} intensity={22} color="#7dffb3" distance={22} />
      <Starfield count={2200} />
      <Grid
        args={[40, 40]}
        cellSize={0.55}
        cellThickness={0.45}
        cellColor="#08343c"
        sectionSize={2.8}
        sectionThickness={1.15}
        sectionColor="#00e5ff"
        fadeDistance={34}
        infiniteGrid
      />
      <Suspense fallback={null}>
        <FloorBrain onEnter={onBrain} />
      </Suspense>
      {BAYS.map((bay) => (
        <Table key={bay.id} {...bay} onEnter={onDesk} />
      ))}
      {BAYS.map((bay) => (
        <Packets
          key={`sig-${bay.id}`}
          a={new THREE.Vector3(0, 1.35, 0)}
          b={new THREE.Vector3(Math.sin(bay.angle) * 6.6, 0.72, Math.cos(bay.angle) * 6.6)}
          color="#00e5ff"
          n={3}
          speed={0.15}
        />
      ))}
      <LookRig home={FLOOR_HOME} target={FLOOR_TARGET} min={3.2} max={28} auto={0.35} />
    </>
  );
}

export function NbcmVr({ onExit, onEnter }: Props) {
  const [stack, setStack] = useState<Array<"floor" | CoreId>>(["floor"]);
  const scene = stack[stack.length - 1] ?? "floor";

  function push(id: CoreId) {
    setStack((s) => [...s, id]);
  }
  function pop() {
    setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code !== "Escape") return;
      e.preventDefault();
      if (stack.length > 1) pop();
      else onExit();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stack, onExit]);

  return (
    <div className="fixed inset-0 z-[60] bg-ink" role="dialog" aria-modal="true" aria-label="NBCM VR">
      <Canvas
        camera={{ position: [0, 16, 9], fov: 42, near: 0.1, far: 90 }}
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        style={{ touchAction: "none" }}
      >
        {scene === "floor" ? (
          <FloorScene onDesk={onEnter} onBrain={() => push("lyra")} />
        ) : (
          <Suspense fallback={null}>
            <Interior core={scene} onEnterCore={push} onPop={pop} />
          </Suspense>
        )}
        <Fx />
      </Canvas>
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3">
        <div className="pointer-events-auto">
          <HudChip as="button" mint active onClick={onExit}>
            LYRA MAIN
          </HudChip>
        </div>
        <p className="pointer-events-none hidden max-w-md text-right font-display text-[0.65rem] tracking-[0.18em] text-cyan md:block">
          {scene === "floor"
            ? "HOLD DRAG TO ORBIT · WHEEL ZOOM · CLICK BRAIN OR DESK"
            : "HOLD DRAG TO ORBIT · WHEEL ZOOM INTO THE CORE · DBL-CLICK CENTER TO RETURN"}
        </p>
      </div>
    </div>
  );
}
