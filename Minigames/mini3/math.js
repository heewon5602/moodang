// Define and export a math module as an immediately-invoked function expression (IIFE).
export const math = (function() {
  // The function returns an object containing several utility methods.
  return {
    // Generates a random floating-point number in the range [a, b].
    rand_range: function(a, b) {
      return Math.random() * (b - a) + a;
    },

    // Generates a 'normalish' distributed random number by averaging four random numbers, resulting in a pseudo-Gaussian distribution.
    rand_normalish: function() {
      const r = Math.random() + Math.random() + Math.random() + Math.random();
      return (r / 4.0) * 2.0 - 1;
    },

    // Generates a random integer in the range [a, b].
    rand_int: function(a, b) {
      return Math.round(Math.random() * (b - a) + a);
    },

    // Performs a linear interpolation between values a and b using factor x
    lerp: function(x, a, b) {
      return x * (b - a) + a;
    },

    // Implements the smoothstep interpolation between a and b, using x as the interpolation factor.
    smoothstep: function(x, a, b) {
      // Polynomial smoothing equation
      x = x * x * (3.0 - 2.0 * x);
      return x * (b - a) + a;
    },

    // Implements the smootherstep interpolation, which is a higher-order smoothing than smoothstep.
    smootherstep: function(x, a, b) {
       // Higher degree polynomial for extra smoothness
      x = x * x * x * (x * (x * 6 - 15) + 10);
      return x * (b - a) + a;
    },

    // Clamps the value x to the range [a, b].
    clamp: function(x, a, b) {
      return Math.min(Math.max(x, a), b);
    },

    // Clamps the value x to the range [0.0, 1.0], commonly known as saturate in shader languages.
    sat: function(x) {
      return Math.min(Math.max(x, 0.0), 1.0);
    },

    // Checks if the value x is within the range [a, b] (inclusive).
    in_range: (x, a, b) => {
      return x >= a && x <= b;
    },
  };
})();
