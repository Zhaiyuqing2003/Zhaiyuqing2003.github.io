import Expression from "./Expressionv2"
import PeriodicTable from "./PeriodicTable"

class ChemicalExpression{
    constructor(){
        ChemicalExpression.__throwCannotInstantiateError()
    }
    static parse(value: string){
        if (value.length === 0){
            return []
        }
        value = Expression.__removeWhiteSpace(value);
        value = ChemicalExpression.__changeMultiplicationToAddition(value)
        // subscript have more priority than multiplier
        value = ChemicalExpression.__clarifySubscript(value)
        value = ChemicalExpression.__clarifyMultiplier(value)
        value = ChemicalExpression.__clarifyElement(value)

        return Expression.parse(value)
    }
    static __clarifySubscript(value: string){
        return value.replace(ChemicalExpression.__getSubscriptPattern(), (expression: string, offset: number) => {
            console.log(offset)
            let leftBracketAndNotOperator = ChemicalExpression.__getCharLeftBracketAndNotOperatorPattern()
            let afterString = (offset + expression.length <= value.length - 1 && leftBracketAndNotOperator.test(value[offset + expression.length])) ? "+" : ""

            return `*${expression}${afterString}`
        })
    }
    static __clarifyMultiplier(value: string){
        let isInteger = ChemicalExpression.__getUnsignedIntPattern()
        let withBracketValue = value.replace(ChemicalExpression.__getPureExpressionPattern(), (expression: string) => {
            if (isInteger.test(expression[0])){
                return `${expression[0]}(${expression.substring(1)})`
            } else {
                return `(${expression})`
            }
        })

        return withBracketValue.replace(/\(/g, (expression: string, offset: number) => {
            if (offset !== 0 && isInteger.test(withBracketValue[offset - 1])){
                return `*${expression}`
            } else if (offset !== 0 && withBracketValue[offset - 1] === ")"){
                // this, actually connect )( by adding + to )+(
                // which added to this function only for convenience
                return `+${expression}`
            } else {
                return expression
            }
        })
    }
    static __clarifyElement(value: string){
        let rightBracketAndNotOperator = ChemicalExpression.__getCharRightBracketAndNotOperatorPattern()
        let leftBracketAndNotOperator = ChemicalExpression.__getCharLeftBracketAndNotOperatorPattern()
        return value.replace(ChemicalExpression.__getChemicalElementPattern(), (expression : string, offset: number) => {
            let beforeString = (offset !== 0 && rightBracketAndNotOperator.test(value[offset - 1])) ? "+" : ""
            let afterString = (offset + expression.length <= value.length - 1 && leftBracketAndNotOperator.test(value[offset + expression.length])) ? "+" : ""

            return `${beforeString}${expression}${afterString}`
        })
    }
    static __getSubscriptPattern(){
        return /(?<=[A-Za-z]|\))\d+/g
    }
    static __getPureExpressionPattern(){
        return /(?<=\(|^|\+)[1-9A-Za-z]+(?=$|\))/g
    }
    static __changeMultiplicationToAddition(value: string){
        return value.replace("*", "+")
    }
    static __getUnsignedIntPattern(){
        return /^[0-9]*[1-9]+[0-9]*$/
    }
    static __getFullChemicalElementPattern(){
        return /^[A-Z][a-z]*$/
    }
    static __getChemicalElementPattern(){
        return /[A-Z][a-z]*/g
    }
    static __getCharNotOperatorPattern(){
        return /^[A-Za-z0-9]$/
    }
    static __getCharLeftBracketAndNotOperatorPattern(){
        return /^[A-Za-z0-9(]$/
    }
    static __getCharRightBracketAndNotOperatorPattern(){
        return /^[A-Za-z0-9)]$/
    }
    static __parseMolarMass<T>(value: string, parseValueFunction: ParseFunction<T>, parseNumberFunction ?: ParseFunction<T>, parseVariableFunction ?: ParseFunction<T>): T{
        let chemicalPattern = ChemicalExpression.__getFullChemicalElementPattern()
        let multiplierPattern = ChemicalExpression.__getUnsignedIntPattern()
        let variablePattern = Expression.__getVariablePattern()

        if (parseNumberFunction === undefined){
            parseNumberFunction = parseValueFunction
        }
        if (multiplierPattern.test(value)){
            // a multiplier
            return parseNumberFunction(value)
        } else if (chemicalPattern.test(value)){
            return parseValueFunction(ChemicalExpression.__getAtomicMassStringFromSymbol(value))
        } else if (variablePattern.test(value)){
            return parseVariableFunction(value)
        } else {
            ChemicalExpression.__throwInvalidChemicalExpression(value)
        }
    }
    static __getAtomicMassStringFromSymbol(element: string){
        return ChemicalExpression.__getAtomicMassString(ChemicalExpression.__getTableIndexFromSymbol(element))
    }
    static __getAtomicMassString(index: number){
        return ChemicalExpression.__periodTableData[index].atomicMassString
    }
    static __getTableIndexFromSymbol(element: string): number | undefined{
        let index = ChemicalExpression.__periodTableData.findIndex((value) => {
            return value.symbol === element
        })
        if (index === -1){
            ChemicalExpression.__throwElementNotExistError(element);
        } else {
            return index
        }
    }
    static __throwElementNotExistError(element: string): never{
        throw new ReferenceError(`Element ${element} doesn't exist!`)
    }
    static __throwInvalidChemicalExpression(expression: string): never{
        throw new SyntaxError(`Invalid Expression: ${expression} is not valid`)
    }
    static __throwCannotInstantiateError(): never{
        throw new SyntaxError("Cannot Instantiate Class!")
    }
    static __periodTableData = PeriodicTable
}

export default ChemicalExpression

type ParseFunction<T> = (value: string) => T
