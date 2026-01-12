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
const UPDATE_STOCK = '/store/api/updateStock'; // Direct path, no env needed
console.log(import.meta.env);
export {
    ADD_STOCK, BASE_URL, BILLING_STOCK, BILL_BY_MED, BILL_BY_NAME,
    BILL_BY_PHONE, LOGIN_ROUTE, MEDICINE_SEARCH, REMOVE_STOCK, SIGNUP_ROUTE, STORE_DATA_ROUTE, STORE_STOCK_QUERRY, UPDATE_STOCK
};
