import ImageButton from "./buttons/PrimaryButton";
import { useAccount, useConnect, useDisconnect, useEnsName, useNetwork } from 'wagmi'
import { minAddress } from "../utils/methods";
import { BTN_HEIGHT_IN_MAIN_AREA, BTN_WIDTH_IN_MAIN_AREA } from "../utils/constants";
import {
  Dialog,
  DialogHeader,
  DialogBody,
} from "@material-tailwind/react";
import { AiOutlineClose } from "react-icons/ai";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function NavbarWithCTAButton({ className }) {

  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { data: ensName } = useEnsName({ address });

  const { connect, connectors, error, } =
    useConnect()
  const { disconnect } = useDisconnect();

  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(!open);

  useEffect(() => {
    console.log(error !== null && error !== undefined && error.message);
  }, [error])

  useEffect(() => {
    if (isConnected) {
      if (chain.id !== 5) {
        toast.warning("Please change the network of your wallet into goerli. Doshi staking platform works on Goerli network.");
      }
    }
  }, [isConnected])

  return (
    <div className={`${className && className} w-full  justify-end  `}>

      <ImageButton label={isConnected ? ensName ?? minAddress(address) : "Connect Wallet"} className=""
        onClick={() => handleOpen()}

        width={BTN_WIDTH_IN_MAIN_AREA}
        height={BTN_HEIGHT_IN_MAIN_AREA}
      />
      <Dialog
        open={open}
        handler={handleOpen}
        animate={{
          mount: { scale: 1, y: 0 },
          unmount: { scale: 0.9, y: -100 },
        }}
        className="bg-custom-heavy-white border-[1px] border-gray-600 h-max "
      >
        <DialogHeader className="text-white flex justify-between">
          <div className=""> Connect wallet </div>
          <AiOutlineClose className="text-gray-500 hover:text-white cursor-pointer " onClick={() => handleOpen()} />
        </DialogHeader>
        <DialogBody className="w-full flex flex-col gap-6 rounded-3xl text-white items-center">

          {isConnected !== true ?
            <div className="flex flex-col gap-3 ">
              {connectors?.length > 0 && connectors.filter((obj, index, array) => {
                return index === array.findIndex((el) => el.id === obj.id);
              }).map((connector) => (
                <ImageButton
                  disabled={!connector.ready}
                  key={connector.id}
                  onClick={() => connect({ connector })}
                  label={`${connector.name}                        
                        
                        `}
                  width={BTN_WIDTH_IN_MAIN_AREA}
                  height={BTN_HEIGHT_IN_MAIN_AREA}
                />
              ))}
            </div>
            :
            <div className="flex flex-col items-center gap-2 " >
              {
                (chain && chain.id !== 5) &&
                <div className="text-red-400 text-[16px] font-semibold text-center">Please change the network of your wallet into goerli. Doshi staking platform works on Goerli network.</div>
              }
              {
                (chain && chain.id === 5) &&
                <div className="text-green-400 text-[16px] font-semibold text-center">Connected to {chain.name} network.</div>
              }
              <div className="text-white text-[16px] font-semibold">{isConnected ? ensName ?? address : "Not connected"}</div>
              <ImageButton label={"Disconnect"} className=""
                onClick={() => disconnect()}
                width={BTN_WIDTH_IN_MAIN_AREA}
                height={BTN_HEIGHT_IN_MAIN_AREA}
              />
            </div>
          }
        </DialogBody>
      </Dialog>

    </div>
  );
}
