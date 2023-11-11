import * as React from "react";
import Box from "@mui/material/Box";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Reveal from "react-awesome-reveal";
import { fadeInUp } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { readListOfStakeEvents } from "../subgraph-interaction";
import { setAllStakingsList } from "../redux-toolkit/reducers/Staking";
import { calculateDailyDoshiRewards } from "../utils/methods";
import { formatGwei } from "viem";

export default function History({ className }) {

  const refreshFlag = useSelector(state => state.staking.refreshFlag);
  const poolsData = useSelector(state => state.staking?.poolsData);
  const stakesList = useSelector(state => state.staking?.allStakingsList);
  const [sortModel, setSortModel] = React.useState([
    {
      field: "stake",
      sort: "desc",
    },
  ]);
  const [tableRows, setTableRows] = React.useState([]);
  const dispatch = useDispatch();
  const initAllStakings = async () => {
    const list = await readListOfStakeEvents(100000000, Math.floor(Date.now() / 1000));
    dispatch(setAllStakingsList(list?.stakes || []));
  }

  React.useEffect(() => {
    initAllStakings();
  }, [refreshFlag])

  React.useEffect(() => {
    if (stakesList) {
      if (stakesList?.length > 0) {
        let tempRows = [];
        for (let index = 0; index < stakesList.length; index++) {
          tempRows.push({
            id: index + 1,
            address: stakesList[index]["_addr"],
            stake: parseFloat(formatGwei(stakesList[index]["_amount"])),
            apy: parseInt(poolsData[stakesList[index]["_poolIndex"]]?.apy?.replace("%", "")),
            lockperiod: poolsData[stakesList[index]["_poolIndex"]]?.period,
            rewards:
              calculateDailyDoshiRewards(formatGwei(stakesList[index]["_amount"]), poolsData[stakesList[index]["_poolIndex"]]?.period) * process.env.REACT_APP_DOSHI2USDT_RATE
          })
        }
        setTableRows(tempRows);
      }
    }
  }, [stakesList])

  const columns: GridColDef[] = [
    {
      field: "address",
      headerName: "Address",
      editable: false,
      sortable: false,
      minWidth: 100,
      flex: 1,
      renderCell: (params) => {
        return (
          <div className="w-full pl-5 ">
            <a href={`https://goerli.etherscan.io/address/${params.value}`} target="_blank"
            >{params.value}
            </a>
          </div>
        );
      },
    },
    {
      field: "stake",
      headerName: "Stake",
      editable: false,
      flex: 1,
      minWidth: 130,
      renderCell: (params) => {
        return (
          <div className="flex gap-2">
            <div className="">{params.value}</div>
            <div className="">DOSHI</div>
          </div>
        );
      },
    },
    {
      field: "apy",
      headerName: "APY",
      editable: false,
      minWidth: 80,
      flex: 1,
      renderCell: (params) => {
        return (
          <div className="flex gap-2">
            <div className="">{params.value}</div>
            <div className="">%</div>
          </div>
        );
      },
    },
    {
      field: "lockperiod",
      headerName: "Lock Period",
      sortable: true,
      flex: 1,
      minWidth: 110,
      renderCell: (params) => {
        return (
          <div className="flex gap-2">
            <div className="">{params.value}</div>
            <div className="">months</div>
          </div>
        );
      },
    },
    {
      field: "rewards",
      headerName: "Rewards",
      sortable: true,
      flex: 1,
      minWidth: 130,
      renderCell: (params) => {
        return (
          <div className="flex gap-2">
            <div className="">{parseFloat(params.value).toFixed(2)}</div>
            <div className="">DOSHI</div>
          </div>
        );
      },
    },
  ];

  return (
    <div
      className={`${className} overflow-hidden relative min-h-[330px]  bg-custom-light-white border-custom-medium-white  md:col-span-5  border-[1px] rounded-3xl`}
    >
      <img
        src="/Cloud_Vector.svg"
        className="w-[163px] h-[81px] absolute  -right-5 -top-5 "
        alt=""
      />

      <div className="text-[26px] font-semibold mt-5 ml-5 text-left">
        Live History
      </div>
      <Reveal keyframes={fadeInUp} className='onStep' delay={0} duration={800} triggerOnce>
        <div className="overflow-x-auto  mt-10 md:mt-0">
          <Box
            sx={{
              height: 270,
              width: "100%",
              minWidth: 500,
              paddingLeft: "20px",
              paddingRight: "20px",
            }}
          >
            <DataGrid
              rows={tableRows}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 3,
                  },
                },
              }}
              pageSizeOptions={[3]}
              disableRowSelectionOnClick
              components={{
                ColumnSortedAscendingIcon: () => (
                  <img
                    src={"/history/sortup.png"}
                    className="w-4 h-4"
                    alt="Ascending"
                  />
                ),
                ColumnSortedDescendingIcon: () => (
                  <img
                    src={"/history/sortdown.png"}
                    className="w-4 h-4"
                    alt="Descending"
                  />
                ),
              }}
              sortingOrder={["asc", "desc"]}
              sortModel={sortModel}
              onSortModelChange={(changedSortModel) => {
                setSortModel(changedSortModel);
              }}
              sx={{
                borderColor: "#FFFFFF08",
                border: "none",
                color: "white",
                backgroundColor: "",
                ".MuiDataGrid-sortIcon": {
                  opacity: "inherit !important",
                },
                "& .MuiDataGrid-cell, .MuiDataGrid-columnHeader": {
                  borderBottom: "1px solid #FFFFFF28",
                  display: "flex",
                  justifyContent: "center",
                },
                "& .MuiDataGrid-columnHeaders": {
                  border: "none",
                },
                "& .MuiDataGrid-columnHeaderTitleContainer": {
                  display: "flex",
                  justifyContent: "center",
                },
                "& .MuiDataGrid-iconButtonContainer": {
                  marginLeft: "2px",
                  visibility: "visible !important",
                  width: "auto !important",
                },
                overflowX: "visible",
              }}
            />
          </Box>
        </div>
      </Reveal>
    </div>
  );
}
