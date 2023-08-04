pragma solidity ^0.5.0;

contract Adoption {
    address[16] public adopters;
    bool[16] public vaccinationStatus;
    uint public vaccinationFee = 2 ether;
    uint[16] likePetArray = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    uint[4] foodPrice = [2 ether, 2.5 ether, 6 ether, 1 ether];
    uint[4] foodQuantities = [0, 0, 0, 0];

    // Adopting a pet
    function adopt(uint petId) public returns (uint) {
        require(petId >= 0 && petId <= 15);

        adopters[petId] = msg.sender;

        return petId;
    }

    function foodPurchase(uint foodId) public payable returns (uint) {
        require(foodId >= 0 && foodId <= 3, "Invalid food id");
        require(
            msg.value >= foodPrice[foodId],
            "Insufficient ETH for food purchasing"
        );

        foodQuantities[foodId]+=1;

        return foodQuantities[foodId];
    }

    function getFoodQuantities() public view returns (uint[4] memory) {
        return foodQuantities;
    }

    function vaccinationRegister(uint petId) public payable returns (bool) {
        require(petId >= 0 && petId <= 15, "Invalid pet id");
        require(
            msg.value >= vaccinationFee,
            "Insufficient ETH for vaccination fee"
        );

        vaccinationStatus[petId] = true;

        return vaccinationStatus[petId];
    }

    function getVacStatus() public view returns (bool[16] memory) {
        return vaccinationStatus;
    }

    // Retrieving the adopters
    function getAdopters() public view returns (address[16] memory) {
        return adopters;
    }

    // Retrieving single adopter based on petId
    function getAdopter(uint petId) public view returns (address) {
        require(petId >= 0 && petId <= 15);

        return adopters[petId];
    }

    function returnPet(uint petId) public returns (uint) {
        require(petId >= 0 && petId <= 15);

        if (adopters[petId] == msg.sender) {
            adopters[petId] = address(0);
        }

        return petId;
    }
    //Retrive the like 
    function getLike() public view returns (uint[16] memory) {
        return likePetArray;
    }

    //Like the pet
    function likePet(uint petId) public returns (uint) {
        require(petId >= 0 && petId <= 15);

        likePetArray[petId]++;

        return petId;
    }

}
