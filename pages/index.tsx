/*
 * @Author: daibi dbfornewsletter@outlook.com
 * @Date: 1985-10-26 16:15:00
 * @LastEditors: daibi dbfornewsletter@outlook.com
 * @LastEditTime: 2023-06-08 00:17:50
 * @FilePath: /nain-frontend/pages/index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/*
 * @Author: daibi dbfornewsletter@outlook.com
 * @Date: 1985-10-26 16:15:00
 * @LastEditors: daibi dbfornewsletter@outlook.com
 * @LastEditTime: 2023-05-28 07:35:43
 * @FilePath: /nain-frontend/pages/index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Tabs from './components/Tabs'
import ChildNFT from './components/ChildNFT'
import PendingChildNFT from './components/PendingChildNFT'
import Web3 from 'web3'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.min.css'
import WhitelistFacet from '@/abis/WhitelistFacet.json'
import RMRKMintAndBurnFacet from '@/abis/RMRKMintAndBurnFacet.json'
import RMRKNestableFacet from '@/abis/RMRKNestableFacet.json'
import RMRKTokenURI from '@/abis/RMRKTokenURI.json'
import LibERC721 from '@/abis/LibERC721.json'
import LibNestable from '@/abis/LibNestable.json'
import CollectionMetaFacet from '@/abis/CollectionMetaFacet.json'
import AuthenticateSCManager from '@/abis/AuthenticateSCManager.json';
import { AbiItem } from 'web3-utils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCog } from '@fortawesome/free-solid-svg-icons'
import FileEncryptionForm from './components/FileEncryptionForm'

const diamondAddress = '0xE5a00E8A00869A173D6e0eAc95Cd184eF2c916d3'
const scManagerAddress = '0x656d99D4036e944FD8901D9dD080F043De75B86c'
export default function Home() {
  const [activeTab, setActiveTab] = useState('get started')
  const [showWhitelistManagement, setShowWhitelistManagement] = useState(false)
  const [whitelistAddresses, setWhitelistAddresses] = useState('')
  const [showCollections, setShowCollections] = useState(false);
  const [tokenIds, setTokenIds] = useState<any[]>([]);
  const [selectedTokenId, setSelectedTokenId] = useState(null);
  const [tokenURI, setTokenURI] = useState('');
  const [web3, setWeb3] = useState<any>('');
  const [whitelistFacet, setWhitelistFacet] = useState<any>(null);
  const [rmrkNestableFacet, setRmrkNestableFacet] = useState<any>(null);
  const [rmrkMintFacet, setRmrkMintFacet] = useState<any>(null);
  const [authenticateSCManager, setAuthenticateSCManager] = useState<any>(null);
  const [collectionMetaFacet, setCollectionMetaFacet] = useState<any>(null);
  const [libERC721, setLibERC721] = useState<any>(null);
  const [libNestable, setLibNestable] = useState<any>(null);
  const [tokenData, setTokenData] = useState<any>([]);
  const [facetsInitialized, setFacetsInitialized] = useState(false);
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [activeChildren, setActiveChildren] = useState<any>([]);
  const [pendingChildren, setPendingChildren] = useState<any>([]);

  useEffect(() => {
    if (window.ethereum) {
      checkHasNFTCollection();
    }

    const initFacets = async () => {
      const _web3 = new Web3(window.ethereum)
      setWeb3(_web3)
      if (_web3) {
        const _whitelistFacet = new _web3.eth.Contract(WhitelistFacet.abi as AbiItem[], diamondAddress)
        setWhitelistFacet(_whitelistFacet);
  
        const _rmrkNestableFacet = new _web3.eth.Contract(RMRKNestableFacet.abi as AbiItem[], diamondAddress)
        setRmrkNestableFacet(_rmrkNestableFacet);

        const _rmrkMintFacet = new _web3.eth.Contract(RMRKMintAndBurnFacet.abi as AbiItem[], diamondAddress)
        setRmrkMintFacet(_rmrkMintFacet)

        const _libERC721 = new _web3.eth.Contract(LibERC721.abi as AbiItem[], diamondAddress)
        setLibERC721(_libERC721)

        const _collectionMetaFacet = new _web3.eth.Contract(CollectionMetaFacet.abi as AbiItem[], diamondAddress)
        setCollectionMetaFacet(_collectionMetaFacet)

        const _authenticateSCManager = new _web3.eth.Contract(AuthenticateSCManager.abi as AbiItem[], scManagerAddress)
        setAuthenticateSCManager(_authenticateSCManager)

        const _libNestable = new _web3.eth.Contract(LibNestable.abi as AbiItem[], diamondAddress)
        setLibNestable(_libNestable)

        setFacetsInitialized(true);

        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        const account = accounts[0]
    
        try {
          const owner = await _whitelistFacet.methods.whitelistOwner(1).call()
          setShowWhitelistManagement(owner === account)
        } catch (error) {
          console.error("Error getting whitelist owner:", error);
          setShowWhitelistManagement(false);
        }
      }
    };

    initFacets()
  }, [])

  useEffect(() => {
    if (activeTab === "collections") {
      
      const fetchBalanceAndTokens = async () => {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        const account = accounts[0]
        const balance = await rmrkNestableFacet.methods.balanceOf(account).call();
  
        if (balance > 0) {
          const tokenIds = [];
          const tokenURIs = [];
          const fetchedTokenData = [];
  
          for (let i = 0; i < balance; i++) {
            const { tokenId, tokenUri } = await rmrkNestableFacet.methods
              .getOwnerCollectionByIndex(account, i)
              .call();
            tokenIds.push(tokenId);
            tokenURIs.push(tokenUri);
            const response = await fetch(tokenUri);
            const tokenData = await response.json();
            fetchedTokenData.push(tokenData);
          }
          setTokenIds(tokenIds);
          setTokenData(fetchedTokenData);
          setSelectedTokenId(tokenIds[0]);
        } else {
          setTokenIds([]);
          setSelectedTokenId(null);
        }
      };
  
      fetchBalanceAndTokens();
    }
  }, [activeTab])

  useEffect(() => {
    if (selectedTokenId && activeTab === "collections") {
      retrieveActiveChildrenData();
      retrievePendingChildrenData();
    }
  }, [selectedTokenId, activeTab]);

  const onWalletConnected = async (account: string) => {
    try {
      const whitelistOwner = await whitelistFacet.methods.whitelistOwner(1).call()
      setShowWhitelistManagement(whitelistOwner === account)
    } catch (error) {
      console.error("Error getting whitelist owner:", error);
      setShowWhitelistManagement(false);
    }

    try {
      const whitelistStatus = await whitelistFacet.methods.isWhitelisted(1, account).call()
      setIsWhitelisted(whitelistStatus > 0);
    } catch (error) {
      console.error("Error checking whitelist status:", error);
      setIsWhitelisted(false);
    }

    const totalBalance = await rmrkNestableFacet.methods.balanceOf(account).call();
    if (totalBalance > 0) {
      setShowCollections(true);
      const tokenIds = [];
      for (let index = 0; index < totalBalance; index++) {
        const { tokenId } = await rmrkNestableFacet.methods.getOwnerCollectionByIndex(account, index).call();
        tokenIds.push(tokenId);
      }
      setTokenIds(tokenIds);
      setSelectedTokenId(tokenIds[0]);
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'collections': 
        return (
          <div>
            {selectedTokenId !== null && tokenData.length > 0 ? (
              <>
                <div className="flex w-full justify-between items-center mt-6">
                  <div className="w-1/2">
                    <h2 className="text-xl font-bold">NAIN-{selectedTokenId}</h2>
                  </div>
                  <div className="w-1/2">
                    <select
                      value={selectedTokenId}
                      onChange={handleTokenIdChange}
                      className="appearance-none bg-white w-full border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      {tokenIds.map((tokenId) => (
                        <option key={tokenId} value={tokenId}>
                          NAIN-{tokenId}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                        <path d="M7 7l3-3 3 3m0 6l-3 3-3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap md:flex-nowrap">
                  <div className="w-full md:w-1/3 mt-6">
                    <div className="relative pb-[100%]">
                      <img
                        className="absolute h-full w-full object-cover border-4 border-gray-200 rounded-lg shadow-md"
                        src={tokenData[tokenIds.indexOf(selectedTokenId)].image}
                        alt={tokenData[tokenIds.indexOf(selectedTokenId)].name}
                      />
                    </div>
                  </div>
                  <div className="w-full md:w-2/3 mt-6 pl-0 md:pl-6 flex flex-col space-y-4">
                    <div className="flex-grow border rounded-lg p-4">
                      <h3 className="text-xl font-bold mb-4">Holdings</h3>
                      <div className="flex flex-wrap justify-center gap-4">
                        {activeChildren.map((child: any, index: number) => (
                          <ChildNFT key={index} child={child} />
                        ))}
                      </div>
                    </div>
                    <div className="flex-grow border rounded-lg p-4">
                      <h3 className="text-xl font-bold mb-4">Pending Holdings</h3>
                      <div className="flex flex-wrap justify-center gap-4">
                        {pendingChildren.map((pendingChild: any, index: number) => (
                          <PendingChildNFT key={index} child={pendingChild} acceptChild={acceptChild}  />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className='pt-4'>
                  <div className="flex items-center mb-2">
                    <FontAwesomeIcon icon={faCog} />
                    <h3 className="text-xl font-bold ml-2">Traits</h3> 
                  </div>
                  <div className="flex flex-wrap">
                    {tokenData[tokenIds.indexOf(selectedTokenId)].attributes.map(
                      (attribute: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center border border-gray-300 text-gray-600 rounded-lg px-3 py-1 mr-2 mb-2"
                        >
                          <span className="font-semibold mr-1">{attribute.trait_type}:</span>
                          <span className="text-gray-800">{attribute.value}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
                
              </>
            ) : (
              <p>No NFTs in your collection.</p>
            )}
          </div>
        )
      case 'whitelist management':
        return (
          <div className="container mx-auto px-4 min-h-screen flex flex-col items-center flex-grow ">
            <div className='px-4 pt-16 pb-8'>
              <h2 className="bg-gradient-to-br from-black to-stone-500 bg-clip-text text-center font-display text-4xl font-bold tracking-[-0.02em] text-transparent drop-shadow-sm md:text-7xl md:leading-[5rem]">
              Update Nain Minting
              </h2>
              <h2 className="bg-gradient-to-br from-black to-stone-500 bg-clip-text text-center font-display text-4xl font-bold tracking-[-0.02em] text-transparent drop-shadow-sm md:text-7xl md:leading-[5rem]">
              Whitelist Here
              </h2>
            </div>
            <div className="flex mx-auto mt-6 flex items-center justify-center space-x-4">
              <input
                type="text"
                placeholder="Enter wallet address by commas"
                value={whitelistAddresses}
                onChange={(e) => setWhitelistAddresses(e.target.value)}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md px-4 py-2"
              />
              <button
                onClick={updateWhitelist}
                className="group flex max-w-fit items-center justify-center space-x-2 rounded-full border border-black bg-black px-5 py-2 text-sm text-white transition-colors hover:bg-white hover:text-black"
              >
                Update
              </button>
            </div>
          </div>
        )
      case 'get started':
        return (
          <div className="container mx-auto px-4 min-h-screen flex flex-col items-center flex-grow ">
            <div className='px-4 pt-16 pb-8'>
              <h2 className="bg-gradient-to-br from-black to-stone-500 bg-clip-text text-center font-display text-4xl font-bold tracking-[-0.02em] text-transparent drop-shadow-sm md:text-7xl md:leading-[5rem]">
                Join our exclusive whitelist!
              </h2>
              <h3 className="mt-6 text-center text-gray-500 md:text-xl">
                An NFT for connection with your neighborhood
              </h3>
            </div>
            <div className="flex mx-auto mt-6 flex items-center justify-center space-x-4">
              <button 
                className="group flex max-w-fit items-center justify-center space-x-2 rounded-full border border-black bg-black px-5 py-2 text-sm text-white transition-colors hover:bg-white hover:text-black"
                onClick={mintNFT}>
                <svg
                className="h-4 w-4 group-hover:text-black"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 4L20 20H4L12 4Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  </svg>
                <p>Mint = 0.01ETH</p>
              </button>
            </div>
            <div className={`mt-4 text-center py-2 px-4 rounded-lg text-white ${isWhitelisted ? 'bg-green-500' : 'bg-red-500'}`}>
              {isWhitelisted ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline-block align-text-top h-5 w-5 mr-1">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  You are in! Mint your NFT and enter the Nain universe!
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline-block align-text-top h-5 w-5 mr-1">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Your address is not whitelisted.
                </>
              )}
            </div>
          </div>
        )
      case 'file encryption':
        return <div className='px-4 pt-16 pb-8'>
          <h2 className="bg-gradient-to-br from-black to-stone-500 bg-clip-text text-center font-display text-4xl font-bold tracking-[-0.02em] text-transparent drop-shadow-sm md:text-7xl md:leading-[5rem]">
            Seeking Priviledge for Your NFT Collection? 
          </h2>
          <h3 className="mt-6 text-center text-gray-500 md:text-xl">
            Only NFT Holders Can Unlock!
          </h3>
          <div className="flex mx-auto mt-6 flex items-center justify-center space-x-4">
          <FileEncryptionForm />
          </div>
        </div>
        
      default:
        return null
    }
  }
  
  function showLoadingToast(text: string) {
    toast.info(text, {
      position: 'bottom-center',
      autoClose: false,
      closeOnClick: false,
      closeButton: false,
      draggable: false,
      hideProgressBar: true,
      progress: undefined,
      className: 'mint-toast',
    });
  }

  async function updateWhitelist() {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const account = accounts[0]
      const addresses = whitelistAddresses
        .split(',')
        .map((address: string) => address.trim())
        .filter((address: string) => address.length > 0)
      
      showLoadingToast("Updating whitelist...")
      console.log('address: ', addresses, "current account: ", account)
      whitelistFacet.methods['updateWhitelist'](1, addresses).send({ from: account })
      .on("transactionHash", (hash: string) => {
        whitelistFacet.events.WhitelistUpdated({}, async (error: any, event: any) => {
          toast.dismiss(); // Close the loading toast
          toast.success('Whitelist updated successfully.')
        })
      })
      .on("error", (error: any) => {
        toast.dismiss(); // Close the loading toast
        toast.error('Error while updating whitelist.')
      });


    } catch (error) {
      console.error('Error while updating whitelist:', error)
      toast.error('Error while updating whitelist.')
    }
  }

  async function mintNFT() {
    try {
      
      if (typeof window.ethereum === 'undefined') {
        toast.error('Please install MetaMask!')
        return
      }
  
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const account = accounts[0]
      const networkId = await web3.eth.net.getId()
      

      const whitelistNum = await whitelistFacet.methods.isWhitelisted(1, account).call()
      if (whitelistNum == 0) {
        toast.error('Your address is not in the whitelist.')
        return
      }
  
      const mintValue = web3.utils.toWei('0.01', 'ether')
  
      showLoadingToast('Processing minting...'); // Show the loading toast

      rmrkMintFacet.methods['mint'](account).send({ from: account, value: mintValue })
      .on("transactionHash", (hash: string) => {
        libERC721.events.Transfer({}, async (error: any, event: any) => {
          toast.dismiss(); // Close the loading toast
          toast.success('Minting process succeeded.')
        })
      })
      .on("error", (error: any) => {
        console.error(`Minting error: ${error.message}`);
        toast.dismiss(); // Close the loading toast
        toast.error('Minting process failed.')
      });
  
    } catch (error) {
      console.error('Error while minting NFT:', error)
      toast.error('Error while minting NFT.')
    }
  }

  const checkHasNFTCollection = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    const account = accounts[0]
    const web3 = new Web3(window.ethereum)
    const rmrkNestableFacet = new web3.eth.Contract(RMRKNestableFacet.abi as AbiItem[], diamondAddress)
    const totalBalance = await rmrkNestableFacet.methods.balanceOf(account).call();
    if (totalBalance > 0) {
      setShowCollections(true);
      const tokenIds = [];
      for (let index = 0; index < totalBalance; index++) {
        const { tokenId } = await rmrkNestableFacet.methods.getOwnerCollectionByIndex(account, index).call();
        tokenIds.push(tokenId);
      }
      setTokenIds(tokenIds);
      setSelectedTokenId(tokenIds[0]);
    }
  }

  const handleTokenIdChange = async (event: any) => {
    const tokenId = event.target.value;
    setSelectedTokenId(tokenId);
    const tokenUri = await collectionMetaFacet.methods.tokenURI(tokenId).call();
    console.log(tokenUri)
    setTokenURI(tokenUri);
  };

  // Retrieve active children data
  const retrieveActiveChildrenData = async () => {
    const children = await rmrkNestableFacet.methods.childrenOf(selectedTokenId).call();
    const childrenData = [];
    for (let index = 0; index < children.length; index++) {
      const tokenId = children[index].tokenId;
      const childData = await fetchChildNFTData(children[index].contractAddress, tokenId);
  
      childrenData.push({ tokenId, ...childData });
    }
  
    setActiveChildren(childrenData);
  };

  // Retrieve pending children data
  const retrievePendingChildrenData = async () => {
    const pendingChildren = await rmrkNestableFacet.methods.pendingChildrenOf(selectedTokenId).call();
    const pendingChildrenData = []

    for (let index = 0; index < pendingChildren.length; index++) {
      const tokenId = pendingChildren[index].tokenId;
      const childNFTContractAddress = pendingChildren[index].contractAddress
      const pendingChildData = await fetchPendingChildNFTData(childNFTContractAddress, tokenId);
      
      pendingChildrenData.push({
        tokenId, 
        index, 
        childNFTContractAddress, 
        parentTokenId: selectedTokenId,
        ...pendingChildData})
    }

    setPendingChildren(pendingChildrenData)
  }
  
  // Function to fetch child NFT data
  const fetchChildNFTData = async (contractAddress: string, tokenId: string) => {
    const tokenURIFunction = new web3.eth.Contract(RMRKTokenURI.abi, contractAddress);
    const tokenURI = await tokenURIFunction.methods.tokenURI(tokenId).call();
    const response = await fetch(tokenURI);
    const data = await response.json();
    return data;
  }

  // Function to fetch pending NFT data
  const fetchPendingChildNFTData = async (contractAddress: string, tokenId: string) => {
    // get tokenURI
    let childNFTData: any = await fetchChildNFTData(contractAddress, tokenId)

    // check the nft type of this NFT, may query price or query expire time
    const nftType = await authenticateSCManager.methods.nftType(contractAddress).call()
    if (nftType == 2 || nftType == 3 || nftType == 4) {
      const price = await authenticateSCManager.methods.queryPrice(contractAddress, tokenId).call()
      childNFTData['price'] = price
    }
    if (nftType == 4) {
      const expireTime = await authenticateSCManager.methods.expireTime(contractAddress, tokenId).call()
      childNFTData['expireTime'] = expireTime
    }
    
    return childNFTData
  }

  const acceptChild = async (parentTokenId: string, pendingChildIndex: number, childNFTContractAddress: string, childNFTTokenId: string, price: number) => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    const account = accounts[0]

    console.log('accepting child: parentTokenId: ', parentTokenId, "pendingChildIndex: ", pendingChildIndex, "childNFTContract: ", childNFTContractAddress, "tokenId: ", childNFTTokenId, 'price: ', price)

    showLoadingToast('Processing accept child...'); // Show the loading toast
    
    rmrkNestableFacet.methods['acceptChild'](parentTokenId, pendingChildIndex, childNFTContractAddress, childNFTTokenId).send({ from: account, value: price })
      .on("transactionHash", (hash: string) => {
        libNestable.events.ChildAccepted({}, async (error: any, event: any) => {
          toast.success('Accepting child process succeeded.')
        })
      })
      .on("error", (error: any) => {
        console.error(`Accepting error: ${error.message}`);
        toast.error('Accepting process failed.')
      });
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-cyan-100 min-h-screen flex flex-col">
      <div className="container mx-auto px-4 ">
        <Head>
          <title>NAIN Demo</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className="my-8 flex-grow">
          <Tabs 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            showWhitelistManagement={showWhitelistManagement} 
            showCollections = {showCollections}
            showWalletConnectButton={facetsInitialized}
            onWalletConnected={onWalletConnected}
          />
          {renderContent()}
        </main>

        <footer className="border-t mt-8 py-4">
          <p className="text-center text-gray-600">
            NAIN Demo &copy; {new Date().getFullYear()}
          </p>
        </footer>
      </div>
      <ToastContainer />
    </div>
    
  )
}


