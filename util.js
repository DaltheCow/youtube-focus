import { VID_PL_REGEX } from "./constants";

export const vidOrPL = (url) => {
  const res = url.match(VID_PL_REGEX);
  return { isPL: Boolean(res[1] || res[7]),
           PlID: res[2] || res[8],
           isVid: Boolean((res[3] && res[4])),
           vidID: res[4] };
};
