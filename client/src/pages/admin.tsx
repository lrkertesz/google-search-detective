import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Settings, Plus, Edit, Trash2, Save, Key, Factory, ArrowLeft, Eye, EyeOff, TestTube } from "lucide-react";
import { Link } from "wouter";
import type { Industry, Settings as SettingsType } from "@shared/schema";

interface EditingIndustry extends Omit<Industry, 'keywords'> {
  keywords: string;
}

interface ApiKeyStatus {
  valid: boolean;
  message: string;
  source?: string;
  creditsRemaining?: number;
}

export default function Admin() {
  const [editingIndustry, setEditingIndustry] = useState<EditingIndustry | null>(null);
  const [isEditingOpen, setIsEditingOpen] = useState(false);
  const [newIndustry, setNewIndustry] = useState({ name: "", label: "", keywords: "" });
  const [isCreating, setIsCreating] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const { toast } = useToast();

  // Fetch industries
  const { data: industries, isLoading: industriesLoading } = useQuery<Industry[]>({
    queryKey: ["/api/admin/industries"],
  });

  // Fetch settings
  const { data: settings, isLoading: settingsLoading } = useQuery<SettingsType>({
    queryKey: ["/api/admin/settings"],
  });

  // Check current API key status
  const { data: apiKeyStatus } = useQuery<ApiKeyStatus>({
    queryKey: ["/api/admin/test-current-api-key"],
    refetchInterval: false,
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: { keywordsEverywhereApiKey: string }) => {
      const response = await apiRequest("PUT", "/api/admin/settings", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/test-current-api-key"] });
      toast({
        title: "Settings Updated",
        description: "API key has been saved successfully",
      });
      setApiKeyInput("");
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Test API key mutation
  const testApiKeyMutation = useMutation({
    mutationFn: async (apiKey: string) => {
      const response = await apiRequest("POST", "/api/admin/test-api-key", { apiKey });
      return response.json();
    },
    onSuccess: (data: { valid: boolean; message: string; creditsRemaining?: number }) => {
      toast({
        title: data.valid ? "API Key Valid" : "API Key Invalid",
        description: data.creditsRemaining 
          ? `${data.message}. Credits remaining: ${data.creditsRemaining}`
          : data.message,
        variant: data.valid ? "default" : "destructive",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Test Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create industry mutation
  const createIndustryMutation = useMutation({
    mutationFn: async (data: { name: string; label: string; keywords: string[] }) => {
      const response = await apiRequest("POST", "/api/admin/industries", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/industries"] });
      setNewIndustry({ name: "", label: "", keywords: "" });
      setIsCreating(false);
      toast({
        title: "Industry Created",
        description: "New industry has been added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update industry mutation
  const updateIndustryMutation = useMutation({
    mutationFn: async (data: { id: number; name: string; label: string; keywords: string[] }) => {
      const { id, ...updateData } = data;
      const response = await apiRequest("PUT", `/api/admin/industries/${id}`, updateData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/industries"] });
      closeEditDialog();
      toast({
        title: "Industry Updated",
        description: "Industry has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete industry mutation
  const deleteIndustryMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/industries/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/industries"] });
      toast({
        title: "Industry Deleted",
        description: "Industry has been removed successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Deletion Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSaveSettings = () => {
    if (!apiKeyInput.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter an API key",
        variant: "destructive",
      });
      return;
    }

    updateSettingsMutation.mutate({
      keywordsEverywhereApiKey: apiKeyInput.trim(),
    });
  };

  const handleTestApiKey = () => {
    const keyToTest = apiKeyInput.trim() || settings?.keywordsEverywhereApiKey;
    if (!keyToTest) {
      toast({
        title: "No API Key",
        description: "Please enter an API key to test or save one first",
        variant: "destructive",
      });
      return;
    }
    testApiKeyMutation.mutate(keyToTest);
  };

  const handleCreateIndustry = () => {
    if (!newIndustry.name.trim() || !newIndustry.label.trim() || !newIndustry.keywords.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const keywordsArray = newIndustry.keywords
      .split('\n')
      .map(k => k.trim())
      .filter(k => k.length > 0);

    createIndustryMutation.mutate({
      name: newIndustry.name.trim(),
      label: newIndustry.label.trim(),
      keywords: keywordsArray,
    });
  };

  const handleUpdateIndustry = (industry: Industry) => {
    if (!editingIndustry) return;

    const keywordsArray = typeof editingIndustry.keywords === 'string' 
      ? (editingIndustry.keywords as string).split('\n').map(k => k.trim()).filter(k => k.length > 0)
      : editingIndustry.keywords;

    updateIndustryMutation.mutate({
      id: industry.id,
      name: editingIndustry.name.trim(),
      label: editingIndustry.label.trim(),
      keywords: keywordsArray,
    });
  };

  const openEditDialog = (industry: Industry) => {
    console.log('Opening edit dialog for industry:', industry);
    
    // Ensure we have valid data before proceeding
    if (!industry || !industry.id) {
      console.error('Invalid industry data:', industry);
      return;
    }
    
    // Prepare keywords data safely
    let keywordsString = '';
    if (Array.isArray(industry.keywords)) {
      keywordsString = industry.keywords.join('\n');
    } else if (typeof industry.keywords === 'string') {
      keywordsString = industry.keywords;
    }
    
    // Set the editing state
    setEditingIndustry({
      id: industry.id,
      name: industry.name || '',
      label: industry.label || '',
      keywords: keywordsString
    });
    
    // Open the dialog
    setIsEditingOpen(true);
  };

  const closeEditDialog = () => {
    setIsEditingOpen(false);
    setEditingIndustry(null);
  };

  if (industriesLoading || settingsLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-neutral">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-2 text-neutral-dark hover:text-gray-900">
                <ArrowLeft size={20} />
                <span>Back to Research</span>
              </Link>
              <div className="w-px h-6 bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                  <Settings className="text-white" size={20} />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Admin Settings</h1>
                  <p className="text-sm text-neutral-dark">Manage industries, keywords, and API configuration</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* API Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Key className="text-primary" size={20} />
              <span>API Configuration</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="api-key" className="text-sm font-medium">Keywords Everywhere API Key</Label>
              <div className="flex items-center space-x-2 mt-2">
                <div className="relative flex-1">
                  <Input
                    id="api-key"
                    type={showApiKey ? "text" : "password"}
                    placeholder="Enter your Keywords Everywhere API key"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
                <Button
                  onClick={handleTestApiKey}
                  disabled={testApiKeyMutation.isPending}
                  variant="outline"
                  className="border-blue-500 text-blue-600 hover:bg-blue-50"
                >
                  <TestTube size={16} className="mr-2" />
                  {testApiKeyMutation.isPending ? "Testing..." : "Test"}
                </Button>
                <Button
                  onClick={handleSaveSettings}
                  disabled={updateSettingsMutation.isPending}
                  className="bg-primary hover:bg-primary-dark"
                >
                  <Save size={16} className="mr-2" />
                  Save
                </Button>
              </div>
              {/* API Key Status */}
              {apiKeyStatus && (
                <div className="mt-2">
                  {apiKeyStatus.valid ? (
                    <p className="text-sm text-green-600">
                      ✓ API key is active ({apiKeyStatus.source === 'environment' ? 'from environment variables' : 'from database'})
                      {apiKeyStatus.creditsRemaining && ` - ${apiKeyStatus.creditsRemaining} credits remaining`}
                    </p>
                  ) : (
                    <p className="text-sm text-red-600">
                      ✗ {apiKeyStatus.message}
                    </p>
                  )}
                </div>
              )}
              {!apiKeyStatus?.valid && settings?.keywordsEverywhereApiKey && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ API key is configured (database)
                </p>
              )}
              <p className="text-xs text-neutral-dark mt-1">
                Get your API key from <a href="https://keywordseverywhere.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">keywordseverywhere.com</a>
                {apiKeyStatus?.source === 'environment' && (
                  <span className="block mt-1 text-green-600">
                    Note: Using API key from Replit environment variables (persistent across restarts)
                  </span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Industries Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Factory className="text-secondary" size={20} />
                <span>Industry Management</span>
              </CardTitle>
              <Dialog open={isCreating} onOpenChange={setIsCreating}>
                <DialogTrigger asChild>
                  <Button className="bg-secondary hover:bg-secondary/90">
                    <Plus size={16} className="mr-2" />
                    Add Industry
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Industry</DialogTitle>
                    <DialogDescription>
                      Create a new industry with a unique name, display label, and keyword list.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="new-name">Industry Name (URL-safe)</Label>
                      <Input
                        id="new-name"
                        placeholder="e.g., hvac, plumbing, electrical"
                        value={newIndustry.name}
                        onChange={(e) => setNewIndustry(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-label">Display Label</Label>
                      <Input
                        id="new-label"
                        placeholder="e.g., HVAC, Plumbing, Electrical"
                        value={newIndustry.label}
                        onChange={(e) => setNewIndustry(prev => ({ ...prev, label: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-keywords">Keywords (one per line)</Label>
                      <Textarea
                        id="new-keywords"
                        placeholder="HVAC repair&#10;air conditioning repair&#10;heating service"
                        rows={8}
                        value={newIndustry.keywords}
                        onChange={(e) => setNewIndustry(prev => ({ ...prev, keywords: e.target.value }))}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsCreating(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleCreateIndustry}
                        disabled={createIndustryMutation.isPending}
                      >
                        Create Industry
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {industries?.map((industry: Industry) => (
                <Card key={industry.id} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-gray-900">{industry.label}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {industry.name}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {Array.isArray(industry.keywords) ? industry.keywords.length : 0} keywords
                          </Badge>
                        </div>
                        <div className="text-sm text-neutral-dark">
                          {Array.isArray(industry.keywords) 
                            ? industry.keywords.slice(0, 3).join(", ") + (industry.keywords.length > 3 ? "..." : "")
                            : "No keywords"
                          }
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openEditDialog(industry)}
                        >
                          <Edit size={14} className="mr-1" />
                          Edit
                        </Button>
                        
                        <Dialog open={isEditingOpen} onOpenChange={setIsEditingOpen}>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Edit Industry</DialogTitle>
                              <DialogDescription>
                                Modify the industry details and update the keyword list.
                              </DialogDescription>
                            </DialogHeader>
                            {editingIndustry && (
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="edit-name">Industry Name</Label>
                                  <Input
                                    id="edit-name"
                                    value={editingIndustry.name}
                                    onChange={(e) => setEditingIndustry(prev => prev ? { ...prev, name: e.target.value } : null)}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-label">Display Label</Label>
                                  <Input
                                    id="edit-label"
                                    value={editingIndustry.label}
                                    onChange={(e) => setEditingIndustry(prev => prev ? { ...prev, label: e.target.value } : null)}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-keywords">Keywords (one per line)</Label>
                                  <Textarea
                                    id="edit-keywords"
                                    rows={8}
                                    value={typeof editingIndustry.keywords === 'string' 
                                      ? editingIndustry.keywords 
                                      : Array.isArray(editingIndustry.keywords) 
                                        ? (editingIndustry.keywords as string[]).join('\n')
                                        : ''
                                    }
                                    onChange={(e) => setEditingIndustry(prev => prev ? { ...prev, keywords: e.target.value } : null)}
                                  />
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <Button variant="outline" onClick={closeEditDialog}>
                                    Cancel
                                  </Button>
                                  <Button 
                                    onClick={() => handleUpdateIndustry(industry)}
                                    disabled={updateIndustryMutation.isPending}
                                  >
                                    Update Industry
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 size={14} className="mr-1" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Industry</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete the "{industry.label}" industry? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteIndustryMutation.mutate(industry.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}