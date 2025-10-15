import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast"
import { useTheContext } from "@/context";
import { useNavigate } from "react-router-dom";
import { BASE_URL, STORE_DATA_ROUTE } from "@/env";
import AddStock from "./HomeComponent/AddStock";
import RemoveStock from "./HomeComponent/RemoveStock";
import Navbar from "./HomeComponent/Navbar";
import Stocks from "./HomeComponent/Stock";
import Billing from "./HomeComponent/Billing";
import History from "./HomeComponent/History";


export default function Home() {
  const { toast } = useToast();
  const { userEmail, token, setUserData } = useTheContext() as any;
  const Navigate = useNavigate();


  useEffect(()=>{
    if(!userEmail || !token){
      toast({
        title: "session expired",
      });
      Navigate("/");
      return;
    }
    
    //fetch userData..here...
    //save userData man..
    //fetching usedData
              var myHeaders = new Headers();
              myHeaders.append("Authorization", token);
              myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
              
              var urlencoded = new URLSearchParams();
              urlencoded.append("storeEmail", userEmail);
              
              var requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: urlencoded,
                redirect: 'follow' as RequestRedirect | undefined
              };
              const url = BASE_URL+STORE_DATA_ROUTE;
              fetch(url, requestOptions)
                .then(response => {
                  if(response.status == 200){
                    return response.text();        
                  }
                  toast({
                    variant: "destructive",
                    title: "Failed to fetch data",
                    description: "Token expired!!",
                  });
                })
                .then(result => {
                  if(!result){
                    return;
                  }
                  const data = JSON.parse(result);
                  setUserData(data);
                })
                .catch(error => {
                  console.log('error', error);
                  toast({
                    variant: "destructive",
                    title: "Fatel Error!",
                    description: "Enable Access-Control-Allow-Headers in the browser.",
                  });
                  Navigate("/");
                });
    //fetch end
  },[]);
  return (
    <>
     <Navbar />
      <div className="items-center justify-center m-[25px] flex">
        <Tabs defaultValue="account" className="w-[900px] items-center flex flex-col">
          <TabsList>
            <TabsTrigger value="account">Stock </TabsTrigger>
            <TabsTrigger value="password">Billing</TabsTrigger>
            <TabsTrigger value="bill">History</TabsTrigger>
          </TabsList>
          <TabsContent value="account">
            <br />
            <div className="flex items-end gap-4">
              <AddStock />
              <RemoveStock />
            </div>
            <br />
            <Stocks />
          </TabsContent>

          <TabsContent value="password">
            <br />
            <br />
            <Billing />
          </TabsContent>
          <TabsContent value="bill">
            <br />
            <br />
            <History />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}