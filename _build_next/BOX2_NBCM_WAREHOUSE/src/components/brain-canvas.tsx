import { useEffect, useRef } from "react";

export function BrainCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let t = 0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const size = () => {
      canvas.width = canvas.offsetWidth * devicePixelRatio;
      canvas.height = canvas.offsetHeight * devicePixelRatio;
    };
    size();
    const onResize = () => size();
    window.addEventListener("resize", onResize);

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      const cx = w * 0.5;
      const cy = h * 0.28;
      const dpr = devicePixelRatio || 1;
      ctx.strokeStyle = "rgba(0,229,255,0.5)";
      ctx.lineWidth = 1.2 * dpr;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy,
          (70 + i * 18) * dpr,
          (42 + i * 10) * dpr,
          Math.sin(t + i) * 0.2,
          0,
          Math.PI * 2,
        );
        ctx.stroke();
      }
      for (let i = 0; i < 10; i++) {
        const a = t * 0.8 + (i / 10) * Math.PI * 2;
        const x = cx + Math.cos(a) * 88 * dpr;
        const y = cy + Math.sin(a) * 52 * dpr;
        ctx.fillStyle = "#7dffb3";
        ctx.beginPath();
        ctx.arc(x, y, 3 * dpr, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(125,255,179,0.28)";
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
      ctx.fillStyle = "#00e5ff";
      ctx.beginPath();
      ctx.arc(cx, cy, 6 * dpr, 0, Math.PI * 2);
      ctx.fill();
      if (!reduce) t += 0.016;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="pointer-events-none absolute inset-0 z-0 h-full w-full"
      aria-hidden
    />
  );
}
