import firebase from 'firebase/app'
import './firebaseinit'
import 'firebase/firestore'
import { todoStore } from '../data/todoStore'

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
    }

    async getUserInfo (user) {
        let userObject
        let userRef = db.collection('users').doc(user.uid)
        userRef.get().then(doc => userObject = doc.data())
        .catch(error => console.log('err: ' + error))
        return userObject
    }

    async addTodo (todo,uid) {
        let docRef = db.collection('users').doc(uid).collection('todos').doc(todo.id)
        docRef.set({
            todo: todo.todo,
            id: todo.id,
            isDone: todo.isDone,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then()
        .catch(err => console.log('ERROR: ', err))
    }

    updateTodo (todo, uid) {
        let todosRef = db.collection('users').doc(uid).collection('todos').doc(todo.id)
        todosRef.update({
            'id':todo.id,
            'isDone':todo.isDone,
            'todo':todo.todo
        })
        .then(() => console.log('Document updated!'))
        .catch(err => console.log('ERROR: ', err))
    }

    removeTodo(id,uid) {
        let todosRef = db.collection('users').doc(uid).collection('todos').doc(id)
        todosRef.delete()
        .then()
        .catch(err => console.log('ERROR: ', err))
    }

    ListenToChanges(id) {
        let todosRef = firebase.firestore().collection('users').doc(id).collection('todos')
        todosRef.orderBy('timestamp').onSnapshot(querySnapshot => {
            let todoArr = []
            querySnapshot.forEach(doc => {
                let todoObj = {
                    'id':doc.data().id,
                    'isDone': doc.data().isDone,
                    'todo': doc.data().todo
            }
                todoArr = [...todoArr, todoObj]
            })
            todoStore.set(todoArr)
        })
    }

}
