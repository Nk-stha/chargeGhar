"use client";

import React from "react";
import styles from "./dataTable.module.css";
import { FiEdit, FiTrash2 } from "react-icons/fi";

interface Column {
    key: string;
    label: string;
    render?: (value: any, row: any, index: number) => React.ReactNode;
}

interface DataTableProps {
    columns: Column[];
    data: any[];
    onEdit?: (row: any) => void;
    onDelete?: (row: any) => void;
    onRowClick?: (row: any) => void;
}

const DataTable: React.FC<DataTableProps> = ({ columns, data, onEdit, onDelete, onRowClick }) => {
    return (
        <div className={styles.tableContainer}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th key={col.key}>{col.label}</th>
                        ))}
                        {(onEdit || onDelete) && <th>Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, i) => (
                        <tr
                            key={i}
                            onClick={() => onRowClick && onRowClick(row)}
                            className={onRowClick ? styles.clickableRow : ''}
                        >
                            {columns.map((col) => (
                                <td key={col.key}>
                                    {col.render ? col.render(row[col.key], row, i) : row[col.key]}
                                </td>
                            ))}
                            {(onEdit || onDelete) && (
                                <td>
                                    {onEdit && (
                                        <button
                                            className={styles.editBtn}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEdit(row);
                                            }}
                                        >
                                            <FiEdit />
                                        </button>
                                    )}
                                    {onDelete && (
                                        <button
                                            className={styles.deleteBtn}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(row);
                                            }}
                                        >
                                            <FiTrash2 />
                                        </button>
                                    )}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DataTable;
