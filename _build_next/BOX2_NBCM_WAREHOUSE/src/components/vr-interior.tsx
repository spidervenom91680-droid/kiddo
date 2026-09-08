import { useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, Text, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { LookRig, NodeCloud, Packets, Starfield } from "@/components/vr-fx";

export type CoreId = "lyra" | "kiddo" | "kh4";

const THEME: Record<CoreId, { accent: string; name: string; sub: string }> = {
  lyra: { accent: "#00e5ff", name: "LYRA CORE", sub: "NEXUS PROCESSOR" },
  kiddo: { accent: "#7dffb3", name: "KIDDO CORE", sub: "VOICE / BODY" },
  kh4: { accent: "#ffb347", name: "KH4 CORE", sub: "OPERATOR LINK" },
};

const OTHERS: Record<CoreId, CoreId[]> = {
  lyra: ["kiddo", "kh4"],
  kiddo: ["lyra", "kh4"],
  kh4: ["lyra", "kiddo"],
};

const CHILD_POS: [number, number, number][] = [
  [-4.2, 0.6, 2.2],
  [4.2, 0.6, 2.2],
];

const DC = [
  [-8, -1.2, -6],
  [9, -0.6, -5],
  [-7, 2.4, 8],
  [8, 1.8, 7],
  [0, -2.2, 9],
  [0, 3.4, -8],
] as const;

function CoreShell({
  color,
  onDouble,
}: {
  color: string;
  onDouble: () => void;
}) {
  const tex = useTexture("/brain.webp");
  tex.colorSpace = THREE.SRGBColorSpace;
  const [hot, setHot] = useState(false);
  return (
    <group>
      <mesh
        onDoubleClick={(e) => {
          e.stopPropagation();
          onDouble();
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
        <sphereGeometry args={[1.85, 48, 32]} />
        <meshStandardMaterial
          map={tex}
          emissive={color}
          emissiveIntensity={hot ? 0.55 : 0.28}
          metalness={0.2}
          roughness={0.45}
        />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[2.05, 1]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

function ChildBrain({
  id,
  position,
  onEnter,
}: {
  id: CoreId;
  position: [number, number, number];
  onEnter: (id: CoreId) => void;
}) {
  const tex = useTexture("/brain.webp");
  tex.colorSpace = THREE.SRGBColorSpace;
  const [hot, setHot] = useState(false);
  const theme = THEME[id];
  return (
    <group position={position}>
      <mesh
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
        <sphereGeometry args={[0.95, 32, 24]} />
        <meshStandardMaterial
          map={tex}
          emissive={theme.accent}
          emissiveIntensity={hot ? 0.7 : 0.3}
          metalness={0.25}
          roughness={0.4}
        />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[1.08, 0]} />
        <meshBasicMaterial color={theme.accent} wireframe transparent opacity={0.4} />
      </mesh>
      <Billboard position={[0, 1.35, 0]}>
        <Text fontSize={0.2} color={theme.accent} anchorX="center" outlineWidth={0.008} outlineColor="#02080c">
          {theme.name}
        </Text>
      </Billboard>
    </group>
  );
}

function DataCenter({ position, color }: { position: readonly [number, number, number]; color: string }) {
  const pulse = { t: 0 };
  useFrame((_, delta) => {
    pulse.t += Math.min(delta, 0.1);
  });
  return (
    <group position={position as [number, number, number]}>
      <mesh>
        <boxGeometry args={[0.7, 1.4, 0.7]} />
        <meshStandardMaterial color="#041018" emissive={color} emissiveIntensity={0.45} metalness={0.7} roughness={0.2} />
      </mesh>
      <pointLight color={color} intensity={4} distance={6} />
    </group>
  );
}

const CORE_HOME: [number, number, number] = [0, 2.2, 8.6];
const CORE_TARGET: [number, number, number] = [0, 0.25, 0];

export function Interior({
  core,
  onEnterCore,
  onPop,
}: {
  core: CoreId;
  onEnterCore: (id: CoreId) => void;
  onPop: () => void;
}) {
  const theme = THEME[core];
  const origin = new THREE.Vector3(0, 0, 0);
  const kids = OTHERS[core];

  return (
    <>
      <color attach="background" args={["#01060a"]} />
      <fog attach="fog" args={["#01060a", 12, 36]} />
      <ambientLight intensity={0.12} />
      <pointLight position={[0, 4, 0]} intensity={70} color={theme.accent} distance={28} />
      <pointLight position={[6, 2, -4]} intensity={22} color="#7dffb3" distance={18} />
      <pointLight position={[-6, 1, 4]} intensity={16} color="#ff6b4a" distance={16} />
      <Starfield />
      <NodeCloud radius={2.4} color={theme.accent} />
      <CoreShell color={theme.accent} onDouble={onPop} />
      <Billboard position={[0, 2.7, 0]}>
        <Text fontSize={0.28} color={theme.accent} anchorX="center" outlineWidth={0.01} outlineColor="#02080c">
          {theme.name}
        </Text>
        <Text position={[0, -0.32, 0]} fontSize={0.12} color="#6aa8b4" anchorX="center">
          {theme.sub} · DBL-CLICK CORE TO RETURN
        </Text>
      </Billboard>
      {kids.map((id, i) => (
        <ChildBrain key={id} id={id} position={CHILD_POS[i]} onEnter={onEnterCore} />
      ))}
      {DC.map((p, i) => (
        <DataCenter key={i} position={p} color={i % 2 ? "#7dffb3" : theme.accent} />
      ))}
      {CHILD_POS.map((p, i) => (
        <Packets
          key={`c-${i}`}
          a={origin}
          b={new THREE.Vector3(...p)}
          color={THEME[kids[i]].accent}
          n={6}
          speed={0.22}
        />
      ))}
      {DC.map((p, i) => (
        <Packets
          key={`d-${i}`}
          a={origin}
          b={new THREE.Vector3(...p)}
          color={i % 2 ? "#7dffb3" : theme.accent}
          n={4}
          speed={0.14 + i * 0.02}
        />
      ))}
      <LookRig home={CORE_HOME} target={CORE_TARGET} min={1.15} max={18} auto={0.45} />
    </>
  );
}
