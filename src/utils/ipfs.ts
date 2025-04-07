import { PublicKey } from "@solana/web3.js";
import { PinataSDK } from "pinata";

const pinata = new PinataSDK({
  pinataJwt: "YOUR_PINATA_JWT",
  pinataGateway: "YOUR_GATEWAY",
});

export interface IPFSMetadata {
  name: string;
  mint: PublicKey;
  symbol: string;
  uri: string;
  additionalMetadata: (readonly [string, string])[];
}
//uploading the token metadata to an ipfs storage
export const uploadMetadataToPinata = async (data: IPFSMetadata) => {
  try {
    const metadata = {
      name: data.name,
      mint: data.mint,
      symbol: data.symbol,
      image: data.uri,
      additionalMetadata: data.additionalMetadata,
    };

    const metadataFile = new File(
      [JSON.stringify(metadata)],
      `${data.name}-tokenMetadata-${Date.now()}.json`,
      {
        type: "application/json",
      }
    );

    const upload = await pinata.upload.public.file(metadataFile);
    console.log({ MetadataCID: upload.cid });
    return upload;
  } catch (error) {
    console.error(
      `Error uploading metadata due to ${(error as Error).message}`,
      error
    );
    return null;
  }
};

export const fetchIPFSMetadataFromPinata = async (metadataCID: string) => {
  try {
    const { data } = await pinata.gateways.public.get(metadataCID);
    return data as unknown as IPFSMetadata;
  } catch (error) {
    console.error(
      `Error fetching metadata due to ${(error as Error).message}`,
      error
    );
    return null;
  }
};
