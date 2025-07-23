import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Star, TrendingUp, Users, DollarSign } from "lucide-react";

export function ReportPreview() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Report Header */}
      <div className="text-center mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
        <div className="text-sm text-gray-500 mb-2">NextWave Research</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">CONFIDENTIAL MARKET INTELLIGENCE REPORT</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
          <div>Industry: HVAC</div>
          <div>Market: Phoenix, AZ</div>
          <div>Date: {new Date().toLocaleDateString()}</div>
          <div>Report ID: #MI-2024-001</div>
        </div>
        <Badge className="mt-4 bg-red-100 text-red-800">TEASER REPORT - STRATEGIC OVERVIEW</Badge>
      </div>

      {/* Executive Summary */}
      <Card className="mb-6">
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <Star className="mr-2 text-yellow-500" />
            Executive Summary
          </h2>
          <div className="mb-4">
            <span className="text-lg font-medium">Market Opportunity Score: </span>
            <Badge className="bg-green-100 text-green-800 text-lg px-3 py-1">8/10</Badge>
          </div>
          
          <div className="space-y-2 mb-6">
            <div className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>47 high-value keywords identified with manageable competition</span>
            </div>
            <div className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Estimated monthly customer searches: 24,300</span>
            </div>
            <div className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>Recommended monthly ad investment: $3,200</span>
            </div>
            <div className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>15 untapped SEO opportunities discovered</span>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">Strategic Recommendation:</h3>
            <p className="text-gray-700">
              Based on our proprietary market intelligence analysis, Phoenix presents a <strong>strong opportunity</strong> for HVAC expansion with moderate competition and high search demand during peak seasons.
            </p>
            <p className="text-sm text-gray-500 mt-2 italic">
              *Full competitive landscape and revenue projections available in complete report.*
            </p>
          </div>
        </div>
      </Card>

      {/* Keyword Intelligence Preview */}
      <Card className="mb-6">
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <TrendingUp className="mr-2 text-blue-500" />
            Keyword Intelligence Preview
          </h2>
          <h3 className="text-lg font-medium mb-4">Top 5 Market Opportunities</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border border-gray-200 px-4 py-2 text-left">Keyword</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Monthly Searches</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">CPC</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Competition</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Opportunity</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-200 px-4 py-2 font-medium">hvac repair phoenix</td>
                  <td className="border border-gray-200 px-4 py-2">1,200</td>
                  <td className="border border-gray-200 px-4 py-2">$4.50</td>
                  <td className="border border-gray-200 px-4 py-2">65%</td>
                  <td className="border border-gray-200 px-4 py-2">
                    <Badge className="bg-green-100 text-green-800">💰 High Value</Badge>
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-200 px-4 py-2 font-medium">ac installation phoenix</td>
                  <td className="border border-gray-200 px-4 py-2">890</td>
                  <td className="border border-gray-200 px-4 py-2">$6.20</td>
                  <td className="border border-gray-200 px-4 py-2">72%</td>
                  <td className="border border-gray-200 px-4 py-2">
                    <Badge className="bg-yellow-100 text-yellow-800">⚡ Good Value</Badge>
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-4 py-2 font-medium">emergency hvac phoenix</td>
                  <td className="border border-gray-200 px-4 py-2">650</td>
                  <td className="border border-gray-200 px-4 py-2">$8.90</td>
                  <td className="border border-gray-200 px-4 py-2">45%</td>
                  <td className="border border-gray-200 px-4 py-2">
                    <Badge className="bg-green-100 text-green-800">💰 High Value</Badge>
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-200 px-4 py-2 font-medium">furnace repair phoenix</td>
                  <td className="border border-gray-200 px-4 py-2">420</td>
                  <td className="border border-gray-200 px-4 py-2">$5.10</td>
                  <td className="border border-gray-200 px-4 py-2">58%</td>
                  <td className="border border-gray-200 px-4 py-2">
                    <Badge className="bg-yellow-100 text-yellow-800">⚡ Good Value</Badge>
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-4 py-2 font-medium">hvac maintenance phoenix</td>
                  <td className="border border-gray-200 px-4 py-2">310</td>
                  <td className="border border-gray-200 px-4 py-2">$3.40</td>
                  <td className="border border-gray-200 px-4 py-2">38%</td>
                  <td className="border border-gray-200 px-4 py-2">
                    <Badge className="bg-green-100 text-green-800">💰 High Value</Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex items-start">
              <span className="font-medium text-blue-600">Prime Target:</span>
              <span className="ml-2">"hvac repair phoenix" - 1,200 monthly searches, $4.50 CPC</span>
            </div>
            <div className="flex items-start">
              <span className="font-medium text-green-600">Quick Win:</span>
              <span className="ml-2">"emergency hvac phoenix" - 650 monthly searches, low competition</span>
            </div>
            <div className="flex items-start">
              <span className="font-medium text-purple-600">Content Gold:</span>
              <span className="ml-2">"hvac maintenance tips" - Untapped SEO opportunity</span>
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-4 italic">
            *Complete list of 47 analyzed keywords available in full report.*
          </p>

          <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
            Click here for instant Geo-Grid competitor analysis
          </Button>
        </div>
      </Card>

      {/* Revenue Potential Preview */}
      <Card className="mb-6">
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <DollarSign className="mr-2 text-green-500" />
            Revenue Potential Preview
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">$847,000</div>
              <div className="text-sm text-gray-600">Total addressable market annually</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">$42,350</div>
              <div className="text-sm text-gray-600">Realistic market capture (5% annually)</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-3xl font-bold text-orange-600">8 months</div>
              <div className="text-sm text-gray-600">ROI timeline to profitability</div>
            </div>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold mb-2">Conservative Projections:</h3>
            <ul className="space-y-1 text-gray-700">
              <li>• Total addressable market: $847,000 annually</li>
              <li>• Realistic market capture (5%): $42,350 annually</li>
              <li>• ROI timeline: 8 months to profitability</li>
            </ul>
            <p className="text-sm text-gray-500 mt-2 italic">
              *Detailed seasonal trends, growth projections, and investment recommendations available in complete report.*
            </p>
          </div>

          <Button className="mt-4 bg-green-600 hover:bg-green-700">
            Ready for complete market intelligence?
          </Button>
        </div>
      </Card>

      {/* Strategic Recommendations */}
      <Card className="mb-6">
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <Users className="mr-2 text-purple-500" />
            Strategic Recommendations
          </h2>
          
          <h3 className="text-lg font-medium mb-3">Immediate Action Items (Next 30 Days)</h3>
          <ol className="list-decimal list-inside space-y-2 mb-6">
            <li><strong>PPC Launch Strategy:</strong> Target 5 high-value keywords with $2,400 monthly budget</li>
            <li><strong>SEO Content Plan:</strong> Create content for 15 untapped opportunities</li>
            <li><strong>Competitive Response:</strong> Address pricing gaps before spring season</li>
          </ol>

          <h3 className="text-lg font-medium mb-3">Medium-term Opportunities (30-90 Days)</h3>
          <p className="text-gray-600 italic mb-4">
            *Complete 90-day action plan with priority matrix available in full report.*
          </p>

          <Button className="bg-purple-600 hover:bg-purple-700">
            Schedule your complimentary strategy session
          </Button>
        </div>
      </Card>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 mt-8 p-4 border-t">
        <p>This report contains proprietary market intelligence compiled using advanced business analytics tools.</p>
        <p>Data sources include: Keywords Everywhere API, Google Business Profile analysis, and proprietary algorithms.</p>
        <p className="mt-2 font-medium">NextWave Research | www.NextWave-Research.com | Confidential & Proprietary</p>
      </div>

      {/* Download Button */}
      <div className="text-center mt-6">
        <Button className="bg-indigo-600 hover:bg-indigo-700" size="lg">
          <Download className="mr-2" size={20} />
          Download Complete PDF Report
        </Button>
      </div>
    </div>
  );
}