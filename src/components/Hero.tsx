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

import React, { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

const Hero: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const moveX = useTransform(x, [0, window.innerWidth], [-20, 20]);
  const moveY = useTransform(y, [0, window.innerHeight], [-20, 20]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [x, y]);

  const features = [
    {
      title: "Resume & Portfolio Review",
      desc: "Get concise suggestions to improve clarity and impact.",
    },
    {
      title: "Project Storytelling",
      desc: "Transform technical projects into compelling case studies.",
    },
    {
      title: "Tech Stack Optimization",
      desc: "Highlight your strongest tools and frameworks with clarity.",
    },
  ];

  return (
    <section className='relative p-8 overflow-hidden'>
      {/* Floating AI blobs */}
      <motion.div
        style={{ x: moveX, y: moveY }}
        className='absolute -top-24 -left-24 w-[300px] h-[300px] bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30'
      />
      <motion.div
        style={{ x: moveX, y: moveY }}
        className='absolute -bottom-20 -right-20 w-[350px] h-[350px] bg-gradient-to-r from-pink-400 to-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30'
      />

      {/* Content */}
      <div className='relative z-10'>
        <motion.h1
          className='text-3xl font-extrabold text-gray-900 mb-3'
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          AIVA — AI Portfolio Assistant
        </motion.h1>

        <motion.p
          className='text-gray-700 mb-6 max-w-2xl'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Create a professional narrative from your work history, tailor your
          portfolio, and get custom suggestions to impress recruiters and
          clients.
        </motion.p>

        <div className='space-y-3'>
          {features.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.2, duration: 0.6 }}
              className='border border-gray-200 p-4 rounded-xl shadow-sm bg-white/70 backdrop-blur-sm hover:shadow-md transition-all'
            >
              <h3 className='font-semibold text-gray-900'>{item.title}</h3>
              <p className='text-gray-600 text-sm'>{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Tech Stack Badges */}
        <motion.div
          className='flex flex-wrap gap-3 mt-8'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          {["React", "TypeScript", "AWS", "Tailwind", "Framer Motion"].map(
            (tech, idx) => (
              <motion.span
                key={idx}
                className='px-3 py-1 text-sm font-medium bg-gray-100 text-gray-800 rounded-full shadow-sm hover:bg-gray-200 transition-all'
                whileHover={{ scale: 1.05 }}
              >
                {tech}
              </motion.span>
            )
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;

