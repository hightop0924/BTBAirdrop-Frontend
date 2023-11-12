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
          address: process.env.REACT_APP_BTB_STAKING_CONTRACT_ADDRESS,
          abi: StakingABI,
          functionName: 'getUserPoolInfo',
          args: [address, poolIndex],
          formatUnits: 'gwei',
          chainId: connectionData?.chain?.id,
        },
        {
          address: process.env.REACT_APP_BTB_STAKING_CONTRACT_ADDRESS,
          abi: StakingABI,
          functionName: 'getRewards',
          args: [address, poolIndex],
          chainId: connectionData?.chain?.id,
        },
        {
          address: process.env.REACT_APP_BTB_TOKEN_CONTRACT_ADDRESS,
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
      // const data = await readContracts({
      //   contracts: [
      //     {
      //       address: process.env.REACT_APP_BTB_STAKING_CONTRACT_ADDRESS,
      //       abi: StakingABI,
      //       functionName: 'getUserPoolInfo',
      //       args: [address, poolIndex],
      //       formatUnits: 'gwei',
      //       chainId: connectionData?.chain?.id,
      //       wallet: address
      //     }, {
      //       address: process.env.REACT_APP_BTB_STAKING_CONTRACT_ADDRESS,
      //       abi: StakingABI,
      //       functionName: 'getRewards',
      //       args: [address, poolIndex],
      //       chainId: connectionData?.chain?.id,
      //       wallet: address
      //     }
      //   ]
      // });
      // setUserStakedInfo2Pool(data[0] !== undefined && data[0] !== null && data[0]["result"]);

      // setUserRewardAmount(data[1] !== undefined && data[1] !== null && formatGwei(data[1]["result"]));

      // if (claimingAmount > parseFloat(formatGwei(data[1]["result"]))) {
      //   toast.warning("Amount cannot exceeds the reward amount. Please input value again and retry.");
      //   setWorking(false);
      //   return;
      // }
      // if (!data || !data[0] || !data[1] || parseFloat(formatGwei(data[1]["result"])) <= 0) {
      //   toast.warning("There is not withdrawable rewards.");
      //   setWorking(false);
      //   return;
      // }


      const claimingHs = await walletClient.writeContract({
        address: process.env.REACT_APP_BTB_STAKING_CONTRACT_ADDRESS,
        abi: StakingABI,
        functionName: 'claimReward',
        args: [],
        chainId: chain?.id
      });

      setClaimTxHash(claimingHs);

    } catch (err) {
      setWorking(false);
      console.log("claiming err >>> ", err);
    }
  }

  const onClickWithdraw = async () => {
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

      const withdrawingHs = await walletClient.writeContract({
        address: process.env.REACT_APP_BTB_STAKING_CONTRACT_ADDRESS,
        abi: StakingABI,
        functionName: 'withdrawStake',
        args: [],
        chainId: chain?.id
      });

      setClaimTxHash(withdrawingHs);

    } catch (err) {
      setWorking(false);
      console.log("claiming err >>> ", err);
    }
  }

  return (
    <>
      <div className={`${className} flex flex-col text-white `}>
        <div className="w-full grid grid-cols-1 md:grid-cols-5 gap-10">
          <div className="col-span-1 md:col-span-3 md:row-span-2 flex flex-col gap-10">
            <div
              className="overflow-hidden relative h-full  border-custom-medium-white bg-custom-light-white   border-[1px] rounded-3xl
            flex flex-col justify-center flex-wrap w-full  gap-6
          ">
              <Reveal keyframes={fadeInRight} className='onStep' delay={0} duration={800} triggerOnce>
                <div className="z-0 flex flex-col justify-center items-center gap-4 w-full">
                  <PrimaryButton
                    label={"Claim Reward"}
                    onClick={() => onClickClaim()}
                    width={BTN_WIDTH_IN_MAIN_AREA}
                    height={BTN_HEIGHT_IN_MAIN_AREA}
                  />

                  {claimTxHash && showSuccessContent && RenderSuccessContents("Successfully claimed!", claimTxHash)}
                </div>

                <div className="flex flex-col items-center gap-4 justify-center w-full">
                  <PrimaryButton
                    label={"Withdraw Stake"}
                    onClick={() => onClickWithdraw()}
                    width={BTN_WIDTH_IN_MAIN_AREA}
                    height={BTN_HEIGHT_IN_MAIN_AREA}
                  />

                  {claimTxHash && showSuccessContent && RenderSuccessContents("Successfully claimed!", claimTxHash)}
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
