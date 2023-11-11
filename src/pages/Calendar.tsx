
import History from "../components/History";
import Calendar from "../components/Calandar";
import { fadeInLeft } from "../utils/constants";
import Reveal from "react-awesome-reveal";

export default function CalendarPage({ className }) {

  return (
    <div className={`${className} flex flex-col text-white `}>
      <div className="w-full grid grid-cols-1  md:grid-cols-5 md:grid-rows-4 gap-10">
        <div
          className="overflow-hidden relative h-full  border-custom-medium-white bg-custom-light-white   border-[1px] rounded-3xl
            flex flex-col justify-center  w-full  gap-6
            md:col-span-5            
            h-max
            py-10
          "
        >
          <img
            src="/Cloud_Vector.svg"
            className="w-[163px] h-[81px] absolute  -right-5 -top-5 "
            alt=""
          />
          <div className="pt-20 md:pt-0  text-[24px] md:text-[38px] font-semibold text-center">
            View Your Staking Calender
          </div>

          <div className="w-full h-[400px] my-5 md:my-0 md:h-[500px] flex justify-center">
            <div className="w-full px-2 md:w-9/12 md:px-0 h-full">
              <Calendar />
            </div>
          </div>

        </div>

        <History className={"max-h-[400px]"} />
      </div>
    </div>
  );
}
