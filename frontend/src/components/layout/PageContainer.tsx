import type { CSSProperties } from 'react';
import type { PageContainerProps } from '../../types/components.types.ts';
import { cn } from '../../lib/utils.ts';

export function PageContainer({
  children,
  maxWidth = 'xl',
  className,
  withBackgroundGrid = false,
}: PageContainerProps) {
  const maxWidthMap: Record<string, string> = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    full: '100%',
  };

  const containerStyle: CSSProperties = {
    width: '100%',
    maxWidth: maxWidthMap[maxWidth],
    margin: '0 auto',
    padding: '40px 24px 80px',
    position: 'relative',
    zIndex: 1,
  };

  return (
    <div
      className={cn(
        'page-container',
        withBackgroundGrid && 'cyber-grid',
        className
      )}
      style={{ minHeight: '100vh', width: '100%', position: 'relative' }}
    >
      <main style={containerStyle}>{children}</main>
    </div>
  );
}
