import { formatGwei } from "viem";

export const numberWithCommas = (x, digits = 3) => {
  return parseFloat(x).toLocaleString(undefined, { maximumFractionDigits: digits });
};

// Send data between components
export const EventBus = {
  on(event, callback) {
    document.addEventListener(event, (e) => callback(e.detail));
  },
  dispatch(event, data) {
    document.dispatchEvent(new CustomEvent(event, { detail: data }));
  },
  remove(event, callback) {
    document.removeEventListener(event, callback);
  },
};

export const minAddress = (strAddress) => {
  return strAddress?.toString()?.substring(0, 6) + "..." + strAddress?.toString()?.substring(38, 42);
}

export const formatNumber = (number) => {
  let suffix = '';
  let formattedNumber = number;

  if (number >= 1e6) {
    suffix = 'M';
    formattedNumber = number / 1e6;
  } else if (number >= 1e3) {
    suffix = 'k';
    formattedNumber = number / 1e3;
  }
  return (formattedNumber && formattedNumber > 0) ? `${parseFloat(formattedNumber)?.toFixed(2)}${suffix}` : 0;
}

export function weightedAverageAPY(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return 0;
  }

  let totalAmount = 0;
  let weightedAPY = 0;

  for (const obj of data) {
    const amount = parseFloat(obj.amount);
    const apy = parseFloat(obj.apy);

    if (!isNaN(amount) && !isNaN(apy)) {
      totalAmount += amount;
      weightedAPY += amount * apy;
    }
  }

  if (totalAmount === 0) {
    return 0;
  }

  const averageAPY = weightedAPY / totalAmount;
  return averageAPY.toFixed(2); // Round the average APY to two decimal places
}


export function averageHolding(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return 0;
  }

  let totalAmount = 0;

  for (const obj of data) {
    const amount = parseFloat(formatGwei(obj.amount));

    if (!isNaN(amount)) {
      totalAmount += amount;
    }
  }

  if (totalAmount === 0) {
    return 0;
  }

  const average = totalAmount / data.length;
  return average.toFixed(2); // Round the average APY to two decimal places
}

export function calculateDoshiRewards(stakedAmount, period) {
  // Define the APY values for each period
  const APY = {
    '3': 0.55,  // 55%
    '5': 0.70,  // 70%
    '8': 0.85,  // 85%
    '12': 1.15  // 115%
  };

  // Calculate the daily reward
  const dailyReward = stakedAmount * (APY[period] / 365);

  // Calculate the total reward for the entire period
  const totalReward = dailyReward * (period * 30.5);  // Assuming an average of 30.5 days per month

  return parseFloat(totalReward).toFixed(2);
}

export function calculateDailyDoshiRewards(stakedAmount, period) {
  // Define the APY values for each period
  const APY = {
    '3': 0.55,  // 55%
    '5': 0.70,  // 70%
    '8': 0.85,  // 85%
    '12': 1.15  // 115%
  };

  // If the given period is not in the APY list, return 0
  if (!APY[period]) {
    return 0;
  }

  // Calculate the daily reward
  const dailyReward = stakedAmount * (APY[period] / 365);

  return dailyReward;
}

export function calculateDailyDoshiRewardsByAPY(stakedAmount, apy) {
  // Define the APY values for each period


  // If the given period is not in the APY list, return 0
  if (!apy || !(apy >= 0 && apy <= 100)) {
    return 0;
  }

  // Calculate the daily reward
  const dailyReward = stakedAmount * (apy / 100 / 365);

  return dailyReward;
}

export function daysUntilWithdrawal(now, withdrawalDate) {
  // Ensure both now and withdrawalDate are Date objects
  const currentDate = new Date(now);
  const endDate = new Date(withdrawalDate);

  // Get the difference in milliseconds
  const diffInMilliseconds = endDate - currentDate;

  // Convert the difference from milliseconds to days
  const days = diffInMilliseconds / (1000 * 60 * 60 * 24);

  // Return the floor value of days to get full days
  return Math.floor(days);
}
