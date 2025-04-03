import {
  createInitializeMintInstruction,
  getMinimumBalanceForRentExemptMint,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import { WalletContextState } from "@solana/wallet-adapter-react";
import {
  Connection,
  Keypair,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

export const isNullOrUndefined = (value: unknown) =>
  value === null || value === undefined;

export const notNullOrUndefined = (value: unknown) => !isNullOrUndefined(value);

export interface TokenData {
  tokenName: string;
  tokenSymbol: string;
  tokenImage: string;
  tokenSupply: number;
  tokenDecimals: number;
}

export const handleStateChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  state: (value: string) => void
) => {
  state(e.target.value);
};

export const handleStateChangeNumber = (
  e: React.ChangeEvent<HTMLInputElement>,
  state: (value: number) => void
) => {
  state(Number(e.target.value));
};

export const createTokenOnSolana = async (
  wallet: WalletContextState,
  tokenData: {
    tokenName: string;
    tokenSymbol: string;
    tokenImage: string;
    tokenDecimals: number;
    tokenSupply: number;
  }
) => {
  if (!wallet || !wallet.connected) {
    alert("Please connect your wallet first!");
    return;
  }

  if (!wallet.publicKey) {
    alert("Wallet public key not available!");
    return;
  }

  try {
    // Establish connection to Solana devnet
    const connection = new Connection(
      "https://api.devnet.solana.com",
      "confirmed"
    );

    // Generate a new keypair for the mint account
    const mintAccountKeypair = Keypair.generate();

    // Calculate rent exemption for the mint account
    const lamports = await getMinimumBalanceForRentExemptMint(connection);

    // Create a transaction object
    const transaction = new Transaction();

    // Step 1: Create the mint account
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: mintAccountKeypair.publicKey,
        lamports, // Rent exemption amount
        space: 82, // Mint account size
        programId: TOKEN_2022_PROGRAM_ID, // SPL Token program ID
      })
    );

    // Step 2: Initialize the mint account
    transaction.add(
      createInitializeMintInstruction(
        mintAccountKeypair.publicKey, // Mint address
        tokenData.tokenDecimals, // Number of decimals
        wallet.publicKey, // Mint authority (wallet)
        null, // Freeze authority (optional)
        TOKEN_2022_PROGRAM_ID // SPL Token program ID
      )
    );

    transaction.feePayer = wallet.publicKey;

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    // Partially sign the transaction with the mint account keypair
    transaction.partialSign(mintAccountKeypair);

    // Sign the transaction with the wallet
    if (!wallet.signTransaction) {
      throw new Error("Wallet doesn't support signTransaction");
    }

    const signedTransaction = await wallet.signTransaction(transaction);

    // Send the signed transaction to the blockchain
    const signature = await connection.sendRawTransaction(
      signedTransaction.serialize(),
      { skipPreflight: true }
    );

    await connection.confirmTransaction(signature, "confirmed");

    console.log({
      mintAddress: mintAccountKeypair.publicKey.toBase58(),
      txnSignature: signature,
    });

    return { signature, mintAddress: mintAccountKeypair.publicKey.toBase58() };
  } catch (error) {
    console.error("Error creating token:", error);

    alert(`Error creating token: ${String(error)}`);

    return null;
  }
};
