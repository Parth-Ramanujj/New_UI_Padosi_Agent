import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    // Skip scroll-to-top for anchor navigation (e.g. #reviews)
    if (hash) return;

    // Only scroll to top when the actual page (pathname) changes,
    // NOT when query params change (which happens on /agents with filters).
    if (prevPathRef.current === pathname) return;
    prevPathRef.current = pathname;

    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
