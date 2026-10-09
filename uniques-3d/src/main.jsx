
import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/global.css';
import Lenis from 'lenis';

function Root() {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
    });

    // Optional: listen for scroll events
    // lenis.on('scroll', (event) => {
    //   console.log(event);
    // });

    return () => {
      lenis.destroy();
    };
  }, []);

  return <App />;
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
