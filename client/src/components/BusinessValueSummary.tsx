import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { KeywordResult } from "@shared/schema";

interface BusinessValueSummaryProps {
  results: KeywordResult[];
  cities: string[];
  industry: string;
}

export function BusinessValueSummary({ results, cities, industry }: BusinessValueSummaryProps) {
  const totalSearches = results.reduce((sum, k) => sum + k.searchVolume, 0);
  const highValueKeywords = results.filter(k => k.opportunity === "High");
  const contentTargets = results.filter(k => k.searchVolume <= 10 && k.cpc === 0);
  const totalAdBudget = Math.round(results.filter(k => k.searchVolume > 10).reduce((sum, k) => sum + (k.searchVolume * k.cpc * 0.30), 0));

  const getMarketInsights = () => {
    const insights = [];
    
    if (highValueKeywords.length >= 5) {
      insights.push(`Strong market opportunity with ${highValueKeywords.length} high-value keywords`);
    }
    
    if (totalAdBudget < 2000) {
      insights.push(`Affordable PPC entry point at ~$${totalAdBudget}/month`);
    }
    
    if (contentTargets.length >= 10) {
      insights.push(`${contentTargets.length} low-competition keywords perfect for SEO content strategy`);
    }

    return insights;
  };

  return (
    <Card className="mb-6 bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 capitalize">
          {industry.replace("-", " ")} Market Analysis - {cities.join(", ")}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{totalSearches.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Monthly Customer Searches</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-green-600">{highValueKeywords.length}</div>
            <div className="text-sm text-gray-600">Prime Opportunities</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-orange-600">${totalAdBudget.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Monthly Ad Investment</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-purple-600">{contentTargets.length}</div>
            <div className="text-sm text-gray-600">SEO Content Targets</div>
          </div>
        </div>

        {getMarketInsights().length > 0 && (
          <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <h4 className="font-semibold text-indigo-800 mb-2">🎯 Market Intelligence Summary</h4>
            <ul className="text-sm text-indigo-700 space-y-1">
              {getMarketInsights().map((insight, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-indigo-500 mr-2">•</span>
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}