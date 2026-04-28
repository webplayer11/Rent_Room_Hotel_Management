import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { colors } from '../constants/colors';

type AppButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: 'primary' | 'outline' | 'danger';
};

export function AppButton({
  children,
  variant = 'primary',
  style,
  ...props
}: AppButtonProps) {
  const baseStyle: React.CSSProperties = {
    minHeight: 44,
    padding: '10px 16px',
    borderRadius: 10,
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 14,
  };

  const variantStyle: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: colors.primary,
      color: colors.textLight,
    },
    outline: {
      backgroundColor: colors.surface,
      color: colors.primary,
      border: `1px solid ${colors.primary}`,
    },
    danger: {
      backgroundColor: colors.surface,
      color: colors.danger,
      border: `1px solid ${colors.danger}`,
    },
  };

  return (
    <button
      style={{
        ...baseStyle,
        ...variantStyle[variant],
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}