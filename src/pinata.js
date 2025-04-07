import { PinataSDK } from "pinata";

const pinata = new PinataSDK({
  pinataJwt:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJkZGQzNDJhMi01Mjk4LTRmYmItOTRlZS0zNGRjZDU1ZmQ1YWQiLCJlbWFpbCI6Im5laWxjaGF1ZGhhcnkxMi53b3JrQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJkNjllMTEwZjk1YTY2Yjk3YmVmZiIsInNjb3BlZEtleVNlY3JldCI6IjdkOTAwYzE0MzQ1MDAwZTdiMWI1YTU5OGJmMWVlY2U2OGU3YWYwNDMyMzEwNzA4Y2Q1NzA3NGFlN2RlN2Y5ZTYiLCJleHAiOjE3NzUzOTYzNzJ9.8IW_cPBh6zfv2T2bNFqaHYZOXlXgHB5-HzKJU31Uowg",
  pinataGateway: "coffee-past-skunk-39.mypinata.cloud",
});

//uploading the token metadata to an ipfs storage
export const uploadFileToPinata = async (data) => {
  try {
    const metadata = {
      name: "neel",
      symbol: "NE",
      uri: 'https://cdn.100xdevs.com/metadata.json',
      decimals: 9,
      supply: 1000000000,
      additionalMetadata : []
    };

    const metadataFile = new File(
      [JSON.stringify(metadata)],
      `tokenMetadata-${Date.now()}.json`,
      {
        type: "application/json",
      }
    );

    const upload = await pinata.upload.public.file(metadataFile);
    console.log(upload);
    return upload;
  } catch (error) {
    console.error("Error uploading file:", error);
    return null;
  }
};


uploadFileToPinata();