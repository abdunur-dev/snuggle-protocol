import { MessageSquare, Briefcase, Database, DollarSign, Code2, Users, HardDrive, type LucideIcon } from "lucide-react";

export const CATEGORIES = [
  "Communication",
  "Productivity",
  "Database",
  "Finance",
  "Dev Tools",
  "Social",
  "Storage",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_ICONS: Record<Category, LucideIcon> = {
  Communication: MessageSquare,
  Productivity: Briefcase,
  Database: Database,
  Finance: DollarSign,
  "Dev Tools": Code2,
  Social: Users,
  Storage: HardDrive,
};
