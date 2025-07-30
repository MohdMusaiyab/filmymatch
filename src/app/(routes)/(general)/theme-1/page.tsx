// app/features/page.tsx
'use client';

import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Code, 
  Palette, 
  Zap, 
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
  Linkedin
} from 'lucide-react';
import { useState } from 'react';

const LandingPage = () => {
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
      icon: <Code className="w-8 h-8" />,
      title: "Clean Code Editor",
      subtitle: "Write with Elegance",
      description: "Experience the most refined code editing experience with syntax highlighting, intelligent autocomplete, and seamless collaboration.",
      color: "from-emerald-400 to-teal-500",
      bgColor: "from-emerald-50 to-teal-50",
      accentColor: "emerald-600"
    },
    {
      icon: <Palette className="w-8 h-8" />,
      title: "Beautiful Themes",
      subtitle: "Customize Your Space",
      description: "Choose from our curated collection of vintage-inspired themes or create your own with our intuitive theme builder.",
      color: "from-rose-400 to-pink-500",
      bgColor: "from-rose-50 to-pink-50",
      accentColor: "rose-600"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast",
      subtitle: "Performance First",
      description: "Built for speed and efficiency. Every keystroke is instant, every action smooth, every moment productive.",
      color: "from-amber-400 to-orange-500",
      bgColor: "from-amber-50 to-orange-50",
      accentColor: "amber-600"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Team Collaboration",
      subtitle: "Code Together",
      description: "Real-time collaboration with your team. Share, review, and build together with built-in version control.",
      color: "from-violet-400 to-purple-500",
      bgColor: "from-violet-50 to-purple-50",
      accentColor: "violet-600"
    }
  ];

  const benefits = [
    "Intuitive interface designed for developers",
    "Built-in Git integration",
    "Extensive plugin ecosystem",
    "Cross-platform compatibility",
    "Regular updates and improvements",
    "Active community support"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative pt-20 pb-32 overflow-hidden"
      >
        {/* Vintage Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <svg className="w-full h-full" viewBox="0 0 1000 1000">
            <defs>
              <pattern id="vintagePattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="1" fill="#10b981" fillOpacity="0.3" />
                <circle cx="15" cy="15" r="0.5" fill="#f59e0b" fillOpacity="0.2" />
                <circle cx="45" cy="45" r="0.5" fill="#8b5cf6" fillOpacity="0.2" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#vintagePattern)" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 text-center">
          {/* Logo */}
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="inline-flex items-center justify-center w-24 h-24 mb-8 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 shadow-2xl"
          >
            <Code className="text-white w-12 h-12" />
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-slate-800 via-emerald-700 to-teal-700 bg-clip-text text-transparent mb-6 leading-tight"
          >
            Snippet
          </motion.h1>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="w-32 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 mx-auto mb-8 rounded-full"
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-8"
          >
            The elegant code editor for modern developers. Write, collaborate, and create with style.
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
              className="group px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-lg rounded-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3"
            >
              <Play className="w-5 h-5" />
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 border-2 border-slate-300 text-slate-700 font-semibold text-lg rounded-xl hover:border-emerald-500 hover:text-emerald-600 transition-all duration-300 flex items-center gap-3"
            >
              <Github className="w-5 h-5" />
              View on GitHub
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            className="mt-16 flex flex-wrap justify-center gap-8 text-center"
          >
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-current" />
              <span className="text-slate-600">4.9/5 Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-500" />
              <span className="text-slate-600">10K+ Users</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-violet-500" />
              <span className="text-slate-600">Lightning Fast</span>
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
          <h2 className="text-5xl font-bold text-slate-800 mb-4">
            Why Choose Snippet?
          </h2>
          <div className="w-32 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto mb-6"></div>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Built with developers in mind, featuring everything you need for modern development
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
              className={`group relative p-8 rounded-2xl bg-gradient-to-br ${feature.bgColor} border border-slate-200 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer`}
            >
              {/* Decorative Background */}
              <div className="absolute top-0 right-0 w-32 h-32 -translate-y-16 translate-x-16 opacity-10 group-hover:opacity-20 transition-opacity">
                <div className={`w-full h-full rounded-full bg-gradient-to-br ${feature.color}`}></div>
              </div>
              
              <div className="relative">
                <motion.div 
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  className={`inline-flex items-center justify-center w-16 h-16 mb-6 rounded-xl bg-gradient-to-br ${feature.color} text-white shadow-lg`}
                >
                  {feature.icon}
                </motion.div>

                <h3 className="text-3xl font-bold text-slate-800 mb-2">
                  {feature.title}
                </h3>
                
                <p className={`text-${feature.accentColor} font-medium mb-4`}>
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

        {/* Benefits Section */}
        <motion.div variants={fadeInUp} className="relative">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-slate-800 mb-4">
              Everything You Need
            </h3>
            <p className="text-lg text-slate-600">
              Powerful features that make development a joy
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                whileHover={{ y: -8, scale: 1.05 }}
                className="group p-6 bg-white rounded-xl border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-emerald-500 mt-1 flex-shrink-0" />
                  <p className="text-slate-700 leading-relaxed">
                    {benefit}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          variants={fadeInUp}
          className="mt-20 relative p-12 bg-gradient-to-br from-slate-100 via-emerald-50 to-teal-50 rounded-3xl border border-slate-200 shadow-2xl text-center overflow-hidden"
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
              className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 shadow-xl"
            >
              <Sparkles className="text-white w-10 h-10" />
            </motion.div>

            <h3 className="text-4xl font-bold text-slate-800 mb-4">
              Ready to Get Started?
            </h3>
            
            <p className="text-xl text-slate-700 mb-8 max-w-3xl mx-auto leading-relaxed">
              Join thousands of developers who have already discovered the joy of coding with Snippet. 
              Start your journey today and experience the difference.
            </p>
            
            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="group relative px-12 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-lg rounded-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-3">
                <Heart className="w-5 h-5" />
                Start Coding Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </motion.button>
          </div>
        </motion.div>
      </motion.section>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        className="relative py-16 bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 text-slate-100 overflow-hidden"
      >
        {/* Top Border */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400"></div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 1000 300" className="w-full h-full">
            <defs>
              <pattern id="footerPattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="8" fill="none" stroke="currentColor" strokeWidth="1" />
                <circle cx="30" cy="30" r="3" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#footerPattern)" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center mr-4">
              <Code className="text-white w-6 h-6" />
            </div>
            <span className="text-4xl font-bold">Snippet</span>
          </div>
          
          <div className="w-48 h-1 bg-gradient-to-r from-transparent via-emerald-400 via-teal-400 via-cyan-400 to-transparent mx-auto mb-8"></div>
          
          <p className="text-xl mb-4">
            © {new Date().getFullYear()} Snippet — Crafted with ❤️ for developers
          </p>
          <p className="text-slate-300 italic text-lg mb-8">
            "Where elegance meets functionality"
          </p>

          {/* Social Links */}
          <div className="flex justify-center gap-6">
            <motion.a
              whileHover={{ scale: 1.1, y: -2 }}
              href="#"
              className="p-3 rounded-full bg-slate-700 hover:bg-emerald-600 transition-colors duration-300"
            >
              <Github className="w-5 h-5" />
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.1, y: -2 }}
              href="#"
              className="p-3 rounded-full bg-slate-700 hover:bg-emerald-600 transition-colors duration-300"
            >
              <Twitter className="w-5 h-5" />
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.1, y: -2 }}
              href="#"
              className="p-3 rounded-full bg-slate-700 hover:bg-emerald-600 transition-colors duration-300"
            >
              <Linkedin className="w-5 h-5" />
            </motion.a>
          </div>
        </div>
      </motion.footer>
    </div>
  );    
};

export default LandingPage;