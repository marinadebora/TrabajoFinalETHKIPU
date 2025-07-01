import { ethers } from "hardhat";
import LPTokenABI from "../artifacts/contracts/LPToken.sol/LPToken.json";
import "dotenv/config";

const { ALCHEMY_API_KEY, SEPOLIA_PRIVATE_KEY, LPTOKEN, OWNER } = process.env;
const provider = new ethers.JsonRpcProvider(
  `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
);
// en esta linea conecta a metamask
const wallet = new ethers.Wallet(`${SEPOLIA_PRIVATE_KEY}`, provider);

const LPTokenContract = new ethers.Contract(
  `${LPTOKEN}`,
  LPTokenABI.abi,
  wallet
);

const mint = async (to: string, amount: number) => {
  try {
    const amountParsed = ethers.parseUnits(amount.toString(), 18);
    const transaction = await LPTokenContract.mint(to, amountParsed);
    const response = await transaction.wait();
    console.log(response);
  } catch (error) {
    console.log(error);
  }
};
const owner = async () => {
  const callOwner = await LPTokenContract.owner();

  console.log("El owner del LPToken es:", callOwner);
};

const approve = async (spender: string, amount: number) => {
  try {
    let recibeAmount = ethers.parseUnits(amount.toString(), 18);
    const tx = await LPTokenContract.approve(spender, recibeAmount);
    const response = await tx.wait();
    console.log("Approve transaction:", response);
  } catch (error) {
    console.log(error);
  }
};
const main = async () => {
  //await mint(`0x8Ce268046ae216316deC5BcD8cfd61a3F1EEE7BC`,1000)
  await approve("0x06cac7b9F869b2c6D39991f10d7BC3220d303532", 1000);
  //await owner()
};
main();
