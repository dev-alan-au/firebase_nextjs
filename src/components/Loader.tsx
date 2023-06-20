import styles from '@/styles/Loader.module.css';

export default function Loader({ show }: { show: boolean}) {
  if(!show) return null;
  return <div className={styles.loader}></div>
}