import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Users, MessageSquare, TrendingUp, Star, Loader2, Lightbulb, LayoutGrid } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, Legend } from 'recharts';

interface MonthlyData {
  month: string;
  page_views: number;
  contact_requests: number;
  profile_clicks: number;
  card_views: number;
}

const AgentAnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [totals, setTotals] = useState({ views: 0, contacts: 0, clicks: 0, cardViews: 0 });
  const [reviewCount, setReviewCount] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchAnalytics = async () => {
      setIsLoading(true);

      const { data: analyticsData } = await supabase
        .from('agent_analytics')
        .select('date, page_views, profile_clicks, contact_requests, card_views')
        .eq('agent_id', user.id)
        .order('date', { ascending: true });

      const { data: reviewsData } = await supabase
        .from('public_agent_reviews')
        .select('rating')
        .eq('agent_id', user.id)
        .eq('is_approved', true);

      if (reviewsData) {
        setReviewCount(reviewsData.length);
        if (reviewsData.length > 0) {
          const avg = reviewsData.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewsData.length;
          setAvgRating(Number(avg.toFixed(1)));
        }
      }

      if (analyticsData && analyticsData.length > 0) {
        const monthMap: Record<string, MonthlyData> = {};
        let totalViews = 0, totalContacts = 0, totalClicks = 0, totalCardViews = 0;

        analyticsData.forEach(row => {
          const date = new Date(row.date);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          const monthLabel = date.toLocaleString('en-IN', { month: 'short', year: '2-digit' });

          if (!monthMap[monthKey]) {
            monthMap[monthKey] = { month: monthLabel, page_views: 0, contact_requests: 0, profile_clicks: 0, card_views: 0 };
          }
          monthMap[monthKey].page_views += row.page_views || 0;
          monthMap[monthKey].contact_requests += row.contact_requests || 0;
          monthMap[monthKey].profile_clicks += row.profile_clicks || 0;
          monthMap[monthKey].card_views += (row as any).card_views || 0;

          totalViews += row.page_views || 0;
          totalContacts += row.contact_requests || 0;
          totalClicks += row.profile_clicks || 0;
          totalCardViews += (row as any).card_views || 0;
        });

        const sortedMonths = Object.keys(monthMap).sort().slice(-6);
        setMonthlyData(sortedMonths.map(k => monthMap[k]));
        setTotals({ views: totalViews, contacts: totalContacts, clicks: totalClicks, cardViews: totalCardViews });
      }

      setIsLoading(false);
    };
    fetchAnalytics();
  }, [user]);

  const getMoMChange = (key: keyof MonthlyData) => {
    if (monthlyData.length < 2) return '--';
    const last = monthlyData[monthlyData.length - 1][key] as number;
    const prev = monthlyData[monthlyData.length - 2][key] as number;
    if (prev === 0) return last > 0 ? '+100%' : '+0%';
    const change = Math.round(((last - prev) / prev) * 100);
    return `${change >= 0 ? '+' : ''}${change}%`;
  };

  const getImprovementTips = () => {
    const tips: string[] = [];
    if (totals.views === 0) tips.push('Your profile has no views yet. Share your profile link to attract visitors.');
    if (totals.contacts === 0 && totals.views > 0) tips.push('You have views but no contact requests. Complete your profile to build trust.');
    if (reviewCount < 3) tips.push(`You have ${reviewCount} review(s). Ask satisfied clients to leave reviews to boost credibility.`);
    if (avgRating > 0 && avgRating < 4) tips.push('Your average rating is below 4. Focus on response time and service quality.');
    if (totals.cardViews > 0 && totals.clicks === 0) tips.push('Users see your card in search but don\'t click. Update your profile photo and bio.');
    if (monthlyData.length >= 2) {
      const last = monthlyData[monthlyData.length - 1];
      const prev = monthlyData[monthlyData.length - 2];
      if (last.page_views < prev.page_views) tips.push('Your profile views dropped this month. Consider updating your bio or adding gallery photos.');
    }
    if (tips.length === 0) tips.push('Your profile is performing well! Keep up the great work.');
    return tips;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const tips = getImprovementTips();

  const kpis = [
    { icon: <Eye className="h-5 w-5 text-primary" />, value: totals.views, label: 'Profile Views', mom: getMoMChange('page_views'), colorClass: 'text-primary' },
    { icon: <LayoutGrid className="h-5 w-5 text-secondary" />, value: totals.cardViews, label: 'Card Views', mom: getMoMChange('card_views'), colorClass: 'text-secondary' },
    { icon: <Users className="h-5 w-5 text-accent" />, value: totals.clicks, label: 'Profile Clicks', mom: getMoMChange('profile_clicks'), colorClass: 'text-accent' },
    { icon: <MessageSquare className="h-5 w-5 text-primary" />, value: totals.contacts, label: 'Contact Requests', mom: getMoMChange('contact_requests'), colorClass: 'text-primary' },
    { icon: <Star className="h-5 w-5 text-amber-500" />, value: reviewCount, label: `Reviews (${avgRating}★)`, mom: null, colorClass: 'text-amber-600' },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards with MoM */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {kpis.map((kpi, i) => (
          <Card key={i}>
            <CardContent className="p-4 text-center">
              <div className="mx-auto mb-1">{kpi.icon}</div>
              <div className={`text-2xl font-bold ${kpi.colorClass}`}>{kpi.value}</div>
              <div className="text-xs text-muted-foreground">{kpi.label}</div>
              {kpi.mom && (
                <Badge variant="outline" className={`mt-1 text-[10px] ${kpi.mom.startsWith('+') && kpi.mom !== '+0%' ? 'border-green-300 text-green-700' : kpi.mom.startsWith('-') ? 'border-red-300 text-red-600' : 'border-muted text-muted-foreground'}`}>
                  {kpi.mom} MoM
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Combined MoM Line Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Month-on-Month Trends
          </CardTitle>
          <CardDescription>All metrics over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="page_views" name="Profile Views" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="card_views" name="Card Views" stroke="hsl(var(--secondary))" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="profile_clicks" name="Profile Clicks" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="contact_requests" name="Contact Requests" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Eye className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No analytics data yet. Share your profile to start tracking visitors.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Individual MoM Bar Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { key: 'page_views', title: 'Profile Views', color: 'hsl(var(--primary))' },
          { key: 'card_views', title: 'Card Views (Search)', color: 'hsl(var(--secondary))' },
          { key: 'profile_clicks', title: 'Profile Clicks', color: 'hsl(var(--accent))' },
          { key: 'contact_requests', title: 'Contact Requests', color: '#f59e0b' },
        ].map((metric) => (
          <Card key={metric.key}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{metric.title} — MoM</CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey={metric.key} name={metric.title} fill={metric.color} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-8">No data yet</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Improvement Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            What to Improve
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 border">
                <Badge variant="secondary" className="mt-0.5 shrink-0 text-[10px]">{i + 1}</Badge>
                <p className="text-sm text-muted-foreground">{tip}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentAnalyticsDashboard;
