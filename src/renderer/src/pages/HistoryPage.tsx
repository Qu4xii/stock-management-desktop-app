// In src/renderer/src/pages/HistoryPage.tsx

import React, { useState, useEffect } from 'react';
import { HistoryEvent } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ShoppingCart, Wrench } from 'lucide-react';
import { toast } from 'sonner';
// --- 1. IMPORT THE UI COMPONENTS WE NEED ---
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

type FilterType = 'all' | 'purchase' | 'repair';

function HistoryPage(): JSX.Element {
  // --- 2. ADD NEW STATE VARIABLES ---
  const [isLoading, setIsLoading] = useState(true);
  const [allHistory, setAllHistory] = useState<HistoryEvent[]>([]);       // This holds the original, full list from the DB
  const [filteredHistory, setFilteredHistory] = useState<HistoryEvent[]>([]);// This holds the list that we actually display
  
  const [searchTerm, setSearchTerm] = useState('');     // State for the search input
  const [filterType, setFilterType] = useState<FilterType>('all'); // State for the active filter button

  // --- 3. MODIFY THE INITIAL DATA FETCH ---
  // This useEffect now runs only once to get the data.
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const historyData = await window.db.getHistory();
        setAllHistory(historyData);      // Store the full list
        setFilteredHistory(historyData); // Initially, display the full list
      } catch (error) {
        console.error("Failed to fetch history:", error);
        toast.error("Failed to load transaction history.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []); // Empty dependency array means this runs only on component mount

  // --- 4. ADD A NEW useEffect TO HANDLE SEARCH AND FILTER LOGIC ---
  // This effect runs whenever the user types in the search box, clicks a filter, or the master list changes.
  useEffect(() => {
    let results = [...allHistory]; // Start with the full list

    // Apply the type filter first
    if (filterType !== 'all') {
      results = results.filter(event => event.type === filterType);
    }

    // Apply the search term filter
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase().trim();
      results = results.filter(event => 
        event.clientName.toLowerCase().includes(lowercasedTerm) ||
        event.primaryDetail.toLowerCase().includes(lowercasedTerm) ||
        (event.secondaryDetail && event.secondaryDetail.toLowerCase().includes(lowercasedTerm))
      );
    }
    
    setFilteredHistory(results); // Update the list that is displayed on screen
  }, [searchTerm, filterType, allHistory]);


  const renderEvent = (event: HistoryEvent) => (
    // ... (This function remains exactly the same as before)
    <div key={`${event.type}-${event.id}`} className="flex items-start gap-4 p-4 border-b last:border-b-0 dark:border-slate-700">
      <div className="flex-shrink-0 mt-1">
        {event.type === 'purchase' ? 
          <ShoppingCart className="h-6 w-6 text-blue-500" /> : 
          <Wrench className="h-6 w-6 text-green-500" />
        }
      </div>
      <div className="flex-grow">
        <div className="flex justify-between items-center">
          <p className="font-semibold">{event.clientName}</p>
          <p className="text-xs text-muted-foreground">{new Date(event.eventDate).toLocaleString()}</p>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{event.primaryDetail}</p>
        {event.secondaryDetail && (
          <p className="text-xs text-muted-foreground mt-1">Assigned to: {event.secondaryDetail}</p>
        )}
      </div>
      <div className="text-right flex-shrink-0 ml-4">
        <Badge variant={event.type === 'purchase' ? 'default' : 'secondary'} className="mb-1 capitalize">
          {event.type}
        </Badge>
        {event.totalPrice != null ? (
          <p className="font-bold text-lg">${event.totalPrice.toFixed(2)}</p>
        ) : (
          <p className="font-bold text-lg text-muted-foreground">N/A</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Transaction History</h1>
      </div>
      
      {/* --- 5. ADD THE SEARCH AND FILTER UI CONTROLS --- */}
      <div className="flex items-center gap-4">
        <Input 
          placeholder="Search by client, item, or technician..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center gap-2">
          <Button variant={filterType === 'all' ? 'default' : 'outline'} onClick={() => setFilterType('all')}>All</Button>
          <Button variant={filterType === 'purchase' ? 'default' : 'outline'} onClick={() => setFilterType('purchase')}>Purchases</Button>
          <Button variant={filterType === 'repair' ? 'default' : 'outline'} onClick={() => setFilterType('repair')}>Repairs</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Client Activity</CardTitle>
          <CardDescription>A chronological log of all purchases and work orders.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="text-center p-8 text-muted-foreground">Loading history...</p>
          ) : filteredHistory.length > 0 ? ( // <-- 6. RENDER THE FILTERED LIST
            <div>{filteredHistory.map(renderEvent)}</div>
          ) : (
            <p className="text-center p-8 text-muted-foreground">No history found matching your criteria.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default HistoryPage;