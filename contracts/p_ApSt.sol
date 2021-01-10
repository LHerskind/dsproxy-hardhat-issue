// Approve and stake solidity

// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

interface MINIERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

interface MINISTAKE {
    function stakeFunds(uint256 amount) external;
    function withdrawFunds(uint256 amount) external;
}

contract ProxyApproveStake { //Within this, we have the message sender!
    function approveNStake(address _erc20, address _stakepool, uint256 _amount) public {
        MINIERC20 token = MINIERC20(_erc20);
        require(token.transferFrom(msg.sender, address(this), _amount));
        token.approve(_stakepool, _amount);
        MINISTAKE(_stakepool).stakeFunds(_amount);
    }

    function withdraw(address _erc20, address _stakepool, uint256 _amount) public {
        MINISTAKE(_stakepool).withdrawFunds(_amount);
        require(MINIERC20(_erc20).transfer(msg.sender, _amount));
    }
}


