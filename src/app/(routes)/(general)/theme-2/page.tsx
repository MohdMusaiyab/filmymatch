// app/features/page.tsx
'use client';

import { motion } from 'framer-motion';
import { 
  Feather, 
  BookOpen, 
  PenTool, 
  Clock, 
  Users, 
  Shield, 
  Cloud, 
  TrendingUp,
  Star,
  Heart,
  ArrowRight,
  CheckCircle,
  Play,
  Github,
  Twitter,
  Linkedin,
  Crown,
  Gem
} from 'lucide-react';
import { useState } from 'react';

const VintageLandingPage = () => {
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

  const features = [
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Classical Editor",
      subtitle: "Timeless Writing Experience",
      description: "Experience the elegance of classical writing with our refined editor, featuring vintage-inspired themes and sophisticated typography.",
      color: "from-[#B6B09F] to-[#8B8578]",
      bgColor: "from-[#F2F2F2] to-[#EAE4D5]",
      accentColor: "#B6B09F"
    },
    {
      icon: <PenTool className="w-8 h-8" />,
      title: "Artistic Themes",
      subtitle: "Vintage Aesthetics",
      description: "Choose from our collection of handcrafted vintage themes, each designed with classical elegance and pastel beauty.",
      color: "from-[#9A9485] to-[#7A7465]",
      bgColor: "from-[#EAE4D5] to-[#D8D2C3]",
      accentColor: "#9A9485"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Timeless Performance",
      subtitle: "Classical Reliability",
      description: "Built with the reliability of classical engineering principles, ensuring smooth performance that stands the test of time.",
      color: "from-[#8B8578] to-[#6B6558]",
      bgColor: "from-[#D8D2C3] to-[#C6C0B1]",
      accentColor: "#8B8578"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Gentle Collaboration",
      subtitle: "Classical Teamwork",
      description: "Collaborate with your team in a refined, classical manner with our elegant collaboration tools and vintage-inspired interface.",
      color: "from-[#7A7465] to-[#5A5447]",
      bgColor: "from-[#C6C0B1] to-[#B4AE9F]",
      accentColor: "#7A7465"
    }
  ];

  const benefits = [
    "Handcrafted vintage-inspired themes",
    "Classical typography and spacing",
    "Timeless user interface design",
    "Gentle color palettes",
    "Elegant animations and transitions",
    "Sophisticated collaboration tools"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F2F2F2] via-[#EAE4D5] to-[#B6B09F]">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative pt-20 pb-32 overflow-hidden"
      >
        {/* Vintage Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 1000 1000">
            <defs>
              <pattern id="vintagePattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <circle cx="40" cy="40" r="2" fill="#B6B09F" fillOpacity="0.3" />
                <circle cx="20" cy="20" r="1" fill="#8B8578" fillOpacity="0.2" />
                <circle cx="60" cy="60" r="1" fill="#7A7465" fillOpacity="0.2" />
                <path d="M40,10 L50,20 L40,30 L30,20 Z" fill="#B6B09F" fillOpacity="0.1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#vintagePattern)" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 text-center">
          {/* Vintage Logo */}
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="inline-flex items-center justify-center w-28 h-28 mb-8 rounded-full bg-gradient-to-br from-[#B6B09F] via-[#9A9485] to-[#8B8578] border-4 border-[#7A7465] shadow-2xl relative"
          >
            <Crown className="text-[#F2F2F2] w-12 h-12" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#B6B09F]/20 via-[#9A9485]/20 to-[#8B8578]/20 animate-pulse"></div>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-6xl md:text-7xl font-serif font-bold bg-gradient-to-r from-[#000000] via-[#2A2A2A] to-[#4A4A4A] bg-clip-text text-transparent mb-6 leading-tight"
          >
            Snippet
          </motion.h1>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="w-40 h-2 bg-gradient-to-r from-[#B6B09F] via-[#9A9485] to-[#8B8578] mx-auto mb-8 rounded-full"
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-2xl font-serif text-[#2A2A2A] italic max-w-3xl mx-auto leading-relaxed mb-8"
          >
            "Where classical elegance meets modern functionality. A timeless experience for the discerning developer."
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="group px-8 py-4 bg-gradient-to-r from-[#B6B09F] to-[#8B8578] text-[#F2F2F2] font-serif font-semibold text-lg rounded-full hover:shadow-2xl transition-all duration-300 flex items-center gap-3 border-2 border-[#9A9485]"
            >
              <Play className="w-5 h-5" />
              Begin Your Journey
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 border-2 border-[#B6B09F] text-[#2A2A2A] font-serif font-semibold text-lg rounded-full hover:bg-[#EAE4D5] transition-all duration-300 flex items-center gap-3"
            >
              <Github className="w-5 h-5" />
              Explore on GitHub
            </motion.button>
          </motion.div>

          {/* Vintage Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            className="mt-16 flex flex-wrap justify-center gap-8 text-center"
          >
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-[#B6B09F] fill-current" />
              <span className="text-[#2A2A2A] font-serif">Classical Excellence</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#9A9485]" />
              <span className="text-[#2A2A2A] font-serif">Timeless Design</span>
            </div>
            <div className="flex items-center gap-2">
              <Gem className="w-5 h-5 text-[#8B8578]" />
              <span className="text-[#2A2A2A] font-serif">Vintage Craftsmanship</span>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        variants={container}
        initial="hidden"
        animate="visible"
        className="relative max-w-7xl mx-auto px-4 pb-20"
      >
        <motion.div variants={fadeInUp} className="text-center mb-16">
          <h2 className="text-5xl font-serif font-bold text-[#000000] mb-4">
            Classical Features
          </h2>
          <div className="w-32 h-1 bg-gradient-to-r from-[#B6B09F] to-[#8B8578] mx-auto mb-6"></div>
          <p className="text-xl text-[#2A2A2A] max-w-2xl mx-auto font-serif">
            Each feature crafted with the precision and elegance of classical design principles
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid lg:grid-cols-2 gap-8 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={scaleIn}
              whileHover={{ scale: 1.02, y: -5 }}
              onHoverStart={() => setActiveFeature(index)}
              className={`group relative p-8 rounded-2xl bg-gradient-to-br ${feature.bgColor} border-2 border-[#B6B09F] shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer`}
            >
              {/* Decorative Background */}
              <div className="absolute top-0 right-0 w-32 h-32 -translate-y-16 translate-x-16 opacity-10 group-hover:opacity-20 transition-opacity">
                <div className={`w-full h-full rounded-full bg-gradient-to-br ${feature.color}`}></div>
              </div>
              
              {/* Ornate Corner Decorations */}
              <div className="absolute top-4 left-4 w-8 h-8">
                <svg viewBox="0 0 50 50" className="w-full h-full text-[#B6B09F]/30">
                  <path d="M5,5 L20,5 Q5,5 5,20 L5,5 Z M30,5 L45,5 Q45,5 45,20 L45,5 Z" fill="currentColor" />
                </svg>
              </div>

              <div className="relative">
                <motion.div 
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  className={`inline-flex items-center justify-center w-16 h-16 mb-6 rounded-xl bg-gradient-to-br ${feature.color} text-[#F2F2F2] shadow-lg`}
                >
                  {feature.icon}
                </motion.div>

                <h3 className="text-3xl font-serif font-bold text-[#000000] mb-2">
                  {feature.title}
                </h3>
                
                <p className="text-[#2A2A2A] font-medium mb-4 italic font-serif">
                  {feature.subtitle}
                </p>
                
                <p className="text-[#2A2A2A] leading-relaxed text-lg font-serif">
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

        {/* Benefits Section */}
        <motion.div variants={fadeInUp} className="relative">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-serif font-bold text-[#000000] mb-4">
              Timeless Benefits
            </h3>
            <p className="text-lg text-[#2A2A2A] font-serif">
              Experience the enduring qualities of classical design
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                whileHover={{ y: -8, scale: 1.05 }}
                className="group p-6 bg-[#F2F2F2]/80 backdrop-blur-sm rounded-xl border-2 border-[#B6B09F] shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#EAE4D5]/50 to-[#B6B09F]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-[#B6B09F] mt-1 flex-shrink-0" />
                  <p className="text-[#2A2A2A] leading-relaxed font-serif">
                    {benefit}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Classical CTA Section */}
        <motion.div
          variants={fadeInUp}
          className="mt-20 relative p-12 bg-gradient-to-br from-[#EAE4D5] via-[#D8D2C3] to-[#B6B09F] rounded-3xl border-2 border-[#B6B09F] shadow-2xl text-center overflow-hidden"
        >
          {/* Decorative Pattern */}
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
              className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-[#B6B09F] to-[#8B8578] shadow-xl"
            >
              <Crown className="text-[#F2F2F2] w-10 h-10" />
            </motion.div>

            <h3 className="text-4xl font-serif font-bold text-[#000000] mb-4">
              Experience Classical Elegance
            </h3>
            
            <p className="text-xl text-[#2A2A2A] mb-8 max-w-3xl mx-auto leading-relaxed font-serif">
              Join the distinguished community of developers who appreciate the timeless beauty of classical design. 
              Every feature crafted with the precision and elegance of bygone eras.
            </p>
            
            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="group relative px-12 py-4 bg-gradient-to-r from-[#B6B09F] via-[#9A9485] to-[#8B8578] text-[#F2F2F2] font-serif font-semibold text-lg rounded-full hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-[#9A9485]"
            >
              <span className="relative z-10 flex items-center gap-3">
                <Heart className="w-5 h-5" />
                Begin Your Classical Journey
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </motion.button>
          </div>
        </motion.div>
      </motion.section>

      {/* Classical Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        className="relative py-16 bg-gradient-to-r from-[#2A2A2A] via-[#000000] to-[#2A2A2A] text-[#F2F2F2] overflow-hidden"
      >
        {/* Ornate Top Border */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#B6B09F] via-[#9A9485] to-[#8B8578]"></div>
        
        {/* Classical Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 1000 300" className="w-full h-full">
            <defs>
              <pattern id="footerClassical" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="8" fill="none" stroke="currentColor" strokeWidth="1" />
                <circle cx="30" cy="30" r="3" fill="currentColor" />
                <path d="M30,10 L35,15 L30,20 L25,15 Z" fill="currentColor" fillOpacity="0.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#footerClassical)" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-8">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#B6B09F] to-[#8B8578] flex items-center justify-center mr-4">
              <Crown className="text-[#F2F2F2] w-6 h-6" />
            </div>
            <span className="text-4xl font-serif font-bold">Snippet</span>
          </div>
          
          <div className="w-48 h-1 bg-gradient-to-r from-transparent via-[#B6B09F] via-[#9A9485] via-[#8B8578] to-transparent mx-auto mb-8"></div>
          
          <p className="text-xl mb-4 font-serif">
            © {new Date().getFullYear()} Snippet Classical Collection — Crafted with Timeless Elegance
          </p>
          <p className="text-[#B6B09F] italic text-lg mb-8 font-serif">
            "Where classical beauty meets modern functionality"
          </p>

          {/* Social Links */}
          <div className="flex justify-center gap-6">
            <motion.a
              whileHover={{ scale: 1.1, y: -2 }}
              href="#"
              className="p-3 rounded-full bg-[#2A2A2A] hover:bg-[#B6B09F] transition-colors duration-300"
            >
              <Github className="w-5 h-5" />
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.1, y: -2 }}
              href="#"
              className="p-3 rounded-full bg-[#2A2A2A] hover:bg-[#B6B09F] transition-colors duration-300"
            >
              <Twitter className="w-5 h-5" />
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.1, y: -2 }}
              href="#"
              className="p-3 rounded-full bg-[#2A2A2A] hover:bg-[#B6B09F] transition-colors duration-300"
            >
              <Linkedin className="w-5 h-5" />
            </motion.a>
          </div>
        </div>
      </motion.footer>
    </div>
  );    
};

export default VintageLandingPage;
