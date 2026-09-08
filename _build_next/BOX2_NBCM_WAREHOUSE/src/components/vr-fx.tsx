import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";

export function LookRig({
  home,
  target,
  min,
  max,
  auto = 0.4,
}: {
  home: [number, number, number];
  target: [number, number, number];
  min: number;
  max: number;
  auto?: number;
}) {
  const { camera } = useThree();
  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useLayoutEffect(() => {
    camera.position.set(...home);
    camera.lookAt(...target);
  }, [camera, home, target]);

  return (
    <OrbitControls
      makeDefault
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      minDistance={min}
      maxDistance={max}
      minPolarAngle={0.12}
      maxPolarAngle={Math.PI / 2.02}
      target={target}
      autoRotate={!reduce}
      autoRotateSpeed={auto}
      zoomSpeed={1.15}
      rotateSpeed={0.72}
    />
  );
}

export function Fx() {
  return (
    <EffectComposer enableNormalPass={false}>
      <Bloom luminanceThreshold={0.18} intensity={0.85} mipmapBlur />
      <Vignette darkness={0.55} offset={0.25} />
    </EffectComposer>
  );
}

export function Starfield({ count = 1800 }: { count?: number }) {
  const geo = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 18 + Math.random() * 55;
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [count]);
  return (
    <points geometry={geo}>
      <pointsMaterial color="#8ef6ff" size={0.06} sizeAttenuation transparent opacity={0.85} />
    </points>
  );
}

export function Packets({
  a,
  b,
  color,
  n = 5,
  speed = 0.18,
}: {
  a: THREE.Vector3;
  b: THREE.Vector3;
  color: string;
  n?: number;
  speed?: number;
}) {
  const curve = useMemo(() => {
    const mid = a.clone().lerp(b, 0.5);
    mid.y += a.distanceTo(b) * 0.22;
    return new THREE.QuadraticBezierCurve3(a, mid, b);
  }, [a, b]);
  const lineObj = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(24));
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.35 });
    return new THREE.Line(geo, mat);
  }, [curve, color]);

  const refs = useRef<THREE.Mesh[]>([]);
  const tmp = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    const d = Math.min(delta, 0.1);
    const t0 = state.clock.elapsedTime * speed;
    for (let i = 0; i < n; i++) {
      const mesh = refs.current[i];
      if (!mesh) continue;
      const t = (t0 + i / n) % 1;
      curve.getPointAt(t, tmp.current);
      mesh.position.copy(tmp.current);
    }
    void d;
  });

  return (
    <group>
      <primitive object={lineObj} />
      {Array.from({ length: n }, (_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) refs.current[i] = el;
          }}
        >
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
}

export function NodeCloud({
  radius,
  color,
  y = 0,
}: {
  radius: number;
  color: string;
  y?: number;
}) {
  const { points, lines } = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const count = 48;
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      pts.push(
        new THREE.Vector3(
          Math.sin(phi) * Math.cos(theta) * radius,
          y + Math.cos(phi) * radius * 0.7,
          Math.sin(phi) * Math.sin(theta) * radius,
        ),
      );
    }
    const pair: THREE.Vector3[] = [];
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        if (pts[i].distanceTo(pts[j]) < radius * 0.72) pair.push(pts[i], pts[j]);
      }
    }
    return {
      points: new THREE.BufferGeometry().setFromPoints(pts),
      lines: new THREE.BufferGeometry().setFromPoints(pair),
    };
  }, [radius, y]);

  return (
    <group>
      <points geometry={points}>
        <pointsMaterial color={color} size={0.09} sizeAttenuation />
      </points>
      <lineSegments geometry={lines}>
        <lineBasicMaterial color={color} transparent opacity={0.28} />
      </lineSegments>
    </group>
  );
}
