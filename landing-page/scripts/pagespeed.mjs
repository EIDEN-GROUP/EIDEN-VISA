import "dotenv/config";

const target = process.argv[2] || "https://visa.eiden-group.com/";
const apiKey = process.env.PAGESPEED_API_KEY?.trim();
const metrics = [
  ["largest-contentful-paint", "LCP"],
  ["interaction-to-next-paint", "INP"],
  ["cumulative-layout-shift", "CLS"],
  ["first-contentful-paint", "FCP"],
  ["total-blocking-time", "TBT"],
];

if (!URL.canParse(target) || !/^https?:$/.test(new URL(target).protocol)) {
  console.error("Usage: npm run pagespeed -- [https://visa.eiden-group.com/page/]");
  process.exit(2);
}

for (const strategy of ["mobile", "desktop"]) {
  const endpoint = new URL("https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed");
  endpoint.searchParams.set("url", target);
  endpoint.searchParams.set("strategy", strategy);
  endpoint.searchParams.set("category", "performance");
  endpoint.searchParams.set("locale", "en");
  if (apiKey) endpoint.searchParams.set("key", apiKey);

  console.log(`\nPageSpeed Insights — ${strategy}: ${target}`);
  const response = await fetch(endpoint);
  const result = await response.json();
  if (!response.ok) {
    const message = result.error?.message || `${response.status} ${response.statusText}`;
    throw new Error(`${strategy} audit failed: ${message}${!apiKey ? " (set PAGESPEED_API_KEY in landing-page/.env)" : ""}`);
  }

  const lighthouse = result.lighthouseResult;
  const score = lighthouse.categories.performance.score;
  console.log(`Performance score: ${Math.round(score * 100)}/100`);
  for (const [id, label] of metrics) {
    const value = lighthouse.audits[id]?.displayValue;
    if (value) console.log(`${label}: ${value}`);
  }

  const opportunities = Object.values(lighthouse.audits)
    .filter((audit) => audit.details?.type === "opportunity" && audit.score !== null && audit.score < 1)
    .sort((a, b) => (b.details?.overallSavingsMs || 0) - (a.details?.overallSavingsMs || 0))
    .slice(0, 5);
  if (opportunities.length) {
    console.log("Largest opportunities:");
    for (const audit of opportunities) {
      const saving = audit.displayValue ? ` — ${audit.displayValue}` : "";
      console.log(`- ${audit.title}${saving}`);
    }
  }
}
