import React from "react";
import chooseImage from "../../assets/images";

const NotFound = () => {
  return (
    <div className="relative h-screen overflow-hidden">
      {/* Background right */}
      <img
        src={chooseImage("notFoundBG_1")}
        className="
          absolute right-0 bottom-0 z-10
          h-[60%] sm:h-[70%] md:h-full
          object-contain
        "
        alt=""
      />

      {/* Background left */}
      <img
        src={chooseImage("notFoundBG_2")}
        className="
          absolute left-0 bottom-0 z-10
          h-[30%] sm:h-[35%] md:h-[40%]
          object-contain
        "
        alt=""
      />

      {/* Text on top */}
      <div className="absolute inset-0 z-30 flex items-center justify-center">
        <img
          src={chooseImage("notFoundText")}
          className="
            w-[80%]
            sm:w-[65%]
            md:w-[45%]
            lg:w-[35%]
            object-contain
          "
          alt="Not Found"
        />
      </div>
    </div>
  );
};

export default NotFound;
