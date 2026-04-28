import type { ReactNode } from 'react';
import { colors } from '../constants/colors';

type AppCardProps = {
  children: ReactNode;
  style?: React.CSSProperties;
};

export function AppCard({ children, style }: AppCardProps) {
  return (
    <div
      style={{
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: 16,
        padding: 20,
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}