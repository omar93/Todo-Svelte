import firebase from "firebase/app"
import "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyCAQr3SBx-paxaEplB07r_PD3yYiig48C4",
  authDomain: "todo-svelte-3ae9c.firebaseapp.com",
  projectId: "todo-svelte-3ae9c",
  storageBucket: "todo-svelte-3ae9c.appspot.com",
  messagingSenderId: "178070889259",
  appId: "1:178070889259:web:f898590e5609bf058a1b6e"
}

firebase.initializeApp(firebaseConfig)