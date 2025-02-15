import {
  addCodecSizePrefix,
  Address,
  address,
  decodeAccount,
  fetchJsonParsedAccounts,
  getAddressDecoder,
  getAddressEncoder,
  GetMultipleAccountsApi,
  getProgramDerivedAddress,
  getStructDecoder,
  getU32Codec,
  getU8Decoder,
  getUtf8Codec,
  MaybeAccount,
  MaybeEncodedAccount,
  Rpc,
} from "@solana/web3.js";

export const METADATA_PROGRAM_ID = address(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);
export const TOKEN_22_PROGRAM_ID = address(
  "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
);

export type OptionalAutority = Address | null;

export type Mint = {
  mintAuthority: OptionalAutority;
  supply: string;
  decimals: number;
  isInitialized: boolean;
  freezeAuthority: OptionalAutority;
  extensions?: any[];
};

export type TokenMetadataEssential = {
  name: string;
  symbol: string;
  uri: string;
  updateAuthority: Address;
};

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

  const accounts = await fetchJsonParsedAccounts(rpc, [
    mintAddr,
    metadataAccountAddress,
  ]);
  const mintAccount = accounts[0] as MaybeAccount<Mint>;
  const metadataAccount = accounts[1] as MaybeEncodedAccount;

  if (!mintAccount.exists) {
    throw Error(`Mint account ${mintAddr} doesn't exist`);
  }

  let metadata: TokenMetadataEssential | undefined;
  if (metadataAccount.exists) {
    const metadataDecoded = decodeAccount(metadataAccount, MetadataDecoder);
    const { name, symbol, uri, updateAuthority } = metadataDecoded.data;
    metadata = { name, symbol, uri, updateAuthority };
  }

  let metadataExt: TokenMetadataEssential | undefined;
  if (mintAccount.data.extensions && mintAccount.data.extensions.length > 0) {
    metadataExt = getTokenMetadataFromExtensions(mintAccount.data.extensions);
  }

  return {
    mint: mintAccount.data,
    metadata: metadata ||
      metadataExt || {
        name: "",
        symbol: "",
        uri: "",
        updateAuthority: "" as Address,
      },
    isToken22: mintAccount.programAddress === TOKEN_22_PROGRAM_ID,
  };
}

export function getTokenMetadataFromExtensions(extensions: any[]) {
  const tokenMetadataExt: {
    extension: "tokenMetadata";
    state: TokenMetadataEssential;
  } = extensions.find((ext) => ext.extension === "tokenMetadata");

  if (!tokenMetadataExt) {
    return undefined;
  }

  const { name, symbol, uri, updateAuthority } = tokenMetadataExt.state;
  return { name, symbol, uri, updateAuthority };
}
