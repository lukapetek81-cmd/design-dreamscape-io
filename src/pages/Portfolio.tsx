import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader, TrendingUp, TrendingDown, DollarSign, Briefcase, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePortfolio, PositionWithCurrentPrice } from '@/hooks/usePortfolio';
import AddPositionForm from '@/components/AddPositionForm';
import PositionCard from '@/components/PositionCard';
import { MobilePageHeader } from '@/components/mobile/MobilePageHeader';

import { PremiumGate } from '@/components/PremiumGate';

const Portfolio = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { positions, loading, portfolioSummary, deletePosition } = usePortfolio();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPosition, setEditingPosition] = useState<PositionWithCurrentPrice | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader className="w-6 h-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Loading your portfolio...</span>
        </div>
      </div>
    );
  }

  return (
    <PremiumGate feature="your investment portfolio">
      <div className="min-h-screen bg-background">
        {/* Mobile-optimized header */}
        <MobilePageHeader
          title="My Portfolio"
          subtitle="Track your commodity positions and performance"
          onBack={() => navigate('/')}
        >
          <Button 
            onClick={() => setShowAddForm(true)} 
            className="gap-2 touch-manipulation"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Position</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </MobilePageHeader>
        
        <div className="container mx-auto px-4 py-6 max-w-7xl">

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/20">
                <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-xl font-bold">
                  {formatCurrency(portfolioSummary.totalValue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950/20">
                <Briefcase className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cost Basis</p>
                <p className="text-xl font-bold">
                  {formatCurrency(portfolioSummary.totalCost)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                portfolioSummary.isPositive 
                  ? 'bg-green-100 dark:bg-green-950/20' 
                  : 'bg-red-100 dark:bg-red-950/20'
              }`}>
                {portfolioSummary.isPositive ? (
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Return</p>
                <p className={`text-xl font-bold ${
                  portfolioSummary.isPositive 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {formatCurrency(Math.abs(portfolioSummary.totalReturn))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                portfolioSummary.isPositive 
                  ? 'bg-green-100 dark:bg-green-950/20' 
                  : 'bg-red-100 dark:bg-red-950/20'
              }`}>
                {portfolioSummary.isPositive ? (
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Return %</p>
                <p className={`text-xl font-bold ${
                  portfolioSummary.isPositive 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {formatPercentage(portfolioSummary.returnPercentage)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Positions */}
      {positions.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <Briefcase className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-semibold mb-2">No Positions Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start building your commodity portfolio by adding your first position. 
              Track performance and stay updated with real-time prices.
            </p>
            <Button onClick={() => setShowAddForm(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Your First Position
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Your Positions</h2>
            <p className="text-sm text-muted-foreground">
              {positions.length} position{positions.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {positions.map((position) => (
              <PositionCard
                key={position.id}
                position={position}
                onEdit={setEditingPosition}
                onDelete={deletePosition}
              />
            ))}
          </div>
        </div>
      )}

      {/* Add Position Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Position</DialogTitle>
          </DialogHeader>
          <AddPositionForm onSuccess={() => setShowAddForm(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Position Dialog */}
      <Dialog open={!!editingPosition} onOpenChange={() => setEditingPosition(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Position</DialogTitle>
          </DialogHeader>
          {/* TODO: Add edit form component */}
          <div className="p-4 text-center text-muted-foreground">
            Edit functionality coming soon...
          </div>
        </DialogContent>
      </Dialog>
        </div>
      </div>
    </PremiumGate>
  );
};

export default Portfolio;