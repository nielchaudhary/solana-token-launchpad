import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { 
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton 
} from '@solana/wallet-adapter-react-ui';
import { 
    PhantomWalletAdapter,
    SolflareWalletAdapter,
    // Add other wallet adapters as needed
} from '@solana/wallet-adapter-wallets';
import { useMemo } from 'react';

// Import required CSS
import '@solana/wallet-adapter-react-ui/styles.css';
import { TokenLaunchpad } from './components/token-launchpad';

function App() {
    // Define the Solana cluster (network) to connect to
    const endpoint = useMemo(() => 'https://solana-devnet.g.alchemy.com/v2/PQe_oX1Q7RxXmINrsPZffWQl9PI-v30O', []);
    
    // // Initialize wallet adapters
    const wallets = useMemo(() => [
        new PhantomWalletAdapter(),
        new SolflareWalletAdapter(),
        // Add more wallets as needed
    ], []);

    return (
  
    

        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets = {wallets} autoConnect>
                <WalletModalProvider>


                    <div style={{
                        display : 'flex',
                        justifyContent : 'space-between',
                        padding : '30px'
                    }}>
                    <WalletMultiButton />
                    <WalletDisconnectButton />
                    </div>
                  
                    <TokenLaunchpad/>
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>

    );
}

export default App;