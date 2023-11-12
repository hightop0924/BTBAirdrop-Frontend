import Reveal from "react-awesome-reveal";
import { fadeInUp } from "../utils/constants";
import { formatNumber, numberWithCommas } from "../utils/methods";
import { formatGwei } from "viem";
import { useEffect, useState } from "react";

import TokenABI from "../wagmi-interaction/tokenABI.json";
import { readContract } from '@wagmi/core'
import { useSelector } from "react-redux";
import { FiExternalLink } from "react-icons/fi";
import { FaEthereum } from "react-icons/fa";

export default function TotalValueLocked({ }) {
  const refreshFlag = useSelector(state => state.staking.refreshFlag);

  const [tokenTvl, setTokenTvl] = useState(0);

  const readWalletDoshiBalance = async () => {

    const data = await readContract({
      address: process.env.REACT_APP_BTB_TOKEN_CONTRACT_ADDRESS,
      abi: TokenABI,
      functionName: 'balanceOf',
      args: [process.env.REACT_APP_BTB_STAKING_CONTRACT_ADDRESS],
      formatUnits: 'gwei',
      chainId: 1
    })

    setTokenTvl(data !== undefined && formatGwei(data));

  }

  useEffect(() => {
    readWalletDoshiBalance();
  }, [refreshFlag])

  return (
    <div className="overflow-hidden relative min-h-[350px] bg-custom-light-white border-custom-medium-white  md:col-span-2  border-[1px] rounded-3xl pt-20 flex flex-col items-center justify-center pb-10">
      <img
        src="/Cloud_Vector.svg"
        className="w-[163px] h-[81px] absolute  -right-5 -top-5 "
        alt=""
      />
      <div className="absolute top-5 left-5">
        <a className="text-gray-300 hover:text-white text-[12px] group font-semibold flex items-center gap-2 " target="_blank" rel="noreferrer"
          href={`https://goerli.etherscan.io/address/${process.env.REACT_APP_BTB_STAKING_CONTRACT_ADDRESS}`}
        >View on Etherscan <FiExternalLink className="text-gray-300 hover:text-white group-hover:text-white w-[12px] h-[12px]" /></a>
      </div>
      <Reveal keyframes={fadeInUp} className='onStep' delay={0} duration={800} triggerOnce>
        <div className="flex flex-col">
          <div className="flex gap-2 items-center">
            <img
              src="/tvl/tvl.svg"
              className="w-[30px] h-[30px]"
              alt="tvl icon"
            />
            <div className="text-[26px] font-semibold">Total Value Locked</div>
          </div>
          <div className="text-[42px] font-semibold">
            ${numberWithCommas(tokenTvl * process.env.REACT_APP_BTB2USDT_RATE)}
          </div>
        </div>
        <div className="pt-10 flex flex-wrap w-full justify-center gap-10">
          <div className="flex flex-col min-w-[65px]  ">
            <div className="text-[15px] font-semibold">{formatNumber(tokenTvl)}</div>
            <div className="text-[15px] font-semibold ">DOSHI</div>
          </div>
          <div className="flex flex-col min-w-[65px]   items-center">
            <div className="text-[15px] font-semibold">{formatNumber(tokenTvl * process.env.REACT_APP_BTB2USDT_RATE)}</div>
            <div className="text-[15px] font-semibold flex items-center gap-1">
              <img
                src="/tvl/usdt.svg"
                className="w-[20px] h-[20px]"
                alt="usdt icon"
              />
              <div className="">USDT</div>
            </div>
          </div>
          <div className="flex flex-col min-w-[65px]   items-center">
            <div className="text-[15px] font-semibold">{formatNumber(tokenTvl * process.env.REACT_APP_USDT2ETH_RATE)}</div>
            <div className="text-[15px] font-semibold flex items-center gap-1">
              <FaEthereum className="text-white w-[20px] h-[20px]" />
              <div className="">ETH</div>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
