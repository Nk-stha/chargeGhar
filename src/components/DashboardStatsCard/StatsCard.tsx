import React from "react";
import styles from "./StatsCard.module.css";

interface Props {
  icon: React.ReactNode;
  title: string;
  value: string | number;
}

const StatsCard: React.FC<Props> = ({ icon, title, value }: Props) => {
  return (
    <div className={styles.statsCard}>
      <div className={styles.icon}>{icon}</div>
      <div>
        <p className={styles.cardTitle}>{title}</p>
        <h3 className={styles.cardValue}>{value}</h3>
      </div>
    </div>
  );
};

export default StatsCard;
