import React,{ useState } from "react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
  } from "@/components/ui/sheet"
  
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area"
import { BASE_URL, REMOVE_STOCK, STORE_STOCK_QUERRY } from "@/env";
import { Button } from "@/components/ui/button";
import { useTheContext } from "@/context";
import { useToast } from "@/components/ui/use-toast";

export default function AddStock() {
    const [ querry, setQuerry ] = useState("");
    console.log(querry);
    const [ medData, setmedData ] = useState([]);
    const { token, userEmail } = useTheContext() as any;
    const handelChange = (event:React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();
        setQuerry(event.target.value);
        fetchQuerry(event.target.value);
    };

    const fetchQuerry = (str:any)=> {
                var myHeaders = new Headers();
                myHeaders.append("Authorization", token);
                myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
                
                var urlencoded = new URLSearchParams();
                urlencoded.append("storeEmail", userEmail);
                urlencoded.append("query", str);
                
                var requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: urlencoded,
                redirect: 'follow' as RequestRedirect | undefined
                };
                const uri = BASE_URL+STORE_STOCK_QUERRY;
                fetch(uri, requestOptions)
                .then(response => response.text())
                .then(result => setmedData(JSON.parse(result)))
                .catch(error => console.log('error', error));
    }

    return (
        <>
            <Popover>
                <PopoverTrigger className="p-2 px-4 bg-white rounded text-black font-bold text-[15px]">Remove Stock</PopoverTrigger>
                <PopoverContent className="flex flex-col gap-3 w-[500px]">
                    <h1 className="text-[20px] text-wite font-bold">Removing from Stock</h1>
                    <div className="flex flex-col gap-3">
                        <Label htmlFor="medNameAdd">Search</Label>
                        <Input type="text" id="" onChange={handelChange} placeholder="" />
                    </div>
                    <div>
                    <ScrollArea className="h-[400px] w-full rounded-md border p-4 flex flex-col gap-3">
                        {medData.map((data,i)=> (<MedComponent key={i} data={data} />))}
                    </ScrollArea>

                    </div>
                </PopoverContent>
              </Popover>
        </>
    );
}


function MedComponent({data}:{data:any}) {
    const {toast} = useToast();
    const { token, userEmail } = useTheContext() as any;
    const [ QuantityToRemove, setQuantityToRemove ] = useState(0);
    const handle = (event:any) => {
        setQuantityToRemove(event.target.value);
    }

    const handleRemovingFromStock = () => {
                    var myHeaders = new Headers();
                    myHeaders.append("Authorization", token);
                    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
                    
                    var urlencoded = new URLSearchParams();
                    urlencoded.append("storeEmail", userEmail);
                    urlencoded.append("medID", data.medData.medID);
                    urlencoded.append("quantityToRemove", QuantityToRemove.toString());
                    
                    var requestOptions = {
                    method: 'POST',
                    headers: myHeaders,
                    body: urlencoded,
                    redirect: 'follow' as RequestRedirect | undefined
                    };
                    const uri = BASE_URL+REMOVE_STOCK;
                    fetch(uri, requestOptions)
                    .then(response => {
                        if(response.status == 200){
                            toast({
                                title: "✅ Stock Removed",
                                variant: "destructive",
                                description: QuantityToRemove+" peices of "+data.name+" was Removed from the stock. Check out the dashboard to review the changes."
                            });
                        }
                        else{
                            toast({
                                title: "Error Occured!!!",
                                variant: "destructive",
                                description: "unknown error occured!!"
                            });
                        }
                    })
                    .then(result => console.log(result))
                    .catch(error => console.log('error', error));
    };
   
    
    return (
        <div className="flex border-b items-center border-[#353535] justify-between p-2">
            <div className="flex flex-col">
                <h1 className="text-[12px] text-wite font-bold">{data.medData.medID}</h1>
                <h1 className="text-[18px] text-wite font-bold">{data.medData.name}</h1>
            </div>
            <div className="">
                <Sheet>
                    <SheetTrigger className="font-bold text-[18px] text-black border rounded-[6px] bg-white p-1 px-3">Remove</SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <div className="flex flex-col"> 
                                <SheetTitle className="text-[18px] text-wite font-bold">{data.medData.medID}</SheetTitle>
                                <SheetTitle className="text-[26px] text-wite font-bold">{data.medData.name}</SheetTitle>
                            </div>
                        <SheetDescription>
                            This action cannot be undone. This will remove this specific medicine from your stock.
                        </SheetDescription>
                        <SheetDescription className="text-white text-right text-[20px]">
                            In Stock: {data.quantity}
                        </SheetDescription>
                        <SheetDescription className="text-white flex gap-2 justify-end text-right text-[20px]">
                            <Input type="text" onChange={handle} value={QuantityToRemove} className="w-[40%] text-right text-[24px]"></Input>
                            <Button className="text-bold text-[24px] text-black" onClick={handleRemovingFromStock}>Remove</Button>
                        </SheetDescription>
                        </SheetHeader>
                    </SheetContent>
                </Sheet>
            </div>

        </div>
    );
}