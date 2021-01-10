// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "./lib/token/ERC20/ERC20.sol";
import "hardhat/console.sol";

contract Synthetix is ERC20 {

    address public owner;

    constructor () ERC20("Synthetix", "SNX"){
        owner = msg.sender;
    }

    function mint(address to_, uint amount_) public {
        require(owner == msg.sender, "Not owner");
        _mint(to_, amount_);
    }

    function burn(uint amount_) public{
        _burn(msg.sender, amount_);
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override { 
        //console.log("transfer", msg.sender, from, balanceOf(from));
    }

}