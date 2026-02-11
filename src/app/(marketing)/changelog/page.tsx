import { readFileSync, existsSync } from "fs";
import { join } from "path";

export const metadata = {
  title: "Changelog",
  description: "See what's new in BriefMe",
};

export default function ChangelogPage() {
  let content = "No release notes yet. Check back after the first release!";

  const filePath = join(process.cwd(), "RELEASE-NOTES.md");
  if (existsSync(filePath)) {
    content = readFileSync(filePath, "utf-8");
  }

  // Simple markdown-to-text rendering for now
  const lines = content.split("\n");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Changelog</h1>
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        {lines.map((line, i) => {
          if (line.startsWith("## ")) {
            return (
              <h2 key={i} className="mt-8 text-xl font-bold">
                {line.replace("## ", "")}
              </h2>
            );
          }
          if (line.startsWith("### ")) {
            return (
              <h3 key={i} className="mt-4 text-lg font-semibold">
                {line.replace("### ", "")}
              </h3>
            );
          }
          if (line.startsWith("- ")) {
            return (
              <p key={i} className="text-muted-foreground ml-4 text-sm">
                {line}
              </p>
            );
          }
          if (line.startsWith("---")) {
            return <hr key={i} className="my-6" />;
          }
          if (line.trim() === "") return null;
          return (
            <p key={i} className="text-muted-foreground text-sm">
              {line}
            </p>
          );
        })}
      </div>
    </div>
  );
}
