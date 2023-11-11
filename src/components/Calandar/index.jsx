import React, { useState } from 'react';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import Popup from "@mui/material/Popover";
import { useDispatch, useSelector } from 'react-redux';
import { formatGwei } from 'viem';
import { useAccount } from 'wagmi';
import { readListOfStakeEvents } from '../../subgraph-interaction';
import { setAllStakingsList } from '../../redux-toolkit/reducers/Staking';

function Calendar() {

  const refreshFlag = useSelector(state => state.staking.refreshFlag);
  const stakesList = useSelector(state => state.staking?.allStakingsList);
  const poolsData = useSelector(state => state.staking.poolsData);
  const { address } = useAccount();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState();

  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [dayStatistics, setDayStatistics] = useState([]);

  const dispatch = useDispatch();
  const initAllStakings = async () => {
    const list = await readListOfStakeEvents(100000000, Math.floor(Date.now() / 1000));
    dispatch(setAllStakingsList(list?.stakes || []));
  }

  React.useEffect(() => {
    initAllStakings();
  }, [refreshFlag])

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);  // for empty cells before the first day
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  for (let i = 0; firstDayOfMonth + daysInMonth <= 35 && i < 35 - firstDayOfMonth - daysInMonth; i++) {
    days.push(null);  // for empty cells before the first day
  }

  for (let i = 0; firstDayOfMonth + daysInMonth > 35 && i < 42 - firstDayOfMonth - daysInMonth; i++) {
    days.push(null);  // for empty cells before the first day
  }

  const formatDate = (day, month, year) => {
    const date = new Date(year, month, day);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '-'); // Assuming blocknumber is formatted like 'MM-DD-YYYY'
  };

  const formateDateFromTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '-');
  }

  const isDayInHistory = (day) => {
    const dateStr = formatDate(day, currentMonth.getMonth(), currentMonth.getFullYear());
    return stakesList.some(item => formateDateFromTimestamp(item["_time"] * 1000) === dateStr && item["_addr"]?.toString()?.toLowerCase() === address?.toLowerCase());
  };

  const handleClickCell = (event, day, month, year) => {
    event.stopPropagation();
    setSelectedDate(formatDate(day, month, year));
    setAnchorEl(event.currentTarget);
    setOpen(true);

    //debug
    getStatisticStringOfADay(day);
  }

  const handleClosePopup = (event) => {
    setAnchorEl(null);
    setOpen(false);

    setTimeout(hidePresentation, 500, event);
  };

  const hidePresentation = (event) => {

    if (
      document
        .elementFromPoint(event.clientX, event.clientY)
        .outerHTML.toString()
        .includes("day-cell") === true
    ) {
      document
        .elementFromPoint(event.clientX, event.clientY)
        .click();
    }
  };

  const getStatisticStringOfADay = (day) => {
    //gerate a object with  date, poolindex, withdrawal date, stakedamount
    let dateStr = formatDate(day, currentMonth.getMonth(), currentMonth.getFullYear());
    let dayStakings = stakesList.filter(item => formateDateFromTimestamp(item["_time"] * 1000) === dateStr && item["_addr"]?.toString()?.toLowerCase() === address?.toLowerCase());

    let statistics = [];
    //sort these by pool indexes
    dayStakings.map((staking) => {
      // Find or create the statistic object for the poolIndex
      let stat = statistics.find(s => s._poolIndex == staking._poolIndex);

      if (stat) {
        // If exists, sum the amount
        let newAmount = parseFloat(stat._amount) + parseFloat(formatGwei(staking._amount));
        statistics = statistics.filter(s => s._poolIndex !== staking._poolIndex);
        statistics.push({
          _poolIndex: staking._poolIndex,
          _amount: newAmount
        });
      } else {
        // Otherwise, create a new statistic object and push it to the accumulator
        statistics.push({
          _poolIndex: staking._poolIndex,
          _amount: parseFloat(formatGwei(staking._amount))
        });
      }

    });

    statistics = statistics.sort((a, b) => parseInt(a._poolIndex) - parseInt(b._poolIndex));

    setDayStatistics(statistics);
  }

  return (
    <div className="calendar h-full grid grid-rows-7 border-[2px] rounded-lg border-gray-500">
      <div className="calendar-header w-full grid grid-cols-7 row-span-1 items-center py-4">
        <button className="col-span-1" onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}>
          <ArrowBackIosIcon />
        </button>
        <div className='col-span-5 text-[24px] md:text-[32px] font-semibold '>{currentMonth.toLocaleString('default', { month: 'long' })} {currentMonth.getFullYear()}</div>
        <button className="col-span-1" onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}>
          <ArrowForwardIosIcon />
        </button>
      </div>
      <div className='md:hidden calendar-weeks w-full grid grid-cols-7 '>
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day, index) => (
          <div key={day} className={`flex items-center justify-center  text-[14px] font-semibold  
                ${index % 7 === 0 ? "day-cell border-t-[2px] border-r-[2px]   border-gray-500 " :
              index % 7 === 6 ? "day-cell border-t-[2px]  border-gray-500  " :
                "day-cell border-t-[2px] border-r-[2px]  border-gray-500"}
                  `}

          >{day}</div>
        ))}
      </div>
      <div className='hidden md:grid calendar-weeks w-full  grid-cols-7 '>
        {['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'].map((day, index) => (
          <div key={day} className={`flex items-center justify-center  text-[14px] font-semibold  
                ${index % 7 === 0 ? "day-cell border-t-[2px] border-r-[2px]   border-gray-500 " :
              index % 7 === 6 ? "day-cell border-t-[2px]  border-gray-500  " :
                "day-cell border-t-[2px] border-r-[2px]  border-gray-500"}
                  `}

          >{day}</div>
        ))}
      </div>
      <div className="calendar-days w-full grid grid-cols-7 row-span-6">
        {days.map((day, index) => {
          const isSelectedDay = day && isDayInHistory(day);
          return (
            <div key={index} className={
              `flex justify-start items-start text-[18px] font-semibold p-3
                ${day !== null ? "hover:bg-custom-medium-white" : ""} 
                ${index % 7 === 0 ? "day-cell border-t-[2px] border-r-[2px]   border-gray-500 " :
                index % 7 === 6 ? "day-cell border-t-[2px]  border-gray-500  " :
                  "day-cell border-t-[2px] border-r-[2px]  border-gray-500"}
                ${isSelectedDay ? "bg-custom-highlight" : ""}
              `}
              onClick={(e) => handleClickCell(e, day, currentMonth.getMonth(), currentMonth.getFullYear())}
            >
              {day}
              {isSelectedDay && <div className="">•</div>}
            </div>
          )
        })}
      </div>
      <Popup
        id={`cell_popup`}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClosePopup}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <div className="flex flex-col min-w-[200px] min-h-[100px] items-center pb-5">
          <div className='mt-3 text-[18px] font-semibold'>{selectedDate}</div>
          {
            dayStatistics?.length > 0 && dayStatistics.map((item, index) => (
              <div key={index} className='mt-3 text-[16px] font-semibold w-full px-5 text-left'>
                {poolsData[item["_poolIndex"]]?.period} Months pool: {Math.floor(item["_amount"])} DOSHI</div>
            ))
          }
        </div>
      </Popup>
    </div>
  );
}

export default Calendar;
