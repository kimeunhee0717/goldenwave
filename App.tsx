import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import ThemeGallery from './components/ThemeGallery';
import Testimonials from './components/Testimonials';
import CallToAction from './components/CallToAction';
import Footer from './components/Footer';

const App: React.FC = () => {
  return (
    <div className="font-sans antialiased text-slate-800 bg-white min-h-screen selection:bg-primary-100 selection:text-primary-700">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <ThemeGallery />
        <Testimonials />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default App;