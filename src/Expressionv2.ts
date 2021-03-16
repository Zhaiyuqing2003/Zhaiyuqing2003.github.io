class Expression{
    constructor(){
        Expression.__throwCannotInstantiateError()
    }
    static parse(val: string): (string | OperatorType | KeywordType)[]{
        let value = Expression.__transformUnaryValue(Expression.__removeWhiteSpace(val))

        let pattern = Expression.__getExpressionPattern();
        let execResult = pattern.exec(value)
        let result = []
        let stack = new Stack<string>()
        let operatorList = Expression.__getOperatorList()

        while (execResult !== null){
            if (Expression.__getOperandPattern().test(execResult[0])){
                //push number into result
                result.push(execResult[0])
            } else {
                let expression = execResult[0]
                while (true){
                    if (expression === "="){
                        result.push("=@");
                    }

                    if (stack.isEmpty()){
                        stack.push(expression)
                        break
                    }
                    // might be "(" or "${expression}("
                    if (expression[expression.length - 1] === "("){
                        stack.push(expression)
                        break
                    }

                    const operator = stack.pop()

                    if (expression === ")"){
                        // kinda left bracket "(" or "${expression}("
                        if (operator[operator.length - 1] !== "("){
                            result.push(operator)
                            continue
                        } else {
                            // if it's "(" => no push
                            // if it's "${expression}(" => push the ${expression}
                            if (operator !== "("){
                                result.push(operator.substring(0, operator.length - 1))
                            }
                        }
                        break
                    }

                    // kinda left bracket "(" or "${expression}("
                    if (operator[operator.length - 1] === "("){
                        stack.push(operator);
                        stack.push(expression);
                        break
                    }


                    if (operatorList[expression].priority < operatorList[operator].priority){
                        result.push(operator)
                        continue
                    }

                    stack.push(operator);
                    stack.push(expression);
                    break
                }
            }
            execResult = pattern.exec(value)
        }

        while (!stack.isEmpty()){
            let operator = stack.pop()
            if (operator[operator.length - 1] !== "("){
                result.push(operator)
            } else {
                // actually, this situation shouldn't happen for a proper expression
            }
        }
        return result
    }
    static __parseValue<T, P>(value: (string | OperatorType | KeywordType)[], parseFunction : ParseFunction<T>, parseVariableFunction : ParseFunction<P>)
        : (OperatorFunctions | T | P)[]{

        // might consider open the functionality for
        // the customized operator Parsing & keyWordParsing & variable parsing
        let keywords = Expression.__getKeyWords()
        let isVariable = Expression.__getVariablePattern()
        let operatorList  = Expression.__getOperatorList()

        return value.map((expression, index) => {
            if ((expression as OperatorType) in operatorList){
                return operatorList[expression as OperatorType].func
            } else if (keywords.includes(expression as KeywordType)){
                return expression as KeywordType
            } else {
                // identify the "variable" here
                if (index !== value.length - 1 && value[index + 1] === "=@"){
                    // oh ! variable !
                    if (isVariable.test(expression)){
                        return parseVariableFunction(expression)
                    } else {
                        Expression.__throwInvalidIdentifierError()
                    }
                } else {
                    return parseFunction(expression)
                }
            }
        })
    }
    static __evaluateTree<T, P>(value: (OperatorFunctions | T | P)[], provider: FunctionProvider<T,P>) : T{
        if (value.length === 0){
            return undefined
        }

        let stack = new Stack<T>()
        let operationFunctionList = Expression.__getOperationFunctionList()

        for (let expression of value){
            if ((expression as OperatorFunctions) in operationFunctionList){
                let operandsNeeded = operationFunctionList[expression as OperatorFunctions].operand

                let operands = []
                for (let i = 0; i < operandsNeeded; i ++){
                    let value = stack.pop()
                    if (value === undefined){
                        // stack used up unexpectedly.
                        Expression.__throwMissingParameterError(expression as OperatorFunctions, operandsNeeded, i)
                    } else {
                        operands[operandsNeeded - 1 - i] = value
                    }
                }

                stack.push(provider[expression as OperatorFunctions](...operands) as T)

            } else {
                stack.push(expression as T)
            }
        }

        return stack.pop()
    }
    static __getExpressionPattern(): RegExp{
        return new RegExp(`${Expression.__getOperatorPatternString()}|${Expression.__getNormalLeftBracketPatternString()}|${Expression.__getFunctionLeftBracketPatternString()}|${Expression.__getRightBracketPatternString()}|${Expression.__getNumberPatternString()}|${Expression.__getVariablePatternString()}`, "g");
    }
    static __getOperandPattern(): RegExp{
        return new RegExp(`^${Expression.__getNumberPatternString()}$|^${Expression.__getVariablePatternString()}$`, "g")
    }
    static __getVariablePattern(){
        return new RegExp(`^${Expression.__getVariablePatternString()}$`)
    }
    static __getNormalLeftBracketPatternString(){
        let keywords = Expression.__getKeyWords().join("|")
        return `(?<!(${keywords}))\\(`
    }
    static __getFunctionLeftBracketPatternString(){
        let keywords = Expression.__getKeyWords().join("|")
        return `(${keywords})\\(`
    }
    static __getRightBracketPatternString(){
        return `\\)`
    }
    static __getOperatorPatternString(){
        return `\\*|\\/|\\+|(\\-\\@)|\\-|\\^|\\%|\\=|(\\=\\@)`
    }
    static __getNumberPatternString(){
        return `\\$?[\\d]+([\\.][\\d]+)?([Ee][+-]?[\\d]+)?`
    }
    static __getVariablePatternString(){
        return `[A-Za-z_][A-Za-z0-9_$]*`
    }
    static __getUnaryPatternString(){
        return `^[+-]+|(?<=\\)[+-])[+-]+|(?<=[*/^%])[+-]+|(?<=\\()[+-]+|(?<=\\b[+-])[+-]+`
    }
    static __getKeyWords() : KeywordType[]{
        return [...Expression.__keyWords]
    }
    static __getOperators() : OperatorType[]{
        return [...Expression.__operators]
    }
    static __getOperatorList(): OperatorObject{
        return {...Expression.__operatorList}
    }
    static __getOperationFunctionList(): OperationObject{
        return Expression.__operationFunctionList
    }
    static __removeWhiteSpace(val: string){
        return val.replace(/\s/g, "")
    }
    static __transformUnaryValue(val: string): string{
        let pattern = new RegExp(Expression.__getUnaryPatternString(), "g")
        return val.replace(pattern, (unary: string) => {
            let count = 0
            for (let char of unary){
                count += (char === "-") ? 1 : 0
            }
            return (count % 2 === 1) ? "-@" : ""
        })
    }
    static __keyWords: KeywordType[] = [
        "log", "log10", "lg"
    ]
    static __operators: OperatorType[] = [
        "+", "-", "*", "/", "^", "-@", "=", "=@"
    ]
    static __operatorList: OperatorObject = {
        "=" : {
            priority : 0,
            func : "assign"
        },
        "+" : {
            priority : 1,
            func : "add"
        },
        "-" : {
            priority : 1,
            func : "subtract"
        },
        "*" : {
            priority : 2,
            func : "multiply"
        },
        "/" : {
            priority : 2,
            func : "divide"
        },
        "^" : {
            priority : 3,
            func : "exponential"
        },
        "-@" : {
            priority : 4,
            func : "negate"
        },
        "=@" : {
            priority : 4,
            func : "register"
        }
    }
    static __operationFunctionList: OperationObject = {
        "add" : {
            operand : 2
        },
        "subtract" : {
            operand : 2,
        },
        "multiply" : {
            operand : 2
        },
        "divide" : {
            operand : 2
        },
        "exponential" : {
            operand : 2
        },
        "negate" : {
            operand : 1
        },
        "assign" : {
            operand : 2,
        },
        "register" : {
            operand : 1,
        },
        "log" : {
            operand : 2
        },
        "log10" : {
            operand : 1
        },
        "lg" : {
            operand : 1
        }
    }
    static __throwInvalidIdentifierError(): never{
        throw new SyntaxError("Illegal Expression: invalid identifier for variables")
    }
    static __throwMissingParameterError(functionName : string, expect: number, actual: number): never{
        throw new SyntaxError(`Illegal Expression, ${functionName} expects ${expect} parameters, but gets ${actual} parameters`)
    }
    static __throwCannotInstantiateError(): never{
        throw new SyntaxError("Cannot Instantiate Class!")
    }
}
class Stack<T>{
    value : Array<T>
    constructor(){
        this.value = []
    }
    push(value: T): void{
        this.value.push(value)
    }
    pop(): T{
        return this.value.pop()
    }
    size(): number{
        return this.value.length
    }
    isEmpty(): boolean{
        return (this.size() === 0)
    }
}

export default Expression

type FunctionProvider<T, P> = {
    [index in OperatorFunctions]: (...value: (T|P)[]) => (T|P)
}
type OperationObject = {
    [index in OperatorFunctions]: { operand : number }
}

type ParseFunction<T> = (value: string) => T
type OperatorObject = {
    [index in OperatorType]: {
        priority: number;
        func: OperatorMappingFunctions;
    }
};

type OperatorType = ("+" | "-" | "*" | "/" | "^" | "-@" | "=" | "=@")
type OperatorMappingFunctions = ("add" | "subtract" | "multiply" | "divide" | "exponential" | "negate" | "assign" | "register")
type OperatorFunctions = (OperatorMappingFunctions | KeywordType)
type KeywordType = ("log" | "log10" | "lg")
