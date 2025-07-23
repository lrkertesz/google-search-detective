import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, TrendingUp, Target, DollarSign, Users, Star, ArrowRight } from "lucide-react";

export function LandingPreview() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-2xl font-bold text-indigo-800">NextWave Research</div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Market Intelligence That Drives Business Growth
        </h1>
        <h2 className="text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Discover Hidden Opportunities in Your Local Market
        </h2>
        <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
          <strong>Before you expand, invest, or compete - know your market inside and out.</strong>
        </p>

        <div className="max-w-2xl mx-auto mb-8">
          <p className="text-lg text-gray-600 mb-6">Three proprietary research tools reveal what your competitors don't want you to know:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="text-green-500" size={20} />
              <span>Untapped customer search demand in your area</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="text-green-500" size={20} />
              <span>Competitor weaknesses and market gaps</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="text-green-500" size={20} />
              <span>Revenue potential by geography and service type</span>
            </div>
          </div>
        </div>

        <div className="text-xl font-medium text-indigo-800 mb-8 p-4 bg-white rounded-lg shadow-sm max-w-2xl mx-auto">
          "The only comprehensive local market intelligence available to service businesses"
        </div>

        <div className="space-x-4">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            Get Your Free Market Snapshot
          </Button>
          <Button size="lg" variant="outline">
            View Sample Reports
          </Button>
        </div>
      </div>

      {/* Free Market Snapshot Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto">
            <div className="p-8">
              <h2 className="text-3xl font-bold text-center mb-4">Get Your Free Market Snapshot</h2>
              <p className="text-center text-gray-600 mb-8">No Credit Card Required | Instant Download</p>

              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">What You'll Discover:</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Target className="text-blue-500 mr-2 mt-1" size={16} />
                    <span>Top 10 customer search terms in your market</span>
                  </li>
                  <li className="flex items-start">
                    <Users className="text-green-500 mr-2 mt-1" size={16} />
                    <span>Your biggest competitors and their rankings</span>
                  </li>
                  <li className="flex items-start">
                    <DollarSign className="text-orange-500 mr-2 mt-1" size={16} />
                    <span>Estimated monthly revenue opportunity</span>
                  </li>
                  <li className="flex items-start">
                    <TrendingUp className="text-purple-500 mr-2 mt-1" size={16} />
                    <span>One strategic insight to act on immediately</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Your Industry:</label>
                  <select className="w-full p-2 border border-gray-300 rounded-md">
                    <option>Select your industry...</option>
                    <option>HVAC</option>
                    <option>Plumbing</option>
                    <option>Electrical</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Your City:</label>
                  <Input placeholder="e.g., Phoenix, AZ" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Your Email:</label>
                  <Input placeholder="For instant delivery" type="email" />
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700" size="lg">
                  Generate My Free Snapshot
                </Button>
              </div>

              <p className="text-center text-sm text-gray-500 mt-4">
                <em>Used by 500+ service business owners to make smarter expansion decisions</em>
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Premium Report Section */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Complete Market Intelligence Report</h2>
            <p className="text-xl text-gray-600">Everything You Need to Dominate Your Local Market</p>
            <Badge className="mt-4 text-lg px-4 py-2 bg-red-100 text-red-800">
              What Fortune 500 Companies Pay $10,000+ For
            </Badge>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <Card className="p-6">
                <div className="flex items-center mb-4">
                  <TrendingUp className="text-blue-500 mr-3" size={24} />
                  <div>
                    <h3 className="text-lg font-semibold">Complete Keyword Intelligence</h3>
                    <Badge className="text-sm bg-blue-100 text-blue-800">$97 value</Badge>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• All profitable keywords in your market</li>
                  <li>• Search volume and competition data</li>
                  <li>• Cost-per-click analysis for PPC planning</li>
                  <li>• SEO content opportunities list</li>
                </ul>
              </Card>

              <Card className="p-6">
                <div className="flex items-center mb-4">
                  <Target className="text-green-500 mr-3" size={24} />
                  <div>
                    <h3 className="text-lg font-semibold">Comprehensive Competitor Analysis</h3>
                    <Badge className="text-sm bg-green-100 text-green-800">$197 value</Badge>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Complete competitor contact database</li>
                  <li>• Their strengths, weaknesses, and blind spots</li>
                  <li>• Market positioning opportunities</li>
                  <li>• Geographic coverage gaps</li>
                </ul>
              </Card>

              <Card className="p-6">
                <div className="flex items-center mb-4">
                  <DollarSign className="text-orange-500 mr-3" size={24} />
                  <div>
                    <h3 className="text-lg font-semibold">Revenue Potential Calculator</h3>
                    <Badge className="text-sm bg-orange-100 text-orange-800">$97 value</Badge>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Total addressable market size</li>
                  <li>• Realistic capture scenarios (conservative to aggressive)</li>
                  <li>• Seasonal trend analysis</li>
                  <li>• ROI timeline projections</li>
                </ul>
              </Card>

              <Card className="p-6">
                <div className="flex items-center mb-4">
                  <ArrowRight className="text-purple-500 mr-3" size={24} />
                  <div>
                    <h3 className="text-lg font-semibold">90-Day Action Plan</h3>
                    <Badge className="text-sm bg-purple-100 text-purple-800">$197 value</Badge>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Priority-ranked opportunities</li>
                  <li>• Week-by-week implementation guide</li>
                  <li>• Budget allocation recommendations</li>
                  <li>• Success metrics and tracking</li>
                </ul>
              </Card>
            </div>

            <div className="text-center bg-white p-8 rounded-lg shadow-sm">
              <div className="mb-6">
                <span className="text-2xl text-gray-500 line-through">Total Value: $588</span>
                <div className="text-4xl font-bold text-green-600">Your Investment: $297</div>
              </div>
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                Get Complete Analysis
              </Button>
            </div>
          </div>

          {/* Testimonials */}
          <div className="max-w-4xl mx-auto mt-16">
            <h3 className="text-2xl font-bold text-center mb-8">Recent Success Stories</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-6">
                <div className="flex items-center mb-4">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className="text-yellow-500 fill-current" size={20} />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "Increased our service area revenue 34% in 6 months using NextWave's market intelligence."
                </p>
                <p className="text-sm font-medium">- Mike Torres, Torres HVAC (Phoenix)</p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center mb-4">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className="text-yellow-500 fill-current" size={20} />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "The competitor analysis revealed gaps we never knew existed. Added $89,000 in new contracts."
                </p>
                <p className="text-sm font-medium">- Sarah Chen, Elite Plumbing (Austin)</p>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">NextWave Research</h3>
              <p className="text-gray-300">
                Independent market intelligence for service businesses. 
                Providing Fortune 500-level insights at small business prices.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Services</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Market Intelligence Reports</li>
                <li>• Competitor Analysis</li>
                <li>• Revenue Projections</li>
                <li>• Strategic Planning</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Contact</h3>
              <p className="text-gray-300">
                Email: research@nextwave-research.com<br />
                Phone: (555) 123-4567<br />
                Privacy Promise: Your data stays confidential
              </p>
            </div>
          </div>
          <div className="text-center text-gray-400 mt-8 pt-8 border-t border-gray-700">
            © 2024 NextWave Research. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}