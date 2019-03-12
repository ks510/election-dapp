var Election = artifacts.require("./Election.sol");

contract("Election", function (accounts) {
  it("initializes with two candidates", function() { //description of test
    return Election.deployed().then(function(instance) { //fetch contract instance
      return instance.candidatesCount(); //callback functon gets contract attribute
    }).then(function(count) { //getters are asynchronous so use callback function
      assert.equal(count, 2); //to acccess returned value and do test assertion
    });
  });
});
