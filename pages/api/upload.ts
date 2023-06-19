import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import pinataSDK from '@pinata/sdk';
import { IncomingForm } from 'formidable';

type Data = {
  name: string
}

const pinataApiKey = '851b44ee88e255f1043d'
const pinataApiSecret =
  '069041b73bf10e80a50bd27b6280bc9ca184425f68a23f12e9271f8cb6ee1f0e'

const pinata = new pinataSDK(pinataApiKey, pinataApiSecret)

const uploadFile = async (file: fs.ReadStream, fileName: string) => {
  try {
    const options = {
      pinataMetadata: {
        name: fileName,
      },
    };
    const uploadResult = await pinata.pinFileToIPFS(file, options);
    return uploadResult.IpfsHash;
  } catch (error) {
    console.log('error: ', error)
    throw new Error('Error uploading file to Pinata');
  }
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function uploadHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const form = new IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing form data:', err);
        res.status(500).json({ error: 'Failed to parse form data' });
        return;
      }

      const file = files?.file as any; // Access the file using the field name from the form
      if (!file) {
        res.status(400).json({ error: 'No file provided' });
        return;
      }

      const { filepath, originalFilename } = file;
      const fileBuffer = fs.createReadStream(filepath);
      try {
        const ipfsHash = await uploadFile(fileBuffer, originalFilename);
        res.status(200).json({ ipfsHash });
      } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'Failed to upload file' });
      }
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}