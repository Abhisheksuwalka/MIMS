import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast"

import { BASE_URL, LOGIN_ROUTE, SIGNUP_ROUTE } from "../env"; 
import { useNavigate } from "react-router-dom";
import { useTheContext } from "@/context";

export default function Default() {
  const { setToken, setUserEmail } = useTheContext() as any;

  const Navigate = useNavigate();
  const { toast } = useToast();
  //signup vari
  const [ storeName, setStoreName ] = useState("");
  const [ storeAddress, setStoreAddress ] = useState("");
  const [ storeEmailSignup, setStoreEmailSignup ] = useState("");
  const [ storePasswordSignup, setStorepassword ] = useState("");
  const [ storePasswordRe, setStorepasswordRe ] = useState("");
  //functions
  const handleName = (event:React.ChangeEvent<HTMLInputElement>)=>{setStoreName(event.target.value)};
  const handleAddress = (event:React.ChangeEvent<HTMLInputElement>)=>{setStoreAddress(event.target.value)};
  const handleEmailsignup = (event:React.ChangeEvent<HTMLInputElement>)=>{setStoreEmailSignup(event.target.value)};
  const handlePasswordSignup = (event:React.ChangeEvent<HTMLInputElement>)=>{setStorepassword(event.target.value)};
  const handlePasswordRe = (event:React.ChangeEvent<HTMLInputElement>)=>{setStorepasswordRe(event.target.value)};

  //login vari
  const [ password, setPassword ] = useState("");
  const [ email, setEmail ] = useState("");
  //functions
  const handleEmail = (event:React.ChangeEvent<HTMLInputElement>)=>{setEmail(event.target.value)};
  const handlePassword = (event:React.ChangeEvent<HTMLInputElement>)=>{setPassword(event.target.value)};

  const handelSignup = () => {
    if(storeName === "" || storeAddress === "" || storeEmailSignup === "" || storePasswordSignup === "" || storePasswordRe === ""){
      toast({
        variant: "destructive",
        description: "All fields are required !!",
      })
      return;
    }
    if(storePasswordSignup !== storePasswordRe){
      toast({
        variant: "destructive",
        title: "Password Did't match",
        description: "Password and Re-password must be same.",
      })
      return;
    }
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

        var urlencoded = new URLSearchParams();
        urlencoded.append("storeEmail", storeEmailSignup);
        urlencoded.append("storeName", storeName);
        urlencoded.append("_password", storePasswordSignup);
        urlencoded.append("address", storeAddress);
        var requestOptions: RequestInit = {
          method: 'POST',
          headers: myHeaders,
          body: urlencoded,
          redirect: 'follow' as RequestRedirect | undefined
        };
        const postURL = BASE_URL+SIGNUP_ROUTE;
        fetch( postURL, requestOptions)
          .then(response => {
            console.log(response.status);
            if(response.status == 422){
              toast({
                variant: "destructive",
                title: "Failed",
                description: "Something went wrong here.",
              });
              return; 
            }
            toast({
              title: "Success",
              description: "Successfully ",
            });            
          }).catch(error => console.log('error', error));
  }
  const handelLogin = () => {
    //check empty field password and email
    if(email === "" || password === ""){
      toast({
        variant: "destructive",
        description: "All fields are required !!",
      })
      return;
    }
          //loggin in babe
          var myHeaders = new Headers();
          myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
          
          var urlencoded = new URLSearchParams();
          urlencoded.append("storeEmail", email);
          urlencoded.append("_password", password);
          
          var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: urlencoded,
            redirect: 'follow' as RequestRedirect | undefined
          };
          const url = BASE_URL+LOGIN_ROUTE;
          console.log(url);
          fetch(url, requestOptions)
            .then(response => {
              if(response.status == 422){
                toast({
                  variant: "destructive",
                  title: "Failed",
                  description: "Something went wrong here.",
                });
                return; 
              }
              else if(response.status == 401){
                toast({
                  variant: "destructive",
                  title: "Incorrect Password"
                });
                return; 
              }
              else if(response.status == 402){
                toast({
                  title: "Email does't exist"
                });
                return; 
              }
              else if(response.status == 200){
                toast({
                  title: "Logged in!"
                });            
                return response.text();
              }
            })
            .then(result => {
              if(!result){return;}
              setToken(result);
              setUserEmail(email);
              Navigate("/home");
            })
            .catch(error => console.log('error', error));


  }

  return (
    <div className="flex justify-center mt-[200px]">
      <Tabs defaultValue="account" className="w-[600px] flex flex-col items-center justify-center">
      <Label className="text-[40px]">mɜď bǒx 📦</Label>
      <br />
        <TabsList>
          <TabsTrigger value="account">Log In</TabsTrigger>
          <TabsTrigger value="password">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="account" className="flex flex-col gap-4">
          {/* the login part goes here.. */} 
          <div className="w-[300px] flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input type="email" value={email} onChange={handleEmail} id="email" placeholder="Jhon.will@email.com" />
          </div>         
          <div className="w-[300px] flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input type="password" value={password} onChange={handlePassword} id="password" placeholder="" />
          </div>
          <div className="w-[full] flex justify-end">
            <Button className="w-[30%]" onClick={handelLogin}>Login</Button>
          </div>
        </TabsContent>
        <TabsContent value="password" className="w-[300px] flex flex-col gap-2">
          {/* the signup part goes here.. */} 
          <div className="w-[300px] flex flex-col gap-2">
            <Label htmlFor="LoginEmail">Email</Label>
            <Input type="email" value={storeEmailSignup} onChange={handleEmailsignup} id="LoginEmail" placeholder="jhon.will@email.com" />
          </div>      
          <div className="w-[300px] flex flex-col gap-2">
            <Label htmlFor="name">Store Name</Label>
            <Input type="text" value={storeName} onChange={handleName} id="name" placeholder="John Will" />
          </div>  
          <div className="w-[300px] flex flex-col gap-2">
            <Label htmlFor="address">Store Address</Label>
            <Input type="text" value={storeAddress} onChange={handleAddress} id="address" placeholder="20/C Street klark" />
          </div>         
          <div className="w-[300px] flex flex-col gap-2">
            <Label htmlFor="loginPassword">Password</Label>
            <Input type="password" value={storePasswordSignup} onChange={handlePasswordSignup} id="loginPassword" placeholder="" />
          </div>
          <div className="w-[300px] flex flex-col gap-2">
            <Label htmlFor="loginPasswordRe">Re-Password</Label>
            <Input type="password" value={storePasswordRe} onChange={handlePasswordRe} id="loginPasswordRe" placeholder="" />
          </div>
          <div className="w-[full] flex justify-end">
            <Button className="mt-[10px] w-[30%]" onClick={handelSignup}>Sign up</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
    
  );
}