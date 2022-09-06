import fetch from 'node-fetch';
import express from 'express';
import { ethers } from "ethers";

const app = express();
let PORT = process.env.PORT || 80;


const SHIBOSHI_CONTRACT_ADDRESS = '0x11450058d796b02eb53e65374be59cff65d3fe7f'
const SHIBOSHI_CURRENT_BASEURI = 'https://shiboshis.mypinata.cloud/ipfs/QmUEiYGcZJWZWp9LNCTL5PGhGcjGvokKfcaCoj23dbp79J/'

const ABI = [
    'function tokenNameByIndex(uint256 index) public view returns (string)'
]

app.get('/', async (req, res) => {
    res.send("This is a Shiboshis Metadata API")
})

app.get('/:boshinumber', async (req, res) => {
    const provider = ethers.getDefaultProvider()
    const contract = new ethers.Contract(SHIBOSHI_CONTRACT_ADDRESS, ABI, provider)

    if (isNaN(req.params.boshinumber)) {
        res.status(418).send({ message: 'you send something that is not a number' })
        return;
    }

    if (req.params.boshinumber < 0 || req.params.boshinumber > 9999) {
        res.status(418).send({ message: 'the boshi ID is outside parameter bounds' })
        return;
    }

    try {
        const boshiNameFromContract = await contract.tokenNameByIndex(req.params.boshinumber)
        const boshiMetadataFromIPFS = await fetch(`${SHIBOSHI_CURRENT_BASEURI}${req.params.boshinumber}`);
        const boshiMetadataFromIPFS_asJSONObject = await boshiMetadataFromIPFS.json();
        if (boshiNameFromContract) {
            //this boshi has been renamed - let's replace the name in data
            boshiMetadataFromIPFS_asJSONObject.name = boshiNameFromContract;
        };

        res.json(boshiMetadataFromIPFS_asJSONObject)
    } catch (e) {
        res.send(e)
    }
})

app.listen(PORT, () => console.log(`it's alive on http://localhost:${PORT}`))