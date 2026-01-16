import React, { useEffect, useState } from "react";
import { FiTrash2, FiBatteryCharging } from "react-icons/fi";
import { PowerbankAssignmentInput } from "../../types/station.types";
import styles from "./PowerbankAssignment.module.css";

interface PowerbankAssignmentProps {
  totalSlots: number;
  assignments: PowerbankAssignmentInput[];
  onChange: (assignments: PowerbankAssignmentInput[]) => void;
}

const PowerbankAssignment: React.FC<PowerbankAssignmentProps> = ({
  totalSlots,
  assignments,
  onChange,
}) => {
  // Generate slots based on totalSlots
  const slots = Array.from({ length: totalSlots }, (_, i) => i + 1);

  const getPowerbankForSlot = (slotNum: number) => {
    return assignments.find((a) => a.slot_number === slotNum)?.powerbank_serial || "";
  };

  const handleInputChange = (slotNum: number, value: string) => {
    const newAssignments = [...assignments];
    const existingIndex = newAssignments.findIndex((a) => a.slot_number === slotNum);

    if (value.trim() === "") {
      // Remove assignment if empty
      if (existingIndex !== -1) {
        newAssignments.splice(existingIndex, 1);
      }
    } else {
      // Add or update assignment
      if (existingIndex !== -1) {
        newAssignments[existingIndex].powerbank_serial = value;
      } else {
        newAssignments.push({
          slot_number: slotNum,
          powerbank_serial: value,
        });
      }
    }

    onChange(newAssignments);
  };

  return (
    <div className={styles.assignmentContainer}>
      <h3 className={styles.title}>Powerbank Assignments</h3>
      <p className={styles.description}>
        Assign powerbanks to slots (Optional). Leave blank for empty slots.
      </p>

      <div className={styles.gridHeader}>
        <span className={styles.headerLabel}>Slot #</span>
        <span className={styles.headerLabel}>Powerbank Serial Number</span>
        <span className={styles.headerLabel}>Action</span>
      </div>

      {slots.map((slotNum) => {
        const serial = getPowerbankForSlot(slotNum);
        
        return (
          <div key={slotNum} className={styles.assignmentRow}>
            <div className={styles.slotNumber}>
              <FiBatteryCharging style={{ marginRight: "4px" }} /> {slotNum}
            </div>
            
            <input
              type="text"
              className={styles.input}
              placeholder="Enter PB Serial No."
              value={serial}
              onChange={(e) => handleInputChange(slotNum, e.target.value)}
            />
            
            <button
              className={styles.clearButton}
              onClick={() => handleInputChange(slotNum, "")}
              disabled={!serial}
              title="Clear Assignment"
            >
              <FiTrash2 />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default PowerbankAssignment;
