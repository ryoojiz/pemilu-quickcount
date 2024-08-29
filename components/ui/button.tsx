import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline'
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  className = '', 
  variant = 'default', 
  ...props 
}) => {
  const baseStyles = 'px-4 py-3 rounded font-semibold transition-colors'
  const variantStyles = {
    default: 'bg-gray-800 text-white hover:bg-gray-100 border border-gray-400',
    outline: 'border border-blue-500 text-blue-500 hover:bg-blue-50'
  }

  return (
    <button 
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}