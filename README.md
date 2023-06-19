学到了，只要知道 CID，前缀用 `https://ipfs.io/ipfs/${CID}` 即可，所以需要重新部署一下合约们


# 更新后的 mumbai 下网络的合约地址：

记录 whitelist 合约地址：


diamond 合约地址(whitelist)：
0xE5a00E8A00869A173D6e0eAc95Cd184eF2c916d3

用户宣传记录（propagation recorder）合约地址：
0x0923ddb2bFDcC459b5d82F232Ba1ef9865cAA587

smart contract manager 合约地址（用于记录哪些 child NFT 可以直接变为 activeChildren，哪些 childNFT 在 accept 时需要付钱）：
0x656d99D4036e944FD8901D9dD080F043De75B86c

## 用于测试的 NFT 集合
Gallery Ticket: 0xB0238d3D208b4cc02b78C185ac6C0BC8e9dcC434
Concert Ticket: 0x5AcAB719A2aEac66E15d4316c9D5F5F7A49a1DCF
Butchery Goods: 0xb7dC80fd4FCFbAfCd90a96661b07698Afd3E46f4

# 创建路径：

* 初始化一个白名单:

```
const whitelistFacet = await ethers.getContractAt('WhitelistFacet', '0xE5a00E8A00869A173D6e0eAc95Cd184eF2c916d3')
await whitelistFacet.createWhitelist('nain_whitelist', ['0xA0AFCFD57573C211690aA8c43BeFDfC082680D58'])

```

* 空投能力：创建一个 gallery ticket 的空投，直接空投到用户的某个 NFT 下面

```
// 初始化白名单的 child smart contract 
let authenticateSCManager = await ethers.getContractAt('AuthenticateSCManager', '0x656d99D4036e944FD8901D9dD080F043De75B86c')
// 将 gallery ticket 的地址注册到白名单中
await authenticateSCManager.registerWhitelist('0xB0238d3D208b4cc02b78C185ac6C0BC8e9dcC434', 1, 0)
// 将 gallery ticket 地址注册到 Authentic 的名单中
await authenticateSCManager.registerAuthentic('0xB0238d3D208b4cc02b78C185ac6C0BC8e9dcC434', 1)
// mint 一个 galleryTicket NFT 到 tokenID 为 1 的 NFT 上
await galleryEventTicket.nestMint('0xE5a00E8A00869A173D6e0eAc95Cd184eF2c916d3', 1, 1, {value: payValue})
// 查看当前 NFT - tokenId - 1 的 childNFT 数量
let rmrkNestableFacet = await ethers.getContractAt('RMRKNestableFacet', '0xE5a00E8A00869A173D6e0eAc95Cd184eF2c916d3')
await rmrkNestableFacet.childrenOf(1)

```

* pending + 购买的能力：创建一个 butchery 的空投，并且它可以标定具体的接受价格

```
// 将 butchery NFT smart contract 地址注册到白名单中
// 注意该 NFT 在用户 accept 时，需要收费，因此在注册时到 authenticateSCManager 白名单时的配置如下：
// '4' 表示这个 NFT 有过期时间，且有 accepting 的价格
await authenticateSCManager.registerWhitelist('0xb7dC80fd4FCFbAfCd90a96661b07698Afd3E46f4', 4, 0)
// 初始化 butcheryGoods 的方法
let butcheryGoods = await ethers.getContractAt('ButcheryGoods', '0xb7dC80fd4FCFbAfCd90a96661b07698Afd3E46f4')
// 初始化 accepting price 和过期时间
let acceptingPrice = ethers.utils.parseUnits("0.001", "ether")
let expireTime = Math.floor((new Date()).getTime() / 1000) + 1 * 24 * 60 * 60
// nestmint butchery goods
butcheryGoods.nestMintOne('0xE5a00E8A00869A173D6e0eAc95Cd184eF2c916d3', 1, acceptingPrice, expireTime)
// 查询当前 contract 的 nftType
await authenticateSCManager.nftType('0xb7dC80fd4FCFbAfCd90a96661b07698Afd3E46f4')
// 查询刚刚 mint 的数据的有效期
await authenticateSCManager.expireTime('0xb7dC80fd4FCFbAfCd90a96661b07698Afd3E46f4', 1)
// 查询刚刚 mint 的数据接受价格
await authenticateSCManager.queryPrice('0xb7dC80fd4FCFbAfCd90a96661b07698Afd3E46f4', 1)
```










