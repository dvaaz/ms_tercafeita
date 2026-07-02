import { useState, type ReactNode } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '../Icons';
import styles from './CollapsibleCard.module.css';

interface CollapsibleCardProps {
  title: ReactNode;
  subtitle?: ReactNode;
  badge?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}

export default function CollapsibleCard({
  title,
  subtitle,
  badge,
  defaultOpen = false,
  children,
}: CollapsibleCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={styles.card}>
      <button className={styles.header} onClick={() => setOpen((o) => !o)}>
        <div className={styles.headerLeft}>
          <div className={styles.title}>{title}</div>
          {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
        </div>
        <div className={styles.headerRight}>
          {badge && <span className={styles.badge}>{badge}</span>}
          <span className={styles.chevron}>
            {open ? <ChevronUpIcon size={18} /> : <ChevronDownIcon size={18} />}
          </span>
        </div>
      </button>
      {open && <div className={styles.body}>{children}</div>}
    </div>
  );
}
