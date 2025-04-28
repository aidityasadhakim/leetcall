import { Permit } from "permitio";

export const permitClient = new Permit({
  token: process.env.PERMIT_API_KEY as string,
  pdp: process.env.PERMIT_PDP as string,
});
