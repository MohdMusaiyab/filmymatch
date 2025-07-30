// app/features/page.tsx
'use client';

import { motion } from 'framer-motion';
import { 
  FiEdit3, 
  FiShare2, 
  FiLayers, 
  FiZap, 
  FiUsers, 
  FiShield, 
  FiCloud, 
  FiTrendingUp,
  FiStar,
  FiHeart,
  FiFrown
} from 'react-icons/fi';
import { useState } from 'react';

const FeaturesPage = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const fadeInUp = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  const scaleIn = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1
    }
  };

  const mainFeatures = [
    {
      icon: <FiEdit3 size={32} />,
      title: "Eloquent Editor",
      subtitle: "Compose with Grace",
      description: "Our sophisticated text editor provides a refined writing experience with intelligent suggestions, elegant formatting options, and seamless collaboration tools.",
      color: "from-blue-400 to-indigo-500",
      bgColor: "from-blue-50 to-indigo-100",
      accentColor: "blue-600"
    },
    {
      icon: <FiShare2 size={32} />,
      title: "Social Harmony",
      subtitle: "Share & Connect",
      description: "Effortlessly share your creations across platforms with our integrated social tools. Build connections and engage with your audience in meaningful ways.",
      color: "from-pink-400 to-rose-500",
      bgColor: "from-pink-50 to-rose-100",
      accentColor: "pink-600"
    },
    {
      icon: <FiLayers size={32} />,
      title: "Organized Elegance",
      subtitle: "Structure & Flow",
      description: "Organize your content with our intuitive layering system. Create hierarchies, manage projects, and maintain perfect structure in all your work.",
      color: "from-purple-400 to-violet-500",
      bgColor: "from-purple-50 to-violet-100",
      accentColor: "purple-600"
    },
    {
      icon: <FiZap size={32} />,
      title: "Lightning Performance",
      subtitle: "Speed & Efficiency",
      description: "Experience blazing-fast performance with our optimized engine. Every action is smooth, every response instant, every moment productive.",
      color: "from-cyan-400 to-teal-500",
      bgColor: "from-cyan-50 to-teal-100",
      accentColor: "cyan-600"
    }
  ];

  const additionalFeatures = [
    {
      icon: <FiUsers className="text-blue-600" size={24} />,
      title: "Team Collaboration",
      description: "Work together seamlessly with real-time collaboration tools"
    },
    {
      icon: <FiShield className="text-pink-600" size={24} />,
      title: "Enterprise Security",
      description: "Bank-level security with end-to-end encryption"
    },
    {
      icon: <FiCloud className="text-purple-600" size={24} />,
      title: "Cloud Synchronization",
      description: "Access your work anywhere with seamless cloud sync"
    },
    {
      icon: <FiTrendingUp className="text-cyan-600" size={24} />,
      title: "Analytics & Insights",
      description: "Gain valuable insights with comprehensive analytics"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Elegant Background Pattern */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 1000 1000">
          <defs>
            <pattern id="elegantPattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <circle cx="50" cy="50" r="2" fill="#6366f1" fillOpacity="0.3" />
              <circle cx="25" cy="25" r="1" fill="#ec4899" fillOpacity="0.2" />
              <circle cx="75" cy="75" r="1" fill="#8b5cf6" fillOpacity="0.2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#elegantPattern)" />
        </svg>
      </div>

      {/* Regal Header */}
      <motion.header 
        initial={{ opacity: 0, y: -60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="relative pt-24 pb-20 overflow-hidden"
      >
        {/* Ornate Border */}
        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-blue-500 via-pink-500 via-purple-500 to-cyan-500"></div>
        
        {/* Classical Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-100/30 via-pink-50/20 to-purple-100/30"></div>
        
        {/* Decorative Flourishes */}
        <motion.svg 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="absolute top-16 left-8 w-20 h-20 text-blue-300/40" 
          viewBox="0 0 100 100"
        >
          <path d="M50,10 C60,20 80,30 70,50 C80,70 60,80 50,90 C40,80 20,70 30,50 C20,30 40,20 50,10 Z" fill="currentColor" />
          <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="2" />
        </motion.svg>
        
        <motion.svg 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, duration: 1 }}
          className="absolute top-16 right-8 w-20 h-20 text-pink-300/40" 
          viewBox="0 0 100 100"
        >
          <path d="M50,10 C60,20 80,30 70,50 C80,70 60,80 50,90 C40,80 20,70 30,50 C20,30 40,20 50,10 Z" fill="currentColor" />
          <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="2" />
        </motion.svg>

        <div className="relative max-w-7xl mx-auto px-4 text-center">
          {/* Royal Crown Icon */}
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="inline-flex items-center justify-center w-28 h-28 mb-8 rounded-full bg-gradient-to-br from-blue-200 via-pink-200 to-purple-200 border-4 border-white shadow-xl relative"
          >
            <FiFrown className="text-indigo-700" size={40} />
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 via-pink-400/20 to-purple-400/20 animate-pulse"></div>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-7xl md:text-8xl font-serif font-bold bg-gradient-to-r from-indigo-700 via-pink-600 to-purple-700 bg-clip-text text-transparent mb-6 leading-tight"
          >
            Royal Features
          </motion.h1>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="w-40 h-2 bg-gradient-to-r from-blue-500 via-pink-500 to-purple-500 mx-auto mb-8 rounded-full"
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-2xl font-serif text-slate-700 italic max-w-3xl mx-auto leading-relaxed"
          >
            "Discover the aristocracy of functionality, where each feature is crafted with the finest attention to detail"
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="mt-8 flex items-center justify-center gap-4"
          >
            <FiStar className="text-blue-500" size={20} />
            <span className="text-slate-600 font-medium">Premium Experience</span>
            <FiStar className="text-pink-500" size={20} />
            <span className="text-slate-600 font-medium">Elegant Design</span>
            <FiStar className="text-purple-500" size={20} />
          </motion.div>
        </div>
      </motion.header>

      {/* Main Features Showcase */}
      <motion.section 
        variants={container}
        initial="hidden"
        animate="visible"
        className="relative max-w-7xl mx-auto px-4 pb-20"
      >
        <motion.div variants={fadeInUp} className="text-center mb-16">
          <h2 className="text-5xl font-serif font-bold text-slate-800 mb-4">
            Signature Features
          </h2>
          <div className="w-32 h-1 bg-gradient-to-r from-blue-500 via-pink-500 to-purple-500 mx-auto mb-6"></div>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Each feature designed with aristocratic precision and modern elegance
          </p>
        </motion.div>

        {/* Interactive Feature Cards */}
        <div className="grid lg:grid-cols-2 gap-8 mb-20">
          {mainFeatures.map((feature, index) => (
            <motion.div
              key={index}
              variants={scaleIn}
              whileHover={{ scale: 1.02, y: -5 }}
              onHoverStart={() => setActiveFeature(index)}
              className={`group relative p-8 rounded-2xl bg-gradient-to-br ${feature.bgColor} border-2 border-white/50 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer`}
            >
              {/* Decorative Background Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 -translate-y-16 translate-x-16 opacity-10 group-hover:opacity-20 transition-opacity">
                <div className={`w-full h-full rounded-full bg-gradient-to-br ${feature.color}`}></div>
              </div>
              
              {/* Ornate Corner Decorations */}
              <div className="absolute top-4 left-4 w-8 h-8">
                <svg viewBox="0 0 50 50" className={`w-full h-full text-${feature.accentColor}/30`}>
                  <path d="M5,5 L20,5 Q5,5 5,20 L5,5 Z M30,5 L45,5 Q45,5 45,20 L45,5 Z" fill="currentColor" />
                </svg>
              </div>

              <div className="relative">
                <motion.div 
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  className={`inline-flex items-center justify-center w-16 h-16 mb-6 rounded-xl bg-gradient-to-br ${feature.color} text-white shadow-lg`}
                >
                  {feature.icon}
                </motion.div>

                <h3 className="text-3xl font-serif font-bold text-slate-800 mb-2">
                  {feature.title}
                </h3>
                
                <p className={`text-${feature.accentColor} font-medium mb-4 italic`}>
                  {feature.subtitle}
                </p>
                
                <p className="text-slate-700 leading-relaxed text-lg">
                  {feature.description}
                </p>

                {/* Hover Effect Indicator */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: activeFeature === index ? '100%' : '0%' }}
                  className={`mt-6 h-1 bg-gradient-to-r ${feature.color} rounded-full transition-all duration-300`}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Features Grid */}
        <motion.div variants={fadeInUp} className="relative">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-serif font-bold text-slate-800 mb-4">
              Additional Refinements
            </h3>
            <p className="text-lg text-slate-600">
              More exquisite features to enhance your experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalFeatures.map((feature, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                whileHover={{ y: -8, scale: 1.05 }}
                className="group p-6 bg-white/70 backdrop-blur-sm rounded-xl border-2 border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 text-center relative overflow-hidden"
              >
                {/* Background Gradient Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-pink-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-slate-100 group-hover:bg-white shadow-md"
                  >
                    {feature.icon}
                  </motion.div>
                  
                  <h4 className="text-xl font-serif font-bold text-slate-800 mb-3">
                    {feature.title}
                  </h4>
                  
                  <p className="text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Elegant CTA Section */}
        <motion.div
          variants={fadeInUp}
          className="mt-20 relative p-12 bg-gradient-to-br from-slate-100 via-blue-100 to-purple-100 rounded-3xl border-2 border-white/60 shadow-2xl text-center overflow-hidden"
        >
          {/* Decorative Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <defs>
                <pattern id="ctaPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M20,5 L35,20 L20,35 L5,20 Z" fill="currentColor" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#ctaPattern)" />
            </svg>
          </div>

          <div className="relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 2, duration: 0.8 }}
              className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-blue-400 via-pink-400 to-purple-400 shadow-xl"
            >
              <FiStar className="text-white" size={32} />
            </motion.div>

            <h3 className="text-4xl font-serif font-bold text-slate-800 mb-4">
              Experience Royal Treatment
            </h3>
            
            <p className="text-xl text-slate-700 mb-8 max-w-3xl mx-auto leading-relaxed">
              Join the aristocracy of users who demand nothing but the finest. 
              Every feature crafted with meticulous attention to detail and elegant sophistication.
            </p>
            
            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="group relative px-12 py-4 bg-gradient-to-r from-indigo-600 via-pink-600 to-purple-600 text-white font-serif font-semibold text-lg rounded-full hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-3">
                <FiHeart size={20} />
                Begin Your Journey
                <FiStar size={20} />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </motion.button>
          </div>
        </motion.div>
      </motion.section>

      {/* Aristocratic Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        className="relative py-16 bg-gradient-to-r from-slate-800 via-indigo-900 to-purple-900 text-slate-100 overflow-hidden"
      >
        {/* Ornate Top Border */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 via-pink-400 to-purple-400"></div>
        
        {/* Elegant Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 1000 300" className="w-full h-full">
            <defs>
              <pattern id="footerElegant" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="8" fill="none" stroke="currentColor" strokeWidth="1" />
                <circle cx="30" cy="30" r="3" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#footerElegant)" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-8">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 via-pink-400 to-purple-400 flex items-center justify-center mr-4">
              <FiFrown className="text-white" size={24} />
            </div>
            <span className="text-4xl font-serif font-bold">Snippet</span>
          </div>
          
          <div className="w-48 h-1 bg-gradient-to-r from-transparent via-blue-400 via-pink-400 via-purple-400 to-transparent mx-auto mb-8"></div>
          
          <p className="text-xl mb-4 font-serif">
            © {new Date().getFullYear()} Snippet Royal Collection — Crafted with Distinction
          </p>
          <p className="text-slate-300 italic text-lg">
            "Where elegance meets innovation"
          </p>
        </div>
      </motion.footer>
    </div>
  );    
};

export default FeaturesPage;