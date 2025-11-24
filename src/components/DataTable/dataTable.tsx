"use client";

import React from "react";
import styles from "./dataTable.module.css";

interface Column {
    header: string;
    accessor: string;
    render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
    title?: string;
    subtitle?: string;
    columns: {
        header: string;
        accessor: string;
        render?: (value: any, row?: any) => React.ReactNode;
    }[];
    data: any[];
    emptyMessage?: string;
    loading?: boolean; 
}

const DataTable: React.FC<DataTableProps> = ({
    title,
    subtitle,
    columns,
    data,
    emptyMessage,
    loading,
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
                <table className={styles.table}>
                    <thead>
                        <tr>
                            {columns.map((col) => (
                                <th key={col.header}>{col.header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.length > 0 ? (
                            data.map((row, idx) => (
                                <tr key={idx}>
                                    {columns.map((col) => (
                                        <td key={col.header}>
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
            )}
        </div>
    );
};

export default DataTable;