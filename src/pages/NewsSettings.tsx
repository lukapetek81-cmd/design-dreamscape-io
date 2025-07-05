import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NewsSettings from '@/components/NewsSettings';

const NewsSettingsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)} 
        className="mb-6 gap-2 hover:bg-muted/50"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">News Configuration</h1>
        <p className="text-muted-foreground">
          Configure API keys and settings for enhanced news coverage across multiple sources.
        </p>
      </div>

      {/* Settings Component */}
      <NewsSettings />
    </div>
  );
};

export default NewsSettingsPage;