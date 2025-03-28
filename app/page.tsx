// app/page.tsx
import GlobeDemo from "@/components/ui/globe-demo";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { StarsBackground } from "@/components/star-background";

export default function Home() {
  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      {/* Carbon.io Title */}
      <h1 className="absolute top-4 left-4 z-10 text-2xl md:text-3xl font-bold tracking-tighter group">
  <span className="bg-gradient-to-tl from-emerald-400 to-green-500 hover:from-emerald-300 hover:to-green-400 bg-clip-text text-transparent transition-all duration-300">
    carbon
  </span> 
  <span className="bg-gradient-to-br from-blue-400 to-blue-500 hover:from-cyan-400 hover:to-blue-500 bg-clip-text text-transparent transition-all duration-300">
    tracker
  </span>
</h1>

      <GlobeDemo />
      <ShootingStars />
      <StarsBackground />
    </div>
  );
}