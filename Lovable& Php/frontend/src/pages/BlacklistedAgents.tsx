import { useState, useMemo, useEffect } from 'react';
import { Search, AlertTriangle, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Skeleton } from '@/components/ui/skeleton';

interface BlacklistedAgent {
  srNo: number;
  insurer: string;
  insurerType: string;
  pan: string;
  agentName: string;
  agencyCode: string;
  blacklistedDate: string;
}

const ITEMS_PER_PAGE = 25;

const BlacklistedAgents = () => {
  const [data, setData] = useState<BlacklistedAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState<string>('all');
  const [insurerTypeFilter, setInsurerTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // Load data from JSON file
    fetch('/blacklisted-agents.json')
      .then(res => res.json())
      .then((jsonData: BlacklistedAgent[]) => {
        setData(jsonData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading blacklisted agents data:', err);
        setLoading(false);
      });
  }, []);

  // Get unique insurer types for filter
  const insurerTypes = useMemo(() => {
    const types = [...new Set(data.map(agent => agent.insurerType))];
    return types.sort();
  }, [data]);

  // Filter data based on search and filters
  const filteredData = useMemo(() => {
    let result = data;

    // Apply insurer type filter
    if (insurerTypeFilter !== 'all') {
      result = result.filter(agent => agent.insurerType === insurerTypeFilter);
    }

    // Apply search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(agent => {
        if (searchField === 'all') {
          return (
            agent.insurer.toLowerCase().includes(term) ||
            agent.insurerType.toLowerCase().includes(term) ||
            agent.pan.toLowerCase().includes(term) ||
            agent.agentName.toLowerCase().includes(term) ||
            agent.agencyCode.toLowerCase().includes(term) ||
            agent.blacklistedDate.toLowerCase().includes(term)
          );
        }
        switch (searchField) {
          case 'insurer':
            return agent.insurer.toLowerCase().includes(term);
          case 'insurerType':
            return agent.insurerType.toLowerCase().includes(term);
          case 'pan':
            return agent.pan.toLowerCase().includes(term);
          case 'agentName':
            return agent.agentName.toLowerCase().includes(term);
          case 'agencyCode':
            return agent.agencyCode.toLowerCase().includes(term);
          case 'blacklistedDate':
            return agent.blacklistedDate.toLowerCase().includes(term);
          default:
            return true;
        }
      });
    }

    return result;
  }, [data, searchTerm, searchField, insurerTypeFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, searchField, insurerTypeFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setSearchField('all');
    setInsurerTypeFilter('all');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || searchField !== 'all' || insurerTypeFilter !== 'all';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container-content py-6 sm:py-10">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Blacklisted Agents
            </h1>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">
            Search and verify insurance agents blacklisted by our verification team. Data updated as on 20 Jan 2026.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-card rounded-xl border p-4 sm:p-6 mb-6 shadow-sm">
          <div className="flex flex-col gap-4">
            {/* Search Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search agents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={searchField} onValueChange={setSearchField}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Search in..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Fields</SelectItem>
                  <SelectItem value="agentName">Agent Name</SelectItem>
                  <SelectItem value="pan">PAN</SelectItem>
                  <SelectItem value="agencyCode">Agency Code</SelectItem>
                  <SelectItem value="insurer">Insurer</SelectItem>
                  <SelectItem value="blacklistedDate">Date</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filter Row */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="w-4 h-4" />
                <span>Filter by:</span>
              </div>
              <Select value={insurerTypeFilter} onValueChange={setInsurerTypeFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Insurer Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {insurerTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                  <X className="w-4 h-4" />
                  Clear filters
                </Button>
              )}
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 pt-4 border-t flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{paginatedData.length}</span> of{' '}
              <span className="font-medium text-foreground">{filteredData.length.toLocaleString()}</span> results
              {filteredData.length !== data.length && (
                <span className="text-muted-foreground"> (filtered from {data.length.toLocaleString()} total)</span>
              )}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[60px]">Sr. No</TableHead>
                  <TableHead>Agent Name</TableHead>
                  <TableHead>PAN</TableHead>
                  <TableHead>Agency Code</TableHead>
                  <TableHead>Insurer</TableHead>
                  <TableHead className="w-[100px]">Type</TableHead>
                  <TableHead className="w-[120px]">Blacklisted Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                      No agents found matching your search criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((agent) => (
                    <TableRow key={`${agent.srNo}-${agent.pan}`}>
                      <TableCell className="font-medium">{agent.srNo}</TableCell>
                      <TableCell className="font-medium">{agent.agentName}</TableCell>
                      <TableCell className="font-mono text-sm">{agent.pan}</TableCell>
                      <TableCell className="font-mono text-sm">{agent.agencyCode}</TableCell>
                      <TableCell className="text-sm max-w-[200px] truncate" title={agent.insurer}>
                        {agent.insurer}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={
                            agent.insurerType === 'LIFE' 
                              ? 'border-blue-500 text-blue-600 bg-blue-50' 
                              : agent.insurerType === 'HEALTH'
                              ? 'border-green-500 text-green-600 bg-green-50'
                              : 'border-orange-500 text-orange-600 bg-orange-50'
                          }
                        >
                          {agent.insurerType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {agent.blacklistedDate.replace(' 12:00 AM', '')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/30">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>Disclaimer:</strong> This data is maintained by our internal verification team's blacklisted agents registry. 
            PadosiAgent recommends verifying agent credentials before engaging in any insurance transactions. 
            For the most up-to-date information, please contact our support team.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlacklistedAgents;