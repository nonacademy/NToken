// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract NToken is ERC20Capped, ERC20Burnable {

    address payable public owner;
    uint256 public blockReward;

    constructor(uint256 cap, uint256 reward) ERC20("NToken", "NTC") ERC20Capped(cap * (10 ** decimals())){
        owner = payable(msg.sender);
        _mint(owner, 80000000 * (10 ** decimals()));

        blockReward = reward * (10 ** decimals());
    }

    function _mint(address account, uint256 amount) internal virtual override (ERC20, ERC20Capped) {
        require(ERC20.totalSupply() + amount <= cap(), "ERC20Capped: cap exceeded");
        super._mint(account, amount);
    }

    function _mintMinerReward() internal {
        _mint(block.coinbase, blockReward);
    }

    function _beforeTokenTransfer (address from, address to, uint256 value) internal virtual override{
        if(from != address(0) && to != address(0) && block.coinbase != address(0)){
            _mintMinerReward();
        }

        super._beforeTokenTransfer(from, to, value);
    }

    function setBlockReward(uint256 reward) public onlyOwner{
        blockReward = reward * (10 ** decimals());
    }

    function destroy() public onlyOwner{
        selfdestruct(payable(owner));
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
}