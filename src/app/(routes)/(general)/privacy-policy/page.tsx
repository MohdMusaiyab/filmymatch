// app/privacy-policy/page.tsx
'use client';

import { motion } from 'framer-motion';
import { FiFeather, FiLock, FiHeart, FiEye, FiMail, FiShield } from 'react-icons/fi';

const PrivacyPolicy = () => {
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

  const item = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const floatingElement = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        duration: 1.2,
        ease: "easeOut",
        delay: 0.5
      }
    }
  };

  const sections = [
    {
      icon: <FiFeather className="text-amber-800" size={28} />,
      title: "Natural Data Practices",
      content: "We cultivate data relationships like a well-tended garden - with care, respect, and transparency. Our collection practices are minimal, intentional, and designed to help your experience blossom.",
      gradient: "from-amber-50 to-orange-50"
    },
    {
      icon: <FiLock className="text-emerald-700" size={28} />,
      title: "Secure Ecosystem",
      content: "Your information rests in our protected digital greenhouse. We employ layered security measures including end-to-end encryption, regular audits, and strict access controls to maintain a healthy data environment.",
      gradient: "from-emerald-50 to-teal-50"
    },
    {
      icon: <FiHeart className="text-rose-700" size={28} />,
      title: "Ethical Sharing",
      content: "Like sharing cuttings from a prized plant, we only work with trusted partners who meet our high standards. Any data sharing is limited, purposeful, and governed by strict agreements.",
      gradient: "from-rose-50 to-pink-50"
    },
    {
      icon: <FiEye className="text-blue-700" size={28} />,
      title: "Transparency",
      content: "We believe in clear visibility like sunlight through leaves. You'll always know what data we collect, why we need it, and how it's used. No hidden processes in shady corners.",
      gradient: "from-blue-50 to-indigo-50"
    },
    {
      icon: <FiMail className="text-violet-700" size={28} />,
      title: "Your Control",
      content: "You're the gardener of your own data. Access, correct, or delete your information anytime through your account settings. We'll provide the tools to help your privacy preferences grow.",
      gradient: "from-violet-50 to-purple-50"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Enhanced Organic SVG Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute top-0 left-0 w-full h-full opacity-30" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor:"#f59e0b", stopOpacity:0.1}} />
              <stop offset="100%" style={{stopColor:"#d97706", stopOpacity:0.05}} />
            </linearGradient>
            <filter id="blur">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2"/>
            </filter>
          </defs>
          
          {/* Flowing organic paths */}
          <path d="M200,100 Q300,50 400,150 T600,100 T800,200" stroke="url(#grad1)" fill="none" strokeWidth="3" filter="url(#blur)" />
          <path d="M100,300 Q200,250 300,350 T500,300 T700,400" stroke="#d97706" fill="none" strokeWidth="2" strokeOpacity="0.2" />
          <path d="M300,500 Q400,450 500,550 T700,500 T900,600" stroke="#f59e0b" fill="none" strokeWidth="2" strokeOpacity="0.15" />
          
          {/* Floating organic shapes */}
          <circle cx="150" cy="200" r="8" fill="#f59e0b" fillOpacity="0.1" />
          <circle cx="850" cy="300" r="12" fill="#d97706" fillOpacity="0.08" />
          <circle cx="200" cy="700" r="6" fill="#ea580c" fillOpacity="0.12" />
          <circle cx="750" cy="150" r="10" fill="#f59e0b" fillOpacity="0.09" />
        </svg>
      </div>

      {/* Header with Enhanced Design */}
      <motion.header 
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative pt-32 pb-24 px-4 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-amber-100/40 via-orange-100/30 to-rose-100/40"></div>
        
        {/* Enhanced organic header shape */}
        <svg 
          className="absolute top-0 left-0 w-full h-full opacity-15"
          viewBox="0 0 1000 500"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor:"#a38f78", stopOpacity:0.3}} />
              <stop offset="50%" style={{stopColor:"#d97706", stopOpacity:0.2}} />
              <stop offset="100%" style={{stopColor:"#ea580c", stopOpacity:0.1}} />
            </linearGradient>
          </defs>
          <path 
            d="M0,100 C150,200 350,0 500,100 C650,200 850,0 1000,100 L1000,0 L0,0 Z" 
            fill="url(#headerGrad)"
          />
        </svg>

        {/* Floating decorative elements */}
        <motion.div
          variants={floatingElement}
          initial="hidden"
          animate="visible"
          className="absolute top-20 right-10 w-16 h-16 rounded-full bg-gradient-to-br from-amber-200/30 to-orange-300/20 blur-sm"
        />
        <motion.div
          variants={floatingElement}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.7 }}
          className="absolute bottom-10 left-10 w-12 h-12 rounded-full bg-gradient-to-br from-rose-200/40 to-pink-300/30 blur-sm"
        />

        <div className="relative max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-amber-200 to-orange-200 shadow-lg"
          >
            <FiShield className="text-amber-800" size={32} />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-6xl md:text-7xl font-serif font-bold bg-gradient-to-br from-amber-800 via-orange-700 to-amber-900 bg-clip-text text-transparent mb-6 leading-tight"
          >
            Our Privacy Promise
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-2xl text-amber-800/80 max-w-3xl mx-auto font-medium"
          >
            Crafted with care, designed for trust
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-8 inline-block px-6 py-2 rounded-full bg-white/50 backdrop-blur-sm border border-amber-200/50"
          >
            <span className="text-amber-700 font-medium">Protected • Transparent • Ethical</span>
          </motion.div>
        </div>
      </motion.header>

      {/* Enhanced Main Content */}
      <motion.main 
        variants={container}
        initial="hidden"
        animate="visible"
        className="relative max-w-5xl mx-auto px-4 pb-32 z-10"
      >
        {/* Enhanced decorative SVG */}
        <motion.svg 
          initial={{ opacity: 0, rotate: -10 }}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{ delay: 1, duration: 1.2 }}
          className="absolute -top-24 left-1/2 -translate-x-1/2 -z-10"
          width="300" 
          height="300" 
          viewBox="0 0 300 300"
        >
          <defs>
            <radialGradient id="centerGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" style={{stopColor:"#fbbf24", stopOpacity:0.2}} />
              <stop offset="100%" style={{stopColor:"#f59e0b", stopOpacity:0.05}} />
            </radialGradient>
          </defs>
          <path 
            d="M150,30 C180,60 270,90 270,150 C270,210 180,240 150,270 C120,240 30,210 30,150 C30,90 120,60 150,30 Z" 
            fill="url(#centerGrad)"
            className="animate-pulse"
          />
        </motion.svg>

        <div className="grid gap-8">
          {sections.map((section, index) => (
            <motion.article 
              key={index}
              variants={item}
              whileHover={{ 
                scale: 1.02, 
                transition: { duration: 0.2 } 
              }}
              className={`group relative p-10 bg-gradient-to-br ${section.gradient} backdrop-blur-sm rounded-2xl border-2 border-white/50 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden`}
            >
              {/* Card background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500" />
              
              <div className="relative flex items-start">
                <motion.div 
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  className="flex-shrink-0 p-4 mr-8 rounded-2xl bg-white/70 shadow-md group-hover:shadow-lg transition-all duration-300"
                >
                  {section.icon}
                </motion.div>
                <div className="flex-1">
                  <h2 className="text-3xl font-serif font-bold text-gray-800 mb-4 group-hover:text-gray-900 transition-colors">
                    {section.title}
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-lg font-medium">
                    {section.content}
                  </p>
                </div>
              </div>

              {/* Hover effect decoration */}
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-20"
              />
            </motion.article>
          ))}
        </div>

        {/* Enhanced Contact CTA */}
        <motion.div
          variants={item}
          className="mt-20 relative p-12 bg-gradient-to-br from-amber-100 via-orange-100 to-rose-100 rounded-3xl border-2 border-white/60 shadow-xl text-center overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <svg viewBox="0 0 400 400" className="w-full h-full">
              <defs>
                <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="20" cy="20" r="2" fill="currentColor" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dots)" />
            </svg>
          </div>

          <div className="relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.5, duration: 0.6 }}
              className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 shadow-lg"
            >
              <FiMail className="text-white" size={24} />
            </motion.div>

            <h3 className="text-4xl font-serif font-bold text-gray-800 mb-6">
              Questions About Your Data?
            </h3>
            <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
              Our dedicated privacy team is here to help you understand exactly how we protect and use your information. Reach out anytime.
            </p>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative px-12 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-full hover:from-amber-700 hover:to-orange-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl overflow-hidden"
            >
              <span className="relative z-10">Contact Our Privacy Team</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </motion.button>
          </div>
        </motion.div>
      </motion.main>

      {/* Enhanced Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="relative py-12 bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 text-amber-100 overflow-hidden"
      >
        {/* Footer background decoration */}
        <div className="absolute inset-0 opacity-5">
          <svg viewBox="0 0 1000 200" className="w-full h-full">
            <path d="M0,100 Q250,50 500,100 T1000,100 V200 H0 Z" fill="currentColor" />
          </svg>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mr-3">
              <FiShield className="text-white" size={16} />
            </div>
            <span className="text-2xl font-serif font-bold">Snippet</span>
          </div>
          
          <p className="text-lg mb-2">© {new Date().getFullYear()} Snippet. All rights reserved.</p>
          <p className="text-amber-200/80">
            Last updated: {new Date().toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </p>
          
          <div className="mt-6 flex items-center justify-center space-x-6">
            <a href="#" className="text-amber-200/60 hover:text-amber-200 transition-colors">Terms of Service</a>
            <span className="text-amber-200/40">•</span>
            <a href="#" className="text-amber-200/60 hover:text-amber-200 transition-colors">Cookie Policy</a>
            <span className="text-amber-200/40">•</span>
            <a href="#" className="text-amber-200/60 hover:text-amber-200 transition-colors">Data Protection</a>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

export default PrivacyPolicy;