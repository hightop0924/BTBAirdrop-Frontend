
import SidebarButton from "./buttons/SideBarButton";
import { useNavigate } from "react-router-dom";
import { TabValues } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentPath } from "../redux-toolkit/reducers/Sidebar";

export default function SideBarComponent({ className }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const activeTab = useSelector(state => state.sidebar.currentPath);

  const onTabClick = (value) => {
    dispatch(setCurrentPath("/" + String(value).toLocaleLowerCase()));
    navigate("/" + String(value).toLocaleLowerCase());
  };

  return (
    <div
      className={`${className}  flex-col gap-6 rounded-3xl text-white items-center`}
    >
      <img
        src="/logo.png"
        className="w-[216x] h-[121px] my-8 "
        alt="logo "
      />
      {TabValues?.map((value, index) => (
        <SidebarButton
          key={index}
          label={value}
          isActive={activeTab?.toString().includes(value.toLowerCase())}
          onClick={() => onTabClick(value)}
        />
      ))}
    </div>
  );
}
