# Unexpected issues 

When working with [DSProxy](https://github.com/makerdao/developerguides/blob/master/devtools/working-with-dsproxy/working-with-dsproxy.md#setup-wipeproxysol) and hardhat, I run in to some quite strange errors. 


## `Build`

**Expected behavior**:
- Running "build()" at the `DSProxyFactory` is expected to create a new proxy for `msg.sender`

**Actual behavior**:
- `dsproxyFactory.connect(...).build is not a function`

The issue seem to be that the js-object create from `ethers` don't create the methods `build()` and `build(address)` as we would expect them to. If we print the functions of the `DSProxyFactory` we have the following output:
```
{
  'isProxy(address)': [Function (anonymous)],
  'cache()': [Function (anonymous)],
  'build()': [Function (anonymous)],
  'build(address)': [Function (anonymous)],
  isProxy: [Function (anonymous)],
  cache: [Function (anonymous)]
}
```
Seems like we are hitting some keyword with build and it do not behave as expected. 

**Workaround**:   
Instead of accessing the functions directly, we can generate the `calldata` and execute the transaction ourselves as:
```
let fragmentCreate = DSProxyFactory.interface.fragments[2];
let calldataCreate = DSProxyFactory.interface.encodeFunctionData(fragmentCreate);
await addr1.sendTransaction({ to: dsproxyFactory.address, data: calldataCreate});
//await dsproxyFactory.connect(addr1).build(); // This will crash the program. 
```

## `Execute`
We have the same issue with `execute` of the proxy itself. Again, we can work around it by creating the `calldata` ourselves. 


# How to reproduce
The test folder contains a `proxy-test.js` which will call the functions using the js-objects, and thereby fail. `proxy-test2.js` which will generate the `calldata` directly. `partial_fixed_proxy-test.js` which have simply renamed `build()` to `buildMine()` and `build(address)` to `buildFor(address)`. And finally `fixed_proxy-test.js` which have also renamed `execute(address, bytes)` to `executeAt(address, bytes)` and `execute(bytes, bytes)` to `executeCode(bytes, bytes)`.


# Install
``` npm install ```

From here, we can run the tests as:

``` npx hardhat test ```


