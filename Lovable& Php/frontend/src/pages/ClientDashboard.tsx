
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, Calendar, FileText, MessageSquare, Phone, User } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';

// Mock data
const upcomingMeetings = [
  {
    id: 1,
    agentName: 'Rahul Sharma',
    agentImage: 'https://randomuser.me/api/portraits/men/32.jpg',
    date: '2023-10-15',
    time: '10:30 AM',
    type: 'Video Call',
    status: 'confirmed'
  },
  {
    id: 2,
    agentName: 'Priya Patel',
    agentImage: 'https://randomuser.me/api/portraits/women/44.jpg',
    date: '2023-10-18',
    time: '3:00 PM',
    type: 'In-Person',
    status: 'pending'
  }
];

const recentPolicies = [
  {
    id: 101,
    name: 'Health Insurance - Family Floater',
    provider: 'Star Health',
    premium: '₹24,500',
    renewalDate: '2024-05-20',
    status: 'active'
  },
  {
    id: 102,
    name: 'Term Life Insurance',
    provider: 'HDFC Life',
    premium: '₹12,800',
    renewalDate: '2023-12-10',
    status: 'active'
  },
  {
    id: 103,
    name: 'Motor Insurance - Car',
    provider: 'Bajaj Allianz',
    premium: '₹8,200',
    renewalDate: '2023-11-05',
    status: 'renewal-due'
  }
];

const recentMessages = [
  {
    id: 201,
    agentName: 'Rahul Sharma',
    agentImage: 'https://randomuser.me/api/portraits/men/32.jpg',
    message: "I've sent you the updated health insurance quotes as requested.",
    time: '2 hours ago',
    unread: true
  },
  {
    id: 202,
    agentName: 'Vijay Menon',
    agentImage: 'https://randomuser.me/api/portraits/men/78.jpg',
    message: 'Thank you for choosing our term insurance plan. Let me know if you have any questions.',
    time: '1 day ago',
    unread: false
  }
];

const ClientDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>
                Please log in to view your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button asChild>
                <Link to="/login">Login</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="bg-gray-50 pt-6 sm:pt-8 pb-10 px-4 sm:px-6 lg:px-8 flex-grow">
        <div className="max-w-7xl mx-auto">
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <Avatar className="h-16 w-16 border-2 border-white">
                <AvatarImage src={user.profileImage} alt={user.name} />
                <AvatarFallback className="bg-brand-blue text-white text-xl">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
                <p className="text-gray-500">Manage your insurance policies and agent connections</p>
              </div>
            </div>
            <Button className="bg-brand-blue">
              <Link to="/agents">Find New Agents</Link>
            </Button>
          </div>
          
          {/* Dashboard Tabs */}
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-4 md:w-auto bg-white">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="policies">My Policies</TabsTrigger>
              <TabsTrigger value="agents">My Agents</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Summary Cards */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-medium">Active Policies</CardTitle>
                    <FileText className="h-5 w-5 text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-1">{recentPolicies.filter(p => p.status === 'active').length}</div>
                    <p className="text-sm text-gray-500">
                      {recentPolicies.filter(p => p.status === 'renewal-due').length} pending renewal
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-medium">Connected Agents</CardTitle>
                    <User className="h-5 w-5 text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-1">3</div>
                    <p className="text-sm text-gray-500">Across 4 insurance types</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-medium">Upcoming Meetings</CardTitle>
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-1">{upcomingMeetings.length}</div>
                    <p className="text-sm text-gray-500">Next: {upcomingMeetings[0].date}</p>
                  </CardContent>
                </Card>
              </div>
              
              {/* Upcoming Meetings */}
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Meetings</CardTitle>
                  <CardDescription>Your scheduled appointments with insurance agents</CardDescription>
                </CardHeader>
                <CardContent>
                  {upcomingMeetings.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingMeetings.map(meeting => (
                        <div key={meeting.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                          <div className="flex items-center space-x-4">
                            <Avatar>
                              <AvatarImage src={meeting.agentImage} alt={meeting.agentName} />
                              <AvatarFallback className="bg-brand-blue text-white">
                                {meeting.agentName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium">{meeting.agentName}</h4>
                              <p className="text-sm text-gray-500">
                                {formatDate(meeting.date)} at {meeting.time} • {meeting.type}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={meeting.status === 'confirmed' ? 'bg-green-500' : 'bg-yellow-500'}>
                              {meeting.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                            </Badge>
                            <Button size="sm" variant="outline">
                              <Calendar className="h-4 w-4 mr-1" /> 
                              Reschedule
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-4 text-gray-500">No upcoming meetings scheduled</p>
                  )}
                </CardContent>
              </Card>
              
              {/* Recent Policies */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Policies</CardTitle>
                  <CardDescription>Your active insurance policies</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentPolicies.map(policy => (
                      <div key={policy.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                        <div>
                          <h4 className="font-medium">{policy.name}</h4>
                          <p className="text-sm text-gray-500">{policy.provider}</p>
                          <div className="flex items-center mt-1">
                            <Badge className={
                              policy.status === 'active' ? 'bg-green-500' : 
                              policy.status === 'renewal-due' ? 'bg-yellow-500' : 'bg-red-500'
                            }>
                              {policy.status === 'active' ? 'Active' : 
                               policy.status === 'renewal-due' ? 'Renewal Due' : 'Expired'}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{policy.premium} / year</div>
                          <p className="text-sm text-gray-500">Renewal: {formatDate(policy.renewalDate)}</p>
                          <Button size="sm" variant="link" className="text-brand-blue p-0 h-auto mt-1">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Recent Messages */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Recent Messages</CardTitle>
                    <CardDescription>Communications from your agents</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-1" /> View All
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentMessages.map(message => (
                      <div key={message.id} className="flex items-start space-x-4">
                        <Avatar>
                          <AvatarImage src={message.agentImage} alt={message.agentName} />
                          <AvatarFallback className="bg-brand-blue text-white">
                            {message.agentName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{message.agentName}</h4>
                            <span className="text-xs text-gray-500">{message.time}</span>
                          </div>
                          <p className="text-sm text-gray-700 mt-1">{message.message}</p>
                        </div>
                        {message.unread && (
                          <Badge className="bg-brand-orange">New</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Policies Tab (Simplified) */}
            <TabsContent value="policies" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>My Insurance Policies</CardTitle>
                  <CardDescription>Manage all your active and past insurance policies</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="py-4 text-center text-gray-500">
                    Full policies section will be implemented in the next phase.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Agents Tab (Simplified) */}
            <TabsContent value="agents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>My Connected Agents</CardTitle>
                  <CardDescription>Insurance professionals you're working with</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="py-4 text-center text-gray-500">
                    Full agents section will be implemented in the next phase.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Messages Tab (Simplified) */}
            <TabsContent value="messages" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Messages</CardTitle>
                  <CardDescription>Communication with your insurance agents</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="py-4 text-center text-gray-500">
                    Full messaging system will be implemented in the next phase.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
    </div>
  );
};

export default ClientDashboard;
