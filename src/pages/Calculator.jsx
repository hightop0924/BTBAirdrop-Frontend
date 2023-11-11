import TotalValueLocked from "../components/TotalValueLocked";
import Performance from "../components/Performance";
import History from "../components/History";
import PrimaryButton from "../components/buttons/PrimaryButton";
import {
  BTN_HEIGHT_IN_MAIN_AREA,
  BTN_WIDTH_IN_MAIN_AREA,
  fadeInRight,
} from "../utils/constants";
import { useState } from "react";
import Reveal from "react-awesome-reveal";
import { calculateDailyDoshiRewardsByAPY } from "../utils/methods";

export default function Calculator({ className }) {
  const [principleAmount, setPrincipleAmount] = useState(null);
  const [apy, setApy] = useState(null);

  return (
    <div className={`${className} flex flex-col text-white `}>
      <div className="w-full grid grid-cols-1 md:grid-cols-5 gap-10">
        <div className="col-span-1 md:col-span-3 flex flex-col gap-10">
          <div className="text-[27px] font-normal text-center md:text-left">
            Calculate Your Daily Rewards
          </div>
          <Reveal keyframes={fadeInRight} className='onStep' delay={0} duration={800} triggerOnce>
            <div
              className="overflow-hidden relative min-h-[175px]    border-custom-medium-white bg-custom-light-white   border-[1px] rounded-3xl
            flex flex-col flex-wrap w-full justify-center gap-5
          "
            >
              <img
                src="/Cloud_Vector.svg"
                className="w-[163px] h-[81px] absolute -right-16 -top-6 "
                alt=""
              />
              <div className="flex justify-center w-full">
                <input
                  className={`w-[calc(100%-60px)] min-h-[86px] bg-custom-heavy-white border-custom-medium-white   text-[22px] border-[1px] rounded-lg font-medium px-10
                outline-none calculator-placeholder `}
                  placeholder="enter your principle amount"
                  type="number"
                  value={principleAmount}
                  onChange={(e) => setPrincipleAmount(e.target.value)}
                ></input>
              </div>
            </div>
            <div
              className="overflow-hidden relative min-h-[175px]    border-custom-medium-white bg-custom-light-white   border-[1px] rounded-3xl
            flex flex-col flex-wrap w-full justify-center gap-5
          "
            >
              <img
                src="/Cloud_Vector.svg"
                className="w-[163px] h-[81px] absolute -right-16 -top-6 "
                alt=""
              />
              <div className="flex justify-center w-full">
                <input
                  className="w-[calc(100%-60px)] min-h-[86px] bg-custom-heavy-white border-custom-medium-white    border-[1px] rounded-lg text-[22px] font-medium px-10
                outline-none calculator-placeholder
                "
                  placeholder="enter your preferred APY(%)"
                  type="number"
                  value={apy}
                  onChange={(e) => setApy(e.target.value)}
                ></input>
              </div>
            </div>
            <div className="">
              <PrimaryButton
                label="Calculate"
                width={BTN_WIDTH_IN_MAIN_AREA}
                height={BTN_HEIGHT_IN_MAIN_AREA}
              />
            </div>
            <div
              className="overflow-hidden relative min-h-[175px]   bg-custom-light-white border-custom-medium-white    border-[1px] rounded-3xl
            flex justify-center items-center gap-5 text-[35px] font-normal
          "
            >
              <img
                src="/Cloud_Vector.svg"
                className="w-[163px] h-[81px] absolute  -right-5 -top-5 "
                alt=""
              />
              {
                calculateDailyDoshiRewardsByAPY(principleAmount, apy) > 0 ?
                  parseFloat(calculateDailyDoshiRewardsByAPY(principleAmount, apy)).toFixed(2) + " Doshi"
                  : "Expected Daily Reward"
              }
            </div>
          </Reveal>
        </div>

        <div className="col-span-1 md:col-span-2 flex flex-col gap-10">
          <TotalValueLocked />
          <Performance className="h-[400px]" />
        </div>
        <History />
      </div>
    </div>
  );
}
