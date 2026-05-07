import { LogClick } from "@/features/analytics";
import React, { useCallback, useEffect, useRef, useState } from "react";
import styles from "./stage.module.css";

const ROOM_W = 286; // w-71.5 × 4px
const ROOM_H = 198; // h-50 × 4px
const CHARACTER_SIZE = 64; // 32 × 2
// Jump duration controls the feel of gravity.
// Derivation (symmetric parabola, peak at T/2):
//   At peak, vertical velocity = 0:  0 = v₀ - g·(T/2)  →  v₀ = g·T/2
//   Peak height from kinematics:     h = v₀·(T/2) - ½·g·(T/2)²
//                                      = g·T²/4 - g·T²/8
//                                      = g·T²/8
//   Solving for g:                   g = 8h / T²
// A longer T → weaker g → floatier jump. A shorter T → stronger g → snappier jump.
const JUMP_DURATION = 920; // ms
const GROUND_Y = ROOM_H - CHARACTER_SIZE;
const SURFACE_TOLERANCE = 2; // px — snap tolerance for standing-on-surface check

function calcGravity(jumpHeight: number) {
  return (8 * jumpHeight) / (JUMP_DURATION / 1000) ** 2;
}

export interface Hitbox {
  x: number;
  y: number;
  w: number;
  h: number;
}

const DEFAULT_HITBOX: Hitbox = {
  x: 0,
  y: 0,
  w: CHARACTER_SIZE,
  h: CHARACTER_SIZE,
};

function hbXOverlaps(charX: number, hb: Hitbox, platX: number, platW: number) {
  return charX + hb.x + hb.w > platX && charX + hb.x < platX + platW;
}

function groundY(hb: Hitbox) {
  return ROOM_H - hb.y - hb.h;
}

// Returns the character y to land at if falling into a surface this frame, else null.
function findLanding(
  objects: StageObject[],
  charX: number,
  charPrevY: number,
  charNextY: number,
  hb: Hitbox,
): number | null {
  const prevBottom = charPrevY + hb.y + hb.h;
  const nextBottom = charNextY + hb.y + hb.h;
  let landY: number | null = null;

  if (nextBottom >= ROOM_H) landY = groundY(hb);

  for (const p of objects) {
    if (p.passable) continue;
    if (!hbXOverlaps(charX, hb, p.x, p.w)) continue;
    if (prevBottom <= p.y && nextBottom >= p.y) {
      const y = p.y - hb.y - hb.h;
      if (landY === null || y < landY) landY = y;
    }
  }

  return landY;
}

// Returns the character y after hitting a ceiling this frame, else null.
// Two-way objects only.
function findCeiling(
  objects: StageObject[],
  charX: number,
  charPrevY: number,
  charNextY: number,
  hb: Hitbox,
): number | null {
  const prevTop = charPrevY + hb.y;
  const nextTop = charNextY + hb.y;
  let ceilCharY: number | null = null;

  for (const p of objects) {
    if (p.passable || p.oneWay) continue;
    if (!hbXOverlaps(charX, hb, p.x, p.w)) continue;
    const platBottom = p.y + p.h;
    if (prevTop >= platBottom && nextTop <= platBottom) {
      const y = platBottom - hb.y;
      if (ceilCharY === null || y > ceilCharY) ceilCharY = y;
    }
  }

  return ceilCharY;
}

// Returns the y the character should stand at, or null if in air.
function getStandingSurface(
  objects: StageObject[],
  charX: number,
  charY: number,
  hb: Hitbox,
): number | null {
  const charBottom = charY + hb.y + hb.h;

  if (Math.abs(charBottom - ROOM_H) <= SURFACE_TOLERANCE) return groundY(hb);

  for (const p of objects) {
    if (p.passable) continue;
    if (!hbXOverlaps(charX, hb, p.x, p.w)) continue;
    if (Math.abs(charBottom - p.y) <= SURFACE_TOLERANCE) {
      return p.y - hb.y - hb.h;
    }
  }

  return null;
}

export interface StageObject {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z?: number;
  passable?: boolean;
  oneWay?: boolean;
  render?: () => React.ReactNode;
}

interface StageConfig {
  speed?: number;
  jumpHeight?: number;
  idleIntervalMin?: number;
  idleIntervalMax?: number;
  jumpIntervalMin?: number;
  jumpIntervalMax?: number;
}

export interface StageProps {
  config?: StageConfig;
  hitbox?: Hitbox;
  objects?: StageObject[];
  z?: number;
  debug?: boolean;
  character: (state: {
    isMoving: boolean;
    isJumping: boolean;
  }) => React.ReactNode;
}

export function Stage({
  config = {},
  hitbox = DEFAULT_HITBOX,
  objects = [],
  z = 5,
  debug = false,
  character,
}: StageProps) {
  const {
    speed = 40,
    jumpHeight = 140,
    idleIntervalMin = 1000,
    idleIntervalMax = 8000,
    jumpIntervalMin = 4000,
    jumpIntervalMax = 20000,
  } = config;
  const [isMoving, setIsMoving] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const speedRef = useRef(speed);
  const jumpHeightRef = useRef(jumpHeight);
  const idleIntervalMinRef = useRef(idleIntervalMin);
  const idleIntervalMaxRef = useRef(idleIntervalMax);
  const jumpIntervalMinRef = useRef(jumpIntervalMin);
  const jumpIntervalMaxRef = useRef(jumpIntervalMax);
  const objectsRef = useRef(objects);
  const hitboxRef = useRef(hitbox);
  speedRef.current = speed;
  jumpHeightRef.current = jumpHeight;
  idleIntervalMinRef.current = idleIntervalMin;
  idleIntervalMaxRef.current = idleIntervalMax;
  jumpIntervalMinRef.current = jumpIntervalMin;
  jumpIntervalMaxRef.current = jumpIntervalMax;
  objectsRef.current = objects;
  hitboxRef.current = hitbox;

  const characterDivRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({
    x: (ROOM_W - hitbox.w) / 2 - hitbox.x,
    y: groundY(hitbox),
  });
  const facingLeftRef = useRef(true);
  const velRef = useRef({ x: 0, y: 0 });
  const isJumpingRef = useRef(false);
  const jumpCountRef = useRef(0);
  const targetXRef = useRef<number | null>(null);
  const rafRef = useRef(0);
  const lastTimeRef = useRef(0);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const jumpTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const applyTransform = useCallback((x: number, y: number, fl: boolean) => {
    const el = characterDivRef.current;
    if (!el) return;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.transform = `scaleX(${fl ? 1 : -1})`;
  }, []);

  const scheduleNewTarget = useCallback(() => {
    clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(
      () => {
        const hb = hitboxRef.current;
        targetXRef.current = Math.random() * (ROOM_W - hb.w) - hb.x;
      },
      idleIntervalMinRef.current +
        Math.random() *
          (idleIntervalMaxRef.current - idleIntervalMinRef.current),
    );
  }, []);

  const triggerJump = useCallback(() => {
    if (jumpCountRef.current >= 2) return;

    const currX = posRef.current.x;
    const targetX = targetXRef.current;
    const vy = -Math.sqrt(
      2 * calcGravity(jumpHeightRef.current) * jumpHeightRef.current,
    );
    // first jump: direction from walk target / second jump (airborne): carry current horizontal direction
    const vx =
      targetX !== null
        ? Math.sign(targetX - currX) * speedRef.current
        : velRef.current.x !== 0
          ? Math.sign(velRef.current.x) * speedRef.current
          : 0;

    velRef.current = { x: vx, y: vy };
    jumpCountRef.current += 1;
    isJumpingRef.current = true;
    targetXRef.current = null;
    setIsMoving(false);
    setIsJumping(true);
    if (vx !== 0) {
      facingLeftRef.current = vx < 0;
      applyTransform(posRef.current.x, posRef.current.y, facingLeftRef.current);
    }
  }, [applyTransform]);

  const scheduleRandomJump = useCallback(() => {
    clearTimeout(jumpTimerRef.current);
    jumpTimerRef.current = setTimeout(
      () => {
        triggerJump();
        scheduleRandomJump();
      },
      jumpIntervalMinRef.current +
        Math.random() *
          (jumpIntervalMaxRef.current - jumpIntervalMinRef.current),
    );
  }, [triggerJump]);

  useEffect(() => {
    applyTransform(posRef.current.x, posRef.current.y, facingLeftRef.current);
    scheduleNewTarget();
    scheduleRandomJump();

    function tick(time: number) {
      const dt = lastTimeRef.current
        ? Math.min((time - lastTimeRef.current) / 1000, 0.05)
        : 0;
      lastTimeRef.current = time;
      const hb = hitboxRef.current;

      if (isJumpingRef.current) {
        velRef.current.y += calcGravity(jumpHeightRef.current) * dt;
        let nx = posRef.current.x + velRef.current.x * dt;
        let ny = posRef.current.y + velRef.current.y * dt;

        // bounce off walls
        if (nx + hb.x < 0) {
          nx = -hb.x;
          velRef.current.x = Math.abs(velRef.current.x);
          facingLeftRef.current = false;
        } else if (nx + hb.x + hb.w > ROOM_W) {
          nx = ROOM_W - hb.x - hb.w;
          velRef.current.x = -Math.abs(velRef.current.x);
          facingLeftRef.current = true;
        }

        const landY = findLanding(
          objectsRef.current,
          nx,
          posRef.current.y,
          ny,
          hb,
        );

        if (landY !== null) {
          posRef.current = { x: nx, y: landY };
          velRef.current = { x: 0, y: 0 };
          isJumpingRef.current = false;
          jumpCountRef.current = 0;
          applyTransform(nx, landY, facingLeftRef.current);
          setIsJumping(false);
          scheduleNewTarget();
        } else {
          if (velRef.current.y < 0) {
            const ceilY = findCeiling(
              objectsRef.current,
              nx,
              posRef.current.y,
              ny,
              hb,
            );
            if (ceilY !== null) {
              ny = ceilY;
              velRef.current.y = 0;
            }
          }
          posRef.current = { x: nx, y: ny };
          applyTransform(nx, ny, facingLeftRef.current);
        }
      } else {
        const targetX = targetXRef.current;
        if (targetX !== null) {
          const curr = posRef.current;
          const dx = targetX - curr.x;
          const dist = Math.abs(dx);

          if (dist < 1) {
            targetXRef.current = null;
            setIsMoving(false);
            scheduleNewTarget();
          } else {
            const move = Math.min(speedRef.current * dt, dist);
            const nx = curr.x + Math.sign(dx) * move;
            const fl = dx < 0;
            const surfaceY = getStandingSurface(
              objectsRef.current,
              nx,
              curr.y,
              hb,
            );

            if (surfaceY === null) {
              // walked off edge — start falling
              velRef.current = { x: Math.sign(dx) * speedRef.current, y: 0 };
              isJumpingRef.current = true;
              posRef.current = { x: nx, y: curr.y };
              facingLeftRef.current = fl;
              applyTransform(nx, curr.y, fl);
              targetXRef.current = null;
              setIsMoving(false);
              setIsJumping(true);
            } else {
              posRef.current = { x: nx, y: surfaceY };
              facingLeftRef.current = fl;
              applyTransform(nx, surfaceY, fl);
              setIsMoving(true);
            }
          }
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(idleTimerRef.current);
      clearTimeout(jumpTimerRef.current);
    };
  }, [scheduleNewTarget, scheduleRandomJump, applyTransform]);

  const handleClick = useCallback(() => {
    triggerJump();
  }, [triggerJump]);

  return (
    <LogClick eventName="jump">
      <div className={styles.room} onClick={handleClick}>
        {objects.map((p) => (
          <div
            key={p.id}
            className={styles.platform}
            style={{
              left: p.x,
              top: p.y,
              width: p.w,
              height: p.h,
              zIndex: p.z,
            }}
          >
            {p.render?.()}
          </div>
        ))}
        <div
          ref={characterDivRef}
          className={styles.character}
          style={
            {
              "--size": `${CHARACTER_SIZE}px`,
              zIndex: z,
            } as React.CSSProperties
          }
        >
          {character({ isMoving, isJumping })}
          {debug && (
            <div
              style={{
                position: "absolute",
                left: hitbox.x,
                top: hitbox.y,
                width: hitbox.w,
                height: hitbox.h,
                background: "rgba(255, 0, 0, 0.3)",
                border: "1px solid red",
                pointerEvents: "none",
              }}
            />
          )}
        </div>
      </div>
    </LogClick>
  );
}

// GROUND_Y kept for external reference if needed
export { GROUND_Y };
