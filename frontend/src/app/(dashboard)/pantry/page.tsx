'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CupboardItemForm } from '@/components/pantry/cupboard-item-form';
import { CupboardList } from '@/components/pantry/cupboard-list';
import { AlwaysHaveList } from '@/components/pantry/always-have-list';
import type { CupboardItem, AlwaysHaveItem } from '@/types/pantry';

export default function PantryPage() {
  const router = useRouter();
  const [cupboardItems, setCupboardItems] = useState<CupboardItem[]>([]);
  const [alwaysHaveItems, setAlwaysHaveItems] = useState<AlwaysHaveItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCupboardItems();
    fetchAlwaysHaveItems();
  }, []);

  const fetchCupboardItems = async () => {
    try {
      const response = await fetch('/api/pantry/cupboard');
      if (!response.ok) throw new Error('Failed to fetch cupboard items');
      const data = await response.json();
      setCupboardItems(data.items);
    } catch (error) {
      console.error('Error fetching cupboard items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAlwaysHaveItems = async () => {
    try {
      const response = await fetch('/api/pantry/always-have');
      if (!response.ok) throw new Error('Failed to fetch always-have items');
      const data = await response.json();
      setAlwaysHaveItems(data.items);
    } catch (error) {
      console.error('Error fetching always-have items:', error);
    }
  };

  const handleAddCupboardItem = async (item: string, quantity?: number, unit?: string) => {
    try {
      const response = await fetch('/api/pantry/cupboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item, quantity, unit }),
      });

      if (!response.ok) throw new Error('Failed to add item');

      await fetchCupboardItems();
    } catch (error) {
      console.error('Error adding cupboard item:', error);
      alert('Failed to add item');
    }
  };

  const handleUpdateCupboardItem = async (id: string, item: string, quantity?: number, unit?: string) => {
    try {
      const response = await fetch(`/api/pantry/cupboard/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item, quantity, unit }),
      });

      if (!response.ok) throw new Error('Failed to update item');

      await fetchCupboardItems();
    } catch (error) {
      console.error('Error updating cupboard item:', error);
      alert('Failed to update item');
    }
  };

  const handleDeleteCupboardItem = async (id: string) => {
    try {
      const response = await fetch(`/api/pantry/cupboard/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete item');

      await fetchCupboardItems();
    } catch (error) {
      console.error('Error deleting cupboard item:', error);
      alert('Failed to delete item');
    }
  };

  const handleAddAlwaysHaveItem = async (item: string, category?: string) => {
    try {
      const response = await fetch('/api/pantry/always-have', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item, category }),
      });

      if (!response.ok) throw new Error('Failed to add item');

      await fetchAlwaysHaveItems();
    } catch (error) {
      console.error('Error adding always-have item:', error);
      alert('Failed to add item');
    }
  };

  const handleDeleteAlwaysHaveItem = async (id: string) => {
    try {
      const response = await fetch(`/api/pantry/always-have/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete item');

      await fetchAlwaysHaveItems();
    } catch (error) {
      console.error('Error deleting always-have item:', error);
      alert('Failed to delete item');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Pantry Management</h1>
        <p className="text-muted-foreground mt-1">
          Track what's in your cupboard and maintain your staples list
        </p>
      </div>

      <Tabs defaultValue="cupboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="cupboard">What's in Cupboard</TabsTrigger>
          <TabsTrigger value="always-have">Always Have</TabsTrigger>
        </TabsList>

        <TabsContent value="cupboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Item to Cupboard</CardTitle>
              <CardDescription>
                Track ingredients you currently have available
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CupboardItemForm onAdd={handleAddCupboardItem} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Cupboard ({cupboardItems.length} items)</CardTitle>
            </CardHeader>
            <CardContent>
              <CupboardList
                items={cupboardItems}
                onUpdate={handleUpdateCupboardItem}
                onDelete={handleDeleteCupboardItem}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="always-have" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Always Have Items</CardTitle>
              <CardDescription>
                Staple ingredients you always keep in stock. These will be excluded from shopping lists.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlwaysHaveList
                items={alwaysHaveItems}
                onAdd={handleAddAlwaysHaveItem}
                onDelete={handleDeleteAlwaysHaveItem}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
