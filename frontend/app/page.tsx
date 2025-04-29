"use client";
import localFont from "next/font/local";
import Image from "next/image";
import { twMerge } from "tailwind-merge";
import Logoimg from "@/public/assets/usdc.png";
import Logo from "@/public/assets/logo.png";
import solLogo from "@/public/assets/png.png";
import SpinWheel, { wheelNumbers } from "./components/SpinWheel";
import { useState, useEffect } from "react";
import { useAppKit, useAppKitAccount} from '@reown/appkit/react';
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";
import Link from "next/link";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { claimSonic } from "./actions/claimUsdc";
import { sendUsdc } from "./actions/sendUsdc";


const Kaijuz = localFont({ src: "../fonts/center.otf" });
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
  
  const USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");

  useEffect(() => {
    if (!address) return;

    const connection = new Connection(
      "https://mainnet.helius-rpc.com/?api-key=c7e5b412-c980-4f46-8b06-2c85c0b4a08d",
      "confirmed"
    );

    const fetchUSDCBalance = async () => {
      try {
        const wallet = new PublicKey(address);
        const tokenAccount = await getAssociatedTokenAddress(
          USDC_MINT,
          wallet
        );

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

  const handleConnectWallet = async () => {
    open();
   
  };

  const shortenAddress = (address: string | undefined) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleSpin = async () => {
    if (!selectedAmount || isSpinning || canClaim) return;

    setIsSpinning(true);
    
    try {
      const transactionResult = await sendUsdc({
        fromAddress: address!,
        betAmount: selectedAmount
      });

      if (!transactionResult.success) {
        toast.error("Transaction failed");
        setIsSpinning(false);
        return;
      }

     

      // Continue with spin logic if transaction succeeds
      const spinSound = new Audio("/sounds/sound.mp3");
      spinSound.play();

      const minSpins = 5;
      const randomSpins = Math.floor(Math.random() * 5) + minSpins;
      const extraDegrees = Math.floor(Math.random() * 360);
      const totalDegrees = randomSpins * 360 + extraDegrees;
      
      setRotation(prevRotation => prevRotation + totalDegrees);

      setTimeout(() => {
        const finalPosition = extraDegrees;
        const sectionSize = 360 / wheelNumbers.length;
        const sectionIndex = Math.floor(finalPosition / sectionSize);
        const result = wheelNumbers[sectionIndex];
        const winAmount = selectedAmount * result.multiplier;

        spinSound.pause();
        const winnerSound = new Audio("/sounds/winner.mp3");

        if (result.multiplier === 0) {
          toast.error('Sorry, you won nothing. Try again!', {
            position: "bottom-left",
            theme: "dark",
          });
          setCanClaim(false);
        } else {
          winnerSound.play();
          toast.success(`🎉 Congratulations! You won ${winAmount} USDC!`, {
            position: "bottom-left",
            theme: "dark",
          });
          setCanClaim(true);
        }

        setResult(winAmount);
        setShowModal(true);
        setIsSpinning(false);
      }, 5000);
    } catch (error) {
      console.error("Transaction failed:", error);
      toast.error("Transaction failed. Please try again.");
      setIsSpinning(false);
    }
  };

  const handleClaim = async () => {
    if (!result || !address || !canClaim) return;

    setIsClaiming(true);
    try {
      const response = await claimSonic({
        result,
        walletAddress: address,
      });

      if (response.success) {
        toast.success('🎉 Tokens claimed successfully!', {
          position: "bottom-left",
          theme: "dark",
        });
        setCanClaim(false);
        setShowModal(false);
      } else {
        toast.error(response.error || 'Failed to claim tokens. Please try again.', {
          position: "bottom-left",
          theme: "dark",
        });
      }
    } catch (error) {
      console.error( error);
      toast.error('Failed to claim tokens. Please try again.', {
        position: "bottom-left",
        theme: "dark",
      });
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <>
      <main className="relative">
      <div className=" h-full w-full bg-slate-950  ">
        <div className="absolute bottom-0 left-0 -z-10 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_100%_100%_at_100%_100%,#000_70%,transparent_100%)]">
          </div></div>
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
              <Image src={Logo} alt='logo' width={60} height={50} className="rounded-2xl "/>


              </div>
              <div className="flex items-center gap-5 md:gap-10 my-10">

                <button className="bg-[#F56CA0] font-bold rounded-sm border-[#000] px-4 py-2 md:px-8 md:text-[14px] text-[12px]" onClick={handleConnectWallet}>
                  {isConnected ? shortenAddress(address) : "Connect wallet"}
                </button>

                <div className="flex items-center gap-2">
                  <Image src={Logoimg} alt="usdcicon" width={20} height={20} />

                  <span className="text-[12px] md:text-[14px] font-medium">
                    {usdcBalance !== null ? `${usdcBalance.toFixed(2)} USDC` : "0.00 USDC"}
                  </span>
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
                  Where the fun meets  fortune
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
                  <span className="opacity-40 text-[16px] flex items-center gap-4">Powered by Solana 

                    <Image src={solLogo} alt="solicon" width={20} height={20} className=""/>              </span>
                 
                </div>
              </div>

              <div className="flex-1 flex  justify-center flex-col">
                <div className="max-w-[600px] w-full">

                
                <div className="max-w-[600px] w-full   bg-[#FFFF] rounded-2xl  p-8 md:p-8 ">
                  <div className="">
                    <h1 className="font-bold md:text-[24px] text-[18px] text-[#000]">
                      Spin the wheel
                    </h1>
                    <p className="text-[14px] opacity-40 text-[#000]">
                      By wagerwise
                    </p>
                    <div className=" py-5 my-4  rounded-xl justify-center flex items-center ">
                      <SpinWheel rotation={rotation} isSpinning={isSpinning} />
                    </div>
                    <div>
                      <span className="text-[#000] text-[16px]  opacity-60 font-medium">
                        Select amount :
                      </span>
                      <div className="flex items-center gap-6 flex-wrap my-4 justify-center">
                        {[0.1, 0.2, 0.3, 0.4].map((amount) => (
                          <button
                            key={amount}
                            onClick={() => setSelectedAmount(amount)}
                            className={`bg-[#F56CA0] font-bold px-6 py-2 rounded-lg flex items-center gap-1  ${
                              selectedAmount === amount ? 'opacity-70' : ''
                            }`}
                          >
                            <Image src={Logoimg} alt="Logo" width={20} height={20} />
                            ${amount}
                          </button>
                        ))}
                      </div>
                    </div>
                    

                    
                  </div>
                </div>

                <div className="flex justify-between gap-6 items-center">
                <button
                      onClick={handleSpin}
                      disabled={!selectedAmount || isSpinning || canClaim}
                      className={`bg-[#F56CA0] font-bold px-4 md:text-[18px] text-[12px] my-5 py-2 w-full transition-opacity duration-200 rounded-sm ${
                        !selectedAmount || isSpinning || canClaim ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                      }`}
                    >
                      {isSpinning ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-white border-solid"></span>
                          Spinning...
                        </span>
                      ) : canClaim ? (
                        'Claim first'
                      ) : (
                        'Click to play'
                      )}
                    </button>
                  <button
                    onClick={handleClaim}
                    disabled={isClaiming || !canClaim}
                    className={` font-bold   py-2 md:text-[18px] text-[12px]  bg-[#ea4c89] text-white rounded-sm w-full flex items-center justify-center gap-2 ${
                      isClaiming || !canClaim ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                    }`}
                  >
                    {isClaiming ? (
                      <>
                        <span className="animate-spin font-bold  rounded-full h-5 w-5 border-t-2 border-white border-solid"></span>
                        Claiming...
                      </>
                    ) : (
                      'Claim Tokens'
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
