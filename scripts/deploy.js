const hre = require("hardhat");

async function main() {
  console.log("Deploying TROT Token...");

  // Deploy the token contract
  const TROTToken = await hre.ethers.getContractFactory("TROTToken");
  const token = await TROTToken.deploy();
  await token.deployed();

  console.log("TROT Token deployed to:", token.address);
  
  // Verify the contract on Etherscan
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("Waiting for block confirmations...");
    await token.deployTransaction.wait(6); // Wait for 6 block confirmations
    
    console.log("Verifying contract...");
    await hre.run("verify:verify", {
      address: token.address,
      constructorArguments: [],
    });
  }

  // Set up initial vesting schedules
  const [deployer] = await ethers.getSigners();
  
  // Example team member vesting
  const teamMember = "0x..."; // Replace with actual address
  const teamAllocation = ethers.utils.parseEther("1000000"); // 1M tokens
  await token.createTeamVesting(teamMember, teamAllocation);
  
  console.log("Initial setup complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
