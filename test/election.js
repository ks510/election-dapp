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

});
