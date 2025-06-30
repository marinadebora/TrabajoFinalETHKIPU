import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import "dotenv/config";
const { OWNER } = process.env;

const LPTokenModule = buildModule("LPTokenModule",(m) => {
    const initialOwner = m.getParameter("initialOwner",`${OWNER}`);
    const lpToken = m.contract("LPToken",[initialOwner])
    return { lpToken }
});
export default LPTokenModule
