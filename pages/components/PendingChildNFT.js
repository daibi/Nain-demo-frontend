/*
 * @Author: daibi dbfornewsletter@outlook.com
 * @Date: 2023-05-28 17:43:16
 * @LastEditors: daibi dbfornewsletter@outlook.com
 * @LastEditTime: 2023-05-28 20:48:42
 * @FilePath: /nain-frontend/pages/components/PendingChildNFT.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { FaEthereum } from 'react-icons/fa';

// Helper function to convert Wei to Ether
const convertWeiToEther = (wei) => {
    const ether = wei / 10**18; // 1 Ether = 10^18 Wei
    return ether.toFixed(4);
};

const PendingChildNFT = ({ child, acceptChild }) => {
    const [showModal, setShowModal] = useState(false);
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        Modal.setAppElement('#__next');
    }, []);

    const openModal = () => {
      setShowModal(true);
    };
  
    const closeModal = () => {
      setShowModal(false);
    };

    useEffect(() => {
        let countdownInterval;
    
        if (showModal) {
          const expireTime = parseInt(child.expireTime);
          const now = Math.floor(Date.now() / 1000);
          const remainingTime = expireTime - now;
    
          if (remainingTime > 0) {
            setCountdown(remainingTime);
            countdownInterval = setInterval(() => {
              setCountdown(prevCountdown => prevCountdown - 1);
            }, 1000);
          } else {
            setCountdown(0);
          }
        }
    
        return () => {
          clearInterval(countdownInterval);
        };
    }, [showModal, child.expireTime]);

    const formatCountdown = () => {
        if (countdown === 0) {
            return 'Expired';
        }
        

        const days = Math.floor(countdown / (60 * 60 * 24));
        const hours = Math.floor((countdown % (60 * 60 * 24)) / (60 * 60));
        const minutes = Math.floor((countdown % (60 * 60)) / 60);
        const seconds = countdown % 60;
      
        let formattedCountdown = '';
        if (days > 0) {
          formattedCountdown += `${days} day${days > 1 ? 's' : ''}, `;
        }
        formattedCountdown += `${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
        return formattedCountdown;
    };
    
    const handleAcceptChild = () => {
        if (child.price) {
            acceptChild(child.parentTokenId, child.index, child.childNFTContractAddress, child.tokenId, child.price);
        } else {
            acceptChild(child.parentTokenId, child.index, child.childNFTContractAddress, child.tokenId, 0);
        }
        closeModal()
    };
  
    return (
        <div className="flex flex-col items-center justify-center space-y-2">
            <div className="relative w-20 h-20 rounded-full overflow-hidden">
                <img
                src={child.image}
                alt={`Child NFT ${child.tokenId}`}
                className="w-full h-full object-cover cursor-pointer"
                onClick={openModal}
                />
            </div>
            <h3 className="text-sm font-semibold">{child.name}</h3>

            <Modal
                isOpen={showModal}
                onRequestClose={closeModal}
                className="fixed inset-0 flex items-center justify-center z-50"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50"
            >
                <div className="bg-white rounded-lg p-4">
                    <img src={child.image} alt={`Child NFT ${child.tokenId}`} className="w-40 h-40 mb-4 object-cover" />
                    {child.attributes?.map((attribute, index) => (
                    <div key={index} className="text-sm mb-2">
                        <span className="font-semibold">{attribute.trait_type}:</span>
                        <span>{attribute.value}</span>
                    </div>
                    ))}
                    {countdown > 0 && (
                        <div>
                            <span className="font-semibold">Countdown:</span> 
                            <span>{formatCountdown()}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <button
                        className="text-sm py-2 px-4 bg-red-500 text-white rounded-lg mr-2"
                        onClick={closeModal}
                        >
                        Close
                        </button>
                        {countdown > 0 && (
                            child.price ? 
                            <button
                                className="text-sm py-2 px-4 bg-green-500 text-white rounded-lg flex items-center"
                                onClick={handleAcceptChild}
                            >
                                <span className="mr-2">Accept Child {convertWeiToEther(child.price)}</span>
                                <FaEthereum />
                            </button>:
                            <button
                                className="text-sm py-2 px-4 bg-green-500 text-white rounded-lg"
                                onClick={handleAcceptChild}
                            >
                                Accept NFT
                            </button>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
  };

export default PendingChildNFT
