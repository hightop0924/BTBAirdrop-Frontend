import TotalValueLocked from "../components/TotalValueLocked";
import Performance from "../components/Performance";
import History from "../components/History";
import PrimaryButton from "../components/buttons/PrimaryButton";
import { useEffect, useRef, useState } from "react";
import { Reveal } from 'react-awesome-reveal';
import { BTN_HEIGHT_IN_MAIN_AREA, BTN_WIDTH_IN_MAIN_AREA, fadeInRight, fadeInUp } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import {
  useAccount,
  useConnect,
  useNetwork,
  useWalletClient
} from "wagmi";
import StakingABI from "../wagmi-interaction/platformContractABI.json";

import { readContracts } from '@wagmi/core';
import { daysUntilWithdrawal } from "../utils/methods";
import { formatGwei, parseGwei } from "viem";
import { Backdrop, CircularProgress } from "@mui/material";
import { getTransactionReceipt, publicClient } from "../wagmi-interaction/client";
import { setRefreshFlag } from "../redux-toolkit/reducers/Staking";
import TokenABI from "../wagmi-interaction/tokenABI.json";
import { toast } from "react-toastify";

export default function Claim({ className }) {
  const dispatch = useDispatch();
  const refreshFlag = useSelector(state => state.staking.refreshFlag);
  const [poolIndex, setPoolindex] = useState(0);
  const poolsData = useSelector(state => state.staking.poolsData);
  const { address, isConnected } = useAccount();
  const [userStakedInfo2Pool, setUserStakedInfo2Pool] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);
  const { data: connectionData } = useConnect();
  const [userRewardAmount, setUserRewardAmount] = useState(0);
  const [claimingAmount, setClaimingAmount] = useState(0);
  const [working, setWorking] = useState(false);
  const [claimTxHash, setClaimTxHash] = useState("");
  const { data: walletClient } = useWalletClient();
  const { chain } = useNetwork();
  const [showSuccessContent, setShowSuccessContent] = useState(false);
  const [doshiWalletBalance, setDoshiWalletBalance] = useState(0);

  const readUserStakedAmount = async () => {
    try {

      const data = await readContracts({
        contracts: [{
          address: process.env.REACT_APP_DOSHI_STAKING_CONTRACT_ADDRESS,
          abi: StakingABI,
          functionName: 'getUserPoolInfo',
          args: [address, poolIndex],
          formatUnits: 'gwei',
          chainId: connectionData?.chain?.id,
        },
        {
          address: process.env.REACT_APP_DOSHI_STAKING_CONTRACT_ADDRESS,
          abi: StakingABI,
          functionName: 'getRewards',
          args: [address, poolIndex],
          chainId: connectionData?.chain?.id,
        },
        {
          address: process.env.REACT_APP_DOSHI_TOKEN_CONTRACT_ADDRESS,
          abi: TokenABI,
          functionName: 'balanceOf',
          args: [address],
          formatUnits: 'gwei',
          chainId: connectionData?.chain?.id,
        }
        ]
      }
      );
      setUserStakedInfo2Pool(data[0] !== undefined && data[0] !== null && data[0]["result"]);
      console.log("remained reward >>> ", formatGwei(data[1]["result"]));
      setUserRewardAmount(data[1] !== undefined && data[1] !== null && formatGwei(data[1]["result"]));

      setDoshiWalletBalance(data[2] !== undefined && formatGwei(data[2]["result"]));

    } catch (err) {
      console.log(err);
    }
  }


  const toggleSelectBox = () => {
    setIsOpen(!isOpen);
  };
  const closeSelectBox = (e) => {
    if (selectRef.current && !selectRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  };
  useEffect(() => {
    readUserStakedAmount();

    window.addEventListener('click', closeSelectBox);
    return () => {
      window.removeEventListener('click', closeSelectBox);
    };
  }, []);

  const RenderSuccessContents = (label, txHash) => {
    return <Reveal keyframes={fadeInUp} className='onStep' delay={0} duration={800} triggerOnce>
      <div>
        {label}
        <div className="underline text-[12px] ">
          <a href={`https://goerli.etherscan.io/tx/${txHash}`} target="_blank" rel="noreferrer" >View on Goerli Etherscan</a>
        </div>
      </div>
    </Reveal >
  }

  useEffect(() => {

    readUserStakedAmount();
  }, [poolIndex, address])

  useEffect(() => {
    ; (async () => {

      if (claimTxHash) {

        setTimeout(async () => {
          try {
            const receipt = await getTransactionReceipt(claimTxHash);
            console.log(receipt);
            setShowSuccessContent(true);
            setClaimingAmount(0);
            dispatch(setRefreshFlag(!refreshFlag));
            setWorking(false);
            setTimeout(() => {
              setShowSuccessContent(false);
              setClaimTxHash(null);
              readUserStakedAmount();
            }, 5000);

          } catch (err) {
            setClaimTxHash(null);
            setWorking(false);
            console.log(err);
          }
        }, 3000);
      }
    })()
  }, [claimTxHash])


  const onClickClaim = async () => {
    if (isConnected) {
      if (chain.id !== 5) {
        toast.warning("Please change the network of your wallet into goerli and try again. DOSHI staking platform works on Goerli network.");
        return;
      }
    } else {
      toast.warning("Connect your wallet!");
      return;
    }
    if (claimingAmount <= 0) {
      toast.warning("Please input valid amount and try again.");
      setWorking(false);
      return;
    }
    try {
      setWorking(true);
      const data = await readContracts({
        contracts: [
          {
            address: process.env.REACT_APP_DOSHI_STAKING_CONTRACT_ADDRESS,
            abi: StakingABI,
            functionName: 'getUserPoolInfo',
            args: [address, poolIndex],
            formatUnits: 'gwei',
            chainId: connectionData?.chain?.id,
            wallet: address
          }, {
            address: process.env.REACT_APP_DOSHI_STAKING_CONTRACT_ADDRESS,
            abi: StakingABI,
            functionName: 'getRewards',
            args: [address, poolIndex],
            chainId: connectionData?.chain?.id,
            wallet: address
          }
        ]
      });
      setUserStakedInfo2Pool(data[0] !== undefined && data[0] !== null && data[0]["result"]);

      setUserRewardAmount(data[1] !== undefined && data[1] !== null && formatGwei(data[1]["result"]));

      if (claimingAmount > parseFloat(formatGwei(data[1]["result"]))) {
        toast.warning("Amount cannot exceeds the reward amount. Please input value again and retry.");
        setWorking(false);
        return;
      }
      if (!data || !data[0] || !data[1] || parseFloat(formatGwei(data[1]["result"])) <= 0) {
        toast.warning("There is not withdrawable rewards.");
        setWorking(false);
        return;
      }

      if (parseFloat(formatGwei(data[1]["result"])) > 0) {

        const claimingHs = await walletClient.writeContract({
          address: process.env.REACT_APP_DOSHI_STAKING_CONTRACT_ADDRESS,
          abi: StakingABI,
          functionName: 'withdraw',
          args: [parseInt(poolIndex), parseGwei(claimingAmount)],
          chainId: connectionData?.chain?.id
        });

        setClaimTxHash(claimingHs);
      }

    } catch (err) {
      setWorking(false);
      console.log("claiming err >>> ", err);

    }
  }

  return (
    <div className={`${className} flex flex-col text-white `}>
      <div className="w-full grid grid-cols-1 md:grid-cols-5 gap-10">
        <div
          className="col-span-1  md:col-span-3   
        "
        >
          <Reveal keyframes={fadeInRight} className='onStep' delay={0} duration={800} triggerOnce>
            <div
              className="overflow-hidden relative min-h-[350px] bg-custom-light-white border-custom-medium-white  border-[1px] rounded-3xl
          flex flex-col flex-wrap pt-5 w-full justify-center gap-5 
        "
            >
              <div className="text-[26px] font-semibold ml-5 pr-10 text-left w-full flex justify-between">
                <div className="">Claim Your Staking Rewards</div>
                <div className="">APY: {poolsData[poolIndex]?.apy}</div>
              </div>
              <div className="flex justify-between border-b-[1px] h-[40px] ml-5 mr-10  border-b-custom-medium-white ">
                <div className="text-[16px] md:text-[22px] font-semibold">
                  Lock Period
                </div>
                <div className="text-[16px] font-semibold w-[150px] text-left">
                  <div className=" relative " ref={selectRef}>
                    <button
                      onClick={toggleSelectBox}
                      className="  hover:border-b hover:border-custom-medium-white flex items-center justify-between"
                    >
                      {poolsData[poolIndex]?.period} Months
                      <span className={`ml-2 transform ${isOpen ? 'rotate-180' : ''} transition-transform`}>
                        ▼
                      </span>
                    </button>
                    {isOpen && (
                      <div className=" top-full left-0 right-0 border bg-[#3a2758] border-gray-500 rounded"
                        style={{ zIndex: 100, position: "absolute" }}
                      >
                        {poolsData.map((option, index) => (
                          <div
                            key={index}
                            className="px-4 py-2 hover:bg-custom-heavy-white text-gray-500 hover:text-white"
                            onClick={() => {
                              setIsOpen(false);
                              setPoolindex(index);
                            }}
                          >
                            {option?.period} Months
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-between border-b-[1px] h-[40px] ml-5 mr-10  border-b-custom-medium-white">
                <div className="text-[16px] md:text-[22px] font-semibold">
                  Days To Maturity
                </div>
                <div className="text-[16px] font-semibold w-[150px] text-left">
                  {
                    (userStakedInfo2Pool && parseInt(userStakedInfo2Pool?.startTime) > 0) ?
                      daysUntilWithdrawal(Date.now(), parseInt(userStakedInfo2Pool?.startTime) * 1000 + parseInt(poolsData[poolIndex]?.period) * 30.5 * 24 * 3600 * 1000) : 0} Days
                </div>
              </div>
              <div className="flex justify-between border-b-[1px] h-[40px] ml-5 mr-10  border-b-custom-medium-white">
                <div className="text-[16px] md:text-[22px] font-semibold">
                  Withdrawal Date
                </div>
                <div className="text-[16px] font-semibold w-[150px] text-left">
                  {
                    (userStakedInfo2Pool && parseInt(userStakedInfo2Pool?.startTime) > 0) ? new Date(parseInt(userStakedInfo2Pool?.startTime) * 1000 + parseInt(poolsData[poolIndex]?.period) * 30.5 * 24 * 3600 * 1000).toDateString() : "Never"
                  }
                </div>
              </div>
              <div className="flex justify-between  ml-5 mr-10  h-[40px] ">
                <div className="text-[16px] md:text-[22px] font-semibold">
                  Free Withdrawals Left
                </div>
                <div className="text-[16px] font-semibold w-[150px] text-left">
                  {
                    (userStakedInfo2Pool && parseInt(userStakedInfo2Pool?.startTime) > 0) ?
                      (isNaN(3 - parseInt(userStakedInfo2Pool?.claimNum)) === false && (3 - parseInt(userStakedInfo2Pool?.claimNum)) > 0) ?
                        3 - parseInt(userStakedInfo2Pool?.claimNum) : 0
                      : 0
                  }
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        <TotalValueLocked />
        <div
          className="overflow-hidden relative h-[400px]  md:col-span-3 
          flex flex-col w-full justify-between 
        "
        >
          <Reveal keyframes={fadeInRight} className='onStep' delay={0} duration={800} triggerOnce>
            <div className="h-[400px]  text-white border-[1px]  bg-custom-light-white rounded-3xl border-custom-medium-white flex flex-col gap-5">
              <div className="px-10 pt-10 flex w-full justify-between text-gray-300 text-[16px] font-semibold">
                <div className="flex">Available: {Math.floor(userRewardAmount)} DOSHI </div>
                <div className="z-0">Min: {1} DOSHI </div>
              </div>
              <div className="flex justify-center ">
                <div className="text-white border-[1px] bg-custom-heavy-white h-[60px] w-[calc(100%-60px)] rounded-lg border-custom-medium-white flex justify-between px-10 items-center">
                  <div className="flex flex-col items-start">
                    <input
                      className="text-[21px] font-normal bg-transparent outline-none  max-w-[150px]"
                      size="10"
                      value={Math.floor(claimingAmount)}
                      type="number"
                      onChange={(e) => setClaimingAmount(e.target.value)}
                      min={0}
                      max={userRewardAmount}
                    ></input>
                    <div className="text-[10px] text-gray-300 font-semibold text-start">
                      Fee/Tax: {((userStakedInfo2Pool && parseInt(userStakedInfo2Pool?.startTime) > 0) ?
                        isNaN(parseInt(userStakedInfo2Pool?.claimNum)) === false ?
                          parseInt(userStakedInfo2Pool?.claimNum) - 3 > 0 : false
                        : false) === true ? "20%" : "0%"}
                    </div>
                  </div>

                </div>
              </div>
              <div className="pb-12">
                <PrimaryButton
                  label={"Withdraw"}
                  onClick={() => onClickClaim()}
                  width={BTN_WIDTH_IN_MAIN_AREA}
                  height={BTN_HEIGHT_IN_MAIN_AREA}
                />

                {claimTxHash && showSuccessContent && RenderSuccessContents("Successfully claimed!", claimTxHash)}
              </div>
              <div className="border-t-[1px] border-t-custom-medium-white pt-5 px-10 ">
                <div className="flex gap-2 items-center">
                  <div className="text-[16px] md:text-[22px]  font-semibold">
                    Last Withdrawal:
                  </div>
                  <div className="text-[18px] md:text-[20px] font-semibold">{
                    (userStakedInfo2Pool && parseFloat(formatGwei(userStakedInfo2Pool?.lastClaimAmount)) > 0) ?
                      parseFloat(formatGwei(userStakedInfo2Pool?.lastClaimAmount))?.toFixed(2) : "0.00"} DOSHI</div>
                </div>
              </div>
            </div>

          </Reveal>
        </div>

        <Performance className="h-[400px]" />
        <History />
      </div>

      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={working}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
}
