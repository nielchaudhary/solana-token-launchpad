import { useWallet } from "@solana/wallet-adapter-react";
import {useState} from 'react';
import {  handleStateChange, handleStateChangeNumber, isNullOrUndefined } from "../utils/data-helpers";
import { useConnection } from "@solana/wallet-adapter-react";
import { createTokenOnSolana } from "../utils/createToken";


export const TokenLaunchpad = () => {
    const wallet = useWallet();
    const { connection } = useConnection();

    const [tokenName, setTokenName] = useState('');
    const [tokenSymbol, setTokenSymbol] = useState('');
    const [tokenImage, setTokenImage] = useState('');
    const [tokenSupply, setTokenSupply] = useState(10000);
    const [tokenDecimals, setTokenDecimals] = useState(9);


    if(isNullOrUndefined(wallet)){
        return <div>Wallet not found</div>;
    }

    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            display: 'flex',
            marginBottom: '200px',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column'
        }}>
          <h1>Solana Token Launchpad</h1>
          <input className="inputText" type="text" placeholder="Enter Token Name" value={tokenName} onChange={(e) => handleStateChange(e, setTokenName)} /><br/>
          <input className="inputText" type="text" placeholder="Enter Token Symbol" value={tokenSymbol} onChange={(e) => handleStateChange(e, setTokenSymbol)} /><br/>
          <input className="inputText" type="text" placeholder="Enter Token Image" value={tokenImage} onChange={(e) => handleStateChange(e, setTokenImage)} /><br/>
          <input className="inputText" type="number" placeholder="Enter Token Supply" value={tokenSupply} onChange={(e) => handleStateChangeNumber(e, setTokenSupply)} /><br/>
          <input className="inputText" type="number" placeholder="Enter Token Decimals" value={tokenDecimals} onChange={(e) => handleStateChangeNumber(e, setTokenDecimals)} /><br/>

          <button onClick={() => createTokenOnSolana(wallet,{
            tokenName, tokenSymbol, tokenImage, tokenSupply, tokenDecimals}, connection)} className="btn">Create Token</button>
        </div>
    );
};
