import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // 1. Deploy Forwarder (for Gasless transactions)
  const forwarder = await ethers.deployContract("InnerLedgerForwarder");
  await forwarder.waitForDeployment();
  const forwarderAddress = await forwarder.getAddress();
  console.log("InnerLedgerForwarder deployed to:", forwarderAddress);

  // 2. Deploy GrowthSBT
  const growthSBT = await ethers.deployContract("GrowthSBT");
  await growthSBT.waitForDeployment();
  const growthSBTAddress = await growthSBT.getAddress();
  console.log("GrowthSBT deployed to:", growthSBTAddress);

  // 3. Deploy InnerLedger with Forwarder
  const innerLedger = await ethers.deployContract("InnerLedger", [
    growthSBTAddress,
    forwarderAddress,
  ]);
  await innerLedger.waitForDeployment();
  const innerLedgerAddress = await innerLedger.getAddress();
  console.log("InnerLedger deployed to:", innerLedgerAddress);

  // 4. Transfer ownership of GrowthSBT to InnerLedger so it can mint
  console.log("Transferring GrowthSBT ownership to InnerLedger...");
  await growthSBT.transferOwnership(innerLedgerAddress);
  console.log("GrowthSBT ownership transferred to InnerLedger");

  // 5. Print summary
  console.log("\n=== Deployment Summary ===");
  console.log("Forwarder:", forwarderAddress);
  console.log("GrowthSBT:", growthSBTAddress);
  console.log("InnerLedger:", innerLedgerAddress);
  console.log("\n=== Environment Variables (add to frontend/.env.local) ===");
  console.log(`NEXT_PUBLIC_FORWARDER_ADDRESS=${forwarderAddress}`);
  console.log(`NEXT_PUBLIC_INNER_LEDGER_ADDRESS=${innerLedgerAddress}`);
  console.log(`NEXT_PUBLIC_GROWTH_SBT_ADDRESS=${growthSBTAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
