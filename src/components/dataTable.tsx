"use client";

import React from "react";
import styles from "./settings.module.css";
import { FiEdit, FiTrash2 } from "react-icons/fi";

interface Column {
    key: string;
    label: string;
    render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
    columns: Column[];
    data: any[];
    onEdit?: (row: any) => void;
    onDelete?: (row: any) => void;
}

const DataTable: React.FC<DataTableProps> = ({ columns, data, onEdit, onDelete }) => {
    return (
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
                    <tr key={i}>
                        {columns.map((col) => (
                            <td key={col.key}>
                                {col.render ? col.render(row[col.key], row) : row[col.key]}
                            </td>
                        ))}
                        {(onEdit || onDelete) && (
                            <td>
                                {onEdit && (
                                    <button
                                        className={styles.editBtn}
                                        onClick={() => onEdit(row)}
                                    >
                                        <FiEdit />
                                    </button>
                                )}
                                {onDelete && (
                                    <button
                                        className={styles.deleteBtn}
                                        onClick={() => onDelete(row)}
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
    );
};

export default DataTable;
