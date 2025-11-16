"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";

function AddDataContent() {
  const searchParams = useSearchParams();
  const result = searchParams.get("result");

  if (!result) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <h1>No Data</h1>
          <p>No analysis result found.</p>
          <Link href="/scan" className={styles.backButton}>
            Back to Scan
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Food Analysis Result</h1>
        
        <div className={styles.resultContainer}>
          <p className={styles.resultText}>{result}</p>
        </div>

        <Link href="/scan" className={styles.backButton}>
          Scan Another Bite
        </Link>
      </main>
    </div>
  );
}

export default function AddData() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddDataContent />
    </Suspense>
  );
}
