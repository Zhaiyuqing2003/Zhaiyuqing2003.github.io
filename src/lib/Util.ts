import Scope from "./Scope"
import Expression from "./ExpressionV4"
import SignificantNumber from "./SignificantNumber"
import Calculator from "./Calculator"
import ChemicalExpression from "./ChemicalExpressionV2"

export default class Util{
    private scope : Scope<SignificantNumber>
    private calculator : Calculator
    private calculationCount : number;
    private resultRecording : boolean;
    private scopeRecording : boolean;

    constructor(scope: Scope<SignificantNumber>){
        this.scope = scope
        this.calculator = new Calculator(this.scope)
        this.calculationCount = 0
        this.resultRecording = false;
        this.scopeRecording = false;
    }
    public enableResultRecording(){
        this.resultRecording = true
    }
    public disableResultRecording(){
        this.resultRecording = false
    }
    public enableScopeRecording(){
        this.scopeRecording = true
        this.scope.enableRecording()
    }
    public disableScopeRecording(){
        this.scopeRecording = false
        this.scope.disableRecording()
    }
    public getScope(){
        return this.scope
    }
    public setScope(scope: Scope<SignificantNumber>){
        this.scope = scope
    }
    public evaluate(value: string){
        const parseFunction = Expression.defaultParseFunction(this.parseFunction.bind(this))
        const expressionList = Expression.parseExpression(Expression.parseString(value))
        const returnList = []

        for (let valueList of expressionList){
            returnList.push(Expression.evaluateTree(Expression.parseValue([valueList], parseFunction), this.calculator)[0])
        }

        if (this.resultRecording){
            let variableList = []
            for (let result of returnList){
                let variableName = `ans_${this.calculationCount}`

                this.calculator.assign(variableName, result)
                this.calculationCount += 1

                variableList.push(variableName)
            }

            this.calculator.assign(`ans`, returnList[returnList.length - 1])

            if (this.scopeRecording){
                return [returnList, variableList, this.scope.getRecord()]
            } else {
                return [returnList, variableList]
            }

        } else {

            if (this.scopeRecording){
                return [returnList, this.scope.getRecord()]
            } else {
                return [returnList]
            }
        }

    }
    public evaluateAtomicMass(value: string){
        const parseFunction = ChemicalExpression.defaultParseFunction(this.parseChemicalFunction.bind(this))
        const expressionList = ChemicalExpression.parseExpression(ChemicalExpression.parseString(value))
        const returnList = []

        for (let valueList of expressionList){
            returnList.push(Expression.evaluateTree(ChemicalExpression.parseValue([valueList], parseFunction), this.calculator)[0])
        }

        if (this.resultRecording){
            let variableList = []
            for (let result of returnList){
                let variableName = `ans_${this.calculationCount}`

                this.calculator.assign(variableName, result)
                this.calculationCount += 1

                variableList.push(variableName)
            }

            this.calculator.assign(`ans`, returnList[returnList.length - 1])

            return [returnList, variableList]
        } else {
            return [returnList]
        }
    }
    private parseFunction(value: string, type: SimpleExpressionType): SignificantNumber{
        if (type === "variable"){
            if (value[0] === "_"){
                let parsedNumber;
                try {
                    // manually turn off the resultRecording
                    if (this.resultRecording){
                        this.disableResultRecording()
                        parsedNumber = this.evaluateAtomicMass(value.substring(1))[0][0]
                        this.enableResultRecording()
                    } else {
                        parsedNumber = this.evaluateAtomicMass(value.substring(1))[0][0]
                    }
                } catch (e){
                    Util.throwInvalidSlashSignChemicalExpression(value.substring(1))
                }
                return parsedNumber
            } else {
                let variableValue = this.scope.get(value)
                if (variableValue !== undefined){
                    return variableValue
                } else {
                    Util.throwUndefinedVariable(value)
                }
            }
        } else {
            let parsedNumber
            try {
                parsedNumber = SignificantNumber.create(value)
            } catch (e){
                Util.throwInvalidNumber(e, value)
            }
            return parsedNumber
        }
    }
    private parseChemicalFunction(value: string, type : SimpleExpressionChemistryType): SignificantNumber{
        let parsedNumber;
        try {
            if (type === "chemical"){
                parsedNumber = SignificantNumber.create(value)
            } else {
                parsedNumber = SignificantNumber.accurate(value)
            }
        } catch (e){
            Util.throwInvalidNumber(e, value)
        }
        return parsedNumber

    }
    private static throwInvalidNumber(e: Error, value: string){
        throw new SyntaxError(`Invalid Number ${value}, the original error is ${e}`)
    }
    private static throwInvalidSlashSignChemicalExpression(value: string){
        throw new SyntaxError(`Invalid Chemical Expression ${value} after '_', '_' used to declare atomic mass of the chemical expression rather than a variable`)
    }
    private static throwUndefinedVariable(identifier){
        throw new SyntaxError(`Variable '${identifier}' is not defined`)
    }
}