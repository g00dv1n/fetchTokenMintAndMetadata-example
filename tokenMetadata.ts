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
