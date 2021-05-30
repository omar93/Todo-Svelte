import firebase from 'firebase/app'
import './firebaseinit'
import 'firebase/firestore'

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
        // Check localstorage and add that data to the firestore
    }

    async getUserInfo (user) {
        let userObject
        let userRef = db.collection('users').doc(user.uid)
        userRef.get().then(doc => userObject = doc.data())
        .catch(error => console.log('err: ' + error))
        return userObject
    }

    async addTodo (todo,uid) {
        let docRef = db.collection('users').doc(uid).collection('Todos').doc(todo.id)
        docRef.set({
            Todo: todo.todo,
            id: todo.id,
            status: todo.done
        })
        .then(() => console.log('Document added'))
        .catch(err => console.log('ERROR: ', err))
    }
    
}
