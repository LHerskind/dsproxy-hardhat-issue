// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "./lib/math/SafeMath.sol";
import "./lib/token/ERC20/IERC20.sol";

contract StakerPool {// Simply a pool, there is no nice token.
    using SafeMath for uint256;
    // Taking care of the staking.
    uint256 _totalSupply;
    mapping(address => uint256) _balances;

    IERC20 stakingToken;

    //uint256 public lastUpdateTime;
    //uint256 public rewardPerTokenStored;

    //mapping(address => uint256) public userRewardPerTokenPaid;
    //mapping(address => uint256) public rewards;
    //mapping(address => uint256) public userDebt;

    constructor(address token_){
        stakingToken = IERC20(token_);
    }

    function totalSupply() external view returns(uint256){
        return _totalSupply;
    }

    function balanceOf(address account) external view returns(uint256){
        return _balances[account];    
    }
    
    function stakeFunds(uint256 amount) external {
        require(amount > 0, "Cannot stake 0");
        _totalSupply = _totalSupply.add(amount);
        _balances[msg.sender] = _balances[msg.sender].add(amount);
        stakingToken.transferFrom(msg.sender, address(this), amount);
    }

    function withdrawFunds(uint256 amount) external {
        require(amount > 0, "Cannot withdraw 0");
        _totalSupply = _totalSupply.sub(amount);
        _balances[msg.sender] = _balances[msg.sender].sub(amount); // Throws if < 0
        stakingToken.transfer(msg.sender, amount);
    }

}


