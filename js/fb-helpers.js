import { initializeApp, getApp, getApps } from "./firebase/app.js";
import { getFirestore, collection, query, limit, orderBy, getDocs} from "./firebase/firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyAGTKoF-xIFlceApzrYzAuR2J_ZTHNFdM4",
  authDomain: "exchangedb-1911b.firebaseapp.com",
  projectId: "exchangedb-1911b",
  storageBucket: "exchangedb-1911b.firebasestorage.app",
  messagingSenderId: "251496262501",
  appId: "1:251496262501:web:c9f4dadcad237562518f8c",
  measurementId: "G-Z72EJH0ZH9"
};

const app = !getApps().length? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app)

const getData = async () => {
  const colRef = collection(db, "exchangedata")
  const q = query(colRef, orderBy("created", "desc"), limit(7))
  const data = await getDocs(q)
  return data.docs.map(doc => doc.data()).reverse()
}

export default getData