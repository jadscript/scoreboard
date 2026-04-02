interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'outline' | 'ghost';
}

function Button({ children, variant = 'primary', ...props }: ButtonProps) {
  const baseClasses = 'cursor-pointer w-full px-8 py-2.5 rounded-full text-sm font-semibold flex justify-center items-center gap-2 border-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50';
  const variantClasses = {
    primary: 'border-lime-600 bg-lime-600 text-white hover:bg-lime-500 hover:border-lime-500',
    outline: 'border-stone-300 bg-white text-foreground hover:border-lime-600 hover:text-lime-600',
    ghost: 'bg-transparent text-lime-600',
  }

  return <button className={`${baseClasses} ${variantClasses[variant]} ${props.className}`} {...props}>{children}</button>;
}

export default Button;
