import TotalValueLocked from "../components/TotalValueLocked";
import Performance from "../components/Performance";
import History from "../components/History";
import StakingActivityLines from "../components/chart/StakingActivityLines";
import { averageHolding, numberWithCommas, weightedAverageAPY } from "../utils/methods";
import Reveal from "react-awesome-reveal";
import { fadeInUp } from "../utils/constants";
import { useSelector } from "react-redux";

export default function Overview({ className }) {
  const poolsData = useSelector(state => state.staking.poolsData);


  return (
    <div className={`${className} flex flex-col text-white `}>
      <div className="w-full grid grid-cols-1 md:grid-cols-5 gap-10">
        <div
          className="overflow-hidden relative min-h-[350px] bg-custom-light-white border-custom-medium-white  md:col-span-3   border-[1px] rounded-3xl
          flex flex-wrap pt-20 w-full justify-center gap-5
        "
        >
          <img
            src="/Cloud_Vector.svg"
            className="w-[163px] h-[81px] absolute  -right-5 -top-5 "
            alt=""
          />

          <Reveal keyframes={fadeInUp} className='onStep' delay={0} duration={800} triggerOnce>
            <div className="flex flex-col gap-2 items-center min-w-[160px] md:min-w-[180px]">
              <img
                src="/statistics/marketcap.svg"
                className="w-[30px] h-[30px]"
                alt="statistic icon"
              />
              <div className="text-[17px] font-semibold">Market Cap</div>
              <div className="text-[25px] font-semibold">
                ${numberWithCommas(process.env.REACT_APP_DOSHI_MARKETCAP)}
              </div>
            </div>

            <div className="flex flex-col gap-2 items-center  min-w-[160px] md:min-w-[180px]">
              <img
                src="/statistics/apy.svg"
                className="w-[30px] h-[30px]"
                alt="statistic icon"
              />
              <div className="text-[17px] font-semibold">APY Statistics</div>
              <div className="text-[25px] font-semibold">
                {numberWithCommas(weightedAverageAPY(poolsData))}%
              </div>
            </div>

            <div className="flex flex-col gap-2 items-center min-w-[160px] md:min-w-[180px]">
              <img
                src="/statistics/totalsupply.svg"
                className="w-[30px] h-[30px]"
                alt="statistic icon"
              />
              <div className="text-[17px] font-semibold">Total Supply</div>
              <div className="text-[25px] font-semibold">
                {numberWithCommas(process.env.REACT_APP_DOSHI_TOTOALSUPPLY)}
              </div>
            </div>

            <div className="flex flex-col gap-2 items-center min-w-[160px] md:min-w-[180px]">
              <img
                src="/statistics/circumstance.svg"
                className="w-[30px] h-[30px]"
                alt="statistic icon"
              />
              <div className="text-[17px] font-semibold">Circulating Supply</div>
              <div className="text-[25px] font-semibold">
                {numberWithCommas(process.env.REACT_APP_DOSHI_CIRCULATINGSUPPLY)}
              </div>
            </div>

            {/* <div className="flex flex-col gap-2 items-center min-w-[160px] md:min-w-[180px]">
              <img
                src="/statistics/backendlq.svg"
                className="w-[30px] h-[30px]"
                alt="statistic icon"
              />
              <div className="text-[17px] font-semibold">Backend Liquidity</div>
              <div className="text-[25px] font-semibold">
                ${numberWithCommas(346597890)}
              </div>
            </div> */}

            <div className="flex flex-col gap-2 items-center min-w-[160px] md:min-w-[180px] pb-5 ">
              <img
                src="/statistics/averagehoding.svg"
                className="w-[30px] h-[30px]"
                alt="statistic icon"
              />
              <div className="text-[17px] font-semibold">Average Holding</div>
              <div className="text-[25px] font-semibold">
                {numberWithCommas(averageHolding(poolsData))}
              </div>
            </div>
          </Reveal>
        </div>
        <TotalValueLocked />

        <StakingActivityLines className="max-h-[400px]" />

        <Performance className="max-h-[400px]" />

        <History />
      </div>
    </div>
  );
}
