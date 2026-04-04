import { useEffect, useState } from 'react';

interface AnimatedCrabProps {
  currentStep: number;
}

export function AnimatedCrab({ currentStep }: AnimatedCrabProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isJumping, setIsJumping] = useState(false);
  const [hasTarget, setHasTarget] = useState(false);

  // Reset to default position when step changes
  useEffect(() => {
    setHasTarget(false);
  }, [currentStep]);

  useEffect(() => {
    const updateCrabPosition = () => {
      const targetElement = document.querySelector('[data-crab-target="true"]');

      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();

        // Position crab at top-right of the selected element
        const newX = rect.right - 35; // 35px from right edge
        const newY = rect.top + 5; // slightly below top edge

        setPosition({ x: newX, y: newY });
        setHasTarget(true);
        setIsJumping(true);

        setTimeout(() => setIsJumping(false), 600);
      } else {
        // Default position: bottom-left corner
        setHasTarget(false);
      }
    };

    // Initial check
    updateCrabPosition();

    // Watch for changes
    const observer = new MutationObserver(updateCrabPosition);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-crab-target'],
      subtree: true,
    });

    // Update on scroll and resize
    window.addEventListener('scroll', updateCrabPosition);
    window.addEventListener('resize', updateCrabPosition);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', updateCrabPosition);
      window.removeEventListener('resize', updateCrabPosition);
    };
  }, []);

  return (
    <div
      className={`fixed z-50 pointer-events-none transition-all duration-500 ease-out ${
        isJumping ? 'animate-crab-jump' : ''
      }`}
      style={{
        left: hasTarget ? `${position.x}px` : '20px',
        top: hasTarget ? `${position.y}px` : 'auto',
        bottom: hasTarget ? 'auto' : '20px',
        transform: hasTarget ? 'scale(1)' : 'scale(0.9)',
      }}
    >
      <div
        className={`text-3xl drop-shadow-lg ${hasTarget ? 'animate-crab-wave' : 'animate-crab-idle'}`}
        style={{
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
        }}
      >
        🦀
      </div>
    </div>
  );
}
