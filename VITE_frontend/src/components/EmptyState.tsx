import { cn } from "@/lib/utils"
import { FileText, Package, Search, Users } from "lucide-react"

interface EmptyStateProps {
  icon?: "package" | "file" | "users" | "search"
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

const icons = {
  package: Package,
  file: FileText,
  users: Users,
  search: Search,
}

export function EmptyState({
  icon = "package",
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const IconComponent = icons[icon]

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
    >
      <div className="rounded-full bg-muted p-4 mb-4">
        <IconComponent className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-4">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
