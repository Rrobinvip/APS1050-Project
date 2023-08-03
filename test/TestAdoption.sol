pragma solidity ^0.5.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Adoption.sol";

contract TestAdoption {
    // The address of the adoption contract to be tested
    Adoption adoption = Adoption(DeployedAddresses.Adoption());

    // Testing the adopt() function
    function testUserCanAdoptPet() public {
        uint returnedId = adoption.adopt(expectedPetId);

        Assert.equal(returnedId, expectedPetId, "Adoption of the expected pet should match what is returned.");
    }

    // Testing retrieval of a single pet's owner
    function testGetAdopterAddressByPetId() public {
        address adopter = adoption.adopters(expectedPetId);

        Assert.equal(adopter, expectedAdopter, "Owner of the expected pet should be this contract");
    }

    // Testing retrieval of all pet owners
    function testGetAdopterAddressByPetIdInArray() public {
        // Store adopters in memory rather than contract's storage
        address[16] memory adopters = adoption.getAdopters();

        Assert.equal(adopters[expectedPetId], expectedAdopter, "Owner of the expected pet should be this contract");
    }

    // Tesing retrieval of a single adopters
    function testGetSingleAdopterAddressByPetId() public {
        address adopter = adoption.getAdopter(expectedPetId);

        Assert.equal(adopter, expectedAdopter, "Owner of the expected pet should be this contract");
    }
    // Testing the returnPet() function
    function testUserCanReturn() public {
        uint returnedId = adoption.returnPet(expectedPetId);

        Assert.equal(returnedId, expectedPetId, "Return of the expected pet should match what is returned.");
    }

    // function testVacReg() public {
    //     bool vacStatus = adoption.vaccinationRegister(expectedPetId).value(2 ether)();

    //     Assert.equal(vacStatus, expectedVacStatus, "Vac status should match");
    // }

    // The id of the pet that will be used for testing
    uint expectedPetId = 8;

    //The expected owner of adopted pet is this contract
    address expectedAdopter = address(this);

    // The expected vac reg status
    bool expectedVacStatus = true;

}
