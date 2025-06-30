import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import "dotenv/config";
const { DAAPTOKEN,LPTOKEN,TREASURY } = process.env;

const TokenFarmModule = buildModule("TokenFarmModule",(m) => {
    const daapToken = m.getParameter("daapToken",`${DAAPTOKEN}`);
    const lpToken = m.getParameter("lpToken",`${LPTOKEN}`);
    const tresaury = m.getParameter("tresaury",`${TREASURY}`);
    const tokenFarm = m.contract("TokenFarm",[daapToken,lpToken,tresaury])
    return { tokenFarm }
});
export default TokenFarmModule