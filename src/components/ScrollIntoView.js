import React, { useEffect, useRef } from 'react';

const ScrollIntoView = ({ children, active, behavior = 'smooth', block = 'start', dependency }) => {
  const elementRef = useRef(null);

  useEffect(() => {
    if (active && elementRef.current) {
      if (window.innerWidth < 1024) {
        setTimeout(() => {
          const yOffset = -80;
          const y = elementRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
          
          window.scrollTo({
            top: y,
            behavior: behavior
          });
        }, 100);
      }
    }
  }, [active, behavior, dependency]); 

  return (
    <div ref={elementRef} className="relative">
      {children}
    </div>
  );
};

export default ScrollIntoView;