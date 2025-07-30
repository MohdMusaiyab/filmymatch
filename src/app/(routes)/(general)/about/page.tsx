"use client";
import React from 'react';
import { motion } from 'framer-motion';

const SnippetAbout = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeInOut" as [0.42, 0, 0.58, 1] | "linear" | "easeIn" | "easeOut" | "easeInOut"
      }
    }
  };

  const floatingVariants = {
    animate: {
      y: [-8, 8, -8],
      rotate: [0, 1, -1, 0],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut" as const
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-100 to-amber-100 relative overflow-hidden">
      {/* Subtle Vintage Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 bg-amber-200 rounded-full opacity-10 blur-2xl"
          variants={floatingVariants}
          animate="animate"
        />
        <motion.div
          className="absolute top-40 right-20 w-24 h-24 bg-stone-300 rounded-full opacity-15 blur-2xl"
          variants={floatingVariants}
          animate="animate"
          transition={{ delay: 2 }}
        />
        <motion.div
          className="absolute bottom-32 left-1/4 w-40 h-40 bg-amber-300 rounded-full opacity-8 blur-2xl"
          variants={floatingVariants}
          animate="animate"
          transition={{ delay: 4 }}
        />
        <motion.div
          className="absolute bottom-20 right-1/3 w-28 h-28 bg-stone-400 rounded-full opacity-12 blur-2xl"
          variants={floatingVariants}
          animate="animate"
          transition={{ delay: 1 }}
        />
      </div>

      {/* Vintage Paper Texture Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-50/30 to-stone-100/40 opacity-60"></div>

      {/* Main Content */}
      <motion.div
        className="relative z-10 container mx-auto px-6 py-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header Section */}
        <motion.div className="text-center mb-16" variants={itemVariants}>
          <motion.h1 
            className="text-7xl md:text-8xl font-bold mb-6 text-amber-900"
            style={{ 
              fontFamily: 'Playfair Display, serif',
              textShadow: '2px 2px 4px rgba(120, 53, 15, 0.1)'
            }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            Snippet
          </motion.h1>
          <motion.p 
            className="text-2xl md:text-3xl text-stone-700 max-w-3xl mx-auto leading-relaxed"
            style={{ fontFamily: 'Crimson Text, serif' }}
            variants={itemVariants}
          >
            Preserving the timeless moments of reflection and inspiration
          </motion.p>
        </motion.div>

        {/* Story Section */}
        <motion.div className="max-w-4xl mx-auto mb-20" variants={itemVariants}>
          <div className="bg-gradient-to-br from-amber-50/80 to-stone-50/80 backdrop-blur-sm rounded-2xl p-12 border-2 border-amber-200/50 shadow-xl relative">
            {/* Vintage Corner Decorations */}
            <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-amber-400/60"></div>
            <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-amber-400/60"></div>
            <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-amber-400/60"></div>
            <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-amber-400/60"></div>
            
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-8 text-center text-amber-800"
              style={{ fontFamily: 'Playfair Display, serif' }}
              whileHover={{ scale: 1.01 }}
            >
              Our Legacy
            </motion.h2>
            <div className="space-y-6 text-lg leading-relaxed text-stone-700" style={{ fontFamily: 'Crimson Text, serif' }}>
              <p className="first-letter:text-5xl first-letter:font-bold first-letter:text-amber-800 first-letter:mr-1 first-letter:float-left first-letter:leading-none">
                In an age where thoughts drift like autumn leaves, we believe in the art of 
                preservation. Those quiet moments when a film touches your soul, when a voice 
                through the radio speaks directly to your heart, when life reveals its hidden 
                truths – these deserve sanctuary.
              </p>
              <p>
                Snippet emerges from a reverence for the fleeting nature of inspiration. 
                Like the scribes of old who preserved wisdom on parchment, we offer a 
                modern sanctuary for your most treasured reflections.
              </p>
              <p>
                Each saved moment becomes part of your personal anthology – a collection 
                of thoughts that shaped you, moved you, and continue to guide your journey 
                through this extraordinary tapestry we call life.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div className="grid md:grid-cols-3 gap-8 mb-20" variants={containerVariants}>
          {[
            {
              title: "Cinematic Moments",
              description: "Capture the profound dialogues and scenes that linger in your thoughts long after the credits roll",
              color: "amber-700",
              bgColor: "amber-50",
              borderColor: "amber-300",
              icon: "🎭"
            },
            {
              title: "Spoken Wisdom",
              description: "Preserve those enlightening conversations and podcast revelations that spark new understanding",
              color: "stone-700",
              bgColor: "stone-50",
              borderColor: "stone-300",
              icon: "📻"
            },
            {
              title: "Personal Musings",
              description: "Document your own insights and the quiet epiphanies that emerge from daily contemplation",
              color: "amber-800",
              bgColor: "amber-50",
              borderColor: "amber-400",
              icon: "✍️"
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              className={`bg-${feature.bgColor}/60 backdrop-blur-sm rounded-xl p-8 border-2 border-${feature.borderColor}/40 hover:border-${feature.borderColor}/60 transition-all duration-300 relative`}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 10px 30px -10px rgba(120, 53, 15, 0.15)"
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {/* Vintage Corner Accent */}
              <div className={`absolute top-3 right-3 w-6 h-6 border-r border-t border-${feature.borderColor}/50`}></div>
              
              <motion.div 
                className="text-4xl mb-4 grayscale-0"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                {feature.icon}
              </motion.div>
              <h3 className={`text-2xl font-bold mb-4 text-${feature.color}`} style={{ fontFamily: 'Playfair Display, serif' }}>
                {feature.title}
              </h3>
              <p className="text-stone-600 leading-relaxed" style={{ fontFamily: 'Crimson Text, serif' }}>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Philosophy Section */}
        <motion.div className="text-center mb-16" variants={itemVariants}>
          <div className="bg-gradient-to-r from-stone-100/80 to-amber-50/80 backdrop-blur-sm rounded-2xl p-12 border-2 border-stone-300/40 relative">
            {/* Ornate Border Design */}
            <div className="absolute inset-4 border border-amber-300/30 rounded-xl"></div>
            
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-6 text-stone-800"
              style={{ fontFamily: 'Playfair Display, serif' }}
              whileHover={{ scale: 1.01 }}
            >
              Our Philosophy
            </motion.h2>
            <motion.p 
              className="text-xl text-stone-700 max-w-3xl mx-auto leading-relaxed mb-8"
              style={{ fontFamily: 'Crimson Text, serif' }}
              variants={itemVariants}
            >
              We believe that wisdom is not found in the accumulation of information, 
              but in the careful curation of moments that truly matter. Each reflection 
              you save becomes a thread in the rich tapestry of your intellectual and 
              emotional journey.
            </motion.p>
            
            <motion.div 
              className="mt-12"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <button className="bg-amber-700 hover:bg-amber-800 text-amber-50 font-bold py-4 px-12 rounded-lg text-lg shadow-lg transform transition-all duration-300 border-2 border-amber-600" style={{ fontFamily: 'Playfair Display, serif' }}>
                Begin Your Collection
              </button>
            </motion.div>
          </div>
        </motion.div>

        {/* Footer Quote */}
        <motion.div className="text-center mt-20" variants={itemVariants}>
          <div className="max-w-4xl mx-auto p-8 bg-stone-50/60 rounded-xl border border-stone-200/60">
            <motion.blockquote 
              className="text-2xl md:text-3xl italic text-stone-700 leading-relaxed"
              style={{ fontFamily: 'Playfair Display, serif' }}
              whileHover={{ scale: 1.01 }}
            >
              &quot;The real voyage of discovery consists not in seeking new landscapes, 
              but in having new eyes.&quot;
            </motion.blockquote>
            <div className="flex items-center justify-center mt-6">
              <div className="w-12 h-px bg-amber-400 mr-4"></div>
              <p className="text-stone-600 text-lg" style={{ fontFamily: 'Crimson Text, serif' }}>
                Marcel Proust
              </p>
              <div className="w-12 h-px bg-amber-400 ml-4"></div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SnippetAbout;