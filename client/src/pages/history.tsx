import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Search, Trash2, Eye, Download, Calendar, MapPin, Building2, ArrowLeft, Edit2, Check, X, CheckSquare, Square, ChevronDown, ChevronUp, ArrowDownWideNarrow, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { exportToCSV } from "@/lib/csvExport";
import type { KeywordResearch, KeywordResult, TAMCalculation } from "@shared/schema";

type SortField = 'keyword' | 'searchVolume' | 'cpc' | 'budgetCost';
type SortDirection = 'asc' | 'desc';

export default function HistoryPage() {
  const { toast } = useToast();
  const [selectedResearch, setSelectedResearch] = useState<KeywordResearch | null>(null);

  // Sorting functions
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'keyword' ? 'asc' : 'desc');
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
        case 'budgetCost':
          aValue = Math.round(a.searchVolume * a.cpc * 0.30);
          bValue = Math.round(b.searchVolume * b.cpc * 0.30);
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
    <th 
      className="cursor-pointer hover:bg-gray-50 select-none text-left py-3 px-4 font-medium text-gray-700"
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
    </th>
  );

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showZeroVolumeKeywords, setShowZeroVolumeKeywords] = useState<boolean>(false);
  const [sortField, setSortField] = useState<SortField>('searchVolume');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Get research history
  const { data: researchHistory, isLoading } = useQuery<KeywordResearch[]>({
    queryKey: ["/api/keyword-research"],
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

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      await Promise.all(ids.map(id => 
        apiRequest("DELETE", `/api/keyword-research/${id}`)
      ));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/keyword-research"] });
      setSelectedIds(new Set());
      toast({
        title: "Research Items Deleted",
        description: `${selectedIds.size} research items removed successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Bulk Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update research title mutation
  const updateResearchMutation = useMutation({
    mutationFn: async ({ id, title }: { id: number; title: string }) => {
      const response = await apiRequest("PUT", `/api/keyword-research/${id}`, { title });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/keyword-research"] });
      setEditingId(null);
      setEditingTitle("");
      toast({
        title: "Title Updated",
        description: "Research title has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const startEditing = (research: KeywordResearch) => {
    setEditingId(research.id);
    setEditingTitle(research.title || getDefaultTitle(research));
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingTitle("");
  };

  const saveTitle = () => {
    if (editingId && editingTitle.trim()) {
      updateResearchMutation.mutate({ id: editingId, title: editingTitle.trim() });
    }
  };

  const getDefaultTitle = (research: KeywordResearch) => {
    return `${research.industry} Research - ${research.cities.join(', ')}`;
  };

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this research?")) {
      deleteResearchMutation.mutate(id);
    }
  };

  const toggleSelection = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === researchHistory?.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(researchHistory?.map(r => r.id) || []));
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    
    const count = selectedIds.size;
    if (confirm(`Are you sure you want to delete ${count} research item${count > 1 ? 's' : ''}?`)) {
      bulkDeleteMutation.mutate(Array.from(selectedIds));
    }
  };

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getIndustryIcon = (industry: string) => {
    switch (industry.toLowerCase()) {
      case 'hvac': return '🌡️';
      case 'plumbing': return '🔧';
      case 'electrical': return '⚡';
      case 'digital marketing': return '📱';
      default: return '🏢';
    }
  };

  const exportCSV = (research: KeywordResearch) => {
    exportToCSV(research.results, `keywords-${research.industry}-${Date.now()}.csv`);
  };

  const exportCSVWithVolume = (research: KeywordResearch) => {
    const keywordsWithVolume = research.results.filter(k => k.searchVolume > 0);
    exportToCSV(keywordsWithVolume, `keywords-ppc-${research.industry}-${Date.now()}.csv`);
  };

  const exportCSVWithoutVolume = (research: KeywordResearch) => {
    const keywordsWithoutVolume = research.results.filter(k => k.searchVolume === 0);
    exportToCSV(keywordsWithoutVolume, `keywords-seo-${research.industry}-${Date.now()}.csv`);
  };

  // TAM Calculation Function - same as home.tsx
  const calculateTAM = (keywords: KeywordResult[], industry: string): TAMCalculation | null => {
    if (!industry || industry.toLowerCase() !== "hvac" || keywords.length === 0) return null;
    
    // Only consider keywords with search volume > 0 for TAM calculation
    const validKeywords = keywords.filter(k => k.searchVolume > 0);
    if (validKeywords.length === 0) return null;
    
    // Calculate annual search volume (monthly * 12)
    const annualSearchVolume = validKeywords.reduce((sum, k) => sum + k.searchVolume, 0) * 12;
    
    // HVAC service breakdown - Conservative methodology for 30% TAM reduction:
    // Adjusted to be more realistic and achieve proper 30% reduction from total market
    const fullSystemReplacementsVolume = Math.round(annualSearchVolume * 0.15); // ~15% are full system replacements ($15,000 avg)
    const refrigerantRechargeVolume = Math.round(annualSearchVolume * 0.35); // ~35% are refrigerant issues ($800 avg)  
    const compressorFanVolume = Math.round(annualSearchVolume * 0.20); // ~20% are compressor/fan motor ($850 avg)
    
    // Revenue calculations using conservative HVAC service prices
    const fullSystemRevenue = fullSystemReplacementsVolume * 15000;
    const refrigerantRevenue = refrigerantRechargeVolume * 800;
    const compressorFanRevenue = compressorFanVolume * 850;
    
    const totalRevenue = fullSystemRevenue + refrigerantRevenue + compressorFanRevenue;
    
    return {
      annualSearchVolume,
      fullSystemReplacements: {
        annualVolume: fullSystemReplacementsVolume,
        revenue: fullSystemRevenue
      },
      refrigerantRecharge: {
        annualVolume: refrigerantRechargeVolume,
        revenue: refrigerantRevenue
      },
      compressorFanReplacements: {
        annualVolume: compressorFanVolume,
        revenue: compressorFanRevenue
      },
      totalNewRevenueOpportunity: totalRevenue
    };
  };



  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-neutral-dark">Loading search history...</p>
        </div>
      </div>
    );
  }

  if (selectedResearch) {
    return (
      <div className="min-h-screen bg-neutral">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedResearch(null)}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft size={16} />
                  <span>Back to History</span>
                </Button>
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Search className="text-white" size={20} />
                </div>
                <div>
                  {editingId === selectedResearch.id ? (
                    <div className="flex items-center space-x-2 mb-2">
                      <Input
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        className="text-xl font-semibold"
                        placeholder="Enter research title..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveTitle();
                          if (e.key === 'Escape') cancelEditing();
                        }}
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={saveTitle}
                        disabled={updateResearchMutation.isPending}
                      >
                        <Check size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={cancelEditing}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 mb-2">
                      <h1 className="text-xl font-semibold text-gray-900">
                        {getIndustryIcon(selectedResearch.industry)} {selectedResearch.title || getDefaultTitle(selectedResearch)}
                      </h1>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEditing(selectedResearch)}
                      >
                        <Edit2 size={14} />
                      </Button>
                    </div>
                  )}
                  <p className="text-sm text-neutral-dark">
                    {selectedResearch.cities.join(', ')} • {formatDate(selectedResearch.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button onClick={() => exportCSVWithVolume(selectedResearch)} className="bg-green-600 hover:bg-green-700 flex items-center space-x-2">
                  <Download size={16} />
                  <span>PPC Keywords</span>
                </Button>
                <Button onClick={() => exportCSVWithoutVolume(selectedResearch)} className="bg-amber-600 hover:bg-amber-700 flex items-center space-x-2">
                  <Download size={16} />
                  <span>SEO Targets</span>
                </Button>
                <Button onClick={() => exportCSV(selectedResearch)} variant="outline" className="flex items-center space-x-2">
                  <Download size={16} />
                  <span>All Keywords</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Results */}
        <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Summary Stats */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Research Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {selectedResearch.results.filter(k => k.searchVolume > 0).length}
                  </div>
                  <div className="text-sm text-gray-600">PPC Keywords</div>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-lg">
                  <div className="text-2xl font-bold text-amber-600">
                    {selectedResearch.results.filter(k => k.searchVolume === 0).length}
                  </div>
                  <div className="text-sm text-gray-600">SEO Targets</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedResearch.results.reduce((sum, k) => sum + k.searchVolume, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Volume</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {selectedResearch.results.filter(k => k.searchVolume > 0 && k.cpc > 0).length}
                  </div>
                  <div className="text-sm text-gray-600">Keywords with CPC Data</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* TAM Calculation - HVAC Revenue Estimator */}
          {(() => {
            const tamData = calculateTAM(selectedResearch.results, selectedResearch.industry);
            return tamData && (
              <Card className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <TrendingUp className="mr-2 text-green-600" size={20} />
                    Total Addressable Market (TAM) Analysis
                  </h3>
                  <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <div className="font-semibold text-blue-800 mb-2">🎯 What is "Total Addressable Market" (TAM)?</div>
                    <p className="text-blue-700 mb-3">
                      TAM represents the realistic revenue opportunity available to your business through Google advertising. 
                      We calculate a conservative estimate by removing customers who already have annual inspection contracts 
                      with existing HVAC companies.
                    </p>
                    <div className="font-medium text-blue-800 mb-1">🔧 Why Annual Inspection Contracts Matter:</div>
                    <p className="text-blue-700 mb-3">
                      Most HVAC businesses sell annual inspection contracts that include Spring (A/C prep) and Fall (heating prep) 
                      system checkups. These customers rarely search Google for emergency services because they have an established 
                      relationship with their contractor. Our TAM removes these customers to show your true addressable opportunity.
                    </p>
                    <div className="font-medium text-blue-800 mb-1">💡 Your Digital Marketing Opportunity:</div>
                    <p className="text-blue-700">
                      The TAM shows the revenue potential from customers actively searching Google for HVAC services. 
                      The next logical question: "How do I position my business to capture these searches?" 
                      That's where strategic PPC campaigns and competitive analysis become essential for growth.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                      <div className="text-2xl font-bold text-green-600">
                        {tamData.annualSearchVolume.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Annual Search Volume</div>
                      <div className="text-xs text-gray-500 mt-1">Emergency-based searches</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                      <div className="text-2xl font-bold text-green-600">
                        {tamData.fullSystemReplacements.annualVolume.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Full System Replacements</div>
                      <div className="text-xs text-gray-500 mt-1">~15% of emergency calls</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                      <div className="text-2xl font-bold text-green-600">
                        {tamData.refrigerantRecharge.annualVolume.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Refrigerant Recharge</div>
                      <div className="text-xs text-gray-500 mt-1">~35% of emergency calls</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                      <div className="text-2xl font-bold text-green-600">
                        {tamData.compressorFanReplacements.annualVolume.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Compressor/Fan Repairs</div>
                      <div className="text-xs text-gray-500 mt-1">~20% of emergency calls</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                      <div className="text-2xl font-bold text-green-600">
                        ${tamData.fullSystemReplacements.revenue.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">System Replacement Revenue</div>
                      <div className="text-xs text-gray-500 mt-1">@$15,000 average ticket</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                      <div className="text-2xl font-bold text-green-600">
                        ${tamData.refrigerantRecharge.revenue.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Refrigerant Revenue</div>
                      <div className="text-xs text-gray-500 mt-1">@$800 average ticket</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                      <div className="text-2xl font-bold text-green-600">
                        ${tamData.compressorFanReplacements.revenue.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Compressor/Fan Revenue</div>
                      <div className="text-xs text-gray-500 mt-1">@$850 average ticket</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg border border-green-300">
                      <div className="text-2xl font-bold">
                        ${tamData.totalNewRevenueOpportunity.toLocaleString()}
                      </div>
                      <div className="text-sm text-green-100">Total Addressable Market</div>
                      <div className="text-xs text-green-200 mt-1">Annual revenue opportunity</div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <Button 
                      onClick={() => {
                        // TAM export for historical data - need to implement this
                        toast({
                          title: "TAM Export",
                          description: "TAM report export will be available in the next update",
                        });
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Download className="mr-2" size={16} />
                      Export TAM Report
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })()}

          {/* Keywords with Search Volume */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Keywords with Search Volume - PPC Opportunities ({selectedResearch.results.filter(k => k.searchVolume > 0).length} keywords)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="px-6 py-2 bg-gray-50 border-b border-gray-200">
                <div className="text-sm text-gray-600 flex items-center">
                  <ArrowDownWideNarrow size={16} className="mr-2" />
                  Click column headers to sort by search volume, CPC, budget cost, or keyword
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <SortableTableHead 
                        field="keyword" 
                        currentField={sortField} 
                        currentDirection={sortDirection} 
                        onSort={handleSort}
                      >
                        Keyword
                      </SortableTableHead>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">
                        <div className="flex items-center justify-end">
                          <button
                            className="cursor-pointer hover:bg-gray-50 select-none"
                            onClick={() => handleSort('searchVolume')}
                          >
                            <div className="flex items-center">
                              Search Volume
                              <div className="ml-2">
                                {sortField === 'searchVolume' ? (
                                  sortDirection === 'asc' ? (
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
                          </button>
                        </div>
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">
                        <div className="flex items-center justify-end">
                          <button
                            className="cursor-pointer hover:bg-gray-50 select-none"
                            onClick={() => handleSort('cpc')}
                          >
                            <div className="flex items-center">
                              CPC ($)
                              <div className="ml-2">
                                {sortField === 'cpc' ? (
                                  sortDirection === 'asc' ? (
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
                          </button>
                        </div>
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">
                        <div className="flex items-center justify-end">
                          <button
                            className="cursor-pointer hover:bg-gray-50 select-none"
                            onClick={() => handleSort('budgetCost')}
                          >
                            <div className="flex items-center">
                              PPC Budget Cost ($/mo)
                              <div className="ml-2">
                                {sortField === 'budgetCost' ? (
                                  sortDirection === 'asc' ? (
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
                          </button>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortKeywords(selectedResearch.results.filter(k => k.searchVolume > 0), sortField, sortDirection).map((result, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm">{result.keyword}</td>
                        <td className="py-3 px-4 text-right">{result.searchVolume.toLocaleString()}/mo</td>
                        <td className="py-3 px-4 text-right">${result.cpc.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right text-green-600">
                          ${Math.round(result.searchVolume * result.cpc * 0.30).toLocaleString()}/mo
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Keywords without Search Volume */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Zero Volume Keywords - SEO Content Targets ({selectedResearch.results.filter(k => k.searchVolume === 0).length} keywords)</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowZeroVolumeKeywords(!showZeroVolumeKeywords)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {showZeroVolumeKeywords ? (
                    <>
                      <ChevronUp size={16} />
                      <span className="ml-1 text-sm">Hide</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown size={16} />
                      <span className="ml-1 text-sm">Show</span>
                    </>
                  )}
                </Button>
              </CardTitle>
            </CardHeader>
            {showZeroVolumeKeywords && (
            <CardContent>
              <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                <div className="font-medium text-blue-800 mb-2">📊 Search Volume Disclaimer:</div>
                <p className="text-blue-700 mb-2">
                  Google does not report search traffic on keyword phrases that get fewer than 10 searches per month on average.
                </p>
                <p className="text-blue-700">
                  These keyword phrases likely represent an opportunity to create a blog post that, if it exactly matches the keyword phrase, will likely appear on the first page of Google search in a short period of time.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Keyword</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Search Volume</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Content Strategy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedResearch.results.filter(k => k.searchVolume === 0).map((result, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm">{result.keyword}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-gray-600">0</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-blue-600">Blog Post / Landing Page</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
            )}
          </Card>
        </main>
      </div>
    );
  }

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
                <h1 className="text-xl font-semibold text-gray-900">Search History</h1>
                <p className="text-sm text-neutral-dark">View and manage your keyword research history</p>
              </div>
            </div>
            <Link href="/">
              <Button variant="outline">Back to Research</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* History List */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {!researchHistory || researchHistory.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No search history</h3>
              <p className="text-gray-500 mb-6">Start by running your first keyword research</p>
              <Link href="/">
                <Button>Start New Research</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Bulk Selection Controls */}
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSelectAll}
                  className="flex items-center space-x-2"
                >
                  {selectedIds.size === researchHistory.length ? 
                    <CheckSquare size={16} /> : 
                    <Square size={16} />
                  }
                  <span>
                    {selectedIds.size === researchHistory.length ? 'Deselect All' : 'Select All'}
                  </span>
                </Button>
                {selectedIds.size > 0 && (
                  <span className="text-sm text-gray-600">
                    {selectedIds.size} item{selectedIds.size > 1 ? 's' : ''} selected
                  </span>
                )}
              </div>
              {selectedIds.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={bulkDeleteMutation.isPending}
                  className="flex items-center space-x-2"
                >
                  <Trash2 size={16} />
                  <span>Delete Selected ({selectedIds.size})</span>
                </Button>
              )}
            </div>

            <div className="grid gap-6">
            {researchHistory.map((research) => (
              <Card 
                key={research.id} 
                className="group cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedResearch(research)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelection(research.id);
                        }}
                        className="p-1"
                      >
                        {selectedIds.has(research.id) ? 
                          <CheckSquare size={16} className="text-primary" /> : 
                          <Square size={16} className="text-gray-400" />
                        }
                      </Button>
                      <div className="text-2xl">{getIndustryIcon(research.industry)}</div>
                      <div>
                        {editingId === research.id ? (
                          <div className="flex items-center space-x-2">
                            <Input
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              className="text-lg font-semibold"
                              placeholder="Enter research title..."
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveTitle();
                                if (e.key === 'Escape') cancelEditing();
                              }}
                              onClick={(e) => e.stopPropagation()}
                              autoFocus
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                saveTitle();
                              }}
                              disabled={updateResearchMutation.isPending}
                            >
                              <Check size={16} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                cancelEditing();
                              }}
                            >
                              <X size={16} />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <CardTitle className="text-lg">
                              {research.title || getDefaultTitle(research)}
                            </CardTitle>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditing(research);
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Edit2 size={14} />
                            </Button>
                          </div>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-neutral-dark mt-1">
                          <span className="flex items-center space-x-1">
                            <Calendar size={14} />
                            <span>{formatDate(research.createdAt)}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <MapPin size={14} />
                            <span>{research.cities.length} cities</span>
                          </span>
                          <span>{research.results.length} keywords</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          exportCSV(research);
                        }}
                        className="flex items-center space-x-1"
                      >
                        <Download size={14} />
                        <span>Export</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedResearch(research)}
                        className="flex items-center space-x-1"
                      >
                        <Eye size={14} />
                        <span>View</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDelete(research.id, e)}
                        className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {research.cities.map((city, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {city}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-neutral-dark">High Opportunity:</span>
                      <span className="ml-2 font-medium text-green-600">
                        {research.results.filter(r => r.opportunity === "High").length}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-dark">Medium Opportunity:</span>
                      <span className="ml-2 font-medium text-yellow-600">
                        {research.results.filter(r => r.opportunity === "Medium").length}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-dark">Total Volume:</span>
                      <span className="ml-2 font-medium">
                        {research.results.reduce((sum, r) => sum + r.searchVolume, 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}