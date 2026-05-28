"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function AnalysisSkeleton() {
  return (
    <div className="animate-fade-in space-y-6" aria-busy="true" aria-label="Cargando análisis">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48 bg-white/10" />
        <Skeleton className="h-9 w-36 bg-white/10" />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-white/10 bg-white/5">
            <CardContent className="pt-4">
              <Skeleton className="h-12 w-full bg-white/10" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <Skeleton className="h-6 w-40 bg-white/10" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-full bg-white/10" />
          <Skeleton className="h-4 w-full bg-white/10" />
          <Skeleton className="h-4 w-3/4 bg-white/10" />
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-white/10 bg-white/5">
            <CardHeader>
              <Skeleton className="h-5 w-32 bg-white/10" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-full bg-white/10" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
