import { ethers } from "hardhat";
import tokenFarmABI from "../artifacts/contracts/TokenFarm.sol/TokenFarm.json";
import "dotenv/config";

const { ALCHEMY_API_KEY, SEPOLIA_PRIVATE_KEY, TOKENFARM } = process.env;
const provider = new ethers.JsonRpcProvider(
  `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
);
// en esta linea conecta a metamask
const wallet = new ethers.Wallet(`${SEPOLIA_PRIVATE_KEY}`, provider);

const tokenFarmContract = new ethers.Contract(
  `${TOKENFARM}`,
  tokenFarmABI.abi,
  wallet
);

const deposit = async (amount: number) => {
  try {
    let recibeAmount = ethers.parseUnits(amount.toString(), 18);
    const newDeposit = await tokenFarmContract.deposit(recibeAmount);
    const respons = await newDeposit.wait();
    console.log(respons);
  } catch (error) {
    console.log(error);
  }
};

const withdraw = async()=>{
  try {
  const withdrawal = await tokenFarmContract.withdraw();
  const response = await withdrawal.wait();
  console.log(response)
  } catch (error) {
    console.log(error)
  }
}

const claimRewards = async()=>{
  try {
    const claim = await tokenFarmContract.claimRewards();
    const response = await claim.wait();
    console.log(response)
  } catch (error) {
    console.log(error)
  }
}

const distributeRewardsAll = async()=>{
  try {
    const distributeAll = await tokenFarmContract.distributeRewardsAll();
    const response = await distributeAll.wait();
    console.log(response)
  } catch (error) {
    console.log(error)
  }
}

const modifyReward = async(amount:number)=>{
  try {
     const parsedAmount = ethers.parseUnits(amount.toString(), 18);
    const distribute = await tokenFarmContract.modifyReward(parsedAmount);
    const response = await distribute.wait();
    console.log(response)
  } catch (error) {
    console.log(error)
  }
}
const blockNumber = async()=>{
  const block = await provider.getBlockNumber();
  console.log(block)
}

const getAccruedFees = async()=>{
  const accruedFees = await tokenFarmContract.getAccruedFees();
  console.log(accruedFees)
}

const withdrawProfits =async()=>{
    const profits = await tokenFarmContract.withdrawProfits();
    const response = await profits.wait();
    console.log(response)
}

const main = async () => {
  //await deposit(1000);
 // await withdraw();
 //await claimRewards();
 //await distributeRewardsAll()
 //await modifyReward()
 //await blockNumber()
await getAccruedFees()
//await withdrawProfits()
};
main();
