import type { InputHTMLAttributes, ReactNode } from 'react';
import styles from './InputField.module.css';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  rightElement?: ReactNode;
}

export default function InputField({
  label,
  error,
  icon,
  rightElement,
  className = '',
  id,
  ...rest
}: InputFieldProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`${styles.wrapper} ${className}`}>
      {label && <label htmlFor={inputId} className={styles.label}>{label}</label>}
      <div className={`${styles.inputRow} ${error ? styles.hasError : ''}`}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <input
          id={inputId}
          className={`${styles.input} ${icon ? styles.withIcon : ''} ${rightElement ? styles.withRight : ''}`}
          {...rest}
        />
        {rightElement && <span className={styles.right}>{rightElement}</span>}
      </div>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
