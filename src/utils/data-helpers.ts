import { PublicKey } from "@solana/web3.js";

export const isNullOrUndefined = (value: unknown) =>
  value === null || value === undefined;

export const notNullOrUndefined = (value: unknown) => !isNullOrUndefined(value);

export interface TokenMetadata {
  mint: PublicKey;
  name: string;
  symbol: string;
  uri: string;
  additionalMetadata: (readonly [string, string])[];
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
