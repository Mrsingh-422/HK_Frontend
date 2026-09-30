'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  FaHeartbeat,
  FaUserNurse,
  FaStethoscope,
  FaHome,
} from 'react-icons/fa';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
const smoothstep = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const svgUri = (svg) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
const RAD = 180 / Math.PI;
const D2R = Math.PI / 180;

/* Two-bone IK: returns elbow position so the arm really reaches its target */
function solveArm(sx, sy, hx, hy, l1, l2) {
  const dx = hx - sx;
  const dy = hy - sy;
  const dist = Math.max(Math.hypot(dx, dy), 0.001);
  const d = Math.min(dist, l1 + l2 - 0.5);
  const ux = dx / dist;
  const uy = dy / dist;
  const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(l1 * l1 - a * a, 0));
  return {
    sx,
    sy,
    ex: sx + ux * a - uy * h,
    ey: sy + uy * a + ux * h,
    hx: sx + ux * d,
    hy: sy + uy * d,
  };
}

/* ------------------------------------------------------------------ */
/*  Repeating background tiles (parallax layers)                       */
/* ------------------------------------------------------------------ */
const CLOUD_TILE = svgUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="700" height="160" viewBox="0 0 700 160">
  <g fill="#ffffff" opacity="0.92">
    <ellipse cx="90" cy="86" rx="62" ry="17"/><ellipse cx="128" cy="68" rx="40" ry="21"/><ellipse cx="62" cy="74" rx="30" ry="14"/>
    <ellipse cx="380" cy="52" rx="72" ry="16"/><ellipse cx="420" cy="38" rx="38" ry="18"/><ellipse cx="338" cy="48" rx="30" ry="12"/>
    <ellipse cx="605" cy="108" rx="54" ry="13"/><ellipse cx="632" cy="94" rx="28" ry="14"/>
  </g>
</svg>`);

/* floating medical crosses + hearts */
const CARE_TILE = svgUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="200" viewBox="0 0 640 200">
  <defs>
    <g id="p"><rect x="-3" y="-10" width="6" height="20" rx="2"/><rect x="-10" y="-3" width="20" height="6" rx="2"/></g>
    <path id="h" d="M0 7 C-15 -4 -8 -15 0 -6 C8 -15 15 -4 0 7 Z"/>
  </defs>
  <use href="#p" x="60"  y="50"  fill="#08B36A" opacity="0.30"/>
  <use href="#p" x="210" y="130" fill="#08B36A" opacity="0.22" transform="scale(0.8)"/>
  <use href="#p" x="420" y="70"  fill="#08B36A" opacity="0.28"/>
  <use href="#p" x="580" y="150" fill="#08B36A" opacity="0.20"/>
  <use href="#h" x="150" y="90"  fill="#F472B6" opacity="0.38"/>
  <use href="#h" x="340" y="150" fill="#F472B6" opacity="0.30" transform="scale(0.9)"/>
  <use href="#h" x="520" y="40"  fill="#F472B6" opacity="0.34"/>
</svg>`);

const SKYLINE_TILE = svgUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="560" height="240" viewBox="0 0 560 240">
  <defs>
    <pattern id="w" width="14" height="17" patternUnits="userSpaceOnUse">
      <rect x="4" y="5" width="6" height="8" rx="1" fill="#EEF6FC"/>
    </pattern>
  </defs>
  <g>
    <rect x="0"   y="120" width="70" height="120" fill="#C6DAEA"/>
    <rect x="70"  y="80"  width="60" height="160" fill="#D3E3F0"/>
    <rect x="130" y="140" width="80" height="100" fill="#C6DAEA"/>
    <rect x="210" y="56"  width="70" height="184" fill="#D3E3F0"/>
    <rect x="280" y="110" width="90" height="130" fill="#C6DAEA"/>
    <rect x="370" y="90"  width="60" height="150" fill="#D3E3F0"/>
    <rect x="430" y="132" width="70" height="108" fill="#C6DAEA"/>
    <rect x="500" y="100" width="60" height="140" fill="#D3E3F0"/>
  </g>
  <g fill="url(#w)" opacity="0.9">
    <rect x="0"   y="120" width="70" height="120"/><rect x="70"  y="80"  width="60" height="160"/>
    <rect x="130" y="140" width="80" height="100"/><rect x="210" y="56"  width="70" height="184"/>
    <rect x="280" y="110" width="90" height="130"/><rect x="370" y="90"  width="60" height="150"/>
    <rect x="430" y="132" width="70" height="108"/><rect x="500" y="100" width="60" height="140"/>
  </g>
</svg>`);

const TREES_TILE = svgUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="480" height="170" viewBox="0 0 480 170">
  <rect x="0" y="148" width="480" height="22" fill="#9BE0B4"/>
  <g>
    <rect x="58" y="88" width="8" height="62" rx="3" fill="#8B6B4E"/>
    <circle cx="62" cy="76" r="32" fill="#34D399"/><circle cx="44" cy="90" r="20" fill="#10B981"/><circle cx="82" cy="88" r="22" fill="#6EE7B7"/>
    <rect x="186" y="98" width="7" height="52" rx="3" fill="#8B6B4E"/>
    <circle cx="190" cy="86" r="26" fill="#10B981"/><circle cx="174" cy="98" r="16" fill="#34D399"/><circle cx="208" cy="98" r="17" fill="#6EE7B7"/>
    <rect x="326" y="84" width="9" height="66" rx="3" fill="#8B6B4E"/>
    <circle cx="330" cy="70" r="34" fill="#34D399"/><circle cx="308" cy="88" r="22" fill="#6EE7B7"/><circle cx="354" cy="86" r="23" fill="#10B981"/>
    <ellipse cx="120" cy="150" rx="26" ry="14" fill="#22C55E"/><ellipse cx="256" cy="152" rx="22" ry="12" fill="#4ADE80"/>
    <ellipse cx="410" cy="152" rx="28" ry="14" fill="#22C55E"/>
    <rect x="262" y="96" width="4" height="56" fill="#64748B"/><circle cx="264" cy="94" r="7" fill="#FEF3C7" stroke="#64748B" stroke-width="2"/>
  </g>
</svg>`);

/* ------------------------------------------------------------------ */
/*  SVG parts                                                          */
/* ------------------------------------------------------------------ */
function RearWheel({ cx = 100, cy = 190, rot = 0, far = false }) {
  const spokes = Array.from({ length: 12 }, (_, i) => i * 30);
  return (
    <g opacity={far ? 0.6 : 1} transform={far ? 'translate(7 0)' : undefined}>
      <g transform={`rotate(${rot} ${cx} ${cy})`}>
        <circle cx={cx} cy={cy} r="37" fill="rgba(226,232,240,0.30)" stroke={far ? '#334155' : '#1E293B'} strokeWidth="5" />
        <circle cx={cx} cy={cy} r="34" fill="none" stroke="#CBD5E1" strokeWidth="1.5" />
        {spokes.map((a) => (
          <line
            key={a}
            x1={cx}
            y1={cy - 6}
            x2={cx}
            y2={cy - 33}
            stroke="#94A3B8"
            strokeWidth="1"
            transform={`rotate(${a} ${cx} ${cy})`}
          />
        ))}
        <circle cx={cx} cy={cy} r="29.5" fill="none" stroke="#64748B" strokeWidth="2.4" />
        <circle cx={cx} cy={cy} r="6" fill="#334155" />
        <circle cx={cx} cy={cy} r="2.4" fill="#E2E8F0" />
        <circle cx={cx} cy={cy - 37} r="2.8" fill="#08B36A" />
        <rect x={cx - 1.6} y={cy + 33} width="3.2" height="7" rx="1.2" fill="#F59E0B" />
      </g>
    </g>
  );
}

function Caster({ rot = 0 }) {
  return (
    <g transform={`rotate(${rot} 215 217)`}>
      <circle cx="215" cy="217" r="11" fill="#E2E8F0" stroke="#1E293B" strokeWidth="4.5" />
      <line x1="215" y1="208" x2="215" y2="226" stroke="#64748B" strokeWidth="1.5" />
      <line x1="206" y1="217" x2="224" y2="217" stroke="#64748B" strokeWidth="1.5" />
      <circle cx="215" cy="217" r="3" fill="#334155" />
    </g>
  );
}

/* Nurse walking behind the chair, hands on the push handles.
   Local coordinates: shifted 16 units left by the parent <g>. */
function Nurse({ phase, amp, bob, lean, arm }) {
  const HIPX = 16;
  const HIPY = 146 + bob;

  const leg = (ph, far) => {
    const t = 27 * amp * Math.sin(ph); // thigh swing
    const flex = amp * (7 + 42 * Math.max(0, Math.cos(ph))); // knee bends on swing phase
    const sh = t - flex;
    const kx = HIPX + 39 * Math.sin(t * D2R);
    const ky = HIPY + 39 * Math.cos(t * D2R);
    const ax = kx + 38 * Math.sin(sh * D2R);
    const ay = ky + 38 * Math.cos(sh * D2R);
    const pts = `${HIPX},${HIPY} ${kx},${ky} ${ax},${ay}`;
    return (
      <g key={far ? 'far' : 'near'}>
        <polyline points={pts} fill="none" stroke="#94A3B8" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={pts} fill="none" stroke={far ? '#CBD5E1' : '#F1F5F9'} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
        <g transform={`rotate(${-sh * 0.5} ${ax} ${ay})`}>
          <path
            d={`M${ax - 6} ${ay - 1} L${ax + 6} ${ay - 1} Q${ax + 17} ${ay + 2} ${ax + 16} ${ay + 7} L${ax - 6} ${ay + 7} Z`}
            fill={far ? '#E2E8F0' : '#FFFFFF'}
            stroke="#94A3B8"
            strokeWidth="1.5"
          />
          <line x1={ax - 5} y1={ay + 4.5} x2={ax + 15} y2={ay + 4.5} stroke="#08B36A" strokeWidth="1.8" strokeLinecap="round" />
        </g>
      </g>
    );
  };

  return (
    <g>
      {/* legs */}
      {leg(phase + Math.PI, true)}
      {leg(phase, false)}

      {/* upper body (leans into the push) */}
      <g transform={`translate(0 ${bob}) rotate(${lean} 16 148)`}>
        {/* uniform */}
        <path
          d="M-2 148 C-4 126 -2 102 4 88 C9 78 23 78 28 88 C34 102 36 126 34 148 Z"
          fill="url(#uniformGrad)"
          stroke="#CBD5E1"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <rect x="-3" y="141" width="38" height="6" rx="2" fill="#08B36A" opacity="0.95" />
        <path d="M8 80 L16 94 L24 80" fill="none" stroke="#08B36A" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />

        {/* name badge */}
        <rect x="3" y="102" width="12" height="8" rx="1.8" fill="#fff" stroke="#08B36A" strokeWidth="1.4" />
        <line x1="5.5" y1="105" x2="12.5" y2="105" stroke="#08B36A" strokeWidth="1.2" />
        <line x1="5.5" y1="107.6" x2="10.5" y2="107.6" stroke="#94A3B8" strokeWidth="1" />

        {/* stethoscope */}
        <path d="M9 80 C5 104 22 110 25 98" fill="none" stroke="#334155" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M23 80 C26 88 26 93 25 98" fill="none" stroke="#334155" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="25" cy="99" r="4" fill="#94A3B8" stroke="#334155" strokeWidth="1.6" />

        {/* neck + head */}
        <rect x="11" y="66" width="10" height="14" rx="4" fill="#E2A97F" />
        <circle cx="0" cy="51" r="8" fill="#5B3A29" />
        <circle cx="16" cy="55" r="14" fill="url(#skinGrad)" />
        <path d="M29 54 Q34 58 29 61" fill="url(#skinGrad)" stroke="#E2A97F" strokeWidth="1" />
        <circle cx="9" cy="57" r="3" fill="#E2A97F" />
        <path
          d="M2 55 C1 42 14 38 26 43 C29 45 29 49 27 51 C21 47 13 48 8 53 C6 55 6 58 7 62 C4 61 2 58 2 55 Z"
          fill="#5B3A29"
        />
        {/* face */}
        <circle cx="23" cy="53" r="1.7" fill="#1E293B" />
        <path d="M19 48.5 Q23 46.5 27 48.5" stroke="#5B3A29" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M20 62 Q25 65.5 29 61.5" stroke="#B4372A" strokeWidth="1.7" fill="none" strokeLinecap="round" />
        <circle cx="24" cy="60" r="2.7" fill="#F87171" opacity="0.3" />

        {/* nurse cap */}
        <path
          d="M4 45 Q6 34 12 33 L24 33 Q29 34 29 45 Q17 41 4 45 Z"
          fill="#FFFFFF"
          stroke="#CBD5E1"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <rect x="14.6" y="35" width="3" height="8" rx="1" fill="#08B36A" />
        <rect x="12" y="37.6" width="8" height="3" rx="1" fill="#08B36A" />
      </g>

      {/* arm reaching the push handle (IK) */}
      <g strokeLinecap="round" strokeLinejoin="round" fill="none">
        <line x1={arm.sx} y1={arm.sy} x2={arm.ex} y2={arm.ey} stroke="#CBD5E1" strokeWidth="12" />
        <line x1={arm.sx} y1={arm.sy} x2={arm.ex} y2={arm.ey} stroke="#FFFFFF" strokeWidth="9.5" />
        <line x1={arm.ex} y1={arm.ey} x2={arm.hx} y2={arm.hy} stroke="#EBBB96" strokeWidth="7" />
      </g>
      <circle cx={arm.hx} cy={arm.hy} r="5" fill="#F0C4A0" stroke="#D99A72" strokeWidth="1" />
    </g>
  );
}

function ChairAndPatient({ rearRot, casterRot, bob, patientTilt, nurse, speed }) {
  const lineLen = 18 + speed * 110;
  return (
    <svg
      viewBox="-40 0 340 260"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible', display: 'block', width: '100%', height: '100%' }}
    >
      <defs>
        <linearGradient id="gownGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#22D693" />
          <stop offset="1" stopColor="#079A5C" />
        </linearGradient>
        <linearGradient id="uniformGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#E6EDF5" />
        </linearGradient>
        <linearGradient id="skinGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F8D6B8" />
          <stop offset="1" stopColor="#E9B48D" />
        </linearGradient>
        <radialGradient id="shadowGrad" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#0F172A" stopOpacity="0.32" />
          <stop offset="1" stopColor="#0F172A" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ground shadow */}
      <ellipse cx="105" cy="231" rx="165" ry="8" fill="url(#shadowGrad)" />

      {/* speed lines */}
      <g stroke="#08B36A" strokeLinecap="round" opacity={clamp(speed, 0, 1) * 0.9}>
        <line x1={-30 - lineLen} y1="120" x2="-30" y2="120" strokeWidth="3" />
        <line x1={-34 - lineLen * 1.3} y1="160" x2="-34" y2="160" strokeWidth="2.5" />
        <line x1={-30 - lineLen * 0.8} y1="200" x2="-30" y2="200" strokeWidth="2" />
        <line x1={-50 - lineLen * 0.55} y1="95" x2="-50" y2="95" strokeWidth="1.7" />
      </g>

      {/* far-side wheel (depth) */}
      <RearWheel rot={rearRot} far />

      {/* ---------- wheelchair frame ---------- */}
      <g fill="none" strokeLinecap="round" strokeLinejoin="round" stroke="#475569">
        <path d="M62 86 L84 92 L92 152" strokeWidth="5" />
        <path d="M92 152 L192 152" strokeWidth="5" />
        <path d="M192 152 L206 178 L228 197 L250 197" strokeWidth="5" />
        <path d="M206 178 L214 200 L215 217" strokeWidth="4.5" />
        <path d="M100 190 L206 179" strokeWidth="4" />
        <path d="M150 152 L150 184" strokeWidth="3" opacity="0.8" />
      </g>
      <line x1="54" y1="84" x2="68" y2="88" stroke="#0F172A" strokeWidth="7" strokeLinecap="round" />
      <rect x="92" y="145" width="98" height="8" rx="4" fill="#1E293B" />
      <path d="M86 100 L90 142" stroke="#1E293B" strokeWidth="8" strokeLinecap="round" />

      <Caster rot={casterRot} />

      {/* ---------- patient legs ---------- */}
      <g strokeLinecap="round" strokeLinejoin="round" fill="none">
        <line x1="114" y1="139" x2="186" y2="138" stroke="#475569" strokeWidth="20" />
        <line x1="186" y1="138" x2="226" y2="184" stroke="#475569" strokeWidth="15" />
      </g>
      <path
        d="M219 180 L233 178 Q250 186 253 193 L253 196 L224 196 Q219 190 219 180 Z"
        fill="#F8FAFC"
        stroke="#94A3B8"
        strokeWidth="1.5"
      />
      <path d="M224 193 L252 193" stroke="#08B36A" strokeWidth="2" strokeLinecap="round" />

      {/* ---------- patient torso + head ---------- */}
      <g transform={`translate(0 ${bob}) rotate(${patientTilt} 114 110)`}>
        <path
          d="M97 148 C94 128 96 108 102 95 C107 86 121 86 126 95 C130 110 131 130 129 148 Z"
          fill="url(#gownGrad)"
          stroke="#067A49"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M108 88 L114 100 L121 88" fill="none" stroke="#E6FBF2" strokeWidth="2" strokeLinejoin="round" />
        <path d="M99 138 L128 138" stroke="#067A49" strokeWidth="1.2" opacity="0.5" />
        <rect x="109" y="79" width="11" height="15" rx="4" fill="#E2A97F" />
        <circle cx="114" cy="64" r="15" fill="url(#skinGrad)" />
        <path d="M127 62 Q133 67 127 71" fill="url(#skinGrad)" stroke="#E2A97F" strokeWidth="1" />
        <circle cx="108" cy="66" r="3.4" fill="#E2A97F" />
        <path
          d="M99 64 C97 47 112 43 124 49 C129 51 129 56 127 58 C120 54 112 55 106 60 C104 62 104 66 105 70 C101 70 99 68 99 64 Z"
          fill="#3B2A20"
        />
        <circle cx="121" cy="62" r="1.7" fill="#1E293B" />
        <path d="M117 57.5 Q121 55.5 125 57.5" stroke="#3B2A20" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M118 71 Q123 74.5 127 70.5" stroke="#9A3412" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <circle cx="122" cy="68" r="2.6" fill="#F87171" opacity="0.28" />
      </g>

      {/* armrest */}
      <path d="M88 118 L150 118 L150 152" fill="none" stroke="#475569" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="84" y1="118" x2="118" y2="118" stroke="#1E293B" strokeWidth="6" strokeLinecap="round" />

      {/* near wheel */}
      <RearWheel rot={rearRot} />

      {/* patient's arm resting on the armrest, with hospital wristband */}
      <g transform={`translate(0 ${bob})`} strokeLinecap="round" fill="none">
        <line x1="112" y1="98" x2="120" y2="114" stroke="#08B36A" strokeWidth="12" />
        <line x1="120" y1="114" x2="146" y2="112" stroke="#EBBB96" strokeWidth="8" />
        <rect x="132" y="108" width="9" height="7" rx="2" fill="#FFFFFF" stroke="#08B36A" strokeWidth="1.5" />
        <circle cx="149" cy="112" r="5.5" fill="#F0C4A0" stroke="#D99A72" strokeWidth="1" />
      </g>

      {/* ---------- the nurse, pushing from behind ---------- */}
      <g transform="translate(-16 0)">
        <Nurse {...nurse} />
      </g>
    </svg>
  );
}

function Hospital({ open = 0 }) {
  const wins = [0, 1, 2].flatMap((c) => [0, 1].map((r) => ({ x: 40 + c * 78, y: 124 + r * 36 })));
  const slide = open * 40;
  return (
    <svg
      viewBox="0 0 300 300"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', width: '100%', height: '100%', overflow: 'visible' }}
    >
      <defs>
        <linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#E8EEF5" />
        </linearGradient>
        <linearGradient id="glassGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#D7F0FF" />
          <stop offset="1" stopColor="#9DD5F5" />
        </linearGradient>
        <linearGradient id="lobbyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFF7DB" />
          <stop offset="1" stopColor="#FDE9A8" />
        </linearGradient>
        <clipPath id="doorClip">
          <rect x="105" y="204" width="90" height="96" />
        </clipPath>
      </defs>

      {/* roof cross */}
      <rect x="132" y="6" width="36" height="36" rx="9" fill="#08B36A" />
      <rect x="145" y="12" width="10" height="24" rx="2" fill="#fff" />
      <rect x="138" y="19" width="24" height="10" rx="2" fill="#fff" />

      {/* building */}
      <rect x="14" y="48" width="272" height="252" rx="10" fill="url(#wallGrad)" stroke="#CBD5E1" strokeWidth="2" />
      <rect x="14" y="48" width="272" height="14" rx="7" fill="#334155" />

      {/* sign */}
      <rect x="55" y="70" width="190" height="34" rx="9" fill="#08B36A" />
      <text x="150" y="92" textAnchor="middle" fontSize="14" fontWeight="800" fill="#fff" fontFamily="ui-sans-serif, system-ui, sans-serif">
        Nurse Care Center
      </text>
      <text x="150" y="117" textAnchor="middle" fontSize="10" fontWeight="700" fill="#64748B" fontFamily="ui-sans-serif, system-ui, sans-serif">
        Professional Care | 24/7
      </text>

      {/* windows */}
      {wins.map((w, i) => (
        <g key={i}>
          <rect x={w.x} y={w.y} width="40" height="26" rx="4" fill="url(#glassGrad)" stroke="#94A3B8" strokeWidth="1.5" />
          <line x1={w.x + 20} y1={w.y} x2={w.x + 20} y2={w.y + 26} stroke="#94A3B8" strokeWidth="1" />
        </g>
      ))}

      {/* awning */}
      <path d="M90 204 L210 204 L200 188 L100 188 Z" fill="#08B36A" />
      <rect x="90" y="203" width="120" height="5" rx="2" fill="#067A49" />

      {/* entrance */}
      <rect x="105" y="204" width="90" height="96" fill="url(#lobbyGrad)" />
      <rect x="105" y="204" width="90" height="96" fill="none" stroke="#475569" strokeWidth="3" />
      <g clipPath="url(#doorClip)">
        <rect x={105 - slide} y="204" width="45" height="96" fill="url(#glassGrad)" opacity="0.9" stroke="#64748B" strokeWidth="2" />
        <rect x={150 + slide} y="204" width="45" height="96" fill="url(#glassGrad)" opacity="0.9" stroke="#64748B" strokeWidth="2" />
      </g>
      <rect x="112" y="294" width="76" height="6" rx="3" fill="#08B36A" opacity="0.5" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Content                                                            */
/* ------------------------------------------------------------------ */
const CHECKPOINTS = [
  { t: 0, label: 'Admission', Icon: FaUserNurse },
  { t: 0.5, label: 'Nursing Care', Icon: FaStethoscope },
  { t: 1, label: 'Homecare', Icon: FaHome },
];

const INTRO_BUBBLE = "Hi! I'm your nurse. I'll take care of you.";

const STAGES = [
  { name: 'Nurse-assisted admission', bubble: "I'll help you get comfortable." },
  { name: 'Nursing care and monitoring', bubble: "Let's get your care started." },
  { name: 'Discharge and home nursing', bubble: "You're ready. I've got you!" },
];

/* auto-play timing (seconds) */
const WALK_SECONDS = 12; // time to travel from the left edge to the hospital
const DWELL_SECONDS = 2.5; // pause at the hospital with the doors open
const CYCLE_SECONDS = WALK_SECONDS + DWELL_SECONDS;

const ANIM_CSS = `
@keyframes nurseBubbleFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
}
@keyframes carePulse {
  0% { transform: translate(-50%, 50%) scale(0.5); opacity: 0.8; }
  70% { transform: translate(-50%, 50%) scale(1.8); opacity: 0; }
  100% { transform: translate(-50%, 50%) scale(1.8); opacity: 0; }
}
`;

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export default function WheelchairScrollAnimation() {
  const [state, setState] = useState({ p: 0, v: 0, fade: 0 });
  const [size, setSize] = useState({ w: 960, h: 540 });

  const trackRef = useRef(null);

  /* auto-play loop: walk left -> right, pause at the hospital, then start again */
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    let last = t0;
    let prevP = 0;

    const loop = (now) => {
      const t = ((now - t0) / 1000) % CYCLE_SECONDS;

      let progress = 1;
      if (t < WALK_SECONDS) {
        const u = t / WALK_SECONDS;
        // mostly steady walking speed, with a gentle start
        progress = u * 0.65 + smoothstep(0, 1, u) * 0.35;
      }

      // fade in at the start, fade out just before the loop restarts
      const fade = smoothstep(0, 0.6, t) * (1 - smoothstep(CYCLE_SECONDS - 0.7, CYCLE_SECONDS, t));

      const dt = Math.max(now - last, 1);
      const v = Math.max((progress - prevP) * (16.7 / dt), 0); // per-frame speed, frame-rate independent
      prevP = progress;
      last = now;

      setState({ p: progress, v, fade });
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* measure the scene so everything scales to it */
  useEffect(() => {
    if (!trackRef.current) return;
    const el = trackRef.current;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { p, v, fade } = state;
  const { w: trackW, h: trackH } = size;

  /* ---------- scene geometry ---------- */
  const pathH = clamp(trackH * 0.17, 54, 88);
  const contact = pathH * 0.55;

  // the svg is 340 units wide (nurse + chair)
  const chairW = clamp(Math.min(trackW * 0.4, trackH * 0.95), 200, 470);
  const s = chairW / 340;
  const chairH = chairW * (260 / 340);

  const hospW = Math.min(clamp(trackW * 0.3, 150, 340), trackH * 0.86);

  const startX = 14;
  const endX = Math.max(trackW - hospW * 0.6 - chairW * 0.87, startX + 60);
  const dist = p * (endX - startX);
  const chairLeft = startX + dist;

  /* ---------- rolling physics: angle = distance / radius ---------- */
  const distUnits = dist / s;
  const rearRot = (distUnits / 39.5) * RAD;
  const casterRot = (distUnits / 13.25) * RAD;

  /* ---------- nurse walking ---------- */
  const walkPh = (distUnits / 82) * 2 * Math.PI;
  const movementEnergy = smoothstep(0, 0.0008, Math.abs(v));
  const amp = clamp(movementEnergy + Math.abs(Math.sin(walkPh)) * 0.35, 0, 1);
  const nBob = -Math.abs(Math.sin(walkPh)) * 2.8 * amp;
  const nLean = 7 + Math.sin(walkPh) * 1.2;
  const la = nLean * D2R;
  const bx = 18 - 16;
  const by = 88 - 148;
  const nsx = 16 + bx * Math.cos(la) - by * Math.sin(la);
  const nsy = 148 + bx * Math.sin(la) + by * Math.cos(la) + nBob;
  const nurseArm = solveArm(nsx, nsy, 76, 86, 36, 34);
  const nurse = { phase: walkPh, amp, bob: nBob, lean: nLean, arm: nurseArm };

  const patientBob = Math.sin(distUnits * 0.13) * 1.15;
  const patientTilt = Math.sin(distUnits * 0.08) * 0.7;

  const speed = v > 0 ? clamp(v * 300, 0, 1) : 0;
  const doorOpen = smoothstep(0.82, 0.97, p);
  const activeStage = p < 0.34 ? 0 : p < 0.67 ? 1 : 2;
  const bubbleText = p < 0.1 ? INTRO_BUBBLE : STAGES[activeStage].bubble;

  return (
    <div className="w-full bg-[#F8FAFC] py-10 overflow-x-clip font-sans">
      {/* --- ANIMATION CONTAINER --- */}
      <div className="max-w-7xl mx-auto px-3 md:px-8">
        <div className="bg-white/95 backdrop-blur-md rounded-[2rem] border border-slate-200/80 p-4 md:p-6 shadow-2xl shadow-slate-300/40">
          {/* Header */}
          <div className="flex flex-wrap justify-between items-center gap-3 mb-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-[#08B36A] flex items-center justify-center text-lg shadow-sm border border-emerald-100">
                <FaUserNurse />
              </div>
              <div>
                <h3 className="text-base md:text-lg font-black text-slate-900 tracking-tight">
                  Your nurse is with you all the way
                </h3>
                <p className="text-xs font-semibold text-slate-400">
                  Now at: <span className="text-slate-600">{STAGES[activeStage].name}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-emerald-50 text-[#08B36A] px-4 py-2 rounded-xl border border-emerald-100">
              <FaHeartbeat className="animate-pulse" />
              <span className="text-sm font-black tabular-nums">{Math.round(p * 100)}% of the way</span>
            </div>
          </div>

          {/* --- SCENE --- */}
          <div
            ref={trackRef}
            className="relative w-full h-[380px] sm:h-[480px] lg:h-[560px] rounded-3xl overflow-hidden border border-slate-200"
            style={{ background: 'linear-gradient(180deg, #BFE6FF 0%, #E3F4FF 55%, #F1FBF5 100%)' }}
          >
            {/* sun */}
            <div
              className="absolute rounded-full"
              style={{
                top: '9%',
                left: '56%',
                width: 70,
                height: 70,
                background: 'radial-gradient(circle, #FFF6D1 0%, #FFE27A 55%, rgba(255,226,122,0) 72%)',
                filter: 'blur(1px)',
              }}
            />

            {/* clouds */}
            <div
              className="absolute left-0 right-0"
              style={{
                top: '3%',
                height: '30%',
                backgroundImage: CLOUD_TILE,
                backgroundRepeat: 'repeat-x',
                backgroundSize: 'auto 100%',
                backgroundPosition: `${-p * 150}px 0`,
                opacity: 0.95,
              }}
            />

            {/* floating crosses + hearts */}
            <div
              className="absolute left-0 right-0"
              style={{
                top: '10%',
                height: '38%',
                backgroundImage: CARE_TILE,
                backgroundRepeat: 'repeat-x',
                backgroundSize: 'auto 100%',
                backgroundPosition: `${-p * 80}px 0`,
              }}
            />

            {/* skyline */}
            <div
              className="absolute left-0 right-0"
              style={{
                bottom: pathH,
                height: '52%',
                backgroundImage: SKYLINE_TILE,
                backgroundRepeat: 'repeat-x',
                backgroundSize: 'auto 100%',
                backgroundPosition: `${-p * 120}px 100%`,
              }}
            />

            {/* trees */}
            <div
              className="absolute left-0 right-0"
              style={{
                bottom: pathH * 0.72,
                height: '40%',
                backgroundImage: TREES_TILE,
                backgroundRepeat: 'repeat-x',
                backgroundSize: 'auto 100%',
                backgroundPosition: `${-p * 240}px 100%`,
              }}
            />

            {/* path */}
            <div
              className="absolute left-0 right-0 bottom-0"
              style={{
                height: pathH,
                background:
                  'repeating-linear-gradient(90deg, rgba(100,116,139,0.10) 0 2px, transparent 2px 70px), linear-gradient(180deg, #E9EEF4 0%, #D3DBE5 100%)',
                borderTop: '3px solid #F8FAFC',
                boxShadow: 'inset 0 6px 8px -6px rgba(15,23,42,0.18)',
              }}
            />

            {/* progress trail */}
            <div
              className="absolute rounded-full"
              style={{
                left: 0,
                bottom: contact - 2,
                height: 5,
                width: chairLeft + chairW * 0.4,
                opacity: fade,
                background: 'linear-gradient(90deg, rgba(8,179,106,0) 0%, #08B36A 100%)',
                boxShadow: '0 0 12px rgba(8,179,106,0.55)',
              }}
            />

            {/* care pulse ring */}
            <div
              className="absolute pointer-events-none"
              style={{
                left: chairLeft + chairW * 0.12,
                bottom: contact + chairH * 0.55,
                width: 24,
                height: 24,
                borderRadius: '999px',
                border: '2px solid rgba(8,179,106,0.45)',
                transform: 'translate(-50%, 50%)',
                animation: 'carePulse 1.4s ease-out infinite',
                zIndex: 9,
                display: fade < 0.05 ? 'none' : 'block',
              }}
            />

            {/* hospital */}
            <div
              className="absolute"
              style={{ right: 0, bottom: contact - 4, width: hospW, height: hospW }}
            >
              <Hospital open={doorOpen} />
            </div>

            {/* checkpoints */}
            {CHECKPOINTS.map(({ t, label, Icon }) => {
              const reached = p >= t - 0.02;
              return (
                <div
                  key={label}
                  className={`absolute flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold border shadow-sm transition-all duration-300 ${
                    reached
                      ? 'bg-[#08B36A] text-white border-emerald-600 scale-105'
                      : 'bg-white text-slate-500 border-slate-200'
                  }`}
                  style={{
                    left: startX + t * (endX - startX) + chairW * 0.41,
                    bottom: 5,
                    transform: 'translateX(-50%)',
                    zIndex: 5,
                  }}
                >
                  <Icon size={11} />
                  {label}
                </div>
              );
            })}

            {/* nurse + wheelchair + patient */}
            <div
              className="absolute will-change-transform"
              style={{
                left: 0,
                bottom: contact - 30 * s,
                width: chairW,
                height: chairH,
                transform: `translate3d(${chairLeft}px, 0, 0)`,
                zIndex: 10,
                opacity: fade,
                filter: 'drop-shadow(0 6px 8px rgba(15,23,42,0.18))',
              }}
            >
              <ChairAndPatient
                rearRot={rearRot}
                casterRot={casterRot}
                bob={patientBob}
                patientTilt={patientTilt}
                nurse={nurse}
                speed={speed}
              />

              {/* nurse speech bubble */}
              <div
                className="absolute pointer-events-none"
                style={{
                  left: 22 * s,
                  bottom: chairH - 32 * s + 8,
                  animation: 'nurseBubbleFloat 1.8s ease-in-out infinite',
                }}
              >
                <div className="relative flex items-center gap-1.5 whitespace-nowrap rounded-2xl bg-white border border-emerald-200 px-3 py-1.5 text-[11px] sm:text-xs font-bold text-slate-700 shadow-md">
                  <FaUserNurse className="text-[#08B36A]" size={12} />
                  {bubbleText}
                  <span className="absolute -bottom-1.5 left-6 w-3 h-3 rotate-45 bg-white border-r border-b border-emerald-200" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: ANIM_CSS }} />
    </div>
  );
}