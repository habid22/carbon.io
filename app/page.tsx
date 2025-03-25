// app/page.tsx

import GlobeDemo from "@/components/ui/globe-demo";

import { ShootingStars } from "@/components/ui/shooting-stars";
import { StarsBackground } from "@/components/star-background";
import { Globe } from "@/components/globe";


export default function Home() {
  return (
    <div style={{ width: "100%", height: "100vh" }}>
    
      <GlobeDemo/>
      <ShootingStars />
      <StarsBackground />

    </div>
  );
}
