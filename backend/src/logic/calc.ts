export function estimate1RM(weightKg: number, reps: number): number {
  // Epley formula
  return Math.round(weightKg * (1 + reps / 30));
}

export function getWilksCoefficient(
  bodyweightKg: number,
  gender: "Male" | "Female"
): number {
  // Wilks formula coefficients
  const coefficients =
    gender === "Male"
      ? {
          a: -216.0475144,
          b: 16.2606339,
          c: -0.002388645,
          d: -0.00113732,
          e: 7.01863e-6,
          f: -1.291e-8,
        }
      : {
          a: 594.31747775582,
          b: -27.23842536447,
          c: 0.82112226871,
          d: -0.00930733913,
          e: 4.731582e-5,
          f: -9.054e-8,
        };

  const x = bodyweightKg;
  const denominator =
    coefficients.a +
    coefficients.b * x +
    coefficients.c * Math.pow(x, 2) +
    coefficients.d * Math.pow(x, 3) +
    coefficients.e * Math.pow(x, 4) +
    coefficients.f * Math.pow(x, 5);

  return 500 / denominator;
}
