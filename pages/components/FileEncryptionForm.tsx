/*
 * @Author: daibi dbfornewsletter@outlook.com
 * @Date: 2023-06-07 22:27:20
 * @LastEditors: daibi dbfornewsletter@outlook.com
 * @LastEditTime: 2023-06-11 17:43:13
 * @FilePath: /nain-frontend/pages/components/FileEncryptionForm.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useState } from 'react';
import axios from "axios";
import lit from "../lib/lit";

const FileEncryptionForm: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [encryptedString, setEncryptedString] = useState('');
  const [encryptedSymmetricKey, setEncryptedSymmetricKey] = useState('');
  const [decryptedContent, setDecryptedContent] = useState('');
  const [ipfsHash, setIpfsHash] = useState('');

  const blobToBase64 = (blob: any) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    return new Promise((resolve) => {
      reader.onloadend = () => {
        resolve(reader.result);
      };
    });
   };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setEncryptedString('');
      setEncryptedSymmetricKey('');
      setDecryptedContent('');
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) {
      return;
    }

    setUploading(true);
    setEncryptedString('');
    setEncryptedSymmetricKey('');
    setDecryptedContent('');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post("/api/upload", formData);
        console.log("repsonse: ", response)
        if (response.status) {
          const { ipfsHash } = response.data;
          console.log('IPFS Hash:', ipfsHash);
          const url = `https://project-oracle-test.mypinata.cloud/ipfs/${ipfsHash}`
          // Handle the returned IPFS hash as needed
          const encrypted = await lit.encryptString(url);
          const currentEncryptFile = await blobToBase64(encrypted.encryptedFile) as string
          setEncryptedString(currentEncryptFile) 
          setEncryptedSymmetricKey(encrypted.encryptedSymmetricKey) 
        } else {
          console.error('Error uploading file:', response.status);
        }
    } catch (error) {
      console.error('Error occurred during upload:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDecrypt = async () => {
    try {
      // Implement the decryption logic here using the content from the encryptedString and encryptedSymmetricKey states
      setDecryptedContent("Try Decrypting...");
      const encryptedStringBlob = await (await fetch(encryptedString)).blob();
      let decryptContent = await lit.decryptString(encryptedStringBlob, encryptedSymmetricKey)
      setDecryptedContent(decryptContent.decryptedFile);
    } catch (error: any) {
      setDecryptedContent(error.message)
    }
  };

  return (
    <div className="flex flex-col space-y-4 w-3/6">
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <label htmlFor="file-upload" className="text-lg font-semibold">
          Upload File:
        </label>
        <div className="flex">
          <div className="relative">
            <input
              type="file"
              className="hidden"
              id="file-upload"
              onChange={handleFileChange}
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer bg-white rounded-md px-4 py-2 border border-gray-300 shadow-sm hover:bg-gray-50"
            >
              {selectedFile ? (selectedFile.name.length > 20 ? selectedFile.name.substring(0, 20) + '...' : selectedFile.name) : 'Choose a file'}
            </label>
          </div>
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md disabled:bg-gray-400"
          disabled={!selectedFile || uploading}
        >
          {uploading ? 'Uploading...' : 'Submit'}
        </button>
      </form>
      <div className="flex flex-col space-y-4">
        <div>
          <label htmlFor="encrypted-string" className="text-lg font-semibold">
            Encrypted String:
          </label>
          <textarea
            id="encrypted-string"
            className="w-full h-48 px-2 py-1 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Encrypted String"
            value={encryptedString}
            onChange={(e) => setEncryptedString(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="encrypted-symmetric-key" className="text-lg font-semibold">
            Encrypted Symmetric Key:
          </label>
          <textarea
            id="encrypted-symmetric-key"
            className="w-full h-48 px-2 py-1 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Encrypted Symmetric Key"
            value={encryptedSymmetricKey}
            onChange={(e) => setEncryptedSymmetricKey(e.target.value)}
          />
        </div>
        <button
          type="button"
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md"
          onClick={handleDecrypt}
          disabled={!encryptedString || encryptedString.length == 0}
        >
          Decrypt
        </button>
        {decryptedContent && (
          <div className="p-4 bg-gray-100">
            <h2 className="text-lg font-semibold">Decrypted Content:</h2>
            {
              decryptedContent.startsWith("http") ? 
              <img src={decryptedContent} alt="nfts" /> : 
              <p>{decryptedContent}</p>
            }
          </div>
        )}
      </div>
    </div>
  );
};

export default FileEncryptionForm;
