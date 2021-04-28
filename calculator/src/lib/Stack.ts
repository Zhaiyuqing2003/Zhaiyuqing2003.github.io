export default class Stack<T>{
    values : Array<T>
    constructor(){
        this.values = []
    }
    push(value: T){
        this.values.push(value);
    }
    pop(): T{
        let value = this.values.pop()
        if (value === undefined){
            throw new RangeError("cannot pop elements from empty stack!")
        }
        return value;
    }
    toArray(){
        return this.values;
    }
    size(): number{
        return this.values.length
    }
    isEmpty(){
        return (this.size() === 0)
    }
}