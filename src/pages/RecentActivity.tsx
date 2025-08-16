import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import CommoditySidebar from "@/components/CommoditySidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Eye, TrendingUp, Trash2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface RecentActivity {
  id: string;
  commodity_name: string;
  commodity_symbol: string;
  activity_type: string;
  metadata: any;
  created_at: string;
}

const RecentActivity = () => {
  const [activeGroup, setActiveGroup] = React.useState("energy");
  const [activities, setActivities] = React.useState<RecentActivity[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const commodityCounts = {
    energy: 0, metals: 0, grains: 0, livestock: 0, softs: 0, other: 0
  };

  React.useEffect(() => {
    if (user) {
      fetchRecentActivities();
    }
  }, [user]);

  const fetchRecentActivities = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('recent_activities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load recent activities",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearActivity = async (activityId: string) => {
    try {
      const { error } = await supabase
        .from('recent_activities')
        .delete()
        .eq('id', activityId);

      if (error) throw error;

      setActivities(prev => prev.filter(activity => activity.id !== activityId));
      toast({
        title: "Activity Removed",
        description: "Activity has been removed from your history",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove activity",
        variant: "destructive",
      });
    }
  };

  const clearAllActivities = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('recent_activities')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setActivities([]);
      toast({
        title: "History Cleared",
        description: "All recent activities have been cleared",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear activities",
        variant: "destructive",
      });
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'view':
        return <Eye className="h-4 w-4 text-blue-500" />;
      case 'trade':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'view':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'trade':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)} minutes ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <CommoditySidebar 
          activeGroup={activeGroup}
          onGroupSelect={setActiveGroup}
          commodityCounts={commodityCounts}
        />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Clock className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold">Recent Activity</h1>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">
                    Your Recent Activity
                  </h2>
                  <p className="text-muted-foreground">
                    Track your commodity trading and analysis history
                  </p>
                </div>
                {activities.length > 0 && (
                  <Button variant="outline" onClick={clearAllActivities} className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Clear All
                  </Button>
                )}
              </div>

              <div className="grid gap-4">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : activities.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No recent activity</h3>
                      <p className="text-muted-foreground text-center">
                        Your commodity trading and analysis activity will appear here
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {activities.map((activity) => (
                      <Card key={activity.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {getActivityIcon(activity.activity_type)}
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold">{activity.commodity_name}</h3>
                                  {activity.commodity_symbol && (
                                    <Badge variant="secondary" className="text-xs">
                                      {activity.commodity_symbol}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${getActivityColor(activity.activity_type)}`}
                                  >
                                    {activity.activity_type}
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">
                                    {formatDate(activity.created_at)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => clearActivity(activity.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default RecentActivity;