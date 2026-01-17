import { ethers } from "hardhat";

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Testing with account:", signer.address);

  // Contract addresses
  const INNER_LEDGER_ADDRESS = "0x622a9E2c8E13B930C54D4263A00ee4BAC2930e3D";
  const GROWTH_SBT_ADDRESS = "0x3c689A9800e1216CCEa4cC0D264D7A1422aCd0d1";

  // Get contract instances
  const innerLedger = await ethers.getContractAt("InnerLedger", INNER_LEDGER_ADDRESS);
  const growthSBT = await ethers.getContractAt("GrowthSBT", GROWTH_SBT_ADDRESS);

  console.log("\n=== Testing InnerLedger ===");

  // Test 1: Get record count
  const recordCount = await innerLedger.getRecordCount(signer.address);
  console.log("Current record count:", recordCount.toString());

  // Test 2: Get journey
  const journey = await innerLedger.getJourney(signer.address);
  console.log("Journey records:", journey.length);

  if (journey.length > 0) {
    console.log("\nLatest record:");
    const latest = journey[journey.length - 1];
    console.log("- Emotion:", latest.emotion);
    console.log("- Timestamp:", new Date(Number(latest.timestamp) * 1000).toLocaleString());
    console.log("- Content Hash:", latest.contentHash);
  }

  console.log("\n=== Testing GrowthSBT ===");

  // Test 3: Check SBT balance
  const sbtBalance = await growthSBT.balanceOf(signer.address);
  console.log("SBT balance:", sbtBalance.toString());

  // Test 4: Check GrowthSBT owner
  const sbtOwner = await growthSBT.owner();
  console.log("GrowthSBT owner:", sbtOwner);
  console.log("Is InnerLedger the owner?", sbtOwner === INNER_LEDGER_ADDRESS);

  console.log("\n=== Contract Verification ===");
  console.log("✅ All tests completed successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
