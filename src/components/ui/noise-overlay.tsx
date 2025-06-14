import { motion } from "framer-motion";

export function NoiseOverlay() {
    return (
        <motion.div
            initial={{ transform: "translateX(-10%) translateY(-10%)" }}
            animate={{
                transform: "translateX(10%) translateY(10%)"
            }}
            transition={{
                repeat: Infinity,
                duration: 0.150,
                ease: "linear",
                repeatType: "mirror",
            }}
            // You can download these PNGs here:
            // https://www.hover.dev/black-noise.png
            // https://www.hover.dev/noise.png
            style={{
                backgroundImage: 'url("https://www.hover.dev/black-noise.png")',
                // backgroundImage: 'url("/noise.png")',
            }}
            className="pointer-events-none absolute -inset-[100%] opacity-20"
        />
    );
};