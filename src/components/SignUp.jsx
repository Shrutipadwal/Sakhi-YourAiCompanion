import GoogleAuth from "./GoogleAuth";

const SignUp = () => {
  return (
    <GoogleAuth
      title="Join Sakhi"
      subtitle="Use your Google account to enter a calm, supportive chat space."
      helpText="Already have an account?"
      helpLink="/login"
      helpLinkText="Login"
    />
  );
};

export default SignUp;
