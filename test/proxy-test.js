const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DSProxyFactory", function () {
	it("Proxy factory", async function () {
		const [owner, addr1] = await ethers.getSigners();
		const DSProxyFactory = await ethers.getContractFactory(
			"DSProxyFactory",
			owner
		);
		const dsproxyFactory = await DSProxyFactory.deploy();
		await dsproxyFactory.deployed();
		await dsproxyFactory.connect(addr1).build(); // Here we have a culprit

		let filter = await dsproxyFactory.filters.Created(addr1.address);
		let query = await dsproxyFactory.queryFilter(filter);
		let proxyAddress = query[0]["args"]["proxy"];

		const DSProxy = await ethers.getContractFactory("DSProxy", addr1);
		const proxy = await DSProxy.attach(proxyAddress);

		// Setup coin and staking pool
		const Synthetix = await ethers.getContractFactory("Synthetix", owner);
		const snx = await Synthetix.deploy();
		await snx.deployed();
		expect(await snx.owner()).to.equal(owner.address);
		await snx.mint(addr1.address, 10000);
		expect(await snx.balanceOf(addr1.address)).to.equal(10000);

		const StakerPool = await ethers.getContractFactory("StakerPool", owner);
		const pool = await StakerPool.deploy(snx.address);
		await pool.deployed();
		expect(await pool.totalSupply()).to.equal(0);

		expect(await snx.balanceOf(addr1.address)).to.equal(10000);
		expect(await pool.balanceOf(addr1.address)).to.equal(0);
		expect(await snx.balanceOf(proxy.address)).to.equal(0);
		expect(await pool.balanceOf(proxy.address)).to.equal(0);

		// Get bytecode and calldata
		const SCRIPT = await ethers.getContractFactory("ProxyApproveStake");
		let bytecode = SCRIPT["bytecode"];

		let fragment = SCRIPT.interface.fragments[0];
		let calldata = SCRIPT.interface.encodeFunctionData(fragment, [
			snx.address,
			pool.address,
			100,
		]);

		await snx.connect(addr1).approve(proxy.address, 10000);

		//console.log("Bytecode: ", bytecode);
		//console.log("Calldata: ", calldata);
		// let res = await proxy.estimateGas.executeCode(bytecode, calldata);
		// console.log("Estimated gas usage: ", res.toNumber());

		await proxy.connect(addr1).execute(bytecode, calldata);

		// res = await proxy.estimateGas.executeCode(bytecode, calldata);
		// console.log("Estimated gas usage second time: ", res.toNumber());
		// res = await proxy.estimateGas.executeAt("0x8ff3801288a85ea261e4277d44e1131ea736f77b", calldata);
		// console.log("Estimated gas usage pointer: ", res.toNumber());

		expect(await snx.balanceOf(addr1.address)).to.equal(9900);
		expect(await pool.balanceOf(addr1.address)).to.equal(0);
		expect(await snx.balanceOf(proxy.address)).to.equal(0);
		expect(await pool.balanceOf(proxy.address)).to.equal(100);

		let fragment2 = SCRIPT.interface.fragments[1];
		calldata = SCRIPT.interface.encodeFunctionData(fragment2, [
			snx.address,
			pool.address,
			100,
		]);

		await proxy.connect(addr1).executeCode(bytecode, calldata);

		expect(await snx.balanceOf(proxy.address)).to.equal(0);
		expect(await pool.balanceOf(proxy.address)).to.equal(0);
		expect(await snx.balanceOf(addr1.address)).to.equal(10000);
		expect(await pool.balanceOf(addr1.address)).to.equal(0);
	});

	it("Retrieve ERC20", async function () {
		const [owner, addr1] = await ethers.getSigners();

		const DSProxyFactory = await ethers.getContractFactory(
			"DSProxyFactory",
			owner
		);

		const dsproxyFactory = await DSProxyFactory.deploy();
		await dsproxyFactory.deployed();
		await dsproxyFactory.connect(addr1).build(); // Here we have a culprit

		let filter = await dsproxyFactory.filters.Created(addr1.address);
		let query = await dsproxyFactory.queryFilter(filter);

		let proxyAddress = query[0]["args"]["proxy"];

		const DSProxy = await ethers.getContractFactory("DSProxy", addr1);
		const proxy = await DSProxy.attach(proxyAddress);

		// Setup coin and staking pool
		const Synthetix = await ethers.getContractFactory("Synthetix", owner);
		const snx = await Synthetix.deploy();
		await snx.deployed();
		expect(await snx.owner()).to.equal(owner.address);
		await snx.mint(addr1.address, 10000);
		await snx.connect(addr1).transfer(proxy.address, 1000);

		expect(await snx.balanceOf(addr1.address)).to.equal(9000);
		expect(await snx.balanceOf(proxy.address)).to.equal(1000);

		// Get bytecode and calldata
		const SCRIPT = await ethers.getContractFactory("ProxyRec");
		let bytecode = SCRIPT["bytecode"];

		let fragment = SCRIPT.interface.fragments[0];
		let calldata = SCRIPT.interface.encodeFunctionData(fragment, [
			snx.address,
			11,
		]);

		//        console.log("Bytecode: ", bytecode);
		//        console.log("Calldata: ", calldata);

		//        let res = await proxy.estimateGas.executeCode(bytecode, calldata);
		//        console.log("Estimated gas usage: ", res.toNumber());

		await proxy.connect(addr1).execute(bytecode, calldata);

		expect(await snx.balanceOf(addr1.address)).to.equal(9011);
		expect(await snx.balanceOf(proxy.address)).to.equal(989);
	});

	it("Retrieve ETH", async function () {
		const [owner, addr1] = await ethers.getSigners();

		const DSProxyFactory = await ethers.getContractFactory(
			"DSProxyFactory",
			owner
		);

		const dsproxyFactory = await DSProxyFactory.deploy();
		await dsproxyFactory.deployed();
		await dsproxyFactory.connect(addr1).build(); // Here we have a culprit

		let filter = await dsproxyFactory.filters.Created(addr1.address);
		let query = await dsproxyFactory.queryFilter(filter);

		let proxyAddress = query[0]["args"]["proxy"];

		const DSProxy = await ethers.getContractFactory("DSProxy", addr1);
		const proxy = await DSProxy.attach(proxyAddress);

		let value = ethers.utils.parseEther("10");
		await owner.sendTransaction({ to: proxy.address, value: value });
		expect(await owner.provider.getBalance(proxy.address)).to.equal(value);

		let addr1Bal = await owner.provider.getBalance(addr1.address);

		const SCRIPT = await ethers.getContractFactory("ProxyRec");
		let bytecode = SCRIPT["bytecode"];

		let fragment = SCRIPT.interface.fragments[1];
		let calldata = SCRIPT.interface.encodeFunctionData(fragment);

		//console.log("Bytecode: ", bytecode);
		//console.log("Calldata: ", calldata);

		await proxy.connect(addr1).execute(bytecode, calldata);

		expect(await owner.provider.getBalance(proxy.address)).to.equal(0);
		expect(await owner.provider.getBalance(addr1.address)).to.above(
			addr1Bal
		);
	});
});
