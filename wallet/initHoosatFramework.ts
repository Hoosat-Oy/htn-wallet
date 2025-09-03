import { Wallet } from "./wallet";

export const initHoosatFramework = async () => {
  // console.log("Hoosat - framework: init");
  await Wallet.initRuntime();
  // console.log("Hoosat - framework: ready");
};
