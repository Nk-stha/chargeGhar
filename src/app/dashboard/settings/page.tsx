"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to Content Management as default settings page
    router.push("/dashboard/settings/content-management");
  }, [router]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "50vh",
        color: "#aaa",
      }}
    >
      <p>Redirecting to settings...</p>
    </div>
  );
}
