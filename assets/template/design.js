/* Exploded View Studio - art direction resolver.
   Themes are local-only token sets. No external fonts or assets. */
(() => {
  'use strict';

  const THEMES = {
    aerolab: {
      label: 'Aerolab',
      motif: 'orbit',
      mode: 'dark',
      layout: 'workbench',
      density: 'comfortable',
      corners: 'square',
      backdrop: 'rings',
      typography: 'industrial',
      chrome: 'technical',
      copy: {
        micro: 'PROCEDURAL ASSEMBLY ENGINE',
        kicker: 'PROCEDURAL ASSEMBLY SYSTEM',
        category: 'EXPLODED TECHNICAL VIEW',
        explode: 'EXPLODE ASSEMBLY'
      },
      colors: {
        bg: '#05070a', bgDeep: '#030507', bodyGlow: 'rgba(64, 112, 128, 0.12)',
        panel: '#090d12', panel2: '#0c1117',
        line: 'rgba(162, 198, 214, 0.13)', lineStrong: 'rgba(181, 217, 232, 0.24)',
        text: '#dce7eb', muted: '#7f939d', dim: '#56666f',
        accent: '#ff6b2c', accentDeep: '#f0541b', accentSoft: 'rgba(255, 107, 44, 0.13)',
        accentInk: '#140a05', accentLine: 'rgba(255, 107, 44, 0.48)',
        accentWash: 'linear-gradient(135deg, rgba(255, 107, 44, 0.075), rgba(255, 107, 44, 0.01))',
        alt: '#58d8ff', altSoft: 'rgba(88, 216, 255, 0.10)', green: '#79d9a4',
        stageBg: 'radial-gradient(ellipse at 50% 42%, #0c141a 0%, #080d12 42%, #05070a 74%)',
        stageVignette: 'radial-gradient(ellipse at 50% 48%, transparent 34%, rgba(2, 4, 6, .32) 78%, rgba(2, 4, 6, .6) 100%)',
        gridLine: 'rgba(117, 183, 202, 0.06)', gridOpacity: '.18',
        corner: 'rgba(152, 204, 220, 0.42)',
        chrome: 'rgba(5, 8, 11, 0.92)', rail: 'rgba(8, 11, 15, 0.86)', dock: 'rgba(7, 10, 14, 0.90)',
        pinBg: 'rgba(7, 12, 16, 0.82)', pinActiveBg: 'rgba(31, 17, 10, 0.94)',
        pinLine: 'rgba(164, 205, 219, 0.48)', labelBg: 'rgba(7, 11, 15, 0.95)',
        rowHover: 'rgba(140, 188, 204, 0.055)',
        rowActive: 'linear-gradient(90deg, rgba(255, 107, 44, 0.14), rgba(255, 107, 44, 0.025))',
        activeBg: '#dfeaed', activeInk: '#08090b',
        track: 'rgba(177, 206, 216, 0.18)', thumb: '#e8f2f5', thumbRing: 'rgba(255, 107, 44, 0.18)',
        copy: '#9eb1b9', copyStrong: '#c7d8de', chipBg: 'rgba(255, 255, 255, 0.014)',
        indexInk: 'rgba(151, 195, 210, 0.28)', shadow: '0 10px 30px rgba(0, 0, 0, 0.28)',
        scan: '#dfeef2'
      },
      scene: {
        background: '#070a0d', fog: '#070a0d', floor: '#090e13', dust: '#6d94a2',
        exposure: 1.06, hemiSky: '#9dbdca', hemiGround: '#070b0f', hemiIntensity: 0.65,
        key: '#fff4ea', keyIntensity: 2.5, rim: '#58d8ff', rimIntensity: 1.1,
        fill: '#ffb58a', fillIntensity: 0.46, top: '#74c7e2', topIntensity: 2.4,
        ringOpacity: 0.25, ring2Opacity: 0.14, scanOpacity: 0.16
      }
    },

    foundry: {
      label: 'Foundry',
      motif: 'settings-2',
      mode: 'light',
      layout: 'workbench',
      density: 'compact',
      corners: 'square',
      backdrop: 'grid',
      typography: 'industrial',
      chrome: 'technical',
      copy: {
        micro: 'MATERIAL STUDY / WORKSHOP',
        kicker: 'INDUSTRIAL ASSEMBLY STUDY',
        category: 'MATERIALS / MECHANISM',
        explode: 'EXPLODE ASSEMBLY'
      },
      colors: {
        bg: '#e9e4da', bgDeep: '#d8d0c3', bodyGlow: 'rgba(255, 250, 240, 0.65)',
        panel: '#f5f0e7', panel2: '#fbf7ef',
        line: 'rgba(40, 53, 50, 0.16)', lineStrong: 'rgba(38, 48, 45, 0.30)',
        text: '#1b2523', muted: '#596965', dim: '#87928d',
        accent: '#c4552f', accentDeep: '#9c3b1e', accentSoft: 'rgba(196, 85, 47, 0.12)',
        accentInk: '#fff8f2', accentLine: 'rgba(196, 85, 47, 0.48)',
        accentWash: 'linear-gradient(135deg, rgba(196, 85, 47, 0.09), rgba(196, 85, 47, 0.015))',
        alt: '#2f6f70', altSoft: 'rgba(47, 111, 112, 0.10)', green: '#3f7f65',
        stageBg: 'radial-gradient(ellipse at 50% 40%, #fbf7ef 0%, #ece6db 48%, #ded6c8 100%)',
        stageVignette: 'radial-gradient(ellipse at 50% 48%, transparent 36%, rgba(92, 76, 55, .07) 76%, rgba(80, 64, 44, .16) 100%)',
        gridLine: 'rgba(56, 77, 72, 0.14)', gridOpacity: '.42',
        corner: 'rgba(60, 80, 75, 0.45)',
        chrome: 'rgba(238, 232, 222, 0.96)', rail: 'rgba(245, 240, 231, 0.90)', dock: 'rgba(250, 246, 238, 0.94)',
        pinBg: 'rgba(255, 251, 243, 0.92)', pinActiveBg: 'rgba(196, 85, 47, 0.12)',
        pinLine: 'rgba(56, 75, 70, 0.35)', labelBg: 'rgba(255, 251, 245, 0.98)',
        rowHover: 'rgba(45, 65, 60, 0.055)',
        rowActive: 'linear-gradient(90deg, rgba(196, 85, 47, 0.14), rgba(196, 85, 47, 0.025))',
        activeBg: '#1b2523', activeInk: '#fffaf2',
        track: 'rgba(45, 65, 60, 0.18)', thumb: '#c4552f', thumbRing: 'rgba(196, 85, 47, 0.18)',
        copy: '#42524e', copyStrong: '#263532', chipBg: 'rgba(30, 50, 45, 0.035)',
        indexInk: 'rgba(60, 80, 75, 0.30)', shadow: '0 10px 30px rgba(58, 46, 31, 0.12)',
        scan: '#594d3e'
      },
      scene: {
        background: '#ece6db', fog: '#ece6db', floor: '#ded6c8', dust: '#8d806f',
        exposure: 1.0, hemiSky: '#fffaf0', hemiGround: '#72685b', hemiIntensity: 0.85,
        key: '#fff4e2', keyIntensity: 2.15, rim: '#7fa9a4', rimIntensity: 0.42,
        fill: '#f0c9a8', fillIntensity: 0.35, top: '#ffffff', topIntensity: 1.1,
        ringOpacity: 0.22, ring2Opacity: 0.12, scanOpacity: 0.12
      }
    },

    atelier: {
      label: 'Atelier',
      motif: 'focus',
      mode: 'light',
      layout: 'focus',
      density: 'airy',
      corners: 'soft',
      backdrop: 'horizon',
      typography: 'editorial',
      chrome: 'minimal',
      copy: {
        micro: 'OPTICAL INSTRUMENT STUDY',
        kicker: 'PRECISION OPTICAL ASSEMBLY',
        category: 'OPTICAL / MECHANISM',
        explode: 'EXPLODE ASSEMBLY'
      },
      colors: {
        bg: '#efeae1', bgDeep: '#e3dccf', bodyGlow: 'rgba(255, 250, 240, 0.70)',
        panel: '#f6f1e8', panel2: '#fbf7f0',
        line: 'rgba(40, 40, 35, 0.15)', lineStrong: 'rgba(40, 40, 35, 0.28)',
        text: '#211f1b', muted: '#676158', dim: '#9a9388',
        accent: '#2d5c50', accentDeep: '#1e4038', accentSoft: 'rgba(45, 92, 80, 0.12)',
        accentInk: '#f8f3e9', accentLine: 'rgba(45, 92, 80, 0.42)',
        accentWash: 'linear-gradient(135deg, rgba(45, 92, 80, 0.08), rgba(45, 92, 80, 0.012))',
        alt: '#a3633e', altSoft: 'rgba(163, 99, 62, 0.10)', green: '#4f7b5d',
        stageBg: 'radial-gradient(ellipse at 50% 42%, #faf6ee 0%, #f1ebe1 44%, #e4ddd0 100%)',
        stageVignette: 'linear-gradient(180deg, rgba(247, 242, 233, .10), rgba(77, 64, 48, .03) 60%, rgba(68, 54, 38, .12))',
        gridLine: 'rgba(60, 50, 40, 0.05)', gridOpacity: '.12',
        corner: 'rgba(80, 69, 54, 0.35)',
        chrome: 'rgba(246, 241, 232, 0.94)', rail: 'rgba(247, 243, 235, 0.86)', dock: 'rgba(250, 246, 238, 0.92)',
        pinBg: 'rgba(255, 252, 246, 0.92)', pinActiveBg: 'rgba(45, 92, 80, 0.12)',
        pinLine: 'rgba(80, 69, 54, 0.32)', labelBg: 'rgba(255, 252, 246, 0.98)',
        rowHover: 'rgba(80, 69, 54, 0.05)',
        rowActive: 'linear-gradient(90deg, rgba(45, 92, 80, 0.13), rgba(45, 92, 80, 0.02))',
        activeBg: '#211f1b', activeInk: '#f8f3e9',
        track: 'rgba(80, 69, 54, 0.18)', thumb: '#2d5c50', thumbRing: 'rgba(45, 92, 80, 0.16)',
        copy: '#584f44', copyStrong: '#342f28', chipBg: 'rgba(60, 50, 40, 0.035)',
        indexInk: 'rgba(80, 69, 54, 0.28)', shadow: '0 18px 44px rgba(65, 52, 38, 0.12)',
        scan: '#6b5a45'
      },
      scene: {
        background: '#eee9e0', fog: '#eee9e0', floor: '#e1d9cc', dust: '#a3917a',
        exposure: 1.04, hemiSky: '#fffaf0', hemiGround: '#786a57', hemiIntensity: 0.82,
        key: '#fff3df', keyIntensity: 2.0, rim: '#8fae9f', rimIntensity: 0.36,
        fill: '#eec6a4', fillIntensity: 0.3, top: '#ffffff', topIntensity: 1.0,
        ringOpacity: 0.22, ring2Opacity: 0.12, scanOpacity: 0.13
      }
    },

    pulse: {
      label: 'Pulse',
      motif: 'activity',
      mode: 'light',
      layout: 'panorama',
      density: 'comfortable',
      corners: 'round',
      backdrop: 'horizon',
      typography: 'humanist',
      chrome: 'minimal',
      copy: {
        micro: 'HEALTH SYSTEMS / CLEAN LAB',
        kicker: 'PRECISION HEALTH HARDWARE',
        category: 'CLINICAL / INSTRUMENT',
        explode: 'EXPLODE ASSEMBLY'
      },
      colors: {
        bg: '#edf4f3', bgDeep: '#dce9e7', bodyGlow: 'rgba(255, 255, 255, 0.75)',
        panel: '#ffffff', panel2: '#f7fbfa',
        line: 'rgba(17, 65, 62, 0.14)', lineStrong: 'rgba(17, 65, 62, 0.26)',
        text: '#11292a', muted: '#536b69', dim: '#889c99',
        accent: '#0b8f83', accentDeep: '#087067', accentSoft: 'rgba(11, 143, 131, 0.11)',
        accentInk: '#f3fffc', accentLine: 'rgba(11, 143, 131, 0.38)',
        accentWash: 'linear-gradient(135deg, rgba(11, 143, 131, 0.08), rgba(47, 111, 218, 0.015))',
        alt: '#2f6fda', altSoft: 'rgba(47, 111, 218, 0.09)', green: '#2f9e78',
        stageBg: 'radial-gradient(ellipse at 50% 44%, #ffffff 0%, #eaf4f3 48%, #d9eae8 100%)',
        stageVignette: 'radial-gradient(ellipse at 50% 48%, transparent 40%, rgba(26, 70, 68, .04) 76%, rgba(24, 64, 62, .10) 100%)',
        gridLine: 'rgba(15, 90, 84, 0.08)', gridOpacity: '.2',
        corner: 'rgba(15, 90, 84, 0.3)',
        chrome: 'rgba(255, 255, 255, 0.94)', rail: 'rgba(255, 255, 255, 0.86)', dock: 'rgba(255, 255, 255, 0.94)',
        pinBg: 'rgba(255, 255, 255, 0.94)', pinActiveBg: 'rgba(11, 143, 131, 0.12)',
        pinLine: 'rgba(17, 65, 62, 0.25)', labelBg: 'rgba(255, 255, 255, 0.98)',
        rowHover: 'rgba(11, 90, 84, 0.045)',
        rowActive: 'linear-gradient(90deg, rgba(11, 143, 131, 0.11), rgba(11, 143, 131, 0.02))',
        activeBg: '#11292a', activeInk: '#f3fffc',
        track: 'rgba(17, 65, 62, 0.15)', thumb: '#0b8f83', thumbRing: 'rgba(11, 143, 131, 0.16)',
        copy: '#3e5654', copyStrong: '#203a39', chipBg: 'rgba(11, 90, 84, 0.04)',
        indexInk: 'rgba(17, 65, 62, 0.22)', shadow: '0 16px 40px rgba(24, 70, 67, 0.10)',
        scan: '#315e5b'
      },
      scene: {
        background: '#e8f3f2', fog: '#e8f3f2', floor: '#dcebea', dust: '#9cb8b5',
        exposure: 1.02, hemiSky: '#ffffff', hemiGround: '#7a9894', hemiIntensity: 0.95,
        key: '#ffffff', keyIntensity: 1.95, rim: '#7cc9c2', rimIntensity: 0.38,
        fill: '#d8e9ff', fillIntensity: 0.3, top: '#ffffff', topIntensity: 1.2,
        ringOpacity: 0.2, ring2Opacity: 0.12, scanOpacity: 0.14
      }
    },

    nocturne: {
      label: 'Nocturne',
      motif: 'sparkles',
      mode: 'dark',
      layout: 'focus',
      density: 'airy',
      corners: 'square',
      backdrop: 'plain',
      typography: 'editorial',
      chrome: 'minimal',
      copy: {
        micro: 'OBJECTS OF ENDURING VALUE',
        kicker: 'PRIVATE COLLECTION / OBJECT STUDY',
        category: 'OBJECT / CRAFT',
        explode: 'REVEAL ASSEMBLY'
      },
      colors: {
        bg: '#0e0b08', bgDeep: '#080605', bodyGlow: 'rgba(92, 66, 38, 0.18)',
        panel: '#15110d', panel2: '#1c1610',
        line: 'rgba(228, 205, 166, 0.14)', lineStrong: 'rgba(228, 205, 166, 0.26)',
        text: '#f1e7d2', muted: '#a99a83', dim: '#756858',
        accent: '#c9a15b', accentDeep: '#9b7638', accentSoft: 'rgba(201, 161, 91, 0.13)',
        accentInk: '#171108', accentLine: 'rgba(201, 161, 91, 0.42)',
        accentWash: 'linear-gradient(135deg, rgba(201, 161, 91, 0.08), rgba(201, 161, 91, 0.01))',
        alt: '#8b6b47', altSoft: 'rgba(139, 107, 71, 0.12)', green: '#8da36c',
        stageBg: 'radial-gradient(ellipse at 50% 42%, #241c14 0%, #120d09 58%, #080605 100%)',
        stageVignette: 'linear-gradient(180deg, rgba(8, 6, 5, .15), transparent 40%, rgba(4, 3, 2, .55) 100%)',
        gridLine: 'rgba(201, 161, 91, 0.05)', gridOpacity: '.08',
        corner: 'rgba(201, 161, 91, 0.28)',
        chrome: 'rgba(12, 9, 7, 0.94)', rail: 'rgba(16, 12, 9, 0.90)', dock: 'rgba(20, 15, 10, 0.94)',
        pinBg: 'rgba(20, 15, 10, 0.90)', pinActiveBg: 'rgba(201, 161, 91, 0.14)',
        pinLine: 'rgba(228, 205, 166, 0.26)', labelBg: 'rgba(17, 12, 8, 0.97)',
        rowHover: 'rgba(201, 161, 91, 0.055)',
        rowActive: 'linear-gradient(90deg, rgba(201, 161, 91, 0.13), rgba(201, 161, 91, 0.02))',
        activeBg: '#f1e7d2', activeInk: '#171108',
        track: 'rgba(228, 205, 166, 0.16)', thumb: '#c9a15b', thumbRing: 'rgba(201, 161, 91, 0.18)',
        copy: '#c4b49d', copyStrong: '#eadfc9', chipBg: 'rgba(228, 205, 166, 0.035)',
        indexInk: 'rgba(228, 205, 166, 0.22)', shadow: '0 18px 50px rgba(0, 0, 0, 0.45)',
        scan: '#8d7654'
      },
      scene: {
        background: '#0c0906', fog: '#0c0906', floor: '#17110b', dust: '#8d7654',
        exposure: 1.08, hemiSky: '#9a876d', hemiGround: '#080605', hemiIntensity: 0.48,
        key: '#ffe7bd', keyIntensity: 2.6, rim: '#c9a15b', rimIntensity: 0.48,
        fill: '#8f5e32', fillIntensity: 0.42, top: '#ffe3af', topIntensity: 1.55,
        ringOpacity: 0.2, ring2Opacity: 0.1, scanOpacity: 0.12
      }
    },

    signal: {
      label: 'Signal',
      motif: 'gauge',
      mode: 'dark',
      layout: 'panorama',
      density: 'compact',
      corners: 'square',
      backdrop: 'grid',
      typography: 'technical',
      chrome: 'technical',
      copy: {
        micro: 'PERFORMANCE SYSTEMS / FIELD LAB',
        kicker: 'HIGH-OUTPUT ASSEMBLY',
        category: 'PERFORMANCE / MECHANISM',
        explode: 'EXPLODE ASSEMBLY'
      },
      colors: {
        bg: '#050b0d', bgDeep: '#030607', bodyGlow: 'rgba(60, 112, 82, 0.14)',
        panel: '#081216', panel2: '#0b181d',
        line: 'rgba(181, 224, 210, 0.13)', lineStrong: 'rgba(181, 224, 210, 0.24)',
        text: '#e5f4ef', muted: '#7e9a97', dim: '#506966',
        accent: '#c8ff3d', accentDeep: '#8fce00', accentSoft: 'rgba(200, 255, 61, 0.12)',
        accentInk: '#101400', accentLine: 'rgba(200, 255, 61, 0.45)',
        accentWash: 'linear-gradient(135deg, rgba(200, 255, 61, 0.075), rgba(200, 255, 61, 0.01))',
        alt: '#ff3d81', altSoft: 'rgba(255, 61, 129, 0.10)', green: '#4ff0ac',
        stageBg: 'radial-gradient(ellipse at 50% 38%, #0e1e17 0%, #07100f 46%, #040809 100%)',
        stageVignette: 'radial-gradient(ellipse at 50% 48%, transparent 36%, rgba(2, 5, 4, .34) 78%, rgba(2, 5, 4, .65) 100%)',
        gridLine: 'rgba(200, 255, 61, 0.08)', gridOpacity: '.32',
        corner: 'rgba(200, 255, 61, 0.38)',
        chrome: 'rgba(4, 9, 10, 0.94)', rail: 'rgba(7, 14, 16, 0.88)', dock: 'rgba(6, 13, 14, 0.94)',
        pinBg: 'rgba(5, 13, 12, 0.86)', pinActiveBg: 'rgba(200, 255, 61, 0.12)',
        pinLine: 'rgba(181, 224, 210, 0.30)', labelBg: 'rgba(5, 13, 12, 0.97)',
        rowHover: 'rgba(200, 255, 61, 0.05)',
        rowActive: 'linear-gradient(90deg, rgba(200, 255, 61, 0.13), rgba(200, 255, 61, 0.02))',
        activeBg: '#c8ff3d', activeInk: '#101400',
        track: 'rgba(181, 224, 210, 0.16)', thumb: '#c8ff3d', thumbRing: 'rgba(200, 255, 61, 0.18)',
        copy: '#a7c2bc', copyStrong: '#d7ece5', chipBg: 'rgba(181, 224, 210, 0.03)',
        indexInk: 'rgba(181, 224, 210, 0.22)', shadow: '0 18px 50px rgba(0, 0, 0, 0.4)',
        scan: '#7e9a97'
      },
      scene: {
        background: '#04090a', fog: '#04090a', floor: '#07110f', dust: '#5e8b7f',
        exposure: 1.02, hemiSky: '#dfe8e2', hemiGround: '#030706', hemiIntensity: 0.66,
        ambient: '#ffffff', ambientIntensity: 0.28,
        key: '#ffffff', keyIntensity: 2.0, rim: '#c8ff3d', rimIntensity: 0.16,
        fill: '#ffffff', fillIntensity: 0.36, top: '#ff3d81', topIntensity: 0.14,
        bodyRoughness: 0.82, bodyMetalness: 0.04,
        ringOpacity: 0.22, ring2Opacity: 0.12, scanOpacity: 0.14
      }
    }
  };

  const terrainColors = {
    ...THEMES.foundry.colors,
    bg: '#e8e1d2', bgDeep: '#d6cbb7', bodyGlow: 'rgba(255, 250, 233, 0.7)',
    panel: '#f7f2e7', panel2: '#fbf8ef',
    line: 'rgba(58, 73, 55, 0.16)', lineStrong: 'rgba(48, 64, 48, 0.30)',
    text: '#253229', muted: '#5d6a5c', dim: '#8b9585',
    accent: '#b95b32', accentDeep: '#8f3f20', accentSoft: 'rgba(185, 91, 50, 0.13)',
    accentInk: '#fff7ee', accentLine: 'rgba(185, 91, 50, 0.46)',
    accentWash: 'linear-gradient(135deg, rgba(185, 91, 50, 0.09), rgba(185, 91, 50, 0.012))',
    alt: '#527061', altSoft: 'rgba(82, 112, 97, 0.12)', green: '#5c7d5d',
    stageBg: 'radial-gradient(ellipse at 50% 42%, #fbf6ea 0%, #eee6d6 50%, #e3dac8 100%)',
    gridLine: 'rgba(73, 92, 66, 0.14)', gridOpacity: '.38',
    corner: 'rgba(77, 92, 66, 0.45)',
    chrome: 'rgba(238, 231, 216, 0.96)', rail: 'rgba(246, 241, 231, 0.92)', dock: 'rgba(250, 247, 239, 0.95)',
    pinBg: 'rgba(255, 251, 243, 0.94)', pinActiveBg: 'rgba(185, 91, 50, 0.13)',
    pinLine: 'rgba(73, 89, 64, 0.34)', labelBg: 'rgba(255, 252, 245, 0.98)',
    rowHover: 'rgba(70, 88, 58, 0.06)',
    rowActive: 'linear-gradient(90deg, rgba(185, 91, 50, 0.13), rgba(185, 91, 50, 0.02))',
    activeBg: '#26322a', activeInk: '#fbf5e9',
    track: 'rgba(73, 88, 64, 0.16)', thumb: '#26322a', thumbRing: 'rgba(185, 91, 50, 0.18)',
    copy: '#65705f', copyStrong: '#394637', chipBg: 'rgba(64, 78, 56, 0.025)',
    indexInk: 'rgba(74, 91, 65, 0.25)', shadow: '0 16px 36px rgba(70, 58, 38, 0.12)',
    scan: '#8d7a5e'
  };
  THEMES.terrain = {
    ...THEMES.foundry,
    label: 'Terrain', motif: 'compass', mode: 'light', layout: 'panorama',
    density: 'comfortable', corners: 'soft', backdrop: 'grid',
    typography: 'humanist', chrome: 'minimal',
    copy: {
      ...THEMES.foundry.copy,
      micro: 'FIELD EQUIPMENT / TERRAIN LAB',
      kicker: 'RUGGED SYSTEMS ASSEMBLY',
      category: 'FIELD / EXPEDITION',
      explode: 'FIELD STRIP'
    },
    colors: terrainColors,
    scene: {
      ...THEMES.foundry.scene,
      background: '#ebe4d6', fog: '#ebe4d6', floor: '#d9cfbc', dust: '#8c7f68',
      exposure: 1.0, hemiSky: '#fff8e7', hemiGround: '#6c6a58', hemiIntensity: 0.78,
      ambient: '#fff7e8', ambientIntensity: 0.18,
      key: '#fff2d6', keyIntensity: 2.15, rim: '#a1b8a3', rimIntensity: 0.28,
      fill: '#e8c7a5', fillIntensity: 0.26, top: '#fffaf0', topIntensity: 0.9,
      bodyRoughness: 0.62, bodyMetalness: 0.12,
      ringOpacity: 0.18, ring2Opacity: 0.09, scanOpacity: 0.1
    }
  };

  const studioColors = {
    ...THEMES.atelier.colors,
    bg: '#efece4', bgDeep: '#ded9cf', panel: '#fbf9f4', panel2: '#fffdf8',
    accent: '#b04d35', accentDeep: '#8d3622', accentSoft: 'rgba(176, 77, 53, 0.12)',
    accentInk: '#fff8f2', accentLine: 'rgba(176, 77, 53, 0.42)',
    accentWash: 'linear-gradient(135deg, rgba(176, 77, 53, 0.08), rgba(176, 77, 53, 0.012))',
    alt: '#3f6663', altSoft: 'rgba(63, 102, 99, 0.10)', green: '#6b8a6c',
    stageBg: 'radial-gradient(ellipse at 50% 45%, #fcf9f2 0%, #efe9dd 55%, #e2dbcd 100%)',
    gridLine: 'rgba(50, 58, 52, 0.12)', gridOpacity: '.22',
    corner: 'rgba(74, 83, 73, 0.36)',
    chrome: 'rgba(245, 241, 232, 0.96)', rail: 'rgba(251, 248, 241, 0.92)', dock: 'rgba(255, 252, 245, 0.96)',
    pinBg: 'rgba(255, 252, 245, 0.95)', pinActiveBg: 'rgba(176, 77, 53, 0.12)',
    pinLine: 'rgba(80, 90, 82, 0.28)', labelBg: 'rgba(255, 253, 248, 0.98)',
    rowHover: 'rgba(50, 58, 52, 0.05)',
    rowActive: 'linear-gradient(90deg, rgba(176, 77, 53, 0.13), rgba(176, 77, 53, 0.02))',
    activeBg: '#222927', activeInk: '#fbf7ef',
    track: 'rgba(70, 82, 74, 0.14)', thumb: '#3f6663', thumbRing: 'rgba(176, 77, 53, 0.16)',
    copy: '#68716b', copyStrong: '#3e4842', chipBg: 'rgba(50, 58, 52, 0.025)',
    indexInk: 'rgba(70, 82, 74, 0.22)', shadow: '0 14px 34px rgba(50, 42, 30, 0.10)',
    scan: '#8e8878'
  };
  THEMES.studio = {
    ...THEMES.atelier,
    label: 'Studio', motif: 'audio-lines', mode: 'light', layout: 'atlas',
    density: 'airy', corners: 'round', backdrop: 'plain',
    typography: 'editorial', chrome: 'minimal',
    copy: {
      ...THEMES.atelier.copy,
      micro: 'ACOUSTIC OBJECTS / STUDIO',
      kicker: 'LISTENING ROOM ASSEMBLY',
      category: 'AUDIO / FURNITURE',
      explode: 'OPEN ASSEMBLY'
    },
    colors: studioColors,
    scene: {
      ...THEMES.atelier.scene,
      background: '#f2eee6', fog: '#f2eee6', floor: '#e5dfd4', dust: '#8e8878',
      exposure: 1.02, hemiSky: '#fffaf0', hemiGround: '#6d6a60', hemiIntensity: 0.88,
      ambient: '#fffaf4', ambientIntensity: 0.25,
      key: '#fff6e8', keyIntensity: 2.0, rim: '#b8d0c8', rimIntensity: 0.22,
      fill: '#e7d7c2', fillIntensity: 0.18, top: '#ffffff', topIntensity: 0.75,
      bodyRoughness: 0.56, bodyMetalness: 0.18,
      ringOpacity: 0.08, ring2Opacity: 0.04, scanOpacity: 0.08
    }
  };

  const COPY_BY_PRESET = {
    aerolab: { tree: 'ASSEMBLY TREE', index: '模块索引', mass: 'SYSTEM WEIGHT', auto: 'AUTO ORBIT', reset: 'RESET VIEW', hint: '拖拽旋转 · 双指缩放 · 点按模块查看参数' },
    foundry: { tree: 'BILL OF MATERIALS', index: '零件清单', mass: 'TOTAL WEIGHT', auto: 'ROTATE', reset: 'RESET', hint: '拖拽旋转 · 双指缩放 · 点按零件查看参数' },
    atelier: { tree: 'OPTICAL BENCH', index: '光学组件', mass: 'TOTAL WEIGHT', auto: 'SLOW ORBIT', reset: 'RETURN', hint: '拖拽旋转 · 双指缩放 · 点按镜组查看参数' },
    pulse: { tree: 'CLINICAL MODULES', index: '模块索引', mass: 'SYSTEM MASS', auto: 'SCAN ORBIT', reset: 'RESET', hint: '拖拽旋转 · 双指缩放 · 点按模块查看参数' },
    nocturne: { tree: 'ELEMENTS', index: '组件构成', mass: 'TOTAL MASS', auto: 'SLOW TURN', reset: 'RESET', hint: '拖拽旋转 · 双指缩放 · 点按组件查看参数' },
    signal: { tree: 'SYSTEM LAYERS', index: '系统分层', mass: 'SYSTEM MASS', auto: 'PATROL', reset: 'RESET', hint: '拖拽旋转 · 双指缩放 · 点按模块查看参数' },
    terrain: { tree: 'FIELD KIT', index: '装备分解', mass: 'PACK WEIGHT', auto: 'PATROL', reset: 'RESET', hint: '拖拽旋转 · 双指缩放 · 点按装备查看参数' },
    studio: { tree: 'ELEMENTS', index: '组件清单', mass: 'TOTAL MASS', auto: 'SLOW TURN', reset: 'RESET', hint: '拖拽旋转 · 双指缩放 · 点按组件查看参数' }
  };
  const PATTERN_BY_PRESET = {
    aerolab: 'contour', foundry: 'hatch', atelier: 'none', pulse: 'dots',
    nocturne: 'none', signal: 'grid', terrain: 'contour', studio: 'dots'
  };

  const TYPES = {
    industrial: {
      display: '"Space Grotesk", "Manrope", "Microsoft YaHei", sans-serif',
      sans: '"Manrope", "Microsoft YaHei", sans-serif',
      mono: '"IBM Plex Mono", "Cascadia Mono", Consolas, monospace'
    },
    editorial: {
      display: '"Newsreader", "Songti SC", "STSong", Georgia, serif',
      sans: '"Manrope", "Microsoft YaHei", sans-serif',
      mono: '"IBM Plex Mono", "Cascadia Mono", Consolas, monospace'
    },
    humanist: {
      display: '"Manrope", "Segoe UI", "Microsoft YaHei", sans-serif',
      sans: '"Manrope", "Segoe UI", "Microsoft YaHei", sans-serif',
      mono: '"IBM Plex Mono", "Cascadia Mono", Consolas, monospace'
    },
    technical: {
      display: '"IBM Plex Mono", "Space Grotesk", "Cascadia Mono", monospace',
      sans: '"Space Grotesk", "Manrope", "Microsoft YaHei", sans-serif',
      mono: '"IBM Plex Mono", "Cascadia Mono", Consolas, monospace'
    }
  };

  const INFERENCE = [
    { preset: 'atelier', pattern: /(camera|lens|optic|photo|cinema|optical|相机|镜头|光学|影像|摄影)/i },
    { preset: 'pulse', pattern: /(medical|clinical|health|wearable|patient monitor|vital signs|医疗|健康|临床|监测|可穿戴)/i },
    { preset: 'terrain', pattern: /(outdoor|camp|trail|expedition|backpack|tent|boot|tactical|户外|露营|登山|背包|越野|战术)/i },
    { preset: 'studio', pattern: /(audio|speaker|headphone|studio monitor|furniture|chair|lamp|音响|耳机|家具|灯具|家居)/i },
    { preset: 'nocturne', pattern: /(watch|luxury|jewel|perfume|手表|奢华|珠宝|香水)/i },
    { preset: 'signal', pattern: /(drone|sport|bike|game|field|无人机|运动|竞速)/i },
    { preset: 'foundry', pattern: /(tool|industrial|robot|machine|hardware|工具|工业|机械|机器人)/i },
  ];

  const clone = value => JSON.parse(JSON.stringify(value));
  const merge = (base, override = {}) => ({
    ...base,
    ...override,
    colors: { ...base.colors, ...(override.colors || {}) },
    scene: { ...base.scene, ...(override.scene || {}) },
    copy: { ...base.copy, ...(override.copy || {}) }
  });

  function inferPreset(spec) {
    const product = spec.product || {};
    const meta = spec.meta || {};
    const text = [product.name, product.cn, product.category, product.tagline, meta.category, meta.kicker]
      .filter(Boolean).join(' ');
    const match = INFERENCE.find(rule => rule.pattern.test(text));
    return match ? match.preset : 'aerolab';
  }

  function rgba(color, alpha) {
    const value = String(color || '').trim();
    const short = value.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i);
    const full = value.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
    const parts = short
      ? [short[1] + short[1], short[2] + short[2], short[3] + short[3]]
      : full ? [full[1], full[2], full[3]] : null;
    if (!parts) return color;
    const [r, g, b] = parts.map(part => parseInt(part, 16));
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function resolve(spec) {
    const requested = spec.design || {};
    let presetId = requested.preset;
    if (!presetId || presetId === 'auto' || !THEMES[presetId]) presetId = inferPreset(spec);
    const theme = THEMES[presetId] || THEMES.aerolab;
    const design = merge(theme, requested);
    design.preset = presetId;
    design.copy = { ...(COPY_BY_PRESET[presetId] || {}), ...design.copy };
    design.pattern = requested.pattern || PATTERN_BY_PRESET[presetId] || 'grid';
    const custom = requested.colors || {};
    if (custom.accent && !custom.accentSoft) {
      design.colors.accentSoft = rgba(custom.accent, 0.13);
      design.colors.accentLine = rgba(custom.accent, 0.46);
      design.colors.accentWash = `linear-gradient(135deg, ${rgba(custom.accent, 0.09)}, ${rgba(custom.accent, 0.015)})`;
    }
    if (custom.alt && !custom.altSoft) design.colors.altSoft = rgba(custom.alt, 0.1);
    return design;
  }

  function apply(spec) {
    const design = resolve(spec);
    const body = document.body;
    body.dataset.theme = design.preset;
    body.dataset.mode = design.mode;
    body.dataset.layout = design.layout;
    body.dataset.density = design.density;
    body.dataset.corners = design.corners;
    body.dataset.backdrop = design.backdrop;
    body.dataset.typography = design.typography;
    body.dataset.chrome = design.chrome;
    body.dataset.motif = design.motif || 'orbit';
    body.dataset.pattern = design.pattern || 'grid';
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.setAttribute('content', design.colors.bg);

    const colors = design.colors;
    const root = document.documentElement.style;
    const vars = {
      '--bg': colors.bg,
      '--bg-deep': colors.bgDeep,
      '--body-glow': colors.bodyGlow,
      '--panel': colors.panel,
      '--panel-2': colors.panel2,
      '--line': colors.line,
      '--line-strong': colors.lineStrong,
      '--text': colors.text,
      '--muted': colors.muted,
      '--dim': colors.dim,
      '--accent': colors.accent,
      '--accent-deep': colors.accentDeep,
      '--accent-soft': colors.accentSoft,
      '--accent-ink': colors.accentInk,
      '--accent-line': colors.accentLine,
      '--accent-wash': colors.accentWash,
      '--cyan': colors.alt,
      '--alt': colors.alt,
      '--cyan-soft': colors.altSoft,
      '--alt-soft': colors.altSoft,
      '--green': colors.green,
      '--stage-bg': colors.stageBg,
      '--stage-vignette': colors.stageVignette,
      '--grid-line': colors.gridLine,
      '--grid-opacity': colors.gridOpacity,
      '--corner': colors.corner,
      '--chrome': colors.chrome,
      '--rail': colors.rail,
      '--dock-bg': colors.dock,
      '--pin-bg': colors.pinBg,
      '--pin-active-bg': colors.pinActiveBg,
      '--pin-line': colors.pinLine,
      '--label-bg': colors.labelBg,
      '--row-hover': colors.rowHover,
      '--row-active': colors.rowActive,
      '--active-bg': colors.activeBg,
      '--active-ink': colors.activeInk,
      '--track': colors.track,
      '--thumb': colors.thumb,
      '--thumb-ring': colors.thumbRing,
      '--copy': colors.copy,
      '--copy-strong': colors.copyStrong,
      '--chip-bg': colors.chipBg,
      '--index-ink': colors.indexInk,
      '--shadow': colors.shadow,
      '--scan': colors.scan
    };
    for (const [key, value] of Object.entries(vars)) root.setProperty(key, value);
    return design;
  }

  window.STUDIO_DESIGN = { THEMES, TYPES, inferPreset, resolve, apply };
})();
