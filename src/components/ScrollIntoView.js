import React, { useEffect, useRef } from 'react';

const ScrollIntoView = ({ children, active, behavior = 'smooth', block = 'start', dependency }) => {
  const elementRef = useRef(null);

  useEffect(() => {
    if (active && elementRef.current) {
      // Check if we're on mobile (lg breakpoint is 1024px)
      if (window.innerWidth < 1024) {
        // Add a small delay to ensure DOM is updated
        setTimeout(() => {
          const yOffset = -80; // Account for fixed header
          const y = elementRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
          
          window.scrollTo({
            top: y,
            behavior: behavior
          });
        }, 100);
      }
    }
  }, [active, behavior, dependency]); // Add dependency to trigger effect

  return (
    <div ref={elementRef} className="relative">
      {children}
    </div>
  );
};

export default ScrollIntoView;