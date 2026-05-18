import type { AuthRole } from "@/types/auth";

export interface NavItem {
  href: string;
  label: string;
}

export const adminNavItems: NavItem[] = [
  { href: "/admin/dashboard", label: "Overview" },
  { href: "/admin/properties", label: "Properties" },
  { href: "/admin/room-types", label: "Room Types" },
  { href: "/admin/profile", label: "Profile" },
];

export const customerNavItems: NavItem[] = [
  { href: "/customer/dashboard", label: "Overview" },
  { href: "/customer/properties", label: "Properties" },
  { href: "/customer/room-types", label: "Room Types" },
  { href: "/customer/profile", label: "Profile" },
];

export function getHomeByRole(role: AuthRole) {
  if (role === "admin") {
    return "/admin/dashboard";
  }

  return "/customer/dashboard";
}
