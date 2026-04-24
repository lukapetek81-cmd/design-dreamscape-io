import React, { useEffect, useRef } from 'react';
import { WagmiProvider } from 'wagmi';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { wagmiConfig, WALLETCONNECT_PROJECT_ID } from '@/config/wallet';

interface Web3ProviderProps {
  children: React.ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    createWeb3Modal({
      wagmiConfig,
      projectId: WALLETCONNECT_PROJECT_ID,
      enableAnalytics: true,
      themeMode: 'dark',
      themeVariables: {
        '--w3m-accent': 'hsl(263 70% 60%)',
        '--w3m-border-radius-master': '8px',
      },
    });
  }, []);

  return <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>;
};
