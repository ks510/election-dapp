pragma solidity ^0.4.25;

contract Election {
  // Store candidate
  // Read candidate
  string public candidate;
  // Constructor
  constructor () public {
    candidate = "Candidate 1";
  }
}
