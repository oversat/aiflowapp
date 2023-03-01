import "../flow/config";
import { useAuth } from "../contexts/AuthContext";
import Profile from "./Profile";
import Link from 'next/link';

function Landing() {
  const { currentUser, profileExists, logOut, logIn, signUp, createProfile } =
    useAuth();

  const Authed_State = () => {
    return (
      <div>
        <div>
          <center>User: {currentUser?.addr ?? "No Address"}</center></div>
        <button onClick={logOut}>Log Out</button>

        <h2>Controls</h2>
        // change createProfile to mintNFT 
        <button onClick={createProfile}>Mint Digital Collectible</button>
      </div>
    );
  };

  const Unauth_State = () => {
    return (
      <div>
        <button onClick={logIn}>Log fuck In</button>
        <button onClick={signUp}>Sign Up</button>
      </div>
    );
  };

  const Messages = () => {
    if (!currentUser?.loggedIn) {
      return "Get started by logging in or signing up.";
    } else {
      if (profileExists) {
        return "Your Profile lives on the blockchain.";
      } else {
        return "Create a profile on the blockchain.";
      }
    }
  };

  return (
    <div>
      <div className="grid">
        <div>
          <h1>
            <center> Mint NFT? </center>
          </h1>
         
        </div>
        <div>
          {currentUser?.loggedIn ? <Authed_State /> : <Unauth_State />}
        </div>
      </div>
    </div>
  );
}

export default Landing;
