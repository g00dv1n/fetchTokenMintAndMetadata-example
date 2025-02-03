import { address, createSolanaRpc } from "@solana/web3.js";
import { fetchTokenMintAndMetadata } from "./tokenMetadata";

const rpc = createSolanaRpc("https://api.mainnet-beta.solana.com");

const tokenAddr = address("6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN");

const [mint, metadata] = await fetchTokenMintAndMetadata(rpc, tokenAddr);

console.log(mint.data);
console.log(metadata.data);
