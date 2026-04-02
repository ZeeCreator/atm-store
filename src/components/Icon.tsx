// Font Awesome Icon Component
'use client';

import { FontAwesomeIcon, FontAwesomeIconProps } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';

// Add all icons to library
library.add(fas, far, fab);

interface IconProps extends Omit<FontAwesomeIconProps, 'icon'> {
  name: string;
  size?: 'xs' | 'sm' | 'lg' | 'xl' | '2x';
}

export default function Icon({ name, size = 'sm', className = '', ...props }: IconProps) {
  const sizeClass = {
    'xs': 'text-xs',
    'sm': 'text-sm',
    'lg': 'text-lg',
    'xl': 'text-xl',
    '2x': 'text-2xl',
  }[size];

  return (
    <FontAwesomeIcon 
      icon={name as any} 
      className={`${sizeClass} ${className}`}
      {...props}
    />
  );
}

// Pre-defined icon components for common icons
export const Icons = {
  // Navigation
  Menu: (props: any) => <FontAwesomeIcon icon="bars" {...props} />,
  Close: (props: any) => <FontAwesomeIcon icon="xmark" {...props} />,
  Search: (props: any) => <FontAwesomeIcon icon="magnifying-glass" {...props} />,
  Cart: (props: any) => <FontAwesomeIcon icon="cart-shopping" {...props} />,
  Home: (props: any) => <FontAwesomeIcon icon="house" {...props} />,
  
  // Actions
  Plus: (props: any) => <FontAwesomeIcon icon="plus" {...props} />,
  Minus: (props: any) => <FontAwesomeIcon icon="minus" {...props} />,
  Edit: (props: any) => <FontAwesomeIcon icon="pen-to-square" {...props} />,
  Delete: (props: any) => <FontAwesomeIcon icon="trash" {...props} />,
  Check: (props: any) => <FontAwesomeIcon icon="check" {...props} />,
  ChevronRight: (props: any) => <FontAwesomeIcon icon="chevron-right" {...props} />,
  ChevronLeft: (props: any) => <FontAwesomeIcon icon="chevron-left" {...props} />,
  ChevronDown: (props: any) => <FontAwesomeIcon icon="chevron-down" {...props} />,
  ArrowRight: (props: any) => <FontAwesomeIcon icon="arrow-right" {...props} />,
  
  // Products
  Star: (props: any) => <FontAwesomeIcon icon="star" {...props} />,
  StarHalf: (props: any) => <FontAwesomeIcon icon={['far', 'star-half-stroke']} {...props} />,
  StarEmpty: (props: any) => <FontAwesomeIcon icon={['far', 'star']} {...props} />,
  
  // User & Contact
  User: (props: any) => <FontAwesomeIcon icon="user" {...props} />,
  Phone: (props: any) => <FontAwesomeIcon icon="phone" {...props} />,
  Envelope: (props: any) => <FontAwesomeIcon icon="envelope" {...props} />,
  Location: (props: any) => <FontAwesomeIcon icon="location-dot" {...props} />,
  Whatsapp: (props: any) => <FontAwesomeIcon icon={['fab', 'whatsapp']} {...props} />,
  Instagram: (props: any) => <FontAwesomeIcon icon={['fab', 'instagram']} {...props} />,
  Lock: (props: any) => <FontAwesomeIcon icon="lock" {...props} />,
  Logout: (props: any) => <FontAwesomeIcon icon="right-from-bracket" {...props} />,
  
  // Shopping
  ShoppingCart: (props: any) => <FontAwesomeIcon icon="cart-shopping" {...props} />,
  Bag: (props: any) => <FontAwesomeIcon icon="bag-shopping" {...props} />,
  Box: (props: any) => <FontAwesomeIcon icon="box-open" {...props} />,
  Tag: (props: any) => <FontAwesomeIcon icon="tag" {...props} />,
  Discount: (props: any) => <FontAwesomeIcon icon="percent" {...props} />,
  
  // Dashboard
  Dashboard: (props: any) => <FontAwesomeIcon icon="gauge-high" {...props} />,
  Products: (props: any) => <FontAwesomeIcon icon="box-open" {...props} />,
  Orders: (props: any) => <FontAwesomeIcon icon="clipboard-list" {...props} />,
  Settings: (props: any) => <FontAwesomeIcon icon="gear" {...props} />,
  TrendingUp: (props: any) => <FontAwesomeIcon icon="chart-line" {...props} />,
  Pending: (props: any) => <FontAwesomeIcon icon="clock" {...props} />,
  Completed: (props: any) => <FontAwesomeIcon icon="circle-check" {...props} />,
  Warning: (props: any) => <FontAwesomeIcon icon="triangle-exclamation" {...props} />,
  Info: (props: any) => <FontAwesomeIcon icon="circle-info" {...props} />,
  
  // Shipping & Services
  Shipping: (props: any) => <FontAwesomeIcon icon="truck" {...props} />,
  Shield: (props: any) => <FontAwesomeIcon icon="shield-halved" {...props} />,
  Return: (props: any) => <FontAwesomeIcon icon="rotate-left" {...props} />,
  
  // Support
  Chat: (props: any) => <FontAwesomeIcon icon="comments" {...props} />,
  Support: (props: any) => <FontAwesomeIcon icon="headset" {...props} />,
  
  // Files & Data
  File: (props: any) => <FontAwesomeIcon icon="file" {...props} />,
  Download: (props: any) => <FontAwesomeIcon icon="download" {...props} />,
  Upload: (props: any) => <FontAwesomeIcon icon="upload" {...props} />,
  
  // Media
  Image: (props: any) => <FontAwesomeIcon icon="image" {...props} />,
  Camera: (props: any) => <FontAwesomeIcon icon="camera" {...props} />,
  
  // Time
  Clock: (props: any) => <FontAwesomeIcon icon="clock" {...props} />,
  Calendar: (props: any) => <FontAwesomeIcon icon="calendar" {...props} />,
  
  // Status
  Spinner: (props: any) => <FontAwesomeIcon icon="circle-notch" spin {...props} />,
  CheckCircle: (props: any) => <FontAwesomeIcon icon="circle-check" {...props} />,
  ExclamationCircle: (props: any) => <FontAwesomeIcon icon="circle-exclamation" {...props} />,
  
  // Motorcycle
  Motorcycle: (props: any) => <FontAwesomeIcon icon="motorcycle" {...props} />,
  Helmet: (props: any) => <FontAwesomeIcon icon="hat-cowboy-side" {...props} />,

  // Features
  Certificate: (props: any) => <FontAwesomeIcon icon="certificate" {...props} />,
  Price: (props: any) => <FontAwesomeIcon icon="tags" {...props} />,
  Service: (props: any) => <FontAwesomeIcon icon="headset" {...props} />,
  Warranty: (props: any) => <FontAwesomeIcon icon="shield-halved" {...props} />,
  Trusted: (props: any) => <FontAwesomeIcon icon="users" {...props} />,
};
