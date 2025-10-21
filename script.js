// Modernized and accessible interaction with GSAP + Lottie animation sync
let active = 3;
const mncircles = Array.from(document.querySelectorAll(".mncircle"));
const secs = Array.from(document.querySelectorAll(".sec"));
const circle = document.querySelector("#circle");
let currentOffsetX = 0;
const DESKTOP_CENTER_THRESHOLD = 900;

// 🔹 New: Lottie animations
const animations = document.querySelectorAll(".anim");
const STRIPE_ANGLES = [-30, -15, 0, 15, 30]; // Updated rotation gap to 15°

// Helper: toggle active states (for text + dots)
function setActive(idx) {
  mncircles.forEach((btn, i) => btn.classList.toggle("active", i === idx));
  secs.forEach((s, i) => s.classList.toggle("active", i === idx));

  // 🔹 NEW: switch Lottie animation
  animations.forEach((anim, i) => {
    anim.classList.toggle("active", i === idx);
  });
}

// Calculate rotation angles
function getElementRotationDeg(el) {
  const st = window.getComputedStyle(el).transform;
  if (!st || st === "none") return 0;
  const m = st.match(/matrix\\(([^)]+)\\)/);
  if (!m) return 0;
  const values = m[1].split(",").map((v) => parseFloat(v.trim()));
  const a = values[0],
    b = values[1];
  const angle = Math.atan2(b, a) * (180 / Math.PI);
  return angle;
}

function rotationFor(index, targetAngle = 0) {
  const secEl = secs[index];
  const stripeEl = secEl.closest(".stripe");
  if (!stripeEl) return 0;
  const baseAngle = STRIPE_ANGLES[index]; // use updated 15° gap angles
  return targetAngle - baseAngle;
}

// Main rotate + animation function
function goTo(index, extraOffsetDeg = 0) {
  active = index + 1;
  const targetAngle = extraOffsetDeg;
  const rot = rotationFor(index, targetAngle);

  // Animate rotation
  gsap.to(circle, {
    rotate: rot,
    ease: "power3.inOut",
    duration: 1.2,
    onComplete: () => {
      if (window.innerWidth >= DESKTOP_CENTER_THRESHOLD) {
        centerStripe(index);
      } else {
        currentOffsetX = 0;
        gsap.to(circle, { x: 0, duration: 0.5 });
      }
    },
  });

  // Animate opacity transitions
  gsap.to(mncircles, { opacity: 0.12, duration: 0.35, scale: 1 });
  gsap.to(secs, { opacity: 0.45, duration: 0.35 });

  gsap.to(mncircles[index], { opacity: 0.95, scale: 1.12, duration: 0.35 });
  gsap.to(secs[index], { opacity: 1, duration: 0.45 });

  // 🔹 Sync animation fade
  gsap.to(animations, { opacity: 0, duration: 0.4, pointerEvents: "none" });
  gsap.to(animations[index], { opacity: 1, duration: 0.6, pointerEvents: "auto" });

  setActive(index);
}

function centerStripe(index) {
  const secEl = secs[index];
  if (!secEl) return;
  const rect = secEl.getBoundingClientRect();
  const secCenterX = rect.left + rect.width / 2;
  const viewportCenterX = window.innerWidth / 2;
  const delta = viewportCenterX - secCenterX;
  currentOffsetX = (currentOffsetX || 0) + delta;
  gsap.to(circle, { x: currentOffsetX, duration: 0.9, ease: "power3.inOut" });
}

// Attach events
mncircles.forEach((btn, i) => {
  btn.addEventListener("click", (e) => {
    const extra = e.shiftKey ? 8 : 0;
    goTo(i, extra);
  });
  btn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const extra = e.shiftKey ? 8 : 0;
      goTo(i, extra);
    }
  });
});

// Keyboard navigation
window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
    goTo(Math.max(0, active - 1 - 1));
  } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
    goTo(Math.min(secs.length - 1, active - 1 + 1));
  }
});

// Initialize first
goTo(active - 1);

// Handle resize
window.addEventListener("resize", () => {
  const idx = active - 1;
  if (window.innerWidth >= DESKTOP_CENTER_THRESHOLD) {
    const rot = rotationFor(idx, 0);
    gsap.set(circle, { rotate: rot });
    centerStripe(idx);
  } else {
    currentOffsetX = 0;
    gsap.set(circle, { x: 0 });
  }
});

// Mobile panel toggle
const panel = document.querySelector("#panel");
const panelHandle = document.querySelector(".panel-handle");
if (panel && panelHandle) {
  panelHandle.addEventListener("click", (e) => {
    e.stopPropagation();
    panel.classList.toggle("open");
  });
  document.addEventListener("click", (e) => {
    if (window.innerWidth <= 420) {
      if (!panel.contains(e.target)) panel.classList.remove("open");
    }
  });
}
