import Image from "next/image";
import Link from "next/link";
import { ImageOff, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type ProviderCardData = {
  id: string;
  displayName: string;
  description: string;
  photoUrl: string | null;
  categoryNames: string[];
  ratingAverage: number | null;
  ratingCount: number;
};

export function ProviderCard({ provider }: { provider: ProviderCardData }) {
  return (
    <Link href={`/diretorio/${provider.id}`}>
      <Card className="h-full transition-colors hover:bg-muted/50">
        <CardContent className="flex flex-col gap-3">
          <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
            {provider.photoUrl ? (
              <Image
                src={provider.photoUrl}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover"
              />
            ) : (
              <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-1 text-sm">
                <ImageOff className="size-5" />
                Sem foto
              </div>
            )}
          </div>

          <div>
            <h3 className="font-medium leading-tight">{provider.displayName}</h3>
            <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
              {provider.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {provider.categoryNames.slice(0, 3).map((name) => (
              <Badge key={name} variant="secondary">
                {name}
              </Badge>
            ))}
            {provider.categoryNames.length > 3 && (
              <Badge variant="secondary">+{provider.categoryNames.length - 3}</Badge>
            )}
          </div>

          {provider.ratingCount > 0 && (
            <p className="text-muted-foreground flex items-center gap-1 text-sm">
              <Star className="size-3.5 fill-amber-500 text-amber-500" />
              {provider.ratingAverage?.toFixed(1)} ({provider.ratingCount})
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
