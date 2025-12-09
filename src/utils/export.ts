import type { Need, IndustryExpression } from "../types";

interface ExportData {
  need: Need;
  analyzedExpressions?: {
    mechanisms: string[];
    deepDives: string[];
  };
}

/**
 * Export need data as JSON
 */
export function exportAsJSON(data: ExportData): void {
  const jsonString = JSON.stringify(data, null, 2);
  downloadFile(jsonString, `${sanitizeFilename(data.need.name)}.json`, "application/json");
}

/**
 * Export need data as Markdown report
 */
export function exportAsMarkdown(data: ExportData): void {
  const { need, analyzedExpressions } = data;
  let markdown = `# ${need.name}\n\n`;
  markdown += `**Research Date:** ${new Date().toLocaleDateString()}\n\n`;
  
  if (need.priorArt) {
    markdown += `## Prior Art\n\n`;
    
    if (need.priorArt.currentLeaders && need.priorArt.currentLeaders.length > 0) {
      markdown += `### Current Leaders\n\n`;
      need.priorArt.currentLeaders.forEach((art) => {
        markdown += `- **${art.name}**`;
        if (art.domain) markdown += ` (${art.domain})`;
        markdown += `\n  - Mechanism: ${art.mechanism}\n`;
        if (art.limitation) markdown += `  - Limitation: ${art.limitation}\n`;
      });
      markdown += `\n`;
    }

    if (need.priorArt.historicalPrecedents && need.priorArt.historicalPrecedents.length > 0) {
      markdown += `### Historical Precedents\n\n`;
      need.priorArt.historicalPrecedents.forEach((art) => {
        markdown += `- **${art.name}**`;
        if (art.era) markdown += ` (${art.era})`;
        markdown += `\n  - Mechanism: ${art.mechanism}\n`;
        if (art.lesson) markdown += `  - Lesson: ${art.lesson}\n`;
      });
      markdown += `\n`;
    }

    if (need.priorArt.adjacentDomains && need.priorArt.adjacentDomains.length > 0) {
      markdown += `### Adjacent Domains\n\n`;
      need.priorArt.adjacentDomains.forEach((art) => {
        markdown += `- **${art.name}**`;
        if (art.originalDomain) markdown += ` (from ${art.originalDomain})`;
        markdown += `\n  - Mechanism: ${art.mechanism}\n`;
        if (art.transferPotential) markdown += `  - Transfer Potential: ${art.transferPotential}\n`;
      });
      markdown += `\n`;
    }

    if (need.priorArt.natureSolutions && need.priorArt.natureSolutions.length > 0) {
      markdown += `### Nature Solutions\n\n`;
      need.priorArt.natureSolutions.forEach((art) => {
        markdown += `- **${art.name}**\n  - Mechanism: ${art.mechanism}\n`;
        if (art.biomimicryPotential) markdown += `  - Biomimicry Potential: ${art.biomimicryPotential}\n`;
      });
      markdown += `\n`;
    }
  }

  markdown += `## Predictions\n\n`;
  
  need.eras.forEach((era) => {
    markdown += `### ${era.name}\n\n`;
    const expressions = Array.isArray(era.expressions) ? era.expressions : [];
    markdown += renderPredictionsMarkdown(expressions as IndustryExpression[], 0, analyzedExpressions);
    markdown += `\n`;
  });

  downloadFile(markdown, `${sanitizeFilename(need.name)}.md`, "text/markdown");
}

/**
 * Recursively render predictions as markdown
 */
function renderPredictionsMarkdown(
  predictions: IndustryExpression[],
  depth: number,
  analyzedExpressions?: { mechanisms: string[]; deepDives: string[] }
): string {
  let output = "";
  const indent = "  ".repeat(depth);

  predictions.forEach((pred) => {
    const badges: string[] = [];
    if (pred.userAdded) badges.push("👤 User-added");
    if (analyzedExpressions?.mechanisms.includes(pred.id)) badges.push("🔬 Mechanism");
    if (analyzedExpressions?.deepDives.includes(pred.id)) badges.push("💼 Deep Dive");

    output += `${indent}- **${pred.name}**`;
    if (badges.length > 0) output += ` _[${badges.join(", ")}]_`;
    output += `\n`;

    if (pred.mutation) {
      output += `${indent}  - 🔄 **Mutation:** ${pred.mutation}\n`;
    }
    if (pred.insight) {
      output += `${indent}  - 💡 **Insight:** ${pred.insight}\n`;
    }

    if (pred.children && pred.children.length > 0) {
      output += renderPredictionsMarkdown(pred.children, depth + 1, analyzedExpressions);
    }
  });

  return output;
}

/**
 * Export need data as CSV (flat list)
 */
export function exportAsCSV(data: ExportData): void {
  const { need, analyzedExpressions } = data;
  const rows: string[][] = [
    ["Prediction", "Parent", "Depth", "Era", "User-Added", "Has Mechanism", "Has Deep Dive", "Mutation", "Insight"]
  ];

  need.eras.forEach((era) => {
    const expressions = Array.isArray(era.expressions) ? era.expressions : [];
    flattenPredictions(expressions as IndustryExpression[], null, 0, rows, analyzedExpressions, era.name);
  });

  const csv = rows.map(row => 
    row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(",")
  ).join("\n");

  downloadFile(csv, `${sanitizeFilename(need.name)}.csv`, "text/csv");
}

/**
 * Flatten prediction tree for CSV export
 */
function flattenPredictions(
  predictions: IndustryExpression[],
  parentName: string | null,
  depth: number,
  rows: string[][],
  analyzedExpressions?: { mechanisms: string[]; deepDives: string[] },
  eraName?: string
): void {
  predictions.forEach((pred) => {
    const hasMechanism = analyzedExpressions?.mechanisms.includes(pred.id) ? "Yes" : "No";
    const hasDeepDive = analyzedExpressions?.deepDives.includes(pred.id) ? "Yes" : "No";

    rows.push([
      pred.name,
      parentName || "Root",
      depth.toString(),
      eraName || "",
      pred.userAdded ? "Yes" : "No",
      hasMechanism,
      hasDeepDive,
      pred.mutation || "",
      pred.insight || ""
    ]);

    if (pred.children && pred.children.length > 0) {
      flattenPredictions(pred.children, pred.name, depth + 1, rows, analyzedExpressions, eraName);
    }
  });
}

/**
 * Download a file to the user's device
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Sanitize filename by removing/replacing invalid characters
 */
function sanitizeFilename(name: string): string {
  return name
    .replace(/[<>:"/\\|?*]/g, "-")
    .replace(/\s+/g, "_")
    .toLowerCase();
}
