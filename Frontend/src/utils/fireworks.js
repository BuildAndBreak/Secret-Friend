import confetti from "canvas-confetti";

export function launchFireworks() {
  const duration = 1500;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ["#c0392b", "#27ae60", "#d4af37"],
    });

    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ["#c0392b", "#27ae60", "#d4af37"],
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}
