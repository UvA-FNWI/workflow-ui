import { useEffect, useState } from 'react';

export function useIsSmallScreen() {
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    if (!window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia('(max-width: 639px)');
    const updateIsSmallScreen = () => setIsSmallScreen(mediaQuery.matches);

    updateIsSmallScreen();
    mediaQuery.addEventListener('change', updateIsSmallScreen);

    return () => mediaQuery.removeEventListener('change', updateIsSmallScreen);
  }, []);

  return isSmallScreen;
}
