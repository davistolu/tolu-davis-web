import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, useAnimationFrame } from 'framer-motion';
import { PetMood } from './CyberPet';

export type CharacterSkin = 'robot' | 'pixel-cat' | 'dicebear-bot' | 'cyber-fox';

interface CyberPetSpriteProps {
  mood: PetMood;
  frame?: number;
  skin: CharacterSkin;
  themeColor?: string;
  isHunting?: boolean;
}

/* ────────────────────────────────────────────────────────────────────────
   PER-MOOD MOTION PROFILE
   Procedural sine-driven dynamics for fluid, non-snapping 60fps animations.
   ──────────────────────────────────────────────────────────────────────── */
type MoodProfile = {
  walkFreq: number;      // Hz, limb-swing speed while moving
  bounceAmp: number;     // px, vertical bounce while moving
  armSwingAmp: number;   // degrees
  legSwingAmp: number;   // degrees
  breatheRate: number;   // Hz, idle chest/antenna breathing speed
  auraColor: string;     // ambient glow behind the body
  auraIntensity: number; // 0–1
  mouthOpen: number;     // 0–1 baseline jaw openness
};

const MOOD_PROFILE: Record<PetMood, MoodProfile> = {
  happy:          { walkFreq: 0,   bounceAmp: 0,   armSwingAmp: 0,  legSwingAmp: 0,  breatheRate: 0.35, auraColor: 'var(--term-primary)', auraIntensity: 0.22, mouthOpen: 0.25 },
  'walking-left': { walkFreq: 1.7, bounceAmp: 2.4, armSwingAmp: 20, legSwingAmp: 18, breatheRate: 0.35, auraColor: 'var(--term-primary)', auraIntensity: 0.20, mouthOpen: 0.2 },
  'walking-right':{ walkFreq: 1.7, bounceAmp: 2.4, armSwingAmp: 20, legSwingAmp: 18, breatheRate: 0.35, auraColor: 'var(--term-primary)', auraIntensity: 0.20, mouthOpen: 0.2 },
  coding:         { walkFreq: 0,   bounceAmp: 0,   armSwingAmp: 0,  legSwingAmp: 0,  breatheRate: 0.4,  auraColor: '#22c55e',             auraIntensity: 0.28, mouthOpen: 0.15 },
  eating:         { walkFreq: 0,   bounceAmp: 0,   armSwingAmp: 0,  legSwingAmp: 0,  breatheRate: 0.55, auraColor: '#f59e0b',             auraIntensity: 0.3,  mouthOpen: 0.8 },
  sleeping:       { walkFreq: 0,   bounceAmp: 0,   armSwingAmp: 0,  legSwingAmp: 0,  breatheRate: 0.22, auraColor: '#818cf8',             auraIntensity: 0.14, mouthOpen: 0 },
  excited:        { walkFreq: 0,   bounceAmp: 0,   armSwingAmp: 0,  legSwingAmp: 0,  breatheRate: 0.9,  auraColor: '#fbbf24',             auraIntensity: 0.42, mouthOpen: 0.6 },
  dancing:        { walkFreq: 2.4, bounceAmp: 4.5, armSwingAmp: 46, legSwingAmp: 22, breatheRate: 1.2,  auraColor: '#38bdf8',             auraIntensity: 0.48, mouthOpen: 0.5 },
  inspecting:     { walkFreq: 0,   bounceAmp: 0,   armSwingAmp: 0,  legSwingAmp: 0,  breatheRate: 0.35, auraColor: 'var(--term-bright)',  auraIntensity: 0.2,  mouthOpen: 0.15 },
  hunting:        { walkFreq: 3.4, bounceAmp: 2.6, armSwingAmp: 12, legSwingAmp: 24, breatheRate: 1.7,  auraColor: '#ef4444',             auraIntensity: 0.55, mouthOpen: 0.3 },
  confused:       { walkFreq: 0,   bounceAmp: 0,   armSwingAmp: 0,  legSwingAmp: 0,  breatheRate: 0.5,  auraColor: '#a855f7',             auraIntensity: 0.2,  mouthOpen: 0.2 },
};

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

/* ────────────────────────────────────────────────────────────────────────
   Blink cycle — natural, irregular timing
   ──────────────────────────────────────────────────────────────────────── */
function useBlinkCycle() {
  const [blink, setBlink] = React.useState(false);
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const pause = 2200 + Math.random() * 3400;
      timeout = setTimeout(() => {
        setBlink(true);
        setTimeout(() => {
          setBlink(false);
          schedule();
        }, 110 + Math.random() * 40);
      }, pause);
    };
    schedule();
    return () => clearTimeout(timeout);
  }, []);
  return blink;
}

/* ────────────────────────────────────────────────────────────────────────
   Pointer tracking — eyes quietly follow cursor position
   ──────────────────────────────────────────────────────────────────────── */
function usePointerTracking(ref: React.RefObject<SVGSVGElement | null>) {
  const px = useMotionValue(0);
  const py = useMotionValue(0);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      px.set(clamp((e.clientX - cx) / 300, -1, 1));
      py.set(clamp((e.clientY - cy) / 300, -1, 1));
    };
    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMove);
  }, [ref, px, py]);

  return { px, py };
}

/* ────────────────────────────────────────────────────────────────────────
   Creature Rig — 60fps physics drive
   ──────────────────────────────────────────────────────────────────────── */
function useCreatureRig(mood: PetMood, isHunting: boolean) {
  const profile = MOOD_PROFILE[mood] ?? MOOD_PROFILE.happy;
  const moving = mood === 'walking-left' || mood === 'walking-right' || isHunting;
  const isDancing = mood === 'dancing';
  const isSleeping = mood === 'sleeping';

  const legL = useMotionValue(0);
  const legR = useMotionValue(0);
  const armL = useMotionValue(0);
  const armR = useMotionValue(0);
  const bodyY = useMotionValue(0);
  const bodyScaleY = useMotionValue(1);
  const headTilt = useMotionValue(0);
  const antenna = useMotionValue(0);
  const chestPulse = useMotionValue(1);
  const shadowScale = useMotionValue(1);
  const jitter = useMotionValue(0);

  const elapsed = useRef(0);

  useAnimationFrame((_, delta) => {
    const dt = Math.min(delta / 1000, 0.05);
    elapsed.current += dt;
    const t = elapsed.current;
    const breathe = Math.sin(t * profile.breatheRate * Math.PI * 2);

    if (isDancing) {
      const p = t * profile.walkFreq * Math.PI * 2;
      legL.set(Math.sin(p) * profile.legSwingAmp);
      legR.set(Math.sin(p + Math.PI) * profile.legSwingAmp);
      armL.set(Math.sin(p * 1.5) * profile.armSwingAmp - 10);
      armR.set(Math.sin(p * 1.5 + Math.PI) * profile.armSwingAmp - 10);
      bodyY.set(-Math.abs(Math.sin(p)) * profile.bounceAmp);
      bodyScaleY.set(1 + Math.sin(p * 2) * 0.05);
      headTilt.set(Math.sin(p * 0.75) * 10);
    } else if (moving) {
      const p = t * profile.walkFreq * Math.PI * 2;
      legL.set(Math.sin(p) * profile.legSwingAmp);
      legR.set(Math.sin(p + Math.PI) * profile.legSwingAmp);
      armL.set(Math.sin(p + Math.PI) * profile.armSwingAmp * 0.7);
      armR.set(Math.sin(p) * profile.armSwingAmp * 0.7);
      bodyY.set(-Math.abs(Math.sin(p)) * profile.bounceAmp);
      bodyScaleY.set(1 - Math.abs(Math.sin(p)) * 0.025);
      headTilt.set(Math.sin(t * 0.8) * 2.5 + (isHunting ? Math.sin(t * 11) * 1.4 : 0));
      if (isHunting) jitter.set((Math.random() - 0.5) * 1.6);
    } else {
      legL.set(0);
      legR.set(0);
      armL.set(breathe * 2.2);
      armR.set(-breathe * 2.2);
      bodyY.set(breathe * (isSleeping ? 0.7 : 1.2));
      bodyScaleY.set(1 + breathe * (isSleeping ? 0.014 : 0.02));
      headTilt.set(Math.sin(t * 0.5) * 1.8);
      jitter.set(0);
    }

    antenna.set(Math.sin(t * 1.25) * (isSleeping ? 4 : 8));
    chestPulse.set(1 + Math.sin(t * (isHunting ? 5.2 : 1.8)) * 0.08);
    shadowScale.set(1 - clamp(Math.abs(bodyY.get()) * 0.06, 0, 0.35));
  });

  return { legL, legR, armL, armR, bodyY, bodyScaleY, headTilt, antenna, chestPulse, shadowScale, jitter, profile };
}

/* ────────────────────────────────────────────────────────────────────────
   Shared defs: lighting, materials, and filters
   ──────────────────────────────────────────────────────────────────────── */
const SharedDefs: React.FC<{ auraColor: string; idSuffix: string }> = ({ auraColor, idSuffix }) => (
  <defs>
    <linearGradient id={`metal-${idSuffix}`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#34343f" />
      <stop offset="45%" stopColor="#17171d" />
      <stop offset="100%" stopColor="#08080a" />
    </linearGradient>
    <linearGradient id={`sheen-${idSuffix}`} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
      <stop offset="45%" stopColor="#ffffff" stopOpacity="0.22" />
      <stop offset="55%" stopColor="#ffffff" stopOpacity="0" />
      <animateTransform attributeName="gradientTransform" type="translate" values="-1.2 0; 1.4 0; -1.2 0" dur="5.5s" repeatCount="indefinite" />
    </linearGradient>
    <radialGradient id={`visor-${idSuffix}`} cx="35%" cy="30%" r="75%">
      <stop offset="0%" stopColor="#1c2a33" />
      <stop offset="55%" stopColor="#050608" />
      <stop offset="100%" stopColor="#000000" />
    </radialGradient>
    <radialGradient id={`aura-${idSuffix}`} cx="50%" cy="55%" r="50%">
      <stop offset="0%" stopColor={auraColor} stopOpacity="0.5" />
      <stop offset="100%" stopColor={auraColor} stopOpacity="0" />
    </radialGradient>
    <filter id={`soft-glow-${idSuffix}`} x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id={`contact-blur-${idSuffix}`} x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="2.4" />
    </filter>
  </defs>
);

/* ────────────────────────────────────────────────────────────────────────
   ROBOT SPRITE
   ──────────────────────────────────────────────────────────────────────── */
const RobotSprite: React.FC<{ mood: PetMood; isHunting: boolean }> = ({ mood, isHunting }) => {
  const blink = useBlinkCycle();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { px, py } = usePointerTracking(svgRef);
  const rig = useCreatureRig(mood, isHunting);

  // Unconditional top-level transforms (NO hook calls inside JSX)
  const shadowRx = useTransform(rig.shadowScale, (s) => 15 * s);
  const pupilLX = useTransform(px, (v) => 21.5 + v * 2.6);
  const pupilRX = useTransform(px, (v) => 36.5 + v * 2.6);
  const pupilY = useTransform(py, (v) => 24 + v * 1.6);
  const glintLX = useTransform(pupilLX, (v) => v + 0.6);
  const glintLY = useTransform(pupilY, (v) => v - 1);
  const glintRX = useTransform(pupilRX, (v) => v + 0.6);
  const glintRY = useTransform(pupilY, (v) => v - 1);
  const forearmLRot = useTransform(rig.armL, (v) => 10 + v * 0.6);
  const forearmRRot = useTransform(rig.armR, (v) => -10 + v * 0.6);
  const shinLRot = useTransform(rig.legL, (v) => v * -0.7);
  const footLRot = useTransform(rig.legL, (v) => v * -0.4);
  const shinRRot = useTransform(rig.legR, (v) => v * -0.7);
  const footRRot = useTransform(rig.legR, (v) => v * -0.4);

  const isSleeping = mood === 'sleeping';
  const isEating = mood === 'eating';
  const isCoding = mood === 'coding';
  const isExcitedLike = mood === 'excited' || mood === 'dancing';
  const isHunting_ = mood === 'hunting' || isHunting;

  const eyeGlow = isHunting_ ? '#ef4444' : isExcitedLike ? '#fbbf24' : 'var(--term-bright)';
  const mouthH = Math.round(rig.profile.mouthOpen * 6);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 60 96"
      width={32}
      height={50}
      style={{ overflow: 'visible', userSelect: 'none', pointerEvents: 'none' }}
    >
      <SharedDefs auraColor={rig.profile.auraColor} idSuffix="robot" />

      {/* Ambient aura */}
      <motion.circle cx="30" cy="46" r="34" fill="url(#aura-robot)" opacity={rig.profile.auraIntensity} />

      {/* Contact shadow */}
      <motion.ellipse
        cx="30"
        cy="92"
        rx={shadowRx}
        ry="3.4"
        fill="#000"
        opacity={0.45}
        style={{ filter: 'url(#contact-blur-robot)' }}
      />

      <motion.g style={{ y: rig.bodyY, scaleY: rig.bodyScaleY }} transform-origin="30px 74px">
        <g filter="url(#soft-glow-robot)">
          {/* Antenna */}
          <motion.g style={{ rotate: rig.antenna }} transform-origin="30px 10px">
            <line x1="30" y1="2" x2="30" y2="12" stroke="var(--term-primary)" strokeWidth="2" strokeLinecap="round" />
            <circle cx="30" cy="2" r="3">
              <animate attributeName="r" values="3;4;3" dur="1.2s" repeatCount="indefinite" />
              <animate attributeName="fill" values="var(--term-bright);#ffffff;var(--term-bright)" dur="1.2s" repeatCount="indefinite" />
            </circle>
          </motion.g>

          {/* Head */}
          <motion.g style={{ rotate: rig.headTilt, x: rig.jitter }} transform-origin="30px 26px">
            <rect x="12" y="12" width="36" height="28" rx="9" fill="url(#metal-robot)" stroke="var(--term-primary)" strokeWidth="1.6" />
            <rect x="12" y="12" width="36" height="28" rx="9" fill="url(#sheen-robot)" style={{ mixBlendMode: 'screen' }} />
            <rect x="8" y="20" width="4" height="12" rx="2" fill="var(--term-primary)" />
            <rect x="48" y="20" width="4" height="12" rx="2" fill="var(--term-primary)" />
            <circle cx="15" cy="15" r="0.8" fill="#000" opacity="0.5" />
            <circle cx="45" cy="15" r="0.8" fill="#000" opacity="0.5" />

            {/* Visor */}
            <rect x="15" y="16" width="30" height="18" rx="4" fill="url(#visor-robot)" stroke="var(--term-primary)" strokeWidth="0.8" />

            {/* Eyes */}
            {isSleeping ? (
              <>
                <path d="M 19 25 Q 23 28 27 25" stroke="var(--term-bright)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                <path d="M 33 25 Q 37 28 41 25" stroke="var(--term-bright)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </>
            ) : isHunting_ ? (
              <>
                <circle cx="23" cy="25" r="5" fill="#ef4444">
                  <animate attributeName="opacity" values="1;0.55;1" dur="0.35s" repeatCount="indefinite" />
                </circle>
                <circle cx="37" cy="25" r="5" fill="#ef4444">
                  <animate attributeName="opacity" values="1;0.55;1" dur="0.35s" repeatCount="indefinite" />
                </circle>
                <line x1="18" y1="25" x2="28" y2="25" stroke="#fff" strokeWidth="1.1" />
                <line x1="23" y1="20" x2="23" y2="30" stroke="#fff" strokeWidth="1.1" />
                <line x1="32" y1="25" x2="42" y2="25" stroke="#fff" strokeWidth="1.1" />
                <line x1="37" y1="20" x2="37" y2="30" stroke="#fff" strokeWidth="1.1" />
              </>
            ) : isExcitedLike ? (
              <>
                <text x="17" y="30" fill={eyeGlow} fontSize="11" fontFamily="monospace" fontWeight="bold">★</text>
                <text x="30" y="30" fill={eyeGlow} fontSize="11" fontFamily="monospace" fontWeight="bold">★</text>
              </>
            ) : (
              <>
                <rect x="18" y="20" width="9" height={blink ? 1 : 8} rx="2" fill={eyeGlow} />
                <rect x="33" y="20" width="9" height={blink ? 1 : 8} rx="2" fill={eyeGlow} />
                {!blink && (
                  <>
                    <motion.rect style={{ x: pupilLX, y: pupilY }} width="3" height="4" fill="#060609" />
                    <motion.rect style={{ x: pupilRX, y: pupilY }} width="3" height="4" fill="#060609" />
                    <motion.circle cx={glintLX} cy={glintLY} r="0.7" fill="#fff" opacity="0.9" />
                    <motion.circle cx={glintRX} cy={glintRY} r="0.7" fill="#fff" opacity="0.9" />
                  </>
                )}
              </>
            )}

            {/* Mouth */}
            {isSleeping ? (
              <text x="21" y="42" fill="var(--term-bright)" fontSize="8" fontFamily="monospace" opacity="0.7">z_Z</text>
            ) : (
              <rect x="22" y={40 - mouthH / 2} width="16" height={Math.max(2, mouthH)} rx="2" fill={rig.profile.mouthOpen > 0.4 ? '#030305' : 'none'} stroke="var(--term-bright)" strokeWidth="1.1">
                {isEating && (
                  <animate attributeName="height" values={`${mouthH};${Math.max(2, mouthH - 3)};${mouthH}`} dur="0.28s" repeatCount="indefinite" />
                )}
              </rect>
            )}
          </motion.g>

          {/* Body */}
          <g>
            <rect x="15" y="40" width="30" height="22" rx="7" fill="url(#metal-robot)" stroke="var(--term-border)" strokeWidth="1.3" />
            <rect x="15" y="40" width="30" height="22" rx="7" fill="url(#sheen-robot)" style={{ mixBlendMode: 'screen' }} />
            <line x1="22" y1="44" x2="22" y2="60" stroke="var(--term-border)" strokeWidth="0.6" opacity="0.4" />
            <line x1="38" y1="44" x2="38" y2="60" stroke="var(--term-border)" strokeWidth="0.6" opacity="0.4" />
            <motion.circle cx="30" cy="51" r="4.5" fill="var(--term-bright)" opacity="0.14" style={{ scale: rig.chestPulse }} />
            <motion.circle cx="30" cy="51" r="2.4" fill="var(--term-bright)" style={{ scale: rig.chestPulse }} />
          </g>

          {/* Left arm */}
          <motion.g style={{ rotate: rig.armL }} transform-origin="15px 44px">
            <rect x="5" y="42" width="10" height="5" rx="2.5" fill="var(--term-primary)" />
            <motion.g style={{ rotate: forearmLRot }} transform-origin="15px 47px">
              <rect x="3" y="47" width="9" height="4" rx="2" fill="var(--term-primary)" opacity="0.8" />
              <circle cx="7" cy="55" r="3" fill="var(--term-primary)" opacity="0.9" />
            </motion.g>
          </motion.g>

          {/* Right arm */}
          <motion.g style={{ rotate: rig.armR }} transform-origin="45px 44px">
            <rect x="45" y="42" width="10" height="5" rx="2.5" fill="var(--term-primary)" />
            <motion.g style={{ rotate: forearmRRot }} transform-origin="45px 47px">
              <rect x="48" y="47" width="9" height="4" rx="2" fill="var(--term-primary)" opacity="0.8" />
              <circle cx="53" cy="55" r="3" fill="var(--term-primary)" opacity="0.9" />
            </motion.g>
          </motion.g>

          {/* Left leg */}
          <motion.g style={{ rotate: rig.legL }} transform-origin="22px 62px">
            <rect x="17" y="62" width="10" height="12" rx="4" fill="var(--term-primary)" opacity="0.9" />
            <motion.g style={{ rotate: shinLRot }} transform-origin="22px 74px">
              <rect x="18" y="74" width="8" height="10" rx="3" fill="var(--term-primary)" opacity="0.75" />
              <motion.rect x="15" y="83" width="14" height="5" rx="2.5" fill="var(--term-primary)" style={{ rotate: footLRot }} transform-origin="22px 85px" />
            </motion.g>
          </motion.g>

          {/* Right leg */}
          <motion.g style={{ rotate: rig.legR }} transform-origin="38px 62px">
            <rect x="33" y="62" width="10" height="12" rx="4" fill="var(--term-primary)" opacity="0.9" />
            <motion.g style={{ rotate: shinRRot }} transform-origin="38px 74px">
              <rect x="34" y="74" width="8" height="10" rx="3" fill="var(--term-primary)" opacity="0.75" />
              <motion.rect x="31" y="83" width="14" height="5" rx="2.5" fill="var(--term-primary)" style={{ rotate: footRRot }} transform-origin="38px 85px" />
            </motion.g>
          </motion.g>

          {(isHunting_ || mood === 'dancing') && (
            <path d="M 24 88 L 30 96 L 36 88 Z" fill="#38bdf8" opacity="0.85">
              <animate attributeName="opacity" values="0.9;0.35;0.9" dur="0.22s" repeatCount="indefinite" />
            </path>
          )}

          {isCoding && (
            <g>
              <rect x="6" y="52" width="14" height="9" rx="1.5" fill="#1a1a20" stroke="var(--term-primary)" strokeWidth="0.8" />
              <text x="8" y="59" fill="#22c55e" fontSize="5" fontFamily="monospace">&gt;_</text>
            </g>
          )}

          {isSleeping && (
            <>
              <text x="44" y="18" fill="var(--term-bright)" fontSize="8" fontFamily="monospace" opacity="0.7">
                <animate attributeName="y" values="18;10;18" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.7;0;0.7" dur="2s" repeatCount="indefinite" />
                Z
              </text>
              <text x="50" y="12" fill="var(--term-bright)" fontSize="11" fontFamily="monospace" opacity="0.5">
                <animate attributeName="y" values="12;4;12" dur="2.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0;0.5" dur="2.4s" repeatCount="indefinite" />
                Z
              </text>
            </>
          )}
        </g>
      </motion.g>
    </svg>
  );
};

/* ────────────────────────────────────────────────────────────────────────
   PIXEL CAT SPRITE
   ──────────────────────────────────────────────────────────────────────── */
const PixelCatSprite: React.FC<{ mood: PetMood; isHunting: boolean }> = ({ mood, isHunting }) => {
  const blink = useBlinkCycle();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { px, py } = usePointerTracking(svgRef);
  const rig = useCreatureRig(mood, isHunting);

  // Unconditional top-level transforms
  const shadowRx = useTransform(rig.shadowScale, (s) => 14 * s);
  const pupilLX = useTransform(px, (v) => 18.5 + v * 2.4);
  const pupilRX = useTransform(px, (v) => 34.5 + v * 2.4);
  const pupilY = useTransform(py, (v) => 24 + v * 1.4);
  const glintLX = useTransform(pupilLX, (v) => v + 0.7);
  const glintLY = useTransform(pupilY, (v) => v - 0.8);
  const glintRX = useTransform(pupilRX, (v) => v + 0.7);
  const glintRY = useTransform(pupilY, (v) => v - 0.8);
  const tailPath = useTransform(rig.headTilt, (v) =>
    `M 42 54 Q ${54 + v} ${50 - v} ${50 + v * 0.5} 40`
  );

  const isSleeping = mood === 'sleeping';
  const isExcitedLike = mood === 'excited' || mood === 'dancing';
  const isHunting_ = mood === 'hunting' || isHunting;

  return (
    <svg ref={svgRef} viewBox="0 0 56 90" width={30} height={48} style={{ overflow: 'visible', userSelect: 'none', pointerEvents: 'none' }}>
      <SharedDefs auraColor={rig.profile.auraColor} idSuffix="cat" />
      <motion.circle cx="28" cy="44" r="32" fill="url(#aura-cat)" opacity={rig.profile.auraIntensity} />
      <motion.ellipse cx="28" cy="86" rx={shadowRx} ry="3.2" fill="#000" opacity={0.45} style={{ filter: 'url(#contact-blur-cat)' }} />

      <motion.g style={{ y: rig.bodyY, scaleY: rig.bodyScaleY }} transform-origin="28px 68px">
        <g filter="url(#soft-glow-cat)">
          <polygon points="13,14 17,2 22,14" fill="var(--term-primary)" />
          <polygon points="34,14 39,2 44,14" fill="var(--term-primary)" />
          <polygon points="15,12 17,6 20,12" fill="#ffffff55" />
          <polygon points="36,12 39,6 42,12" fill="#ffffff55" />

          <motion.g style={{ rotate: rig.headTilt }} transform-origin="28px 25px">
            <rect x="10" y="12" width="36" height="26" rx="10" fill="url(#metal-cat)" stroke="var(--term-primary)" strokeWidth="1.6" />
            <rect x="10" y="12" width="36" height="26" rx="10" fill="url(#sheen-cat)" style={{ mixBlendMode: 'screen' }} />

            {isSleeping ? (
              <>
                <path d="M 16 25 Q 20 29 24 25" stroke="var(--term-bright)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                <path d="M 32 25 Q 36 29 40 25" stroke="var(--term-bright)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </>
            ) : isHunting_ ? (
              <>
                <circle cx="20" cy="25" r="5" fill="#ef4444">
                  <animate attributeName="opacity" values="1;0.4;1" dur="0.35s" repeatCount="indefinite" />
                </circle>
                <circle cx="36" cy="25" r="5" fill="#ef4444">
                  <animate attributeName="opacity" values="1;0.4;1" dur="0.35s" repeatCount="indefinite" />
                </circle>
                <circle cx="20" cy="25" r="2" fill="#fff" />
                <circle cx="36" cy="25" r="2" fill="#fff" />
              </>
            ) : isExcitedLike ? (
              <>
                <text x="14" y="30" fill="var(--term-bright)" fontSize="11" fontWeight="bold">★</text>
                <text x="30" y="30" fill="var(--term-bright)" fontSize="11" fontWeight="bold">★</text>
              </>
            ) : (
              <>
                <rect x="15" y="20" width="10" height={blink ? 1 : 9} rx="2.5" fill="var(--term-bright)" />
                <rect x="31" y="20" width="10" height={blink ? 1 : 9} rx="2.5" fill="var(--term-bright)" />
                {!blink && (
                  <>
                    <motion.circle cx={pupilLX} cy={pupilY} r="2" fill="#060609" />
                    <motion.circle cx={pupilRX} cy={pupilY} r="2" fill="#060609" />
                    <motion.circle cx={glintLX} cy={glintLY} r="0.6" fill="#fff" />
                    <motion.circle cx={glintRX} cy={glintRY} r="0.6" fill="#fff" />
                  </>
                )}
              </>
            )}

            <line x1="2" y1="24" x2="10" y2="24" stroke="var(--term-bright)" strokeWidth="0.9" strokeLinecap="round" />
            <line x1="2" y1="27" x2="10" y2="26" stroke="var(--term-bright)" strokeWidth="0.9" strokeLinecap="round" />
            <line x1="46" y1="24" x2="54" y2="24" stroke="var(--term-bright)" strokeWidth="0.9" strokeLinecap="round" />
            <line x1="46" y1="26" x2="54" y2="27" stroke="var(--term-bright)" strokeWidth="0.9" strokeLinecap="round" />
            <polygon points="26,32 30,32 28,35" fill="var(--term-accent, #a855f7)" />
            {!isSleeping && (
              <path d={rig.profile.mouthOpen > 0.4 ? 'M 24 36 Q 28 40 32 36' : 'M 24 36 Q 28 38 32 36'} stroke="var(--term-bright)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            )}
          </motion.g>

          <g>
            <rect x="14" y="38" width="28" height="20" rx="7" fill="url(#metal-cat)" stroke="var(--term-border)" strokeWidth="1.3" />
            <rect x="14" y="38" width="28" height="20" rx="7" fill="url(#sheen-cat)" style={{ mixBlendMode: 'screen' }} />
            <rect x="23" y="42" width="10" height="3" rx="1.5" fill="var(--term-primary)" opacity="0.4" />
          </g>

          <motion.g style={{ rotate: rig.legL }} transform-origin="20px 58px">
            <rect x="14" y="58" width="12" height="9" rx="3" fill="var(--term-primary)" opacity="0.9" />
            <circle cx="16" cy="67" r="2.2" fill="var(--term-primary)" />
            <circle cx="20" cy="68" r="2.2" fill="var(--term-primary)" />
            <circle cx="24" cy="67" r="2.2" fill="var(--term-primary)" />
          </motion.g>
          <motion.g style={{ rotate: rig.legR }} transform-origin="36px 58px">
            <rect x="30" y="58" width="12" height="9" rx="3" fill="var(--term-primary)" opacity="0.9" />
            <circle cx="32" cy="67" r="2.2" fill="var(--term-primary)" />
            <circle cx="36" cy="68" r="2.2" fill="var(--term-primary)" />
            <circle cx="40" cy="67" r="2.2" fill="var(--term-primary)" />
          </motion.g>

          <motion.path d={tailPath} stroke="var(--term-primary)" strokeWidth="3" fill="none" strokeLinecap="round" />

          {isSleeping && (
            <>
              <text x="44" y="16" fill="var(--term-bright)" fontSize="8" fontFamily="monospace" opacity="0.7">
                <animate attributeName="y" values="16;8;16" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.7;0;0.7" dur="2s" repeatCount="indefinite" />
                Z
              </text>
              <text x="50" y="10" fill="var(--term-bright)" fontSize="11" fontFamily="monospace" opacity="0.5">
                <animate attributeName="y" values="10;2;10" dur="2.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0;0.5" dur="2.6s" repeatCount="indefinite" />
                Z
              </text>
            </>
          )}
        </g>
      </motion.g>
    </svg>
  );
};

/* ────────────────────────────────────────────────────────────────────────
   CYBER FOX SPRITE
   ──────────────────────────────────────────────────────────────────────── */
const CyberFoxSprite: React.FC<{ mood: PetMood; isHunting: boolean }> = ({ mood, isHunting }) => {
  const blink = useBlinkCycle();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { px, py } = usePointerTracking(svgRef);
  const rig = useCreatureRig(mood, isHunting);

  // Unconditional top-level transforms
  const shadowRx = useTransform(rig.shadowScale, (s) => 15 * s);
  const earL = useTransform(rig.antenna, (v) => -14 + v * 0.8);
  const earR = useTransform(rig.antenna, (v) => 14 - v * 0.8);
  const pupilLX = useTransform(px, (v) => 19 + v * 2.2);
  const pupilRX = useTransform(px, (v) => 33 + v * 2.2);
  const pupilY = useTransform(py, (v) => 24 + v * 1.3);
  const glintLX = useTransform(pupilLX, (v) => v + 0.6);
  const glintLY = useTransform(pupilY, (v) => v - 0.8);
  const glintRX = useTransform(pupilRX, (v) => v + 0.6);
  const glintRY = useTransform(pupilY, (v) => v - 0.8);
  const tailBase = useTransform(rig.legR, (v) => v * 0.6);
  const tail1 = useTransform(tailBase, (v) => `rotate(${v} 44 56)`);
  const tail2 = useTransform(rig.headTilt, (v) => `rotate(${v * 1.6} 50 48)`);

  const isSleeping = mood === 'sleeping';
  const isHunting_ = mood === 'hunting' || isHunting;

  return (
    <svg ref={svgRef} viewBox="0 0 58 92" width={30} height={48} style={{ overflow: 'visible', userSelect: 'none', pointerEvents: 'none' }}>
      <SharedDefs auraColor={rig.profile.auraColor} idSuffix="fox" />
      <linearGradient id="fur-fox" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ff8a4c" />
        <stop offset="60%" stopColor="#e8632a" />
        <stop offset="100%" stopColor="#a8441c" />
      </linearGradient>

      <motion.circle cx="29" cy="46" r="34" fill="url(#aura-fox)" opacity={rig.profile.auraIntensity} />
      <motion.ellipse cx="29" cy="88" rx={shadowRx} ry="3.2" fill="#000" opacity={0.45} style={{ filter: 'url(#contact-blur-fox)' }} />

      <motion.g style={{ y: rig.bodyY, scaleY: rig.bodyScaleY }} transform-origin="29px 70px">
        <g filter="url(#soft-glow-fox)">
          {/* Tail */}
          <motion.g style={{ transform: tail1 }}>
            <motion.path d="M 42 56 Q 52 52 50 42" stroke="url(#fur-fox)" strokeWidth="7" fill="none" strokeLinecap="round" style={{ transform: tail2 }} />
            <path d="M 48 40 Q 51 36 55 38" stroke="#fdfdfd" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.9" />
          </motion.g>

          {/* Ears */}
          <motion.g style={{ rotate: earL }} transform-origin="16px 14px">
            <polygon points="10,16 16,2 22,16" fill="url(#fur-fox)" />
            <polygon points="13,14 16,7 19,14" fill="#1a1013" />
          </motion.g>
          <motion.g style={{ rotate: earR }} transform-origin="42px 14px">
            <polygon points="36,16 42,2 48,16" fill="url(#fur-fox)" />
            <polygon points="39,14 42,7 45,14" fill="#1a1013" />
          </motion.g>

          {/* Head */}
          <motion.g style={{ rotate: rig.headTilt }} transform-origin="29px 26px">
            <path d="M 10 22 Q 8 12 29 10 Q 50 12 48 22 L 46 34 Q 29 44 12 34 Z" fill="url(#fur-fox)" stroke="#7a3413" strokeWidth="1" />
            <path d="M 18 28 Q 29 40 40 28 Q 36 36 29 37 Q 22 36 18 28 Z" fill="#fff6ec" opacity="0.92" />

            {isSleeping ? (
              <>
                <path d="M 18 24 Q 22 27 26 24" stroke="#1a1013" strokeWidth="1.4" fill="none" strokeLinecap="round" />
                <path d="M 32 24 Q 36 27 40 24" stroke="#1a1013" strokeWidth="1.4" fill="none" strokeLinecap="round" />
              </>
            ) : isHunting_ ? (
              <>
                <ellipse cx="22" cy="24" rx="4.4" ry="5" fill="#ef4444">
                  <animate attributeName="opacity" values="1;0.5;1" dur="0.35s" repeatCount="indefinite" />
                </ellipse>
                <ellipse cx="36" cy="24" rx="4.4" ry="5" fill="#ef4444">
                  <animate attributeName="opacity" values="1;0.5;1" dur="0.35s" repeatCount="indefinite" />
                </ellipse>
              </>
            ) : (
              <>
                <ellipse cx="22" cy="24" rx="4.4" ry={blink ? 0.6 : 5} fill="#1a1013" />
                <ellipse cx="36" cy="24" rx="4.4" ry={blink ? 0.6 : 5} fill="#1a1013" />
                {!blink && (
                  <>
                    <motion.circle cx={pupilLX} cy={pupilY} r="1.6" fill="#ffd166" />
                    <motion.circle cx={pupilRX} cy={pupilY} r="1.6" fill="#ffd166" />
                    <motion.circle cx={glintLX} cy={glintLY} r="0.6" fill="#fff" />
                    <motion.circle cx={glintRX} cy={glintRY} r="0.6" fill="#fff" />
                  </>
                )}
              </>
            )}

            <polygon points="26,32 32,32 29,36" fill="#1a1013" />
          </motion.g>

          {/* Body */}
          <path d="M 14 40 Q 29 32 44 40 L 43 60 Q 29 66 15 60 Z" fill="url(#fur-fox)" stroke="#7a3413" strokeWidth="1" />
          <path d="M 20 46 Q 29 52 38 46 L 36 58 Q 29 62 22 58 Z" fill="#fff6ec" opacity="0.9" />

          {/* Legs */}
          <motion.g style={{ rotate: rig.legL }} transform-origin="20px 60px">
            <rect x="16" y="60" width="8" height="14" rx="3.5" fill="url(#fur-fox)" />
            <rect x="15" y="72" width="10" height="4" rx="2" fill="#1a1013" />
          </motion.g>
          <motion.g style={{ rotate: rig.legR }} transform-origin="38px 60px">
            <rect x="34" y="60" width="8" height="14" rx="3.5" fill="url(#fur-fox)" />
            <rect x="33" y="72" width="10" height="4" rx="2" fill="#1a1013" />
          </motion.g>

          {isSleeping && (
            <text x="46" y="16" fill="var(--term-bright)" fontSize="9" fontFamily="monospace" opacity="0.6">
              <animate attributeName="y" values="16;6;16" dur="2.3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0;0.6" dur="2.3s" repeatCount="indefinite" />
              Z
            </text>
          )}
        </g>
      </motion.g>
    </svg>
  );
};

/* ────────────────────────────────────────────────────────────────────────
   DICEBEAR SKIN (external avatar API)
   ──────────────────────────────────────────────────────────────────────── */
const DiceBearSprite: React.FC<{ mood: PetMood }> = ({ mood }) => {
  const seedMap: Record<PetMood, string> = {
    happy: 'nexus-happy-v2',
    'walking-left': 'nexus-walk-left',
    'walking-right': 'nexus-walk-right',
    coding: 'nexus-coding-cyber',
    inspecting: 'nexus-inspect-matrix',
    dancing: 'nexus-party-dance',
    eating: 'nexus-ramen-eat',
    sleeping: 'nexus-sleep-dream',
    excited: 'nexus-super-excited',
    hunting: 'nexus-hunter-strike',
    confused: 'nexus-curious-question',
  };
  const seed = seedMap[mood] || 'nexus-ai';
  const url = `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}&backgroundColor=transparent&baseColor=22c55e,38bdf8,a855f7`;

  return (
    <motion.img
      src={url}
      alt="Nexus-9"
      width={32}
      height={32}
      draggable={false}
      style={{ filter: 'drop-shadow(0 0 10px var(--term-glow))', userSelect: 'none', pointerEvents: 'none', display: 'block' }}
      animate={{
        y: mood.startsWith('walking') ? [0, -5, 0] : mood === 'dancing' ? [-4, 4, -4] : [0, -2, 0],
        rotate: mood === 'dancing' ? [-8, 8, -8] : 0,
        scaleX: mood === 'walking-left' ? -1 : 1,
      }}
      transition={{ repeat: Infinity, duration: 0.55, ease: 'easeInOut' }}
    />
  );
};

/* ────────────────────────────────────────────────────────────────────────
   Main export
   ──────────────────────────────────────────────────────────────────────── */
const CyberPetSprite: React.FC<CyberPetSpriteProps> = ({ mood, skin, isHunting = false }) => {
  if (skin === 'dicebear-bot') return <DiceBearSprite mood={mood} />;
  if (skin === 'pixel-cat') return <PixelCatSprite mood={mood} isHunting={isHunting} />;
  if (skin === 'cyber-fox') return <CyberFoxSprite mood={mood} isHunting={isHunting} />;
  return <RobotSprite mood={mood} isHunting={isHunting} />;
};

export default CyberPetSprite;