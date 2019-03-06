pragma solidity ^0.4.11;

contract Electrion {
  // Store candidate
  // Read candidate
  string public candidate;
  // Constructor
  function Election () public {
    candidate = "Candidate 1";
  }
}
