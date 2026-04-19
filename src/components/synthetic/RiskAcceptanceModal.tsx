import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RiskAcceptanceModalProps {
  open: boolean;
  onClose: () => void;
  onAccept: () => Promise<boolean>;
}

const RiskAcceptanceModal: React.FC<RiskAcceptanceModalProps> = ({ open, onClose, onAccept }) => {
  const [agreedSimulated, setAgreedSimulated] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = agreedSimulated && agreedTerms && !submitting;

  const handleAccept = async () => {
    setSubmitting(true);
    const ok = await onAccept();
    setSubmitting(false);
    if (ok) {
      setAgreedSimulated(false);
      setAgreedTerms(false);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Before you place your first trade
          </DialogTitle>
          <DialogDescription>
            Please review and confirm the following before opening synthetic positions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm space-y-2">
            <p className="font-medium text-foreground">This is simulated trading.</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 text-xs">
              <li>Your USDC balance is virtual and has no monetary value.</li>
              <li>Profit and loss are calculated against live commodity prices but no real money is at risk.</li>
              <li>This service is not a CFD, derivative, or regulated investment product.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={agreedSimulated}
                onCheckedChange={(c) => setAgreedSimulated(c === true)}
                className="mt-0.5"
              />
              <span className="text-sm text-muted-foreground leading-relaxed">
                I understand this is a simulation and the virtual USDC balance has no monetary value or redemption right.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={agreedTerms}
                onCheckedChange={(c) => setAgreedTerms(c === true)}
                className="mt-0.5"
              />
              <span className="text-sm text-muted-foreground leading-relaxed">
                I have read and accept the{' '}
                <Link to="/terms-of-service" target="_blank" className="text-primary hover:underline inline-flex items-center gap-0.5">
                  Terms of Service <ExternalLink className="h-3 w-3" />
                </Link>{' '}
                and{' '}
                <Link to="/risk-disclosure" target="_blank" className="text-primary hover:underline inline-flex items-center gap-0.5">
                  Risk Disclosure <ExternalLink className="h-3 w-3" />
                </Link>
                .
              </span>
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleAccept} disabled={!canSubmit}>
            {submitting ? 'Saving…' : 'Accept & Continue'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RiskAcceptanceModal;
