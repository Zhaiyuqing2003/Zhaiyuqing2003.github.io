import Stack from "./Stack"
import PeriodicTable from "./PeriodicTable"
import Expression from "./ExpressionV4";

export default class ChemicalExpression{
    public static parseString(value: string){

        let bracketDepth = 0;
        let currentGroupType : ChemicalGroupType = "initial"
        let isSurroundedByPrefix : boolean = false;

        let valueList = new Stack<[string, OriginalChemicalExpressionType]>()

        let expressionList = [valueList];

        for (let index = 0; index < value.length; index++){
            const char = value[index]

            if (char === "("){
                switch (currentGroupType){
                    case "initial":
                    case "concat":
                        valueList.push(["(", "leftBracket"])
                        isSurroundedByPrefix = isSurroundedByPrefix;
                        break;
                    case "prefix":
                        valueList.push(["*", "operator"])
                        valueList.push(["(", "leftBracket"])
                        // interpret prefix as a multiplier rather than a prefix
                        isSurroundedByPrefix = false;
                        break;
                    case "suffix":
                    case "rightBracket":
                    case "chemical":
                        // implicit concat
                        valueList.push(["+", "operator"])
                        valueList.push(["(", "leftBracket"])
                        isSurroundedByPrefix = isSurroundedByPrefix
                        break;
                    default:
                        ChemicalExpression.throwUnexpectedChemicalGroupType(currentGroupType)
                }

                bracketDepth += 1;
                currentGroupType = "initial"

            } else if (char === ")"){

                if (bracketDepth === 0){
                    ChemicalExpression.throwMissingLeftBracket(index)
                } else {

                    switch (currentGroupType){
                        case "initial":
                            ChemicalExpression.throwMissingExpressionBetweenBrackets(index)
                            break
                        case "prefix":
                            ChemicalExpression.throwUnexpectedEndOfPrefixNumber(valueList.pop()[0] ,char, index);
                            break
                        case "concat":
                            ChemicalExpression.throwMissingExpressionBetweenConcatAndRightBracket(index);
                            break
                        case "rightBracket":
                        case "suffix":
                        case "chemical":
                            valueList.push([")", "rightBracket"])
                            isSurroundedByPrefix = isSurroundedByPrefix
                            break;
                        default:
                            ChemicalExpression.throwUnexpectedChemicalGroupType(currentGroupType)
                    }

                    bracketDepth -= 1;
                    currentGroupType = "rightBracket"
                }

            } else if (char === "*"){

                switch (currentGroupType){
                    case "initial":
                        ChemicalExpression.throwMissingExpressionBeforeConcatOperator(index)
                        break;
                    case "prefix":
                        ChemicalExpression.throwUnexpectedEndOfPrefixNumber(valueList.pop()[0], char, index);
                        break;
                    case "concat":
                        ChemicalExpression.throwMissingExpressionBetweenConcatOperators(index)
                        break;
                    case "rightBracket":
                    case "suffix":
                    case "chemical":
                        // terminate the prefix surround, add right brackets.
                        if (isSurroundedByPrefix){
                            // an prefix brackets has been added, so this operation is valid (no bracketDepth influence)
                            // brackets could only support those three groupType, so the expression will be complete.
                            if (bracketDepth === 0){
                                ChemicalExpression.throwMissingLeftBracket(index)
                            } else {
                                valueList.push([")", "rightBracket"])
                                bracketDepth -= 1;
                            }
                        }
                        valueList.push(["+", "operator"])
                        isSurroundedByPrefix = false;
                        break;
                    default:
                        ChemicalExpression.throwUnexpectedChemicalGroupType(currentGroupType)
                }

                currentGroupType = "concat"
            } else if (ChemicalExpression.isNumber(char)){

                switch (currentGroupType){
                    case "initial":
                    case "concat":
                        valueList.push([char, "number"])
                        currentGroupType = "prefix"
                        isSurroundedByPrefix = true
                        break;
                    case "chemical":
                    case "rightBracket":
                        // implicit multiplication
                        valueList.push(["*", "operator"])
                        valueList.push([char, "number"]);
                        currentGroupType = "suffix";
                        isSurroundedByPrefix = isSurroundedByPrefix
                        break;
                    case "suffix":
                    case "prefix":
                        valueList.push([valueList.pop()[0] + char, "number"]);
                        currentGroupType = currentGroupType;
                        isSurroundedByPrefix = isSurroundedByPrefix
                        break;
                    default:
                        ChemicalExpression.throwUnexpectedChemicalGroupType(currentGroupType)
                }

            } else if (ChemicalExpression.isCapitalCharacter(char)){

                if (!ChemicalExpression.isChemicalElement(char)){
                    ChemicalExpression.throwInvalidChemicalElement(char)
                }

                switch (currentGroupType){
                    case "initial":
                    case "concat":
                        // direct
                        valueList.push([char, "chemical"])
                        isSurroundedByPrefix = isSurroundedByPrefix;
                        break;
                    case "rightBracket":
                    case "suffix":
                    case "chemical":
                        // implicit addition
                        valueList.push(["+", "operator"]);
                        valueList.push([char, "chemical"]);
                        isSurroundedByPrefix = isSurroundedByPrefix;
                        break;
                    case "prefix":
                        // implicit multiplication with brackets
                        valueList.push(["*", "operator"])
                        valueList.push(["(", "leftBracket"])
                        valueList.push([char, "chemical"])

                        // only when it meet capital letter, the prefix will be useful.
                        //WARNING: this should increase bracketDepth by 1;

                        bracketDepth += 1;
                        isSurroundedByPrefix = true
                        break;
                    default:
                        ChemicalExpression.throwUnexpectedChemicalGroupType(currentGroupType)
                }

                currentGroupType = "chemical"

            } else if (ChemicalExpression.isSmallCharacter(char)){

                switch (currentGroupType){
                    case "chemical":
                        const modifiedChar = valueList.pop()[0] + char;

                        if (!ChemicalExpression.isChemicalElement(modifiedChar)){
                            ChemicalExpression.throwInvalidChemicalElement(modifiedChar)
                        }

                        valueList.push([modifiedChar, "chemical"])
                        isSurroundedByPrefix = isSurroundedByPrefix

                        break;
                    case "initial":
                    case "concat":
                    case "rightBracket":
                    case "suffix":
                    case "prefix":
                        ChemicalExpression.throwInvalidSmallCharacter(char, index)
                        break;
                    default:
                        ChemicalExpression.throwUnexpectedChemicalGroupType(currentGroupType)
                }

                currentGroupType = "chemical"
            } else if (char === " "){
                // ignored
            } else if (char === ","){

                switch (currentGroupType){
                    case "initial":
                    case "concat":
                    case "prefix":
                        ChemicalExpression.throwIncompleteExpressionBeforeSeparator(valueList.pop()[0], index)
                        break;
                    case "rightBracket":
                    case "chemical":
                    case "suffix":
                        if (bracketDepth === 0){

                            if (isSurroundedByPrefix){
                                valueList.push([")", "rightBracket"])
                            }

                            ChemicalExpression.checkExpressionError(bracketDepth, currentGroupType)

                            valueList = new Stack<[string, OriginalChemicalExpressionType]>()
                            expressionList.push(valueList)

                            bracketDepth = 0;
                            currentGroupType = "initial"
                            isSurroundedByPrefix = false;
                        } else {
                            ChemicalExpression.throwMissingRightBracket(index)
                        }
                        break;
                    default:
                        ChemicalExpression.throwUnexpectedChemicalGroupType(currentGroupType)
                }

            } else {
                ChemicalExpression.throwInvalidCharacter(char, index)
            }
        }


        if (isSurroundedByPrefix){
            switch (currentGroupType){
                case "concat":
                    // couldn't happen
                    break;
                case "initial":
                case "prefix":
                    ChemicalExpression.throwIncompleteExpression()
                    break;
                case "chemical":
                case "suffix":
                case "rightBracket":
                    if (bracketDepth === 0){
                        ChemicalExpression.throwMissingLeftBracket(value.length)
                    } else {
                        bracketDepth -= 1;
                        valueList.push([")", "rightBracket"])
                    }
            }
        }

        ChemicalExpression.checkExpressionError(bracketDepth, currentGroupType)

        return expressionList
    }
    public static parseExpression(expressionList: Stack<[string, OriginalChemicalExpressionType]>[]){
        let returnList : [string, ChemicalExpressionType][][] = []

        for (let values of expressionList){
            let valueList = values.toArray();
            let stack = new Stack<[string, StackChemicalExpressionType]>();
            let result: [string, ChemicalExpressionType][] = []

            for (let [expression, expressionType] of valueList){

                if (expressionType === "chemical" || expressionType === "number"){
                    result.push([expression, expressionType])
                } else {
                    while (true){

                        if (stack.isEmpty()){
                            if (expressionType !== "rightBracket"){
                                stack.push([expression, expressionType])
                            } else {
                                // this won't happen, guaranteed by previous check
                            }
                            break
                        }

                        if (expressionType === "leftBracket"){
                            stack.push([expression, "leftBracket"])
                            break
                        }

                        const [operatorExpression, operatorType] = stack.pop()

                        if (expressionType === "rightBracket"){
                            if (operatorType !== "leftBracket"){
                                result.push([operatorExpression, "operator"])
                                continue
                            } else {
                                break
                            }
                        }

                        if (operatorType === "leftBracket"){
                            stack.push([operatorExpression, "leftBracket"])
                            stack.push([expression, "operator"])
                            break;
                        }

                        if (ChemicalExpression.getOperatorPriority(expression as Operator) <
                            ChemicalExpression.getOperatorPriority(operatorExpression as Operator)){
                            result.push([operatorExpression, "operator"])
                            continue
                        }

                        stack.push([operatorExpression, "operator"]);
                        stack.push([expression, "operator"])
                        break;
                    }
                }
            }

            while (!stack.isEmpty()){
                const [operatorExpression, operatorType] = stack.pop()

                if (!(operatorType === "leftBracket")){
                    result.push([operatorExpression, "operator"])
                } else {
                    // this guaranteed by previous check to not happen
                }
            }

            returnList.push(result)
        }

        return returnList
    }

    public static parseValue<T>(expressionList : [string, ChemicalExpressionType][][], parseFunction : (value: string, type : ChemicalExpressionType) => [T, "operand"] | [ChemicalFunctionName, "function"]){
        return expressionList.map((valueList) =>
            valueList.map(([expression, expressionType]) => parseFunction(expression, expressionType))
        )
    }

    public static defaultParseFunction<T>(parser : (value: string, type : SimpleExpressionChemistryType) => T): (value: string, type : ChemicalExpressionType) => [T, "operand"] | [ChemicalFunctionName, "function"]{
        return (value: string, type : ChemicalExpressionType) => {
            if (type === "operator"){
                return [ChemicalExpression.getFunctionNameFromOperator(value as Operator), "function"]
            } else if (type === "chemical"){
                return [parser(ChemicalExpression.getAtomicMassStringFromSymbol(value), type), "operand"]
            } else {
                return [parser(value, type), "operand"]
            }
        }
    }

    public chemicalAtomicMassParser(symbol: string): string {
        return ChemicalExpression.getAtomicMassStringFromSymbol(symbol)
    }

    private static getFunctionNameFromOperator(operator: Operator): ChemicalFunctionName{
        let functionName = ChemicalExpression.operatorFunctionMapping[operator]
        if (functionName === undefined){
            ChemicalExpression.throwInvalidOperator(operator)
        } else {
            return functionName
        }
    }
    private static getAtomicMassStringFromSymbol(symbol: string): string{
        const index = ChemicalExpression.getAtomicNumberFromSymbol(symbol)

        if (index === -1){
            ChemicalExpression.throwInvalidChemicalElement(symbol)
        }

        return ChemicalExpression.periodicTableData[index].atomicMassString
    }
    private static getAtomicNumberFromSymbol(symbol: string){
        return ChemicalExpression.periodicTableData.findIndex((element) => {
            return element.symbol === symbol
        })
    }
    private static checkExpressionError(depth, currentGroupType){
        if (depth !== 0){
            ChemicalExpression.throwMissingRightBracket(depth)
        } else {
            switch (currentGroupType){
                case "initial":
                    break;
                case "chemical":
                case "suffix":
                case "rightBracket":
                    break;
                case "prefix":
                case "concat":
                    ChemicalExpression.throwIncompleteExpression()
                    break;
                default:
                    ChemicalExpression.throwUnexpectedChemicalGroupType(currentGroupType)
            }
        }
    }
    private static isChemicalElement(value: string){
        let elementIndex = ChemicalExpression.elementIndex
        if (value.length !== 0){
            if (value[0] in elementIndex){
                return elementIndex[value[0]].includes(value.substring(1))
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
    private static isCapitalCharacter(char: string): boolean{
        let charCode = char.charCodeAt(0);

        return (charCode > 64 && charCode < 91)
    }
    private static isSmallCharacter(char: string): boolean{
        let charCode = char.charCodeAt(0);

        return (charCode > 96 && charCode < 123)
    }
    private static isNumber(char: string): boolean{
        let charCode = char.charCodeAt(0);

        return (charCode > 47 && charCode < 58)
    }
    private static throwMissingLeftBracket(index: number){
        throw new SyntaxError(`Missing '(' for ')' at ${index}`)
    }
    private static throwMissingRightBracket(counts: number){
        throw new SyntaxError(`Missing ${counts} ')' for '('`)
    }
    private static throwUnexpectedChemicalGroupType(groupType: string){
        throw new SyntaxError(`Unexpected Group Type ${groupType}, this shown only in dev mode`)
    }
    private static throwMissingExpressionBetweenBrackets(index: number){
        throw new SyntaxError(`Missing expression between '(' and ')', detected when meets ')' at ${index}`)
    }
    private static throwUnexpectedEndOfPrefixNumber(prefix: string, value: string, index: number){
        throw new SyntaxError(`Unexpected '${value}' at ${index} after '${prefix}'`);
    }
    private static throwMissingExpressionBetweenConcatAndRightBracket(index: number){
        throw new SyntaxError(`Missing Expression between '*' and ')' at ${index}`)
    }
    private static throwMissingExpressionBeforeConcatOperator(index: number){
        throw new SyntaxError(`Missing Expression before '*' at ${index}`)
    }
    private static throwMissingExpressionBetweenConcatOperators(index: number){
        throw new SyntaxError(`Missing Expression between '*' and '*' at ${index}`)
    }
    private static throwIncompleteExpressionBeforeSeparator(value: string, index: number){
        throw new SyntaxError(`Incomplete Expression '${value}' before ',' at ${index}`)
    }
    private static throwIncompleteExpression(){
        throw new SyntaxError("Incomplete expression")
    }
    private static throwInvalidChemicalElement(symbol: string){
        throw new ReferenceError(`Invalid Chemical Element '${symbol}'`)
    }
    private static throwInvalidCharacter(char: string, index: number){
        throw new ReferenceError(`Invalid Character '${char}' at ${index}`)
    }
    private static throwInvalidOperator(operator: string){
        throw new SyntaxError(`Invalid Operator '${operator}', this happens due to a bug`)
    }
    private static throwInvalidSmallCharacter(char: string, index: number){
        throw new SyntaxError(`Invalid Small character '${char}' at ${index}, small character should only follow the Big character`)
    }
    private static getOperatorPriority(operator: Operator){
        return ChemicalExpression.operatorPriority[operator]
    }
    private static operatorPriority : OperatorPriority = {
        "+" : 1,
        "*" : 2
    }
    private static operatorFunctionMapping : OperatorFunctionMapping = {
        "+" : "plus",
        "*" : "multiply"
    }
    private static operator : OperatorList = ["+", "*"]
    private static elementIndex = {
        "A" : ["l", "r", "s", "g", "u", "t", "c", "m"],
        "B" : ["", "e", "r", "a", "i", "k", "h"],
        "C" : ["", "l", "a", "r", "o", "u", "d", "s", "e", "m", "f", "n"],
        "D" : ["y", "b", "s"],
        "E" : ["u", "r", "s"],
        "F" : ["", "e", "r", "m", "l"],
        "G" : ["a", "e", "d"],
        "H" : ["", "e", "o", "f", "g", "s"],
        "I" : ["", "n", "r"],
        "K" : ["", "r"],
        "L" : ["i", "a", "u", "r", "v"],
        "M" : ["g", "n", "o", "d", "t", "c"],
        "N" : ["", "e", "a", "i", "b", "d", "p", "o", "h"],
        "O" : ["", "s", "g"],
        "P" : ["", "d", "r", "m", "t", "b", "o", "a", "u"],
        "R" : ["b", "u", "h", "e", "n", "a", "f", "g"],
        "S" : ["", "i", "c", "e", "r", "n", "b", "m", "g"],
        "T" : ["i", "c", "e", "b", "m", "a", "i", "h", "s"],
        "U" : ["", "ue"],
        "V" : [""],
        "W" : [""],
        "X" : ["e"],
        "Y" : ["", "b"],
        "Z" : ["n", "r"]
    }
    private static periodicTableData = PeriodicTable
}

type ChemicalGroupType = "initial" | "prefix" | "rightBracket" | "suffix" | "chemical" | "concat"
type OriginalChemicalExpressionType = "number" | "leftBracket" | "rightBracket" | "chemical" | "operator"
type StackChemicalExpressionType = "leftBracket" | "operator"
type ChemicalExpressionType = "number" | "chemical" | "operator"


type OperatorList = ["+", "*"]
type Operator = OperatorList[number]
type OperatorPriority = {
    [index in Operator] : number
}
type OperatorFunctionMapping = {
    [index in Operator] : ChemicalFunctionName
}
declare global{
    type SimpleExpressionChemistryType = ("number" | "chemical")
}
type ChemicalFunctionNameList = ["plus", "multiply"]
type ChemicalFunctionName = ChemicalFunctionNameList[number]