import { Variants } from "framer-motion";

/**
 * Fade in animation variant with direction control.
 */
export const fadeIn = (
  direction: "up" | "down" | "left" | "right" | "none" = "none",
  delay = 0,
  duration = 0.5
): Variants => {
  return {
    hidden: {
      y: direction === "up" ? 20 : direction === "down" ? -20 : 0,
      x: direction === "left" ? 20 : direction === "right" ? -20 : 0,
      opacity: 0,
    },
    show: {
      y: 0,
      x: 0,
      opacity: 1,
      transition: {
        type: "tween",
        duration: duration,
        delay: delay,
        ease: [0.16, 1, 0.3, 1], // Custom ease-out expo for premium feel
      },
    },
  };
};

/**
 * Stagger container animation variant.
 */
export const staggerContainer = (
  staggerChildren = 0.1,
  delayChildren = 0
): Variants => {
  return {
    hidden: {},
    show: {
      transition: {
        staggerChildren: staggerChildren,
        delayChildren: delayChildren,
      },
    },
  };
};

/**
 * Scale in animation variant.
 */
export const scaleIn = (delay = 0, duration = 0.4): Variants => {
  return {
    hidden: {
      scale: 0.96,
      opacity: 0,
    },
    show: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "tween",
        duration: duration,
        delay: delay,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };
};

/**
 * Slide-in from side animation variant.
 */
export const slideIn = (
  direction: "left" | "right" | "up" | "down",
  type: "tween" | "spring" | "inertia" = "tween",
  delay = 0,
  duration = 0.5
): Variants => {
  return {
    hidden: {
      x: direction === "left" ? "-100%" : direction === "right" ? "100%" : 0,
      y: direction === "up" ? "100%" : direction === "down" ? "-100%" : 0,
    },
    show: {
      x: 0,
      y: 0,
      transition: {
        type: type,
        delay: delay,
        duration: duration,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };
};

/**
 * Reveal animation variant using clipPath.
 */
export const reveal: Variants = {
  hidden: { clipPath: "inset(10% 0 10% 0)", opacity: 0 },
  show: {
    clipPath: "inset(0% 0 0% 0)",
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

/**
 * Hover Lift animation variant.
 */
export const hoverLift: Variants = {
  initial: { y: 0, scale: 1 },
  hover: {
    y: -6,
    scale: 1.015,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

/**
 * Floating animation variant (continuous up/down).
 */
export const floating = (duration = 3, yOffset = 6): Variants => ({
  animate: {
    y: [0, -yOffset, 0],
    transition: {
      duration: duration,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
});

/**
 * Page Transition variants.
 */
export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    y: 12,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: {
      duration: 0.25,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};
