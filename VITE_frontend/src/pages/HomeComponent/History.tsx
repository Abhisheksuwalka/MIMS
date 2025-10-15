import { useState, useEffect } from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
  } from "@/components/ui/sheet"
  
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

import { useTheContext } from "@/context";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { BASE_URL, BILL_BY_NAME, BILL_BY_PHONE, BILL_BY_MED } from "@/env";
  

export default function History(){
    const { toast } = useToast();
    const { token, userEmail } = useTheContext() as any;
    const [ querry, setQuerry ] = useState("");
    const [ selector, setSelector ] = useState(0);
    const [ bills, setBills] = useState([]);
    const handleQuerryChange = (e:any)=>{setQuerry(e.target.value)};
    const handleSerch = () => {
        if( !querry ){
            toast({
                variant: "destructive",
                title: "⚠️ All fields required!!",
              });
            return;
        }
        switch(selector){
            case 0:
                fetchByName();
                break;
            case 1:
                fetchByPhone();
                break;
            case 2:
                fetchByMed();
                break;
        }
    }
    const fetchByName = ()=>{
                var myHeaders = new Headers();
                myHeaders.append("Authorization", token);
                myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

                var urlencoded = new URLSearchParams();
                urlencoded.append("storeEmail", userEmail);
                urlencoded.append("query", querry);

                var requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: urlencoded,
                redirect: 'follow' as  RequestRedirect | undefined
                };
                const uri = BASE_URL+BILL_BY_NAME;
                fetch(uri, requestOptions)
                .then(response => response.text())
                .then(result => setBills(JSON.parse(result)))
                .catch(error => console.log('error', error));
    }
    const fetchByPhone = ()=>{
        var myHeaders = new Headers();
        myHeaders.append("Authorization", token);
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

        var urlencoded = new URLSearchParams();
        urlencoded.append("storeEmail", userEmail);
        urlencoded.append("query", querry);

        var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded,
        redirect: 'follow' as  RequestRedirect | undefined
        };
        const uri = BASE_URL+BILL_BY_PHONE;
        fetch(uri, requestOptions)
        .then(response => response.text())
        .then(result => setBills(JSON.parse(result)))
        .catch(error => console.log('error', error));
    }
    const fetchByMed = ()=>{
        var myHeaders = new Headers();
        myHeaders.append("Authorization", token);
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

        var urlencoded = new URLSearchParams();
        urlencoded.append("storeEmail", userEmail);
        urlencoded.append("query", querry);

        var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded,
        redirect: 'follow' as  RequestRedirect | undefined
        };
        const uri = BASE_URL+BILL_BY_MED;
        fetch(uri, requestOptions)
        .then(response => response.text())
        .then(result => setBills(JSON.parse(result)))
        .catch(error => console.log('error', error));
    }
    function capitalizeFirstLetter(word:any) {
        if (!word || typeof word!=='string')
            return word;
        return word.charAt(0).toUpperCase() + word.slice(1);
    }
    useEffect(()=>{console.log(bills, selector, querry);},[bills, selector, querry]);
    return (
        <>
            <div className="w-[800px]">
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2 items-center">
                        <Label className="font-bold text-[20px] w-[170px]">Querry Input :</Label>
                        <Input onChange={handleQuerryChange} value={querry}/>
                    </div>  
                    <div className="flex justify-between">
                        <RadioGroup defaultValue="option-one" className="flex items-center gap-5">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="option-one" id="option-one" onClick={()=>{setSelector(0)}}/>
                                <Label htmlFor="option-one">Serch by name</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="option-two" id="option-two" onClick={()=>{setSelector(1)}}/>
                                <Label htmlFor="option-two">Serch by Phone</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="option-three" id="option-three" onClick={()=>{setSelector(2)}} />
                                <Label htmlFor="option-two">Serch by Medicine</Label>
                            </div>  
                        </RadioGroup>
                        <Button className="px-3 py-1 w-[90px]" onClick={handleSerch}>Serch</Button>
                    </div>              

                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[200px]">Date</TableHead>
                            <TableHead className="w-[400px]">Name</TableHead>
                            <TableHead className="w-[400px] text-right">Phone</TableHead>
                            <TableHead className="">Age</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        { bills.length>0 && bills.map((item:any) => {
                            return (
                                <TableRow className="w-full">
                                    <TableCell className="font-light text-center">{item.createdAt.slice(0,10)}</TableCell>
                                    <TableCell className="w-[600px]">{capitalizeFirstLetter(item.customerName)}</TableCell>
                                    <TableCell className="text-right">{item.phone}</TableCell>
                                    <TableCell className="font-bold text-[12px] text-right">{item.customerAge}</TableCell>
                                    <TableCell>
                                        <Sheet>
                                            <SheetTrigger className="h-full">⇢</SheetTrigger>
                                            <SheetContent>
                                                <SheetHeader>
                                                <SheetTitle>
                                                    <div className="flex justify-between">
                                                        <div className="flex flex-col">
                                                            <Label className="text-[12px] font-bold">{item.createdAt.slice(0,10)}</Label>
                                                            <Label className="text-[20px]">{capitalizeFirstLetter(item.customerName)}</Label>
                                                        </div>
                                                    </div>
                                                </SheetTitle>
                                                <SheetDescription>
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead className="w-[50px]">S.</TableHead>
                                                                <TableHead>Name</TableHead>
                                                                <TableHead className="text-right">Quantity</TableHead>
                                                                <TableHead className="text-right">Amount</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {
                                                                item.productList.map(
                                                                    (proItem:any, index:any)=>{
                                                                        return (
                                                                            <TableRow>
                                                                                <TableCell className="font-medium">{index+1}</TableCell>
                                                                                <TableCell>{proItem.medData.name}</TableCell>
                                                                                <TableCell className="text-right">{proItem.quantity}</TableCell>
                                                                                <TableCell className="text-right">$ {proItem.medData?.pricePerTab}</TableCell>
                                                                            </TableRow>
                                                                        )
                                                                    }
                                                                )
                                                            }
                                                        </TableBody>
                                                    </Table>
                                                    <br />
                                                    <Label className="text-[24px] font-bold flex items-center justify-end pr-4">$ {item.totalAmount}</Label>
                                                </SheetDescription>
                                                </SheetHeader>
                                            </SheetContent>
                                        </Sheet>
                                    </TableCell>
                                            
                                </TableRow>
                            );                        
                        })}
                    </TableBody>
                </Table>
            </div>

        </>
    );
}