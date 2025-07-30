// app/contact/page.tsx
'use client';

import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin, FiClock, FiFeather, FiSend } from 'react-icons/fi';
import { useState } from 'react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const fadeInUp = {
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    // Reset form after demo
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitted(false);
    }, 3000);
  };

  const contactInfo = [
    {
      icon: <FiMail size={24} />,
      title: "Correspondence",
      details: ["hello@snippet.co", "support@snippet.co"],
      subtitle: "Drop us a line"
    },
    {
      icon: <FiPhone size={24} />,
      title: "Telephone",
      details: ["+1 (555) 123-4567", "+1 (555) 765-4321"],
      subtitle: "Ring us up"
    },
    {
      icon: <FiMapPin size={24} />,
      title: "Our Salon",
      details: ["123 Heritage Lane", "Old Town District, NY 10001"],
      subtitle: "Visit our parlour"
    },
    {
      icon: <FiClock size={24} />,
      title: "Business Hours",
      details: ["Monday - Friday: 9:00 - 18:00", "Saturday: 10:00 - 16:00"],
      subtitle: "When we're available"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-orange-50">
      {/* Vintage Paper Texture Overlay */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4a574' fill-opacity='0.1'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3Ccircle cx='13' cy='13' r='1'/%3E%3Ccircle cx='33' cy='5' r='1'/%3E%3Ccircle cx='3' cy='23' r='1'/%3E%3Ccircle cx='23' cy='33' r='1'/%3E%3Ccircle cx='43' cy='43' r='1'/%3E%3Ccircle cx='53' cy='13' r='1'/%3E%3Ccircle cx='33' cy='53' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Ornate Header */}
      <motion.header 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative pt-20 pb-16 overflow-hidden"
      >
        {/* Decorative Border */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-700 via-orange-600 to-amber-700"></div>
        
        {/* Ornamental Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-100/40 to-transparent"></div>
        
        {/* Vintage Flourishes */}
        <svg className="absolute top-10 left-10 w-16 h-16 text-amber-600/20" viewBox="0 0 100 100">
          <path d="M20,50 Q30,20 50,30 Q70,20 80,50 Q70,80 50,70 Q30,80 20,50 Z" fill="currentColor" />
        </svg>
        <svg className="absolute top-10 right-10 w-16 h-16 text-amber-600/20" viewBox="0 0 100 100">
          <path d="M20,50 Q30,20 50,30 Q70,20 80,50 Q70,80 50,70 Q30,80 20,50 Z" fill="currentColor" />
        </svg>

        <div className="relative max-w-6xl mx-auto px-4 text-center">
          {/* Vintage Seal */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.5, duration: 1.2, ease: "easeOut" }}
            className="inline-flex items-center justify-center w-24 h-24 mb-8 rounded-full bg-gradient-to-br from-amber-200 to-orange-300 border-4 border-amber-600 shadow-lg relative"
          >
            <FiFeather className="text-amber-800" size={32} />
            <div className="absolute inset-0 rounded-full border-2 border-amber-400 animate-pulse"></div>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="text-6xl md:text-8xl font-serif font-bold text-amber-900 mb-4 tracking-wide"
            style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}
          >
            Contact
          </motion.h1>

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '12rem' }}
            transition={{ delay: 1, duration: 0.8 }}
            className="h-1 bg-gradient-to-r from-transparent via-amber-700 to-transparent mx-auto mb-6"
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-2xl font-serif text-amber-800/80 italic"
          >
            &quot;Correspondence is the soul of discourse&quot;
          </motion.p>
        </div>
      </motion.header>

      {/* Main Content */}
      <motion.main 
        variants={container}
        initial="hidden"
        animate="visible"
        className="relative max-w-7xl mx-auto px-4 pb-20"
      >
        <div className="grid lg:grid-cols-2 gap-16">
          
          {/* Contact Form */}
          <motion.div variants={fadeInUp} className="relative">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg border-2 border-amber-200 shadow-xl p-8 relative overflow-hidden">
              
              {/* Decorative Corner Elements */}
              <div className="absolute top-0 left-0 w-16 h-16">
                <svg viewBox="0 0 100 100" className="w-full h-full text-amber-600/20">
                  <path d="M0,0 L40,0 Q0,0 0,40 L0,0 Z" fill="currentColor" />
                  <path d="M10,10 L30,10 Q10,10 10,30 L10,10 Z" fill="currentColor" />
                </svg>
              </div>
              <div className="absolute top-0 right-0 w-16 h-16 rotate-90">
                <svg viewBox="0 0 100 100" className="w-full h-full text-amber-600/20">
                  <path d="M0,0 L40,0 Q0,0 0,40 L0,0 Z" fill="currentColor" />
                  <path d="M10,10 L30,10 Q10,10 10,30 L10,10 Z" fill="currentColor" />
                </svg>
              </div>
              <div className="absolute bottom-0 left-0 w-16 h-16 -rotate-90">
                <svg viewBox="0 0 100 100" className="w-full h-full text-amber-600/20">
                  <path d="M0,0 L40,0 Q0,0 0,40 L0,0 Z" fill="currentColor" />
                  <path d="M10,10 L30,10 Q10,10 10,30 L10,10 Z" fill="currentColor" />
                </svg>
              </div>
              <div className="absolute bottom-0 right-0 w-16 h-16 rotate-180">
                <svg viewBox="0 0 100 100" className="w-full h-full text-amber-600/20">
                  <path d="M0,0 L40,0 Q0,0 0,40 L0,0 Z" fill="currentColor" />
                  <path d="M10,10 L30,10 Q10,10 10,30 L10,10 Z" fill="currentColor" />
                </svg>
              </div>

              <div className="relative z-10">
                <h2 className="text-4xl font-serif font-bold text-amber-900 mb-2 text-center">
                  Send a Message
                </h2>
                <p className="text-amber-700 text-center mb-8 italic">
                  We shall respond with utmost care
                </p>

                {isSubmitted ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center py-12"
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-green-100 border-2 border-green-300">
                      <FiSend className="text-green-600" size={24} />
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-green-800 mb-2">Message Dispatched!</h3>
                    <p className="text-green-700">Your correspondence has been received with gratitude.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="relative">
                        <label className="block text-sm font-serif font-semibold text-amber-800 mb-2">
                          Your Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-amber-50/50 border-2 border-amber-200 rounded-lg focus:border-amber-500 focus:outline-none transition-colors text-amber-900 placeholder-amber-500/60"
                          placeholder="Enter your distinguished name"
                          required
                        />
                      </div>
                      <div className="relative">
                        <label className="block text-sm font-serif font-semibold text-amber-800 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-amber-50/50 border-2 border-amber-200 rounded-lg focus:border-amber-500 focus:outline-none transition-colors text-amber-900 placeholder-amber-500/60"
                          placeholder="your.email@domain.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-serif font-semibold text-amber-800 mb-2">
                        Subject Matter
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-amber-50/50 border-2 border-amber-200 rounded-lg focus:border-amber-500 focus:outline-none transition-colors text-amber-900 placeholder-amber-500/60"
                        placeholder="The nature of your inquiry"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-serif font-semibold text-amber-800 mb-2">
                        Your Message
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows={6}
                        className="w-full px-4 py-3 bg-amber-50/50 border-2 border-amber-200 rounded-lg focus:border-amber-500 focus:outline-none transition-colors text-amber-900 placeholder-amber-500/60 resize-none"
                        placeholder="Compose your thoughts with care..."
                        required
                      />
                    </div>

                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-4 bg-gradient-to-r from-amber-700 to-orange-700 text-white font-serif font-semibold text-lg rounded-lg hover:from-amber-800 hover:to-orange-800 transition-all duration-300 shadow-lg hover:shadow-xl relative overflow-hidden group"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        <FiSend size={20} />
                        Dispatch Message
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    </motion.button>
                  </form>
                )}
              </div>
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div variants={fadeInUp} className="space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-serif font-bold text-amber-900 mb-4">
                How to Reach Us
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-transparent via-amber-700 to-transparent mx-auto mb-4"></div>
              <p className="text-amber-700 text-lg italic">
                Multiple avenues for your convenience
              </p>
            </div>

            <div className="grid gap-6">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  whileHover={{ scale: 1.02 }}
                  className="group bg-white/70 backdrop-blur-sm rounded-lg border-2 border-amber-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                >
                  {/* Background Pattern */}
                  <div className="absolute top-0 right-0 w-20 h-20 opacity-5 group-hover:opacity-10 transition-opacity">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-amber-600">
                      <pattern id={`pattern-${index}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                        <circle cx="10" cy="10" r="2" fill="currentColor" />
                      </pattern>
                      <rect width="100%" height="100%" fill={`url(#pattern-${index})`} />
                    </svg>
                  </div>

                  <div className="relative flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-amber-200 to-orange-300 rounded-full flex items-center justify-center text-amber-800 shadow-md group-hover:shadow-lg transition-shadow">
                      {info.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-serif font-bold text-amber-900 mb-1">
                        {info.title}
                      </h3>
                      <p className="text-sm text-amber-600 italic mb-3">
                        {info.subtitle}
                      </p>
                      <div className="space-y-1">
                        {info.details.map((detail, idx) => (
                          <p key={idx} className="text-amber-800 font-medium">
                            {detail}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Vintage Quote Box */}
            <motion.div
              variants={fadeInUp}
              className="mt-12 p-8 bg-gradient-to-br from-amber-100 to-orange-200 rounded-lg border-2 border-amber-300 shadow-lg relative overflow-hidden"
            >
              <div className="absolute top-4 left-4 text-6xl text-amber-600/20 font-serif">&quot;</div>
              <div className="absolute bottom-4 right-4 text-6xl text-amber-600/20 font-serif">&quot;</div>

              <div className="relative text-center">
                <p className="text-lg text-amber-800 italic font-medium mb-4 leading-relaxed">
                  Excellence in communication is not just our business practice—it is our philosophy. 
                  Every correspondence is treated with the dignity and attention it deserves.
                </p>
                <div className="w-16 h-1 bg-amber-700 mx-auto mb-2"></div>
                <p className="text-amber-700 font-serif text-sm">
                  — The Snippet Team
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.main>

      {/* Vintage Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="relative mt-16 py-12 bg-gradient-to-r from-amber-900 via-orange-800 to-amber-900 text-amber-100 overflow-hidden"
      >
        {/* Decorative Top Border */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
        
        {/* Ornamental Background */}
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 1000 200" className="w-full h-full">
            <defs>
              <pattern id="footerPattern" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M25,5 L45,25 L25,45 L5,25 Z" fill="currentColor" fillOpacity="0.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#footerPattern)" />
          </svg>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mr-4">
              <FiFeather className="text-white" size={20} />
            </div>
            <span className="text-3xl font-serif font-bold">Snippet</span>
          </div>
          
          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-6"></div>
          
          <p className="text-lg mb-2 font-serif">
            © {new Date().getFullYear()} Snippet & Co. — Established with Pride
          </p>
          <p className="text-amber-200/80 italic">
            &quot;Where tradition meets innovation&quot;
          </p>
        </div>
      </motion.footer>
    </div>
  );
};

export default ContactPage;