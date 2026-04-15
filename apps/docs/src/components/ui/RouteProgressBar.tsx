import { useState, useEffect } from 'react';
import { useNavigation } from 'react-router-dom';

export function RouteProgressBar() {
  const { state } = useNavigation();
  const isLoading = state === 'loading';
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setVisible(true);
    } else {
      const id = setTimeout(() => setVisible(false), 200);
      return () => clearTimeout(id);
    }
  }, [isLoading]);

  if (!visible && !isLoading) return null;

  return (
    <div
      className={`fixed top-16 left-0 right-0 z-[45] h-[3px] overflow-hidden transition-opacity duration-200 ${
        isLoading ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="h-full bg-primary-500 dark:bg-primary-400 animate-route-progress" />
    </div>
  );
}
