import notFoundBG_1 from "./notFoundBG_1.png";
import notFoundBG_2 from "./notFoundBG_2.png";
import notFoundText from "./notFoundText.png";
import landingPageBG_1 from "./landingPageBG_1.png";
import landingPageBG_2 from "./landingPageBG_2.png";
import logoStorixWithText from "./logoStorixWithText.png";
import landingPageCustomer_1 from "./landingPageCustomer_1.png";
import landingPageCustomer_2 from "./landingPageCustomer_2.png";
import landingPageCustomer_3 from "./landingPageCustomer_3.png";
import logoStorixWithoutText from "./logoStorixWithoutText.png";

const images = {
  notFoundBG_1,
  notFoundBG_2,
  notFoundText,
  landingPageBG_1,
  landingPageBG_2,
  landingPageCustomer_1,
  landingPageCustomer_2,
  landingPageCustomer_3,
  logoStorixWithText,
  logoStorixWithoutText,
};

const chooseImage = (imageName) => {
  return images[imageName];
};

export default chooseImage;
