import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("/login");
}
// src/constants/routes.ts
export const DASHBOARD_PATH = "/dashboard";
