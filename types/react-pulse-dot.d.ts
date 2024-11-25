declare module 'react-pulse-dot' {
    import { CSSProperties } from 'react';
  
    interface PulseDotProps {
      color?: string;
      size?: number;
      pulseSize?: number;
      style?: CSSProperties;
      className?: string;
    }
  
    const PulseDot: React.FC<PulseDotProps>;
    export default PulseDot;
  }