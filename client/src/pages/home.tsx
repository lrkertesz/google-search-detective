import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { exportToCSV } from "@/lib/csvExport";
import { Search, Plus, X, Download, History, Factory, MapPin, Info, Loader2, Eye, ArrowDownWideNarrow, TrendingUp, Target, Settings, ChevronUp, ChevronDown, Trash2 } from "lucide-react";
import { Link } from "wouter";
import type { KeywordResearch, KeywordResult, Industry } from "@shared/schema";

// Industries are now loaded dynamically from the database

type SortField = 'keyword' | 'searchVolume' | 'cpc' | 'competition' | 'opportunity';
type SortDirection = 'asc' | 'desc';

export default function Home() {
  const [selectedIndustry, setSelectedIndustry] = useState<string>("");
  const [cityInput, setCityInput] = useState("");
  const [cities, setCities] = useState<string[]>([]);
  const [currentResearch, setCurrentResearch] = useState<KeywordResearch | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [currentKeyword, setCurrentKeyword] = useState("");
  const [sortField, setSortField] = useState<SortField>('searchVolume');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [zeroVolumeSortField, setZeroVolumeSortField] = useState<SortField>('keyword');
  const [zeroVolumeSortDirection, setZeroVolumeSortDirection] = useState<SortDirection>('asc');
  const { toast } = useToast();

  // Sorting functions
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'keyword' || field === 'opportunity' ? 'asc' : 'desc');
    }
  };

  const handleZeroVolumeSort = (field: SortField) => {
    if (zeroVolumeSortField === field) {
      setZeroVolumeSortDirection(zeroVolumeSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setZeroVolumeSortField(field);
      setZeroVolumeSortDirection(field === 'keyword' || field === 'opportunity' ? 'asc' : 'desc');
    }
  };

  const sortKeywords = (keywords: KeywordResult[], field: SortField, direction: SortDirection) => {
    return [...keywords].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (field) {
        case 'keyword':
          aValue = a.keyword.toLowerCase();
          bValue = b.keyword.toLowerCase();
          break;
        case 'searchVolume':
          aValue = a.searchVolume;
          bValue = b.searchVolume;
          break;
        case 'cpc':
          aValue = a.cpc;
          bValue = b.cpc;
          break;
        case 'competition':
          aValue = a.competition;
          bValue = b.competition;
          break;
        case 'opportunity':
          aValue = a.opportunity.toLowerCase();
          bValue = b.opportunity.toLowerCase();
          break;
        default:
          return 0;
      }

      if (direction === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  };

  // Sortable table head component
  const SortableTableHead = ({ 
    field, 
    children, 
    currentField, 
    currentDirection, 
    onSort 
  }: {
    field: SortField;
    children: React.ReactNode;
    currentField: SortField;
    currentDirection: SortDirection;
    onSort: (field: SortField) => void;
  }) => (
    <TableHead 
      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 select-none"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center justify-between">
        {children}
        <div className="ml-2">
          {currentField === field ? (
            currentDirection === 'asc' ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )
          ) : (
            <div className="h-4 w-4 opacity-30">
              <ChevronDown className="h-4 w-4" />
            </div>
          )}
        </div>
      </div>
    </TableHead>
  );

  // Get all industries
  const { data: industries } = useQuery<Industry[]>({
    queryKey: ["/api/admin/industries"],
  });

  // Get industry keywords
  const { data: industryData } = useQuery<Industry>({
    queryKey: ["/api/industries", selectedIndustry, "keywords"],
    enabled: !!selectedIndustry,
  });

  // Get research history
  const { data: researchHistory } = useQuery<KeywordResearch[]>({
    queryKey: ["/api/keyword-research"],
  });

  // Start research mutation
  const startResearchMutation = useMutation({
    mutationFn: async (data: { industry: string; cities: string[] }) => {
      const response = await apiRequest("POST", "/api/keyword-research", data);
      return response.json();
    },
    onSuccess: (data: KeywordResearch) => {
      setCurrentResearch(data);
      setIsProcessing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/keyword-research"] });
      toast({
        title: "Research Complete",
        description: `Analyzed ${data.results.length} keyword combinations`,
      });
    },
    onError: (error: any) => {
      setIsProcessing(false);
      toast({
        title: "Research Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete research mutation
  const deleteResearchMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/keyword-research/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/keyword-research"] });
      toast({
        title: "Research Deleted",
        description: "Search history item removed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addCity = () => {
    if (!cityInput.trim()) return;
    
    // Parse multiple cities separated by commas
    const newCities = cityInput
      .split(',')
      .map(city => city.trim())
      .filter(city => city.length > 0 && !cities.includes(city));
    
    if (newCities.length > 0) {
      setCities([...cities, ...newCities]);
      setCityInput("");
      toast({
        title: "Cities Added",
        description: `Added ${newCities.length} ${newCities.length === 1 ? 'city' : 'cities'}: ${newCities.join(', ')}`,
      });
    } else if (cityInput.trim() && cities.includes(cityInput.trim())) {
      toast({
        title: "Duplicate City",
        description: "This city is already in your list",
        variant: "destructive",
      });
    }
  };

  const removeCity = (cityToRemove: string) => {
    setCities(cities.filter(city => city !== cityToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addCity();
    }
  };

  const startResearch = () => {
    if (!selectedIndustry || cities.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select an industry and add at least one city",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);
    setCurrentKeyword("");

    // Simulate progress
    const totalKeywords = (industryData?.keywords?.length || 0) * cities.length;
    let processed = 0;
    const interval = setInterval(() => {
      processed++;
      setProcessingProgress((processed / totalKeywords) * 100);
      if (industryData?.keywords && cities.length > 0) {
        const keywordIndex = processed % industryData.keywords.length;
        const cityIndex = Math.floor((processed - 1) / industryData.keywords.length);
        if (cityIndex < cities.length && keywordIndex < industryData.keywords.length) {
          setCurrentKeyword(`"${industryData.keywords[keywordIndex]} ${cities[cityIndex]}"`);
        }
      }
      if (processed >= totalKeywords) {
        clearInterval(interval);
      }
    }, 100);

    startResearchMutation.mutate({
      industry: selectedIndustry,
      cities,
    });
  };

  const totalCombinations = (industryData?.keywords?.length || 0) * cities.length;
  const estimatedCost = (totalCombinations * 0.005).toFixed(2);

  const highVolumeKeywords = currentResearch?.results.filter(k => k.searchVolume > 10) || [];
  const zeroVolumeKeywords = currentResearch?.results.filter(k => k.searchVolume <= 10) || [];

  const exportHighVolumeCSV = () => {
    exportToCSV(highVolumeKeywords, `keywords-high-volume-${Date.now()}.csv`);
  };

  const exportZeroVolumeCSV = () => {
    exportToCSV(zeroVolumeKeywords, `keywords-zero-volume-${Date.now()}.csv`);
  };

  const loadResearch = (research: KeywordResearch) => {
    setCurrentResearch(research);
    setSelectedIndustry(research.industry);
    setCities(research.cities);
  };

  const getOpportunityColor = (opportunity: string) => {
    switch (opportunity) {
      case "High": return "bg-green-100 text-green-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Low": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCompetitionColor = (competition: number) => {
    if (competition <= 30) return "bg-green-400";
    if (competition <= 60) return "bg-yellow-400";
    return "bg-red-400";
  };

  return (
    <div className="min-h-screen bg-neutral">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Search className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Keyword Research Pro</h1>
                <p className="text-sm text-neutral-dark">Local Service Provider Analysis</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <Button variant="ghost" className="flex items-center space-x-2 text-neutral-dark hover:text-gray-900">
                  <Settings size={16} />
                  <span>Admin</span>
                </Button>
              </Link>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 text-neutral-dark hover:text-gray-900">
                    <History size={16} />
                    <span>Search History</span>
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-80">
                  <SheetHeader>
                    <SheetTitle>Search History</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-4 overflow-y-auto">
                    {researchHistory?.map((research: KeywordResearch) => (
                      <Card 
                        key={research.id} 
                        className="hover:bg-gray-50 transition-colors relative group"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900 capitalize">
                              {research.industry.replace("-", " ")}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-neutral-dark">
                                {new Date(research.createdAt).toLocaleDateString()}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 transition-all"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteResearchMutation.mutate(research.id);
                                }}
                                disabled={deleteResearchMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div 
                            className="cursor-pointer"
                            onClick={() => loadResearch(research)}
                          >
                            <div className="text-sm text-neutral-dark mb-2">
                              {research.cities.join(", ")}
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-green-600">
                                {research.results.filter(r => r.searchVolume > 10).length} keywords
                              </span>
                              <span className="text-amber-600">
                                {research.results.filter(r => r.searchVolume <= 10).length} low-comp
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>

            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Main Research Form */}
        <Card className="p-8 mb-8">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">New Keyword Research</h2>
            <p className="text-neutral-dark">Select your industry and target cities to generate comprehensive keyword analysis</p>
          </div>

          {/* Step 1: Factory Selection */}
          <div className="mb-8">
            <Label className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Factory className="text-primary mr-2" size={20} />
              Step 1: Select Industry
            </Label>
            <RadioGroup
              value={selectedIndustry}
              onValueChange={setSelectedIndustry}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4"
            >
              {industries?.map((industry: Industry) => (
                <div key={industry.name}>
                  <Label
                    htmlFor={industry.name}
                    className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition-all cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-blue-50"
                  >
                    <RadioGroupItem
                      value={industry.name}
                      id={industry.name}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{industry.label}</div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Step 2: City Input */}
          <div className="mb-8">
            <Label className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <MapPin className="text-secondary mr-2" size={20} />
              Step 2: Target Cities
            </Label>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Input
                  placeholder="Enter city names separated by commas (e.g., Miami, Orlando, Tampa, Jacksonville, Fort Lauderdale, Gainesville)"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button 
                  onClick={addCity}
                  className="bg-secondary hover:bg-secondary/90"
                >
                  <Plus size={16} className="mr-2" />
                  Add City
                </Button>
              </div>
              
              {/* Selected Cities Display */}
              {cities.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {cities.map((city) => (
                    <Badge
                      key={city}
                      variant="secondary"
                      className="bg-secondary/10 text-secondary hover:bg-secondary/20"
                    >
                      {city}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2 h-auto p-0 text-secondary hover:text-red-500"
                        onClick={() => removeCity(city)}
                      >
                        <X size={12} />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}

              {selectedIndustry && cities.length > 0 && (
                <div className="text-sm text-neutral-dark">
                  <span className="font-medium">{industryData?.keywords?.length || 0}</span> base keywords × 
                  <span className="font-medium"> {cities.length}</span> cities = 
                  <span className="font-medium text-primary"> {totalCombinations}</span> total keyword combinations
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="text-sm text-neutral-dark flex items-center">
              <Info size={14} className="mr-1" />
              API cost: ~${estimatedCost} for this research
            </div>
            <div className="flex space-x-4">
              <Button variant="outline">
                <Eye size={16} className="mr-2" />
                Preview Keywords
              </Button>
              <Button 
                onClick={startResearch}
                disabled={!selectedIndustry || cities.length === 0 || isProcessing}
                className="bg-primary hover:bg-primary-dark"
              >
                {isProcessing ? (
                  <Loader2 size={16} className="mr-2 animate-spin" />
                ) : (
                  <Search size={16} className="mr-2" />
                )}
                Start Research
              </Button>
            </div>
          </div>
        </Card>

        {/* Research Progress */}
        {isProcessing && (
          <Card className="p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Processing Keywords</h3>
              <span className="text-sm text-neutral-dark">
                {Math.floor((processingProgress / 100) * totalCombinations)} / {totalCombinations} completed
              </span>
            </div>
            <Progress value={processingProgress} className="mb-4" />
            <div className="text-sm text-neutral-dark flex items-center">
              <Loader2 size={14} className="mr-2 animate-spin" />
              Analyzing keyword: <span className="font-medium ml-1">{currentKeyword}</span>
            </div>
          </Card>
        )}

        {/* Results Section */}
        {currentResearch && (
          <div className="space-y-8">
            {/* Market Summary - Business Value Overview */}
            <Card className="mb-6 bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Target className="mr-2 text-blue-600" size={20} />
                  Market Opportunity Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {currentResearch.results.reduce((sum, k) => sum + k.searchVolume, 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Monthly Customer Searches</div>
                    <div className="text-xs text-gray-500 mt-1">Active demand in your market</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {currentResearch.results.filter(k => k.opportunity === "High").length}
                    </div>
                    <div className="text-sm text-gray-600">Prime Opportunities</div>
                    <div className="text-xs text-gray-500 mt-1">Ready for immediate action</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      ${Math.round(currentResearch.results.filter(k => k.searchVolume > 10).reduce((sum, k) => sum + (k.searchVolume * k.cpc * 0.15), 0)).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Monthly Ad Investment</div>
                    <div className="text-xs text-gray-500 mt-1">15% market share capture</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {currentResearch.results.filter(k => k.searchVolume <= 10 && k.cpc === 0).length}
                    </div>
                    <div className="text-sm text-gray-600">SEO Content Targets</div>
                    <div className="text-xs text-gray-500 mt-1">Low-competition ranking opportunities</div>
                  </div>
                </div>
                
                {/* Business Intelligence Insights */}
                <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
                  <h4 className="font-semibold text-indigo-800 mb-2">🎯 Strategic Recommendations</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong className="text-indigo-700">Immediate PPC Opportunities:</strong>
                      <p className="text-gray-700">
                        {currentResearch.results.filter(k => k.opportunity === "High" && k.searchVolume > 50).length} keywords with high search volume and manageable competition for quick market entry.
                      </p>
                    </div>
                    <div>
                      <strong className="text-indigo-700">Long-term SEO Strategy:</strong>
                      <p className="text-gray-700">
                        {currentResearch.results.filter(k => k.cpc === 0 && k.searchVolume <= 50).length} untapped keywords perfect for content marketing to establish market authority.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Keywords with Search Volume */}
            <Card>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Keyword Search Volumes & PPC Costs</h3>
                    <p className="text-neutral-dark">
                      <span className="font-medium text-green-600">{highVolumeKeywords.length}</span> keywords with active customer searches - 
                      <span className="font-medium text-blue-600">{highVolumeKeywords.reduce((sum, k) => sum + k.searchVolume, 0).toLocaleString()}</span> total monthly searches
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <div className="text-sm text-gray-600 flex items-center">
                      <ArrowDownWideNarrow size={16} className="mr-2" />
                      Click column headers to sort
                    </div>
                    <Button 
                      onClick={exportHighVolumeCSV}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Download size={16} className="mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <SortableTableHead 
                        field="keyword" 
                        currentField={sortField} 
                        currentDirection={sortDirection} 
                        onSort={handleSort}
                      >
                        Keyword
                      </SortableTableHead>
                      <SortableTableHead 
                        field="searchVolume" 
                        currentField={sortField} 
                        currentDirection={sortDirection} 
                        onSort={handleSort}
                      >
                        Search Volume
                      </SortableTableHead>
                      <SortableTableHead 
                        field="cpc" 
                        currentField={sortField} 
                        currentDirection={sortDirection} 
                        onSort={handleSort}
                      >
                        CPC
                      </SortableTableHead>
                      <SortableTableHead 
                        field="competition" 
                        currentField={sortField} 
                        currentDirection={sortDirection} 
                        onSort={handleSort}
                      >
                        Competition
                      </SortableTableHead>
                      <SortableTableHead 
                        field="opportunity" 
                        currentField={sortField} 
                        currentDirection={sortDirection} 
                        onSort={handleSort}
                      >
                        Business Value
                      </SortableTableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortKeywords(highVolumeKeywords, sortField, sortDirection).map((keyword, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{keyword.keyword}</TableCell>
                        <TableCell>
                          <Badge className="bg-slate-800 text-white font-semibold">
                            {keyword.searchVolume.toLocaleString()}/mo
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">${keyword.cpc.toFixed(2)}</TableCell>
                        <TableCell className="font-medium">{keyword.competition}%</TableCell>
                        <TableCell>
                          <Badge className={getOpportunityColor(keyword.opportunity)}>
                            {keyword.opportunity === "High" ? "💰 High Value" : keyword.opportunity === "Medium" ? "⚡ Good Value" : "📈 Long-term"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>

            {/* Keywords with Zero Search Volume */}
            <Card>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Untapped Market Opportunities</h3>
                    <p className="text-neutral-dark">
                      <span className="font-medium text-amber-600">{zeroVolumeKeywords.length}</span> keywords with low/zero competition - 
                      <span className="font-medium text-purple-600">Perfect for content marketing & SEO</span>
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <div className="text-sm text-gray-600 flex items-center">
                      <ArrowDownWideNarrow size={16} className="mr-2" />
                      Click column headers to sort
                    </div>
                    <Button 
                      onClick={exportZeroVolumeCSV}
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      <Download size={16} className="mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <SortableTableHead 
                        field="keyword" 
                        currentField={zeroVolumeSortField} 
                        currentDirection={zeroVolumeSortDirection} 
                        onSort={handleZeroVolumeSort}
                      >
                        Keyword
                      </SortableTableHead>
                      <TableHead>Search Volume</TableHead>
                      <SortableTableHead 
                        field="cpc" 
                        currentField={zeroVolumeSortField} 
                        currentDirection={zeroVolumeSortDirection} 
                        onSort={handleZeroVolumeSort}
                      >
                        CPC
                      </SortableTableHead>
                      <TableHead>Competition</TableHead>
                      <SortableTableHead 
                        field="opportunity" 
                        currentField={zeroVolumeSortField} 
                        currentDirection={zeroVolumeSortDirection} 
                        onSort={handleZeroVolumeSort}
                      >
                        Strategy
                      </SortableTableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortKeywords(zeroVolumeKeywords, zeroVolumeSortField, zeroVolumeSortDirection).map((keyword, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{keyword.keyword}</TableCell>
                        <TableCell>
                          <Badge className="bg-amber-600 text-white font-semibold">
                            &lt;10/mo
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">${keyword.cpc.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800">
                            0% (Auto-corrected)
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-blue-100 text-blue-800">
                            📝 Content Target
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
