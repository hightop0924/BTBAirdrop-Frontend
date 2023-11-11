import Reveal from "react-awesome-reveal";
import { fadeInUp } from "../utils/constants";

export default function Claim({ className }) {
  return (
    <div className={`${className} flex flex-col text-white `}>
      <div className="w-full grid grid-cols-1 md:grid-cols-5 md:grid-rows-3 gap-10">
        <div
          className="overflow-hidden relative min-h-[350px] bg-custom-light-white border-custom-medium-white  border-[1px] rounded-3xl
          flex flex-wrap pt-20 w-full justify-center gap-5
          md:col-span-5
          md:row-span-2
        "
        >
          <img
            src="/Cloud_Vector.svg"
            className="w-[163px] h-[81px] absolute  -right-5 -top-5 "
            alt=""
          />

          <Reveal keyframes={fadeInUp} className='onStep' delay={0} duration={800} triggerOnce>
            <div className="text-[38px] font-semibold text-center px-10 py-10 ">

            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
