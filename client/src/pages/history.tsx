import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Search, Trash2, Eye, Download, Calendar, MapPin, Building2, ArrowLeft, Edit2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { exportToCSV } from "@/lib/csvExport";
import type { KeywordResearch } from "@shared/schema";

export default function HistoryPage() {
  const { toast } = useToast();
  const [selectedResearch, setSelectedResearch] = useState<KeywordResearch | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>("");

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
                    {selectedResearch.results.filter(k => k.opportunity === "High").length}
                  </div>
                  <div className="text-sm text-gray-600">High Opportunity</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Keywords with Search Volume */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Keywords with Search Volume - PPC Opportunities ({selectedResearch.results.filter(k => k.searchVolume > 0).length} keywords)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Keyword</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Search Volume</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">CPC</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Competition</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Opportunity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedResearch.results.filter(k => k.searchVolume > 0).map((result, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono text-sm">{result.keyword}</td>
                        <td className="py-3 px-4 text-right">{result.searchVolume.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right">${result.cpc.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right">{result.competition}%</td>
                        <td className="py-3 px-4 text-center">
                          <Badge 
                            variant="secondary" 
                            className={
                              result.opportunity === "High" ? "bg-green-100 text-green-800" :
                              result.opportunity === "Medium" ? "bg-yellow-100 text-yellow-800" :
                              "bg-gray-100 text-gray-800"
                            }
                          >
                            {result.opportunity}
                          </Badge>
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
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Keyword</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Competition</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Content Strategy</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">SEO Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedResearch.results.filter(k => k.searchVolume === 0).map((result, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono text-sm">{result.keyword}</td>
                        <td className="py-3 px-4 text-center">{result.competition}%</td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-blue-600">Blog Post / Landing Page</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge 
                            variant="secondary"
                            className={
                              result.competition <= 30 ? "bg-green-100 text-green-800" :
                              result.competition <= 60 ? "bg-yellow-100 text-yellow-800" :
                              "bg-red-100 text-red-800"
                            }
                          >
                            {result.competition <= 30 ? "High Priority" :
                             result.competition <= 60 ? "Medium Priority" :
                             "Low Priority"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
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
        )}
      </main>
    </div>
  );
}