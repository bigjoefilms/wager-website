"use client"
import Image from 'next/image'
import React,{useState,useEffect} from 'react'
import logoImg from "@/public/assets/logo.png";
import { useAppKitAccount } from '@reown/appkit/react';
// import { Commitment, Connection,  PublicKey } from "@solana/web3.js";
import Link from 'next/link';

// Define the type for leaderboard entries
interface LeaderboardEntry {
    wallet: string;
    points: number;
    sonic: number;
}

const Leaderboard = () => {
    const [user] = useState<{ name?: string; email?: string; avatar?: string } | null>(null);
    const { address, isConnected } = useAppKitAccount();
    // const [, setBalance] = useState<number | null>(null);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  
    const filteredData = leaderboardData
      .slice(0, 50)
      .filter((entry) => entry.wallet.toLowerCase().includes(search.toLowerCase()));
  
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const currentData = filteredData.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  
    const nextPage = () => {
      if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };
  
    const prevPage = () => {
      if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

   

      const shortenAddress = (address: string | undefined) => {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
      };
    
    
      
      const handleConnectWallet = async () => {
        open();
       
      };

      useEffect(() => {
        const data = [
          { wallet: "F1k2g3h4j5l6m7n8o9p0q1r2s3t4u5v6", points: 120, sonic: 50 },
          { wallet: "A1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6", points: 98, sonic: 30 },
          { wallet: "X1y2z3a4b5c6d7e8f9g0h1i2j3k4l5m6", points: 75, sonic: 20 },
          ...Array.from({ length: 47 }, (_, i) => ({
            wallet: `W${i + 4}x${i + 5}y${i + 6}z${i + 7}a${i + 8}`,
            points: Math.floor(Math.random() * 200),
            sonic: Math.floor(Math.random() * 100)
          }))
        ];
        setLeaderboardData(data);
      }, []);
     
  return (
    <div>
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

        
        <Link href='/'><button className="px-[25px] py-[12px] border rounded-3xl bg-[#000000] cursor-pointer font-semibold text-[#f56ca0] hover:bg-[#383737]">Play game</button></Link>

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

      <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-center text-[#f56ca0] mb-4">
       Leaderboard
      </h2>
      <input
        type="text"
        placeholder="Search by Wallet Address..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 pl-4 mb-4 border border-[#f56ca0]  focus:outline-none focus:ring-2 focus:ring-[#f56ca0] rounded-3xl"
      />
      <div className="overflow-x-auto ">
        <table className="w-full border-collapse border border-[#f56ca0] rounded-3xl">
          <thead>
            <tr className="bg-[#f56ca0] text-white">
              <th className="p-2 text-left">S/N</th>
              <th className="p-2 text-left">Wallet Address</th>
              <th className="p-2 text-left">Points Won</th>
              <th className="p-2 text-left">$SONIC Won</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((entry, index) => (
              <tr
                key={index}
                className="border-b border-[#f56ca0] hover:bg-[#f56ca0]/20"
              >
                <td className="p-2">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                <td className="p-2 font-mono">
                  {entry.wallet.slice(0, 5)}...{entry.wallet.slice(-5)}
                </td>
                <td className="p-2">{entry.points}</td>
                <td className="p-2">{entry.sonic} $SONIC</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between mt-4">
        <button
          onClick={prevPage}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-[#f56ca0] text-white  disabled:opacity-50 rounded-3xl"
        >
          Previous
        </button>
        <span className="px-4 py-2">Page {currentPage} of {totalPages}</span>
        <button
          onClick={nextPage}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-[#f56ca0] text-white  disabled:opacity-50 rounded-3xl"
        >
          Next
        </button>
      </div>
    </div>
    </div>
  )
}

export default Leaderboard