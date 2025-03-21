// update-readme.js
const Parser = require("rss-parser");
const fs = require("fs");

(async () => {
  const parser = new Parser();
  const feed = await parser.parseURL("https://sammyjohnrawlinson.teknabu.com/blog/rss.xml");

  const maxItems = 5;
  const blogPosts = feed.items.slice(0, maxItems).map((item) => {
    return `- [${item.title}](${item.link})`;
  }).join("\n");

  const readmePath = "./README.md";
  const readmeContent = fs.readFileSync(readmePath, "utf8");

  const startTag = "<!-- BLOG-POST-LIST:START -->";
  const endTag = "<!-- BLOG-POST-LIST:END -->";

  const newContent = `${startTag}\n${blogPosts}\n${endTag}`;
  const updatedReadme = readmeContent.replace(
    new RegExp(`${startTag}[\\s\\S]*?${endTag}`),
    newContent
  );

  fs.writeFileSync(readmePath, updatedReadme);
})();
