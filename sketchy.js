/**
 * Sketchy Hand-Drawn SVG & Animated Illustration Engine
 * Inspired by Ali0092/Sketchy (Pure programmatic vector paths, zero bitmap icon assets, fully theme-able).
 * Supports light/dark ink color (`currentColor`), watercolor accent washes, double-stroke pen feel, and animations.
 */

(function (global) {
  'use strict';

  // Core 24x24 organic hand-drawn SVG definitions: { accentShape, inkPaths, animClass }
  const ICONS = {
    pencil: {
      anim: 'sketchy-hover-wiggle',
      accent: 'M15.8 5.2 Q17.6 3.5 19.3 5.2 Q20.8 6.8 19.0 8.5 L9.2 18.2 L5.3 18.8 L6.2 14.9 Z',
      paths: [
        'M15.4 4.8 Q17.6 2.9 19.6 4.9 Q21.2 6.6 19.2 8.7 L9.0 18.6 L4.6 19.4 L5.6 15.1 Z',
        'M13.6 6.8 Q15.3 8.4 17.1 10.3',
        'M6.0 15.5 Q7.6 16.9 8.9 18.3',
        'M4.4 19.5 Q10.5 19.8 18.8 19.3'
      ]
    },
    clipboard: {
      accent: 'M6.2 6.5 Q12 6.1 17.8 6.5 L17.6 19.5 Q12 19.9 6.4 19.5 Z',
      paths: [
        'M8.8 4.4 Q12 3.8 15.2 4.4 Q15.6 6.3 14.9 6.8 Q12 6.9 9.1 6.8 Q8.4 6.2 8.8 4.4 Z',
        'M8.6 5.6 Q6.0 5.7 5.6 6.5 Q5.3 13 5.7 19.6 Q6.1 20.5 12.1 20.4 Q18.1 20.4 18.4 19.5 Q18.7 12.8 18.3 6.4 Q17.8 5.6 15.3 5.6',
        'M8.4 10.4 Q12.1 10.1 15.6 10.4',
        'M8.5 13.8 Q11.8 14.1 15.2 13.7',
        'M8.4 17.1 Q10.9 16.9 13.1 17.2'
      ]
    },
    camera: {
      anim: 'sketchy-hover-pop',
      accent: 'M4.5 8.5 Q12 8.1 19.5 8.5 L19.4 18.5 Q12 19.0 4.6 18.5 Z',
      paths: [
        'M4.1 8.4 Q6.8 8.0 8.2 7.8 L9.4 5.3 Q12.0 4.9 14.6 5.3 L15.8 7.8 Q17.8 8.0 19.9 8.4 Q20.4 13.4 19.9 18.6 Q12.0 19.2 4.1 18.6 Q3.7 13.4 4.1 8.4 Z',
        'M12.0 9.6 Q15.4 9.7 15.5 13.1 Q15.4 16.5 12.0 16.6 Q8.6 16.5 8.5 13.1 Q8.6 9.7 12.0 9.6 Z',
        'M11.2 11.4 Q12.2 11.0 12.9 11.6',
        'M17.2 10.4 L17.6 10.4'
      ]
    },
    headphones: {
      anim: 'sketchy-pulse-soft',
      accent: 'M4.5 13.2 Q6.6 13.0 7.2 15.2 L7.0 19.2 Q4.5 19.1 4.2 16.4 Z M19.5 13.2 Q17.4 13.0 16.8 15.2 L17.0 19.2 Q19.5 19.1 19.8 16.4 Z',
      paths: [
        'M4.3 14.2 Q4.1 5.8 12.0 5.3 Q19.9 5.8 19.7 14.2',
        'M4.2 13.3 Q6.9 13.0 7.4 15.4 Q7.5 19.0 6.8 19.6 Q4.0 19.4 3.9 16.3 Q3.8 14.2 4.2 13.3 Z',
        'M19.8 13.3 Q17.1 13.0 16.6 15.4 Q16.5 19.0 17.2 19.6 Q20.0 19.4 20.1 16.3 Q20.2 14.2 19.8 13.3 Z'
      ]
    },
    timer: {
      anim: 'sketchy-clock-tick',
      accent: 'M12.0 6.8 Q18.1 7.0 18.3 13.2 Q18.1 19.5 12.0 19.6 Q5.9 19.5 5.7 13.2 Q5.9 7.0 12.0 6.8 Z',
      paths: [
        'M9.6 3.5 Q12.0 3.1 14.4 3.5',
        'M12.0 3.6 L12.0 6.2',
        'M17.4 5.9 L18.9 7.4',
        'M12.0 6.4 Q18.5 6.6 18.7 13.2 Q18.5 19.9 12.0 20.1 Q5.5 19.9 5.3 13.2 Q5.5 6.6 12.0 6.4 Z'
      ],
      hand: 'M12.0 13.2 L12.0 9.1 M12.0 13.2 L15.1 14.8'
    },
    clock: {
      anim: 'sketchy-clock-tick',
      accent: 'M12.0 4.8 Q19.1 5.0 19.2 12.0 Q19.1 19.0 12.0 19.2 Q4.9 19.0 4.8 12.0 Q4.9 5.0 12.0 4.8 Z',
      paths: [
        'M12.0 4.2 Q19.6 4.4 19.8 12.0 Q19.6 19.6 12.0 19.8 Q4.4 19.6 4.2 12.0 Q4.4 4.4 12.0 4.2 Z'
      ],
      hand: 'M12.0 12.0 L12.0 7.4 M12.0 12.0 L15.6 13.4'
    },
    bot: {
      anim: 'sketchy-float-bob',
      accent: 'M5.2 8.8 Q12.0 8.2 18.8 8.8 L18.6 18.6 Q12.0 19.2 5.4 18.6 Z',
      paths: [
        'M12.0 3.8 L12.0 7.6',
        'M12.0 3.0 Q13.1 3.1 13.0 4.0 Q12.9 4.9 12.0 4.9 Q11.0 4.9 11.0 4.0 Q11.0 3.1 12.0 3.0 Z',
        'M4.9 8.6 Q12.0 7.9 19.1 8.6 Q19.6 13.6 19.0 18.8 Q12.0 19.5 5.0 18.8 Q4.5 13.6 4.9 8.6 Z',
        'M8.8 12.4 L8.9 13.4',
        'M15.1 12.4 L15.2 13.4',
        'M9.2 16.0 Q12.0 17.3 14.8 16.0',
        'M3.2 12.2 L4.7 12.2 M19.3 12.2 L20.8 12.2'
      ]
    },
    bell: {
      anim: 'sketchy-bell-ring',
      accent: 'M6.8 15.4 Q7.2 8.1 12.0 7.6 Q16.8 8.1 17.2 15.4 L19.1 17.3 L4.9 17.3 Z',
      paths: [
        'M11.6 3.5 Q12.4 3.4 12.4 4.8',
        'M6.5 15.3 Q6.9 7.4 12.0 6.8 Q17.1 7.4 17.5 15.3 L19.4 17.4 Q12.0 18.0 4.6 17.4 Z',
        'M10.1 17.8 Q12.0 20.6 13.9 17.8',
        'M4.0 8.2 Q3.1 10.2 3.8 12.2 M20.0 8.2 Q20.9 10.2 20.2 12.2'
      ]
    },
    'bell-off': {
      accent: 'M7.2 15.4 Q7.5 8.6 12.0 7.9 Q16.5 8.6 16.8 15.4 L18.5 17.2 L5.5 17.2 Z',
      paths: [
        'M6.6 15.2 Q7.1 7.6 12.0 6.9 Q16.9 7.6 17.4 15.2 L19.2 17.3 Q12.0 17.9 4.8 17.3 Z',
        'M10.2 17.8 Q12.0 20.4 13.8 17.8',
        'M4.0 4.2 Q12.0 12.0 20.1 19.8'
      ]
    },
    auto: {
      paths: [
        'M4.6 10.6 Q6.4 5.1 12.4 5.0 Q16.8 5.1 19.0 8.7',
        'M16.1 8.8 L19.3 9.0 L19.1 5.7',
        'M19.4 13.4 Q17.6 18.9 11.6 19.0 Q7.2 18.9 5.0 15.3',
        'M7.9 15.2 L4.7 15.0 L4.9 18.3'
      ]
    },
    monitor: {
      accent: 'M4.2 5.4 Q12.0 5.0 19.8 5.4 L19.6 15.0 Q12.0 15.4 4.4 15.0 Z',
      paths: [
        'M3.8 5.2 Q12.0 4.7 20.2 5.2 Q20.5 10.2 20.1 15.2 Q12.0 15.7 3.9 15.2 Q3.5 10.2 3.8 5.2 Z',
        'M12.0 15.5 L12.0 19.1',
        'M7.9 19.3 Q12.0 18.9 16.1 19.3',
        'M6.5 8.1 Q8.4 7.7 10.1 8.0'
      ]
    },
    tablet: {
      accent: 'M5.8 4.4 Q12.0 4.0 18.2 4.4 L18.0 19.6 Q12.0 19.9 6.0 19.6 Z',
      paths: [
        'M5.4 4.2 Q12.0 3.7 18.6 4.2 Q19.0 12.0 18.5 19.8 Q12.0 20.3 5.5 19.8 Q5.0 12.0 5.4 4.2 Z',
        'M11.6 17.6 L12.4 17.6'
      ]
    },
    smartphone: {
      accent: 'M7.8 3.9 Q12.0 3.6 16.2 3.9 L16.0 20.1 Q12.0 20.4 8.0 20.1 Z',
      paths: [
        'M7.4 3.7 Q12.0 3.3 16.6 3.7 Q17.0 12.0 16.5 20.3 Q12.0 20.7 7.5 20.3 Q7.0 12.0 7.4 3.7 Z',
        'M10.4 5.9 L13.6 5.9',
        'M11.4 18.0 L12.6 18.0'
      ]
    },
    layers: {
      accent: 'M5.2 6.8 Q12.0 3.8 18.8 6.8 Q12.0 9.9 5.2 6.8 Z',
      paths: [
        'M4.6 7.4 Q12.0 3.9 19.4 7.4 Q12.0 10.8 4.6 7.4 Z',
        'M4.8 12.1 Q12.0 15.5 19.2 12.1',
        'M4.8 16.6 Q12.0 20.0 19.2 16.6'
      ]
    },
    sparkles: {
      anim: 'sketchy-twinkle',
      accent: 'M12.0 4.8 Q13.4 9.5 17.8 10.9 Q13.4 12.4 12.0 17.1 Q10.6 12.4 6.2 10.9 Q10.6 9.5 12.0 4.8 Z',
      paths: [
        'M12.0 3.9 Q13.2 9.4 18.6 10.8 Q13.2 12.2 12.0 17.8 Q10.8 12.2 5.4 10.8 Q10.8 9.4 12.0 3.9 Z',
        'M18.6 4.2 L18.6 7.2 M17.1 5.7 L20.1 5.7',
        'M5.6 16.6 L5.6 19.2 M4.3 17.9 L6.9 17.9'
      ]
    },
    printer: {
      accent: 'M5.2 9.6 Q12.0 9.2 18.8 9.6 L18.6 15.8 L5.4 15.8 Z',
      paths: [
        'M7.4 8.8 L7.5 4.3 Q12.0 3.9 16.5 4.3 L16.6 8.8',
        'M4.4 9.2 Q12.0 8.6 19.6 9.2 Q20.1 12.6 19.6 16.1 L16.8 16.2 M7.2 16.2 L4.4 16.1 Q3.9 12.6 4.4 9.2 Z',
        'M7.4 14.3 L16.6 14.3 L16.4 19.8 Q12.0 20.2 7.6 19.8 Z',
        'M9.6 17.1 L14.4 17.1'
      ]
    },
    save: {
      accent: 'M5.4 4.8 Q12.0 4.4 16.8 4.8 L19.2 7.4 L19.0 19.2 Q12.0 19.6 5.4 19.2 Z',
      paths: [
        'M4.8 4.6 Q12.0 4.1 16.9 4.5 L19.5 7.2 Q19.9 13.4 19.4 19.5 Q12.0 20.0 4.8 19.5 Q4.4 12.0 4.8 4.6 Z',
        'M8.2 4.7 L8.3 9.2 Q12.0 9.5 14.8 9.2 L14.7 4.7',
        'M7.8 19.3 L7.9 13.4 Q12.0 13.0 16.1 13.4 L16.2 19.3'
      ]
    },
    moon: {
      anim: 'sketchy-hover-wiggle',
      accent: 'M14.2 4.6 Q9.2 7.4 10.6 13.2 Q12.4 18.2 18.8 17.4 Q14.6 20.6 9.2 19.1 Q4.2 17.2 4.6 11.4 Q5.2 5.4 14.2 4.6 Z',
      paths: [
        'M14.5 4.2 Q8.9 7.2 10.4 13.4 Q12.4 18.5 19.1 17.6 Q14.8 21.1 9.0 19.5 Q3.8 17.4 4.2 11.2 Q4.8 4.9 14.5 4.2 Z',
        'M17.8 5.2 L17.8 7.8 M16.5 6.5 L19.1 6.5'
      ]
    },
    sun: {
      anim: 'sketchy-pulse-soft',
      accent: 'M12.0 7.6 Q16.3 7.8 16.4 12.0 Q16.3 16.2 12.0 16.4 Q7.7 16.2 7.6 12.0 Q7.7 7.8 12.0 7.6 Z',
      paths: [
        'M12.0 7.2 Q16.7 7.4 16.8 12.0 Q16.7 16.6 12.0 16.8 Q7.3 16.6 7.2 12.0 Q7.3 7.4 12.0 7.2 Z',
        'M12.0 3.0 L12.0 4.9 M12.0 19.1 L12.0 21.0 M3.0 12.0 L4.9 12.0 M19.1 12.0 L21.0 12.0',
        'M5.6 5.6 L7.0 7.0 M17.0 17.0 L18.4 18.4 M18.4 5.6 L17.0 7.0 M7.0 17.0 L5.6 18.4'
      ]
    },
    search: {
      accent: 'M10.8 4.8 Q16.1 5.0 16.2 10.5 Q16.1 16.0 10.8 16.2 Q5.2 16.0 5.1 10.5 Q5.2 5.0 10.8 4.8 Z',
      paths: [
        'M10.7 4.4 Q16.6 4.6 16.7 10.5 Q16.6 16.4 10.7 16.6 Q4.7 16.4 4.6 10.5 Q4.7 4.6 10.7 4.4 Z',
        'M15.1 14.9 Q17.9 17.6 20.1 20.0'
      ]
    },
    columns: {
      accent: 'M4.4 5.4 L10.3 5.4 L10.1 18.6 L4.6 18.6 Z M13.7 5.4 L19.6 5.4 L19.4 18.6 L13.9 18.6 Z',
      paths: [
        'M4.1 5.0 Q7.2 4.7 10.4 5.0 Q10.7 12.0 10.3 18.9 Q7.2 19.3 4.2 18.9 Q3.8 12.0 4.1 5.0 Z',
        'M13.6 5.0 Q16.7 4.7 19.9 5.0 Q20.2 12.0 19.8 18.9 Q16.7 19.3 13.7 18.9 Q13.3 12.0 13.6 5.0 Z'
      ]
    },
    grid: {
      accent: 'M4.5 4.8 L10.2 4.8 L10.0 10.2 L4.7 10.2 Z M13.8 13.8 L19.5 13.8 L19.3 19.2 L14.0 19.2 Z',
      paths: [
        'M4.2 4.5 Q7.2 4.2 10.2 4.5 Q10.4 7.4 10.1 10.4 Q7.2 10.6 4.3 10.4 Q4.0 7.4 4.2 4.5 Z',
        'M13.8 4.5 Q16.8 4.2 19.8 4.5 Q20.0 7.4 19.7 10.4 Q16.8 10.6 13.9 10.4 Q13.6 7.4 13.8 4.5 Z',
        'M4.2 13.8 Q7.2 13.5 10.2 13.8 Q10.4 16.7 10.1 19.7 Q7.2 19.9 4.3 19.7 Q4.0 16.7 4.2 13.8 Z',
        'M13.8 13.8 Q16.8 13.5 19.8 13.8 Q20.0 16.7 19.7 19.7 Q16.8 19.9 13.9 19.7 Q13.6 16.7 13.8 13.8 Z'
      ]
    },
    plus: {
      paths: [
        'M12.0 4.8 Q12.3 12.0 11.9 19.2',
        'M4.8 12.0 Q12.0 11.7 19.2 12.1'
      ]
    },
    edit: {
      paths: [
        'M14.2 4.9 Q16.8 3.2 19.0 5.1 Q20.6 7.0 18.8 9.2 L9.4 18.6 L4.8 19.3 L5.6 14.8 Z',
        'M12.6 6.8 L17.1 11.1',
        'M13.0 19.8 Q16.5 19.5 19.8 19.9'
      ]
    },
    trash: {
      paths: [
        'M4.2 6.8 Q12.0 6.3 19.8 6.8',
        'M9.2 6.4 L9.6 4.1 Q12.0 3.7 14.4 4.1 L14.8 6.4',
        'M6.2 7.0 Q6.6 13.4 7.0 19.6 Q12.0 20.1 17.0 19.6 Q17.4 13.4 17.8 7.0',
        'M10.1 10.4 L10.3 16.2 M13.9 10.4 L13.7 16.2'
      ]
    },
    play: {
      accent: 'M7.2 5.4 Q13.2 8.8 18.4 12.0 Q13.2 15.2 7.2 18.6 Q6.8 12.0 7.2 5.4 Z',
      paths: [
        'M6.8 4.9 Q13.1 8.4 18.8 12.0 Q13.1 15.6 6.8 19.1 Q6.3 12.0 6.8 4.9 Z'
      ]
    },
    pause: {
      paths: [
        'M7.4 5.4 Q7.7 12.0 7.3 18.6',
        'M16.5 5.4 Q16.2 12.0 16.6 18.6'
      ]
    },
    reset: {
      paths: [
        'M4.6 11.2 Q5.4 5.2 12.2 5.1 Q18.8 5.4 19.2 12.0 Q18.8 18.8 12.0 19.1 Q7.4 19.1 5.3 15.6',
        'M4.1 6.7 L4.4 11.6 L9.1 10.6'
      ]
    },
    youtube: {
      accent: 'M3.6 7.4 Q12.0 6.8 20.4 7.4 Q20.8 12.0 20.4 16.6 Q12.0 17.2 3.6 16.6 Q3.2 12.0 3.6 7.4 Z',
      paths: [
        'M3.2 7.2 Q12.0 6.5 20.8 7.2 Q21.3 12.0 20.8 16.8 Q12.0 17.5 3.2 16.8 Q2.7 12.0 3.2 7.2 Z',
        'M10.1 9.5 L15.4 12.0 L10.1 14.5 Z'
      ]
    },
    music: {
      anim: 'sketchy-hover-wiggle',
      accent: 'M7.2 15.6 Q9.4 15.7 9.5 17.8 Q9.4 19.8 7.2 19.9 Q5.0 19.8 4.9 17.8 Q5.0 15.7 7.2 15.6 Z',
      paths: [
        'M9.4 17.6 L9.5 6.4 Q14.0 5.1 18.5 4.6 L18.4 15.8',
        'M9.5 9.8 Q14.0 8.5 18.5 8.0',
        'M7.2 15.2 Q9.7 15.3 9.7 17.8 Q9.7 20.2 7.2 20.2 Q4.6 20.2 4.6 17.8 Q4.6 15.3 7.2 15.2 Z',
        'M16.1 13.5 Q18.6 13.6 18.6 16.0 Q18.6 18.4 16.1 18.4 Q13.6 18.4 13.6 16.0 Q13.6 13.6 16.1 13.5 Z'
      ]
    },
    piano: {
      accent: 'M4.4 6.2 L19.6 6.2 L19.4 17.8 L4.6 17.8 Z',
      paths: [
        'M4.0 5.9 Q12.0 5.5 20.0 5.9 Q20.4 12.0 19.9 18.1 Q12.0 18.5 4.1 18.1 Q3.7 12.0 4.0 5.9 Z',
        'M9.2 6.0 L9.2 13.0 M14.8 6.0 L14.8 13.0',
        'M7.8 13.2 L10.6 13.2 M13.4 13.2 L16.2 13.2',
        'M12.0 13.3 L12.0 18.0'
      ]
    },
    rain: {
      anim: 'sketchy-float-bob',
      accent: 'M6.2 13.6 Q4.0 13.3 4.2 10.6 Q4.5 7.9 7.5 7.8 Q9.2 4.6 13.0 5.1 Q16.6 5.5 17.2 8.7 Q19.9 9.1 19.8 11.7 Q19.6 13.8 16.8 13.6 Z',
      paths: [
        'M6.0 13.8 Q3.6 13.5 3.8 10.5 Q4.2 7.6 7.4 7.5 Q9.1 4.2 13.1 4.7 Q16.9 5.2 17.6 8.5 Q20.4 9.0 20.2 11.8 Q20.0 14.0 16.9 13.8 Z',
        'M7.8 16.2 L6.8 19.6 M12.2 16.2 L11.2 19.8 M16.4 16.2 L15.4 19.6'
      ]
    },
    ocean: {
      paths: [
        'M3.4 9.6 Q6.4 7.0 9.4 9.6 Q12.4 12.2 15.4 9.6 Q18.4 7.0 20.8 9.4',
        'M3.4 14.8 Q6.4 12.2 9.4 14.8 Q12.4 17.4 15.4 14.8 Q18.4 12.2 20.8 14.6'
      ]
    },
    coffee: {
      anim: 'sketchy-float-bob',
      accent: 'M5.2 10.2 L16.2 10.2 Q16.0 18.4 10.7 18.8 Q5.4 18.4 5.2 10.2 Z',
      paths: [
        'M4.8 9.8 Q10.7 9.4 16.6 9.8 Q16.4 18.8 10.7 19.2 Q5.0 18.8 4.8 9.8 Z',
        'M16.5 11.1 Q20.1 11.1 20.0 14.1 Q19.9 16.6 15.9 16.4',
        'M8.2 4.6 Q7.4 6.2 8.4 7.5 M11.4 4.1 Q10.6 5.9 11.6 7.3 M14.4 4.8 Q13.7 6.3 14.6 7.5'
      ]
    },
    volume: {
      paths: [
        'M4.2 9.8 L7.8 9.7 L12.4 5.4 Q12.8 12.0 12.4 18.6 L7.8 14.3 L4.2 14.2 Q3.8 12.0 4.2 9.8 Z',
        'M15.6 9.2 Q17.6 12.0 15.6 14.8',
        'M18.2 6.8 Q21.2 12.0 18.2 17.2'
      ]
    },
    flame: {
      anim: 'sketchy-flame-flicker',
      accent: 'M12.2 4.0 Q17.6 9.4 17.4 14.2 Q17.0 19.4 12.0 19.6 Q7.0 19.4 6.6 14.2 Q6.5 10.6 9.4 8.2 Q10.2 10.5 11.4 11.0 Q11.0 7.4 12.2 4.0 Z',
      paths: [
        'M12.2 3.5 Q18.0 9.1 17.8 14.3 Q17.4 19.9 12.0 20.1 Q6.6 19.9 6.2 14.3 Q6.1 10.4 9.3 7.8 Q10.2 10.4 11.4 10.9 Q11.0 7.1 12.2 3.5 Z',
        'M12.0 13.6 Q14.1 15.1 13.9 17.2 Q12.0 18.6 10.1 17.2 Q9.9 15.1 12.0 13.6 Z'
      ]
    },
    repeat: {
      paths: [
        'M16.8 4.8 L19.8 7.5 L16.8 10.2',
        'M4.4 11.4 Q4.5 7.4 8.2 7.5 L19.4 7.5',
        'M7.2 19.2 L4.2 16.5 L7.2 13.8',
        'M19.6 12.6 Q19.5 16.6 15.8 16.5 L4.6 16.5'
      ]
    },
    checklist: {
      accent: 'M4.8 4.8 L19.2 4.8 L19.0 19.2 L5.0 19.2 Z',
      paths: [
        'M4.4 4.5 Q12.0 4.1 19.6 4.5 Q20.0 12.0 19.5 19.5 Q12.0 19.9 4.5 19.5 Q4.0 12.0 4.4 4.5 Z',
        'M8.2 12.1 L10.9 14.9 L16.1 8.9'
      ]
    },
    settings: {
      anim: 'sketchy-hover-wiggle',
      accent: 'M12.0 8.8 Q15.1 9.0 15.2 12.0 Q15.1 15.0 12.0 15.2 Q8.9 15.0 8.8 12.0 Q8.9 9.0 12.0 8.8 Z',
      paths: [
        'M12.0 8.5 Q15.4 8.7 15.5 12.0 Q15.4 15.3 12.0 15.5 Q8.6 15.3 8.5 12.0 Q8.6 8.7 12.0 8.5 Z',
        'M10.4 4.1 L13.6 4.1 L14.1 6.3 Q15.4 6.8 16.2 7.6 L18.4 6.6 L20.0 9.4 L18.1 11.0 Q18.2 12.0 18.1 13.0 L20.0 14.6 L18.4 17.4 L16.2 16.4 Q15.4 17.2 14.1 17.7 L13.6 19.9 L10.4 19.9 L9.9 17.7 Q8.6 17.2 7.8 16.4 L5.6 17.4 L4.0 14.6 L5.9 13.0 Q5.8 12.0 5.9 11.0 L4.0 9.4 L5.6 6.6 L7.8 7.6 Q8.6 6.8 9.9 6.3 Z'
      ]
    },
    grip: {
      paths: [
        'M8.6 7.4 L9.2 7.4 M14.8 7.4 L15.4 7.4',
        'M8.6 12.0 L9.2 12.0 M14.8 12.0 L15.4 12.0',
        'M8.6 16.6 L9.2 16.6 M14.8 16.6 L15.4 16.6'
      ]
    },
    note: {
      accent: 'M5.2 4.4 L15.8 4.4 L18.8 7.6 L18.6 19.6 L5.4 19.6 Z',
      paths: [
        'M4.8 4.2 Q11.5 3.8 16.1 4.2 L19.1 7.4 Q19.4 13.5 19.0 19.8 Q12.0 20.2 5.0 19.8 Q4.5 12.0 4.8 4.2 Z',
        'M15.8 4.3 L15.9 7.8 L19.0 7.7',
        'M8.2 10.6 Q12.0 10.3 15.8 10.6 M8.2 14.0 Q12.0 14.3 15.4 14.0 M8.2 17.1 L12.4 17.1'
      ]
    },
    tag: {
      accent: 'M4.6 12.1 L11.4 4.8 L19.0 5.1 L19.2 12.6 L12.0 19.4 Z',
      paths: [
        'M4.2 12.0 L11.4 4.4 Q15.4 4.1 19.3 4.6 Q19.8 8.6 19.4 12.6 L12.0 19.8 Q8.0 16.1 4.2 12.0 Z',
        'M15.2 8.2 Q16.1 8.3 16.0 9.1 Q15.9 9.9 15.1 9.8 Q14.3 9.7 14.4 8.9 Q14.5 8.1 15.2 8.2 Z'
      ]
    },
    eye: {
      paths: [
        'M3.2 12.0 Q12.0 5.2 20.8 12.0 Q12.0 18.8 3.2 12.0 Z',
        'M12.0 9.5 Q14.4 9.6 14.5 12.0 Q14.4 14.4 12.0 14.5 Q9.6 14.4 9.5 12.0 Q9.6 9.6 12.0 9.5 Z'
      ]
    },
    calendar: {
      accent: 'M4.5 6.4 L19.5 6.4 L19.3 19.4 L4.7 19.4 Z',
      paths: [
        'M4.2 6.0 Q12.0 5.6 19.8 6.0 Q20.1 12.8 19.7 19.7 Q12.0 20.2 4.3 19.7 Q3.9 12.8 4.2 6.0 Z',
        'M8.2 3.8 L8.3 7.2 M15.8 3.8 L15.7 7.2',
        'M4.3 10.2 Q12.0 9.9 19.7 10.2',
        'M8.2 13.8 L9.4 13.8 M12.0 13.8 L13.2 13.8 M15.6 13.8 L16.8 13.8 M8.2 16.8 L9.4 16.8'
      ]
    },
    palette: {
      accent: 'M12.0 4.4 Q19.2 4.8 19.6 11.4 Q19.5 15.2 15.8 15.0 Q13.8 15.0 14.4 17.4 Q14.8 19.6 11.6 19.6 Q5.1 19.2 4.4 12.4 Q4.2 4.8 12.0 4.4 Z',
      paths: [
        'M12.0 4.0 Q19.6 4.5 20.0 11.4 Q19.9 15.6 15.8 15.3 Q13.5 15.2 14.2 17.6 Q14.8 20.0 11.4 20.0 Q4.6 19.5 4.0 12.4 Q3.8 4.5 12.0 4.0 Z',
        'M8.6 9.2 L9.4 9.2 M12.6 7.8 L13.4 7.8 M15.8 10.8 L16.6 10.8 M8.4 13.6 L9.2 13.6'
      ]
    },
    ruler: {
      paths: [
        'M4.2 15.8 L15.8 4.2 Q17.9 4.5 19.8 6.4 L8.2 18.0 Q6.1 17.7 4.2 15.8 Z',
        'M8.4 11.6 L10.0 13.2 M11.2 8.8 L12.8 10.4 M14.0 6.0 L15.6 7.6'
      ]
    },
    heart: {
      anim: 'sketchy-pulse-soft',
      accent: 'M12.0 19.0 Q4.6 14.0 4.6 8.8 Q4.7 5.2 8.4 5.2 Q10.9 5.3 12.0 7.6 Q13.1 5.3 15.6 5.2 Q19.3 5.2 19.4 8.8 Q19.4 14.0 12.0 19.0 Z',
      paths: [
        'M12.0 19.4 Q4.2 14.2 4.2 8.7 Q4.3 4.8 8.3 4.8 Q10.8 4.9 12.0 7.4 Q13.2 4.9 15.7 4.8 Q19.7 4.8 19.8 8.7 Q19.8 14.2 12.0 19.4 Z'
      ]
    },
    star: {
      anim: 'sketchy-twinkle',
      accent: 'M12.0 4.2 L14.4 9.1 L19.6 9.9 L15.8 13.6 L16.7 19.0 L12.0 16.5 L7.3 19.0 L8.2 13.6 L4.4 9.9 L9.6 9.1 Z',
      paths: [
        'M12.0 3.7 Q13.2 6.4 14.5 9.0 Q17.2 9.4 20.0 9.8 Q17.9 11.7 16.0 13.7 Q16.5 16.5 16.9 19.4 Q14.4 18.0 12.0 16.8 Q9.6 18.0 7.1 19.4 Q7.5 16.5 8.0 13.7 Q6.1 11.7 4.0 9.8 Q6.8 9.4 9.5 9.0 Q10.8 6.4 12.0 3.7 Z'
      ]
    },
    rabbit: {
      anim: 'sketchy-bunny-bob',
      accent: 'M7.4 12.2 Q12.0 11.5 16.6 12.2 Q17.2 18.2 12.0 18.8 Q6.8 18.2 7.4 12.2 Z',
      paths: [
        'M9.4 11.8 Q7.6 6.2 8.9 4.4 Q10.5 4.2 11.3 11.1',
        'M12.7 11.1 Q13.5 4.2 15.1 4.4 Q16.4 6.2 14.6 11.8',
        'M6.9 14.5 Q6.9 10.9 12.0 10.9 Q17.1 10.9 17.1 14.5 Q17.0 19.2 12.0 19.4 Q7.0 19.2 6.9 14.5 Z',
        'M9.8 14.4 L10.0 15.0 M14.2 14.4 L14.0 15.0',
        'M11.1 16.5 Q12.0 17.4 12.9 16.5'
      ]
    },
    send: {
      paths: [
        'M4.0 12.0 L19.8 4.4 L15.4 19.8 L11.4 13.6 Z',
        'M11.4 13.6 L19.6 4.6'
      ]
    },
    external: {
      paths: [
        'M13.6 5.2 L18.8 5.2 L18.8 10.4',
        'M11.2 12.8 L18.6 5.4',
        'M10.4 6.8 L5.4 6.8 Q4.9 12.4 5.3 18.6 Q11.4 19.0 17.2 18.6 L17.2 13.6'
      ]
    },
    brush: {
      anim: 'sketchy-hover-wiggle',
      accent: 'M9.6 14.4 Q12.0 13.2 13.4 15.8 Q12.4 19.6 6.8 19.4 Q6.4 16.2 9.6 14.4 Z',
      paths: [
        'M14.6 4.4 L19.6 9.4 L12.8 16.0 Q10.6 14.2 8.2 12.2 Z',
        'M9.2 13.4 Q6.1 14.0 5.4 17.4 Q4.8 19.4 4.2 19.8 Q8.2 20.6 11.4 18.8 Q13.2 17.6 12.4 15.4'
      ]
    },
    book: {
      accent: 'M4.4 6.2 Q8.2 5.2 12.0 6.8 Q15.8 5.2 19.6 6.2 L19.4 18.4 Q15.8 17.4 12.0 18.8 Q8.2 17.4 4.6 18.4 Z',
      paths: [
        'M4.1 5.9 Q8.1 4.8 12.0 6.6 Q15.9 4.8 19.9 5.9 L19.7 18.6 Q15.8 17.5 12.0 19.1 Q8.2 17.5 4.3 18.6 Z',
        'M12.0 6.7 L12.0 19.0',
        'M6.6 10.2 Q8.8 9.7 10.1 10.3 M13.9 10.3 Q15.2 9.7 17.4 10.2',
        'M6.6 13.8 Q8.8 13.4 10.1 13.9 M13.9 13.9 Q15.2 13.4 17.4 13.8'
      ]
    },
    briefcase: {
      accent: 'M4.4 8.2 Q12.0 7.7 19.6 8.2 L19.4 18.6 Q12.0 19.0 4.6 18.6 Z',
      paths: [
        'M8.8 7.8 L9.1 5.0 Q12.0 4.5 14.9 5.0 L15.2 7.8',
        'M4.0 8.0 Q12.0 7.4 20.0 8.0 Q20.4 13.4 19.8 18.9 Q12.0 19.4 4.2 18.9 Q3.6 13.4 4.0 8.0 Z',
        'M4.3 12.5 Q12.0 14.0 19.7 12.5',
        'M11.1 12.2 L12.9 12.2 L12.8 14.4 L11.2 14.4 Z'
      ]
    },
    download: {
      accent: 'M12.0 4.4 L12.0 14.2 M8.2 10.6 L12.0 14.6 L15.8 10.6',
      paths: [
        'M12.0 4.2 L12.0 14.5',
        'M7.9 10.8 Q10.0 13.0 12.0 15.0 Q14.0 13.0 16.1 10.8',
        'M4.6 15.2 L4.8 19.0 Q12.0 19.6 19.2 19.0 L19.4 15.2'
      ]
    },
    user: {
      accent: 'M12.0 5.4 Q15.3 5.5 15.4 8.8 Q15.3 12.1 12.0 12.2 Q8.7 12.1 8.6 8.8 Q8.7 5.5 12.0 5.4 Z M5.6 19.4 Q6.6 14.4 12.0 14.4 Q17.4 14.4 18.4 19.4 Z',
      paths: [
        'M12.0 5.0 Q15.7 5.2 15.8 8.8 Q15.7 12.4 12.0 12.6 Q8.3 12.4 8.2 8.8 Q8.3 5.2 12.0 5.0 Z',
        'M5.2 19.6 Q6.4 14.2 12.0 14.2 Q17.6 14.2 18.8 19.6'
      ]
    },
    lock: {
      accent: 'M6.2 10.8 L17.8 10.8 L17.6 19.2 Q12.0 19.6 6.4 19.2 Z',
      paths: [
        'M8.1 10.4 L8.2 7.2 Q8.6 4.2 12.0 4.1 Q15.4 4.2 15.8 7.2 L15.9 10.4',
        'M5.6 10.5 Q12.0 10.0 18.4 10.5 Q18.8 15.0 18.3 19.5 Q12.0 20.0 5.7 19.5 Q5.2 15.0 5.6 10.5 Z',
        'M12.0 14.2 L12.0 16.5'
      ]
    },
    logout: {
      paths: [
        'M10.4 5.2 L5.4 5.2 Q4.9 12.0 5.3 18.8 L10.4 18.8',
        'M9.8 12.0 L19.2 12.0',
        'M15.6 8.4 L19.4 12.0 L15.6 15.6'
      ]
    },
    cloud: {
      anim: 'sketchy-float-bob',
      accent: 'M6.6 17.6 Q3.8 17.3 4.0 14.1 Q4.4 11.0 7.6 10.9 Q9.4 7.0 13.6 7.5 Q17.4 8.0 18.1 11.6 Q20.4 12.1 20.2 14.9 Q19.9 17.7 17.0 17.6 Z',
      paths: [
        'M6.4 17.9 Q3.4 17.6 3.6 14.1 Q4.0 10.7 7.5 10.6 Q9.4 6.6 13.7 7.1 Q17.7 7.6 18.4 11.4 Q20.9 12.0 20.7 15.0 Q20.4 18.0 17.2 17.9 Z'
      ]
    },
    shield: {
      anim: 'sketchy-hover-pop',
      accent: 'M12.0 3.8 Q15.8 5.2 19.0 6.2 Q19.2 13.4 12.0 19.6 Q4.8 13.4 5.0 6.2 Q8.2 5.2 12.0 3.8 Z',
      paths: [
        'M12.0 3.4 Q16.0 4.9 19.4 6.0 Q19.7 13.6 12.0 20.1 Q4.3 13.6 4.6 6.0 Q8.0 4.9 12.0 3.4 Z',
        'M9.2 12.0 L11.4 14.2 L15.4 9.6'
      ]
    },
    users: {
      accent: 'M9.2 5.8 Q12.0 5.9 12.1 8.8 Q12.0 11.7 9.2 11.8 Q6.4 11.7 6.3 8.8 Q6.4 5.9 9.2 5.8 Z M4.0 19.0 Q5.0 14.2 9.2 14.2 Q13.4 14.2 14.4 19.0 Z',
      paths: [
        'M9.2 5.4 Q12.3 5.6 12.4 8.8 Q12.3 12.0 9.2 12.2 Q6.1 12.0 6.0 8.8 Q6.1 5.6 9.2 5.4 Z',
        'M3.6 19.2 Q4.8 14.0 9.2 14.0 Q13.6 14.0 14.8 19.2',
        'M15.4 6.6 Q17.8 6.8 17.9 9.2 Q17.8 11.6 15.4 11.8',
        'M16.2 14.4 Q19.4 14.8 20.4 19.0'
      ]
    },
    key: {
      anim: 'sketchy-hover-wiggle',
      accent: 'M7.5 8.8 Q10.6 8.9 10.7 12.0 Q10.6 15.1 7.5 15.2 Q4.4 15.1 4.3 12.0 Q4.4 8.9 7.5 8.8 Z',
      paths: [
        'M7.5 8.4 Q11.0 8.5 11.1 12.0 Q11.0 15.5 7.5 15.6 Q4.0 15.5 3.9 12.0 Q4.0 8.5 7.5 8.4 Z',
        'M11.1 12.0 L20.4 12.0',
        'M16.6 12.0 L16.6 15.2 M19.6 12.0 L19.6 14.6'
      ]
    },
    ban: {
      paths: [
        'M12.0 4.2 Q19.6 4.4 19.8 12.0 Q19.6 19.6 12.0 19.8 Q4.4 19.6 4.2 12.0 Q4.4 4.4 12.0 4.2 Z',
        'M6.6 6.6 L17.4 17.4'
      ]
    }
  };

  function buildIconSVG(name, opts = {}) {
    const def = ICONS[name] || ICONS.sparkles;
    const size = opts.size || 18;
    const strokeWidth = opts.strokeWidth || 2.05;
    const accent = opts.accent || '';
    const animate = opts.animate !== false;
    const extraClass = opts.className || '';
    const animClass = animate && def.anim ? def.anim : '';

    // Secondary sketchy ghost stroke offset creates Ali0092/Sketchy organic hand-inked feel
    const ghostStrokes = def.paths.map(d =>
      `<path d="${d}" stroke-width="${Math.max(1.1, strokeWidth * 0.55)}" opacity="0.28" transform="translate(0.45, 0.45) rotate(-0.8 12 12)"/>`
    ).join('');

    const mainStrokes = def.paths.map(d =>
      `<path d="${d}" stroke-width="${strokeWidth}"/>`
    ).join('');

    const accentWash = (accent || opts.colorful !== false) && def.accent
      ? `<path d="${def.accent}" fill="${accent || 'var(--sketch-accent, #fbcfe8)'}" fill-opacity="0.48" stroke="none"/>`
      : '';

    const animatedHand = def.hand
      ? `<path d="${def.hand}" stroke-width="${strokeWidth}" class="${animate ? 'sketchy-hand-part' : ''}"/>`
      : '';

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" class="sketchy-svg inline-block align-middle flex-shrink-0 ${animClass} ${extraClass}" aria-hidden="true">${accentWash}${ghostStrokes}${mainStrokes}${animatedHand}</svg>`;
  }

  /**
   * Builds a SketchyEmptyState inline SVG illustration (pure vector + animation, theme-able)
   */
  function buildEmptyIllustration(variant = 'no-tasks') {
    if (variant === 'no-boards') {
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" class="sketchy-empty-svg mx-auto" width="110" height="92" aria-hidden="true">
          <path d="M22 24 Q60 18 98 24 L95 82 Q60 88 25 82 Z" fill="var(--sketch-accent, #fef08a)" fill-opacity="0.35" stroke="none"/>
          <path d="M20 22 Q60 16 100 22 Q103 52 98 84 Q60 90 22 84 Q18 52 20 22 Z" stroke-width="2.4"/>
          <path d="M20 22 Q60 16 100 22" stroke-width="1.2" opacity="0.3" transform="translate(0.7,0.8)"/>
          <path d="M48 16 Q60 13 72 16 L71 27 Q60 29 49 27 Z" fill="#fda4af" fill-opacity="0.6" stroke-width="2"/>
          <path d="M35 44 Q60 41 85 44 M36 58 Q56 56 76 58" stroke-width="2" stroke-dasharray="4 4"/>
          <g class="sketchy-float-bob">
            <path d="M88 18 L91 12 L94 18 L100 20 L94 23 L91 29 L88 23 L82 20 Z" fill="#fef08a" fill-opacity="0.7" stroke-width="1.6"/>
          </g>
        </svg>
      `;
    }

    // Default 'no-tasks': Animated sleeping/chilling sketchy bunny & open sketchbook
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 90" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" class="sketchy-empty-svg mx-auto" width="96" height="78" aria-hidden="true">
        <!-- Sketchbook shadow & open pages -->
        <path d="M18 62 Q55 56 92 62 L89 79 Q55 83 21 79 Z" fill="var(--sketch-accent, #fbcfe8)" fill-opacity="0.32" stroke="none"/>
        <path d="M16 61 Q36 56 55 61 Q74 56 94 61 L91 79 Q73 75 55 80 Q37 75 19 79 Z" stroke-width="2.2"/>
        <path d="M55 61 L55 80" stroke-width="1.8" opacity="0.7"/>
        <!-- Sketchy Bunny head peeking cleanly -->
        <g class="sketchy-bunny-bob">
          <path d="M40 42 Q33 17 40 12 Q47 12 49 38" fill="#fbcfe8" fill-opacity="0.45" stroke-width="2.2"/>
          <path d="M61 38 Q63 12 70 12 Q77 17 70 42" fill="#fbcfe8" fill-opacity="0.45" stroke-width="2.2"/>
          <path d="M36 52 Q36 37 55 37 Q74 37 74 52 Q74 63 55 63 Q36 63 36 52 Z" fill="var(--card-bg, #ffffff)" stroke-width="2.3"/>
          <path d="M46 49 Q48 51 50 49 M60 49 Q62 51 64 49" stroke-width="2"/>
          <path d="M53 54 Q55 57 57 54" stroke-width="1.8"/>
        </g>
        <!-- Floating doodle sparkles -->
        <g class="sketchy-twinkle">
          <path d="M24 28 L24 36 M20 32 L28 32" stroke-width="1.8"/>
          <path d="M84 22 L84 29 M80.5 25.5 L87.5 25.5" stroke-width="1.8"/>
        </g>
      </svg>
    `;
  }

  function hydrate(root = document) {
    if (!root || !root.querySelectorAll) return;
    root.querySelectorAll('[data-sketchy]').forEach(el => {
      const name = el.getAttribute('data-sketchy');
      const size = Number(el.getAttribute('data-size')) || 17;
      const accent = el.getAttribute('data-accent') || '';
      const animate = el.getAttribute('data-animate') !== 'false';
      el.innerHTML = buildIconSVG(name, { size, accent, animate });
    });
  }

  const CATALOG_META = {
    pencil: { name: 'Bút Chì Vẽ', cat: 'study', desc: 'Ghi chép, học tập' },
    clipboard: { name: 'Bảng Ghi Chú', cat: 'work', desc: 'Lập kế hoạch, checklist' },
    book: { name: 'Sách Mở', cat: 'study', desc: 'Đọc sách, ôn thi' },
    note: { name: 'Trang Giấy Note', cat: 'study', desc: 'Ghi chú nhanh' },
    brush: { name: 'Cọ Vẽ Màu', cat: 'chill', desc: 'Mỹ thuật, sáng tạo' },
    palette: { name: 'Bảng Màu', cat: 'chill', desc: 'Vẽ tranh, thiết kế' },
    ruler: { name: 'Thước Kẻ', cat: 'study', desc: 'Toán học, kỹ thuật' },
    briefcase: { name: 'Cặp Công Việc', cat: 'work', desc: 'Việc văn phòng, dự án' },
    camera: { name: 'Máy Ảnh Vẽ Tay', cat: 'chill', desc: 'Chụp ảnh, xuất hình' },
    headphones: { name: 'Tai Nghe', cat: 'chill', desc: 'Nghe nhạc tập trung' },
    music: { name: 'Nốt Nhạc', cat: 'chill', desc: 'Thư giãn, giải trí' },
    piano: { name: 'Phím Piano', cat: 'chill', desc: 'Lofi & luyện đàn' },
    youtube: { name: 'Video YouTube', cat: 'chill', desc: 'Xem bài giảng / nhạc' },
    timer: { name: 'Đồng Hồ Bấm Giờ', cat: 'fitness', desc: 'Pomodoro, bấm giờ' },
    clock: { name: 'Đồng Hồ Giờ', cat: 'work', desc: 'Khung giờ, lịch hẹn' },
    calendar: { name: 'Tờ Lịch', cat: 'work', desc: 'Lịch tuần, ngày quan trọng' },
    bot: { name: 'Trợ Lý Robot AI', cat: 'work', desc: 'Công nghệ, AI' },
    bell: { name: 'Chuông Nhắc', cat: 'work', desc: 'Thông báo quan trọng' },
    'bell-off': { name: 'Tắt Chuông', cat: 'work', desc: 'Yên tĩnh tập trung' },
    flame: { name: 'Ngọn Lửa Streak', cat: 'fitness', desc: 'Động lực, thể thao' },
    heart: { name: 'Trái Tim', cat: 'chill', desc: 'Sức khỏe, yêu thích' },
    star: { name: 'Ngôi Sao Lấp Lánh', cat: 'chill', desc: 'Mục tiêu nổi bật' },
    sparkles: { name: 'Lấp Lánh Diệu Kỳ', cat: 'chill', desc: 'Thành tựu, trang trí' },
    rabbit: { name: 'Thỏ Bông Vẽ Tay', cat: 'animal', desc: 'Linh vật sổ tay' },
    rain: { name: 'Đám Mây Mưa', cat: 'chill', desc: 'Âm thanh mưa chill' },
    ocean: { name: 'Sóng Biển', cat: 'fitness', desc: 'Bơi lội, thư giãn' },
    coffee: { name: 'Tách Cà Phê', cat: 'chill', desc: 'Nghỉ ngơi, cafe' },
    sun: { name: 'Mặt Trời', cat: 'fitness', desc: 'Buổi sáng năng lượng' },
    moon: { name: 'Mặt Trăng', cat: 'chill', desc: 'Buổi tối, nghỉ ngơi' },
    checklist: { name: 'Ô Đánh Dấu', cat: 'work', desc: 'Hoàn thành đầu việc' },
    repeat: { name: 'Lặp Lại Thói Quen', cat: 'fitness', desc: 'Habit hằng ngày' },
    tag: { name: 'Nhãn Phân Loại', cat: 'work', desc: 'Gắn thẻ môn học' },
    search: { name: 'Kính Lúp', cat: 'study', desc: 'Tìm kiếm, nghiên cứu' },
    monitor: { name: 'Màn Hình PC', cat: 'work', desc: 'Code, làm việc máy tính' },
    tablet: { name: 'Máy Tính Bảng', cat: 'study', desc: 'Đọc tài liệu' },
    smartphone: { name: 'Điện Thoại', cat: 'work', desc: 'Liên lạc, tiện ích' },
    printer: { name: 'Máy In', cat: 'work', desc: 'In tài liệu' },
    save: { name: 'Lưu Trữ', cat: 'work', desc: 'Sao lưu dữ liệu' },
    download: { name: 'Tải Xuống', cat: 'work', desc: 'Lưu tệp, tải ảnh' },
    layers: { name: 'Xếp Lớp Sổ', cat: 'work', desc: 'Mẫu thời gian biểu' },
    settings: { name: 'Bánh Răng Cài Đặt', cat: 'work', desc: 'Cấu hình, tinh chỉnh' },
    user: { name: 'Tài Khoản Cá Nhân', cat: 'work', desc: 'Hồ sơ, người dùng' },
    lock: { name: 'Ổ Khóa Bảo Mật', cat: 'work', desc: 'Đăng nhập, riêng tư' },
    logout: { name: 'Đăng Xuất', cat: 'work', desc: 'Thoát phiên làm việc' },
    cloud: { name: 'Đám Mây Đồng Bộ', cat: 'work', desc: 'Lưu trực tuyến lên server' }
  };

  // Export catalog for "Sketchy Vẽ Tay" tab in Icon Picker modal
  const CATALOG = Object.keys(ICONS).map(key => {
    const meta = CATALOG_META[key] || {
      name: `Sketchy ${key.charAt(0).toUpperCase() + key.slice(1)}`,
      cat: 'work',
      desc: 'Icon nét vẽ tay Sketchy SVG'
    };
    return {
      id: `sk_${key}`,
      key,
      name: meta.name,
      cat: meta.cat,
      desc: meta.desc,
      svg: buildIconSVG(key, { size: 28, animate: false })
    };
  });

  global.Sketchy = {
    icon: buildIconSVG,
    emptyState: buildEmptyIllustration,
    hydrate,
    CATALOG,
    names: Object.keys(ICONS)
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => hydrate(document));
  } else {
    hydrate(document);
  }
})(window);
