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
import { formatGwei, isAddress, parseGwei } from "viem";
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
  const [referralAddress, setReferralAddress] = useState('');
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
        address: process.env.REACT_APP_BTB_TOKEN_CONTRACT_ADDRESS,
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
        address: process.env.REACT_APP_BTB_STAKING_CONTRACT_ADDRESS,
        abi: StakingABI,
        functionName: 'getUserStakedAmount',
        args: [address],
        formatUnits: 'gwei',
        chainId: chain?.id,
        wallet: address
      });
      setUnstakingAmount(data !== undefined && data !== null && (data?.stakeAmount));
      setUserStakedInfo2Pool(data !== undefined && data !== null && data);
    }
  }

  const onClickStake = async () => {
    if (isConnected) {
      if ((chain.id !== 80001) && (chain.id != 137)) {
        toast.warning("Please change the network of your wallet into mumbai/polygon and try again. BTB staking platform works on mumbai/polygon network.");
        return;
      }
    } else {
      toast.warning("Connect your wallet!");
      return;
    }
    try {
      setWorking(true);
      const allowance = await readContract({
        address: process.env.REACT_APP_BTB_TOKEN_CONTRACT_ADDRESS,
        abi: TokenABI,
        functionName: 'allowance',
        args: [address, process.env.REACT_APP_BTB_STAKING_CONTRACT_ADDRESS],
        chainId: connectionData?.chain?.id,
      })
      console.log(allowance, parseFloat(formatGwei(allowance !== undefined && allowance?.toString())), parseFloat(debouncedStakingAmount));

      if (parseFloat(formatGwei(allowance !== undefined && allowance?.toString())) < parseFloat(debouncedStakingAmount)) {

        const aproveHash = await walletClient.writeContract({
          address: process.env.REACT_APP_BTB_TOKEN_CONTRACT_ADDRESS,
          abi: TokenABI,
          functionName: "approve",
          args: [process.env.REACT_APP_BTB_STAKING_CONTRACT_ADDRESS, parseGwei((stakingAmount !== undefined && stakingAmount?.toString()) || "0")], wallet: address,
          chainId: connectionData?.chain?.id
        });

        setApprovingTxHash(aproveHash);
      }

      if (!isAddress(referralAddress)) {
        toast.warning("Please input correct address.");
        return;
      }
      const stakingHash = await walletClient.writeContract({
        address: process.env.REACT_APP_BTB_STAKING_CONTRACT_ADDRESS,
        abi: StakingABI,
        functionName: 'stake',
        args: [referralAddress],
        chainId: chain?.id
      });
      setStakingTxHash(stakingHash);
    } catch (err) {
      setWorking(false);
      console.log("err >>> ", err);
    }
  };


  const onClickUnstake = async () => {
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
      <div className="w-full grid grid-cols-1 md:grid-cols-5 gap-10">
        <div className="col-span-1 md:col-span-3 md:row-span-2 flex flex-col gap-10">
          <div
            className="overflow-hidden relative h-full  border-custom-medium-white bg-custom-light-white   border-[1px] rounded-3xl
            flex flex-col justify-center flex-wrap w-full  gap-6
          ">
            <Reveal keyframes={fadeInRight} className='onStep' delay={0} duration={800} triggerOnce>
              <div className="z-0 flex flex-col justify-center items-center gap-4 w-full">
                <div
                  className="w-[calc(100%-60px)] min-h-[110px]  bg-custom-heavy-white border-custom-medium-white    border-[1px] rounded-lg px-10
                flex flex-col justify-center
              "
                >
                  <div className="z-0 flex text-[12px] text-gray-300 font-semibold mt-2 w-full justify-between">
                    <div className="z-0">Referral Address</div>
                  </div>
                  <div className="z-0 flex text-[18px] md:text-[24px] font-medium mt-4 w-full justify-between">
                    <input
                      className={`z-0 text-white border-none outline-none bg-transparent text-start w-100`}
                      placeholder="Input referral address"
                      type="text"
                      value={referralAddress}
                      onChange={(e) => setReferralAddress(e.target.value)}
                    ></input>
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
                <PrimaryButton
                  label={"Unstake"}
                  width={BTN_WIDTH_IN_MAIN_AREA}
                  height={BTN_HEIGHT_IN_MAIN_AREA}
                  disabled={!(parseInt(userStakedInfo2Pool?.startTime) > 0) || Date.now() < parseInt(userStakedInfo2Pool?.startTime) * 1000 + parseInt(poolsData[poolIndex]?.period) * 30.5 * 24 * 3600 * 1000}
                  onClick={() => onClickUnstake()}
                />
                {unstakingTxHash && showSuccessContent && RenderSuccessContents("Successfully un-staked!", unstakingTxHash)}
              </div>

            </Reveal>
          </div>
        </div>

      </div>

    </div>
  );
}
