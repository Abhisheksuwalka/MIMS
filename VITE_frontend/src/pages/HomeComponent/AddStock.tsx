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
import { BASE_URL, MEDICINE_SEARCH, ADD_STOCK } from "@/env";
import { Button } from "@/components/ui/button";
import { useTheContext } from "@/context";
import { useToast } from "@/components/ui/use-toast";

export default function AddStock() {
    const [ querry, setQuerry ] = useState("");
    console.log(querry);
    const [ medData, setmedData ] = useState([]);
    const handelChange = (event:React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();
        setQuerry(event.target.value);
        fetchQuerry(event.target.value);
    };

    const fetchQuerry = (str:any)=> {
                var myHeaders = new Headers();
                var urlencoded = new URLSearchParams();
                urlencoded.append("query", str);
                var requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: urlencoded,
                redirect: 'follow' as RequestRedirect | undefined
                };
                const url = BASE_URL+MEDICINE_SEARCH;
                fetch(url, requestOptions)
                .then(response => response.text())
                .then(result => setmedData(JSON.parse(result)))
                .catch(error => console.log('error', error));
    }

    return (
        <>
            <Popover>
                <PopoverTrigger className="p-2 px-4 bg-white rounded text-black font-bold text-[15px]">Add Stock</PopoverTrigger>
                <PopoverContent className="flex flex-col gap-3 w-[500px]">
                    <h1 className="text-[20px] text-wite font-bold">Adding to Stock</h1>
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
    const [medicineQuantityToAdd, setMedicineQuantityToAdd] = useState(0);
    const handle = (event:any) => {
        setMedicineQuantityToAdd(event.target.value);
    }
    const handelAddingTheStockToStore = () => {


                var myHeaders = new Headers();
                myHeaders.append("Authorization", token);
                myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
                
                var urlencoded = new URLSearchParams();
                urlencoded.append("storeEmail", userEmail);
                urlencoded.append("medID", data.medID);
                urlencoded.append("name", data.name);
                urlencoded.append("secName", "");
                urlencoded.append("sellingType", data?.sellingType);
                urlencoded.append("medType", data?.medType);
                urlencoded.append("pricePerTab", data?.pricePerTab);
                urlencoded.append("cardPerBox", data?.cardPerBox || "0");
                urlencoded.append("quantityPerCard", data?.quantityPerCard);
                urlencoded.append("pricePerBox", data?.pricePerBox);
                urlencoded.append("medicineQuantityToAdd", medicineQuantityToAdd.toString());

                var requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: urlencoded,
                redirect: 'follow'  as RequestRedirect | undefined
                };
                const url = BASE_URL+ADD_STOCK;
                fetch(url, requestOptions)
                .then(response => {
                    if(response.status == 200){
                        toast({
                            title: "✅ Stock Added",
                            variant: "destructive",
                            description: medicineQuantityToAdd+" peices of "+data.name+" was added to the stock, Check out the dashboard to review the changes."
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

    }
    
    return (
        <div className="flex border-b items-center border-[#353535] justify-between p-2">
            <div className="flex flex-col">
                <h1 className="text-[12px] text-wite font-bold">{data.medID}</h1>
                <h1 className="text-[18px] text-wite font-bold">{data.name}</h1>
            </div>
            <div className="">
                <Sheet>
                    <SheetTrigger className="font-bold text-[18px] text-black border rounded-[6px] bg-white p-1 px-3">ADD</SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <div className="flex flex-col"> 
                                <SheetTitle className="text-[18px] text-wite font-bold">{data.medID}</SheetTitle>
                                <SheetTitle className="text-[26px] text-wite font-bold">{data.name}</SheetTitle>
                            </div>
                        <SheetDescription>
                            This action cannot be undone. This will add this specific medicin to your stock. To remove this medicin from stock you have to go to the remove stock section.
                        </SheetDescription>
                        <SheetDescription className="text-white text-right text-[20px]">
                            ${data.pricePerBox}
                        </SheetDescription>
                        <SheetDescription className="text-white flex gap-2 justify-end text-right text-[20px]">
                            <Input type="text" onChange={handle} value={medicineQuantityToAdd} className="w-[40%] text-right text-[24px]"></Input>
                            <Button className="text-bold text-[24px] text-black" onClick={handelAddingTheStockToStore}>Add</Button>
                        </SheetDescription>
                        </SheetHeader>
                    </SheetContent>
                </Sheet>
            </div>

        </div>
    );
}