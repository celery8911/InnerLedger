// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GrowthSBT is ERC721, Ownable {
    uint256 private _nextTokenId;
    mapping(uint256 => string) public milestones;

    constructor() ERC721("GrowthSBT", "GSBT") Ownable(msg.sender) {}

    function mint(address to, string memory milestoneName) external onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        milestones[tokenId] = milestoneName;
    }

    // Override _update to restrict transfers (Soulbound)
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);
        // If it's not a mint (from=0) and not a burn (to=0), reject transfer
        if (from != address(0) && to != address(0)) {
            revert("Soulbound: Transfer not allowed");
        }
        return super._update(to, tokenId, auth);
    }
}
