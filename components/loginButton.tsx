import * as fcl from "@onflow/fcl";
import { useAuth } from "../contexts/AuthContext";

type LoginButtonProps = {
  variant: "login" | "signup";
};

export default function LoginButton({ variant }: LoginButtonProps) {
  const { logIn, signUp } = useAuth();

  const handleClick = () => {
    if (variant === "login") {
      logIn();
    } else if (variant === "signup") {
      signUp();
    }
  };

  return (
    <button onClick={handleClick}>
      {variant === "login" ? "Log In" : "Sign Up"}
    </button>
  );
}
