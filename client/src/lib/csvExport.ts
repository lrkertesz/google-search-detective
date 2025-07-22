import type { KeywordResult } from "@shared/schema";

export function exportToCSV(data: KeywordResult[], filename: string) {
  if (data.length === 0) {
    console.warn("No data to export");
    return;
  }

  // CSV headers
  const headers = [
    "Keyword", 
    "Search Volume",
    "CPC ($)",
    "Competition (%)",
    "Opportunity Level"
  ];

  // Convert data to CSV rows
  const csvRows = [
    headers.join(","),
    ...data.map(row => [
      `"${row.keyword}"`,
      row.searchVolume,
      row.cpc.toFixed(2),
      row.competition,
      `"${row.opportunity}"`
    ].join(","))
  ];

  // Create CSV content
  const csvContent = csvRows.join("\n");

  // Create and trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export function exportAllResults(research: { 
  industry: string; 
  cities: string[]; 
  results: KeywordResult[];
  createdAt: Date;
}) {
  const timestamp = new Date(research.createdAt).toISOString().split('T')[0];
  const industryName = research.industry.replace("-", "_");
  const citiesString = research.cities.join("_").replace(/\s+/g, "_");
  
  const filename = `keyword_research_${industryName}_${citiesString}_${timestamp}.csv`;
  
  // Add metadata headers
  const headers = [
    "Industry",
    "Cities",
    "Generated Date",
    "Keyword",
    "Search Volume",
    "CPC ($)",
    "Competition (%)",
    "Opportunity Level"
  ];

  const csvRows = [
    headers.join(","),
    // Add summary row
    [
      `"${research.industry}"`,
      `"${research.cities.join(", ")}"`,
      `"${new Date(research.createdAt).toLocaleDateString()}"`,
      "","","","","",""
    ].join(","),
    // Add empty row for separation
    "",
    // Add data rows
    ...research.results.map(row => [
      `"${research.industry}"`,
      `"${research.cities.join(", ")}"`,
      `"${new Date(research.createdAt).toLocaleDateString()}"`,
      `"${row.keyword}"`,
      row.searchVolume,
      row.cpc.toFixed(2),
      row.competition,
      `"${row.opportunity}"`
    ].join(","))
  ];

  const csvContent = csvRows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
