"use client";
import { useState, useEffect } from "react";
import SpinWheel from "@/app/components/SpinWheel";
import Image from "next/image";
import Wheel from "@/public/assets/wheel.png";
import logoImg from "@/public/assets/logo.png";
import WheelImg from "@/public/assets/trophy.jpg";
import Open from "@/public/assets/open-eye.png"
import { useAppKit, useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';
import type { Provider } from '@reown/appkit-adapter-solana/react';
import { Commitment, Connection, LAMPORTS_PER_SOL, PublicKey,SystemProgram } from "@solana/web3.js";
import { ToastContainer, toast } from 'react-toastify';import {
  Keypair,
  Transaction,
} from '@solana/web3.js';

// import {
//   ASSOCIATED_TOKEN_PROGRAM_ID,
//   getAssociatedTokenAddress,
//   TOKEN_PROGRAM_ID,
//   createAssociatedTokenAccountInstruction,
//   createTransferCheckedInstruction
// } from "@solana/spl-token";
import Link from "next/link";

import bs58 from 'bs58'

export default function Home() {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedBet, setSelectedBet] = useState<number | null>(null);
  const [result, setResult] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Provider>('solana');
  const [user] = useState<{ name?: string; email?: string; avatar?: string } | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const wheelNumbers = ["0", "1X", "2X", "4X", "5X", "10X", "0", "3X"];
  const commitment: Commitment = 'processed';
  const wallet = address ? new PublicKey(address) : null; 
  const [isClaiming] = useState(false);


const connection = new Connection('https://api.testnet.v1.sonic.game', {
    commitment,
    wsEndpoint: 'wss://api.testnet.v1.sonic.game'
});



const sendSonic = async () => {
  try {

    if (!wallet || !wallet) {
      throw new Error("Wallet is not connected or invalid.");
    }

   

    const tx = new Transaction();

    tx.add(
        SystemProgram.transfer({
            fromPubkey: wallet,
            toPubkey: new PublicKey("3oRz4ZZzjmbujnnxXKqoNJ1dRK9XAe6S465NbAZ38FjJ"),
            lamports: (selectedBet ?? 0) * LAMPORTS_PER_SOL
        })
    );

    tx.feePayer = wallet;
    const { blockhash } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;

    // Use the wallet adapter to sign and send the transaction
    const signature = await walletProvider.sendTransaction(tx, connection);

    console.log("Transaction sent! Signature:", signature);
    return signature;
  } catch (error) {
    console.error("Transaction failed: ", error);
    return null;
  }
};

const handleSpin = async () => {
  if (isSpinning || selectedBet === null) return

  try {
    // await sendSonic(selectedBet)
    const transactionResult = await sendSonic(selectedBet);

    // setIsSpinning(true);
    // Wait for the sendSonic transaction to complete
    

    if (!transactionResult) {
      toast.error("Transaction canceled");
      setIsSpinning(false);
      return; // Stop execution if the transaction was canceled
    }
    setIsSpinning(true);

    // Play the spinning sound
    const spinSound = new Audio("/sounds/sound.mp3");
    spinSound.play();

    const randomDegree = Math.floor(Math.random() * 3600) + 360;
    setRotation((prevRotation) => prevRotation + randomDegree);

    setTimeout(() => {
      const spinResult = getSpinResult(randomDegree);
      const multiplier = parseMultiplier(spinResult);
      const winnings = selectedBet * multiplier;

      spinSound.pause();
      const spinSounds = new Audio("/sounds/winner.mp3");
      spinSounds.play();

      setResult(winnings);
      setShowModal(true);
      setIsSpinning(false);
    }, 5000);
  } catch (error) {
    console.error("Transaction failed:", error);
    setIsSpinning(false);
  }
};

  const shortenAddress = (address: string | undefined) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getSpinResult = (angle: number) => {
    const sectionSize = 360 / wheelNumbers.length;
    const normalizedAngle = angle % 360;
    const index = Math.floor(normalizedAngle / sectionSize);
    return wheelNumbers[index];
  };

  const parseMultiplier = (label: string) => {
    const match = label.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };

  const handleConnectWallet = async () => {
    open();
   
  };
  
  const sender: Keypair = Keypair.fromSecretKey(bs58.decode("2hEYjVAyxNvPFPERouBkDRCgvwzvECN3VyVrKXExN88nksXNg3wGNfyVgLjTpE35sxKMcuRER1sJLP8CaZ4zaMme"));
 

const handleClaim = async () => {
  if (!result || !wallet) {
    toast.error("Invalid claim details.");
    return;
  }
 

  console.log(result);

 try{
  const tx = new Transaction();
  tx.add(
    SystemProgram.transfer({
        fromPubkey: sender.publicKey,
        toPubkey: wallet,
        lamports: (result ?? 0) * LAMPORTS_PER_SOL
    })
);

tx.feePayer = sender.publicKey;
const { blockhash } = await connection.getLatestBlockhash();
tx.recentBlockhash = blockhash;

const txHash = await connection.sendTransaction(tx, [sender]);

console.log("tx hash: ", txHash);
toast.success(`Successfully claimed ${result} $SONIC!`);
setShowModal(false);
  } catch (error) {
    console.error("Claim transaction failed:", error);
    toast.error("Claim failed. Please try again.");
  }
};


  useEffect(() => {
    const fetchBalance = async () => {
      if (!address) return;

      try {
        const commitment: Commitment = "processed";
        const connection = new Connection("https://api.testnet.v1.sonic.game", {
          commitment,
          wsEndpoint: "wss://api.testnet.v1.sonic.game",
        });

        const balance = await connection.getBalance(new PublicKey(address));
        setBalance(balance / LAMPORTS_PER_SOL);
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    };

    fetchBalance();
  }, [address]);

  return (
    <> 
    <main className="hidden md:block h-[2000px]">
      
         <ToastContainer />
      <div className=" flex justify-between p-10 lg:px-[150px] ">
        <div className="flex items-center gap-4">
          <Image
            src={logoImg}
            alt="Logo"
            width={50}
            height={50}
            className="rounded-lg"
          />
          <h1 className="text-[#ea4c89] font-bold text-[24px]">Wager Wise</h1>
        </div>

        {/* <button className="px-[25px] py-[12px] border rounded-3xl bg-[#ea4c89] cursor-pointer font-semibold text-[#fff] hover:bg-[#f56ca0]" onClick={handleConnectWallet}>
          Connect Wallet
        </button> */}
        <div className="flex items-center gap-10">

        
        <Link href="/leaderboard"><button className="px-[25px] py-[12px] border rounded-3xl bg-[#000000] cursor-pointer font-semibold text-[#f56ca0] hover:bg-[#383737]">Leaderboard</button></Link>

{user ? (
          <div className="relative flex items-center gap-3">
            {/* <Image src={user.avatar || avatarImg.src} alt="User Avatar" width={30} height={30} className="rounded-full" /> */}
            <p className="text-[12px] font-medium">{user.name}</p>
          </div>
        ) : (
          <>
            {isConnected ? (
              <div className="relative" onClick={handleConnectWallet}>
                <button className="text-sm font-normal flex items-center gap-3">
                 
                  <p className="px-[25px] py-[12px] border rounded-3xl bg-[#ea4c89] cursor-pointer font-semibold text-[#fff] hover:bg-[#f56ca0]" >{shortenAddress(address)}</p>
                </button>
              </div>
            ) : (
              <>
                <button className="px-[25px] py-[12px] border rounded-3xl bg-[#ea4c89] cursor-pointer font-semibold text-[#fff] hover:bg-[#f56ca0]"  onClick={handleConnectWallet}>
                  Connect Wallet
                </button>
               
              </>
            )}
          </>
        )}
      </div>
      </div>

      <div className="flex min-h-screen  lg:flex-row flex-col justify-center lg:mt-[110px] mt-[20px]">
        <div className="flex-1 flex  flex-col lg:p-8 p-[10px] items-center">
          <div>
            <div className="">
              {/* <Image src={logoImg} alt='Logo' width={50} height={50} className="rounded-lg "/> */}

              <div className="leading-10">
                <span className="text-[12px] text-[#5e5d5d] ">
                {/* <Image
            src={Sonic}
            alt="Logo"
            width={25}
            height={25}
            className="rounded-lg cursor-pointer"
          /> */}
                  Balance</span>
                <div className="flex items-center gap-2">
                <h2 className="lg:text-[44px] text-[44px] font-bold">{balance !== null ? balance.toFixed(3) : "Loading..."} $SONIC</h2>
                
                <Image
            src={Open}
            alt="Logo"
            width={25}
            height={25}
            className="rounded-lg cursor-pointer"
          />

                </div>
               
              </div>
            </div>
            <h3 className="text-[34px] font-medium mt-[10px]">Spin and Win</h3>
            <p className="text-[#6c6b6b] text-[18px]">
              Get a chance to win $SONIC rewards of up to $100! Try your luck
              now! 🎰✨
            </p>

            <div className="text-[#6c6b6b] text-[18px] pt-3">
              <h4>Just keep in mind:</h4>
              <ul>- You must have at least 0.01 SOL</ul>
              <ul>- Some $SONIC in your wallet to play</ul>
              
            </div>
            <div className="mt-10">Click to select </div>

            {/* Bet Selection */}
            <div className="flex mt-1 p-2">
              {[1, 2, 3,4].map((bet) => (
                <button
                  key={bet}
                  onClick={() => setSelectedBet(bet)}
                  className={`lg:px-[12px] lg:py-[10px] px-[10px] py-[10px] border-2 rounded-3xl lg:text-[16px] text-[12px] font-bold mr-3 ${
                    selectedBet === bet
                      ? "bg-[#ea4c89] text-white"
                      : "border-black"
                  }`}
                >
                  {bet} $Sonic
                </button>
              ))}
            </div>

            {/* Spin Button */}
            <button
              className="px-[35px] py-[15px] rounded-3xl text-[18px] text-white font-bold bg-[#ea4c89] hover:bg-[#f56ca0] mt-10 w-full flex items-center justify-center gap-4"
              onClick={handleSpin}
              disabled={isSpinning || selectedBet === null}
            >
              {isSpinning ? "Spinning..." : "Spin the wheel"}
              <div>
                <Image src={Wheel} alt="wheel image" width={30} height={30} />
              </div>
            </button>
          </div>
        </div>

        <div className="flex-1 flex justify-center  lg:p-4 mt-[30px]">
          <SpinWheel rotation={rotation} isSpinning={isSpinning} />
        </div>

        {/* Result Modal */}
        {showModal && (
          <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
            <div className="bg-white p-12 rounded-md text-center items-center justify-center flex flex-col">
              <Image
                src={WheelImg}
                alt="trophy logo"
                width={200}
                height={200}
              />
              <h2 className="text-2xl font-bold">🎉 Congratulations! 🎉</h2>
              <p className="text-lg mt-2">
                You just won{" "}
                <span className="text-[#ea4c89] font-bold">
                  {result} $Sonic
                </span>{" "}
                tokens!
              </p>
              <div className="flex gap-4">
                <button
                  className="mt-4 px-6 py-2 bg-[#ea4c89] text-white rounded-lg"
                  onClick={() => setShowModal(false)}
                >
                  Spin Again
                </button>
                <button
  onClick={handleClaim}
  disabled={isClaiming}
  className={`mt-4 px-6 py-2 bg-[#ea4c89] text-white rounded-lg ${
    isClaiming ? "opacity-50 cursor-not-allowed" : ''
  }`}
>
  {isClaiming ? (
    <span className="active:animate-spin h-5 w-5 border-t-2 border-white rounded-full"></span>
  ) : (
    "Claim Tokens"
  )}
</button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* <footer className="flex justify-center items-center text-[200px]"> Made by Bigjoe with ❤️ </footer> */}
    </main>
    <div className="block md:hidden text-center p-6">
    <p className="text-lg font-semibold text-[#222]">
      This platform is currently only available on tablets and desktops. Please use a larger screen to access it.
    </p>
  </div></>
  );
}
