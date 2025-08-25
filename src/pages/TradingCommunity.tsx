import React, { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import CommoditySidebar from "@/components/CommoditySidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Users, TrendingUp, Clock, Pin, Lock, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Forum {
  id: string;
  commodity_group: string;
  name: string;
  description: string;
  created_at: string;
}

interface ForumTopic {
  id: string;
  forum_id: string;
  title: string;
  content: string;
  pinned: boolean;
  locked: boolean;
  views: number;
  created_at: string;
  user_id: string;
}

const COMMODITY_GROUPS = [
  { id: "energy", label: "Energy", color: "bg-orange-500" },
  { id: "metals", label: "Metals", color: "bg-yellow-500" },
  { id: "grains", label: "Grains", color: "bg-green-500" },
  { id: "livestock", label: "Livestock", color: "bg-red-500" },
  { id: "softs", label: "Softs", color: "bg-amber-600" },
  { id: "other", label: "Other", color: "bg-gray-500" },
];

const TradingCommunity = () => {
  const [activeGroup, setActiveGroup] = useState("energy");
  const [forums, setForums] = useState<Forum[]>([]);
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const commodityCounts = {
    energy: 0, metals: 0, grains: 0, livestock: 0, softs: 0, other: 0
  };

  useEffect(() => {
    fetchForums();
  }, []);

  useEffect(() => {
    if (forums.length > 0) {
      fetchTopics();
    }
  }, [activeGroup, forums]);

  const fetchForums = async () => {
    try {
      const { data, error } = await supabase
        .from('forums')
        .select('*')
        .order('commodity_group');
      
      if (error) throw error;
      setForums(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load forums",
        variant: "destructive",
      });
    }
  };

  const fetchTopics = async () => {
    try {
      const activeForum = forums.find(f => f.commodity_group === activeGroup);
      if (!activeForum) return;

      const { data, error } = await supabase
        .from('forum_topics')
        .select('*')
        .eq('forum_id', activeForum.id)
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTopics(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load topics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getGroupColor = (groupId: string) => {
    return COMMODITY_GROUPS.find(g => g.id === groupId)?.color || "bg-gray-500";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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
            <SidebarTrigger className="p-2 min-h-[48px] min-w-[48px]" />
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
              <MessageSquare className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold">Trading Community</h1>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">
                    {COMMODITY_GROUPS.find(g => g.id === activeGroup)?.label} Trading Forum
                  </h2>
                  <p className="text-muted-foreground">
                    Connect with fellow traders and share insights
                  </p>
                </div>
                <Button className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  New Topic
                </Button>
              </div>

              <div className="grid gap-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : topics.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No discussions yet</h3>
                      <p className="text-muted-foreground text-center mb-4">
                        Be the first to start a conversation in this forum!
                      </p>
                      <Button>Start Discussion</Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {topics.map((topic) => (
                      <Card key={topic.id} className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {topic.pinned && (
                                  <Pin className="h-4 w-4 text-blue-500" />
                                )}
                                {topic.locked && (
                                  <Lock className="h-4 w-4 text-red-500" />
                                )}
                                <CardTitle className="text-lg hover:text-primary transition-colors">
                                  {topic.title}
                                </CardTitle>
                              </div>
                              <CardDescription className="line-clamp-2">
                                {topic.content}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>0 replies</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <TrendingUp className="h-4 w-4" />
                                <span>{topic.views} views</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{formatDate(topic.created_at)}</span>
                            </div>
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

export default TradingCommunity;