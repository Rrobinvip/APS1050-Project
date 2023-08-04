App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load pets.
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.pet-like').text(0).attr('data-id',data[i].id);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);
        petTemplate.find('.btn-return').attr('data-id', data[i].id);
        petTemplate.find('.btn-vac').attr('data-id', data[i].id);
        petTemplate.find('.btn-like').attr('data-id',data[i].id);

        petsRow.append(petTemplate.html());
      }
    });

    $.getJSON('../products.json', function(data) {
      var productsRow = $('#productRow');
      var productsTemplate = $('#foodTemplate');

      for (i = 0; i < data.length; i ++) {
        productsTemplate.find('.panel-title').text(data[i].name);
        productsTemplate.find('.food-price').text(data[i].price+" Wei");
        productsTemplate.find('.btn-purchase-food').attr('data-id', data[i].id);

        productsRow.append(productsTemplate.html());
      }
    });

    return await App.initWeb3();
  },

  initWeb3: async function() {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);


    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Adoption.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var AdoptionArtifact = data;
      App.contracts.Adoption = TruffleContract(AdoptionArtifact);
    
      // Set the provider for our contract
      App.contracts.Adoption.setProvider(App.web3Provider);
    
      // Use our contract to retrieve and mark the adopted pets
      return App.markAdopted();
    });
    

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
    $(document).on("click", '.btn-return', App.handleReturn);
    $(document).on("click", ".btn-vac", App.handleVacReg);
    $(document).on("click", ".btn-like", App.handleLike);
    $(document).on("click", ".btn-purchase-food", App.handleFoodPurchase);
  },

  markAdopted: function() {
    var adoptionInstance;

    App.contracts.Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;
    
      return adoptionInstance.getAdopters.call();
    }).then(function(adopters) {
      for (i = 0; i < adopters.length; i++) {
        console.log("Current adopters (called by markAdopted): "+adopters[i]);
        if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
          $('.panel-pet').eq(i).find('.btn-adopt').text('Success').prop('disabled', true);
          $('.panel-pet').eq(i).find('.btn-return').removeProp('disabled');
          $('.panel-pet').eq(i).find('.btn-showOwner').show();
          $('.panel-pet').eq(i).find('.adopterPwnerTextBlock').text(adopters[i]);
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });

    return App.markVacStatus();
    
  },
  markReturn: function() {
    var adoptionInstance;

    App.contracts.Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;
    
      return adoptionInstance.getAdopters.call();
    }).then(function(adopters) {
      for (i = 0; i < adopters.length; i++) {
        console.log("Current adopters (called by markReturn): "+adopters[i]);
        if (adopters[i] == "0x0000000000000000000000000000000000000000") {
          $(".panel-pet").eq(i).find(".btn-adopt").removeProp("disabled");
          $(".panel-pet").eq(i).find(".btn-return").prop("disabled", true);
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });
    
  },

  markVacStatus: function() {
    var adoptionInstance;

    App.contracts.Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;
    
      return adoptionInstance.getVacStatus.call();
    }).then(function(vacStatus) {
      for (i = 0; i < vacStatus.length; i++) {
        console.log("Current vac status (called by markVacStatus): "+vacStatus[i]);
        if (vacStatus[i] == true) {
          $(".panel-pet").eq(i).find(".btn-vac").hide();
          $(".panel-pet").eq(i).find(".vacStatusText").show();
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });

    return App.markLike();
  },

  markLike: function() {
    var adoptionInstance;

    App.contracts.Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;
    
      return adoptionInstance.getLike.call();
    }).then(function(likePetArray) {
      for (i = 0; i < likePetArray.length; i++){
        $(".panel-pet").eq(i).find(".pet-like").text(likePetArray[i]);
      }
    }).catch(function(err) {
      console.log(err.message);
    });
    
  },

  handleAdopt: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    var adoptionInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Adoption.deployed().then(function(instance) {
        adoptionInstance = instance;
        console.log("trying to adopt, petId:"+petId);

        // Execute adopt as a transaction by sending account
        return adoptionInstance.adopt(petId, {from: account});
      }).then(function(result) {
        return App.markAdopted();
      }).then(function() {
        console.log("Triggering reload..");
        location.reload();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  handleReturn: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    var adoptionInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Adoption.deployed().then(function(instance) {
        adoptionInstance = instance;

        // Execute adopt as a transaction by sending account
        return adoptionInstance.returnPet(petId, {from: account});
      }).then(function(result) {
        return App.markReturn();
      }).then(function() {
        console.log("Triggering reload..");
        location.reload();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  handleVacReg: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    var adoptionInstance;

    let feeInEth = "2";  // the vaccination fee in ETH
    let feeInWei = "2000000000000000000"  // convert to Wei

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Adoption.deployed().then(function(instance) {
        adoptionInstance = instance;

        console.log("Trying to purchase, petId:"+petId);

        // Execute adopt as a transaction by sending account
        return adoptionInstance.vaccinationRegister(petId, {from: account, value: feeInWei});
      }).then(function(receipt) {
        console.log("Purchase success, reciept:"+receipt);
      }).then(function(result) {
        return App.markVacStatus();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },
  handleLike: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    var adoptionInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Adoption.deployed().then(function(instance) {
        adoptionInstance = instance;

        // Execute adopt as a transaction by sending account
        return adoptionInstance.likePet(petId, {from: account});
      }).then(function(result) {
        return App.markLike();
      }).then(function() {
        console.log("Triggering reload..");
        location.reload();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  handleFoodPurchase: function(event) {
    event.preventDefault();

    var foodId = parseInt($(event.target).data('id'));

    console.log("Trying to purchase food, foodId: "+foodId);

    $.getJSON('../products.json', function(data) {
      var foodPriceInWei = data[foodId].price;
      web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log(error);
        }
  
        var account = accounts[0];
  
        App.contracts.Adoption.deployed().then(function(instance) {
          adoptionInstance = instance;
          console.log("Trying to purchase food, foodId, again, inside adoption instance: "+foodId);
  
          // Execute adopt as a transaction by sending account
          return adoptionInstance.foodPurchase(foodId, {from: account, value: foodPriceInWei});
        }).then(function(receipt) {
          alert("Thank you for suppoerting our dogs!");
          console.log("Purchase success, reciept:"+receipt);
        }).catch(function(err) {
          console.log(err.message);
        });
      });
    });
    
  }

  // .then(function() {
  //   console.log("Triggering reload..");
  //   location.reload();
  // })
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
