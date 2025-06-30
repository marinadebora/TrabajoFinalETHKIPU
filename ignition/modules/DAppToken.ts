import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import "dotenv/config";
const { OWNER } = process.env;

const DAppTokenModule = buildModule("DAppTokenModule",(m) => {
    const initialOwner = m.getParameter("initialOwner",`${OWNER}`);
    const dappToken = m.contract("DAppToken",[initialOwner])
    return { dappToken}
});
export default DAppTokenModule