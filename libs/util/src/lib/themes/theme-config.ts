import { Theme } from '../models/theme.model';

export const THEMES: Record<string, Theme> = {
  default: {
    name: 'default',
    primaryColor: '#455a64', // Blue-gray from science illustration
    accentColor: '#FFC727', // Golden yellow from science illustration
    backgroundColor: '#ffffff',
    loginIllustration: '/assets/illustrations/default-illustration.svg',
    logo: '/assets/logos/default-logo.svg',
    displayName: 'Admin',
    appVariant: 'admin',
    titleSuffix: 'Portal',
  },
  admin: {
    name: 'admin',
    primaryColor: '#455a64', // Blue-gray from science illustration
    accentColor: '#FFC727', // Golden yellow matching hand in logo
    backgroundColor: '#ffffff',
    loginIllustration: '/assets/illustrations/default-illustration.svg',
    logo: '/assets/logos/interactive_v1_hand_yellow.svg',
    displayName: 'Admin',
    appVariant: 'admin',
    titleSuffix: 'Portal',
  },
  umdzidzisi: {
    name: 'umdzidzisi',
    primaryColor: '#544a88', // Corporate medium-dark purple
    accentColor: '#756d9e', // Medium purple for accents
    backgroundColor: '#ffffff', // Pure white for clean corporate look
    surfaceColor: '#fafafa', // Very light gray for cards/panels
    textColor: '#0b0a14', // Darkest purple for text
    textSecondaryColor: '#544a88', // Primary purple for secondary text
    borderColor: '#d7d6e0', // Lightest purple-gray for borders
    hoverColor: '#3a3166', // Darker purple for hover states
    isDark: false,
    loginIllustration: '/assets/illustrations/umdzidzisi-illustration.svg',
    logo: '/assets/logos/umdzidzisi-logo.svg',
    displayName: 'Umdzidzisi',
    appVariant: 'admin',
    titleSuffix: 'Admin Portal',
  },
  'umdzidzisi-dark': {
    name: 'umdzidzisi-dark',
    primaryColor: '#9891b4', // Medium-light purple for dark mode
    accentColor: '#b8b5ca', // Light purple-gray for accents
    backgroundColor: '#0b0a14', // Darkest purple-black
    surfaceColor: '#19162c', // Nearly black purple for elevated surfaces
    textColor: '#ffffff', // Pure white for readability
    textSecondaryColor: '#b8b5ca', // Light purple for secondary text
    borderColor: '#282148', // Very dark purple for borders
    hoverColor: '#9891b4', // Medium purple for hover states
    isDark: true,
    loginIllustration: '/assets/illustrations/umdzidzisi-illustration.svg',
    logo: '/assets/logos/umdzidzisi-logo.svg',
    displayName: 'Umdzidzisi',
    appVariant: 'admin',
    titleSuffix: 'Admin Portal',
  },
  umtengesi: {
    name: 'umtengesi',
    primaryColor: '#FF725E', // Coral/salmon from illustration
    accentColor: '#d78776', // Rose/peachy accent
    backgroundColor: '#fafafa',
    loginIllustration: '/assets/illustrations/umtengesi-illustration.svg',
    logo: '/assets/logos/umtengesi-logo.svg',
    displayName: 'Umtengesi',
    appVariant: 'admin',
    titleSuffix: 'Admin Portal',
  },
};
