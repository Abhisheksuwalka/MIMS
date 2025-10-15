import { createContext, useContext, useState } from "react";
const thisContext = createContext(null);
//coockeies managemnet
function setCookDataEmail(email:any) {
    document.cookie = `userEmail=${encodeURIComponent(email)}; path=/; secure`;
}
function setCookDataToken(token:any) {
    document.cookie = `accessToken=${encodeURIComponent(token)}; path=/; secure`;
}

function clearCookData() {
    document.cookie = 'userEmail=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure';
    document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure';
}
//

export default function ContextProvierAllOver({ children }:{children:any}) {
    const [ userData, setUserData ] = useState()as any;
    const [ token, setTokenInState ] = useState() as any;
    const [ userEmail, setUserEmailInState ]= useState() as any;

    const setToken=(token:any)=>{
        setTokenInState(token);
        setCookDataToken(token);
    }
    const setUserEmail=(email:any)=>{
        setUserEmailInState(email);
        setCookDataEmail(email);
    }
    const LogOut = ()=>{
        clearCookData();
        setTokenInState(undefined);
        setUserEmailInState(undefined);

    }
    return (
        <thisContext.Provider
            value={{
            userData, setUserData,
            token, setToken,
            userEmail, setUserEmail,
            LogOut
            }as any}
        >
            {children}
        </thisContext.Provider>
    );
}

export const useTheContext = () => {
    return useContext(thisContext);
};
