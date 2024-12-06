import { useState, useEffect } from 'react'
import './App.css'
import { useAuthContext } from '@asgardeo/auth-react'
import OrganizationSwitch from './OrganizationSwitch'

function App() {
  const { getDecodedIDToken, state, signIn, signOut, getAccessToken } = useAuthContext();
  const [orgName, setOrgName] = useState("");

  useEffect(() => {

    if (!state.isAuthenticated) return;

    getDecodedIDToken().then((decodedIdToken) => {
      setOrgName(decodedIdToken?.org_name);

    }).catch((error) => {
        console.log(error);
    })
  }, [state.isAuthenticated, getDecodedIDToken]);

  return (
    <>
      {
        state?.isAuthenticated ? (
          <div>
            <h3>Hi { state?.username }</h3>
            <p>You've logged in to the organization: <b>{ orgName }</b></p>
            <OrganizationSwitch />
            <button onClick={() => signOut()}>Sign Out</button>
          </div>
        ) : (
          <div>
            <h3>Welcome to the Vite React Asgardeo Secure App!</h3>
            <button onClick={() => signIn()}>Sign In</button>
          </div>
        )
      }
    </>
  )
}

export default App;
