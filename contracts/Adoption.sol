pragma solidity ^0.5.0;

contract Adoption {
    address[16] public adopters;
    address[16] public donators;
    bool[16] public vaccinationStatus;
    uint public vaccinationFee = 2 ether;
    uint[16] likePetArray = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    uint public returnFee = 2 ether;
    uint public adoptionFee = 2 ether;
    uint public donationFee = 2 ether;

    // Adopting a pet
    function adopt(uint petId) public payable returns (uint) {
        require(petId >= 0 && petId <= 15);
        require(
            msg.value >= adoptionFee,
            "Insufficient ETH for adoption fee"
        );
        adopters[petId] = msg.sender;

        return petId;
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

    function returnPet(uint petId) public payable returns (uint) {
        require(petId >= 0 && petId <= 15);
        require(
            msg.value >= returnFee,
            "Insufficient ETH for return fee"
        );

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

    //Retrive the donator
    function getDonators() public view returns (address[16] memory) {
        return donators;
    }
    // donate a pet
    function donatePet(uint petId) public payable returns (uint) {
        require(petId >= 0 && petId <= 15);
        require(
            msg.value >= donationFee,
            "Insufficient ETH for donation fee"
        );
        donators[petId] = msg.sender;

        return petId;
    }
    // Adopting a pet free
    function adoptFree(uint petId) public returns (uint) {
        require(petId >= 0 && petId <= 15);
        adopters[petId] = msg.sender;

        return petId;
    }

}
