import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js";
import {
  getMinimumBalanceForRentExemptAccount,
  MINT_SIZE,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import { WalletContextState } from "@solana/wallet-adapter-react";
import {
  Connection,
  Keypair,
  PublicKey,
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

export const createToken = async (
  wallet: WalletContextState,
  tokenData: TokenData
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
    // Create a keypair for the mint account
    const connection = new Connection(
      "https://api.devnet.solana.com",
      "confirmed"
    );
    const keypair = Keypair.generate();
    const lamports = await getMinimumBalanceForRentExemptAccount(connection);

    const metaplex = Metaplex.make(connection).use(
      walletAdapterIdentity(wallet)
    );

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

    transaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;
    transaction.feePayer = wallet.publicKey;

    // Partially sign with mint account keypair
    transaction.partialSign(keypair);

    // Sign with wallet
    if (!wallet.signTransaction) {
      throw new Error("Wallet doesn't support signTransaction");
    }

    const signedTransaction = await wallet.signTransaction(transaction);

    // Send transaction to Solana blockchain
    const signature = await connection.sendRawTransaction(
      signedTransaction.serialize()
    );
    await connection.confirmTransaction(signature);

    alert(`Token created successfully! Transaction Signature: ${signature}`);
  } catch (error) {
    console.error("Error creating token:", error);
    alert(
      `Error creating token: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};
