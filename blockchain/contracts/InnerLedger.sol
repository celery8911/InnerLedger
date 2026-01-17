// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./GrowthSBT.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

contract InnerLedger is ERC2771Context {
    struct Record {
        bytes32 contentHash;
        uint256 timestamp;
        string emotion;
        address user;
    }

    Record[] public allRecords;
    mapping(address => uint256[]) public userRecordIds;
    GrowthSBT public growthSBT;

    event RecordCreated(
        address indexed user,
        bytes32 contentHash,
        uint256 timestamp
    );

    constructor(address _growthSBT, address _trustedForwarder)
        ERC2771Context(_trustedForwarder)
    {
        growthSBT = GrowthSBT(_growthSBT);
    }

    function createRecord(string memory emotion, bytes32 contentHash) external {
        address sender = _msgSender();

        allRecords.push(
            Record({
                contentHash: contentHash,
                timestamp: block.timestamp,
                emotion: emotion,
                user: sender
            })
        );
        userRecordIds[sender].push(allRecords.length - 1);

        emit RecordCreated(sender, contentHash, block.timestamp);

        uint256 count = userRecordIds[sender].length;
        if (count == 1) {
            try growthSBT.mint(sender, "Journey Begins") {} catch {}
        } else if (count == 7) {
            try growthSBT.mint(sender, "First Week") {} catch {}
        }
    }

    function getJourney(address user) external view returns (Record[] memory) {
        uint256[] memory ids = userRecordIds[user];
        Record[] memory records = new Record[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            records[i] = allRecords[ids[i]];
        }
        return records;
    }

    function getRecordCount(address user) external view returns (uint256) {
        return userRecordIds[user].length;
    }
}
