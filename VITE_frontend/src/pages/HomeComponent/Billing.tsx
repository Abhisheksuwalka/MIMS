import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TableFooter
  } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useTheContext } from "@/context";
import {  BASE_URL, BILLING_STOCK } from '@/env';
import SubBillingAddMed from "./SubBillingAddMed";
import { useToast } from "@/components/ui/use-toast";

export default function Billing() {
    const{ toast } = useToast();
    const [ localBillData, setLocalBillData ] = useState([]) as any;
    const [ Total, setTotal ] = useState(0);
    const [ formName, setFormName ] = useState("");
    const [ formAge, setFormAge ] = useState(0);
    const [ formPhone, setFormPhone ] = useState("");

    const handleFormName = (e:any) => {
        setFormName(e.target.value);
    }
    const handleFormAge = (e:any) => {
        setFormAge(e.target.value);
    }
    const handleFormPhone = (e:any) => {
        setFormPhone(e.target.value);
    }
    const updateLocalData = (element:any)=>{
        console.log("wallaha");
        setLocalBillData((arr:any)=>{
            const newArr = [...arr, element];
            return newArr;            
        });
    }
    const RemoveByIndex = (index:any) => {
        setLocalBillData((arr:any)=>{
            const newArr = arr.slice(0, index).concat(arr.slice(index + 1));
            return newArr;
        });
    }
    useEffect(()=>{
        //calculate the total valuation depennding on the data...
        let value = 0;
        for (let i = 0; i < localBillData.length; i++) {
            value += (localBillData[i]?.medData?.pricePerTab * localBillData[i]?.quantity) || 0;
        }
        setTotal(value);        
    },[localBillData]);
    const { token, userEmail } = useTheContext() as any;
    
    const submitBill = () => {
        //doing per value checks for the values for formname and form age
        if (!formName || !userEmail || !formAge || !formPhone ) {
            toast({
                variant: "destructive",
                title: "All fields required.",
              });
            return false;
        }
                    var myHeaders = new Headers();
                    myHeaders.append("Authorization", token);
                    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

                    var urlencoded = new URLSearchParams();
                    urlencoded.append("storeEmail", userEmail);
                    urlencoded.append("formName", formName);
                    urlencoded.append("formAge", formAge.toString());
                    urlencoded.append("formPhone", formPhone);
                    urlencoded.append("medSchemaBasedData", JSON.stringify(localBillData));
                    urlencoded.append("totalAmount", Total.toString());

                    var requestOptions = {
                    method: 'POST',
                    headers: myHeaders,
                    body: urlencoded,
                    redirect: 'follow' as RequestRedirect | undefined
                    };
                    const uri = BASE_URL+BILLING_STOCK;
                    fetch(uri, requestOptions)
                    .then(response => {
                        if(response.status == 200){
                            toast({
                                variant: "destructive",
                                title: "✅ Bill added!!",
                                description: "The bil was success fully added.",
                              });
                        }
                        else{
                            toast({
                                variant: "destructive",
                                title: "Error occured!!",
                                description: "Error occured while adding the bill.",
                              });
                        }
                    })
                    .catch(error => console.log('error', error));
    }

    return (
        <div>
            <SubBillingAddMed setData={updateLocalData}/>
            <Label className="text-[30px]">⁜ Billing</Label>
            <br />
            <br />
            <div className="flex gap-3">  
                <div className="grid max-w-sm items-center gap-1.5">
                    <Label htmlFor="email">Name</Label>
                <Input type="email" id="email" value={formName} onChange={handleFormName} placeholder="Name" />
                </div>
                <div className="grid max-w-sm items-center gap-1.5">
                    <Label htmlFor="age">Age</Label>
                    <Input type="number" step={1} min={10} id="age" value={formAge} onChange={handleFormAge} placeholder="Age" />
                </div>
                <div className="grid max-w-sm items-center gap-1.5">
                    <Label htmlFor="number">Ph. Number</Label>
                    <Input type="text" id="number" value={formPhone} onChange={handleFormPhone} placeholder="000 000 0000" />
                </div>            
            </div>
            <br />
            <br />
            <Table>
                <TableCaption className="w-full text-right pr-[10px]"><Button onClick={submitBill}>Check Out</Button></TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>S_No.</TableHead>
                        <TableHead className="w-[600px]">Medicine Name</TableHead>
                        <TableHead className="w-[400px] text-right">Quantity</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className=""></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    { localBillData && localBillData.map((item:any, index:any) => {
                        return (
                            <TableRow>
                                <TableCell className="font-light text-center">{index+1}</TableCell>
                                <TableCell className="w-[600px]">{item.medData.name}</TableCell>
                                <TableCell className="text-right">{item.quantity}</TableCell>
                                <TableCell className="font-bold text-[12px] text-right">$ {item.medData.pricePerTab}</TableCell>
                                <TableCell><Button className="font-bold" onClick={()=>RemoveByIndex(index)}>x</Button></TableCell>
                            </TableRow>     
                        );                        
                    })}
                </TableBody>
                <TableFooter>
                    <TableRow>
                    <TableCell colSpan={3}>Total</TableCell>
                    <TableCell className="text-right">$ {Total} </TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </div>
  );
}






/* <TableRow className="bg-slate-800">
                        <TableCell className="font-light text-center">⁜</TableCell>
                        <TableCell className="w-[600px]">
                            <Input type="text" id="med" value={querry} onChange={querryUpdate} placeholder="Search" />
                        </TableCell>
                        <TableCell className="text-right flex justify-end">
                            <Input type="number" className="w-[50%]" id="quantity" placeholder="Quantity" />
                        </TableCell>
                        <TableCell className="text-right">$250.00</TableCell>
                    </TableRow> */