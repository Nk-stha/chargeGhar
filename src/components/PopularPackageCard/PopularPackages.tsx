import React from "react";
import styles from "./PopularPackage.module.css";

const PopularPackages: React.FC = () => {
    return (
        <div className={styles.card}>
            <h2>Most Popular Packages</h2>
            <ul className={styles.list}>
                <li><span>1 Hour Package</span><div className={styles.bar}><div style={{ width: "90%" }} /></div><span>90%</span></li>
                <li><span>1 Day Package</span><div className={styles.bar}><div style={{ width: "75%" }} /></div><span>75%</span></li>
                <li><span>7 Day Package</span><div className={styles.bar}><div style={{ width: "60%" }} /></div><span>60%</span></li>
                <li><span>30 Day Package</span><div className={styles.bar}><div style={{ width: "45%" }} /></div><span>45%</span></li>
            </ul>
        </div>
    );
};

export default PopularPackages;
