import { createSlice } from "@reduxjs/toolkit";

const initialState = {

  currentPath: "/overview"
};


const sidebarSlice = createSlice({
  name: "sidebar",
  initialState,
  reducers: {
    setCurrentPath: (state, action) => {
      return { ...state, currentPath: action.payload }
    },
  },
});

const { reducer, actions } = sidebarSlice;

export const {
  setCurrentPath
} = actions;
export default reducer;
