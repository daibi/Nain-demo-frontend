/*
 * @Author: daibi dbfornewsletter@outlook.com
 * @Date: 2023-05-02 01:08:40
 * @LastEditors: daibi dbfornewsletter@outlook.com
 * @LastEditTime: 2023-05-14 21:45:39
 * @FilePath: /nain-frontend/pages/components/WalletConnect.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useEffect, useState } from 'react'
import Web3 from 'web3'
import Jazzicon from 'react-jazzicon'

const WalletConnect = ({onWalletConnected}) => {
  const [account, setAccount] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)

  useEffect(() => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum)
      loadAccount(web3)
    }
  }, [])

  const loadAccount = async (web3) => {
    const accounts = await web3.eth.getAccounts()
    if (accounts && accounts[0]) {
      setAccount(accounts[0])
      setIsConnected(true) 
      onWalletConnected(accounts[0])
    } else {
      setIsConnected(false) 
    }
  }

  const connectWallet = async () => {
    setConnecting(true)
    try {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum)
        await window.ethereum.request({ method: 'eth_requestAccounts' })
        await loadAccount(web3)
      } else {
        alert('Please install MetaMask to connect your wallet')
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    } finally {
      setConnecting(false)
    }
  }

  return (
    <div className="text-center">
      {!account && !connecting && (
        <button className="group flex max-w-fit items-center justify-center space-x-2 rounded-full border border-black bg-black px-5 py-2 text-sm text-white transition-colors hover:bg-white hover:text-black" onClick={connectWallet}>
          Connect Wallet
        </button>
      )}
      {connecting && <p>Connecting wallet...</p>}
      {isConnected && 
      <div className="flex"> 
        <div style={{marginRight: 2, marginTop: 2}}>
          <Jazzicon diameter={20} seed={parseInt(account.slice(2, 10), 16)} />
        </div>
        <div>
          {shortAddress(account)}
        </div>
      </div>}
    </div>
  )
}

const shortAddress = (address) => {
  return address.slice(0,5) + "..." + address.slice(-5)
}

export default WalletConnect
