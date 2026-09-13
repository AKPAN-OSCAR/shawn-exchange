import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  MessageCircle, 
  ChevronRight, 
  ShieldCheck, 
  Zap, 
  Smartphone,
  Facebook,
  Instagram,
  Twitter
} from 'lucide-react';
import { cn } from '../lib/utils';

export const LandingPage: React.FC<{ onStart: (mode: 'login' | 'signup') => void }> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-secondary overflow-hidden">
      {/* Header */}
      <header className="px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <span className="text-white font-display font-bold text-xl">S</span>
          </div>
          <span className="font-display font-bold text-xl text-primary">Shawn <span className="text-accent">Xchange</span></span>
        </div>
      </header>

      {/* Hero Section */}
      <main className="px-6 pt-10 pb-20 max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl mb-4 leading-[1.1]">
              Sell your <span className="text-accent bg-accent/20 px-4 py-1 rounded-3xl inline-block -rotate-1">Gift Cards</span> at the best rates.
            </h1>
            <p className="text-lg text-primary/60 max-w-md">
              Secure, instant, and reliable USDT & Gift Card exchange platform designed for Nigerians.
            </p>
          </div>

          <div className="relative mb-12">
            <motion.div 
               animate={{ 
                y: [0, -10, 0],
                rotate: [0, 2, 0]
              }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="w-full max-w-sm mx-auto"
            >
              <img 
                src="https://picsum.photos/seed/cards/600/600" 
                alt="Gift Cards Illustration" 
                className="w-full h-auto rounded-3xl shadow-2xl rotate-2"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            
            {/* Rates floating card */}
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="absolute -right-4 top-1/4 bg-white p-4 rounded-2xl shadow-xl border border-black/5 max-w-[120px]"
            >
              <p className="text-[10px] uppercase tracking-wider text-primary/40 font-bold">USDT RATE</p>
              <p className="text-xl font-display font-bold text-accent">₦1,650</p>
            </motion.div>
          </div>

          <div className="flex flex-col gap-4">
            <button 
              onClick={() => onStart('signup')}
              className="w-full bg-primary text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group"
            >
              Create an Account
              <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => onStart('login')}
              className="w-full py-5 rounded-2xl font-bold text-lg text-primary"
            >
              Login
            </button>
          </div>
        </motion.div>

        {/* Features */}
        <section className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: ShieldCheck, title: "Secure Transactions", desc: "Your assets are protected with industry-leading security." },
            { icon: Zap, title: "Instant Payouts", desc: "Get your Naira in minutes after admin approval." },
            { icon: Smartphone, title: "Mobile Optimized", desc: "Trade on the go with our sleek mobile-first design." }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="card-premium"
            >
              <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center mb-4 text-accent">
                <feature.icon />
              </div>
              <h3 className="text-xl mb-2">{feature.title}</h3>
              <p className="text-primary/60 text-sm">{feature.desc}</p>
            </motion.div>
          ))} section
        </section>
      </main>

      {/* Floating support button */}
      <a 
        href="https://wa.me/2349057655018?text=Hello%20Shawn%2C%20I%20need%20help%20with%20my%20transaction"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-8 right-8 w-16 h-16 bg-[#25D366] rounded-full shadow-2xl flex items-center justify-center text-white z-50 hover:scale-110 transition-transform"
      >
        <MessageCircle size={32} />
      </a>

      {/* Footer */}
      <footer className="bg-primary text-secondary py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">S</span>
                </div>
                <span className="font-display font-bold text-xl">Shawn <span className="text-accent">Xchange</span></span>
              </div>
              <p className="text-secondary/60 text-sm max-w-xs">
                Nigeria's #1 platform for USDT and Gift Card exchange.
              </p>
            </div>
            <div className="flex gap-6">
              <a href="https://instagram.com/shawnx82y" className="hover:text-accent transition-colors"><Instagram /></a>
              <a href="https://x.com/ShawnExchange" className="hover:text-accent transition-colors"><Twitter /></a>
              <a href="#" className="hover:text-accent transition-colors"><Facebook /></a>
            </div>
          </div>
          <div className="pt-8 border-t border-secondary/10 text-center text-sm text-secondary/40">
            © 2024 Shawn Exchange. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
