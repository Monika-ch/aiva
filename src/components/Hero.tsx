import React, { useEffect } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import sparkIcon from "../assets/logo-robo-face.svg";
import {
  HERO_CONTENT,
  HERO_FEATURES,
  HERO_TECH_STACK,
  HERO_CTA,
} from "../constants/heroConstants";

interface HeroProps {
  darkMode?: boolean;
}

const Hero: React.FC<HeroProps> = ({ darkMode = false }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const moveX = useTransform(x, [0, window.innerWidth], [-20, 20]);
  const moveY = useTransform(y, [0, window.innerHeight], [-20, 20]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [x, y]);

  return (
    <section
      className={`relative overflow-hidden w-full max-w-md mx-auto px-4 py-5 pb-12 sm:px-6 sm:py-6 rounded-[32px] border shadow-[0_25px_70px_rgba(15,23,42,0.18)] ${
        darkMode
          ? "bg-gradient-to-b from-[#0d1426] via-[#0f182d] to-[#0d1426] border-gray-800"
          : "bg-gradient-to-b from-white via-white to-[#eef2ff] border-white"
      }`}
    >
      <motion.div
        style={{ x: moveX, y: moveY }}
        className="absolute -top-24 -left-24 w-[280px] h-[280px] bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-25"
      />
      <motion.div
        style={{ x: moveX, y: moveY }}
        className="absolute -bottom-24 -right-24 w-[320px] h-[320px] bg-gradient-to-r from-pink-400 to-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-25"
      />

      <div className="relative z-10 space-y-5">
        <div
          className={`flex items-center gap-3 rounded-3xl px-4 py-3 border shadow-[0_10px_30px_rgba(15,23,42,0.08)] ${
            darkMode
              ? "bg-[#101a32]/90 border-gray-800"
              : "bg-white border-white"
          }`}
        >
          <div className="w-11 h-11 rounded-full bg-white shadow-md flex items-center justify-center">
            <img src={sparkIcon} alt="AIVA" className="w-7 h-7" />
          </div>
          <div>
            <p
              className={`text-sm font-semibold ${darkMode ? "text-gray-100" : "text-gray-900"}`}
            >
              AIVA
            </p>
            <p
              className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              {HERO_CONTENT.SUBTITLE}
            </p>
          </div>
        </div>

        <motion.div
          className={`rounded-[30px] px-5 py-6 border ${
            darkMode
              ? "bg-gradient-to-b from-[#19213b] via-[#131a2d] to-[#0d1426] border-indigo-900/40 shadow-[0_25px_70px_rgba(5,8,20,0.55)]"
              : "bg-gradient-to-b from-[#f5f0ff] via-[#f3e8ff] to-[#f3f4ff] border-white shadow-[0_25px_60px_rgba(109,95,255,0.25)]"
          }`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1
            className={`text-[28px] leading-[34px] font-extrabold mb-3 ${
              darkMode ? "text-gray-100" : "text-gray-900"
            }`}
          >
            {HERO_CONTENT.TITLE}
          </h1>
          <p
            className={`text-[15px] mb-5 leading-relaxed ${
              darkMode ? "text-gray-200" : "text-gray-700"
            }`}
          >
            {HERO_CONTENT.DESCRIPTION}
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 font-semibold text-sm leading-tight text-center text-white ${
              darkMode
                ? "bg-gradient-to-r from-[#7c6bff] via-[#7156ff] to-[#a47fff] shadow-[0_15px_45px_rgba(85,71,255,0.45)]"
                : "bg-gradient-to-r from-[#6e5bff] to-[#9f7bff] shadow-[0_12px_30px_rgba(91,33,182,0.35)]"
            }`}
          >
            <span className="whitespace-normal">{HERO_CTA}</span>
            <span className="text-base shrink-0">↗</span>
          </motion.button>
        </motion.div>

        <div className="space-y-3">
          {HERO_FEATURES.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -25 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.15, duration: 0.5 }}
              className={`relative border p-4 rounded-2xl shadow-sm backdrop-blur-sm hover:shadow-xl transition-all flex gap-3 items-start ${
                darkMode
                  ? "border-gray-800 bg-[#111b33]/80"
                  : "border-gray-200 bg-white/95"
              }`}
            >
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl font-semibold ${
                  darkMode
                    ? "bg-gradient-to-br from-indigo-800 to-indigo-500 text-indigo-100"
                    : "bg-gradient-to-br from-indigo-50 to-indigo-200 text-indigo-600"
                }`}
              >
                {item.icon}
              </div>
              <div className="flex-1">
                <span
                  className={`block text-[15px] font-semibold leading-tight mb-1 ${
                    darkMode ? "text-gray-100" : "text-gray-900"
                  }`}
                >
                  {item.title}
                </span>
                <span
                  className={`text-[13px] leading-relaxed ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {item.desc}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className={`rounded-3xl border px-4 py-4 ${
            darkMode
              ? "border-gray-800 bg-[#0c1324]/80"
              : "border-gray-100 bg-white/85"
          }`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <p
            className={`text-[11px] font-semibold uppercase tracking-[0.18em] mb-3 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Powered by
          </p>
          <div className="flex flex-wrap gap-2">
            {HERO_TECH_STACK.map((tech, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-[13px] font-medium shadow-sm ${
                  darkMode
                    ? "bg-[#1a2440] text-gray-100"
                    : "bg-white text-gray-800"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-400 to-sky-400" />
                {tech}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
