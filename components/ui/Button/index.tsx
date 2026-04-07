import React from 'react';
import './Button.css';

// Define button variants and sizes
const variants = ['primary', 'secondary', 'ghost', 'outline'];
const sizes = ['sm', 'md', 'lg'];

interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'outline';
  size: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({ variant, size, children, onClick }) => {
  return (
    <button className={`button ${variant} ${size}`} onClick={onClick}>
      {children}
    </button>
  );
};

// Default export
export default Button;

// Also export variants and sizes for use in other parts of the application
export { variants, sizes };