import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Bug, X, ChevronUp, ChevronDown, Sparkles, Coffee, Utensils, Zap, Music, Award, Palette, MousePointer, Crosshair } from 'lucide-react';
import { terminalSound } from '../utils/terminalSound';
import CyberPetSprite, { CharacterSkin } from './CyberPetSprite';

export type PetMood =
  | 'happy'
  | 'walking-left'
  | 'walking-right'
  | 'coding'
  | 'eating'
  | 'sleeping'
  | 'excited'
  | 'dancing'
  | 'inspecting'
  | 'hunting'
  | 'confused';

// Behavior state machine
type BehaviorState =
  | 'ROAMING'
  | 'WALKING_BORDER'
  | 'EATING_TEXT'
  | 'INSPECTING_ELEMENT'
  | 'SLEEPING_ON_CARD'
  | 'CURSOR_NEARBY'
  | 'FOLLOWING_CURSOR'
  | 'HUNTING_BUG'
  | 'LASER_CHASE'
  | 'TAB_RESIDENT'
  | 'DANCING';

interface CyberPetProps {
  onShowToast?: (msg: string) => void;
  activeTab?: string;
  terminalTheme?: string;
}

interface BugTarget {
  id: number;
  x: number;
  y: number;
}

interface BorderWalkTarget {
  rect: DOMRect;
  edge: 'top' | 'right' | 'bottom' | 'left';
  progress: number; // 0–1 along that edge
}

const TAB_COMMENTARY: Record<string, string[]> = {
  welcome: [
    "Exploring ~/welcome.sh! Neofetch specs look beastly 🚀",
    "Checking system telemetry... 100,000+ MAU scaled in production!",
    "Zsh + Tmux + Neovim stack running at sub-16ms frames ⚡",
    "Type 'about', 'projects', or 'snake' in the terminal prompt!",
  ],
  about: [
    "Tolu's work at eJaby Dubai cut checkout drop-off by 30%! 💳",
    "Click any question in the Recruiter AMA to see real metrics!",
    "4+ years building full-stack platforms across Dubai & Nigeria.",
    "B.Sc. Computer Science + Harvard CS50 + Stanford AI verified!",
  ],
  projects: [
    "RIAUM AI mental wellness platform uses Gemini LLM pipelines!",
    "WireBridge polyglot runtime connects Python, TS, Go, Ruby, and Laravel.",
    "Twin Turbine 3D simulator runs at 60 FPS in Three.js / WebGL 🌐",
    "Click 'Live Demo' on any card to launch the live application!",
  ],
  games: [
    "Snake CLI engaged! Swipe on mobile or use Arrow keys 🐍",
    "Watch your tail! My high score is 120 points.",
    "Developer Code Speed test is ready. Test your WPM!",
  ],
  npc: [
    "Say hi to @tolu-ai or @tux for me! 🐧",
    "Our AI daemons have custom neural personalities.",
    "Ask @recruiter about salary expectations or contract rates!",
  ],
  htop: [
    "Process monitor online! CPU load is lean & clean.",
    "All daemon worker threads operating with 0 memory leaks 🎉",
  ],
  radio: [
    "Spotify Location Radio playing tunes from Dubai, Nigeria, and Tokyo! 📻",
    "Lo-fi beats sync perfectly with high-speed coding.",
  ],
  apis: [
    "Live weather & crypto data streaming via open APIs!",
    "Checking Dubai & Lagos weather... 100% CORS compliant.",
  ],
  skills: [
    "TypeScript + React + Node.js + Three.js + LLMs = Superpower stack 💻",
    "Strict type-safety: No 'any' types allowed here!",
  ],
  experience: [
    "Verified production history: eJaby (Dubai), ByTeom Tech, GDG Lead.",
    "Mentored 30+ students directly into software engineering roles!",
  ],
  resume: [
    "Download Toluwanimi's official CV! Ready for high-impact roles.",
    "Full-stack & Frontend leadership ready for UAE, US, & remote teams.",
  ],
  contact: [
    "Send an instant message packet to durojaiyetoluwani@gmail.com! ✉️",
    "Tolu responds to all hiring & contract inquiries within 24 hours.",
  ],
};

// Selectors for interactable DOM regions
const INTERACTABLE_SELECTORS = [
  '[class*="rounded"]',
  '[class*="border"]',
  'button',
  'a',
  'h1', 'h2', 'h3', 'p',
  '[class*="card"]',
  '[class*="panel"]',
];

const TEXT_SELECTORS = ['p', 'h1', 'h2', 'h3', 'span', 'li', 'code', 'pre'];

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

// Find a good interactable element near a point (excluding the pet itself)
function getElementAtPoint(x: number, y: number): Element | null {
  const els = document.elementsFromPoint(x, y);
  for (const el of els) {
    if (el.id === 'cyber-pet-root') continue;
    if ((el as HTMLElement).closest('#cyber-pet-root')) continue;
    const tag = el.tagName.toLowerCase();
    if (['html', 'body', 'script', 'style'].includes(tag)) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width > 40 && rect.height > 20) return el;
  }
  return null;
}

// Find a large "card" element on screen to walk around
function findNearbyCard(x: number, y: number, radius = 250): { el: Element; rect: DOMRect } | null {
  const candidates = document.querySelectorAll('[class*="rounded"], [class*="border"], [class*="card"], section, article, main');
  let best: { el: Element; rect: DOMRect; dist: number } | null = null;
  candidates.forEach((el) => {
    if ((el as HTMLElement).closest('#cyber-pet-root')) return;
    const rect = el.getBoundingClientRect();
    if (rect.width < 80 || rect.height < 60) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dist = Math.hypot(cx - x, cy - y);
    if (dist < radius && (!best || dist < best.dist)) {
      best = { el, rect, dist };
    }
  });
  return best ? { el: best.el, rect: best.rect } : null;
}

// Find a text element to "eat" letters from
function findTextElement(x: number, y: number, radius = 200): Element | null {
  const candidates = document.querySelectorAll(TEXT_SELECTORS.join(','));
  let best: { el: Element; dist: number } | null = null;
  candidates.forEach((el) => {
    if ((el as HTMLElement).closest('#cyber-pet-root')) return;
    if (!el.textContent || el.textContent.trim().length < 5) return;
    const rect = el.getBoundingClientRect();
    if (rect.width < 20 || rect.height < 10) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dist = Math.hypot(cx - x, cy - y);
    if (dist < radius && (!best || dist < best.dist)) {
      best = { el, dist };
    }
  });
  return best ? best.el : null;
}

// Get border walk position
function getBorderPos(rect: DOMRect, edge: string, progress: number): { x: number; y: number } {
  const p = clamp(progress, 0, 1);
  switch (edge) {
    case 'top':    return { x: rect.left + p * rect.width, y: rect.top - 8 };
    case 'right':  return { x: rect.right + 2, y: rect.top + p * rect.height };
    case 'bottom': return { x: rect.right - p * rect.width, y: rect.bottom + 2 };
    case 'left':   return { x: rect.left - 10, y: rect.bottom - p * rect.height };
    default:       return { x: rect.left, y: rect.top };
  }
}

const EDGES: Array<'top' | 'right' | 'bottom' | 'left'> = ['top', 'right', 'bottom', 'left'];

const CyberPet: React.FC<CyberPetProps> = ({ onShowToast, activeTab = 'welcome', terminalTheme = 'green' }) => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [mood, setMood] = useState<PetMood>('happy');
  const [frame, setFrame] = useState<number>(0);
  const [skin, setSkin] = useState<CharacterSkin>('robot');
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);

  // 2D position
  const [pos, setPos] = useState<{ x: number; y: number }>({
    x: typeof window !== 'undefined' ? window.innerWidth * 0.7 : 600,
    y: typeof window !== 'undefined' ? window.innerHeight * 0.5 : 400,
  });

  // Feature toggles
  const [followCursor, setFollowCursor] = useState<boolean>(false);
  const [laserActive, setLaserActive] = useState<boolean>(false);
  const [laserPos, setLaserPos] = useState<{ x: number; y: number } | null>(null);
  const [activeBug, setActiveBug] = useState<BugTarget | null>(null);

  // Stats
  const [hunger, setHunger] = useState<number>(85);
  const [energy, setEnergy] = useState<number>(90);
  const [happiness, setHappiness] = useState<number>(95);
  const [exp, setExp] = useState<number>(65);
  const [level, setLevel] = useState<number>(1);
  const [bugsCaught, setBugsCaught] = useState<number>(0);

  // Letter-eating visual state
  const [eatenLetters, setEatenLetters] = useState<{ id: number; char: string; x: number; y: number }[]>([]);

  // Internal refs — no re-render on change
  const posRef = useRef(pos);
  posRef.current = pos;
  const targetPosRef = useRef(pos);
  const mousePosRef = useRef({ x: 500, y: 300 });
  const animFrameRef = useRef<number | null>(null);

  // Behavior state machine
  const behaviorRef = useRef<BehaviorState>('ROAMING');
  const borderWalkRef = useRef<BorderWalkTarget | null>(null);
  const behaviorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const eatTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Tab residency — pet picks a tab to "live" in
  const residentTabRef = useRef<string>(activeTab);
  const isResidentArrivedRef = useRef<boolean>(false);

  const getLevelTitle = (lvl: number) => {
    if (lvl === 1) return 'Kernel Pup';
    if (lvl === 2) return 'Byte Runner';
    if (lvl === 3) return 'Script Daemon';
    if (lvl === 4) return 'Full-Stack Familiar';
    if (lvl === 5) return 'Production Guardian';
    return 'Sentient AI God';
  };

  // Speech removed — pet communicates through body language only
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const showThoughtFor = useCallback((_text: string, _ms = 5000) => {
    // intentionally silent
  }, []);

  // Sprite animation frame tick
  useEffect(() => {
    const frameInterval = setInterval(() => {
      setFrame((prev) => (prev === 0 ? 1 : 0));
    }, 420);
    return () => clearInterval(frameInterval);
  }, []);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
      if (laserActive) {
        setLaserPos({ x: e.clientX, y: e.clientY });
        targetPosRef.current = { x: e.clientX - 24, y: e.clientY - 24 };
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [laserActive]);

  // EXP Progression
  const gainExp = useCallback((amount: number) => {
    setExp((prev) => {
      const next = prev + amount;
      if (next >= 100) {
        setLevel((l) => {
          const nextLvl = l + 1;
          terminalSound.playLevelUp?.();
          if (onShowToast) onShowToast(`🌟 Nexus-9 leveled up to Level ${nextLvl}: ${getLevelTitle(nextLvl)}!`);
          return nextLvl;
        });
        return next - 100;
      }
      return next;
    });
  }, [onShowToast]);

  // Tab change reaction + tab residency
  useEffect(() => {
    const comments = TAB_COMMENTARY[activeTab] || TAB_COMMENTARY.welcome;
    const randomComment = comments[Math.floor(Math.random() * comments.length)];
    gainExp(5);

    if (activeTab === residentTabRef.current) {
      // Pet is already "living" here — react with surprise!
      if (isResidentArrivedRef.current) {
        showThoughtFor(`Oh! You found me! I've been exploring ${activeTab}.sh! 😸`, 7000);
        setMood('excited');
        terminalSound.playChirp?.();
      } else {
        isResidentArrivedRef.current = true;
        showThoughtFor(randomComment, 6000);
      }
    } else {
      showThoughtFor(randomComment, 6000);
    }

    if (activeTab === 'games') setMood('excited');
    else if (activeTab === 'radio') setMood('dancing');
    else if (activeTab === 'about' || activeTab === 'projects') setMood('inspecting');
    else setMood('happy');

    // 30% chance to migrate residency to new tab
    if (Math.random() < 0.3) {
      residentTabRef.current = activeTab;
      isResidentArrivedRef.current = true;
    }
  }, [activeTab]);

  // ─── DOM Interaction Scanner ──────────────────────────────────────────────
  // Every 8–15s, decide next autonomous behavior
  const scheduleBehavior = useCallback(() => {
    if (behaviorTimerRef.current) clearTimeout(behaviorTimerRef.current);
    const delay = 8000 + Math.random() * 7000;
    behaviorTimerRef.current = setTimeout(() => {
      if (
        followCursor || laserActive ||
        activeBug != null ||
        behaviorRef.current === 'HUNTING_BUG' ||
        behaviorRef.current === 'LASER_CHASE' ||
        behaviorRef.current === 'FOLLOWING_CURSOR' ||
        behaviorRef.current === 'DANCING'
      ) {
        scheduleBehavior();
        return;
      }

      const roll = Math.random();
      const px = posRef.current.x + 24;
      const py = posRef.current.y + 24;

      if (roll < 0.20) {
        // Walk along a border
        const card = findNearbyCard(px, py, 350);
        if (card) {
          behaviorRef.current = 'WALKING_BORDER';
          const edgeIdx = Math.floor(Math.random() * 4);
          borderWalkRef.current = {
            rect: card.rect,
            edge: EDGES[edgeIdx],
            progress: 0,
          };
          setMood('inspecting');
          showThoughtFor('Inspecting this component border... 🔍', 4000);
        } else {
          behaviorRef.current = 'ROAMING';
        }
      } else if (roll < 0.35) {
        // Eat some letters
        const textEl = findTextElement(px, py, 280);
        if (textEl) {
          behaviorRef.current = 'EATING_TEXT';
          const rect = textEl.getBoundingClientRect();
          targetPosRef.current = { x: rect.left + rect.width * 0.3, y: rect.top - 10 };
          setMood('eating');
          showThoughtFor('Nom nom... delicious TypeScript text! 😋', 4500);
          // Start munching letters after a short approach delay
          if (eatTimerRef.current) clearTimeout(eatTimerRef.current);
          eatTimerRef.current = setTimeout(() => {
            const text = textEl.textContent || '';
            const chars = text.split('').filter((c) => c.trim() !== '');
            if (chars.length > 3) {
              const munchCount = Math.floor(Math.random() * 4) + 2;
              for (let i = 0; i < munchCount; i++) {
                setTimeout(() => {
                  const idx = Math.floor(Math.random() * chars.length);
                  const rect2 = textEl.getBoundingClientRect();
                  const eid = Date.now() + i;
                  setEatenLetters((prev) => [
                    ...prev,
                    {
                      id: eid,
                      char: chars[idx] || '.',
                      x: rect2.left + Math.random() * rect2.width,
                      y: rect2.top,
                    },
                  ]);
                  setTimeout(() => {
                    setEatenLetters((prev) => prev.filter((e) => e.id !== eid));
                  }, 900);
                }, i * 350);
              }
            }
            setTimeout(() => {
              behaviorRef.current = 'ROAMING';
              setMood('happy');
              scheduleBehavior();
            }, 3000);
          }, 1800);
        } else {
          behaviorRef.current = 'ROAMING';
        }
      } else if (roll < 0.50) {
        // Sleep on a flat card
        const card = findNearbyCard(px, py, 400);
        if (card) {
          behaviorRef.current = 'SLEEPING_ON_CARD';
          targetPosRef.current = {
            x: card.rect.left + card.rect.width / 2 - 24,
            y: card.rect.top + 10,
          };
          setMood('sleeping');
          showThoughtFor('Zzz... dreaming of microservices... 💤', 8000);
          // Wake up after 8–12s
          const wakeDelay = 8000 + Math.random() * 4000;
          setTimeout(() => {
            if (behaviorRef.current === 'SLEEPING_ON_CARD') {
              behaviorRef.current = 'ROAMING';
              setMood('happy');
              showThoughtFor('Good nap! Back to patrolling 🐾', 4000);
              scheduleBehavior();
            }
          }, wakeDelay);
          return; // don't schedule again yet
        } else {
          behaviorRef.current = 'ROAMING';
        }
      } else if (roll < 0.60) {
        // Inspect a nearby button
        const btn = document.querySelector('button:not(#cyber-pet-root button)') as HTMLElement | null;
        if (btn) {
          behaviorRef.current = 'INSPECTING_ELEMENT';
          const rect = btn.getBoundingClientRect();
          targetPosRef.current = { x: rect.left - 20, y: rect.top - 15 };
          setMood('inspecting');
          showThoughtFor('Ooh, what does this button do? 🤔', 4000);
          setTimeout(() => {
            if (behaviorRef.current === 'INSPECTING_ELEMENT') {
              behaviorRef.current = 'ROAMING';
              setMood('happy');
              scheduleBehavior();
            }
          }, 5000);
          return;
        } else {
          behaviorRef.current = 'ROAMING';
        }
      } else {
        // Plain roaming — pick a random viewport waypoint
        behaviorRef.current = 'ROAMING';
        const maxX = window.innerWidth - 80;
        const maxY = window.innerHeight - 100;
        targetPosRef.current = {
          x: clamp(Math.random() * maxX, 20, maxX),
          y: clamp(Math.random() * maxY, 60, maxY),
        };
        const randMoods: PetMood[] = ['coding', 'happy', 'confused', 'inspecting'];
        setMood(randMoods[Math.floor(Math.random() * randMoods.length)]);
      }

      scheduleBehavior();
    }, delay);
  }, [followCursor, laserActive, activeBug, showThoughtFor]);

  // Start behavior scheduler on mount
  useEffect(() => {
    // First move: pick a random starting spot
    const maxX = window.innerWidth - 80;
    const maxY = window.innerHeight - 100;
    targetPosRef.current = {
      x: clamp(Math.random() * maxX, 100, maxX - 100),
      y: clamp(Math.random() * maxY, 80, maxY - 80),
    };
    scheduleBehavior();

    return () => {
      if (behaviorTimerRef.current) clearTimeout(behaviorTimerRef.current);
      if (eatTimerRef.current) clearTimeout(eatTimerRef.current);
    };
  }, []);

  // Cursor proximity watcher (every 500ms, not every frame)
  useEffect(() => {
    const interval = setInterval(() => {
      if (followCursor || laserActive || activeBug) return;
      const dx = mousePosRef.current.x - (posRef.current.x + 24);
      const dy = mousePosRef.current.y - (posRef.current.y + 24);
      const dist = Math.hypot(dx, dy);
      if (dist < 80 && behaviorRef.current === 'ROAMING') {
        setMood('excited');
        showThoughtFor('Hey! Hello there! 👋', 3000);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [followCursor, laserActive, activeBug, showThoughtFor]);

  // ─── Physics Loop ──────────────────────────────────────────────────────────
  useEffect(() => {
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const behavior = behaviorRef.current;
      const cur = posRef.current;

      // Determine target & speed
      let tx = targetPosRef.current.x;
      let ty = targetPosRef.current.y;

      // Border walking override
      if (behavior === 'WALKING_BORDER' && borderWalkRef.current) {
        const bw = borderWalkRef.current;
        // Refresh rect each frame (element may scroll)
        const freshRect = bw.rect;
        bw.progress += dt * 0.08; // walk at ~8% of edge per second
        if (bw.progress > 1) {
          bw.progress = 0;
          const nextEdgeIdx = (EDGES.indexOf(bw.edge) + 1) % 4;
          bw.edge = EDGES[nextEdgeIdx];
          if (bw.edge === 'top') {
            // Completed full perimeter
            behaviorRef.current = 'ROAMING';
            borderWalkRef.current = null;
            setMood('happy');
            showThoughtFor('Border patrol complete! No bugs found. ✅', 4000);
            scheduleBehavior();
          }
        }
        if (borderWalkRef.current) {
          const bp = getBorderPos(freshRect, bw.edge, bw.progress);
          tx = bp.x;
          ty = bp.y;
        }
      } else if (followCursor && !activeBug) {
        tx = mousePosRef.current.x - 24;
        ty = mousePosRef.current.y - 45;
      }

      const dx = tx - cur.x;
      const dy = ty - cur.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 3) {
        let speed: number;
        if (behavior === 'LASER_CHASE' || laserActive) speed = 200;
        else if (behavior === 'HUNTING_BUG') speed = 140;
        else if (behavior === 'FOLLOWING_CURSOR' || followCursor) speed = 90;
        else if (behavior === 'WALKING_BORDER') speed = 55;
        else speed = 48; // base roaming speed — slow and life-like

        // Ease-in: ramp up over first 50px
        const ease = Math.min(1, dist / 50);
        const moveDist = Math.min(speed * ease * dt, dist);

        const nx = cur.x + (dx / dist) * moveDist;
        const ny = cur.y + (dy / dist) * moveDist;

        // Clamp to viewport
        const nx2 = clamp(nx, 5, window.innerWidth - 55);
        const ny2 = clamp(ny, 10, window.innerHeight - 65);

        // Directional mood
        if (
          behavior !== 'SLEEPING_ON_CARD' &&
          mood !== 'dancing' && mood !== 'eating' &&
          mood !== 'sleeping' && mood !== 'inspecting' &&
          mood !== 'coding' && mood !== 'hunting'
        ) {
          if (dx > 5) setMood('walking-right');
          else if (dx < -5) setMood('walking-left');
        }

        setPos({ x: nx2, y: ny2 });

        // Bug catch check
        if (behavior === 'HUNTING_BUG' && activeBug) {
          const bdx = activeBug.x - nx2;
          const bdy = activeBug.y - ny2;
          if (Math.hypot(bdx, bdy) < 30) {
            setActiveBug(null);
            behaviorRef.current = 'ROAMING';
            setMood('excited');
            setBugsCaught((b) => b + 1);
            terminalSound.playLevelUp?.();
            showThoughtFor('💥 BUG PURGED! Memory leak fixed! (+40 EXP) 🎉', 5000);
            gainExp(40);
            setHappiness((h) => Math.min(100, h + 20));
            if (onShowToast) onShowToast('🐛 Nexus-9 caught and squashed a software bug!');
            scheduleBehavior();
          }
        }
      } else {
        // Arrived
        if (behavior === 'ROAMING') {
          // Pick next waypoint soon
        }
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [followCursor, laserActive, activeBug, mood, gainExp, showThoughtFor, scheduleBehavior, onShowToast]);

  // ─── Actions ───────────────────────────────────────────────────────────────
  const petThePet = () => {
    terminalSound.playChirp?.();
    setMood('excited');
    setHappiness((prev) => Math.min(100, prev + 12));
    showThoughtFor('Purrrr! Thank you human! ❤️ (+15 EXP)', 4000);
    gainExp(15);
    const heartId = Date.now();
    setHearts((prev) => [...prev, { id: heartId, x: Math.random() * 30 - 15, y: -20 }]);
    setTimeout(() => setHearts((prev) => prev.filter((h) => h.id !== heartId)), 1000);
  };

  const spawnBug = () => {
    terminalSound.playJump?.();
    const bugX = clamp(Math.random() * (window.innerWidth - 120), 60, window.innerWidth - 120);
    const bugY = clamp(Math.random() * (window.innerHeight - 180), 90, window.innerHeight - 180);
    const bug: BugTarget = { id: Date.now(), x: bugX, y: bugY };
    setActiveBug(bug);
    behaviorRef.current = 'HUNTING_BUG';
    setMood('hunting');
    targetPosRef.current = { x: bugX, y: bugY };
    showThoughtFor('⚠️ MEMORY BUG DETECTED! Deploying capture protocol! 🐛', 5000);
  };

  const feedTreat = (type: 'ramen' | 'coffee' | 'ram' | 'pizza') => {
    terminalSound.playEat?.();
    setMood('eating');
    setHunger((prev) => Math.min(100, prev + 25));
    setHappiness((prev) => Math.min(100, prev + 15));
    gainExp(20);
    if (type === 'coffee') {
      showThoughtFor('⚡ Caffeine injected! Turbo compile speed +30! 🚀', 4000);
      setEnergy((prev) => Math.min(100, prev + 30));
    } else if (type === 'ramen') {
      showThoughtFor('🍜 Delicious cyber ramen! (nom nom nom) 😋', 4000);
    } else if (type === 'pizza') {
      showThoughtFor('🍕 Late night hackathon pizza! 🎉', 4000);
    } else {
      showThoughtFor('💾 Yum! 32GB ECC RAM allocated! ⚡', 4000);
    }
    setTimeout(() => {
      if (behaviorRef.current === 'EATING_TEXT') behaviorRef.current = 'ROAMING';
      setMood('happy');
    }, 2800);
  };

  const makeDance = () => {
    terminalSound.playJump?.();
    behaviorRef.current = 'DANCING';
    setMood('dancing');
    showThoughtFor('🎶 Dancing across the portfolio! 🕺✨', 5000);
    gainExp(15);
    // Spiral dance path
    let angle = 0;
    const cx = posRef.current.x;
    const cy = posRef.current.y;
    const spiralInterval = setInterval(() => {
      angle += 0.5;
      const r = 60;
      targetPosRef.current = {
        x: clamp(cx + Math.cos(angle) * r, 20, window.innerWidth - 60),
        y: clamp(cy + Math.sin(angle) * r * 0.5, 60, window.innerHeight - 80),
      };
    }, 120);
    setTimeout(() => {
      clearInterval(spiralInterval);
      behaviorRef.current = 'ROAMING';
      setMood('happy');
      scheduleBehavior();
    }, 4500);
  };

  const toggleSleep = () => {
    terminalSound.playKeyClick?.();
    if (mood === 'sleeping') {
      behaviorRef.current = 'ROAMING';
      setMood('happy');
      showThoughtFor('Good morning! System recharged! ⚡', 4000);
      scheduleBehavior();
    } else {
      behaviorRef.current = 'SLEEPING_ON_CARD';
      setMood('sleeping');
      showThoughtFor('Zzz... dreaming of clean code architectures... 💤', 8000);
    }
  };

  const toggleFollowCursor = () => {
    terminalSound.playKeyClick?.();
    setFollowCursor((prev) => {
      const next = !prev;
      if (next) {
        behaviorRef.current = 'FOLLOWING_CURSOR';
        showThoughtFor('Following your cursor! 🎯', 3000);
      } else {
        behaviorRef.current = 'ROAMING';
        showThoughtFor('Free-roaming again! 🐾', 3000);
        scheduleBehavior();
      }
      return next;
    });
  };

  const toggleLaser = () => {
    terminalSound.playKeyClick?.();
    setLaserActive((prev) => {
      const next = !prev;
      if (next) {
        behaviorRef.current = 'LASER_CHASE';
        showThoughtFor('Laser pointer active! SPRINTING! 🔴', 3000);
      } else {
        behaviorRef.current = 'ROAMING';
        showThoughtFor('Laser off. Whew! 😅', 3000);
        scheduleBehavior();
      }
      return next;
    });
  };

  return (
    <>
      {/* Laser Pointer Dot */}
      {laserActive && laserPos && (
        <div
          style={{ left: `${laserPos.x}px`, top: `${laserPos.y}px` }}
          className="fixed pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2"
        >
          <div className="w-4 h-4 rounded-full bg-red-500 shadow-[0_0_15px_#ef4444] animate-ping" />
          <div className="w-2 h-2 rounded-full bg-white absolute top-1 left-1" />
        </div>
      )}

      {/* Bug Entity */}
      <AnimatePresence>
        {activeBug && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            style={{ left: `${activeBug.x}px`, top: `${activeBug.y}px` }}
            className="fixed z-[9997] cursor-pointer pointer-events-auto"
            onClick={spawnBug}
          >
            <div className="flex items-center gap-1 bg-red-900/90 text-red-200 px-2.5 py-1 rounded-full border border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-bounce font-mono text-[10px]">
              <Bug className="w-3.5 h-3.5 text-red-400 animate-spin" />
              <span>BUG #042</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Eaten Letter Particles — float up from text */}
      <AnimatePresence>
        {eatenLetters.map((el) => (
          <motion.div
            key={el.id}
            initial={{ opacity: 1, y: 0, x: el.x, scale: 1 }}
            animate={{ opacity: 0, y: el.y - 50, scale: 1.8 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            style={{ left: 0, top: 0, position: 'fixed' }}
            className="pointer-events-none z-[9996] font-mono text-[var(--term-primary)] text-sm font-bold drop-shadow-[0_0_6px_var(--term-glow)]"
          >
            {el.char}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* ── THE PET — bare, no box/card ── */}
      <div
        id="cyber-pet-root"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
          willChange: 'transform',
          zIndex: 9999,
          userSelect: 'none',
          pointerEvents: 'auto',
        }}
      >
        {/* Heart Particles */}
        {hearts.map((h) => (
          <motion.div
            key={h.id}
            initial={{ opacity: 1, y: 0, scale: 0.8 }}
            animate={{ opacity: 0, y: -45, scale: 1.5 }}
            transition={{ duration: 0.9 }}
            className="absolute -top-6 left-1/2 -translate-x-1/2 text-red-400 pointer-events-none"
          >
            <Heart className="w-5 h-5 fill-red-500" />
          </motion.div>
        ))}


        {/* THE SPRITE — clicked to pet */}
        <div
          onClick={petThePet}
          onContextMenu={(e) => {
            e.preventDefault();
            setIsMenuOpen((p) => !p);
          }}
          style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          title="Click to pet! Right-click for menu"
        >
          <CyberPetSprite mood={mood} frame={frame} skin={skin} isHunting={behaviorRef.current === 'HUNTING_BUG'} />
        </div>

        {/* Level badge — minimal, tiny */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            terminalSound.playKeyClick?.();
            setIsMenuOpen((p) => !p);
          }}
          style={{
            display: 'block',
            margin: '1px auto 0',
            fontSize: '8px',
            lineHeight: 1,
            padding: '1.5px 4px',
            background: 'rgba(10,10,14,0.85)',
            border: '1px solid var(--term-border)',
            borderRadius: '999px',
            color: 'var(--term-bright)',
            fontWeight: 'bold',
            cursor: 'pointer',
            backdropFilter: 'blur(4px)',
          }}
        >
          Lv.{level} {isMenuOpen ? '▾' : '▴'}
        </button>

        {/* Floating Control Deck */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 10 }}
              transition={{ duration: 0.18 }}
              style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                marginTop: '6px',
                width: '240px',
                zIndex: 10001,
              }}
              className="bg-[#0c0c0f]/98 border border-[var(--term-primary)] rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.95)] p-3 space-y-2 text-[10px] backdrop-blur-xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#1f1f24] pb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-white font-bold text-[11px]">NEXUS-9</span>
                  <span className="text-[9px] px-1.5 rounded bg-[var(--term-bg-subtle)] text-[var(--term-bright)] font-bold border border-[var(--term-border)]">
                    {getLevelTitle(level)}
                  </span>
                </div>
                <button onClick={() => setIsMenuOpen(false)} className="p-0.5 text-zinc-500 hover:text-white cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </div>

              {/* EXP Bar */}
              <div className="bg-[#121216] p-1.5 rounded-lg border border-[#1f1f24]">
                <div className="flex justify-between text-zinc-400 mb-1">
                  <span className="flex items-center gap-1 text-[var(--term-bright)] font-bold">
                    <Award className="w-3 h-3" /> Lv.{level} EXP
                  </span>
                  <span className="text-white font-bold">{exp}/100</span>
                </div>
                <div className="w-full bg-[#18181b] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[var(--term-primary)] h-full transition-all duration-300" style={{ width: `${exp}%` }} />
                </div>
                <div className="flex justify-between mt-1 text-zinc-500">
                  <span>Bugs: {bugsCaught}</span>
                  <span>😊 {happiness}%</span>
                </div>
              </div>

              {/* Cursor AI */}
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={toggleFollowCursor}
                  className={`p-1.5 rounded flex items-center justify-center gap-1 font-bold cursor-pointer transition-all ${followCursor ? 'bg-[#38bdf8] text-black' : 'bg-[#18181b] border border-[#27272a] text-zinc-300 hover:text-white'}`}
                >
                  <MousePointer className="w-3 h-3" />
                  <span>{followCursor ? 'Follow: ON' : 'Follow'}</span>
                </button>
                <button
                  onClick={toggleLaser}
                  className={`p-1.5 rounded flex items-center justify-center gap-1 font-bold cursor-pointer transition-all ${laserActive ? 'bg-red-500 text-white animate-pulse' : 'bg-[#18181b] border border-[#27272a] text-zinc-300 hover:text-white'}`}
                >
                  <Crosshair className="w-3 h-3 text-red-400" />
                  <span>{laserActive ? 'Laser: ON' : 'Laser'}</span>
                </button>
              </div>

              {/* Treats */}
              <div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Feed (+20 EXP)</div>
                <div className="grid grid-cols-4 gap-1">
                  {([['ramen','🍜','#22c55e'],['coffee','☕','#f59e0b'],['pizza','🍕','#ef4444'],['ram','💾','#a855f7']] as const).map(([t, emoji, color]) => (
                    <button
                      key={t}
                      onClick={() => feedTreat(t as 'ramen' | 'coffee' | 'ram' | 'pizza')}
                      className="p-1 bg-[#141418] hover:bg-[#1f1f24] border border-[#27272a] rounded flex flex-col items-center text-zinc-300 cursor-pointer"
                    >
                      <span>{emoji}</span>
                      <span className="text-[8px] capitalize">{t}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Minigames */}
              <div className="grid grid-cols-3 gap-1 pt-1 border-t border-[#1f1f24]">
                <button onClick={spawnBug} className="p-1.5 bg-[#18181b] hover:bg-red-500/20 border border-red-500/40 rounded flex flex-col items-center text-red-300 font-bold cursor-pointer">
                  <Bug className="w-3 h-3 mb-0.5 text-red-400" /><span>Hunt Bug</span>
                </button>
                <button onClick={makeDance} className="p-1.5 bg-[#18181b] hover:bg-[#38bdf8]/20 border border-[#27272a] rounded flex flex-col items-center text-zinc-300 font-bold cursor-pointer">
                  <Music className="w-3 h-3 mb-0.5 text-[#38bdf8]" /><span>Dance</span>
                </button>
                <button onClick={toggleSleep} className="p-1.5 bg-[#18181b] hover:bg-[#a855f7]/20 border border-[#27272a] rounded flex flex-col items-center text-zinc-300 font-bold cursor-pointer">
                  <Zap className="w-3 h-3 mb-0.5 text-[#a855f7]" /><span>{mood === 'sleeping' ? 'Wake' : 'Sleep'}</span>
                </button>
              </div>

              {/* Skin Switcher */}
              <div className="pt-1 border-t border-[#1f1f24]">
                <div className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 mb-1 flex items-center gap-1">
                  <Palette className="w-3 h-3 text-[#38bdf8]" /> Skin
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {[['robot','🤖 Mecha'],['pixel-cat','🐱 Cat'],['dicebear-bot','👾 DiceBear']].map(([id, label]) => (
                    <button
                      key={id}
                      onClick={() => { terminalSound.playKeyClick?.(); setSkin(id as CharacterSkin); showThoughtFor(`Skin switched! ✨`, 3000); }}
                      className={`p-1 rounded text-[8px] font-bold cursor-pointer transition-all truncate ${skin === id ? 'bg-[var(--term-primary)] text-black' : 'bg-[#18181b] border border-[#27272a] text-zinc-400 hover:text-white'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default CyberPet;
