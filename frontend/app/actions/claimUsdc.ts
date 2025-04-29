"use server";

import { Connection, Keypair, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import bs58 from "bs58";

export async function claimSonic({
  result,
  walletAddress,
}: {
  result: number;
  walletAddress: string;
}) {
  if (!result || !walletAddress) {
    return { error: "Invalid claim details." };
  }

  try {
    const sender = Keypair.fromSecretKey(bs58.decode(process.env.NEXT_PUBLIC_PRIVATE_KEY!));
    const connection = new Connection("https://api.testnet.v1.sonic.game", {
      commitment: "processed",
      wsEndpoint: "wss://api.testnet.v1.sonic.game",
    });

    const tx = new Transaction();
    tx.add(
      SystemProgram.transfer({
        fromPubkey: sender.publicKey,
        toPubkey: new PublicKey(walletAddress),
        lamports: result * LAMPORTS_PER_SOL,
      })
    );

    tx.feePayer = sender.publicKey;
    const { blockhash } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;

    const txHash = await connection.sendTransaction(tx, [sender]);
    return { success: true, txHash };
  } catch (error) {
    console.error(error);
    return { error : "Claim failed. Please try again." };
  }
}


