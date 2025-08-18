import { useLocation } from 'react-router-dom';
import { usePageTitle, PAGE_TITLES } from '../hooks/usePageTitle';

const TitleManager = () => {
  const location = useLocation();
  
  // Set title based on current path
  const getTitleForPath = (pathname: string) => {
    switch (pathname) {
      case '/':
        return PAGE_TITLES.home;
      case '/auth':
        return PAGE_TITLES.auth;
      case '/templates':
        return PAGE_TITLES.templates;
      case '/portal':
        return PAGE_TITLES.portal;
      case '/documents':
        return PAGE_TITLES.documents;
      default:
        return PAGE_TITLES.home;
    }
  };
  
  const currentTitle = getTitleForPath(location.pathname);
  usePageTitle(currentTitle);
  
  return null; // This component doesn't render anything
};

export default TitleManager;
