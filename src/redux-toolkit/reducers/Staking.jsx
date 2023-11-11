import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  poolsData: [
    {
      amount: 0, apy: "55%", period: 3,
    },
    {
      amount: 0, apy: "70%", period: 5,
    },
    {
      amount: 0, apy: "85%", period: 8,
    },
    {
      amount: 0, apy: "115%", period: 12,
    }
  ],
  allStakingsList: [],
  allUnstakingsList: [],
  refreshFlag: false
};

const stakingSlice = createSlice({
  name: "staking",
  initialState,
  reducers: {
    setPoolsData: (state, action) => {
      return { ...state, poolsData: action.payload }
    },
    setPoolsAmounts: (state, action) => {

      let amountsArray = action.payload;
      let tempData = [
        {
          amount: 0, apy: "55%", period: 3,
        },
        {
          amount: 0, apy: "70%", period: 5,
        },
        {
          amount: 0, apy: "85%", period: 8,
        },
        {
          amount: 0, apy: "115%", period: 12,
        }
      ];
      for (let index = 0; index < tempData?.length; index++) {
        tempData[index] = {
          ...tempData[index], amount: amountsArray[index]
        }
      }
      return { ...state, poolsData: tempData }
    },
    setAllStakingsList: (state, action) => {
      return {
        ...state, allStakingsList: action.payload
      }
    },
    setAllUnstakingsList: (state, action) => {
      return {
        ...state, allUnstakingsList: action.payload
      }
    },
    setRefreshFlag: (state, action) => {
      return {
        ...state, refreshFlag: action.payload
      }
    }
  },
});

const { reducer, actions } = stakingSlice;

export const {
  setPoolsData,
  setPoolsAmounts,
  setAllStakingsList,
  setAllUnstakingsList,
  setRefreshFlag
} = actions;
export default reducer;
