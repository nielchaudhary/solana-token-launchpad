import { TOKEN_2022_PROGRAM_ID, getMinimumBalanceForRentExemptAccount, MINT_SIZE } from "@solana/spl-token";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import {useState} from 'react';


const isNullOrUndefined = (value: unknown) => value === null || value === undefined;
export const TokenLaunchpad = () => {
    const wallet = useWallet();
    const [tokenName, setTokenName] = useState('');
    const [tokenSymbol, setTokenSymbol] = useState('');
    const [tokenImage, setTokenImage] = useState('');
    const [tokenSupply, setTokenSupply] = useState(10000);
    const [tokenDecimals, setTokenDecimals] = useState(9);


    if(isNullOrUndefined(wallet)){
        return <div>Wallet not found</div>;
    }


    const createToken = async () => {
        if (!wallet || !wallet.connected) {
            alert("Please connect your wallet first!");
            return;
        }
    
        if (!wallet.publicKey) {
            alert("Wallet public key not available!");
            return;
        }
    
        try {
            // Create a keypair for the mint account
            const connection = new Connection('https://api.devnet.solana.com', "confirmed");
            const keypair = Keypair.generate();
            const lamports = await getMinimumBalanceForRentExemptAccount(connection);
    
            // Create the mint transaction
            const transaction = new Transaction().add(
                SystemProgram.createAccount({
                    fromPubkey: wallet.publicKey,
                    newAccountPubkey: new PublicKey(keypair.publicKey),
                    lamports,
                    space: MINT_SIZE,
                    programId: TOKEN_2022_PROGRAM_ID,
                })
            );
    
            transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
            transaction.feePayer = wallet.publicKey;
    
            // Partially sign with mint account keypair
            transaction.partialSign(keypair);
            
            // Sign with wallet
            if (!wallet.signTransaction) {
                throw new Error("Wallet doesn't support signTransaction");
            }
            
            const signedTransaction = await wallet.signTransaction(transaction);
            
            // Send transaction to Solana blockchain
            const signature = await connection.sendRawTransaction(signedTransaction.serialize());
            await connection.confirmTransaction(signature);
    
            alert(`Token created successfully! Transaction Signature: ${signature}`);
        } catch (error) {
            console.error("Error creating token:", error);
            alert(`Error creating token: ${error instanceof Error ? error.message : String(error)}`);
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            marginBottom: '200px',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column'
        }}>
          <h1>Solana Token Launchpad</h1>
          <input className="inputText" type="text" placeholder="Enter Token Name" /><br/>
          <input className="inputText" type="text" placeholder="Enter Token Symbol" /><br/>
          <input className="inputText" type="text" placeholder="Enter Token Image" /><br/>
          <input className="inputText" type="text" placeholder="Enter Token Supply" /><br/>
          <input className="inputText" type="text" placeholder="Enter Token Decimals" /><br/>

          <button onClick={createToken} className="btn">Create Token</button>
        </div>
    );
};
