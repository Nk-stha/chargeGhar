"use client";

import React from "react";
import { FiX } from "react-icons/fi";
import styles from "./modal.module.css";

interface ModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

function Modal({ title, isOpen, onClose, children, size = "lg" }: ModalProps) {
  if (!isOpen) return null;

  const sizeClass = size === "sm" ? styles.modalSm : size === "md" ? styles.modalMd : "";

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div 
        className={`${styles.modal} ${sizeClass}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h3>{title}</h3>
          <button onClick={onClose} className={styles.closeBtn} aria-label="Close">
            <FiX />
          </button>
        </div>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}

export default Modal;
