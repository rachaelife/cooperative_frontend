import { useEffect } from "react"


export const useAuth = ()=>{

    

     const authUser = ()=>{
      const isAuthenticated = localStorage.getItem("token")
      if(isAuthenticated){
        return 
    }else{
          navigate("/login")
      }
    }

    useEffect(()=>{
        authUser()
    },[])

    return {authUser}
}