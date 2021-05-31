import firebase from 'firebase/app'
import './firebaseinit'
import 'firebase/firestore'

let db = firebase.firestore()

db.enablePersistence()
    .catch((err) => {
        if (err.code == 'failed-precondition') {
            alert('you should only run 1 tab at a time if you want to be able to work offline & online')
        }
})
    

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
        console.log(todo,uid)
        let docRef = db.collection('users').doc(uid).collection('todos').doc(todo.id)
        docRef.set({
            todo: todo.todo,
            id: todo.id,
            status: todo.done
        })
        .then(() => console.log('Document added'))
        .catch(err => console.log('ERROR: ', err))
    }

    async getTodos (uid) {
        let todoArr = []
        let todosRef = db.collection('users').doc(uid).collection('Todos')
        todosRef.get().then(querySnapshot => {
            querySnapshot.forEach(doc => {
                todoArr = [...todoArr,doc.data()]
            })
        })
        .catch(err => console.log('ERROR: ', err))
        return todoArr
    }

    updateTodo (todo, uid) {
        let todosRef = db.collection('users').doc(uid).collection('todos').doc(todo.id)
        console.log('status: ', todo.done, ' id: ', uid)
        todosRef.update({
            'id':todo.id,
            'status':todo.done,
            'todo':todo.todo
        })
        .then(() => console.log('Document updated!'))
        .catch(err => console.log('ERROR: ', err))
    }  
}
