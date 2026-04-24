import React from 'react';
import { Button } from '@/components/ui/button';
import { useAccount, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { Wallet, LogOut, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SUPPORTED_CHAINS } from '@/config/wallet';
import { toast } from 'sonner';

const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

interface Props {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  fullWidth?: boolean;
}

const ConnectWalletButton: React.FC<Props> = ({ variant = 'default', size = 'default', fullWidth }) => {
  const { open } = useWeb3Modal();
  const { address, isConnected, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const currentChain = SUPPORTED_CHAINS.find((c) => c.id === chainId);
  const isWrongNetwork = isConnected && !currentChain;

  if (!isConnected) {
    return (
      <Button
        variant={variant}
        size={size}
        className={fullWidth ? 'w-full' : ''}
        onClick={() => open()}
      >
        <Wallet className="mr-2" />
        Connect Wallet
      </Button>
    );
  }

  if (isWrongNetwork) {
    return (
      <Button
        variant="destructive"
        size={size}
        className={fullWidth ? 'w-full' : ''}
        disabled={isSwitching}
        onClick={() => switchChain({ chainId: SUPPORTED_CHAINS[0].id })}
      >
        <AlertTriangle className="mr-2" />
        {isSwitching ? 'Switching...' : `Switch to ${SUPPORTED_CHAINS[0].name}`}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={size} className={fullWidth ? 'w-full' : ''}>
          <Wallet className="mr-2" />
          {address && truncate(address)}
          <Badge variant="secondary" className="ml-2 text-[10px]">
            {currentChain?.name}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground">Connected via {connector?.name}</p>
            <p className="text-xs font-mono break-all">{address}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => open({ view: 'Networks' })} className="cursor-pointer">
          Switch Network
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => open({ view: 'Account' })} className="cursor-pointer">
          Account Details
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            navigator.clipboard.writeText(address || '');
            toast.success('Address copied');
          }}
          className="cursor-pointer"
        >
          Copy Address
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => disconnect()}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ConnectWalletButton;
