// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { collection, doc, getDoc, getDocs, getFirestore, query, updateDoc, where } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCFX-dA2GWM8AUmfD_9NGcFRCWUXmQSHRM",
  authDomain: "bplevensweg.firebaseapp.com",
  projectId: "bplevensweg",
  storageBucket: "bplevensweg.appspot.com",
  messagingSenderId: "345396155809",
  appId: "1:345396155809:web:2a0c8836b3f891be6aa7e0",
  measurementId: "G-1ME4DTFC4E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


export const getHouses = async () => {
  const docRef = query(collection(db, "house"), where("alGekocht", "==", false));
  const docSnap = await getDocs(docRef);
  /**
   * @type {any[]}
   */
  var houses = []
  docSnap.forEach((doc) => {
    var data = doc.data();
    data.id = doc.id;
    houses.push(data);
  });
  return houses;
}

export const getCarriere = async () => {
  const docRef = query(collection(db, "carriere"), where("alGekozen", "==", false));
  const docSnap = await getDocs(docRef);
  /**
   * @type {any}
   */
  var carrieres = [];
  docSnap.forEach((doc) => {
    var data = doc.data();
    data.id = doc.id;
    data.universities = false;
    carrieres.push(data);
  });
  return carrieres;
}

export const getCarriereUnief = async () => {
  const docRef = query(collection(db, "universiteit"), where("alGekozen", "==", false));
  const docSnap = await getDocs(docRef);
  /**
   * @type {any[]}
   */
  let uniefcarrier = [];
  docSnap.forEach((doc) => {
    var data = doc.data();
    data.id = doc.id;
    data.universitie = true; 
    uniefcarrier.push(data);
  });
  return uniefcarrier;
}

export const setHouseBought = async (/** @type {any} */ house, /** @type {Boolean} */ bought) => {
  const docRef = doc(db, "house", house.id);
  await updateDoc(docRef,{
    alGekocht: bought
  });
}

export const setCarriereChosen = async (/** @type {any} */ carriere, /** @type {Boolean} */ carrier, /** @type {Boolean} */ chosen) => {
  var docRef;
  if(carrier == true){
    docRef = doc(db, "carriere", carriere.id);
  }
  else{
    docRef = doc(db, "universiteit", carriere.id);
  }
  await updateDoc(docRef,{
    alGekozen: chosen
  });
}