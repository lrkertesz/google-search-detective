import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Users, Eye, AlertTriangle, Target, Star } from "lucide-react";

export function CompetitiveIntelligencePreview() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8 p-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Competitive Intelligence Analysis</h1>
        <p className="text-lg text-gray-600">400 HVAC Companies Analyzed | 107 Marketing Metrics Each</p>
        <Badge className="mt-2 bg-red-600 text-white">CONFIDENTIAL MARKET INTELLIGENCE</Badge>
      </div>

      {/* Market Overview Dashboard */}
      <Card className="mb-8">
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <Eye className="mr-2 text-blue-500" />
            Digital Presence Scorecard - Coachella Valley HVAC Market
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">79%</div>
              <div className="text-sm text-gray-600">Have Google Reviews</div>
              <div className="text-xs text-green-700 mt-1">317 of 400 companies</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-3xl font-bold text-red-600">21%</div>
              <div className="text-sm text-gray-600">Digitally Invisible</div>
              <div className="text-xs text-red-700 mt-1">83 companies with no reviews</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-3xl font-bold text-orange-600">5%</div>
              <div className="text-sm text-gray-600">Active on Social Media</div>
              <div className="text-xs text-orange-700 mt-1">Massive opportunity gap</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">0%</div>
              <div className="text-sm text-gray-600">Have YouTube Presence</div>
              <div className="text-xs text-purple-700 mt-1">Untapped marketing channel</div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">🎯 Key Market Intelligence</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 95% of competitors have zero YouTube/Twitter engagement</li>
              <li>• Only 3 companies have 40+ reviews (market leader opportunity)</li>
              <li>• Citation counts range 1-30 (shows SEO difficulty levels)</li>
              <li>• Minimal PPC competition (average spend under $500/month)</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Top Competitors Analysis */}
      <Card className="mb-8">
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <TrendingUp className="mr-2 text-green-500" />
            Market Leaders Analysis - Top 10 Competitors
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border border-gray-200 px-4 py-2 text-left">Company</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">City</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Reviews</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Rating</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Citations</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Social Media</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Threat Level</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-red-50">
                  <td className="border border-gray-200 px-4 py-2 font-medium">ALL DAY Heating & Cooling</td>
                  <td className="border border-gray-200 px-4 py-2">Palm Desert</td>
                  <td className="border border-gray-200 px-4 py-2">62</td>
                  <td className="border border-gray-200 px-4 py-2">5.0</td>
                  <td className="border border-gray-200 px-4 py-2">16</td>
                  <td className="border border-gray-200 px-4 py-2">None</td>
                  <td className="border border-gray-200 px-4 py-2">
                    <Badge className="bg-red-100 text-red-800">High</Badge>
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-4 py-2 font-medium">Alvarez Plumbing Services</td>
                  <td className="border border-gray-200 px-4 py-2">Indio</td>
                  <td className="border border-gray-200 px-4 py-2">59</td>
                  <td className="border border-gray-200 px-4 py-2">3.3</td>
                  <td className="border border-gray-200 px-4 py-2">21</td>
                  <td className="border border-gray-200 px-4 py-2">248 FB likes</td>
                  <td className="border border-gray-200 px-4 py-2">
                    <Badge className="bg-yellow-100 text-yellow-800">Vulnerable</Badge>
                  </td>
                </tr>
                <tr className="bg-orange-50">
                  <td className="border border-gray-200 px-4 py-2 font-medium">Western Air Cooling</td>
                  <td className="border border-gray-200 px-4 py-2">Palm Desert</td>
                  <td className="border border-gray-200 px-4 py-2">41</td>
                  <td className="border border-gray-200 px-4 py-2">5.0</td>
                  <td className="border border-gray-200 px-4 py-2">26</td>
                  <td className="border border-gray-200 px-4 py-2">None</td>
                  <td className="border border-gray-200 px-4 py-2">
                    <Badge className="bg-orange-100 text-orange-800">Medium</Badge>
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-4 py-2 font-medium">Custom Mist Inc.</td>
                  <td className="border border-gray-200 px-4 py-2">Indio</td>
                  <td className="border border-gray-200 px-4 py-2">21</td>
                  <td className="border border-gray-200 px-4 py-2">4.4</td>
                  <td className="border border-gray-200 px-4 py-2">26</td>
                  <td className="border border-gray-200 px-4 py-2">None</td>
                  <td className="border border-gray-200 px-4 py-2">
                    <Badge className="bg-green-100 text-green-800">Low</Badge>
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-200 px-4 py-2 font-medium">Aldco Air</td>
                  <td className="border border-gray-200 px-4 py-2">Indio</td>
                  <td className="border border-gray-200 px-4 py-2">17</td>
                  <td className="border border-gray-200 px-4 py-2">4.8</td>
                  <td className="border border-gray-200 px-4 py-2">30</td>
                  <td className="border border-gray-200 px-4 py-2">None</td>
                  <td className="border border-gray-200 px-4 py-2">
                    <Badge className="bg-green-100 text-green-800">Low</Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-red-50 rounded-lg">
              <h3 className="font-semibold text-red-800 mb-2">Market Leader: ALL DAY Heating</h3>
              <p className="text-sm text-red-700">
                Dominates with 62 reviews and perfect rating. Weak point: Zero social media presence.
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">Vulnerable: Alvarez Plumbing</h3>
              <p className="text-sm text-yellow-700">
                High volume (59 reviews) but poor rating (3.3). Reputation management opportunity.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Market Gap Identified</h3>
              <p className="text-sm text-green-700">
                No company has strong digital presence across all channels. Major opportunity.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Digital Marketing Gaps */}
      <Card className="mb-8">
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <AlertTriangle className="mr-2 text-orange-500" />
            Massive Digital Marketing Gaps Discovered
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Social Media Void</h3>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Facebook Presence</span>
                    <span>12% of companies</span>
                  </div>
                  <Progress value={12} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>YouTube Channels</span>
                    <span>0% of companies</span>
                  </div>
                  <Progress value={0} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Twitter Active</span>
                    <span>0% of companies</span>
                  </div>
                  <Progress value={0} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Instagram Marketing</span>
                    <span>3% of companies</span>
                  </div>
                  <Progress value={3} className="h-2" />
                </div>
              </div>
              
              <div className="p-3 bg-green-50 rounded border border-green-200">
                <p className="text-sm text-green-800 font-medium">
                  🎯 Opportunity: Any social media presence immediately beats 88% of competitors
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">PPC Competition Analysis</h3>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Monthly PPC Budget $0-500</span>
                    <span>94% of companies</span>
                  </div>
                  <Progress value={94} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Monthly PPC Budget $500-2000</span>
                    <span>5% of companies</span>
                  </div>
                  <Progress value={5} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Monthly PPC Budget $2000+</span>
                    <span>1% of companies</span>
                  </div>
                  <Progress value={1} className="h-2" />
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-sm text-blue-800 font-medium">
                  💰 Strategy: $1,500/month PPC budget dominates 94% of market
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Strategic Recommendations */}
      <Card className="mb-8">
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <Target className="mr-2 text-purple-500" />
            Strategic Market Entry Plan
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-3">Phase 1: Quick Wins (30 days)</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span>Launch Google My Business optimization (beats 21% immediately)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span>Generate 15+ reviews (enters top 25%)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span>Basic Facebook page setup (beats 88%)</span>
                </li>
              </ul>
              <div className="mt-4 text-center">
                <Badge className="bg-green-100 text-green-800">Investment: $500/month</Badge>
              </div>
            </div>

            <div className="p-4 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-3">Phase 2: Market Position (90 days)</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>YouTube channel launch (zero competition)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>PPC campaign $1,500/month (dominates search)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Citation building to 25+ (top 10%)</span>
                </li>
              </ul>
              <div className="mt-4 text-center">
                <Badge className="bg-blue-100 text-blue-800">Investment: $2,500/month</Badge>
              </div>
            </div>

            <div className="p-4 border border-purple-200 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-3">Phase 3: Market Leader (6 months)</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  <span>100+ reviews (market authority)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  <span>Multi-platform social presence</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  <span>Content marketing dominance</span>
                </li>
              </ul>
              <div className="mt-4 text-center">
                <Badge className="bg-purple-100 text-purple-800">ROI: $150,000+ annually</Badge>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <h3 className="font-semibold text-indigo-800 mb-2">🚀 Market Domination Opportunity</h3>
            <p className="text-indigo-700">
              With proper execution, you could become the #1 digital presence in the Coachella Valley HVAC market within 12 months. 
              The competition is digitally dormant, creating a once-in-a-decade opportunity for rapid market share capture.
            </p>
          </div>
        </div>
      </Card>

      {/* Footer CTA */}
      <div className="text-center">
        <Button size="lg" className="bg-red-600 hover:bg-red-700">
          Download Complete 47-Page Competitive Intelligence Report
        </Button>
        <p className="text-sm text-gray-500 mt-2">
          Includes contact information for all 400 competitors and detailed market entry strategies
        </p>
      </div>
    </div>
  );
}