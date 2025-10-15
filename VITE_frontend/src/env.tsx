const BASE_URL = import.meta.env.VITE_BASE_API_URL_DEV;
const SIGNUP_ROUTE = import.meta.env.VITE_SIGNUP_ROUTE;
const LOGIN_ROUTE = import.meta.env.VITE_LOGIN_ROUTE;
const STORE_DATA_ROUTE = import.meta.env.VITE_STORE_DATA_ROUTE;
const STORE_STOCK_QUERRY = import.meta.env.VITE_STORE_STOCK_QUERRY;
const ADD_STOCK = import.meta.env.VITE_ADD_STOCK;
const MEDICINE_SEARCH = import.meta.env.VITE_MEDICINE_SEARCH ;
const REMOVE_STOCK = import.meta.env.VITE_REMOVE_STOCK;
const BILLING_STOCK = import.meta.env.VITE_BILLING_STOCK;
const BILL_BY_NAME = import.meta.env.VITE_BILL_BY_NAME;
const BILL_BY_PHONE = import.meta.env.VITE_BILL_BY_PHONE;
const BILL_BY_MED = import.meta.env.VITE_BILL_BY_MED;
console.log(import.meta.env);
export {
    BASE_URL,
    SIGNUP_ROUTE,
    LOGIN_ROUTE,
    STORE_DATA_ROUTE,
    MEDICINE_SEARCH,
    ADD_STOCK,
    STORE_STOCK_QUERRY,
    REMOVE_STOCK,
    BILLING_STOCK,
    BILL_BY_NAME,
    BILL_BY_PHONE,
    BILL_BY_MED,
}