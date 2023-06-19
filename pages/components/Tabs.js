/*
 * @Author: daibi dbfornewsletter@outlook.com
 * @Date: 2023-05-02 01:04:26
 * @LastEditors: daibi dbfornewsletter@outlook.com
 * @LastEditTime: 2023-06-07 22:47:43
 * @FilePath: /nain-frontend/pages/components/Tabs.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React from 'react'
import WalletConnect from './WalletConnect'
import Image from "next/image";

const Tabs = ({ activeTab, setActiveTab, showWhitelistManagement, showCollections, showWalletConnectButton, onWalletConnected }) => {
  const features = ['get started', "file encryption"]

  if (showWhitelistManagement) {
    features.push('whitelist management')
  }

  if (showCollections) {
    features.push('collections');
  }

  return (
    <div className="flex justify-between items-center mb-8">
      <div className="flex items-center space-x-4">
        <Image
              src="/logo.png"
              alt="Project Nain"
              width="30"
              height="30"
              className="mr-2 rounded-sm"
        ></Image>
        <span className="text-2xl font-bold">Project NAIN</span>
      </div>
      <div className="flex items-center">
        <div className="flext space-x-4 mr-6">
            {features.map((feature) => (
            <button
                key={feature}
                className={`border-b-2 py-2 ${
                activeTab === feature ? 'border-blue-600' : 'border-transparent'
                }`}
                onClick={() => setActiveTab(feature)}
            >
                {feature.charAt(0).toUpperCase() + feature.slice(1)}
            </button>
            ))}
        </div>
        {showWalletConnectButton && <WalletConnect onWalletConnected={onWalletConnected} />}
      </div>
     
    </div>
  )
}

export default Tabs
