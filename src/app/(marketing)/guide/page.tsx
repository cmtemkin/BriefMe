import { readFileSync, existsSync } from "fs";
import { join } from "path";

export const metadata = {
  title: "User Guide",
  description: "Learn how to use BriefMe",
};

export default function GuidePage() {
  let content = "The user guide is being generated. Check back soon!";

  const filePath = join(process.cwd(), "USER-GUIDE.md");
  if (existsSync(filePath)) {
    content = readFileSync(filePath, "utf-8");
  }

  const lines = content.split("\n");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">User Guide</h1>
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        {lines.map((line, i) => {
          if (line.startsWith("# ") && i === 0) return null; // Skip title (we have our own)
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
          if (line.startsWith("- ") || line.startsWith("* ")) {
            return (
              <p key={i} className="ml-4 text-sm">
                {line}
              </p>
            );
          }
          if (line.startsWith("> ")) {
            return (
              <blockquote
                key={i}
                className="text-muted-foreground border-l-2 pl-4 italic"
              >
                {line.replace("> ", "")}
              </blockquote>
            );
          }
          if (line.startsWith("---")) {
            return <hr key={i} className="my-6" />;
          }
          if (line.startsWith("**Q:")) {
            return (
              <p key={i} className="mt-3 font-semibold">
                {line.replace(/\*\*/g, "")}
              </p>
            );
          }
          if (line.startsWith("<!--")) return null;
          if (line.trim() === "") return null;
          return (
            <p key={i} className="text-sm">
              {line}
            </p>
          );
        })}
      </div>
    </div>
  );
}
