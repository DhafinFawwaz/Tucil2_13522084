/**
 * Linear Interpolation
 * @param {number} a start
 * @param {number} b end
 * @param {number} t progress
 * @returns {number}
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Easing function
 * @param {number} x 
 * @returns {number}
 */
export function easeOutQuart(x) {
  const v = x - 1;
  return 1 - v*v*v*v;
}

/**
 * Easing function
 * @param {number} x 
 * @returns {number}
 */
export function easeOutBackCubic(x) {
  const v = x - 1;
  return -v*v*v*v 
  + 3*v*v*v + 3*v*v + 1
}

/**
 * Clamp value between 0 and 1
 * @param {number} x 
 * @returns {number}
 */
export function saturate(x) {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

/**
 * Random number between min and max
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}



/**
 * Optimized Combination formula: https://blog.plover.com/math/choose.html
 * @param {number} n number of items
 * @param {number} k number of items to take
 */
export function combination(n, k) {
  let r = 1;
  if (k > n) return 0;
  for (let d = 1; d <= k; d++) {
    r *= n--;
    r /= d;
  }
  return r;
}