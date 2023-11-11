import { configureStore } from "@reduxjs/toolkit";
import SidebarReducer from "./reducers/Sidebar";
import StakingReucer from "./reducers/Staking";

const reducer = {
  sidebar: SidebarReducer,
  staking: StakingReucer
};

export const store = configureStore({
  reducer: reducer,
  devTools: true,
});
