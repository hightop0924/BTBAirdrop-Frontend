import Reveal from "react-awesome-reveal";
import { fadeInUp } from "../utils/constants";
import StakingABI from "../wagmi-interaction/platformContractABI.json";
import { useEffect, useState } from "react";

import { readContracts } from '@wagmi/core'
import { formatGwei, parseGwei } from "viem";
import { formatNumber } from "../utils/methods";
import { useDispatch, useSelector } from "react-redux";
import { setPoolsAmounts } from "../redux-toolkit/reducers/Staking";

export default function Performance({ className }) {
  const refreshFlag = useSelector(state => state.staking.refreshFlag);

  const dispatch = useDispatch();
  const [poolsData0, setPoolsData0] = useState(0);
  const [poolsData1, setPoolsData1] = useState(0);
  const [poolsData2, setPoolsData2] = useState(0);
  const [poolsData3, setPoolsData3] = useState(0);
  const [maxPool, setMaxPool] = useState(0);

  const readWalletDoshiBalance = async () => {
    try {
      const data = await readContracts({
        contracts: [{
          address: process.env.REACT_APP_BTB_STAKING_CONTRACT_ADDRESS,
          abi: StakingABI,
          functionName: 'poolData',
          args: [0]
        },
        {
          address: process.env.REACT_APP_BTB_STAKING_CONTRACT_ADDRESS,
          abi: StakingABI,
          functionName: 'poolData',
          args: [1]
        },
        {
          address: process.env.REACT_APP_BTB_STAKING_CONTRACT_ADDRESS,
          abi: StakingABI,
          functionName: 'poolData',
          args: [2]
        },
        {
          address: process.env.REACT_APP_BTB_STAKING_CONTRACT_ADDRESS,
          abi: StakingABI,
          functionName: 'poolData',
          args: [3]
        }
        ]
      })
      setPoolsData0(formatGwei(data[0]["result"][2]?.toString()));

      setPoolsData1(formatGwei(data[1]["result"][2]?.toString()));

      setPoolsData2(formatGwei(data[2]["result"][2]?.toString()));

      setPoolsData3(formatGwei(data[3]["result"][2]?.toString()));

      let maxValue = Math.max(parseFloat(data[0]["result"][2]), parseFloat(data[1]["result"][2]), parseFloat(data[2]["result"][2]), parseFloat(data[3]["result"][2]));
      setMaxPool(formatGwei(maxValue?.toString()));
      dispatch(setPoolsAmounts([parseFloat(data[0]["result"][2]), parseFloat(data[1]["result"][2]), parseFloat(data[2]["result"][2]), parseFloat(data[3]["result"][2])]));
    } catch (err) {
      console.log(err);
    }
  }


  useEffect(() => {
    readWalletDoshiBalance();
  }, [refreshFlag])

  return (
    <div
      className={`${className} overflow-hidden relative  bg-custom-light-white border-custom-medium-white  md:col-span-2  border-[1px] rounded-3xl`}
    >

      <img
        src="/Cloud_Vector.svg"
        className="w-[163px] h-[81px] absolute -right-5 -top-5 "
        alt=""
      />

      <Reveal keyframes={fadeInUp} className='onStep' delay={0} duration={800} triggerOnce>
        <div className="text-[26px] font-semibold mt-5 ml-5 text-left">
          Performance
        </div>
        <div className="text-[12px] text-gray-300 font-semibold mt-1 ml-5 text-left">
          (Locked DOSHI)
        </div>
        <div className=" w-full  h-[160px]  gap-1 md:gap-4 px-10 mt-2  items-end
        grid grid-cols-4 
      ">
          <div className="col-span-1 flex flex-col items-center  ">
            {formatNumber(poolsData0)}
            <div className={`w-full max-w-[72px]  rounded-t-lg bg-custom-yellow `}
              style={{ height: poolsData0 > 0 ? Math.floor(poolsData0 / maxPool * 160) + "px" : "1px" }}
            ></div>
            <div className="text-center">a</div>
          </div>
          <div className="col-span-1 flex flex-col items-center  ">
            {formatNumber(poolsData1)}
            <div className={`w-full max-w-[72px] rounded-t-lg bg-custom-blue `}
              style={{ height: poolsData1 > 0 ? Math.floor(poolsData1 / maxPool * 160) + "px" : "1px" }}
            ></div>
            <div className="text-center">b</div>
          </div>

          <div className="col-span-1  flex flex-col items-center  ">
            {formatNumber(poolsData2)}
            <div className={`w-full max-w-[72px] rounded-t-lg bg-custom-green `}
              style={{ height: poolsData2 > 0 ? Math.floor(poolsData2 / maxPool * 160) + "px" : "1px" }}
            ></div>
            <div className="text-center">c</div>
          </div>

          <div className="col-span-1 flex flex-col items-center  ">
            {formatNumber(poolsData3)}
            <div className={` w-full max-w-[72px] rounded-t-lg bg-custom-red `}
              style={{ height: poolsData3 > 0 ? Math.floor(poolsData3 / maxPool * 160) + "px" : "1px" }}
            ></div>
            <div className="">d</div>
          </div>
        </div>
        <div className="flex mt-14 justify-center pb-5 md:pb-0">
          <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2 md:gap-4 md:justify-center ">
            <div className="flex gap-2">
              <div className="bg-custom-yellow w-[22px] h-[22px] rounded-[4px] text-[12px] font-semibold text-white flex justify-center items-center">
                a
              </div>
              <div className="">3 months</div>
            </div>
            <div className="flex gap-2">
              <div className="bg-custom-blue w-[22px] h-[22px] rounded-[4px] text-[12px] font-semibold text-white flex justify-center items-center">
                b
              </div>
              <div className="">5 months</div>
            </div>
            <div className="flex gap-2">
              <div className="bg-custom-green w-[22px] h-[22px] rounded-[4px] text-[12px] font-semibold text-white flex justify-center items-center">
                c
              </div>
              <div className="">8 months</div>
            </div>
            <div className="flex gap-2">
              <div className="bg-custom-red w-[22px] h-[22px] rounded-[4px] text-[12px] font-semibold text-white flex justify-center items-center">
                d
              </div>
              <div className="">12 months</div>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
