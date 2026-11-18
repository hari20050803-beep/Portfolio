import { useEffect } from 'react';
import { initMotion } from '../../lib/motion';
import { About } from './About';
import { Achievement } from './Achievement';
import { Contact } from './Contact';
import { Education } from './Education';
import { Experience } from './Experience';
import { Languages } from './Languages';
import { Projects } from './Projects';
import { Skills } from './Skills';

export default function BelowTheFold() {
  // Covers the case where these sections weren't in the initial HTML (dev mode).
  useEffect(() => {
    initMotion();
  }, []);

  return (
    <>
      <About />
      <Experience />
      <Projects />
      <Skills />
      <div className="records">
        <div className="container records__grid">
          <Education />
          <div className="records__side">
            <Achievement />
            <Languages />
          </div>
        </div>
      </div>
      <Contact />
    </>
  );
}
