import React from 'react';
import { useAccount, useBalance, useChainId, useReadContract } from 'wagmi';
import { formatUnits, erc20Abi } from 'viem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Coins } from 'lucide-react';
import ConnectWalletButton from './ConnectWalletButton';
import { USDC_ADDRESSES, SUPPORTED_CHAINS } from '@/config/wallet';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

const WalletStatusCard: React.FC = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const usdcAddress = USDC_ADDRESSES[chainId];
  const currentChain = SUPPORTED_CHAINS.find((c) => c.id === chainId);

  const { data: nativeBalance, isLoading: nativeLoading } = useBalance({
    address,
    query: { enabled: isConnected },
  });

  const { data: usdcRaw, isLoading: usdcLoading } = useReadContract({
    address: usdcAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: isConnected && !!usdcAddress && !!address },
  });

  const usdcFormatted = usdcRaw !== undefined ? Number(formatUnits(usdcRaw as bigint, 6)).toFixed(2) : '0.00';
  const nativeFormatted = nativeBalance
    ? Number(formatUnits(nativeBalance.value, nativeBalance.decimals)).toFixed(4)
    : '0.0000';

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Wallet className="h-4 w-4 text-primary" />
          Web3 Wallet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Connect your wallet to deposit real USDC and trade synthetic commodities.
            </p>
            <ConnectWalletButton fullWidth />
            <p className="text-xs text-muted-foreground">
              Supported networks: {SUPPORTED_CHAINS.map((c) => c.name).join(', ')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Network</span>
              <Badge variant="secondary">{currentChain?.name ?? 'Unsupported'}</Badge>
            </div>

            <div className="rounded-lg border border-border/50 bg-muted/20 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Coins className="h-3.5 w-3.5" />
                  USDC Balance
                </span>
                {usdcLoading ? (
                  <Skeleton className="h-4 w-20" />
                ) : (
                  <span className="text-sm font-semibold text-foreground">{usdcFormatted} USDC</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Native ({nativeBalance?.symbol ?? 'ETH'})</span>
                {nativeLoading ? (
                  <Skeleton className="h-4 w-20" />
                ) : (
                  <span className="text-xs font-medium">{nativeFormatted}</span>
                )}
              </div>
            </div>

            <ConnectWalletButton fullWidth variant="outline" />

            <p className="text-xs text-muted-foreground">
              💡 Deposit flow coming next — your USDC will be locked in a vault contract and credited 1:1 to your trading balance.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WalletStatusCard;
