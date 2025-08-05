import type { KeywordResult, TAMCalculation } from "@shared/schema";

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
    "PPC Budget Cost ($/mo)"
  ];

  // Convert data to CSV rows
  const csvRows = [
    headers.join(","),
    ...data.map(row => [
      `"${row.keyword}"`,
      row.searchVolume,
      row.cpc.toFixed(2),
      Math.round(row.searchVolume * row.cpc * 0.30)
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
    "PPC Budget Cost ($/mo)"
  ];

  const csvRows = [
    headers.join(","),
    // Add summary row
    [
      `"${research.industry}"`,
      `"${research.cities.join(", ")}"`,
      `"${new Date(research.createdAt).toLocaleDateString()}"`,
      "","","",""
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
      Math.round(row.searchVolume * row.cpc * 0.30)
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

export function exportHVACTAMReport(research: { 
  industry: string; 
  cities: string[]; 
  results: KeywordResult[];
  createdAt: Date;
}, tamData: TAMCalculation) {
  const timestamp = new Date(research.createdAt).toISOString().split('T')[0];
  const citiesString = research.cities.join("_").replace(/\s+/g, "_");
  
  const filename = `HVAC_TAM_Report_${citiesString}_${timestamp}.csv`;
  
  // Create comprehensive TAM report with multiple sections
  const csvRows = [
    // Header Section
    '"HVAC Total Addressable Market (TAM) Analysis"',
    `"Generated Date:","${new Date(research.createdAt).toLocaleDateString()}"`,
    `"Market Area:","${research.cities.join(", ")}"`,
    `"Industry:","${research.industry}"`,
    "",
    
    // TAM Summary Section
    '"=== TAM SUMMARY ==="',
    '"Metric","Annual Volume","Revenue Potential"',
    `"Annual Search Volume","${tamData.annualSearchVolume.toLocaleString()}",""`,
    `"Full System Replacements (25%)","${tamData.fullSystemReplacements.annualVolume.toLocaleString()}","$${tamData.fullSystemReplacements.revenue.toLocaleString()}"`,
    `"Refrigerant Recharge (30%)","${tamData.refrigerantRecharge.annualVolume.toLocaleString()}","$${tamData.refrigerantRecharge.revenue.toLocaleString()}"`,
    `"Compressor/Fan Replacements (3%)","${tamData.compressorFanReplacements.annualVolume.toLocaleString()}","$${tamData.compressorFanReplacements.revenue.toLocaleString()}"`,
    "",
    `"TOTAL ADDRESSABLE MARKET","","$${tamData.totalNewRevenueOpportunity.toLocaleString()}"`,
    "",
    
    // Methodology Section
    '"=== METHODOLOGY ==="',
    '"This TAM calculation accounts for the 30% of HVAC customers"',
    '"who have annual maintenance contracts and won\'t search Google"',
    '"for emergency services. Revenue represents realistic opportunity"',
    '"available through PPC advertising campaigns."',
    "",
    '"Service Breakdown:"',
    '"- Full System Replacements: $15,000 average"',
    '"- Refrigerant Recharge: $800 average"',
    '"- Compressor/Fan Motor: $850 average"',
    "",
    
    // Keywords Section
    '"=== KEYWORD ANALYSIS ==="',
    '"Keyword","Monthly Search Volume","CPC ($)","Monthly PPC Budget ($)"',
    ...research.results
      .filter(k => k.searchVolume > 0)
      .sort((a, b) => b.searchVolume - a.searchVolume)
      .map(row => [
        `"${row.keyword}"`,
        row.searchVolume,
        row.cpc.toFixed(2),
        Math.round(row.searchVolume * row.cpc * 0.30)
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
export function exportAllReports(research: { 
  industry: string; 
  cities: string[]; 
  results: KeywordResult[];
  createdAt: Date;
}, tamData?: TAMCalculation) {
  const timestamp = new Date(research.createdAt).toISOString().split("T")[0];
  const citiesString = research.cities.join("_").replace(/\s+/g, "_");
  const industryName = research.industry.replace("-", "_");
  
  // Generate all four export files
  const keywordsWithVolume = research.results.filter(k => k.searchVolume > 0);
  const keywordsWithoutVolume = research.results.filter(k => k.searchVolume === 0);
  
  // 1. PPC Keywords Export
  exportToCSV(keywordsWithVolume, `PPC_Keywords_${industryName}_${citiesString}_${timestamp}.csv`);
  
  // Small delay between downloads to prevent browser blocking
  setTimeout(() => {
    // 2. SEO Targets Export
    exportToCSV(keywordsWithoutVolume, `SEO_Targets_${industryName}_${citiesString}_${timestamp}.csv`);
  }, 100);
  
  setTimeout(() => {
    // 3. Complete Dataset Export
    exportToCSV(research.results, `Complete_Dataset_${industryName}_${citiesString}_${timestamp}.csv`);
  }, 200);
  
  // 4. TAM Report Export (if HVAC and TAM data available)
  if (research.industry === "HVAC" && tamData) {
    setTimeout(() => {
      exportHVACTAMReport(research, tamData);
    }, 300);
  }
}
