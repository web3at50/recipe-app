'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Search, Plus, Trash2, Eye, EyeOff, Settings2, Loader2 } from 'lucide-react';
import { PantryOnboarding } from './pantry-onboarding';
import { STANDARD_UK_PANTRY_ITEMS, type PantryStaple, type PantryPreferenceState } from '@/types/pantry';

interface PantryManagementProps {
  initialStaples: PantryStaple[];
}

export function PantryManagement({ initialStaples }: PantryManagementProps) {
  const [staples, setStaples] = useState<PantryStaple[]>(initialStaples);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState<PantryPreferenceState | 'all'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [customItemName, setCustomItemName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Filtered and searched staples
  const filteredStaples = useMemo(() => {
    return staples.filter((staple) => {
      const matchesSearch = staple.item_pattern
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesFilter = filterState === 'all' || staple.preference_state === filterState;
      return matchesSearch && matchesFilter;
    });
  }, [staples, searchQuery, filterState]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: staples.length,
      hide: staples.filter((s) => s.preference_state === 'hide').length,
      show: staples.filter((s) => s.preference_state === 'show').length,
      auto: staples.filter((s) => s.preference_state === 'auto').length,
    };
  }, [staples]);

  // Handle preference state update
  const updatePreferenceState = async (stapleId: string, newState: PantryPreferenceState) => {
    try {
      const response = await fetch(`/api/user/pantry-staples/${stapleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preference_state: newState }),
      });

      if (!response.ok) throw new Error('Failed to update preference');

      const { staple } = await response.json();
      setStaples((prev) =>
        prev.map((s) => (s.id === stapleId ? staple : s))
      );
    } catch (error) {
      console.error('Error updating preference:', error);
      alert('Failed to update preference. Please try again.');
    }
  };

  // Handle delete single item
  const deleteSingleItem = async (stapleId: string) => {
    if (!confirm('Remove this item from your pantry staples?')) return;

    try {
      const response = await fetch(`/api/user/pantry-staples/${stapleId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete item');

      setStaples((prev) => prev.filter((s) => s.id !== stapleId));
      setSelectedIds((prev) => prev.filter((id) => id !== stapleId));
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item. Please try again.');
    }
  };

  // Handle bulk delete
  const bulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Remove ${selectedIds.length} items from your pantry staples?`)) return;

    setIsLoading(true);
    try {
      const itemsToDelete = staples.filter((s) => selectedIds.includes(s.id));
      const patterns = itemsToDelete.map((s) => s.item_pattern);

      const response = await fetch('/api/user/pantry-staples/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_patterns: patterns }),
      });

      if (!response.ok) throw new Error('Failed to delete items');

      setStaples((prev) => prev.filter((s) => !selectedIds.includes(s.id)));
      setSelectedIds([]);
    } catch (error) {
      console.error('Error bulk deleting:', error);
      alert('Failed to delete items. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle bulk state change
  const bulkUpdateState = async (newState: PantryPreferenceState) => {
    if (selectedIds.length === 0) return;

    setIsLoading(true);
    try {
      // Update each selected item
      const updatePromises = selectedIds.map((id) =>
        fetch(`/api/user/pantry-staples/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ preference_state: newState }),
        })
      );

      await Promise.all(updatePromises);

      // Update local state
      setStaples((prev) =>
        prev.map((s) =>
          selectedIds.includes(s.id) ? { ...s, preference_state: newState } : s
        )
      );
      setSelectedIds([]);
    } catch (error) {
      console.error('Error bulk updating:', error);
      alert('Failed to update items. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle add custom item
  const addCustomItem = async () => {
    if (!customItemName.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/user/pantry-staples', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_pattern: customItemName.trim().toLowerCase(),
          preference_state: 'hide',
        }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error);
      }

      const { staple } = await response.json();
      setStaples((prev) => [...prev, staple].sort((a, b) =>
        a.item_pattern.localeCompare(b.item_pattern)
      ));
      setCustomItemName('');
      setIsAddingCustom(false);
    } catch (error: unknown) {
      console.error('Error adding custom item:', error);
      const message = error instanceof Error ? error.message : 'Failed to add item';
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle onboarding save
  const handleOnboardingSave = async (selectedIds: string[]) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/pantry-staples/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_ids: selectedIds,
          preference_state: 'hide',
        }),
      });

      if (!response.ok) throw new Error('Failed to save items');

      const { staples: newStaples } = await response.json();

      // Merge with existing staples, removing duplicates
      const existingPatterns = new Set(staples.map(s => s.item_pattern));
      const uniqueNewStaples = newStaples.filter(
        (s: PantryStaple) => !existingPatterns.has(s.item_pattern)
      );

      setStaples((prev) => [...prev, ...uniqueNewStaples].sort((a, b) =>
        a.item_pattern.localeCompare(b.item_pattern)
      ));
      setIsOnboardingOpen(false);
    } catch (error) {
      console.error('Error saving onboarding items:', error);
      alert('Failed to save items. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredStaples.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredStaples.map((s) => s.id));
    }
  };

  // Get preference state badge
  const getStateBadge = (state: PantryPreferenceState) => {
    switch (state) {
      case 'hide':
        return <Badge variant="secondary" className="bg-red-500/10 text-red-500 hover:bg-red-500/20">Hide</Badge>;
      case 'show':
        return <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">Show</Badge>;
      case 'auto':
        return <Badge variant="secondary" className="bg-gray-500/10 text-gray-500 hover:bg-gray-500/20">Auto</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Items</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Always Hide</CardDescription>
            <CardTitle className="text-3xl text-red-500">{stats.hide}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Always Show</CardDescription>
            <CardTitle className="text-3xl text-blue-500">{stats.show}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Auto-Detect</CardDescription>
            <CardTitle className="text-3xl text-gray-500">{stats.auto}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Main Management Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Manage Your Pantry Items</CardTitle>
              <CardDescription>
                Search, filter, and customize your pantry staples preferences
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Dialog open={isOnboardingOpen} onOpenChange={setIsOnboardingOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add from Standard List
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add Standard Pantry Items</DialogTitle>
                    <DialogDescription>
                      Select items from our curated UK pantry staples list
                    </DialogDescription>
                  </DialogHeader>
                  <PantryOnboarding
                    selected={[]}
                    onChange={(ids) => {
                      // Store temporarily for save
                      (window as unknown as { tempPantrySelection: string[] }).tempPantrySelection = ids;
                    }}
                  />
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOnboardingOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        const ids = (window as unknown as { tempPantrySelection?: string[] }).tempPantrySelection || [];
                        handleOnboardingSave(ids);
                      }}
                      disabled={isLoading}
                    >
                      {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Add Selected Items
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={isAddingCustom} onOpenChange={setIsAddingCustom}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Custom Item
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Custom Pantry Item</DialogTitle>
                    <DialogDescription>
                      Add an item not in the standard list
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="custom-item">Item Name</Label>
                      <Input
                        id="custom-item"
                        placeholder="e.g., coconut oil"
                        value={customItemName}
                        onChange={(e) => setCustomItemName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            addCustomItem();
                          }
                        }}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => {
                      setIsAddingCustom(false);
                      setCustomItemName('');
                    }}>
                      Cancel
                    </Button>
                    <Button onClick={addCustomItem} disabled={!customItemName.trim() || isLoading}>
                      {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Add Item
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search pantry items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterState} onValueChange={(value) => setFilterState(value as PantryPreferenceState | 'all')}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                <SelectItem value="hide">Hide Only</SelectItem>
                <SelectItem value="show">Show Only</SelectItem>
                <SelectItem value="auto">Auto Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-4 p-4 bg-accent/50 rounded-lg border border-accent">
              <span className="text-sm font-medium">
                {selectedIds.length} item{selectedIds.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2 ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => bulkUpdateState('hide')}
                  disabled={isLoading}
                >
                  <EyeOff className="h-4 w-4 mr-2" />
                  Set to Hide
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => bulkUpdateState('show')}
                  disabled={isLoading}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Set to Show
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => bulkUpdateState('auto')}
                  disabled={isLoading}
                >
                  <Settings2 className="h-4 w-4 mr-2" />
                  Set to Auto
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={bulkDelete}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}

          {/* Items List */}
          {filteredStaples.length > 0 ? (
            <div className="space-y-2">
              {/* Select All */}
              <div className="flex items-center gap-3 p-3 border-b">
                <Checkbox
                  checked={selectedIds.length === filteredStaples.length}
                  onCheckedChange={toggleSelectAll}
                />
                <span className="text-sm font-medium text-muted-foreground">
                  Select All ({filteredStaples.length})
                </span>
              </div>

              {/* Items */}
              {filteredStaples.map((staple) => (
                <div
                  key={staple.id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <Checkbox
                    checked={selectedIds.includes(staple.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedIds((prev) => [...prev, staple.id]);
                      } else {
                        setSelectedIds((prev) => prev.filter((id) => id !== staple.id));
                      }
                    }}
                  />
                  <div className="flex-1">
                    <p className="font-medium capitalize">{staple.item_pattern}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStateBadge(staple.preference_state)}
                    <Select
                      value={staple.preference_state}
                      onValueChange={(value) => updatePreferenceState(staple.id, value as PantryPreferenceState)}
                    >
                      <SelectTrigger className="w-[120px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hide">Hide</SelectItem>
                        <SelectItem value="show">Show</SelectItem>
                        <SelectItem value="auto">Auto</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSingleItem(staple.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                {searchQuery || filterState !== 'all'
                  ? 'No items match your filters'
                  : 'No pantry staples yet. Add some to get started!'}
              </p>
              {!searchQuery && filterState === 'all' && (
                <Button onClick={() => setIsOnboardingOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Items
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help Card */}
      <Card>
        <CardHeader>
          <CardTitle>How Pantry Staples Work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <Badge variant="secondary" className="bg-red-500/10 text-red-500">Hide</Badge>
            </div>
            <p><strong>Always Hide:</strong> This item will never appear on shopping lists, regardless of quantity.</p>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-500">Show</Badge>
            </div>
            <p><strong>Always Show:</strong> This item will always appear on shopping lists, even in small quantities.</p>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <Badge variant="secondary" className="bg-gray-500/10 text-gray-500">Auto</Badge>
            </div>
            <p><strong>Auto-Detect:</strong> Let the system decide based on quantity and context (default behavior).</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
