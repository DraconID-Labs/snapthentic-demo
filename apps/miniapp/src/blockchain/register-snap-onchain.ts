import { http, createPublicClient, createWalletClient } from "viem";
import { sepolia } from "viem/chains";
import { env } from "~/env";

import abi from "@snapthentic/blockchain/abi";
import { privateKeyToAccount } from "viem/accounts";

const account = privateKeyToAccount(env.CALLER_PRIVATE_KEY as `0x${string}`);

const client = createPublicClient({
  chain: sepolia,
  transport: http(),
});

const walletClient = createWalletClient({
  chain: sepolia,
  transport: http(),
  account,
});

export async function registerSnapOnChain(
  owner: string,
  signature: string,
  hash: string,
) {
  const { request } = await client.simulateContract({
    address: env.REGISTRY_ADDRESS as `0x${string}`,
    abi: abi,
    functionName: "registerSnap",
    args: [owner, signature, hash],
    account,
  });

  const txHash = await walletClient.writeContract(request);

  const receipt = await client.waitForTransactionReceipt({
    hash: txHash,
  });

  return { receipt, txHash };
}
