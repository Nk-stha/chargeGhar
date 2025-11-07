"use client";

import React from "react";
import styles from "./modal.module.css";

interface ModalProps {
    title: string;
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ title, isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h3>{title}</h3>
                    <button onClick={onClose} className={styles.closeBtn}>×</button>
                </div>
                <div className={styles.content}>{children}</div>
            </div>
        </div>
    );
};

export default Modal;
