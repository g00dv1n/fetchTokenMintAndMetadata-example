# How to fetch SPL Token metadata using solana web3.js v2

A simple example of how to fetch token mint and metadata with the new [Solana web3.js v2 SDK](https://github.com/anza-xyz/solana-web3.js) without extra metaplex dependencies. It supports Metaplex Metadata and Token22 Extension.

## Usage

```typescript
import { address, createSolanaRpc } from "@solana/web3.js";
import { fetchTokenMintAndMetadata } from "./tokenMetadata";

const rpc = createSolanaRpc("https://api.mainnet-beta.solana.com");

const tokenAddr = address("6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN");

const { mint, metadata } = await fetchTokenMintAndMetadata(rpc, tokenAddr);

console.log(mint);
console.log(metadata);

/*
{
  decimals: 6,
  freezeAuthority: null,
  isInitialized: true,
  mintAuthority: null,
  supply: "999999620880752",
}
{
  name: "OFFICIAL TRUMP",
  symbol: "TRUMP",
  uri: "https://arweave.net/cSCP0h2n1crjeSWE9KF-XtLciJalDNFs7Vf-Sm0NNY0",
  updateAuthority: "5e2qRc1DNEXmyxP8qwPwJhRWjef7usLyi7v5xjqLr5G7",
}
*/
```
