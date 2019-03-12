App = { //client app is an object initialized whenever the client loads the window
  web3Provider: null,
  contracts: {},
  account: '0x0',

  // initialise the app and web3
  init: function() {
    return App.initWeb3();
  },

  // initialise web3 to connect client app to our local blockchain
  // then call initialise contract
  initWeb3: function() {
    // TODO: refactor conditional
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask then use this for app
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  // initialize election contract then render app content on the page
  // loads contract into frontend app for interaction
  initContract: function() {
    // load JSON file of contract artifact and use it to generate truffle contract
    // getJSON works because we are using browser sync package (bs-config.json)
    $.getJSON("Election.json", function(election) {
      // Instantiate a new truffle contract from the artifact
      // this is the object the app can interact with contracts through
      App.contracts.Election = TruffleContract(election);
      // Connect provider to interact with contract
      App.contracts.Election.setProvider(App.web3Provider);

      return App.render();
    });
  },

  // display page
  render: function() {
    // declare election instance variable
    var electionInstance;
    var loader = $("#loader"); // gets control of these div ids from index.html
    var content = $("#content");
    // this is useful because we make asynchronous calls to get account and contract attributes
    loader.show();
    content.hide();

    // Load this client's account data and display
    // eth.getCoinbase provides account the client is using to connect to blockchain
    web3.eth.getCoinbase(function(err, account) {
      // if there were no errors, then use this account for this app and show address
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    // Load contract data and list all candidates on the page
    // this code is similar to the JS client-side tests!
    App.contracts.Election.deployed().then(function(instance) {
      electionInstance = instance; // get contract instance
      return electionInstance.candidatesCount(); // use count to ensure correct number of candidates are fetched in the loop
    }).then(function(candidatesCount) {
      var candidatesResults = $("#candidatesResults");
      candidatesResults.empty();

      // iterate through candidates mapping to get each candidates' values
      for (var i = 1; i <= candidatesCount; i++) {
        // call back function constructs a table row for render output
        electionInstance.candidates(i).then(function(candidate) {
          var id = candidate[0];
          var name = candidate[1];
          var voteCount = candidate[2];

          // Render candidate Result
          var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
          candidatesResults.append(candidateTemplate);
        });
      }
      // all asynchronous calls are done, loading finish and content ready to display
      loader.hide();
      content.show();
    }).catch(function(error) {
      console.warn(error);
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
