import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import Navbar from '@/components/Navbar';
import AdminDashboard from '@/components/AdminDashboard';
import {
  Users, BarChart3, Shield, Send, Search, ArrowUpDown, Star, Eye, UserCheck,
  UserX, MessageSquare, Mail, Phone, MapPin, Building, ChevronDown, ChevronUp,
  RefreshCw, Filter, TrendingUp, AlertCircle, CheckCircle2
} from 'lucide-react';
import { useAdminPanel, type SortField, type AdminAgent } from '@/hooks/useAdminPanel';
import { DashboardSkeleton } from '@/components/skeletons';
import SkeletonMappingDashboard from '@/components/admin/SkeletonMappingDashboard';
import { toast } from '@/components/ui/sonner';

const AdminPanel: React.FC = () => {
  const {
    agents,
    allAgents,
    distributors,
    isLoading,
    filters,
    setFilters,
    dashboardStats,
    toggleAgentApproval,
    toggleProfileSection,
    updateAdminNotes,
    updateAgentDetails,
    deleteReview,
    approveReview,
    refreshData,
  } = useAdminPanel();

  const [selectedAgent, setSelectedAgent] = useState<AdminAgent | null>(null);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageType, setMessageType] = useState<string>('renewal');
  const [messageChannel, setMessageChannel] = useState<string>('email');
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);
  const [notesText, setNotesText] = useState('');
  const [dateRange, setDateRange] = useState('12m');

  if (isLoading) return <><Navbar /><div className="pt-20"><DashboardSkeleton /></div></>;

  const handleSort = (field: SortField) => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortDir: prev.sortBy === field && prev.sortDir === 'asc' ? 'desc' : 'asc',
    }));
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (filters.sortBy !== field) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-40" />;
    return filters.sortDir === 'asc'
      ? <ChevronUp className="h-3 w-3 ml-1 text-primary" />
      : <ChevronDown className="h-3 w-3 ml-1 text-primary" />;
  };

  const toggleSelectAgent = (id: string) => {
    setSelectedAgentIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAllAgents = () => {
    if (selectedAgentIds.length === agents.length) {
      setSelectedAgentIds([]);
    } else {
      setSelectedAgentIds(agents.map(a => a.id));
    }
  };

  const handleBulkApproval = async (approve: boolean) => {
    for (const id of selectedAgentIds) {
      await toggleAgentApproval(id, approve);
    }
    setSelectedAgentIds([]);
  };

  const handleSendMessage = () => {
    const targetAgents = selectedAgentIds.length > 0
      ? agents.filter(a => selectedAgentIds.includes(a.id))
      : selectedAgent ? [selectedAgent] : [];

    if (targetAgents.length === 0) {
      toast.error('No agents selected');
      return;
    }

    const messageLabels: Record<string, string> = {
      renewal: 'Renewal Reminder',
      upgrade: 'Upgrade Message',
      offer: 'Special Offer',
      refer: 'Refer & Earn',
    };

    // In a production app, this would call an edge function to send emails/WhatsApp
    toast.success(
      `${messageLabels[messageType] || messageType} queued to ${targetAgents.length} agent(s) via ${messageChannel}`
    );
    setMessageDialogOpen(false);
    setSelectedAgentIds([]);
  };

  return (
    <>
      <Navbar />
      <div className="pt-6 sm:pt-8 pb-10 min-h-screen bg-muted/30">
        <div className="container-content">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Admin Panel</h1>
              <p className="text-muted-foreground text-sm mt-1">Manage agents, distributors, and platform settings</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => refreshData()} className="gap-2 self-start">
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
          </div>

          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="flex overflow-x-auto w-full justify-start bg-background border gap-1 p-1 rounded-lg">
              <TabsTrigger value="dashboard" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap"><BarChart3 className="h-4 w-4" /> Dashboard</TabsTrigger>
              <TabsTrigger value="agents" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap"><Users className="h-4 w-4" /> Agents</TabsTrigger>
              <TabsTrigger value="distributors" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap"><Building className="h-4 w-4" /> Distributors</TabsTrigger>
              <TabsTrigger value="messaging" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap"><Send className="h-4 w-4" /> Messaging</TabsTrigger>
              <TabsTrigger value="skeletons" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap"><Eye className="h-4 w-4" /> Skeletons</TabsTrigger>
            </TabsList>

            {/* === DASHBOARD TAB === */}
            <TabsContent value="dashboard">
              <AdminDashboard agents={allAgents} distributors={distributors} dateRange={dateRange} setDateRange={setDateRange} />
            </TabsContent>

            {/* === AGENTS TAB === */}
            <TabsContent value="agents">
              {/* Filters */}
              <Card className="mb-4">
                <CardContent className="pt-4">
                  <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name, email, location, license..."
                        value={filters.search}
                        onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        className="pl-9"
                      />
                    </div>
                    <Select value={filters.plan || 'all'} onValueChange={v => setFilters(prev => ({ ...prev, plan: v === 'all' ? '' : v }))}>
                      <SelectTrigger className="w-[150px]"><SelectValue placeholder="Plan" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Plans</SelectItem>
                        <SelectItem value="starter">Starter</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filters.status || 'all'} onValueChange={v => setFilters(prev => ({ ...prev, status: v === 'all' ? '' : v }))}>
                      <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Filter by city..."
                      value={filters.city}
                      onChange={e => setFilters(prev => ({ ...prev, city: e.target.value }))}
                      className="w-[160px]"
                    />
                  </div>

                  {selectedAgentIds.length > 0 && (
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t">
                      <span className="text-sm font-medium">{selectedAgentIds.length} selected</span>
                      <Button size="sm" variant="outline" onClick={() => handleBulkApproval(true)} className="gap-1 text-green-700"><UserCheck className="h-3 w-3" /> Activate</Button>
                      <Button size="sm" variant="outline" onClick={() => handleBulkApproval(false)} className="gap-1 text-destructive"><UserX className="h-3 w-3" /> Deactivate</Button>
                      <Button size="sm" variant="outline" onClick={() => setMessageDialogOpen(true)} className="gap-1"><Send className="h-3 w-3" /> Send Message</Button>
                      <Button size="sm" variant="ghost" onClick={() => setSelectedAgentIds([])}>Clear</Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Agents Table */}
              <Card>
                <ScrollArea className="w-full">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">
                          <input type="checkbox" checked={selectedAgentIds.length === agents.length && agents.length > 0} onChange={selectAllAgents} className="rounded" />
                        </TableHead>
                        <TableHead className="cursor-pointer select-none" onClick={() => handleSort('full_name')}>
                          <span className="flex items-center">Agent <SortIcon field="full_name" /></span>
                        </TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead className="cursor-pointer select-none" onClick={() => handleSort('subscription_plan')}>
                          <span className="flex items-center">Plan <SortIcon field="subscription_plan" /></span>
                        </TableHead>
                        <TableHead className="cursor-pointer select-none" onClick={() => handleSort('avg_rating')}>
                          <span className="flex items-center">Rating <SortIcon field="avg_rating" /></span>
                        </TableHead>
                        <TableHead className="cursor-pointer select-none" onClick={() => handleSort('total_page_views')}>
                          <span className="flex items-center">Views <SortIcon field="total_page_views" /></span>
                        </TableHead>
                        <TableHead className="cursor-pointer select-none" onClick={() => handleSort('total_leads')}>
                          <span className="flex items-center">Leads <SortIcon field="total_leads" /></span>
                        </TableHead>
                        <TableHead className="cursor-pointer select-none" onClick={() => handleSort('is_profile_approved')}>
                          <span className="flex items-center">Active <SortIcon field="is_profile_approved" /></span>
                        </TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {agents.length === 0 ? (
                        <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No agents found</TableCell></TableRow>
                      ) : agents.map(agent => (
                        <TableRow key={agent.id}>
                          <TableCell>
                            <input type="checkbox" checked={selectedAgentIds.includes(agent.id)} onChange={() => toggleSelectAgent(agent.id)} className="rounded" />
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{agent.full_name || 'Unnamed'}</p>
                              <p className="text-xs text-muted-foreground">{agent.email}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{agent.location || '—'}</TableCell>
                          <TableCell>
                            <Badge variant={agent.subscription_plan === 'premium' ? 'default' : 'secondary'} className="capitalize text-xs">
                              {agent.subscription_plan || 'starter'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="flex items-center gap-1 text-sm">
                              <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                              {agent.avg_rating > 0 ? agent.avg_rating.toFixed(1) : '—'}
                              <span className="text-muted-foreground text-xs">({agent.total_reviews})</span>
                            </span>
                          </TableCell>
                          <TableCell className="text-sm">{agent.total_page_views}</TableCell>
                          <TableCell className="text-sm">{agent.total_leads}</TableCell>
                          <TableCell>
                            <Switch
                              checked={agent.is_profile_approved || false}
                              onCheckedChange={val => toggleAgentApproval(agent.id, val)}
                            />
                          </TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => {
                                  setSelectedAgent(agent);
                                  setNotesText(agent.admin_notes || '');
                                }}>
                                  Manage
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Manage: {agent.full_name || 'Agent'}</DialogTitle>
                                </DialogHeader>
                                <AgentManageContent
                                  agent={agent}
                                  notesText={notesText}
                                  setNotesText={setNotesText}
                                  toggleProfileSection={toggleProfileSection}
                                  updateAdminNotes={updateAdminNotes}
                                  updateAgentDetails={updateAgentDetails}
                                  toggleAgentApproval={toggleAgentApproval}
                                  onSendMessage={() => {
                                    setSelectedAgent(agent);
                                    setMessageDialogOpen(true);
                                  }}
                                />
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
                <div className="p-3 border-t text-sm text-muted-foreground">
                  Showing {agents.length} of {allAgents.length} agents
                </div>
              </Card>
            </TabsContent>

            {/* === DISTRIBUTORS TAB === */}
            <TabsContent value="distributors">
              <Card>
                <CardHeader><CardTitle>All Distributors</CardTitle></CardHeader>
                <CardContent>
                  {distributors.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No distributors found</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Company</TableHead>
                          <TableHead>Region</TableHead>
                          <TableHead>Agents</TableHead>
                          <TableHead>Commission</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {distributors.map(d => (
                          <TableRow key={d.id}>
                            <TableCell className="font-medium">{d.full_name || 'Unnamed'}</TableCell>
                            <TableCell className="text-sm">{d.email}</TableCell>
                            <TableCell className="text-sm">{d.company_name || '—'}</TableCell>
                            <TableCell className="text-sm">{d.region || '—'}</TableCell>
                            <TableCell className="text-sm">{d.agent_count}</TableCell>
                            <TableCell className="text-sm">{d.commission_rate ? `${d.commission_rate}%` : '—'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* === MESSAGING TAB === */}
            <TabsContent value="messaging">
              <Card>
                <CardHeader>
                  <CardTitle>Send Messages to Agents</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Message Type</Label>
                      <Select value={messageType} onValueChange={setMessageType}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="renewal">🔄 Renewal Reminder</SelectItem>
                          <SelectItem value="upgrade">⬆️ Upgrade Message</SelectItem>
                          <SelectItem value="offer">🎁 Special Offer</SelectItem>
                          <SelectItem value="refer">🤝 Refer & Earn</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Channel</Label>
                      <Select value={messageChannel} onValueChange={setMessageChannel}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">📧 Email</SelectItem>
                          <SelectItem value="whatsapp">💬 WhatsApp</SelectItem>
                          <SelectItem value="both">📧+💬 Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Target Agents</Label>
                    <Select onValueChange={v => {
                      if (v === 'all') setSelectedAgentIds(allAgents.map(a => a.id));
                      else if (v === 'active') setSelectedAgentIds(allAgents.filter(a => a.is_profile_approved).map(a => a.id));
                      else if (v === 'inactive') setSelectedAgentIds(allAgents.filter(a => !a.is_profile_approved).map(a => a.id));
                      else if (v === 'expiring') {
                        const now = new Date();
                        const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
                        setSelectedAgentIds(allAgents.filter(a => {
                          if (!a.subscription_expires_at) return false;
                          const exp = new Date(a.subscription_expires_at);
                          return exp <= thirtyDays && exp >= now;
                        }).map(a => a.id));
                      }
                    }}>
                      <SelectTrigger><SelectValue placeholder="Select target group" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Agents ({allAgents.length})</SelectItem>
                        <SelectItem value="active">Active Agents ({dashboardStats.active})</SelectItem>
                        <SelectItem value="inactive">Inactive Agents ({dashboardStats.inactive})</SelectItem>
                        <SelectItem value="expiring">Expiring Soon</SelectItem>
                      </SelectContent>
                    </Select>
                    {selectedAgentIds.length > 0 && (
                      <p className="text-sm text-muted-foreground">{selectedAgentIds.length} agent(s) selected</p>
                    )}
                  </div>

                  <Button onClick={handleSendMessage} className="gap-2" disabled={selectedAgentIds.length === 0}>
                    <Send className="h-4 w-4" />
                    Send {messageType === 'renewal' ? 'Renewal Reminder' : messageType === 'upgrade' ? 'Upgrade Message' : messageType === 'offer' ? 'Special Offer' : 'Refer & Earn'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* === SKELETONS TAB === */}
            <TabsContent value="skeletons">
              <SkeletonMappingDashboard />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Message Dialog (from agents tab) */}
      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Message Type</Label>
              <Select value={messageType} onValueChange={setMessageType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="renewal">🔄 Renewal Reminder</SelectItem>
                  <SelectItem value="upgrade">⬆️ Upgrade Message</SelectItem>
                  <SelectItem value="offer">🎁 Special Offer</SelectItem>
                  <SelectItem value="refer">🤝 Refer & Earn</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Channel</Label>
              <Select value={messageChannel} onValueChange={setMessageChannel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">📧 Email</SelectItem>
                  <SelectItem value="whatsapp">💬 WhatsApp</SelectItem>
                  <SelectItem value="both">📧+💬 Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground">
              Sending to {selectedAgentIds.length > 0 ? `${selectedAgentIds.length} agent(s)` : selectedAgent?.full_name || '1 agent'}
            </p>
            <Button onClick={handleSendMessage} className="w-full gap-2">
              <Send className="h-4 w-4" /> Send Message
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// --- Sub-components ---

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number }> = ({ icon, label, value }) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">{icon}</div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

interface AgentManageContentProps {
  agent: AdminAgent;
  notesText: string;
  setNotesText: (v: string) => void;
  toggleProfileSection: (id: string, section: string, value: boolean) => Promise<void>;
  updateAdminNotes: (id: string, notes: string) => Promise<void>;
  updateAgentDetails: (id: string, updates: { full_name?: string; license_number?: string; location?: string; phone?: string }) => Promise<void>;
  toggleAgentApproval: (id: string, approved: boolean) => Promise<void>;
  onSendMessage: () => void;
}

const AgentManageContent: React.FC<AgentManageContentProps> = ({
  agent, notesText, setNotesText, toggleProfileSection, updateAdminNotes, updateAgentDetails, toggleAgentApproval, onSendMessage
}) => {
  const [editName, setEditName] = React.useState(agent.full_name || '');
  const [editPhone, setEditPhone] = React.useState(agent.phone || '');
  const [editLicense, setEditLicense] = React.useState(agent.license_number || '');
  const [editLocation, setEditLocation] = React.useState(agent.location || '');
  const [isEditing, setIsEditing] = React.useState(false);

  const sections = [
    { key: 'show_full_profile', label: 'Full Profile Visibility' },
    { key: 'show_certificates', label: 'Certificates Section' },
    { key: 'show_achievements', label: 'Achievements Section' },
    { key: 'show_comments', label: 'Comments/Reviews Section' },
    { key: 'show_gallery', label: 'Gallery Section' },
    { key: 'show_contact_info', label: 'Contact Information' },
  ];

  const handleSaveDetails = async () => {
    await updateAgentDetails(agent.id, {
      full_name: editName,
      phone: editPhone,
      license_number: editLicense,
      location: editLocation,
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Agent Info - Editable */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm">Agent Details</h4>
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? 'Cancel' : '✏️ Edit'}
          </Button>
        </div>
        
        {isEditing ? (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Full Name</Label>
              <Input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Agent name" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Phone</Label>
              <Input value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="Phone number" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Insurance License Number</Label>
              <Input value={editLicense} onChange={e => setEditLicense(e.target.value)} placeholder="Enter insurance license number" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Location</Label>
              <Input value={editLocation} onChange={e => setEditLocation(e.target.value)} placeholder="City, State" />
            </div>
            <Button size="sm" onClick={handleSaveDetails} className="gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" /> Save Details
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm"><strong>Name:</strong> {agent.full_name || '—'}</p>
            <p className="text-sm"><strong>Email:</strong> {agent.email}</p>
            <p className="text-sm"><strong>Phone:</strong> {agent.phone || '—'}</p>
            <p className="text-sm"><strong>Location:</strong> {agent.location || '—'}</p>
            <p className="text-sm"><strong>Plan:</strong> <Badge variant="secondary" className="capitalize">{agent.subscription_plan || 'starter'}</Badge></p>
            <p className="text-sm"><strong>Insurance License:</strong> {agent.license_number || <span className="text-muted-foreground italic">Not verified</span>}</p>
            <p className="text-sm"><strong>Experience:</strong> {agent.years_experience || 0} years</p>
          </div>
        )}
      </div>

      <Separator />

      {/* Profile Activation */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Profile Active</p>
          <p className="text-xs text-muted-foreground">Controls whether the profile is visible publicly</p>
        </div>
        <Switch
          checked={agent.is_profile_approved || false}
          onCheckedChange={val => toggleAgentApproval(agent.id, val)}
        />
      </div>

      <Separator />

      {/* Section Toggles */}
      <div className="space-y-4">
        <h4 className="font-medium text-sm">Profile Section Controls</h4>
        {sections.map(s => (
          <div key={s.key} className="flex items-center justify-between">
            <Label className="text-sm">{s.label}</Label>
            <Switch
              checked={(agent as any)[s.key] ?? true}
              onCheckedChange={val => toggleProfileSection(agent.id, s.key, val)}
            />
          </div>
        ))}
      </div>

      <Separator />

      {/* Admin Notes */}
      <div className="space-y-2">
        <Label>Admin Notes</Label>
        <Textarea
          value={notesText}
          onChange={e => setNotesText(e.target.value)}
          placeholder="Internal notes about this agent..."
          rows={3}
        />
        <Button size="sm" onClick={() => updateAdminNotes(agent.id, notesText)}>Save Notes</Button>
      </div>

      <Separator />

      {/* Send Message */}
      <Button variant="outline" className="w-full gap-2" onClick={onSendMessage}>
        <Send className="h-4 w-4" /> Send Message to Agent
      </Button>
    </div>
  );
};

export default AdminPanel;
