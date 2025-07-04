import { createPublicClient, createWalletClient, http } from "viem";
import { sepolia } from "viem/chains";

const pk = "0xd4397130286f9a3defb95c47acf6d17be6a85254217ecf38bca0752bf9e9a183";
const add = "0xe6b5c6c9e44d5deda5a0932f73958036d0007c8a";

import abi from "./abi.json";
import { privateKeyToAccount } from "viem/accounts";

const account = privateKeyToAccount(pk as `0x${string}`, {});

console.log({ account });

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
    address: add as `0x${string}`,
    abi: abi,
    functionName: "registerSnap",
    args: [owner, signature, hash],
    account,
  });

  console.log("Preparing to send tx");

  const txHash = await walletClient.writeContract(request);

  console.log("Waiting for receipt + txHash", txHash);

  const receipt = await client.waitForTransactionReceipt({
    hash: txHash,
  });

  console.log("Receipt", receipt);

  return { receipt, txHash };
}

registerSnapOnChain(
  "0xe6b5c6c9e44d5deda5a0932f73958036d0007c8a",
  "0x0b24413d4490223aeba9ebdd88b2054634284133b43b9a693630d2841d0bbdbc58f1da122fc38d6204204d4dc93d88b0fe05fe90ba7b1da0166bb567838a33e61c",
  "0x9d2d73820220892f87fc9b64489bdf029eda5c673dfe00ae303755e2ea8e663e",
);
