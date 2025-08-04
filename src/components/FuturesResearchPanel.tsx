import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlphaVantageResearchPanel } from './AlphaVantageResearchPanel';
import { FuturesContractSelector } from './FuturesContractSelector';

export const FuturesResearchPanel = () => {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <Tabs defaultValue="contracts" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="contracts">Contract Selection</TabsTrigger>
          <TabsTrigger value="research">API Research</TabsTrigger>
        </TabsList>
        
        <TabsContent value="contracts" className="space-y-4">
          <FuturesContractSelector />
        </TabsContent>
        
        <TabsContent value="research" className="space-y-4">
          <AlphaVantageResearchPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};
