// update-profile.js
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

const GITHUB_USERNAME = "sammyjohnrawlinson";
const MAX_PROJECTS = 5;
const README_PATH = path.join(__dirname, "README.md");

const FEATURED_START = "<!-- FEATURED-PROJECTS:START -->";
const FEATURED_END = "<!-- FEATURED-PROJECTS:END -->";
const TOPICS_START = "<!-- TOPICS:START -->";
const TOPICS_END = "<!-- TOPICS:END -->";

(async () => {
  const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100`, {
    headers: {
      "Authorization": `Bearer ${process.env.PERSONAL_TOKEN}`,
      "Accept": "application/vnd.github+json"
    }
  });

  const repos = (await res.json())
    .filter(repo => !repo.fork)
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, MAX_PROJECTS);

  const featuredMarkdown = repos.map(repo => {
    const tags = repo.topics?.length ? `**Tags:** ${repo.topics.map(t => `\`${t}\``).join(", ")}` : "";
    return `### [${repo.name}](${repo.html_url})\n${repo.description || "_No description_"}\n${tags}`;
  }).join("\n\n");

  const allTopics = new Set();
  repos.forEach(repo => repo.topics?.forEach(t => allTopics.add(t)));
  const topicsMarkdown = [...allTopics].map(t => `\`${t}\``).join(" ");

  let readme = fs.readFileSync(README_PATH, "utf8");
  readme = readme.replace(
    new RegExp(`${FEATURED_START}[\\s\\S]*?${FEATURED_END}`),
    `${FEATURED_START}\n${featuredMarkdown}\n${FEATURED_END}`
  );
  readme = readme.replace(
    new RegExp(`${TOPICS_START}[\\s\\S]*?${TOPICS_END}`),
    `${TOPICS_START}\n${topicsMarkdown}\n${TOPICS_END}`
  );

  fs.writeFileSync(README_PATH, readme);
})();
