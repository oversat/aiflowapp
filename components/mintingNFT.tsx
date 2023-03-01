
import { useState } from "react";
import { FlowTransaction, FlowTransactionStatus } from "@onflow/fcl";
import { deployContractByName, executeScript } from "flow-js-testing";

interface RaribleNFTv2Props {
  recipientAddress: string;
  contractAddress: string;
  privateKey: string;
}

const mintingNFT = ({ recipientAddress, contractAddress, privateKey }: RaribleNFTv2Props) => {
  const [transactionStatus, setTransactionStatus] = useState<FlowTransactionStatus | undefined>();
  const [transactionErrorMessage, setTransactionErrorMessage] = useState<string | undefined>();
  const [nftName, setNftName] = useState<string>("");

  const mintNFT = async () => {
    try {
      const meta = {
        name: nftName,
        description: "",
        cid: "",
        attributes: {},
        contentUrls: [],
      };

      const deployTx: FlowTransaction = await deployContractByName({
        to: contractAddress,
        name: "RaribleNFTv2",
        privateKey,
        authorizations: [{ address: contractAddress, signAlgo: 2, keyId: 0, weight: 1000 }],
      });

      setTransactionStatus(deployTx.status);
      if (deployTx.errorMessage) {
        setTransactionErrorMessage(deployTx.errorMessage);
        return;
      }

      const tokenId = await executeScript({
        code: `import RaribleNFTv2 from ${contractAddress}

        pub fun main(): UInt64 {
          return RaribleNFTv2.totalSupply
        }`,
        args: [],
        signers: [{ address: contractAddress, keyId: 0, signAlgo: 2, signature: privateKey }],
      });

      const mintTx: FlowTransaction = await executeScript({
        code: `import RaribleNFTv2 from ${contractAddress}
        
        transaction(tokenName: String) {
          let collectionRef: &RaribleNFTv2.Collection{RaribleNFTv2.NFT}
          let receiverRef: &{RaribleNFTv2.NFTReceiver}

          prepare(acct: AuthAccount) {
            self.collectionAccount = acct.getCapability<&RaribleNFTv2.Collection{RaribleNFTv2.NFTReceiver}>(/public/RaribleNFTv2Collection)!
                .borrow()
                ?? panic("Could not borrow capability from public collection")
            self.receiverRef = getAccount(${recipientAddress})
                .getCapability<&{RaribleNFTv2.NFTReceiver}>(/public/NFTReceiver)!
                .borrow()
                ?? panic("Could not borrow receiver capability")
          }

          execute {
            self.collectionAccount.mint(
              self.receiverRef,
              0,
              ${contractAddress},
              RaribleNFTv2.Meta(
                name: tokenName,
                description: "",
                cid: "",
                attributes: {},
                contentUrls: []
              ),
              []
            )
          }
        }`,
        args: (arg, t) => [arg(nftName, t.String)],
        signers: [{ address: contractAddress, keyId: 0, signAlgo: 2, signature: privateKey }],
      });

      setTransactionStatus(mintTx.status);
      if (mintTx.errorMessage) {
        setTransactionErrorMessage(mintTx.errorMessage);
        return;
      }
    } catch (error) {
      console.error(error);
      setTransactionErrorMessage(error.message);
    }
  };

  const onMint = async () => {
    if (!promptValue) {
      setPromptErrorMessage('Please submit a prompt value');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/generate-image?prompt=${promptValue}`);
      const data = await response.json();
      const contentUrl = data.data[0].url;
      const attributes = {
        description: 'Generated with OpenAI DALL-E 2 API',
        image: contentUrl,
        background_color: 'white',
      };

      const metadata = new File([JSON.stringify({
        name: promptValue,
        description: 'Generated with OpenAI DALL-E 2 API',
        image: contentUrl,
        attributes: attributes,
      })], 'metadata.json', {type: 'application/json'});

      const metadataCID = await uploadToIPFS(metadata);

      const signedTransaction = await signAndSendTransaction((account) =>
        RaribleNFTv2.mint(
          account,
          0,
          account.address,
          { name: promptValue, description: 'Generated with OpenAI DALL-E 2 API', cid: metadataCID, attributes: attributes, contentUrls: [contentUrl] },
          [{ address: account.address, fee: 100000 }]
        )
      );

      console.log(`Minted NFT with transaction ID ${signedTransaction.transactionId}`);
      setTransactionHash(signedTransaction.transactionId);
    } catch (error) {
      console.error(error);
      setTransactionErrorMessage(error.message);
    }
  };

  return (
    <div>
      <Head>
        <title>Ai NFTs on Flow</title>
        <meta name="description" content="Create and mint Ai Art Flow NFTs" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className={styles.title}>
          DALL-E 2 NFT Generator
        </h1>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h2>Submit a prompt</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              <input {...register('prompt', { required: true })} placeholder="Enter a prompt" />
              <div className={styles.error}>{promptErrorMessage}</div>
              <button type="submit">Submit</button>
            </form>
          </div>

          {imageUrl && (
            <div className={styles.card}>
              <h2>Generated Image</h2>
              <img src={imageUrl} alt="Generated" />
            </div>
          )}

          <div className={styles.card}>
            <h2>Mint NFT</h2>
            <button onClick={onMint}>Mint</button>
            {transactionHash && (
              <div>
                <p>Transaction ID: {transactionHash}</p>
                <a href={`https://flowscan.org/transaction/${transactionHash}`} target="_blank" rel="noreferrer">View on FlowScan</a>
              </div>
            )}
            <div className={styles.error}>{transactionErrorMessage}</div>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        Powered by <a href="https://openai.com" target="_blank" rel="noreferrer">OpenAI</a> and <a href="https://onflow.org" target="_blank" rel="noreferrer">Flow</a>
      </footer>
    </div>
  );
};

export default mintingNFT;
