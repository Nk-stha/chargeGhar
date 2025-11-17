import React from "react";
import styles from "./TotalBadge.module.css";

interface Props {
  label: string;
  value: string | number;
  color?: "green" | "blue" | "orange" | "purple";
}

const TotalBadge: React.FC<Props> = ({ label, value, color = "green" }) => {
  return (
    <div className={`${styles.badge} ${styles[color]}`}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
    </div>
  );
};

export default TotalBadge;
