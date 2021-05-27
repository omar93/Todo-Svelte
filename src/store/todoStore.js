import { persistStore } from './persistStore'
import { v4 as uuidv4 } from 'uuid';
let id = uuidv4()
let id2 = uuidv4()
let id3 = uuidv4()
let id4 = uuidv4()
export const todoStore = persistStore('Todos', [
    {'todo':'handla','id':id,'done':false},
    {'todo':'fiska','id':id2,'done':false},
    {'todo':'fiska2','id':id3,'done':false},
    {'todo':'fiska3','id':id4,'done':false}
])