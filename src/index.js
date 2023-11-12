import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@material-tailwind/react";

import { store } from "./redux-toolkit/store";
import { Provider } from "react-redux";

import '@rainbow-me/rainbowkit/styles.css';
import {
  connectorsForWallets
} from '@rainbow-me/rainbowkit';

import {
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
  trustWallet,
  coinbaseWallet,
  phantomWallet
} from '@rainbow-me/rainbowkit/wallets';

import { WagmiConfig, createConfig, configureChains } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { goerli, polygonMumbai, polygon } from "viem/chains";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


window.Buffer = window.Buffer || require("buffer").Buffer;
const projectId = process.env.REACT_APP_WALLETCONNECT_PROJECT_ID;
// Configure chains & providers with the Alchemy provider.
// Two popular providers are Alchemy (alchemy.com) and Infura (infura.io)
const { chains, publicClient } = configureChains(
  [polygonMumbai],
  [alchemyProvider({ apiKey: process.env.REACT_APP_ALCHEMY_ID }), publicProvider()],
)

const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [
      metaMaskWallet({ projectId, chains }),
      walletConnectWallet({ projectId, chains }),
      rainbowWallet({ projectId, chains }),
      trustWallet({ projectId, chains })
    ],
  },
  {
    groupName: 'Others',
    wallets: [
      coinbaseWallet({ chains, appName: process.env.REACT_APP_WALLETCONNECT_PROJECT_NAME }),
      phantomWallet({ chains })
    ]
  }
]);

// Set up wagmi config
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
})

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <WagmiConfig config={wagmiConfig}>
    <BrowserRouter>
      <ThemeProvider>

        <Provider store={store}>
          <App />
          <ToastContainer />
        </Provider>
      </ThemeProvider>
    </BrowserRouter>
  </WagmiConfig>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
