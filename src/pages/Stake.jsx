import TotalValueLocked from "../components/TotalValueLocked";
import Performance from "../components/Performance";
import History from "../components/History";
import PrimaryButton from "../components/buttons/PrimaryButton";
import {
  BTN_HEIGHT_IN_MAIN_AREA,
  BTN_WIDTH_IN_MAIN_AREA,
  fadeInRight,
  fadeInUp,
} from "../utils/constants";
import { useEffect, useRef, useState } from "react";
import Reveal from "react-awesome-reveal";
import { useDebounce } from 'use-debounce';
import {
  useAccount,
  useConnect,
  useNetwork,
  useWalletClient,
} from 'wagmi';
import StakingABI from "../wagmi-interaction/platformContractABI.json";
import TokenABI from "../wagmi-interaction/tokenABI.json";
import { formatGwei, parseGwei } from "viem";
import { readContract } from '@wagmi/core'
import { useDispatch, useSelector } from "react-redux";
import { calculateDoshiRewards } from "../utils/methods";
import { getTransactionReceipt } from "../wagmi-interaction/client";
import { Backdrop, CircularProgress } from "@mui/material";
import { setRefreshFlag } from "../redux-toolkit/reducers/Staking";
import { toast } from "react-toastify";


export default function Stake({ className }) {
  const dispatch = useDispatch();
  const poolsData = useSelector(state => state.staking.poolsData);
  const refreshFlag = useSelector(state => state.staking.refreshFlag);
  const [poolIndex, setPoolindex] = useState(0);
  const [stakingAmount, setStakingAmount] = useState(0);
  const [debouncedStakingAmount] = useDebounce(stakingAmount, 500);
  const [unstakingAmount, setUnstakingAmount] = useState(0);
  const [debouncedUnstakingAmount] = useDebounce(unstakingAmount, 500);
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { data: connectionData } = useConnect();
  const [doshiWalletBalance, setDoshiWalletBalance] = useState(0);
  const [userStakedInfo2Pool, setUserStakedInfo2Pool] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [approvingTxHash, setApprovingTxHash] = useState("");
  const [stakingTxHash, setStakingTxHash] = useState("");
  const [unstakingTxHash, setUnstakingTxHash] = useState("");
  const selectRef = useRef(null);
  const { chain } = useNetwork();
  const [working, setWorking] = useState(false);
  const [showSuccessContent, setShowSuccessContent] = useState(false);

  const toggleSelectBox = () => {
    setIsOpen(!isOpen);
  };
  const closeSelectBox = (e) => {
    if (selectRef.current && !selectRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {

    readWalletDoshiBalance();
    readUserStakedAmount();

    window.addEventListener('click', closeSelectBox);
    return () => {
      window.removeEventListener('click', closeSelectBox);
    };
  }, []);

  const readWalletDoshiBalance = async () => {
    if (address !== undefined && address !== null) {
      const data = await readContract({
        address: process.env.REACT_APP_DOSHI_TOKEN_CONTRACT_ADDRESS,
        abi: TokenABI,
        functionName: 'balanceOf',
        args: [address],
        formatUnits: 'gwei',
        chainId: connectionData?.chain?.id,
        wallet: address
      })

      setDoshiWalletBalance(data !== undefined && formatGwei(data));

    }
  }

  //read staked amount before preapare unstaking
  const readUserStakedAmount = async () => {
    if (address !== undefined && address !== null) {
      const data = await readContract({
        address: process.env.REACT_APP_DOSHI_STAKING_CONTRACT_ADDRESS,
        abi: StakingABI,
        functionName: 'getUserPoolInfo',
        args: [address, poolIndex],
        formatUnits: 'gwei',
        chainId: connectionData?.chain?.id,
        wallet: address
      });
      setUnstakingAmount(data !== undefined && data !== null && (data?.stakeAmount));
      setUserStakedInfo2Pool(data !== undefined && data !== null && data);
    }
  }

  const onClickStake = async () => {
    if (isConnected) {
      if (chain.id !== 5) {
        toast.warning("Please change the network of your wallet into goerli and try again. DOSHI staking platform works on Goerli network.");
        return;
      }
    } else {
      toast.warning("Connect your wallet!");
      return;
    }
    try {
      setWorking(true);
      const allowance = await readContract({
        address: process.env.REACT_APP_DOSHI_TOKEN_CONTRACT_ADDRESS,
        abi: TokenABI,
        functionName: 'allowance',
        args: [address, process.env.REACT_APP_DOSHI_STAKING_CONTRACT_ADDRESS],
        chainId: connectionData?.chain?.id,
      })
      console.log(allowance, parseFloat(formatGwei(allowance !== undefined && allowance?.toString())), parseFloat(debouncedStakingAmount));

      if (parseFloat(formatGwei(allowance !== undefined && allowance?.toString())) < parseFloat(debouncedStakingAmount)) {

        const aproveHash = await walletClient.writeContract({
          address: process.env.REACT_APP_DOSHI_TOKEN_CONTRACT_ADDRESS,
          abi: TokenABI,
          functionName: "approve",
          args: [process.env.REACT_APP_DOSHI_STAKING_CONTRACT_ADDRESS, parseGwei((stakingAmount !== undefined && stakingAmount?.toString()) || "0")], wallet: address,
          chainId: connectionData?.chain?.id
        });

        setApprovingTxHash(aproveHash);
      }
      const stakingHash = await walletClient.writeContract({
        address: process.env.REACT_APP_DOSHI_STAKING_CONTRACT_ADDRESS,
        abi: StakingABI,
        functionName: 'stake',
        args: [parseGwei((debouncedStakingAmount !== undefined && debouncedStakingAmount?.toString()) || "0"), parseInt(poolIndex)],

        chainId: connectionData?.chain?.id
      });
      setStakingTxHash(stakingHash);
    } catch (err) {
      setWorking(false);
      console.log("err >>> ", err);

    }
  };


  const onClickUnstake = async () => {
    if (isConnected) {
      if (chain.id !== 5) {
        toast.warning("Please change the network of your wallet into goerli and try again. DOSHI staking platform works on Goerli network.");
        return;
      }
    } else {
      toast.warning("Connect your wallet!");
      return;
    }
    try {
      setWorking(true);
      const data = await readContract({
        address: process.env.REACT_APP_DOSHI_STAKING_CONTRACT_ADDRESS,
        abi: StakingABI,
        functionName: 'getUserPoolInfo',
        args: [address, poolIndex],
        formatUnits: 'gwei',
        chainId: connectionData?.chain?.id,
        wallet: address
      });
      setUnstakingAmount(data !== undefined && data !== null && (data?.stakeAmount));
      setUserStakedInfo2Pool(data !== undefined && data !== null && data);
      if (parseFloat(formatGwei(data?.stakeAmount)) > 0) {

        const unstakingHash = await walletClient.writeContract({
          address: process.env.REACT_APP_DOSHI_STAKING_CONTRACT_ADDRESS,
          abi: StakingABI,
          functionName: 'unstake',
          args: [parseInt(poolIndex)],
          enabled: address !== undefined && address !== null && userStakedInfo2Pool?.stakeAmount > 0 && Date.now() / 1000 <= (parseInt(userStakedInfo2Pool?.startTime) + parseInt(poolsData[poolIndex]?.period) * 24 * 3600) && debouncedUnstakingAmount > 0,
          wallet: address,
          chainId: connectionData?.chain?.id
        });

        setUnstakingTxHash(unstakingHash);
      }
      else setWorking(false);
      console.log(" Can not un-stake!!!");
    } catch (err) {
      setWorking(false);
      console.log("unstaking err >>> ", err);

    }
  };

  useEffect(() => {

    readWalletDoshiBalance();
    readUserStakedAmount();
  }, [poolIndex, address])

  useEffect(() => {
    ; (async () => {

      if (approvingTxHash) {
        setTimeout(async () => {
          try {
            const receipt = await getTransactionReceipt(approvingTxHash);
            console.log(receipt);
            setShowSuccessContent(true);
            setTimeout(() => {
              setShowSuccessContent(false);
              setApprovingTxHash(null);
            }, 5000);
          } catch (err) {
            setWorking(false);
            setApprovingTxHash(null);
            console.log(err);
          }
        }, 3000);
      }
      if (stakingTxHash) {
        setTimeout(async () => {
          try {

            const receipt = await getTransactionReceipt(stakingTxHash);

            console.log(receipt);
            setShowSuccessContent(true);
            readWalletDoshiBalance();
            readUserStakedAmount();
            dispatch(setRefreshFlag(!refreshFlag));
            setStakingAmount(0);
            setWorking(false);
            setTimeout(() => {
              setShowSuccessContent(false);
              setStakingTxHash(null);
              dispatch(setRefreshFlag(!refreshFlag));
            }, 5000);
          } catch (err) {
            setWorking(false);
            setStakingTxHash(null);
            console.log(err);
          }
        }, 3000);
      }
      if (unstakingTxHash) {

        setTimeout(async () => {
          try {

            const receipt = await getTransactionReceipt(unstakingTxHash);

            console.log(receipt);
            setShowSuccessContent(true);
            readWalletDoshiBalance();
            readUserStakedAmount();
            dispatch(setRefreshFlag(!refreshFlag));
            setWorking(false);
            setTimeout(() => {
              setShowSuccessContent(false);
              setUnstakingTxHash(null);
            }, 5000);
          } catch (err) {
            setUnstakingTxHash(null);
            setWorking(false);
            console.log(err);
          }
        }, 3000);
      }
    })()
  }, [approvingTxHash, unstakingTxHash, stakingTxHash])


  const RenderSuccessContents = (label, txHash) => {
    return <Reveal keyframes={fadeInUp} className='onStep' delay={0} duration={800} triggerOnce>
      <div>
        {label}
        <div className="underline text-[12px] ">
          <a href={`https://goerli.etherscan.io/tx/${txHash}`} target="_blank" rel="noreferrer">View on Goerli Etherscan</a>
        </div>
      </div>
    </Reveal >
  }

  return (
    <div className={`${className} flex flex-col text-white `}>
      <div className="w-full grid grid-cols-1 md:grid-cols-5 md:grid-rows-3 gap-10">
        <div className="col-span-1 md:col-span-3 md:row-span-2 flex flex-col gap-10">
          <div
            className="overflow-hidden relative h-full  border-custom-medium-white bg-custom-light-white   border-[1px] rounded-3xl
            flex flex-col justify-center flex-wrap w-full  gap-6
          "
          >
            <img
              src="/Cloud_Vector.svg"
              className="w-[163px] h-[81px] absolute -right-5 -top-5 "
              alt=""
            />
            <div className="flex justify-between mt-20 px-8 pr-10 md:mt-0  items-center">
              <div className="text-[28px] font-semibold  ">Select A Pool By Lock Period</div>
            </div>
            <div className="flex justify-between text-[18px] font-semibold pr-10 items-center ">
              <div className="flex gap-2 items-end">
                <div className="  text-left pl-8">
                  Lock Period:
                </div>
                <div className=" relative " ref={selectRef}>
                  <button
                    onClick={toggleSelectBox}
                    className="px-2  rounded border border-transparent hover:border-custom-medium-white flex items-center justify-between"
                  >
                    {poolsData[poolIndex]?.period} Months
                    <span className={`ml-2 transform ${isOpen ? 'rotate-180' : ''} transition-transform`}>
                      ▼
                    </span>
                  </button>
                  {isOpen && (
                    <div className=" top-full left-0 right-0 mt-1 border bg-[#3a2758] border-gray-500 rounded"
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
              <div className="">APY: {poolsData[poolIndex]?.apy}</div>
            </div>

            <Reveal keyframes={fadeInRight} className='onStep' delay={0} duration={800} triggerOnce>
              <div className="z-0 flex flex-col justify-center items-center gap-4 w-full">
                <div
                  className="w-[calc(100%-60px)] min-h-[110px]  bg-custom-heavy-white border-custom-medium-white    border-[1px] rounded-lg px-10
                flex flex-col justify-center
              "
                >
                  <div className="z-0 flex text-[12px] text-gray-300 font-semibold mt-2 w-full justify-between">
                    <div className="z-0">Balance: {parseFloat(doshiWalletBalance).toFixed(2) || 0.0} DOSHI</div>
                    <div className="z-0 ">Min: 1 DOSHI</div>
                  </div>
                  <div className="z-0 flex text-[18px] md:text-[24px] font-medium mt-2 w-full justify-between">
                    <input
                      className={`z-0 text-white border-none outline-none bg-transparent text-start max-w-[150px] md:max-w-auto`}
                      placeholder="Input amount to stake"
                      type="number"
                      value={stakingAmount}
                      min={0}
                      onChange={(e) => setStakingAmount(e.target.value)}
                    ></input>
                    <div className="pl-5 border-l-[1px] text-gray-300 hover:text-white border-l-white text-right cursor-pointer"
                      onClick={() => setStakingAmount(doshiWalletBalance || null)}
                    >
                      MAX
                    </div>
                  </div>
                </div>

                <PrimaryButton
                  label={"Stake"}
                  width={BTN_WIDTH_IN_MAIN_AREA}
                  height={BTN_HEIGHT_IN_MAIN_AREA}
                  onClick={() => onClickStake()}
                />
                {approvingTxHash && showSuccessContent && RenderSuccessContents("Successfully approved! Will continue staking...", approvingTxHash)}
                {stakingTxHash && showSuccessContent && RenderSuccessContents("Successfully staked!", stakingTxHash)}
              </div>
              <div className="flex flex-col items-center gap-4 justify-center w-full">
                <div
                  className="w-[calc(100%-60px)] min-h-[110px]  bg-custom-heavy-white border-custom-medium-white    border-[1px] rounded-lg px-10
                flex flex-col justify-center
              "
                >
                  <div className="flex text-[12px] text-gray-300 font-semibold mt-2 w-full justify-between">
                    <div className="">Staked: {formatGwei(userStakedInfo2Pool && userStakedInfo2Pool?.stakeAmount?.toString())} DOSHI</div>
                    <div className="z-0 ">Available Date:</div>
                  </div>
                  <div className="flex text-[18px] md:text-[24px] font-medium mt-2 w-full justify-between items-center">
                    <input
                      className="text-white border-none outline-none bg-transparent text-start  max-w-[150px]"
                      placeholder="Input amount to un-stake"
                      type="number"
                      disabled
                      value={formatGwei(userStakedInfo2Pool && userStakedInfo2Pool?.stakeAmount?.toString())}
                    ></input>
                    <div className="pl-5 text-[12px]  text-gray-300  text-right cursor-pointer">
                      {
                        (userStakedInfo2Pool && parseInt(userStakedInfo2Pool?.startTime) > 0) ? new Date(parseInt(userStakedInfo2Pool?.startTime) * 1000 + parseInt(poolsData[poolIndex]?.period) * 30.5 * 24 * 3600 * 1000).toDateString() : "Never"
                      }
                    </div>
                  </div>
                </div>

                <PrimaryButton
                  label={"Unstake"}
                  width={BTN_WIDTH_IN_MAIN_AREA}
                  height={BTN_HEIGHT_IN_MAIN_AREA}
                  disabled={!(parseInt(userStakedInfo2Pool?.startTime) > 0) || Date.now() < parseInt(userStakedInfo2Pool?.startTime) * 1000 + parseInt(poolsData[poolIndex]?.period) * 30.5 * 24 * 3600 * 1000}
                  onClick={() =>
                    parseInt(userStakedInfo2Pool?.startTime) > 0 && Date.now() >= parseInt(userStakedInfo2Pool?.startTime) * 1000 + parseInt(poolsData[poolIndex]?.period) * 30.5 * 24 * 3600 * 1000 &&
                    onClickUnstake()
                  }
                />
                {unstakingTxHash && showSuccessContent && RenderSuccessContents("Successfully un-staked!", unstakingTxHash)}
              </div>
              <div className="border-t-[1px] border-t-custom-medium-white pt-5 px-10 ">
                <div className="flex gap-2 items-center">
                  <div className="text-[22px] md:text-[29px] font-semibold">
                    Estimated Rewards:
                  </div>
                  <div className="text-[20px] font-semibold">{calculateDoshiRewards(debouncedStakingAmount, poolsData[poolIndex]?.period)} DOSHI</div>
                </div>
                <div className="text-[18px] font-semibold text-left">
                  Please note that once your tokens are staked, you cannot
                  un-stake until the contract fulfils the lock period.
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        <div className="col-span-1 md:col-span-2 md:row-span-2 flex flex-col gap-10">
          <TotalValueLocked />
          <Performance className="h-[400px]" />
        </div>
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
