import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.content}>
          <h1>Bitelog</h1>
          <p>Track your meals with AI-powered nutritional analysis</p>
          <Link href="/scan" className={styles.scanButton}>
            Scan New Bite
          </Link>
        </div>
      </main>
    </div>
  );
}
