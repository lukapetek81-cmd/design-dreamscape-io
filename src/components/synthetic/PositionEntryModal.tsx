import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface PositionEntryModalProps {
  open: boolean;
  onClose: () => void;
  commodityName: string;
  direction: 'long' | 'short';
  currentPrice: number;
  availableBalance: number;
  onConfirm: (amount: number) => void;
}

const PRESET_AMOUNTS = [100, 250, 500, 1000];

const PositionEntryModal: React.FC<PositionEntryModalProps> = ({
  open,
  onClose,
  commodityName,
  direction,
  currentPrice,
  availableBalance,
  onConfirm,
}) => {
  const [amount, setAmount] = useState('');

  const amountNum = parseFloat(amount) || 0;
  const quantity = amountNum > 0 ? amountNum / currentPrice : 0;
  const isValid = amountNum > 0 && amountNum <= availableBalance;

  const handleConfirm = () => {
    if (isValid) {
      onConfirm(amountNum);
      setAmount('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {direction === 'long' ? (
              <TrendingUp className="h-5 w-5 text-green-400" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-400" />
            )}
            {direction === 'long' ? 'Long' : 'Short'} {commodityName}
          </DialogTitle>
          <DialogDescription>
            Enter position size in USDC. Current price: ${currentPrice.toFixed(2)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            Available: <span className="font-medium text-foreground">{availableBalance.toFixed(2)} USDC</span>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Amount (USDC)</label>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={0}
              max={availableBalance}
              step={0.01}
            />
          </div>

          <div className="flex gap-2">
            {PRESET_AMOUNTS.map((preset) => (
              <Button
                key={preset}
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                disabled={preset > availableBalance}
                onClick={() => setAmount(String(preset))}
              >
                ${preset}
              </Button>
            ))}
          </div>

          {amountNum > 0 && (
            <div className="rounded-lg border p-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Direction</span>
                <Badge variant={direction === 'long' ? 'default' : 'destructive'} className="text-xs">
                  {direction.toUpperCase()}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Entry Price</span>
                <span>${currentPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity</span>
                <span>{quantity.toFixed(6)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Margin</span>
                <span>{amountNum.toFixed(2)} USDC</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleConfirm}
            disabled={!isValid}
            className={direction === 'long' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
          >
            Confirm {direction === 'long' ? 'Long' : 'Short'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PositionEntryModal;
