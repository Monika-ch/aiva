// import React from "react";

// const Hero: React.FC = () => {
//   return (
//     <section className='p-8'>
//       <h1 className='text-3xl font-extrabold text-gray-900 mb-3'>
//         AIVA — AI Portfolio Assistant
//       </h1>
//       <p className='text-gray-700 mb-6'>
//         Create a professional narrative from your work history, tailor your
//         portfolio, and get custom suggestions to impress recruiters and clients.
//       </p>

//       <div className='space-y-3'>
//         <div>
//           <h3 className='font-semibold text-gray-900'>
//             Resume & Portfolio Review
//           </h3>
//           <p className='text-gray-600 text-sm'>
//             Get concise suggestions to improve clarity and impact.
//           </p>
//         </div>

//         <div>
//           <h3 className='font-semibold text-gray-900'>Project Storytelling</h3>
//           <p className='text-gray-600 text-sm'>
//             Transform technical projects into compelling case studies.
//           </p>
//         </div>

//         {/* <div>
//           <h3 className="font-semibold text-gray-900">Interview Prep</h3>
//           <p className="text-gray-600 text-sm">Practice common interview questions and receive tailored feedback.</p>
//         </div> */}
//       </div>
//     </section>
//   );
// };

// export default Hero;

import React, { useEffect } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import {
  HERO_CONTENT,
  HERO_FEATURES,
  HERO_TECH_STACK,
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
    <section className="relative overflow-hidden p-5">
      {/* Floating AI blobs */}
      <motion.div
        style={{ x: moveX, y: moveY }}
        className="absolute -top-24 -left-24 w-[300px] h-[300px] bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
      />
      <motion.div
        style={{ x: moveX, y: moveY }}
        className="absolute -bottom-20 -right-20 w-[350px] h-[350px] bg-gradient-to-r from-pink-400 to-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
      />

      {/* Content */}
      <div className="relative z-10">
        <motion.h1
          className={`text-2xl font-extrabold mb-3 ${
            darkMode ? "text-gray-100" : "text-gray-900"
          }`}
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {HERO_CONTENT.TITLE}
        </motion.h1>

        <motion.p
          className={`text-sm mb-5 leading-relaxed ${
            darkMode ? "text-gray-300" : "text-gray-700"
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          {HERO_CONTENT.DESCRIPTION}
        </motion.p>

        <div className="space-y-2.5">
          {HERO_FEATURES.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.2, duration: 0.6 }}
              className={`border p-3 rounded-lg shadow-sm backdrop-blur-sm hover:shadow-md transition-all ${
                darkMode
                  ? "border-gray-700 bg-gray-800/70"
                  : "border-gray-200 bg-white/70"
              }`}
            >
              <h3
                className={`text-sm font-semibold mb-1 ${
                  darkMode ? "text-gray-100" : "text-gray-900"
                }`}
              >
                {item.title}
              </h3>
              <p
                className={`text-xs leading-relaxed ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Tech Stack Badges */}
        <motion.div
          className="flex flex-wrap gap-2.5 mt-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          {HERO_TECH_STACK.map((tech, idx) => (
            <motion.span
              key={idx}
              className={`px-2.5 py-1 text-xs font-medium rounded-full shadow-sm transition-all ${
                darkMode
                  ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
              whileHover={{ scale: 1.05 }}
            >
              {tech}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
