import {
  Star, Edit, Globe, Briefcase, CheckCircle,
  MessageCircle, X, Plus, Sparkles, Github,
  Linkedin, Twitter, Youtube
} from 'lucide-react';

export const socialIcons = {
  website: Globe,
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  youtube: Youtube
};


export const MAX_BIO_LENGTH = 500;
export const MAX_PORTFOLIO_ITEMS = 12; // Keep consistent with PortfolioSection
export const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export { default as BioSection } from './BioSection';
export { default as PortfolioSection } from './PortfolioSection';
export { default as ProfileHeader } from './ProfileHeader';
export { default as ReviewsSection } from './ReviewsSection';
export { default as SocialLinks } from './SocialLinks';
export * from './constants';