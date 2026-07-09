import { VortexBackground } from '../../canvas';

interface LandingBackgroundProps {
  scrollRef?: React.RefObject<HTMLDivElement | null>;
}

export default function LandingBackground({ scrollRef }: LandingBackgroundProps) {
  // The VortexBackground renderer itself sets a white clear color,
  // so no separate background div is needed.
  return <VortexBackground scrollRef={scrollRef} />;
}
