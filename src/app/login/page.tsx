"use client";

import React, { useState, FormEvent } from "react";
import styles from "./login.module.css";
import { FiEye, FiEyeOff, FiLock, FiLoader } from "react-icons/fi";
import { useRouter } from "next/navigation";
import axios from "axios";

const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

const Login: React.FC = () => {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const csrfToken = getCookie('csrftoken');
      const response = await axios.post(
        "/api/login",
        { email, password },
        {
          headers: {
            'X-CSRFTOKEN': csrfToken,
          },
        }
      );
      if (response.data.data.access_token) {
        localStorage.setItem("accessToken", response.data.data.access_token);
      }
      if (response.data.data.refresh_token) {
        localStorage.setItem("refreshToken", response.data.data.refresh_token);
      }

      console.log("Logged in successfully!");
      router.push("/dashboard");
    } catch (error: any) {
      console.log("Login error:", error.response.data);
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      {/* Left Section */}
      <div className={styles.loginLeft}>
        <div className={styles.overlayWaves}></div>
        <div className={styles.brand}>
          <img
            src="/ChargeGharLogo.png"
            alt="Charge Ghar Logo"
            className={styles.brandLogo}
            width={300}
            height={50}
          />
        </div>
      </div>

      {/* Right Section */}
      <div className={styles.loginRight}>
        <form className={styles.loginBox} onSubmit={handleSubmit}>
          <h2>
            Welcome, <span>Admin</span>
          </h2>

          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={error ? styles.error : ""}
            required
          />

          <label htmlFor="password">Password</label>
          <div className={styles.passwordInput}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={error ? styles.error : ""}
              required
            />
            <button
              type="button"
              className={styles.togglePassword}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          {error && <p className={styles.errorText}>{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? (
              <>
                <FiLoader className={styles.spin} /> Logging in...
              </>
            ) : (
              <>
                <FiLock /> Login
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
