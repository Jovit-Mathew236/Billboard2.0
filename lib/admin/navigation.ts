import {
  Eye,
  FlaskConical,
  PenSquare,
  GraduationCap,
  Images,
  LayoutDashboard,
  LucideIcon,
  Settings2,
  TrendingUp,
  Users,
  UsersRound,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  mobile?: boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, mobile: true },
      { href: "/admin/edit", label: "Edit display", icon: PenSquare, mobile: true },
      { href: "/admin/preview", label: "Live preview", icon: Eye },
    ],
  },
  {
    label: "Display content",
    items: [
      { href: "/admin/general", label: "Branding", icon: Settings2 },
      { href: "/admin/staff", label: "Staff counts", icon: UsersRound },
      { href: "/admin/faculty", label: "Faculty", icon: GraduationCap, mobile: true },
      { href: "/admin/labs", label: "Labs", icon: FlaskConical },
      { href: "/admin/batches", label: "Batch highlights", icon: TrendingUp },
      { href: "/admin/gallery", label: "Photo carousel", icon: Images, mobile: true },
    ],
  },
  {
    label: "Access",
    items: [{ href: "/admin/users", label: "Users", icon: Users }],
  },
];

export const NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

export const isActive = (pathname: string, href: string) =>
  href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
