import { useEffect } from 'react';

export const usePageTitle = (title: string) => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;
    
    // Restore the previous title when the component unmounts
    return () => {
      document.title = previousTitle;
    };
  }, [title]);
};

// Predefined titles for different pages
export const PAGE_TITLES = {
  home: 'HR Portal - Professional Document Generation',
  auth: 'Sign In - HR Portal',
  templates: 'Document Templates - HR Portal',
  portal: 'Create Document - HR Portal',
  documents: 'My Documents - HR Portal'
} as const;
