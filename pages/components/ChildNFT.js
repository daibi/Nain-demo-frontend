import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import QRCode from 'qrcode.react';

const ChildNFT = ({ child }) => {
    const [showModal, setShowModal] = useState(false);
  
    useEffect(() => {
        Modal.setAppElement('#__next');
    }, []);

    const openModal = () => {
      setShowModal(true);
    };
  
    const closeModal = () => {
      setShowModal(false);
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
                    {child.attributes.map((attribute, index) => (
                    <div key={index} className="text-sm mb-2">
                        <span className="font-semibold">{attribute.trait_type}:</span>
                        <span>{attribute.value}</span>
                    </div>
                    ))}
                    <div className="mb-4">
                        <QRCode value={JSON.stringify(child.attributes)} size={128} />
                    </div>
                    <button className="text-sm py-2 px-4 bg-blue-500 text-white rounded-lg" onClick={closeModal}>
                    Close
                    </button>
                </div>
            </Modal>
        </div>
    );
  };

export default ChildNFT
