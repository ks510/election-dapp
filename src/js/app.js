App = { //client app is an object initialized whenever the client loads the window
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,

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
      // listen for events from contract
      App.listenForEvents();

      return App.render();
    });
  },
  // Listen for events emitted from the contract
  listenForEvents: function() {
    App.contracts.Election.deployed().then(function(instance) {
      // Restart Chrome if you are unable to receive this event, known issue with Metamask
      // call votedEvent to subscribe (listen) to it
      instance.votedEvent({}, { // pass metadata
        fromBlock: 0,   // subscribe to events from entire block chain (0 to latest block)
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event); // log event
        // Reload when a new vote is recorded
        App.render();
      });
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
      // query for candidateSelect inside the vote form and reset it
      var candidatesSelect = $('#candidatesSelect');
      candidatesSelect.empty();

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

          // Render candidate ballot option
          var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
          candidatesSelect.append(candidateOption);
        });
      }
      return electionInstance.voters(App.account); // check if account has voted already
    }).then(function(hasVoted) {
      // Do not allow a user to vote by hiding the form
      if(hasVoted) {
        $('form').hide();
      }
      // all asynchronous calls done, show data
      loader.hide();
      content.show();
    }).catch(function(error) {
      console.warn(error);
    });
  },

  // called by form onSubmit
  castVote: function() {
    var candidateId = $('#candidatesSelect').val(); // query for candidate id from selector
    App.contracts.Election.deployed().then(function(instance) { // get instance of contract
      return instance.vote(candidateId, { from: App.account }); // call vote function and pass in account
    }).then(function(result) {
      // Wait for votes to update
      $("#content").hide();
      $("#loader").show();
    }).catch(function(err) {
      console.error(err);
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
