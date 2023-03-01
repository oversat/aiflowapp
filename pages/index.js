import Head from "next/head";
import Landing from "../components/Landing";
import Transaction from "../components/Transaction";
// in the browser
import * as fcl from "@onflow/fcl"

fcl.config({
  "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn", // Endpoint set to Testnet
})

export default function Home() {
  return (
    <div>
      <Head>
        <title>FCL Quickstart with NextJS</title>
        <meta name="description" content="My first web3 app on Flow!" />
        <link rel="icon" href="/favicon.png" />
      </Head>

      <main>
        <Transaction />
        <button onClick={fcl.authenticate}>Login</button> 

        <div className="grid">
          <Landing />
        </div>
      </main>
    </div>
  );
}
