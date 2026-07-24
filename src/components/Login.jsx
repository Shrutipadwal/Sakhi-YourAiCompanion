import GoogleAuth from "./GoogleAuth";

const Login = () => {
  return (
    <GoogleAuth
      title="Welcome Back"
      subtitle="Sign in with Google to continue to Sakhi."
      helpText="Don't have an account?"
      helpLink="/signup"
      helpLinkText="Sign Up"
    />
  );
};

export default Login;
