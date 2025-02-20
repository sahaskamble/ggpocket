import PocketBase from "pocketbase";
import { API_URL } from "./constants";

const pb = new PocketBase(API_URL);


export default pb;