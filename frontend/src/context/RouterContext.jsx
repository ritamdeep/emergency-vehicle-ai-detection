/**
 * Router Context for Single Page Application
 * 
 * Supports both path-based and hash-based navigation for maximum compatibility
 * across local Vite dev server, production builds, Vercel, and GitHub Pages.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const RouterContext = createContext(null);

export function RouterProvider({ children }) {
  // Normalize current path from window.location
  const getInitialPath = () => {
    // Check hash first (e.g., #/junction or #junction)
    if (window.location.hash) {
      const hash = window.location.hash.replace(/^#\/?/, '/');
      return hash.startsWith('/') ? hash : `/${hash}`;
    }
    // Fallback to pathname (stripping subfolder base if deployed to GitHub Pages)
    const path = window.location.pathname;
    const baseMatch = path.match(/emergency-vehicle-project(\/.*)?$/);
    if (baseMatch) {
      return baseMatch[1] || '/';
    }
    return path || '/';
  };

  const [currentPath, setCurrentPath] = useState(getInitialPath);

  // Listen for browser navigation (popstate / hashchange)
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(getInitialPath());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigate = useCallback((to) => {
    const target = to.startsWith('/') ? to : `/${to}`;
    
    // Update both history and hash for 100% universal static host support
    try {
      window.history.pushState({}, '', `#${target}`);
    } catch {
      window.location.hash = `#${target}`;
    }
    setCurrentPath(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <RouterContext.Provider value={{ currentPath, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
}

export function Link({ to, children, className = '', activeClassName = '', ...props }) {
  const { currentPath, navigate } = useRouter();
  
  // Exact or subpath match
  const isActive = to === '/' 
    ? currentPath === '/' 
    : currentPath === to || currentPath.startsWith(`${to}/`);

  const handleClick = (e) => {
    e.preventDefault();
    navigate(to);
  };

  const combinedClass = `${className} ${isActive ? activeClassName : ''}`.trim();

  return (
    <a href={`#${to}`} onClick={handleClick} className={combinedClass} {...props}>
      {children}
    </a>
  );
}
