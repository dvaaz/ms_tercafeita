import type { ToastType } from './ToastProvider';
import { XIcon } from '../Icons';
import styles from './Toast.module.css';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

const icons: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

export default function Toast({ message, type, onClose }: ToastProps) {
  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <span className={styles.icon}>{icons[type]}</span>
      <span className={styles.message}>{message}</span>
      <button className={styles.close} onClick={onClose} aria-label="Fechar">
        <XIcon size={16} />
      </button>
    </div>
  );
}
