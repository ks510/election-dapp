pragma solidity ^0.4.25;

contract Election {
  // Model a Candidate and related info
  struct Candidate {
    uint id;        //candidate[0]
    string name;    //candidate[1]
    uint voteCount; //candidate
  }
  // Store accounts that have voted
  mapping(address => bool) public voters;
  // Store Candidates
  mapping(uint => Candidate) public candidates;
  // Store candidates Count
  uint public candidatesCount;

  constructor () public {
    addCandidate("Candidate 1");
    addCandidate("Candidate 2");
  }

  function addCandidate(string _name) private {
    candidatesCount++;
    candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
  }

  function vote (uint _candidateId) public {
    require(!voters[msg.sender]); // check this account hasn't voted before
    require(_candidateId > 0 && _candidateId <= candidatesCount); // check if candidate is valid

    voters[msg.sender] = true; // record that account has voted
    candidates[_candidateId].voteCount++; // get candidate and update candidate vote count
  }
}
