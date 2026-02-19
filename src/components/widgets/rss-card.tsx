"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rss, ExternalLink } from "lucide-react";
import type { WidgetData } from "@/lib/widgets/types";

interface RssItem {
  title: string;
  link: string;
  source: string;
  pubDate: string;
}

export function RssCard({ data }: { data: WidgetData }) {
  const items = (data.data.items as RssItem[]) || [];

  if (data.error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Rss className="h-4 w-4" />
            RSS Feeds
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Unable to load feeds.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Rss className="h-4 w-4" />
          RSS Feeds
          <Badge variant="secondary" className="ml-auto text-[10px]">
            Pro
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-muted-foreground py-4 text-center text-sm">
            No feed items. Configure feeds in Settings.
          </p>
        ) : (
          <div className="space-y-3">
            {items.slice(0, 8).map((item, i) => (
              <a
                key={`${item.source}-${i}`}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3"
              >
                <span className="bg-muted mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-medium">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="group-hover:text-primary text-sm leading-snug font-medium">
                    {item.title}
                    <ExternalLink className="ml-1 inline h-3 w-3 opacity-0 group-hover:opacity-100" />
                  </p>
                  <span className="text-muted-foreground text-[10px]">
                    {item.source}
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
