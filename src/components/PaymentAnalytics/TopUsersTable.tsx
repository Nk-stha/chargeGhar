import React from "react";
import styles from "./PaymentAnalytics.module.css";
import { TopUser } from "../../types/dashboard.types";
import { analyticsService } from "../../lib/api/analytics.service";

interface Props {
  users: TopUser[];
}

const TopUsersTable: React.FC<Props> = ({ users }) => {


  return (
    <div className={styles.tableCard}>
      <div className={styles.sectionTitle}>Top Users by Transaction Volume</div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ color: '#fff' }}>User</th>
              <th style={{ color: '#fff' }}>Total Spent</th>
              <th style={{ color: '#fff' }}>Rentals</th>
              <th style={{ color: '#fff' }}>Top-ups</th>
              <th style={{ color: '#fff' }}>Wallet Bal</th>
              <th style={{ color: '#fff' }}>Gateways Used</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              return (
                <tr key={user.user_id}>
                  <td>
                    <div className={styles.userName}>{user.username}</div>
                    <div className={styles.userEmail}>{user.email}</div>
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    {analyticsService.formatCurrency(user.total_transaction_amount)}
                  </td>
                  <td>
                    {user.rental_count} ({analyticsService.formatCurrency(user.rental_payment_amount)})
                  </td>
                  <td>
                   {analyticsService.formatCurrency(user.topup_amount)}
                  </td>
                  <td style={{ color: "#a1a1aa" }}>
                    {analyticsService.formatCurrency(user.wallet_balance)}
                  </td>
                   <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                     {user.gateways_used.khalti > 0 && (
                        <span style={{ fontSize: '10px', padding: '2px 6px', backgroundColor: '#5C2D91', borderRadius: '4px' }}>Khalti</span>
                     )}
                     {user.gateways_used.esewa > 0 && (
                        <span style={{ fontSize: '10px', padding: '2px 6px', backgroundColor: '#60BB46', borderRadius: '4px' }}>eSewa</span>
                     )}
                     {user.gateways_used.stripe > 0 && (
                        <span style={{ fontSize: '10px', padding: '2px 6px', backgroundColor: '#635bff', borderRadius: '4px' }}>Stripe</span>
                     )}
                     {user.gateways_used.khalti === 0 && user.gateways_used.esewa === 0 && user.gateways_used.stripe === 0 && (
                        <span style={{ fontSize: '12px', color: '#666' }}>-</span>
                     )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopUsersTable;
