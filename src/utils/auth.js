import { useEffect } from "react"
import {useNavigate} from "react-router-dom"
export const useAuth = ()=>{
    const navigate = useNavigate()
     const authUser = ()=>{
      const isAuthenticated = localStorage.getItem("token")
      console.log("🔍 Auth check - token exists:", !!isAuthenticated)
      if(isAuthenticated){
        return
    }else{
          console.log("❌ No token found, redirecting to login")
          navigate("/login")
      }
    }
    useEffect(()=>{
        authUser()
    },[])
    return {authUser}
}