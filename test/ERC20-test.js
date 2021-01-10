const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SNX", function() {
    it("Create an ERC20 named SNX", async function(){
        const [owner, addr1] = await ethers.getSigners();

        const Synthetix = await ethers.getContractFactory("Synthetix");
        const snx = await Synthetix.deploy();

        await snx.deployed();

        expect(await snx.owner()).to.equal(owner.address);
    });

    it("Mint 10000 to addr1 and burn 9000", async function(){
        const [owner, addr1] = await ethers.getSigners();
        const Synthetix = await ethers.getContractFactory("Synthetix");
        const snx = await Synthetix.deploy();
        await snx.deployed();
        expect(await snx.owner()).to.equal(owner.address);

        await snx.connect(owner).mint(addr1.address, 10000);

        expect(await snx.connect(addr1).balanceOf(addr1.address)).to.equal(10000);

        await snx.connect(addr1).burn(9000);

        expect(await snx.connect(addr1).balanceOf(addr1.address)).to.equal(1000);
    });

    it("Mint and send", async function() {
        const [owner, addr1, addr2] = await ethers.getSigners();
        const Synthetix = await ethers.getContractFactory("Synthetix");
        const snx = await Synthetix.deploy();
        await snx.deployed();
        expect(await snx.owner()).to.equal(owner.address);

        await snx.connect(owner).mint(addr1.address, 10000);

        expect(await snx.connect(addr1).balanceOf(addr1.address)).to.equal(10000);
        await snx.connect(addr1).transfer(addr2.address, 9000);
        
        expect(await snx.balanceOf(addr1.address)).to.equal(1000);
        expect(await snx.balanceOf(addr2.address)).to.equal(9000);

    });


});


