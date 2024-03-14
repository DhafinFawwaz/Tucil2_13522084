/**
 * Linear Interpolation
 * @param {number} a start
 * @param {number} b end
 * @param {number} t progress
 * @returns 
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Easing function
 * @param {number} x 
 * @returns 
 */
export function easeOutQuart(x) {
  const v = x - 1;
  return 1 - v*v*v*v;
}

/**
 * Easing function
 * @param {number} x 
 * @returns 
 */
export function easeOutBackCubic(x) {
  const v = x - 1;
  return -v*v*v*v 
  + 3*v*v*v + 3*v*v + 1
}

/**
 * Clamp value between 0 and 1
 * @param {number} x 
 * @returns 
 */
export function saturate(x) {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}