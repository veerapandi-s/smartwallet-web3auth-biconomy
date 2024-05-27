// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UserRegistry {
    // Array to store registered user addresses
    address[] private users;
    
    // Mapping to check if an address is already registered
    mapping(address => bool) private registered;

    // Event to emit when a user is registered
    event UserRegistered(address indexed user);

    // Function to register a user
    function register() external {
        // Ensure the user is not already registered
        require(!registered[msg.sender], "User already registered");

        // Add user to the users array
        users.push(msg.sender);

        // Mark the user as registered
        registered[msg.sender] = true;

        // Emit the UserRegistered event
        emit UserRegistered(msg.sender);
    }

    // Function to get the total count of registered users
    function getUserCount() external view returns (uint256) {
        return users.length;
    }

    // Function to get a list of registered users in a specified range
    function getUsersInRange(uint256 start, uint256 end) external view returns (address[] memory) {
        require(start < end, "Start index must be less than end index");
        require(end <= users.length, "End index out of bounds");

        // Calculate the length of the array to return
        uint256 length = end - start;
        
        // Create a fixed-size array to hold the users in the specified range
        address[] memory usersInRange = new address[](length);

        // Copy users from the specified range into the new array
        for (uint256 i = 0; i < length; i++) {
            usersInRange[i] = users[start + i];
        }

        return usersInRange;
    }

    // Function to check if a user is registered
    function isUserRegistered(address user) external view returns (bool) {
        return registered[user];
    }
}
