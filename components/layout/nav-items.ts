import {
  ClipboardList,
  FolderOpen,
  GitCompareArrows,
  LayoutDashboard,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/reports", label: "Reports", icon: ClipboardList },
  { href: "/my-reports", label: "My Reports", icon: FolderOpen },
  { href: "/matches", label: "Potential Matches", icon: GitCompareArrows },
  { href: "/settings", label: "Settings", icon: Settings },
];
