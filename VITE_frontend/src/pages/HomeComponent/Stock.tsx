import {useState, useEffect} from 'react';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import refresh from "../../assets/refresh.png";
import { useTheContext } from '@/context';
import { BASE_URL, STORE_STOCK_QUERRY } from '@/env';

export default function Stocks () {
    const [querry, setQuerry] = useState("");
    const [medData, setmedData] = useState([]) as any;
    const { token, userEmail } = useTheContext() as any;

    useEffect(()=>{fetchQuerryStock()},[]);

    const handleQuerry = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuerry(e.target.value);
        fetchQuerryStock();
    };
    const handleRefresh = () => {
        setQuerry("");
        fetchQuerryStock();
    }
    const fetchQuerryStock = () => {
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
            <Label className="" htmlFor='querry'>Serch Stock</Label>
            <div className="flex gap-2 items-center">
                <Input className="" id="querry" onChange={handleQuerry} value={querry}></Input>
                <img className="h-[30px]" onClick={handleRefresh} src={refresh}/>
            </div>
            <Table>
                <TableCaption>Medicines in the Store.</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="">Id</TableHead>
                        <TableHead className="w-[600px]">Name</TableHead>
                        <TableHead className="w-[100px]">Category</TableHead>
                        <TableHead className="w-[200px] text-right">Selling Type</TableHead>
                        <TableHead className="w-[200px] text-right">Stock Size</TableHead>
                        <TableHead className="w-[100px] text-right">Price</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {medData && medData.map((med:any, index:any) => {
                        return (
                            <TableRow key={index}>
                                <TableCell className="font-bold text-center">{med.medData.medID}</TableCell>
                                <TableCell className="w-[600px] font-bold">{med.medData.name}</TableCell>
                                <TableCell className="font-bold">{med.medData.medType}</TableCell>
                                <TableCell className="text-right">{med.medData.sellingType}</TableCell>
                                <TableCell className="text-right">{med.quantity}</TableCell>
                                <TableCell className="w-[100px] text-right font-bold">$ {med.medData.pricePerTab}</TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </>
    );
}