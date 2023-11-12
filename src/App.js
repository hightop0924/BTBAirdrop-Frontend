import "./App.css";

import SideBar from "./components/SideBar";
import NavbarWithCTAButton from "./components/Navbar";
import { useNavigate, useRoutes } from "react-router-dom";
import Routes from "./Routes";

import { Spinner } from "@material-tailwind/react";

import { EventBus, minAddress } from "./utils/methods";
import { BTN_HEIGHT_IN_MAIN_AREA, BTN_WIDTH_IN_MAIN_AREA, SET_LOADING, TabValues } from "./utils/constants";
import { useEffect, useState } from "react";
import SidebarButton from "./components/buttons/SideBarButton";
import { HiOutlineMenuAlt1 } from "react-icons/hi";
import { AiOutlineClose } from "react-icons/ai";
import { TfiWallet } from "react-icons/tfi";
import ImageButton from "./components/buttons/PrimaryButton";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentPath } from "./redux-toolkit/reducers/Sidebar";
import { useLocation } from "react-router-dom";
import { useAccount, useConnect, useDisconnect, useEnsName, useNetwork } from 'wagmi'

function App() {
  const pageLocation = useLocation();
  const dispatch = useDispatch();
  const pages = useRoutes(Routes);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { chain } = useNetwork();
  const activeTab = useSelector(state => state.sidebar.currentPath);
  const { address, isConnected } = useAccount()
  const { data: ensName } = useEnsName({ address });

  const { connect, connectors, error } =
    useConnect()
  const { disconnect } = useDisconnect();

  const backgroundImageStyle = {
    backgroundImage: `url("/main_bg.jpg")`,
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    minHeight: "100vh", // Adjust as needed
  };

  useEffect(() => {
    console.log(error !== null && error !== undefined && error.message);
  }, [error])

  useEffect(() => {
    if (pageLocation.pathname === "/") {
      navigate("/claim");
    }
    else dispatch(setCurrentPath(pageLocation.pathname));
  }, []);

  const onTabClick = (value) => {
    setShowNavMenu(false);
    dispatch(setCurrentPath("/" + String(value).toLocaleLowerCase()));
    navigate("/" + String(value).toLocaleLowerCase());
  };

  const setLoading = (data) => {
    setIsLoading(data);
  };

  useEffect(() => {
    EventBus.on(SET_LOADING, (data) => {
      setLoading(data);
    });

    return () => {
      EventBus.remove(SET_LOADING);
    };
  }, []);

  return (

    <div
      className="App flex flex-col bg-black min-h-[100vh] overflow-x-hidden"
      style={backgroundImageStyle}
    >
      <div className="flex w-[100vw] justify-between h-max px-2 md:pl-10 md:pr-16 pb-10 pt-5 md:pt-8 items-start ">
        <SideBar className="hidden md:flex bg-custom-light-white border-custom-medium-white border-[1px] w-[250px] min-h-[1290px] shadow-md" />
        <div className="w-full md:w-[calc(100vw-400px)] relative">
          <NavbarWithCTAButton className="hidden md:flex" />
          <div className={`w-full grid grid-cols-6 md:hidden px-2 md:px-10 `}>
            <div className="col-span-1  flex flex-col justify-end pb-16 md:pb-0 "

            >
              {showWalletMenu === false ?
                <HiOutlineMenuAlt1 className=" w-[32px] h-[32px] hover:border-[1px] border-white rounded-lg hover:text-white text-gray-300"
                  onClick={() => { setShowWalletMenu(false); setShowNavMenu(!showNavMenu) }}
                />
                :
                <AiOutlineClose className="w-[28px] h-[28px] text-white " onClick={() => setShowWalletMenu(false)} />
              }
            </div>
            <div className="col-span-4 flex justify-center">

              <img
                src="/logo.png"
                className="w-[216x] h-[121px] my-8 "
                alt="logo "
              />
            </div>
            <div className={`col-span-1 flex flex-col items-end justify-end pb-16 md:pb-0 md:flex-row  gap-10  `}>
              {
                showNavMenu === false ?
                  <TfiWallet className=" w-[32px] h-[32px] p-[2px]  hover:border-[1px] border-white rounded-lg hover:text-white text-gray-300"
                    onClick={() => { setShowNavMenu(false); setShowWalletMenu(!showWalletMenu) }}
                  />
                  :
                  <AiOutlineClose className="w-[28px] h-[28px] text-white " onClick={() => setShowNavMenu(false)} />
              }
            </div>
          </div>
          {
            showNavMenu &&
            <div className="absolute top-50 left-0 flex-col gap-6 rounded-3xl text-white items-center"
            >
              {TabValues?.map((value, index) => (
                <SidebarButton
                  key={index}
                  label={value}
                  isActive={activeTab?.toString().includes(value.toLowerCase())}
                  onClick={() => onTabClick(value)}
                />
              ))}
            </div>
          }
          {
            showWalletMenu &&
            <div className="absolute top-50 left-0 w-full flex flex-col gap-6 rounded-3xl text-white items-center"
            >
              {isConnected !== true ?
                <div className="flex flex-col gap-3 ">
                  {connectors?.length > 0 && connectors.filter((obj, index, array) => {
                    return index === array.findIndex((el) => el.id === obj.id);
                  }).map((connector) => (
                    <ImageButton
                      disabled={!connector.ready}
                      key={connector.id}
                      onClick={() => connect({ connector })}
                      label={`${connector.name} `}
                    />
                  ))}
                </div>
                : <div className="flex flex-col items-center gap-2 " > {
                  (chain && (chain.id !== 80001) && (chain.id != 137)) &&
                  <div className="text-red-400 text-[16px] font-semibold text-center">Please change the network of your wallet into mumbai/polygon and try again. BTB staking platform works on mumbai/polygon network.</div>
                }
                  {
                    (chain && chain.id === 5) &&
                    <div className="text-green-400 text-[16px] font-semibold text-center">Connected to {chain.name} network.</div>
                  }
                  <div className="text-white text-[16px] font-semibold">{isConnected ? ensName ?? minAddress(address) : "Not connected"}</div>
                  <ImageButton label={"Disconnect"} className=""
                    onClick={() => disconnect()}
                    width={BTN_WIDTH_IN_MAIN_AREA}
                    height={BTN_HEIGHT_IN_MAIN_AREA}
                  />
                </div>
              }
            </div>
          }
          {
            showNavMenu !== true && showWalletMenu !== true &&
            <div className="w-full mt-5">{pages}</div>
          }
        </div>
      </div>

      <div
        style={{
          position: "fixed",
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          zIndex: 999,
          top: 0,
          left: 0,
          display: `${isLoading ? "flex" : "none"}`,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spinner color="blue" className="h-10 w-10" />
      </div>
    </div>
  );
}

export default App;
