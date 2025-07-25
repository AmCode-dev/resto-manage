import { Skeleton } from "@/components/ui/skeleton"

export default function ConfiguracionLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-5 w-96" />

      <div className="flex space-x-2">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  )
}
