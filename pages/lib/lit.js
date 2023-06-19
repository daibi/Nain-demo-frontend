/*
 * @Author: daibi dbfornewsletter@outlook.com
 * @Date: 2023-06-08 01:15:50
 * @LastEditors: daibi dbfornewsletter@outlook.com
 * @LastEditTime: 2023-06-09 23:23:16
 * @FilePath: /nain-frontend/pages/lib/lit.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import * as LitJsSdk from "lit-js-sdk";

const client = new LitJsSdk.LitNodeClient()

const chain = 'mumbai'

// should be nain NFT's holder
const accessControlConditionsNFT = [
    {
      contractAddress: '0xe5a00e8a00869a173d6e0eac95cd184ef2c916d3',
      standardContractType: 'ERC721',
      chain,
      method: 'balanceOf',
      parameters: [
        ':userAddress'
      ],
      returnValueTest: {
        comparator: '>',
        value: '0'
      }
    }
  ]
class Lit {
    litNodeClient

    async connect() {
        await client.connect()
        this.litNodeClient = client
    }

    async encryptString(str) {
        if (!this.litNodeClient) {
          await this.connect()
        }
        const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain })
        const { encryptedString, symmetricKey } = await LitJsSdk.encryptString(str)
    
        const encryptedSymmetricKey = await this.litNodeClient.saveEncryptionKey({
          accessControlConditions: accessControlConditionsNFT,
          symmetricKey,
          authSig,
          chain,
        })
    
        return {
          encryptedFile: encryptedString,
          encryptedSymmetricKey: LitJsSdk.uint8arrayToString(encryptedSymmetricKey, "base16")
        }
    
    }

    async decryptString(encryptedStr, encryptedSymmetricKey) {
        if (!this.litNodeClient) {
          await this.connect()
        }
        const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain })
        const symmetricKey = await this.litNodeClient.getEncryptionKey({
          accessControlConditions: accessControlConditionsNFT,
          toDecrypt: encryptedSymmetricKey,
          chain,
          authSig
        })
        const decryptedFile = await LitJsSdk.decryptString(
          encryptedStr,
          symmetricKey
        );
        // eslint-disable-next-line no-console
        console.log({
          decryptedFile
        })
        return { decryptedFile }
    }

}

export default new Lit()