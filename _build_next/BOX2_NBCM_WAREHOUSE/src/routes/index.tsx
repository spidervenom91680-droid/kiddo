import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { LyraMain } from "@/components/lyra-main";
import { NbcmOverlay } from "@/components/nbcm-overlay";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const [nbcmOn, setNbcmOn] = useState(false);
  return (
    <>
      <LyraMain onOpenNbcm={() => setNbcmOn(true)} />
      {nbcmOn ? <NbcmOverlay onClose={() => setNbcmOn(false)} /> : null}
    </>
  );
}
