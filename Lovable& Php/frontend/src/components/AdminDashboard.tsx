import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Users, CheckCircle2, AlertCircle, Building, MapPin, TrendingUp, TrendingDown,
  Download, Calendar, UserPlus, RefreshCw, Shield, BarChart3, PieChart, Activity
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart as RPieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import type { AdminAgent, AdminDistributor } from '@/hooks/useAdminPanel';

interface AdminDashboardProps {
  agents: AdminAgent[];
  distributors: AdminDistributor[];
  dateRange: string;
  setDateRange: (v: string) => void;
}

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2, 160 60% 45%))',
  'hsl(var(--chart-3, 30 80% 55%))',
  'hsl(var(--chart-4, 280 65% 60%))',
  'hsl(var(--chart-5, 340 75% 55%))',
];

function getMonthLabel(monthsAgo: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - monthsAgo);
  return d.toLocaleString('default', { month: 'short', year: '2-digit' });
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ agents, distributors, dateRange, setDateRange }) => {
  const stats = useMemo(() => {
    const now = new Date();
    const active = agents.filter(a => a.is_profile_approved);
    const inactive = agents.filter(a => !a.is_profile_approved);

    // MoM Registration data (last 12 months)
    const momRegistration = Array.from({ length: 12 }, (_, i) => {
      const monthsAgo = 11 - i;
      const label = getMonthLabel(monthsAgo);
      const start = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - monthsAgo + 1, 0);
      const count = agents.filter(a => {
        if (!a.created_at) return false;
        const d = new Date(a.created_at);
        return d >= start && d <= end;
      }).length;
      return { month: label, registrations: count };
    });

    // MoM Growth %
    const momGrowth = momRegistration.map((m, i) => ({
      month: m.month,
      registrations: m.registrations,
      growth: i > 0 && momRegistration[i - 1].registrations > 0
        ? Math.round(((m.registrations - momRegistration[i - 1].registrations) / momRegistration[i - 1].registrations) * 100)
        : 0,
    }));

    // Renewal dues (agents with subscription expiring in next 30/60/90 days)
    const renewalDues = { within30: 0, within60: 0, within90: 0, expired: 0 };
    agents.forEach(a => {
      if (!a.subscription_expires_at) return;
      const exp = new Date(a.subscription_expires_at);
      const daysLeft = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysLeft < 0) renewalDues.expired++;
      else if (daysLeft <= 30) renewalDues.within30++;
      else if (daysLeft <= 60) renewalDues.within60++;
      else if (daysLeft <= 90) renewalDues.within90++;
    });

    // Retention: agents who created profile >3 months ago and are still active
    const threeMonthsAgo = new Date(now);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const oldAgents = agents.filter(a => a.created_at && new Date(a.created_at) < threeMonthsAgo);
    const retainedAgents = oldAgents.filter(a => a.is_profile_approved);
    const retentionRate = oldAgents.length > 0 ? Math.round((retainedAgents.length / oldAgents.length) * 100) : 0;

    // Plan distribution for pie chart
    const planCounts: Record<string, number> = {};
    agents.forEach(a => {
      const plan = a.subscription_plan || 'starter';
      planCounts[plan] = (planCounts[plan] || 0) + 1;
    });
    const planPieData = Object.entries(planCounts).map(([name, value]) => ({ name, value }));

    // City distribution
    const cityCounts: Record<string, number> = {};
    agents.forEach(a => {
      if (a.location) {
        const city = a.location.split(',')[0]?.trim() || a.location;
        cityCounts[city] = (cityCounts[city] || 0) + 1;
      }
    });
    const topCities = Object.entries(cityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([city, count]) => ({ city, count }));

    // Penetration: agents per plan tier
    const penetration = {
      starter: planCounts['starter'] || 0,
      professional: planCounts['professional'] || 0,
      upgradeRate: agents.length > 0
        ? Math.round(((planCounts['professional'] || 0) / agents.length) * 100)
        : 0,
    };

    // Engagement metrics
    const totalViews = agents.reduce((sum, a) => sum + a.total_page_views, 0);
    const totalLeads = agents.reduce((sum, a) => sum + a.total_leads, 0);
    const totalReviews = agents.reduce((sum, a) => sum + a.total_reviews, 0);
    const avgRating = agents.length > 0
      ? agents.reduce((sum, a) => sum + a.avg_rating, 0) / agents.filter(a => a.avg_rating > 0).length || 0
      : 0;

    // Current month vs last month registrations
    const currentMonthReg = momRegistration[11]?.registrations || 0;
    const lastMonthReg = momRegistration[10]?.registrations || 0;
    const regGrowthPct = lastMonthReg > 0 ? Math.round(((currentMonthReg - lastMonthReg) / lastMonthReg) * 100) : 0;

    return {
      active, inactive, momGrowth, renewalDues, retentionRate, planPieData,
      topCities, penetration, totalViews, totalLeads, totalReviews, avgRating,
      currentMonthReg, regGrowthPct, oldAgents: oldAgents.length, retainedCount: retainedAgents.length,
    };
  }, [agents]);

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Location', 'Plan', 'Status', 'Rating', 'Views', 'Leads', 'Created At'];
    const rows = agents.map(a => [
      a.full_name || '', a.email, a.phone || '', a.location || '',
      a.subscription_plan || 'starter', a.is_profile_approved ? 'Active' : 'Inactive',
      a.avg_rating.toFixed(1), a.total_page_views.toString(), a.total_leads.toString(),
      a.created_at ? new Date(a.created_at).toLocaleDateString() : '',
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `padosiagent-admin-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[160px] h-9">
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12m">Last 12 Months</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="3m">Last 3 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2">
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* KPI Cards Row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={<Users className="h-5 w-5" />} label="Total Agents" value={agents.length} />
        <KPICard icon={<CheckCircle2 className="h-5 w-5 text-green-600" />} label="Active" value={stats.active.length} subtitle={`${agents.length > 0 ? Math.round((stats.active.length / agents.length) * 100) : 0}%`} />
        <KPICard icon={<UserPlus className="h-5 w-5 text-blue-600" />} label="New This Month" value={stats.currentMonthReg} trend={stats.regGrowthPct} />
        <KPICard icon={<Building className="h-5 w-5" />} label="Distributors" value={distributors.length} />
      </div>

      {/* KPI Cards Row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={<Shield className="h-5 w-5 text-emerald-600" />} label="Retention Rate" value={`${stats.retentionRate}%`} subtitle={`${stats.retainedCount}/${stats.oldAgents}`} />
        <KPICard icon={<TrendingUp className="h-5 w-5 text-indigo-600" />} label="Upgrade Rate" value={`${stats.penetration.upgradeRate}%`} subtitle="Pro + Premium" />
        <KPICard icon={<Activity className="h-5 w-5 text-amber-600" />} label="Total Page Views" value={stats.totalViews.toLocaleString()} />
        <KPICard icon={<BarChart3 className="h-5 w-5 text-rose-600" />} label="Total Leads" value={stats.totalLeads.toLocaleString()} />
      </div>

      {/* Renewal Dues Alert */}
      <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800">
        <CardContent className="pt-5">
          <div className="flex items-center gap-2 mb-3">
            <RefreshCw className="h-4 w-4 text-amber-600" />
            <h3 className="font-semibold text-sm">Renewal Dues</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <RenewalBadge label="Expired" count={stats.renewalDues.expired} variant="destructive" />
            <RenewalBadge label="≤ 30 Days" count={stats.renewalDues.within30} variant="warning" />
            <RenewalBadge label="31-60 Days" count={stats.renewalDues.within60} variant="secondary" />
            <RenewalBadge label="61-90 Days" count={stats.renewalDues.within90} variant="outline" />
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* MoM Registration Growth */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> MoM Registration Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={stats.momGrowth}>
                <defs>
                  <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                  formatter={(value: number, name: string) => [value, name === 'registrations' ? 'New Agents' : 'Growth %']}
                />
                <Area type="monotone" dataKey="registrations" stroke="hsl(var(--primary))" fill="url(#regGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Plan Distribution Pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart className="h-4 w-4" /> Plan Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <RPieChart>
                <Pie
                  data={stats.planPieData}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {stats.planPieData.map((_, idx) => (
                    <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </RPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Second Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Cities Bar Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Top Cities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.topCities} layout="vertical" margin={{ left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis type="category" dataKey="city" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={55} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Penetration & Growth Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" /> Penetration & Engagement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 pt-2">
            <MetricRow label="Starter Plan" value={stats.penetration.starter} total={agents.length} color="hsl(var(--muted-foreground))" />
            <MetricRow label="Professional Plan" value={stats.penetration.professional} total={agents.length} color="hsl(var(--primary))" />
            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Avg Rating</span>
                <span className="font-semibold">{stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '—'} ⭐</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Reviews</span>
                <span className="font-semibold">{stats.totalReviews}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Leads</span>
                <span className="font-semibold">{stats.totalLeads}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Page Views</span>
                <span className="font-semibold">{stats.totalViews.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// --- Sub-components ---

const KPICard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; subtitle?: string; trend?: number }> = ({ icon, label, value, subtitle, trend }) => (
  <Card>
    <CardContent className="pt-5 pb-4">
      <div className="flex items-start justify-between">
        <div className="p-2 rounded-lg bg-primary/10">{icon}</div>
        {trend !== undefined && trend !== 0 && (
          <Badge variant={trend > 0 ? 'default' : 'destructive'} className="text-[10px] h-5 gap-0.5">
            {trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(trend)}%
          </Badge>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
        {subtitle && <p className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
    </CardContent>
  </Card>
);

const RenewalBadge: React.FC<{ label: string; count: number; variant: 'destructive' | 'warning' | 'secondary' | 'outline' }> = ({ label, count, variant }) => (
  <div className="text-center">
    <p className="text-2xl font-bold">{count}</p>
    <Badge variant={variant === 'warning' ? 'secondary' : variant} className={`text-[10px] mt-1 ${variant === 'warning' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' : ''}`}>
      {label}
    </Badge>
  </div>
);

const MetricRow: React.FC<{ label: string; value: number; total: number; color: string }> = ({ label, value, total, color }) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="font-medium">{value} ({pct}%)</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
};

export default AdminDashboard;
