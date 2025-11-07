"use client"

import { useState, useEffect } from "react";
import Modal from "../../../components/modal/modal";
import styles from "./settings.module.css";
import { FiEdit, FiTrash2, FiPlus, FiUser, FiLock } from "react-icons/fi";
import { useDashboardData } from "../../../contexts/DashboardDataContext";
import axios from '../../../lib/axios';
import { isAxiosError } from "axios";
export default function SettingsPage() {
    // ================= STATE =================
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [selectedSection, setSelectedSection] = useState("");

    // Coupon form states
    const [couponCode, setCouponCode] = useState("");
    const [couponName, setCouponName] = useState("");
    const [pointsValue, setPointsValue] = useState("");
    const [maxUsesPerUser, setMaxUsesPerUser] = useState("");
    const [validFrom, setValidFrom] = useState("");
    const [validUntil, setValidUntil] = useState("");

    const [packages] = useState([
        { id: 1, name: "1 Hour Package", duration: "1 Hour", price: "₹100", active: true },
        { id: 2, name: "1 Day Package", duration: "1 Day", price: "₹500", active: false },
    ]);

    const [coupons, setCoupons] = useState<any[]>([]);
    const [pagination, setPagination] = useState<any>(null);


    const fetchCoupons = async (page = 1) => {
        try {
            const pageSize = 5; // Set page size to 5
            const response = await axios.get(`/api/admin/coupons?page=${page}&page_size=${pageSize}`);
            if (response.data.success) {
                setCoupons(response.data.data.results);
                setPagination(response.data.data.pagination);
            }
        } catch (error) {
            console.error("Error fetching coupons:", error);
        }
    };

    useEffect(() => {
        fetchCoupons(1);
    }, []);

    const [achievements] = useState([
        { id: 1, name: "Make First Purchase", points: 100, difficulty: "Easy", active: true },
    ]);

    const [admin, setAdmin] = useState({
        userId: "A1029",
        name: "Admin User",
        email: "mah******60@gmail.com",
        phone: "98******51",
    });

    // ================= HANDLERS =================
    const handleOpenModal = (title: string, section: string) => {
        setModalTitle(title);
        setSelectedSection(section);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleEdit = (field: keyof typeof admin) => {
        const newValue = prompt(`Enter new ${field}:`, admin[field]);
        if (newValue) {
            setAdmin({ ...admin, [field]: newValue });
        }
    };

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const current = form.current.value;
        const newPass = form.new.value;
        const confirm = form.confirm.value;

        if (newPass !== confirm) {
            alert("New passwords do not match!");
            return;
        }

        alert("Password updated successfully!");
        handleCloseModal();
    };

    const handleCreateCoupon = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('code', couponCode);
        formData.append('name', couponName);
        formData.append('points_value', pointsValue);
        formData.append('max_uses_per_user', maxUsesPerUser);
        formData.append('valid_from', validFrom);
        formData.append('valid_until', validUntil);

        try {
            const response = await axios.post('/api/admin/coupons', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            
            if (response.data.success) {
                console.log('Coupon created successfully:', response.data);
                alert(response.data.message);
                handleCloseModal();
                // Clear form fields on success
                setCouponCode("");
                setCouponName("");
                setPointsValue("");
                setMaxUsesPerUser("");
                setValidFrom("");
                setValidUntil("");
                fetchCoupons(); // Refresh the coupon list
            } else {
                console.error('Error creating coupon:', response.data.message);
                alert(response.data.message);
            }
        } catch (error) {
            console.error('Error creating coupon:', error);
            if (isAxiosError(error) && error.response) {
                const errorMessage = error.response.data.message || 'Failed to create coupon.';
                alert(errorMessage);
            } else {
                alert('Failed to create coupon.');
            }
        }
    };

    const handleDelete = async (code: string) => {
        if (window.confirm(`Are you sure you want to delete coupon ${code}?`)) {
            try {
                const response = await axios.delete(`/api/admin/coupons/${code}`);
                if (response.data.success) {
                    alert(response.data.message);
                    fetchCoupons(); // Refresh the list
                } else {
                    alert(response.data.message);
                }
            } catch (error) {
                console.error("Error deleting coupon:", error);
                if (isAxiosError(error) && error.response) {
                    alert(error.response.data.message || "Failed to delete coupon.");
                } else {
                    alert("Failed to delete coupon.");
                }
            }
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Settings</h1>
            <p className={styles.subtitle}>Manage system configurations</p>

            {/* ================= PACKAGES SECTION ================= */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2>Packages</h2>
                    <button
                        className={styles.addButton}
                        onClick={() => handleOpenModal("Add Package", "package")}
                    >
                        <FiPlus /> Add Package
                    </button>
                </div>

                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Package ID</th>
                            <th>Package Name</th>
                            <th>Duration</th>
                            <th>Price</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {packages.map((pkg: any) => (
                            <tr key={pkg.id}>
                                <td>{pkg.id}</td>
                                <td>{pkg.name}</td>
                                <td>{pkg.duration_display}</td>
                                <td>{pkg.price}</td>
                                <td>
                                    <span
                                        className={`${styles.status} ${pkg.active ? styles.active : styles.inactive
                                            }`}
                                    >
                                        {pkg.active ? "Active" : "Inactive"}
                                    </span>
                                </td>
                                <td>
                                    <button className={styles.editBtn}><FiEdit /></button>
                                    <button className={styles.deleteBtn}><FiTrash2 /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            {/* ================= COUPONS SECTION ================= */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2>Coupons</h2>
                    <button
                        className={styles.addButton}
                        onClick={() => handleOpenModal("Add Coupon", "coupon")}
                    >
                        <FiPlus /> Add Coupon
                    </button>
                </div>

                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Coupon ID</th>
                            <th>Coupon Code</th>
                            <th>Name</th>
                            <th>Points Value</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {coupons.map((c) => (
                            <tr key={c.id}>
                                <td>{c.id}</td>
                                <td>{c.code}</td>
                                <td>{c.name}</td>
                                <td>{c.points_value}</td>
                                <td>
                                    <span
                                        className={`${styles.status} ${c.status === "active" ? styles.active : styles.inactive
                                            }`}
                                    >
                                        {c.status}
                                    </span>
                                </td>
                                <td>
                                    <button className={styles.editBtn}><FiEdit /></button>
                                    <button className={styles.deleteBtn} onClick={() => handleDelete(c.code)}><FiTrash2 /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {pagination && (
                    <div className={styles.pagination}>
                        <button 
                            onClick={() => fetchCoupons(pagination.previous_page)}
                            disabled={!pagination.has_previous}
                        >
                            Previous
                        </button>
                        <span>
                            Page {pagination.current_page} of {pagination.total_pages}
                        </span>
                        <button 
                            onClick={() => fetchCoupons(pagination.next_page)}
                            disabled={!pagination.has_next}
                        >
                            Next
                        </button>
                    </div>
                )}
            </section>

            {/* ================= ACHIEVEMENTS SECTION ================= */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2>Achievements and Points Assignment</h2>
                    <div className={styles.headerActions}>
                        <button
                            className={styles.addButton}
                            onClick={() => handleOpenModal("Assign Points", "points")}
                        >
                            <FiPlus /> Assign Points
                        </button>
                        <button
                            className={styles.addButton}
                            onClick={() => handleOpenModal("Add Achievement", "achievement")}
                        >
                            <FiPlus /> Add Achievement
                        </button>
                    </div>
                </div>

                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Achievement ID</th>
                            <th>Achievement Name</th>
                            <th>Points Assigned</th>
                            <th>Difficulty</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {achievements.map((a) => (
                            <tr key={a.id}>
                                <td>{a.id}</td>
                                <td>{a.name}</td>
                                <td>{a.points} pts</td>
                                <td>{a.difficulty}</td>
                                <td>
                                    <span
                                        className={`${styles.status} ${a.active ? styles.active : styles.inactive
                                            }`}
                                    >
                                        {a.active ? "Active" : "Inactive"}
                                    </span>
                                </td>
                                <td>
                                    <button className={styles.editBtn}><FiEdit /></button>
                                    <button className={styles.deleteBtn}><FiTrash2 /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <section className={styles.profileSection}>
                <h2 className={styles.profileTitle}>Admin Profile Update</h2>

                <div className={styles.profileContainer}>
                    {/* LEFT CARD */}
                    <div className={styles.leftCard}>
                        <div className={styles.profileTop}>
                            <div className={styles.avatar}>
                                <FiUser className={styles.profileIcon} />
                            </div>
                            <div className={styles.profileHeader}>
                                <h3>{admin.name}</h3>
                                <button className={styles.editProfileBtn}>
                                    <FiEdit /> Edit Profile
                                </button>
                            </div>
                        </div>

                        <div className={styles.profileDetails}>
                            <div className={styles.profileRow}>
                                <span>User ID:</span>
                                <span>{admin.userId}</span>
                            </div>

                            <div className={styles.profileRow}>
                                <span>Username:</span>
                                <span>{admin.name}</span>
                                <button
                                    className={styles.inlineEdit}
                                    onClick={() => handleEdit("name")}
                                >
                                    <FiEdit />
                                </button>
                            </div>

                            <div className={styles.profileRow}>
                                <span>Email:</span>
                                <span>{admin.email}</span>
                                <button
                                    className={styles.inlineEdit}
                                    onClick={() => handleEdit("email")}
                                >
                                    <FiEdit />
                                </button>
                            </div>

                            <div className={styles.profileRow}>
                                <span>Phone:</span>
                                <span>{admin.phone}</span>
                                <button
                                    className={styles.inlineEdit}
                                    onClick={() => handleEdit("phone")}
                                >
                                    <FiEdit />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT CARD */}
                    <div className={styles.rightCard}>
                        <h3 className={styles.authTitle}>
                            <FiLock /> Password and Authentication
                        </h3>
                        <button
                            className={styles.changePassBtn}
                            onClick={() => handleOpenModal("Change Password", "password")}
                        >
                            Change Password
                        </button>


                        <div className={styles.authBox}>
                            <h4>Email Authentication</h4>
                            <p>
                                Verify your authentication using Gmail. Your current email account is:{" "}
                                <span className={styles.bold}>{admin.email}</span>
                            </p>
                            <div className={styles.active}>
                                <label>Active Authentication</label>
                            </div>
                        </div>

                        <div className={styles.authBox}>
                            <h4>SMS Authentication</h4>
                            <p>
                                Verify using SMS sent to your phone number. Your current phone number is:{" "}
                                <span className={styles.bold}>{admin.phone}</span>
                            </p>
                            <div className={styles.deactivate}>
                                <label>Deactivate SMS Authentication</label>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= MODAL SECTION ================= */}
            <Modal title={modalTitle} isOpen={isModalOpen} onClose={handleCloseModal}>
                {selectedSection === "package" && (
                    <>
                        <label>Package Name</label>
                        <input type="text" placeholder="Enter package name" />
                        <label>Duration</label>
                        <input type="text" placeholder="Enter duration" />
                        <label>Price</label>
                        <input type="text" placeholder="Enter price" />
                        <button className={styles.saveBtn}>Save</button>
                    </>
                )}

                {selectedSection === "coupon" && (
                    <form onSubmit={handleCreateCoupon}>
                        <label>Coupon Code</label>
                        <input type="text" placeholder="Enter coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} required />
                        <label>Coupon Name</label>
                        <input type="text" placeholder="Enter coupon name" value={couponName} onChange={(e) => setCouponName(e.target.value)} required />
                        <label>Points Value</label>
                        <input type="number" placeholder="Enter points value" value={pointsValue} onChange={(e) => setPointsValue(e.target.value)} required />
                        <label>Max Uses Per User</label>
                        <input type="number" placeholder="Enter max uses per user" value={maxUsesPerUser} onChange={(e) => setMaxUsesPerUser(e.target.value)} required />
                        <label>Valid From</label>
                        <input type="datetime-local" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} required />
                        <label>Valid Until</label>
                        <input type="datetime-local" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} required />
                        <button type="submit" className={styles.saveBtn}>Create Coupon</button>
                    </form>
                )}

                {selectedSection === "achievement" && (
                    <>
                        <label>Achievement Name</label>
                        <input type="text" placeholder="Enter achievement name" />
                        <label>Points</label>
                        <input type="text" placeholder="Enter points" />
                        <label>Difficulty</label>
                        <select>
                            <option>Easy</option>
                            <option>Medium</option>
                            <option>Hard</option>
                        </select>
                        <button className={styles.saveBtn}>Save</button>
                    </>
                )}

                {selectedSection === "points" && (
                    <>
                        <label>User Email</label>
                        <input type="email" placeholder="Enter user email" />
                        <label>Points Amount</label>
                        <input type="number" placeholder="Enter points amount" />
                        <label>Description (optional)</label>
                        <input type="text" placeholder="Reason for assigning points" />
                        <button className={styles.saveBtn}>Assign Points</button>
                    </>
                )}


                {selectedSection === "password" && (
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const current = (e.currentTarget.elements.namedItem("current") as HTMLInputElement).value;
                            const newPass = (e.currentTarget.elements.namedItem("new") as HTMLInputElement).value;
                            const confirm = (e.currentTarget.elements.namedItem("confirm") as HTMLInputElement).value;

                            if (newPass !== confirm) {
                                alert("New passwords do not match!");
                                return;
                            }

                            alert("Password updated successfully!");
                            handleCloseModal();
                        }}
                    >
                        <label>Current Password</label>
                        <input name="current" type="password" placeholder="Enter current password" />

                        <label>New Password</label>
                        <input name="new" type="password" placeholder="Enter new password" />

                        <label>Confirm New Password</label>
                        <input name="confirm" type="password" placeholder="Confirm new password" />

                        <button type="submit" className=".changePassBtn">Update Password</button>
                    </form>
                )}

            </Modal>
        </div>
    );
}
