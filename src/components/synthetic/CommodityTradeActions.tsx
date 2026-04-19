import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { useSyntheticTrading } from '@/hooks/useSyntheticTrading';
import { useLegalAcceptance } from '@/hooks/useLegalAcceptance';
import { useAuth } from '@/contexts/AuthContext';
import PositionEntryModal from './PositionEntryModal';
import RiskAcceptanceModal from './RiskAcceptanceModal';
import { useNavigate } from 'react-router-dom';

interface CommodityTradeActionsProps {
  commodityName: string;
  currentPrice: number | null;
}

const CommodityTradeActions: React.FC<CommodityTradeActionsProps> = ({ commodityName, currentPrice }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { balance, openPosition } = useSyntheticTrading();
  const [modalOpen, setModalOpen] = useState(false);
  const [direction, setDirection] = useState<'long' | 'short'>('long');

  if (!user) {
    return (
      <div className="rounded-lg border border-border/50 bg-muted/20 p-3 flex items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">Sign in to trade {commodityName} with virtual USDC</span>
        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => navigate('/auth')}>
          Sign In
        </Button>
      </div>
    );
  }

  if (currentPrice === null || currentPrice <= 0) return null;

  const handleClick = (dir: 'long' | 'short') => {
    setDirection(dir);
    setModalOpen(true);
  };

  const handleConfirm = async (amount: number) => {
    await openPosition(commodityName, direction, amount, currentPrice);
  };

  return (
    <>
      <div className="rounded-lg border border-border/50 bg-card/50 p-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-foreground flex items-center gap-1.5">
            <Wallet className="h-3.5 w-3.5 text-primary" />
            Trade with USDC
          </span>
          <span className="text-muted-foreground">
            Balance: <span className="font-medium text-foreground">{balance.balance.toFixed(2)}</span>
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs h-9"
            onClick={() => handleClick('long')}
          >
            <TrendingUp className="h-3.5 w-3.5 mr-1" />
            Long
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs h-9"
            onClick={() => handleClick('short')}
          >
            <TrendingDown className="h-3.5 w-3.5 mr-1" />
            Short
          </Button>
        </div>
      </div>

      <PositionEntryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        commodityName={commodityName}
        direction={direction}
        currentPrice={currentPrice}
        availableBalance={balance.balance}
        onConfirm={handleConfirm}
      />
    </>
  );
};

export default CommodityTradeActions;
