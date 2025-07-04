import { ethers } from "hardhat";
import DAppTokenABI from "../artifacts/contracts/DAppToken.sol/DAppToken.json";
import "dotenv/config";

const { ALCHEMY_API_KEY, SEPOLIA_PRIVATE_KEY, DAAPTOKEN } = process.env;
const provider = new ethers.JsonRpcProvider(
  `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
);
// en esta linea conecta a metamask
const wallet = new ethers.Wallet(`${SEPOLIA_PRIVATE_KEY}`, provider);

const DAppTokenContract = new ethers.Contract(
  `${DAAPTOKEN}`,
  DAppTokenABI.abi,
  wallet
);
const mint = async (to: string, amount: number) => {
  try {
    const amountParsed = ethers.parseUnits(amount.toString(), 18);
    const transaction = await DAppTokenContract.mint(to, amountParsed);
    const response = await transaction.wait();
    console.log(response);
  } catch (error) {
    console.log(error);
  }
};

const transferOwner = async(newOwner:string)=>{
try {
 const sendNewOwner = await DAppTokenContract.transferOwnership(newOwner);
const response = await sendNewOwner.wait();
console.log(response)
} catch (error) {
  console.log(error)
}
}

const main = async()=>{
 // await mint("0x06cac7b9F869b2c6D39991f10d7BC3220d303532",1000)
   await transferOwner("0x06cac7b9F869b2c6D39991f10d7BC3220d303532")
}
main();