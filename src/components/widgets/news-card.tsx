"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Newspaper, ExternalLink } from "lucide-react";
import type { WidgetData } from "@/lib/widgets/types";

interface Headline {
  id: number;
  title: string;
  url: string;
  source: string;
  section: string;
  summary: string;
}

export function NewsCard({ data }: { data: WidgetData }) {
  const headlines = (data.data.headlines as Headline[]) || [];

  if (data.error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Newspaper className="h-4 w-4" />
            News Headlines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Unable to load headlines.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Newspaper className="h-4 w-4" />
          News Headlines
        </CardTitle>
      </CardHeader>
      <CardContent>
        {headlines.length === 0 ? (
          <p className="text-muted-foreground py-4 text-center text-sm">
            No headlines available.
          </p>
        ) : (
          <div className="space-y-3">
            {headlines.map((headline, i) => (
              <a
                key={headline.id}
                href={headline.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3"
              >
                <span className="bg-muted mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-medium">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="group-hover:text-primary text-sm leading-snug font-medium">
                    {headline.title}
                    <ExternalLink className="ml-1 inline h-3 w-3 opacity-0 group-hover:opacity-100" />
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      {headline.section}
                    </Badge>
                    <span className="text-muted-foreground text-[10px]">
                      {headline.source}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
