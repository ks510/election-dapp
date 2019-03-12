pragma solidity ^0.4.25;

contract Election {
  // Model a Candidate and related info
  struct Candidate {
    uint id;        //candidate[0]
    string name;    //candidate[1]
    uint voteCount; //candidate
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

  function addCandidate(string _name) private {
    candidatesCount++;
    candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
  }
}
