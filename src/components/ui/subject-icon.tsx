import * as LucideIcons from "lucide-react";

interface SubjectIconProps {
  name: string;
  size?: number;
  className?: string;
}

export function SubjectIcon({ name, size = 24, className }: SubjectIconProps) {
  // @ts-ignore
  const Icon = LucideIcons[name] || LucideIcons.BookOpen;
  return <Icon size={size} className={className} />;
}
