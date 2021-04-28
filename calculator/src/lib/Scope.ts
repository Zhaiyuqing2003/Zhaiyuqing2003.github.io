export default class Scope<T>{
    private variable : {
        [index: string] : T
    }
    private isRecording : boolean;
    private variableRecording : string[]
    constructor(){
        this.variable = {}
        this.isRecording = false;
        this.variableRecording = [];
    }
    enableRecording(){
        this.isRecording = true;
    }
    disableRecording(){
        this.isRecording = false;
    }
    toArray(){
        return Object.entries(this.variable)
    }
    toObject(){
        return this.variable
    }
    getRecord(){
        return this.variableRecording
    }
    get(identifier: string){
        return this.variable[identifier]
    }
    set(identifier: string, value: T): void{
        this.variable[identifier] = value

        if (this.isRecording){
            let index = this.variableRecording.indexOf(identifier)

            if (index === -1){
                this.variableRecording.unshift(identifier)
            } else {
                this.variableRecording.splice(index, 1)
                this.variableRecording.unshift(identifier)
            }
        }
    }
    clear(){
        this.variable = {}
    }
}
