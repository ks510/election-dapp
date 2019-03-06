pragma solidity ^0.4.25;

contract Election {
  // Model a Candidate and related info
  struct Candidate {
    uint id;
    string name;
    uint voteCount;
  }
  // Store Candidates
  // Fetch Candidate
  mapping(uint => Candidate) public candidates;
  // Store candidates Count
  uint public candidatesCount;

  constructor () public {
    addCandidate("Candidate 1");
    addCandidate("Candidate 2");
  }

  function addCandidate (String _name) private {
    candidateCount++;
    candidates[candidateCount] = Candidate(candidatesCount, _name, 0);
  }
}
