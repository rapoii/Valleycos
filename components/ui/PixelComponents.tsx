import React, { ReactNode } from 'react';
import { motion, HTMLMotionProps, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

// --- Pixel Button ---
interface PixelButtonProps extends HTMLMotionProps<"button"> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const PixelButton: React.FC<PixelButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className,
  ...props 
}) => {
  const baseStyle = "font-pixel uppercase tracking-widest transition-transform active:translate-y-1 active:shadow-none border-2 border-pixel-dark relative select-none";
  
  const variants = {
    primary: "bg-pixel-pink text-pixel-dark hover:bg-pink-300 shadow-pixel",
    secondary: "bg-white text-pixel-dark hover:bg-gray-100 shadow-pixel",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-pixel",
  };

  const sizes = {
    sm: "px-3 py-1 text-lg",
    md: "px-6 py-2 text-xl",
    lg: "px-8 py-4 text-2xl",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className || ''}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

// --- Pixel Card ---
interface PixelCardProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const PixelCard: React.FC<PixelCardProps> = ({ children, className, noPadding = false }) => {
  return (
    <div className={`bg-white border-2 border-pixel-dark shadow-pixel ${noPadding ? '' : 'p-6'} ${className || ''}`}>
      {children}
    </div>
  );
};

// --- Pixel Input ---
interface PixelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const PixelInput: React.FC<PixelInputProps> = ({ label, className, ...props }) => {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="font-pixel text-xl text-pixel-dark">{label}</label>}
      <input 
        className={`bg-white text-pixel-dark border-2 border-pixel-dark p-2 font-pixel text-xl focus:outline-none focus:ring-2 focus:ring-pixel-pink shadow-pixel-sm placeholder:text-gray-400 ${className || ''}`}
        {...props}
      />
    </div>
  );
};

// --- Section Header ---
export const SectionHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="text-center mb-12">
    <h2 className="text-4xl md:text-6xl font-pixel text-pixel-dark mb-2 uppercase relative inline-block">
      {title}
      <span className="absolute -bottom-2 left-0 w-full h-1 bg-pixel-gold"></span>
    </h2>
    {subtitle && <p className="text-xl md:text-2xl font-pixel text-gray-500 mt-4">{subtitle}</p>}
  </div>
);

// --- Pixel Modal ---
interface PixelModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  icon?: ReactNode;
}

export const PixelModal: React.FC<PixelModalProps> = ({ isOpen, onClose, title, children, icon }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm"
          >
            <PixelCard className="relative border-2 border-pixel-dark shadow-pixel-lg">
              <button 
                onClick={onClose} 
                className="absolute top-4 right-4 text-pixel-dark hover:text-red-500 transition-colors z-10"
              >
                <X size={24} />
              </button>
              
              <div className="text-center pt-2 pb-4">
                {icon && (
                  <div className="flex justify-center mb-4 text-pixel-pink">
                    {icon}
                  </div>
                )}
                
                {title && (
                  <h3 className="text-2xl font-pixel uppercase mb-4 text-pixel-dark">{title}</h3>
                )}
                
                <div className="font-pixel text-lg text-gray-700 mb-6">
                  {children}
                </div>
                
                <div className="flex justify-center">
                  <PixelButton onClick={onClose} size="sm">
                    OK
                  </PixelButton>
                </div>
              </div>
            </PixelCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};