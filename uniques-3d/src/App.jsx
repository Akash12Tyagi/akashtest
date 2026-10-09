import React, { useEffect, useRef } from 'react';
import Nav from './components/Nav.jsx';
import HeroTunnel from './components/HeroTunnel.jsx';
import Counts from './components/Counts.jsx';
import About from './components/About.jsx';
import WhyUs from './components/WhyUs.jsx';
import Partners from './components/Partners.jsx';
import Startups from './components/Startups.jsx';
import Events from './components/Events.jsx';
import Gallery from './components/Gallery.jsx';
import YouTube from './components/YouTube.jsx';
import Testimonials from './components/Testimonials.jsx';
import Footer, { CallToAction } from './components/Footer.jsx';
import './styles/sections.css';

function ScrollProgress() {
  const ref = useRef(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (ref.current) ref.current.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    };
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, []);
  return <div className="scroll-progress" ref={ref} aria-hidden="true" />;
}

export default function App() {
  return (
    <>
      <ScrollProgress />
      <Nav />
      <main>
        <HeroTunnel />
        <Counts />
        <About />
        <WhyUs />
        <Partners />
        <Startups />
        <Events />
        <Gallery />
        <YouTube />
        <Testimonials />
        <CallToAction />
      </main>
      <Footer />
    </>
  );
}
