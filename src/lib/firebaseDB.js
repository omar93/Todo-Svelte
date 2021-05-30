import firebase from 'firebase/app'
import './firebaseinit'
import 'firebase/firestore'
import { userStore } from '../store/userStore'

let db = firebase.firestore()

export default class dbhandler {

    async checkUser (user) {
        let userRef = db.collection('users').doc(user.uid)
        userRef.get().then(doc => {
            if (!doc.exists) this.addUserToDb(user)
        })
        .catch(error => console.log('err: ' + error))
    }
    
    async addUserToDb (user) {
        let obj = {
            uid: user.uid,
            Displayname: user.displayName,
            email: user.email,
            photo: user.photoURL
        }
        db.collection('users').doc(user.uid).set(obj)
        userStore.set(obj)
    }

    async getUserInfo (user) {
        let userObject
        let userRef = db.collection('users').doc(user.uid)
        userRef.get().then(doc => userObject = doc.data())
        .catch(error => console.log('err: ' + error))
        return userObject
    }
    
}
