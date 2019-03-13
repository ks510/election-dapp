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
      return electionInstance.vote(1, {from: accounts[0]}); // cast vote with first ganache account
    }).then(function(receipt) {
      return electionInstance.voters(accounts[0]);
    }).then(function(voted) {
      assert(voted, "the voter was marked as voted"); // check the account was recorded
      return electionInstance.candidates(candidateId);
    }).then(function(candidate) {
      var voteCount = candidate[2]; // get voteCount attribute
      assert(voteCount, 1, "candidate's vote count was incremented"); // check vote count was increased to 1
    })
  })

});
