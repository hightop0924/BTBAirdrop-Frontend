// SidebarButton.js
import React, { useState } from "react";

const SidebarButton = ({ isActive, onClick, label, icon }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <button
      className={`sidebar-button bg-transparent border-none p-0 m-0 cursor-pointer ${isActive ? "active" : ""
        }`}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={`w-[200px] h-[59px] bg-cover bg-center flex justify-start gap-3 items-center ${isHovered && !isActive ? "hover" : ""
          }`}
        style={{
          backgroundImage: `url(${isActive ? "/Btn_bg_On.png" : ""})`,
        }}
      >
        <img
          src={`/sidebar/${isActive ? label + "_on.svg" : label + ".svg"}`}
          className={` ml-[50px] `}
          alt="tab icon"
        />
        <div
          className={`text-[16px] font-semibold ${isActive ? "text-white" : "text-custom-medium-white"}`}
        >
          {label}
        </div>
        {isActive && <div className="active-dot" />}
      </div>
    </button>
  );
};

export default SidebarButton;
