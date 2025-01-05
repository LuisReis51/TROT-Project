// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract TROTToken is ERC20, Ownable, Pausable {
    uint256 public constant INITIAL_SUPPLY = 8_000_000_000 * 10**18; // 8 billion tokens
    uint256 public constant MAX_SUPPLY = 10_000_000_000 * 10**18;    // 10 billion max
    
    // Provider staking tiers
    uint256 public constant BASIC_STAKE = 10_000 * 10**18;    // Basic tier
    uint256 public constant SILVER_STAKE = 50_000 * 10**18;   // Silver tier
    uint256 public constant GOLD_STAKE = 100_000 * 10**18;    // Gold tier
    uint256 public constant PLATINUM_STAKE = 250_000 * 10**18; // Platinum tier
    
    // Distribution pools
    uint256 public constant PUBLIC_SALE_POOL = INITIAL_SUPPLY * 40 / 100;     // 40%
    uint256 public constant DEVELOPMENT_POOL = INITIAL_SUPPLY * 20 / 100;      // 20%
    uint256 public constant TEAM_POOL = INITIAL_SUPPLY * 15 / 100;            // 15%
    uint256 public constant MARKETING_POOL = INITIAL_SUPPLY * 15 / 100;       // 15%
    uint256 public constant PROVIDER_POOL = INITIAL_SUPPLY * 10 / 100;        // 10%

    // Vesting periods
    uint256 public constant TEAM_VESTING_DURATION = 730 days;        // 2 years
    uint256 public constant TEAM_CLIFF_PERIOD = 180 days;            // 6 months cliff
    uint256 public constant ADVISOR_VESTING_DURATION = 365 days;     // 1 year
    uint256 public constant DEVELOPMENT_VESTING_DURATION = 365 days; // 1 year
    
    // Vesting start timestamp
    uint256 public vestingStart;
    
    // Mapping for service providers
    mapping(address => ServiceProvider) public serviceProviders;
    mapping(address => uint256) public providerStakes;
    
    // Vesting tracking
    mapping(address => VestingSchedule) public vestingSchedules;
    
    struct ServiceProvider {
        string name;
        bool isActive;
        uint256 rating;
        uint256 completedServices;
        uint256 stakingTime;
        uint256 tier;  // 1=Basic, 2=Silver, 3=Gold, 4=Platinum
    }

    struct VestingSchedule {
        uint256 totalAmount;
        uint256 claimedAmount;
        uint256 startTime;
        uint256 duration;
        uint256 cliffPeriod;
        bool isTeam;
        bool isAdvisor;
        bool isDevelopment;
    }

    // Events
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);
    event ProviderRegistered(address indexed provider, string name, uint256 stakedAmount, uint256 tier);
    event ProviderUnregistered(address indexed provider, uint256 unstakedAmount);
    event ServiceCompleted(address indexed provider, address indexed client, uint256 reward);
    event TokensVested(address indexed beneficiary, uint256 amount);
    event VestingScheduleCreated(address indexed beneficiary, uint256 amount, uint256 duration);

    constructor() ERC20("TIME ROUTE OPTIMIZATION TRENDS", "TROT") {
        _mint(address(this), INITIAL_SUPPLY);  // Mint to contract first
        vestingStart = block.timestamp;
        
        // Allocate public sale tokens to owner for distribution
        _transfer(address(this), owner(), PUBLIC_SALE_POOL);
    }

    // Get provider tier based on stake amount
    function getProviderTier(uint256 stakeAmount) public pure returns (uint256) {
        if (stakeAmount >= PLATINUM_STAKE) return 4;
        if (stakeAmount >= GOLD_STAKE) return 3;
        if (stakeAmount >= SILVER_STAKE) return 2;
        if (stakeAmount >= BASIC_STAKE) return 1;
        return 0;
    }

    // Provider registration with staking
    function registerProvider(string memory name, uint256 stakeAmount) public {
        require(stakeAmount >= BASIC_STAKE, "Stake too low");
        require(!serviceProviders[msg.sender].isActive, "Already registered");
        require(balanceOf(msg.sender) >= stakeAmount, "Insufficient balance");
        
        uint256 tier = getProviderTier(stakeAmount);
        require(tier > 0, "Invalid stake amount");
        
        _transfer(msg.sender, address(this), stakeAmount);
        providerStakes[msg.sender] = stakeAmount;
        
        serviceProviders[msg.sender] = ServiceProvider({
            name: name,
            isActive: true,
            rating: 0,
            completedServices: 0,
            stakingTime: block.timestamp,
            tier: tier
        });
        
        emit ProviderRegistered(msg.sender, name, stakeAmount, tier);
    }

    // Provider unregistration and unstaking
    function unregisterProvider() public {
        require(serviceProviders[msg.sender].isActive, "Not a registered provider");
        require(block.timestamp >= serviceProviders[msg.sender].stakingTime + 30 days, "Minimum staking period not met");
        
        uint256 stakeAmount = providerStakes[msg.sender];
        providerStakes[msg.sender] = 0;
        serviceProviders[msg.sender].isActive = false;
        
        _transfer(address(this), msg.sender, stakeAmount);
        emit ProviderUnregistered(msg.sender, stakeAmount);
    }

    // Service completion reward
    function completeService(address provider, uint256 reward) public onlyOwner {
        require(serviceProviders[provider].isActive, "Not an active provider");
        require(reward <= maxServiceReward(), "Reward too high");
        
        _mint(provider, reward);
        serviceProviders[provider].completedServices += 1;
        emit ServiceCompleted(provider, msg.sender, reward);
    }

    // Maximum reward per service (0.1% of total supply)
    function maxServiceReward() public view returns (uint256) {
        return totalSupply() / 1000;
    }

    // Create vesting schedule for team member
    function createTeamVesting(address beneficiary, uint256 amount) external onlyOwner {
        require(amount <= TEAM_POOL, "Exceeds team pool");
        _createVesting(beneficiary, amount, TEAM_VESTING_DURATION, TEAM_CLIFF_PERIOD, true, false, false);
    }
    
    // Create vesting schedule for advisor
    function createAdvisorVesting(address beneficiary, uint256 amount) external onlyOwner {
        require(amount <= TEAM_POOL, "Exceeds advisor pool");
        _createVesting(beneficiary, amount, ADVISOR_VESTING_DURATION, 0, false, true, false);
    }
    
    // Create vesting schedule for development fund
    function createDevelopmentVesting(address beneficiary, uint256 amount) external onlyOwner {
        require(amount <= DEVELOPMENT_POOL, "Exceeds development pool");
        _createVesting(beneficiary, amount, DEVELOPMENT_VESTING_DURATION, 0, false, false, true);
    }
    
    // Internal function to create vesting schedule
    function _createVesting(
        address beneficiary,
        uint256 amount,
        uint256 duration,
        uint256 cliffPeriod,
        bool isTeam,
        bool isAdvisor,
        bool isDevelopment
    ) internal {
        require(beneficiary != address(0), "Invalid address");
        require(amount > 0, "Amount must be > 0");
        require(vestingSchedules[beneficiary].totalAmount == 0, "Schedule exists");
        
        vestingSchedules[beneficiary] = VestingSchedule({
            totalAmount: amount,
            claimedAmount: 0,
            startTime: block.timestamp,
            duration: duration,
            cliffPeriod: cliffPeriod,
            isTeam: isTeam,
            isAdvisor: isAdvisor,
            isDevelopment: isDevelopment
        });
        
        emit VestingScheduleCreated(beneficiary, amount, duration);
    }
    
    // Claim vested tokens
    function claimVestedTokens() external {
        VestingSchedule storage schedule = vestingSchedules[msg.sender];
        require(schedule.totalAmount > 0, "No vesting schedule");
        
        uint256 vestedAmount = _calculateVestedAmount(schedule);
        uint256 claimableAmount = vestedAmount - schedule.claimedAmount;
        require(claimableAmount > 0, "No tokens to claim");
        
        schedule.claimedAmount = vestedAmount;
        _transfer(address(this), msg.sender, claimableAmount);
        
        emit TokensVested(msg.sender, claimableAmount);
    }
    
    // Calculate vested amount
    function _calculateVestedAmount(VestingSchedule memory schedule) internal view returns (uint256) {
        if (block.timestamp < schedule.startTime + schedule.cliffPeriod) {
            return 0;
        }
        
        if (block.timestamp >= schedule.startTime + schedule.duration) {
            return schedule.totalAmount;
        }
        
        return (schedule.totalAmount * (block.timestamp - schedule.startTime)) / schedule.duration;
    }

    // Standard ERC20 functions with pause capability
    function transfer(address to, uint256 amount) public override whenNotPaused returns (bool) {
        return super.transfer(to, amount);
    }

    function transferFrom(address from, address to, uint256 amount) public override whenNotPaused returns (bool) {
        return super.transferFrom(from, to, amount);
    }

    // Admin functions
    function mint(address to, uint256 amount) public onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Would exceed max supply");
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }
}
