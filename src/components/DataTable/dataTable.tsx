"use client";

import React from "react";
import styles from "./dataTable.module.css";

interface Column {
    header: string;
    accessor: string;
    render?: (value: any, row: any) => React.ReactNode;
    align?: 'left' | 'right' | 'center';
}

interface DataTableProps {
    title?: string;
    subtitle?: string;
    columns: Column[];
    data: any[];
    emptyMessage?: string;
    loading?: boolean;
    mobileCardRender?: (row: any) => React.ReactNode;
    onRowClick?: (row: any) => void;
}

const DataTable: React.FC<DataTableProps> = ({
    title,
    subtitle,
    columns,
    data,
    emptyMessage,
    loading,
    mobileCardRender,
    onRowClick,
}) => {
    return (
        <div className={styles.tableWrapper}>
            {title && (
                <div className={styles.tableHeader}>
                    <div className={styles.tableInfo}>
                        <h3>{title}</h3>
                        {subtitle && <p>{subtitle}</p>}
                    </div>
                </div>
            )}

            {loading ? (
                <div className={styles.loadingContainer}>Loading...</div>
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className={styles.desktopTable}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    {columns.map((col) => (
                                        <th
                                            key={col.header}
                                            className={col.align === 'right' ? styles.alignRight : ''}
                                        >
                                            {col.header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.length > 0 ? (
                                    data.map((row, idx) => (
                                        <tr 
                                            key={idx}
                                            onClick={() => onRowClick?.(row)}
                                            className={onRowClick ? styles.clickableRow : ''}
                                        >
                                            {columns.map((col) => (
                                                <td
                                                    key={col.header}
                                                    className={col.align === 'right' ? styles.alignRight : ''}
                                                >
                                                    {col.render
                                                        ? col.render(row[col.accessor], row)
                                                        : row[col.accessor]}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={columns.length} className={styles.noData}>
                                            {emptyMessage || "No data available"}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className={styles.mobileCards}>
                        {data.length > 0 ? (
                            data.map((row, idx) => (
                                <div 
                                    key={idx} 
                                    className={`${styles.mobileCard} ${onRowClick ? styles.clickableCard : ''}`}
                                    onClick={() => onRowClick?.(row)}
                                >
                                    {mobileCardRender ? (
                                        mobileCardRender(row)
                                    ) : (
                                        <div className={styles.mobileCardDefault}>
                                            {columns.slice(0, 3).map((col) => (
                                                <div key={col.header} className={styles.mobileCardRow}>
                                                    <span className={styles.mobileCardLabel}>{col.header}:</span>
                                                    <span className={styles.mobileCardValue}>
                                                        {col.render
                                                            ? col.render(row[col.accessor], row)
                                                            : row[col.accessor]}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className={styles.noData}>
                                {emptyMessage || "No data available"}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default DataTable;