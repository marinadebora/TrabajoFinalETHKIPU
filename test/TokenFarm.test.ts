import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect, use } from "chai";
import hre, { ethers } from "hardhat";
import { Contract, Signer } from "ethers";

describe("TokenFarm", () => {
  //defino un elemento base para reutilizar en cada test
  const deployTokenFarm = async () => {
    const [owner, treasury, user1, user2] = await hre.ethers.getSigners();
    const ownerAdd = owner.address;
    const treasuryAdd = treasury.address;
    const DAppToken = await hre.ethers.getContractFactory("DAppToken");
    const dAppToken = await DAppToken.deploy(ownerAdd);
    const dAppTokenAdd = await dAppToken.getAddress();
    const LPToken = await hre.ethers.getContractFactory("LPToken");
    const lPToken = await LPToken.deploy(ownerAdd);
    const lPTokenAdd = await lPToken.getAddress();
    const TokenFarm = await hre.ethers.getContractFactory("TokenFarm");
    const tokenFarm = await TokenFarm.deploy(
      dAppTokenAdd,
      lPTokenAdd,
      treasuryAdd
    );
    // Transferir ownership a TokenFarm
    await dAppToken
      .connect(owner)
      .transferOwnership(await tokenFarm.getAddress());
    return { tokenFarm, dAppToken, lPToken, owner, treasury, user1, user2 };
  };
  // funcion para reutilizar realiza mint, approve y deposit
  const prepareUserStake = async (
    tokenFarm: any,
    lpToken: any,
    owner: any,
    user: any,
    amount: number
  ) => {
    const TFAdd = await tokenFarm.getAddress();
    await lpToken.connect(owner).mint(user.address, amount);
    await lpToken.connect(user).approve(TFAdd, amount);
    await tokenFarm.connect(user).deposit(amount);
    await ethers.provider.send("evm_mine", []);
  };

  describe("mint", () => {
    it("should mint LP tokens for a user and make a deposit of those tokens", async () => {
      const { tokenFarm, lPToken, owner, user1 } = await loadFixture(
        deployTokenFarm
      );
      const userAdd = user1.address;
      const contarctAdd = await tokenFarm.getAddress();
      const depositAmount = 1000;
      //Acuñar (mint) tokens LP para un usuario
      await lPToken.connect(owner).mint(userAdd, depositAmount);
      //verifica que el usuario reciba los tokens
      expect(await lPToken.balanceOf(userAdd)).to.equal(depositAmount);
      //el usuario da permiso al contrato
      await lPToken.connect(user1).approve(contarctAdd, depositAmount);
      //elusuario realiza un deposito
      await tokenFarm.connect(user1).deposit(depositAmount);
      //verifica que el contrato reciba los tokens
      expect(await lPToken.balanceOf(contarctAdd)).to.equal(depositAmount);
    });

    it("should properly distribute rewards to all staking users.", async () => {
      const { tokenFarm, lPToken, owner, user1, user2 } = await loadFixture(
        deployTokenFarm
      );
      const depositAmount = 1000;
      //llama a la funcion que realiza mit approve deosit para cada user
      await prepareUserStake(tokenFarm, lPToken, owner, user1, depositAmount);
      await prepareUserStake(tokenFarm, lPToken, owner, user2, depositAmount);
      await ethers.provider.send("evm_mine", []);
      await tokenFarm.connect(owner).distributeRewardsAll();
      const structUser1 = await tokenFarm.structUser(user1.address);
      const structUser2 = await tokenFarm.structUser(user2.address);
      expect(structUser1.pendingRewards).to.be.gt(0);
      expect(structUser2.pendingRewards).to.be.gt(0);
    });

    it("The user should claim rewards and verify that they were successfully transferred to their account", async () => {
      const { tokenFarm, dAppToken, lPToken, owner, user1 } = await loadFixture(
        deployTokenFarm
      );
      let depositAmount = 2500;
      await prepareUserStake(tokenFarm, lPToken, owner, user1, depositAmount);
      await tokenFarm.connect(owner).distributeRewardsAll();
      await ethers.provider.send("evm_mine", []);
      const beforeBalance = await dAppToken.balanceOf(user1.address);
      await tokenFarm.connect(user1).claimRewards();
      const afterBalance = await dAppToken.balanceOf(user1.address);
      //verifica que el usuario reciba los tokens
      expect(afterBalance - beforeBalance).to.be.greaterThan(0n);
    });

    it("Allowing a user to unstake all deposited LP tokens and claim any outstanding rewards.", async () => {
      const { tokenFarm, dAppToken, lPToken, owner, user1 } = await loadFixture(
        deployTokenFarm
      );
      let depositAmount = 2000;
      await prepareUserStake(tokenFarm, lPToken, owner, user1, depositAmount);
      await ethers.provider.send("evm_mine", []);
      await tokenFarm.connect(owner).distributeRewardsAll();
      const userPendingRewards = await tokenFarm.structUser(user1.address);
      expect(userPendingRewards.pendingRewards).to.be.gt(0);
      await tokenFarm.connect(user1).withdraw();
      const userStruct = await tokenFarm.structUser(user1.address);
      //verifica que stakingBalance vuelva aser 0 y isStaking sea false
      expect(userStruct.stakingBalance).to.equal(0);
      expect(userStruct.isStaking).to.equal(false);
      // reclama recompensa
      const beforeRewardBalance = await dAppToken.balanceOf(user1.address);
      await tokenFarm.connect(user1).claimRewards();
      const afterRewardBalance = await dAppToken.balanceOf(user1.address);
      //verifica que recibio los tokens
      expect(afterRewardBalance - beforeRewardBalance).to.be.gt(0n);
      //verifica que pendingRewards vuelve a ser 0
      const userStructFinal = await tokenFarm.structUser(user1.address);
      expect(userStructFinal.pendingRewards).to.equal(0);
    });
  });
});

/* 🧠 Otros ejemplos útiles
.to.equal(100) — exactamente igual a 100

.to.be.gte(50) — mayor o igual a 50

.to.be.lt(10) — menor que 10

.to.not.equal(0) — diferente de 0 */
