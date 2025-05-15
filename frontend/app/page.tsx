"use client";
import localFont from "next/font/local";
import Image from "next/image";
import { twMerge } from "tailwind-merge";
import Logoimg from "@/public/assets/usdc.png";
import Logo from "@/public/assets/logo.png";
import solLogo from "@/public/assets/png.png";
import SpinWheel from "./components/SpinWheel";
import { useState, useEffect } from "react";
import {
  useAppKit,
  useAppKitAccount,
  useAppKitProvider,
} from "@reown/appkit/react";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import type { Provider } from "@reown/appkit-adapter-solana/react";
import {
  Connection,
  PublicKey,
  Transaction,
  Commitment,
  ParsedAccountData,

  Keypair,
  
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferCheckedInstruction,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import bs58 from "bs58";
// import UpDownGame from "./components/UpDownGame";
const Kaijuz = localFont({ src: "../fonts/center.otf" });
// import '../envConfig.ts'






export default function Home() {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const [usdcBalance, setUsdcBalance] = useState<number | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [result, setResult] = useState<number | null>(null);
  const [, setShowModal] = useState(false);
  const [canClaim, setCanClaim] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const wallet = address ? new PublicKey(address) : null;
  const { walletProvider } = useAppKitProvider<Provider>("solana");
  const commitment: Commitment = "processed";
  const [landedLabel, setLandedLabel] = useState<string | null>(null);
  const [currentGame] = useState<'wheel' | 'updown'>('wheel');

  
  const connection = new Connection(
    "https://mainnet.helius-rpc.com/?api-key=c7e5b412-c980-4f46-8b06-2c85c0b4a08d",
    "confirmed"
  );

  const wheelNumbers = [
    { label: "1x", multiplier: 1 },
    { label: "2x", multiplier: 2 },
    { label: "0x", multiplier: 0 },
    { label: "3x", multiplier: 3 },
    { label: "0x", multiplier: 0 },
    { label: "2x", multiplier: 2 },
    { label: "2x", multiplier: 2 },
    { label: "0x", multiplier: 0 },
    { label: "1x", multiplier: 1 },
    { label: "0x", multiplier: 0 },
  ];

  useEffect(() => {
    if (!address) return;
    const USDC_MINT = new PublicKey(
      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
    );
    const connection = new Connection(
      "https://mainnet.helius-rpc.com/?api-key=c7e5b412-c980-4f46-8b06-2c85c0b4a08d",
      "confirmed"
    );

    const fetchUSDCBalance = async () => {
      try {
        const wallet = new PublicKey(address);
        const tokenAccount = await getAssociatedTokenAddress(USDC_MINT, wallet);

        const balance = await connection.getTokenAccountBalance(tokenAccount);
        setUsdcBalance(Number(balance.value.uiAmount));
      } catch (error) {
        console.error("Error fetching USDC balance:", error);
        setUsdcBalance(0);
      }
    };

    fetchUSDCBalance();
    const interval = setInterval(fetchUSDCBalance, 5000);

    return () => clearInterval(interval);
  }, [address]);

  // Restore claim state on mount
  useEffect(() => {
    const storedCanClaim = localStorage.getItem("canClaim");
    const storedResult = localStorage.getItem("result");
    if (storedCanClaim === "true" && storedResult) {
      setCanClaim(true);
      setResult(Number(storedResult));
    }
  }, []);

  // Persist claim state when it changes
  useEffect(() => {
    localStorage.setItem("canClaim", canClaim ? "true" : "false");
    if (result !== null) {
      localStorage.setItem("result", result.toString());
    }
  }, [canClaim, result]);

  const handleConnectWallet = async () => {
    open();
  };

  const shortenAddress = (address: string | undefined) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  

  

  const handleSpin = async () => {
    if (!selectedAmount || isSpinning || canClaim) return;

    // Check if user has enough USDC
    if (usdcBalance === null || usdcBalance < selectedAmount) {
      toast.error(`Insufficient USDC balance. You need ${selectedAmount} USDC to play.`, {
        position: "bottom-left",
        theme: "dark",
      });
      return;
    }

    try {
      const transactionResult = await sendusdc();
      if (transactionResult.error) {
        toast("Transaction was canceled or failed.");
        return;
      }
  
      setIsSpinning(true);
      const spinSound = new Audio("/sounds/sound.mp3");
      spinSound.play();
  
      const minSpins = 5;
      const randomSpins = Math.floor(Math.random() * 5) + minSpins;
      const extraDegrees = Math.floor(Math.random() * 360);
      const totalDegrees = randomSpins * 360 + extraDegrees;
      setRotation((prev) => prev + totalDegrees);
  
      setTimeout(() => {
        const finalPosition = extraDegrees % 360;
        const sectionSize = 360 / wheelNumbers.length;
        const index = Math.floor(finalPosition / sectionSize);
        const outcome = wheelNumbers[index];
        const winAmount = selectedAmount * outcome.multiplier;
  
        spinSound.pause();
        if (outcome.multiplier === 0) {
          toast.error("Sorry, you won nothing. Try again!", {
            position: "bottom-left",
            theme: "dark",
          });
          setCanClaim(false);
        } else {
          const winnerSound = new Audio("/sounds/winner.mp3");
          winnerSound.play();
          toast.success(`🎉 You won ${winAmount} USDC!`, {
            position: "bottom-left",
            theme: "dark",
          });
          setCanClaim(true);
          
        }
        setLandedLabel(outcome.label);
        setResult(winAmount);
        setTimeout(() => setLandedLabel(null), 2000);
        setIsSpinning(false);
      }, 5000);
    } catch (error) {
      console.error("Spin error:", error);
      toast.error("Transaction failed. Please try again.");
      setIsSpinning(false);
    }
  };

  const privateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("NEXT_PUBLIC_PRIVATE_KEY is not set in environment variables.");
  }
  const sender: Keypair = Keypair.fromSecretKey(bs58.decode(privateKey));

  const handleClaim = async () => {
    if (!address) {
      throw new Error("Address is required");
    }
    setIsClaiming(true);
    try {
      const tokenMintAccount = new PublicKey(
        "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
      );
      const to = new PublicKey(address);

      const senderTokenAccount = await getAssociatedTokenAddress(
        tokenMintAccount,
        sender.publicKey,
        true
      );
      const toTokenAccount = await getAssociatedTokenAddress(
        tokenMintAccount,
        to,
        true
      );

      const tx = new Transaction();

      const toInfo = await connection.getAccountInfo(toTokenAccount);
      if (!toInfo) {
        tx.add(
          createAssociatedTokenAccountInstruction(
            sender.publicKey,
            toTokenAccount,
            to,
            tokenMintAccount
          )
        );
      }
      const mintInfo = await connection.getParsedAccountInfo(tokenMintAccount);
      const decimals =
        (mintInfo.value?.data as ParsedAccountData)?.parsed?.info?.decimals ||
        0;
      const amountInSmallestUnit = result! * Math.pow(10, decimals);

      tx.add(
        createTransferCheckedInstruction(
          senderTokenAccount,
          tokenMintAccount,
          toTokenAccount,
          sender.publicKey,
          amountInSmallestUnit,
          decimals
        )
      );

      tx.feePayer = sender.publicKey;
      const { blockhash } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;

      const txHash = await connection.sendTransaction(tx, [sender]);
      console.log("tx hash: ",txHash);
      toast.success(`Successfully claimed ${result} !`);
      setShowModal(false);
      setIsClaiming(false);
      setCanClaim(false);
      localStorage.removeItem("canClaim");
      localStorage.removeItem("result");
    } catch (error) {
      console.error(error);
      toast.error("Failed to claim tokens. Please try again.", {
        position: "bottom-left",
        theme: "dark",
      });
    } finally{
      setIsClaiming(false);
      setCanClaim(false)
      toast.dismiss("token already claimed")

    }
  };

  
  const sendusdc = async () => {
    try {
      if (!wallet) throw new Error("Wallet is not connected.");
  
      const tokenMint = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
      const to = new PublicKey("GtR7Tmu6eRpWKSpT1uspPUqVZhuGgyF4vgqqkjuzz2ZV");
  
      const senderATA = await getAssociatedTokenAddress(tokenMint, wallet, true);
      const toATA = await getAssociatedTokenAddress(tokenMint, to, true);
  
      const tx = new Transaction();
      const toInfo = await connection.getAccountInfo(toATA);
      if (!toInfo) {
        tx.add(createAssociatedTokenAccountInstruction(wallet, toATA, to, tokenMint));
      }
  
      const mintInfo = await connection.getParsedAccountInfo(tokenMint);
      const decimals = (mintInfo.value?.data as ParsedAccountData)?.parsed?.info?.decimals || 0;
      const amount = selectedAmount! * Math.pow(10, decimals);
  
      tx.add(
        createTransferCheckedInstruction(
          senderATA,
          tokenMint,
          toATA,
          wallet,
          amount,
          decimals
        )
      );
  
      const latestBlockhash = await connection.getLatestBlockhash();
      tx.recentBlockhash = latestBlockhash.blockhash;
      tx.feePayer = wallet;
  
      const signedTx = await walletProvider.signTransaction(tx);
      const signature = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: true,
      });
  
      await connection.confirmTransaction(
        {
          signature,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        },
        commitment
      );
  
      console.log("Transaction ID:", signature);
      toast.success(`Transaction ID: ${signature}`);
      return { success: true };
    } catch (err) {
      console.error("USDC transfer failed:", err);
      return { error: "Transaction failed." };
    }
  };

  return (
    <>
      <main className="relative">
        {/* <div className=" h-full w-full bg-slate-950 -z-"><div className="absolute bottom-0 left-[-20%] right-0 top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))]"></div><div className="absolute bottom-0 right-[-20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))]"></div></div> */}
        <div className=" h-full w-full bg-slate-950  ">
          <div className="absolute bottom-0 left-0 -z-10 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_100%_100%_at_100%_100%,#000_70%,transparent_100%)]"></div>
        </div>
        <ToastContainer
          position="bottom-left"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
        <main className=" w-full p-8 md:p-8 z-20">
          <header className=" justify-center flex items-center  ">
            <div className="max-w-[1350px] w-full justify-between flex items-center">
              <div>
                <Image
                  src={Logo}
                  alt="logo"
                  width={60}
                  height={50}
                  className="rounded-2xl "
                />
              </div>
              <div className="flex items-center gap-5 md:gap-10 my-10">
                <button
                  className="bg-[#F56CA0] font-bold rounded-sm border-[#000] px-4 py-2 md:px-8 md:text-[14px] text-[12px]"
                  onClick={handleConnectWallet}
                >
                  {isConnected ? shortenAddress(address) : "Connect wallet"}
                </button>

                <div className="flex items-end md:flex-row flex-col gap-3 md:gap-6">

               

                <div className="flex items-center gap-2">
                  <Image src={Logoimg} alt="usdcicon" width={20} height={20} />

                  <span className="text-[12px] md:text-[14px] font-medium">
                    {usdcBalance !== null
                      ? `${usdcBalance.toFixed(2)} USDC`
                      : "0.00 USDC"}
                  </span>
                  
                </div>

                <div className="flex items-center gap-2 opacity-70 cursor-not-allowed">
                  <Image src={Logo} alt="usdcicon" width={20} height={20} />

                  <span className="text-[12px] md:text-[14px] font-medium">
                    {usdcBalance !== null
                      ? `${100} XP`
                      : "0.00 USDC"}
                  </span>
                  
                </div>
                </div>

                
              </div>
            </div>
          </header>
          <div className="justify-center flex items-center mt-[50px]  ">
            <div className="max-w-[1350px] w-full flex gap-6 flex-col lg:flex-row items-center justify-center">
              <div className="flex flex-1 flex-col  justify-center">
                <h1
                  className={twMerge(
                    Kaijuz.className,
                    "font-bold text-[30px] md:text-[62px]  bg-gradient-to-r from-pink-400 via-[#F56CA0] to-pink-800 text-transparent bg-clip-text"
                  )}
                >
                  WAGERWISE
                </h1>
                <h3 className="opacity-80 font-bold text-[18px] md:text-[28px]">
                  Where the fun meets fortune
                </h3>
                <p className="opacity-40 text-[12px] md:text-[14px]">
                  Get a chance to win $USDC rewards of up to $100! Try your luck
                  now! 🎰✨
                </p>

                <div>
                  <Link href="https://t.me/+b9vBRdWyhPM1ODY0" target="blank">
                    <button className="bg-[#F56CA0] font-bold  px-8 my-5 py-2 rounded-sm">
                      Join Community
                    </button>
                  </Link>
                </div>
                <div className="pt-10">
                  <span className="opacity-40 text-[16px] flex items-center gap-4">
                    Powered by Solana
                    <Image
                      src={solLogo}
                      alt="solicon"
                      width={20}
                      height={20}
                      className=""
                    />{" "}
                  </span>
                </div>
              </div>

              <div className="flex-1 flex  justify-center flex-col">
                <div className="max-w-[600px] w-full">
                  <div className="flex justify-end mb-4">
                    {/* <button
                      onClick={() => setCurrentGame(currentGame === 'wheel' ? 'updown' : 'wheel')}
                      className="bg-[#F56CA0] font-bold px-4 py-2 rounded-sm text-white"
                    >
                      {currentGame === 'wheel' ? 'Next Game' : 'Previous Game'}
                    </button> */}
                  </div>
                  
                  {currentGame === 'wheel' ? (
                    <div className="max-w-[600px] w-full bg-[#FFFF] rounded-2xl p-8 md:p-8">
                      <div className="">
                        <div className="flex justify-between items-center">
                         <div>
                         <h1 className="font-bold md:text-[24px] text-[18px] text-[#000]">
                          Spin the wheel
                        </h1>
                        <p className="text-[14px] opacity-40 text-[#000]">
                          By wagerwise
                        </p>
                         </div>
                         {landedLabel && (
                        <span className="text-white bg-[#F56CA0] px-3 py-1 font-semibold text-30px">{landedLabel}</span>  )}
                        </div>
                        
                        <div className=" py-5 my-4  rounded-xl justify-center flex items-center ">
                          <SpinWheel
                            rotation={rotation}
                            isSpinning={isSpinning}
                          />
                        </div>
                        <div>
                          <span className="text-[#000] text-[16px]  opacity-60 font-medium">
                            Select amount : 
                          </span>
                          <div className="flex items-center gap-6 flex-wrap my-4 justify-between">
                            {[0.2, 0.5, 1.0, 2.0].map((amount) => (
                              <button
                                key={amount}
                                onClick={() => setSelectedAmount(amount)}
                                className={`bg-[#F56CA0] font-bold w-[100px] py-2 rounded-lg flex items-center gap-1 justify-center ${
                                  selectedAmount === amount ? "opacity-70" : ""
                                }`}
                              >
                                <Image
                                  src={Logoimg}
                                  alt="Logo"
                                  width={20}
                                  height={20}
                                />
                                ${amount}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    null
                    // <UpDownGame />
                  )}

                  <div className="flex justify-between gap-6 items-center">
                    <button
                      onClick={handleSpin}
                      disabled={!selectedAmount || isSpinning || canClaim}
                      className={`bg-[#F56CA0] font-bold px-4 md:text-[18px] text-[12px] my-5 py-2 w-full transition-opacity duration-200 rounded-sm ${
                        !selectedAmount || isSpinning || canClaim
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:opacity-90"
                      }`}
                    >
                      {isSpinning ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-white border-solid"></span>
                          Spinning...
                        </span>
                      ) : canClaim ? (
                        "Claim first"
                      ) : (
                        "Click to play"
                      )}
                    </button>
                    <button
                      onClick={handleClaim}
                      disabled={isClaiming || !canClaim}
                      className={` font-bold   py-2 md:text-[18px] text-[12px]  bg-[#ea4c89] text-white rounded-sm w-full flex items-center justify-center gap-2 ${
                        isClaiming || !canClaim
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:opacity-90"
                      }`}
                    >
                      {isClaiming ? (
                        <>
                          <span className="animate-spin font-bold  rounded-full h-5 w-5 border-t-2 border-white border-solid"></span>
                          Claiming...
                        </>
                      ) : (
                        "Claim Tokens"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </main>
    </>
  );
}
