var Election = artifacts.require("./Election.sol");

contract("Election", function (accounts) {
  var electionInstance; //all tests will have access to this

  it("initializes with two candidates", function() { //description of test
    return Election.deployed().then(function(instance) { //fetch contract instance
      return instance.candidatesCount(); //callback functon gets contract attribute
    }).then(function(count) { //getters are asynchronous so use callback function
      assert.equal(count, 2); //to acccess returned value and do test assertion
    });
  });

  it("initializes the candidates with the correct values", function () {
    return Election.deployed().then(function(instance) {
        electionInstance = instance; // assign instance so we can use it in further callbacks
        return electionInstance.candidates(1); // get 1st candidate
    }).then(function(candidate) {
      assert.equal(candidate[0], 1, "contains the correct id");
      assert.equal(candidate[1], "Candidate 1", "contains the correct name");
      assert.equal(candidate[2], 0, "contains the correct votes count");
      return electionInstance.candidates(2); // get 2nd candidate
    }).then(function(candidate) {
      assert.equal(candidate[0], 2, "contains the correct id");
      assert.equal(candidate[1], "Candidate 2", "contains the correct name");
      assert.equal(candidate[2], 0, "contains the correct votes count");
    });
  });

  it("allows a voter to cast a vote and record voter", function() {
    return Election.deployed().then(function(instance) {
      electionInstance = instance;
      candidateId = 1; // candidate id to vote for
      return electionInstance.vote(candidateId, {from: accounts[0]}); // cast vote with first ganache account
    }).then(function(receipt) { // check transaction receipt for event
      assert.equal(receipt.logs.length, 1, "an event was triggered");
      assert.equal(receipt.logs[0].event, "votedEvent", "the event type is correct");
      assert.equal(receipt.logs[0].args._candidateId.toNumber(), candidateId, "the candidate id is correct");
      return electionInstance.voters(accounts[0]);
    }).then(function(voted) {
      assert(voted, "the voter was marked as voted"); // check the account was recorded
      return electionInstance.candidates(candidateId);
    }).then(function(candidate) {
      var voteCount = candidate[2]; // get voteCount attribute
      assert(voteCount, 1, "candidate's vote count was incremented"); // check vote count was increased to 1
    });
  });

  it("throws an exception for invalid candidate", function() {
    return Election.deployed().then(function(instance) { // get contract instance
      electionInstance = instance;
      //vote for invalid candidate 0
      return electionInstance.vote(0, { from: accounts[1] });
    }).then(assert.fail).catch(function(error) { // assert exception thrown
      // catch error and inject into callback function
      // callback checks if the correct error message was received (revert)
      assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
      return electionInstance.candidates(1);
    }).then(function(candidate1) { // check candidates votes did not increase to ensure state of contract is unchanged
      var voteCount = candidate1[2];
      assert(voteCount, 1, "candidate 1 did not receive any votes"); // previous test voted for this candidate
      return electionInstance.candidates(2);
    }).then(function(candidate2) {
      var voteCount = candidate2[2];
      assert(voteCount, 0, "candidate 2 did not receive any votes"); // no votes for this candidate yet
    });
  });

  it("throws an exception for double voting", function() {
    return Election.deployed().then(function(instance) {
      electionInstance = instance;
      candidateId = 2; // vote for candidate 2 using account 1
      electionInstance.vote(2, { from: accounts[1]} );
      return electionInstance.candidates(2);
    }).then(function(candidate) { // check vote count incremented
      var voteCount = candidate[2];
      assert(voteCount, 1, "accepts first vote");
      // attempt to vote again
      return electionInstance.vote(candidateId, { from: accounts[1] });
    }).then(assert.fail).catch(function(error) {
      // check error was thrown, catch error and check error is expected one
      assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
      return electionInstance.candidates(1);
    }).then(function(candidate1) { // check vote counts did not increase for any candidates
      var voteCount = candidate1[2];
      assert(voteCount, 1, "candidate 1 vote count unchanged");
      return electionInstance.candidates(2);
    }).then(function(candidate2) {
      var voteCount = candidate2[2];
      assert(voteCount, 1, "candidate 2 vote count unchanged");
    });
  });

});
