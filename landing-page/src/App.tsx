import { MotionConfig } from "framer-motion";
import { SmoothScroll } from "./components/SmoothScroll";
import { Cta } from "./sections/Cta";
import { Destination } from "./sections/Destination";
import { Faq } from "./sections/Faq";
import { Header } from "./sections/Header";
import { Hero } from "./sections/Hero";
import { Methode } from "./sections/Methode";
import { Packs } from "./sections/Packs";
import { Pourquoi } from "./sections/Pourquoi";
import { Temoignages } from "./sections/Temoignages";

export function App() {
  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll>
        <Header />
        <main className="overflow-x-clip">
          <Hero />
          <Destination />
          <Methode />
          <Pourquoi />
          <Packs />
          <Temoignages />
          <Faq />
          <Cta />
        </main>
      </SmoothScroll>
    </MotionConfig>
  );
}
