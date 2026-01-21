import notFoundBG_1 from "./notFoundBG_1.png";
import notFoundBG_2 from "./notFoundBG_2.png";
import notFoundText from "./notFoundText.png";
import registerIcon from "./registerIcon.png";

const images = {
  notFoundBG_1,
  notFoundBG_2,
  notFoundText,
  registerIcon,
};

const chooseImage = (imageName) => {
  return images[imageName];
};

export default chooseImage;
