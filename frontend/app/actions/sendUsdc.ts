"use server";

import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { getAssociatedTokenAddress, createTransferCheckedInstruction } from "@solana/spl-token";

export async function sendUsdc({
  fromAddress,
  betAmount,
}: {
  fromAddress: string;
  betAmount: number;
}) {
  if (!fromAddress || !betAmount) {
    return { error: "Wallet is not connected or bet amount is invalid." };
  }

  try {
    const connection = new Connection(
      "https://mainnet.helius-rpc.com/?api-key=c7e5b412-c980-4f46-8b06-2c85c0b4a08d",
      "confirmed"
    );

    // USDC mint address (mainnet)
    const USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
    
    // House wallet (replace with your house wallet address)
    const HOUSE_WALLET = new PublicKey("FqNYz8CK9BUbtE29SzjeNtvqbLVSgRmg3gjax7pahTaN");

    const fromWallet = new PublicKey(fromAddress);

    // Get token accounts
    const fromTokenAccount = await getAssociatedTokenAddress(USDC_MINT, fromWallet);
    const toTokenAccount = await getAssociatedTokenAddress(USDC_MINT, HOUSE_WALLET);

    const tx = new Transaction();

    // Add transfer instruction
    tx.add(
      createTransferCheckedInstruction(
        fromTokenAccount, // source
        USDC_MINT, // mint
        toTokenAccount, // destination
        fromWallet, // owner
        betAmount * 1000000, // amount (USDC has 6 decimals)
        6 // decimals
      )
    );

    const { blockhash } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = fromWallet;

    // Return the serialized transaction for the client to sign
    const serializedTx = tx.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });

    return { 
      success: true, 
      transaction: serializedTx.toString('base64'),
      fromTokenAccount: fromTokenAccount.toBase58(),
      toTokenAccount: toTokenAccount.toBase58()
    };
  } catch (error) {
    console.error("USDC transfer failed:", error);
    return { error: "Transaction failed." };
  }
} 