const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DSProxyFactory - create calldata ourselves", function () {
    it("Bypass object - Retrieve ETH", async function () {
		const [owner, addr1] = await ethers.getSigners();

		const DSProxyFactory = await ethers.getContractFactory(
			"DSProxyFactory",
			owner
		);

		const dsproxyFactory = await DSProxyFactory.deploy();
        await dsproxyFactory.deployed();

        let fragmentCreate = DSProxyFactory.interface.fragments[2];
        let calldataCreate = DSProxyFactory.interface.encodeFunctionData(fragmentCreate);
        await addr1.sendTransaction({ to: dsproxyFactory.address, data: calldataCreate});
		//await dsproxyFactory.connect(addr1).build(); // Here we have a culprit. This will crash the program. 

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
        
        let fragmentExecute = proxy.interface.fragments[2];
        let calldataExecute = proxy.interface.encodeFunctionData(fragmentExecute, [bytecode, calldata]);      
        await addr1.sendTransaction({ to: proxy.address, data: calldataExecute});
//		await proxy.connect(addr1).execute(bytecode, calldata);

		expect(await owner.provider.getBalance(proxy.address)).to.equal(0);
		expect(await owner.provider.getBalance(addr1.address)).to.above(
			addr1Bal
		);
	});
});
