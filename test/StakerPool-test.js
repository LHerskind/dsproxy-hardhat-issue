const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Stakerpool", function(){
    it("Create pool, funds in, funds out", async function(){
        const [owner, addr1] = await ethers.getSigners();

        const Synthetix = await ethers.getContractFactory("Synthetix");
        const snx = await Synthetix.deploy();

        await snx.deployed();
        expect(await snx.owner()).to.equal(owner.address);

        await snx.connect(owner).mint(addr1.address, 10000);

        expect(await snx.balanceOf(addr1.address)).to.equal(10000);

        const StakerPool = await ethers.getContractFactory("StakerPool");
        const pool = await StakerPool.deploy(snx.address);

        await pool.deployed();
        expect(await pool.totalSupply()).to.equal(0);

        await snx.connect(addr1).approve(pool.address, 1000);
        await pool.connect(addr1).stakeFunds(1000);

        expect(await pool.totalSupply()).to.equal(1000);
        expect(await pool.balanceOf(addr1.address)).to.equal(1000);
        expect(await snx.balanceOf(addr1.address)).to.equal(9000);
        expect(await snx.balanceOf(pool.address)).to.equal(1000);

        await pool.connect(addr1).withdrawFunds(500);
 
        expect(await pool.totalSupply()).to.equal(500);
        expect(await pool.balanceOf(addr1.address)).to.equal(500);
        expect(await snx.balanceOf(addr1.address)).to.equal(9500);
        expect(await snx.balanceOf(pool.address)).to.equal(500);
    }); 
});