# How to fetch SPL Token metadata using solana web3.js v2

A simple example of how to fetch token mint and metadata with the new [Solana web3.js v2 SDK](https://github.com/anza-xyz/solana-web3.js) without extra metaplex dependencies.

```typescript
// heplper code
import {
  addCodecSizePrefix,
  Address,
  address,
  assertAccountExists,
  decodeAccount,
  fetchEncodedAccounts,
  getAddressDecoder,
  getAddressEncoder,
  getBooleanDecoder,
  GetMultipleAccountsApi,
  getOptionDecoder,
  getProgramDerivedAddress,
  getStructDecoder,
  getU32Codec,
  getU32Decoder,
  getU64Decoder,
  getU8Decoder,
  getUtf8Codec,
  Rpc,
} from "@solana/web3.js";

export const METADATA_PROGRAM_ID = address(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

const MintDecoder = getStructDecoder([
  [
    "mintAuthority",
    getOptionDecoder(getAddressDecoder(), {
      prefix: getU32Decoder(),
      noneValue: "zeroes",
    }),
  ],
  ["supply", getU64Decoder()],
  ["decimals", getU8Decoder()],
  ["isInitialized", getBooleanDecoder()],
  [
    "freezeAuthority",
    getOptionDecoder(getAddressDecoder(), {
      prefix: getU32Decoder(),
      noneValue: "zeroes",
    }),
  ],
]);

export const MetadataDecoder = getStructDecoder([
  ["key", getU8Decoder()],
  ["updateAuthority", getAddressDecoder()],
  ["mint", getAddressDecoder()],
  ["name", addCodecSizePrefix(getUtf8Codec(), getU32Codec())],
  ["symbol", addCodecSizePrefix(getUtf8Codec(), getU32Codec())],
  ["uri", addCodecSizePrefix(getUtf8Codec(), getU32Codec())],
]);

export async function getMetadataPdaAddress(mint: Address) {
  const addressEncoder = getAddressEncoder();
  const [metadataAccountAddress] = await getProgramDerivedAddress({
    programAddress: METADATA_PROGRAM_ID,
    seeds: [
      "metadata",
      addressEncoder.encode(METADATA_PROGRAM_ID),
      addressEncoder.encode(mint),
    ],
  });

  return metadataAccountAddress;
}

export async function fetchTokenMintAndMetadata(
  rpc: Rpc<GetMultipleAccountsApi>,
  mintAddr: Address
) {
  const metadataAccountAddress = await getMetadataPdaAddress(mintAddr);

  const [mintAccount, metadataAccount] = await fetchEncodedAccounts(rpc, [
    mintAddr,
    metadataAccountAddress,
  ]);

  assertAccountExists(mintAccount);
  assertAccountExists(metadataAccount);

  const mint = decodeAccount(mintAccount, MintDecoder);
  const metadata = decodeAccount(metadataAccount, MetadataDecoder);

  return [mint, metadata];
}
```

```typescript
import { address, createSolanaRpc } from "@solana/web3.js";
import { fetchTokenMintAndMetadata } from "./tokenMetadata";

const rpc = createSolanaRpc("https://api.mainnet-beta.solana.com");

const tokenAddr = address("6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN");

const [mint, metadata] = await fetchTokenMintAndMetadata(rpc, tokenAddr);

console.log(mint.data);
console.log(metadata.data);

/*
  {
    mintAuthority: {
      __option: "None",
    },
    supply: 999999638151462n,
    decimals: 6,
    isInitialized: true,
    freezeAuthority: {
      __option: "None",
    },
  }
  {
    key: 4,
    updateAuthority: "5e2qRc1DNEXmyxP8qwPwJhRWjef7usLyi7v5xjqLr5G7",
    mint: "6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN",
    name: "OFFICIAL TRUMP",
    symbol: "TRUMP",
    uri: "https://arweave.net/cSCP0h2n1crjeSWE9KF-XtLciJalDNFs7Vf-Sm0NNY0",
  }
*/
```
