import type { CSSProperties, ChangeEvent } from 'react';
import type { FormInputProps } from '../../types/components.types.ts';
import { cn } from '../../lib/utils.ts';

export function FormInput({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  disabled = false,
  error,
  icon: Icon,
  className,
}: FormInputProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  const inputStyle: CSSProperties = {
    width: '100%',
    padding: Icon ? '11px 14px 11px 40px' : '11px 14px',
    borderRadius: '10px',
    background: 'rgba(25, 28, 38, 0.75)',
    border: error ? '1px solid #FF4D4D' : '1px solid rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(16px)',
    color: '#F5F5F7',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    boxShadow: error ? '0 0 12px rgba(255, 77, 77, 0.2)' : 'none',
  };

  return (
    <div className={cn('form-input-container', className)} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <label style={{ fontSize: '12px', fontWeight: 500, color: '#A3A6B3', letterSpacing: '0.02em' }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative', width: '100%' }}>
        {Icon && (
          <div
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#A3A6B3',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Icon size={16} />
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          style={inputStyle}
          onFocus={(e) => {
            if (!error) {
              e.target.style.borderColor = 'rgba(255, 122, 24, 0.6)';
              e.target.style.boxShadow = '0 0 16px -2px rgba(255, 122, 24, 0.35)';
            }
          }}
          onBlur={(e) => {
            if (!error) {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.target.style.boxShadow = 'none';
            }
          }}
        />
      </div>
      {error && <span style={{ fontSize: '11px', color: '#FF7A18' }}>{error}</span>}
    </div>
  );
}
