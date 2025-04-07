import {
  createInitializeMintInstruction,
  ExtensionType,
  LENGTH_SIZE,
  TOKEN_2022_PROGRAM_ID,
  TYPE_SIZE,
  createInitializeInstruction,
  getMintLen,
  getAssociatedTokenAddressSync,
  createMintToInstruction,
  createAssociatedTokenAccountInstruction,
  createInitializeMetadataPointerInstruction,
} from "@solana/spl-token";
import { pack } from "@solana/spl-token-metadata";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";

import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import {
  fetchIPFSMetadataFromPinata,
  IPFSMetadata,
  uploadMetadataToPinata,
} from "./ipfs";

export const createTokenOnSolana = async (
  wallet: WalletContextState,
  tokenData: {
    tokenName: string;
    tokenSymbol: string;
    tokenImage: string;
    tokenDecimals: number;
    tokenSupply: number;
  },
  connection: Connection
) => {
  if (!wallet || !wallet.connected || !wallet.publicKey) {
    alert("Please connect your wallet first!");
    return;
  }

  try {
    const mintAccountKeypair = Keypair.generate();

    const mintLen = getMintLen([ExtensionType.MetadataPointer]);

    const metadata: IPFSMetadata = {
      name: tokenData.tokenName,
      mint: mintAccountKeypair.publicKey,
      symbol: tokenData.tokenSymbol,
      uri: tokenData.tokenImage,
      additionalMetadata: [],
    };

    //upload the metadata to an IPFS to retrieve whenever needed
    const metadataCID = await uploadMetadataToPinata(metadata);
    if (!metadataCID) {
      alert("Failed to upload token metadata");
      return;
    }

    console.log({ metadataCID: metadataCID.cid });

    const ipfsMetadata = await fetchIPFSMetadataFromPinata(metadataCID.cid);
    if (!ipfsMetadata) {
      alert("Failed to fetch token metadata");
      return;
    }

    const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

    const lamports = await connection.getMinimumBalanceForRentExemption(
      mintLen + metadataLen
    );

    const transaction = new Transaction();

    // Create mint account with extra space
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: mintAccountKeypair.publicKey,
        lamports,
        space: mintLen,
        programId: TOKEN_2022_PROGRAM_ID,
      }),
      createInitializeMetadataPointerInstruction(
        mintAccountKeypair.publicKey,
        wallet.publicKey,
        mintAccountKeypair.publicKey,
        TOKEN_2022_PROGRAM_ID
      ),
      createInitializeMintInstruction(
        mintAccountKeypair.publicKey,
        9,
        wallet.publicKey,
        null,
        TOKEN_2022_PROGRAM_ID
      ),
      createInitializeInstruction({
        programId: TOKEN_2022_PROGRAM_ID,
        mint: mintAccountKeypair.publicKey,
        metadata: mintAccountKeypair.publicKey,
        name: tokenData.tokenName,
        symbol: tokenData.tokenSymbol,
        uri: ipfsMetadata.uri,
        mintAuthority: wallet.publicKey,
        updateAuthority: wallet.publicKey,
      })
    );

    transaction.feePayer = wallet.publicKey;

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    transaction.partialSign(mintAccountKeypair);

    if (!wallet.signTransaction) {
      throw new Error("Wallet doesn't support signTransaction");
    }

    await wallet.sendTransaction(transaction, connection);

    const createdToken = getAssociatedTokenAddressSync(
      mintAccountKeypair.publicKey,
      wallet.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID
    );

    console.log(createdToken.toBase58());

    const transaction2 = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        wallet.publicKey,
        createdToken,
        wallet.publicKey,
        mintAccountKeypair.publicKey,
        TOKEN_2022_PROGRAM_ID
      )
    );

    await wallet.sendTransaction(transaction2, connection);

    const transaction3 = new Transaction().add(
      createMintToInstruction(
        mintAccountKeypair.publicKey,
        createdToken,
        wallet.publicKey,
        1000000000,
        [],
        TOKEN_2022_PROGRAM_ID
      )
    );

    await wallet.sendTransaction(transaction3, connection);

    const ataBalance = await connection.getTokenAccountBalance(createdToken);
    console.log(ataBalance.value.amount);

    console.log("Token Minted!!!");
  } catch (error) {
    console.error("Error creating token:", error);
    alert(`Error creating token: ${String(error)}`);
    return null;
  }
};
