import React from "react";
import styles from "./Skeleton.module.css";

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  style?: React.CSSProperties;
}

const Skeleton: React.FC<SkeletonProps> = ({
  className,
  width,
  height,
  style,
}) => {
  return (
    <div
      className={`${styles.skeleton} ${className || ""}`}
      style={{
        width,
        height,
        ...style,
      }}
    />
  );
};

export default Skeleton;
