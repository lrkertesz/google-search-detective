import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, BarChart3, Globe, Shield } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-blue-600 p-3 rounded-xl">
              <Search className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Google Search Detective
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Professional geo-targeted keyword research with real-time metrics. 
            Generate comprehensive market intelligence reports for service industries.
          </p>
          <Button 
            size="lg" 
            onClick={() => window.location.href = '/api/login'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
          >
            Sign In to Continue
          </Button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Real-Time Metrics</CardTitle>
              <CardDescription>
                Access live search volume, CPC, and competition data from Keywords Everywhere API
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Globe className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>Geo-Targeted Research</CardTitle>
              <CardDescription>
                Generate city-specific keyword variations for local service businesses
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle>Business Intelligence</CardTitle>
              <CardDescription>
                TAM calculations and opportunity scoring for strategic market analysis
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600">
          <p>Secure authentication powered by Replit</p>
        </div>
      </div>
    </div>
  );
}