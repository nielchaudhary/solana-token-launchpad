import { PinataSDK } from "pinata";
import { TokenMetadata } from "./data-helpers";

const pinata = new PinataSDK({
  pinataJwt:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJkZGQzNDJhMi01Mjk4LTRmYmItOTRlZS0zNGRjZDU1ZmQ1YWQiLCJlbWFpbCI6Im5laWxjaGF1ZGhhcnkxMi53b3JrQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJkNjllMTEwZjk1YTY2Yjk3YmVmZiIsInNjb3BlZEtleVNlY3JldCI6IjdkOTAwYzE0MzQ1MDAwZTdiMWI1YTU5OGJmMWVlY2U2OGU3YWYwNDMyMzEwNzA4Y2Q1NzA3NGFlN2RlN2Y5ZTYiLCJleHAiOjE3NzUzOTYzNzJ9.8IW_cPBh6zfv2T2bNFqaHYZOXlXgHB5-HzKJU31Uowg",
  pinataGateway: "coffee-past-skunk-39.mypinata.cloud",
});

export const uploadTokenImageToPinata = async (
  imageLink: Partial<TokenMetadata["uri"]>
) => {
  try {
    const imageFile = new File(
      [JSON.stringify(imageLink)],
      `${imageLink}-tokenImage-${Date.now()}.json`,
      {
        type: "application/json",
      }
    );

    const upload = await pinata.upload.public.file(imageFile);
    console.log("Image Uploaded : ", upload.cid);
    return {
      imageCid: upload.cid,
    };
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
};

interface fullMetaData {
  name: string;
  symbol: string;
  description: string;
  image: string;
  additionalMetadata: (readonly [string, string])[];
}
//uploading the token metadata to an ipfs storage
export const uploadMetadataToPinata = async (data: fullMetaData) => {
  try {
    const metadata = {
      name: data.name,
      symbol: data.symbol,
      description: data.description,
      image: data.image,
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
    console.log("Metadata Uploaded : ", upload.cid);
    return upload;
  } catch (error) {
    console.error("Error uploading metadata:", error);
    return null;
  }
};
