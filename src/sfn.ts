//@ts-ignore
import { all, create, BigNumber } from "mathjs";
import Expression from "./Expressionv2";
import ChemicalExpression from "./Chemical"

const math = create(all);

math.config({
    number : "BigNumber"
})

class sfn{
    value : BigNumber
    digit : number
    fraction : number
    constructor(value: string | BigNumber, { sd, dp } : { sd ?: number, dp ?: number } = {}){
        this.value = sfn.__parseValue(value);

        if (sd !== undefined){
            this.digit = sd;
            this.fraction = sfn.__getInitialDP(value, sd);
        } else if (dp !== undefined){
            this.fraction = dp;
            this.digit = sfn.__getInitialSD(value, dp);
        } else {
            this.digit = sfn.__getInitialSD(value);
            this.fraction = sfn.__getInitialDP(value, this.digit);
        }
    }
    add(x: sfn){
        let dp = math.min(this.fraction, x.fraction) as number;
        let value = this.value.plus(x.value);

        return new sfn(value, { dp })
    }
    subtract(x: sfn){
        let dp = math.min(this.fraction, x.fraction) as number;
        let value = this.value.minus(x.value);

        return new sfn(value, { dp })
    }
    multiply(x: sfn){
        let sd = math.min(this.digit, x.digit) as number;
        let value = this.value.mul(x.value);

        return new sfn(value, { sd });
    }
    divide(x: sfn){
        let sd = math.min(this.digit, x.digit) as number;
        let value = this.value.div(x.value);

        return new sfn(value, { sd });
    }
    log(base: sfn): sfn{
        if (base.value.equals(sfn.__ten)){
            return this.log10()
        } else {
            let sd = this.digit
            let value = this.value.log(base.value)

            return new sfn(value, { sd })
        }
    }
    log10(): sfn{
        let dp = this.digit
        let value = this.value.log()

        return new sfn(value, { dp })
    }
    lg(): sfn{
        // alias for log10()
        return this.log10()
    }
    exponential(exponent: sfn): sfn{
        if (this.value.equals(sfn.__ten)){
            return this.exponential10(exponent)
        } else {
            let sd = this.digit
            let value = this.value.toPower(exponent.value)

            return new sfn(value, { sd })
        }
    }
    exponential10(exponent: sfn): sfn{
        let sd = this.fraction
        let value = this.value.toPower(exponent.value)

        return new sfn(value, { sd })
    }
    negate(): sfn{
        let sd = this.digit
        let value = this.value.negated()

        return new sfn(value, { sd })
    }
    toString(){
        if (this.digit == 0){
            return 0;
        } else {
            return this.value.toPrecision(this.digit);
        }
    }
    static __ten : BigNumber = math.evaluate("10");
    static __regularizePattern : RegExp = /[\d]+([\.][\d]+)?/
    static __regularizeValue(value: string | BigNumber){
        let valueString: string = (typeof value != "string") ? value.valueOf() : value;

        return valueString.match(sfn.__regularizePattern)[0]
    }
    static __parseValue(value: string | BigNumber): BigNumber{
        return (typeof value == "string") ? math.evaluate(value) : value;
    }
    static __getInitialSD(value: string | BigNumber, dp ?: number): number{
        let baseString = sfn.__regularizeValue(value);

        let [integerPart, fractionPart] = baseString.split(".");
        let intLength = integerPart.length;
        let fractionLength = (fractionPart !== undefined) ? fractionPart.length : 0;

        if (dp !== undefined){
            if (integerPart == "0"){
                if (fractionPart){
                    if (dp >= fractionLength){
                        for (let i = 0; i < fractionLength; i ++){
                            if (fractionPart[i] != "0"){
                                return dp - i;
                            }
                        }
                        return 0;
                    } else {
                        let strippedPart = fractionPart.substring(0, dp)

                        if (Number(strippedPart[dp - 1]) > 4){
                            strippedPart = strippedPart.substring(0, dp - 2) + (Number(strippedPart[dp - 2]) + 1)
                        } else {
                            strippedPart = strippedPart.substring(0, dp - 1);
                        }

                        for (let i = 0; i < strippedPart.length; i ++){
                            if (strippedPart[i] != "0"){
                                return strippedPart.length - i;
                            }
                        }
                        return 0;
                    }
                } else {
                    return dp;
                }
            } else {
                return intLength + dp;
            }
        } else {
            if (integerPart == "0"){
                if (fractionPart){
                    for (let i = 0; i < fractionLength; i ++){
                        if (fractionPart[i] != "0"){
                            return fractionLength - i;
                        }
                    }
                    return 0;
                } else {
                    return 0;
                }
            } else {
                return intLength + fractionLength;
            }
        }
    }
    static __getInitialDP(value: string | BigNumber, sd ?: number): number{
        let baseString = sfn.__regularizeValue(value);

        let [integerPart, fractionPart] = baseString.split(".");
        let intLength = integerPart.length;
        let fractionLength = (fractionPart !== undefined) ? fractionPart.length : 0;

        if (sd !== undefined){
            if (integerPart == "0"){
                for (let i = 0; i < fractionLength; i ++){
                    if (fractionPart[i] != "0"){
                        return i + sd;
                    }
                }
                if (sd == 0){
                    return fractionLength;
                }
            } else {
                return math.max(sd - intLength, 0)
            }
        } else {
            return fractionLength
        }
    }
    static create(value: string): sfn{
        return new sfn(value, {});
    }
    static accurate(value: string): sfn{
        return new sfn(value, { sd : 1000000 })
    }
}

class Provider{
    scope : Scope
    constructor(scope: Scope){
        this.scope = scope
    }
    add(x: sfn, y: sfn){
        return x.add(y)
    }
    subtract(x: sfn, y: sfn){
        return x.subtract(y)
    }
    multiply(x: sfn, y: sfn){
        return x.multiply(y)
    }
    divide(x: sfn, y: sfn){
        return x.divide(y)
    }
    log(x: sfn, base: sfn){
        return x.log(base)
    }
    log10(x: sfn){
        return x.log10()
    }
    lg(x: sfn){
        return x.lg()
    }
    exponential(base: sfn, exponent: sfn){
        return base.exponential(exponent)
    }
    negate(x: sfn){
        return x.negate()
    }
    register(identifier: string): string{
        return identifier
    }
    assign(identifier : string, x: sfn): sfn{
        this.scope.set(identifier, x)
        return x
    }
    __throwCannotInstantiateError(): never{
        throw new SyntaxError("Cannot Instantiate Class!")
    }
}

class Scope{
    variable : {
        [index : string] : any
    }
    constructor(){
        this.variable = {}
    }
    get(identifier: string){
        return this.variable[identifier]
    }
    set(identifier: string, value: any): void{
        this.variable[identifier] = value
    }
    clear(){
        this.variable = {}
    }
}


class util{
    constructor(){
        util.__throwCannotInstantiateError()
    }
    static getScope(){
        return util.__scope
    }
    static setScope(scope: Scope){
        util.__scope = scope
    }
    static evaluate(value: string): sfn | undefined{
        const parseFunction = (expression: string) : sfn => {
            let isVariable = Expression.__getVariablePattern()

            if (isVariable.test(expression)){
                let variableValue = util.getScope().get(expression)
                if (variableValue === undefined){
                    util.__throwUndefinedVariableError()
                }
                return variableValue
            } else {
                if (expression[0] === "$"){
                    // accurate number
                    return sfn.accurate(expression.substring(1))
                } else {
                    return sfn.create(expression)
                }
            }
        }
        const parseVariableFunction = (expression: string) : string => {
            return expression
        }
        const provider = new Provider(util.getScope())
        const valueTree = Expression.__parseValue(Expression.parse(value), parseFunction, parseVariableFunction)

        //@ts-ignore
        const result = Expression.__evaluateTree<sfn, string>(valueTree, provider)
        if (util.__isLastResultVariableEnable){
            util.getScope().set(util.__lastResultVariableName, result)
        }
        return result
    }
    static eval(value: string): sfn | undefined{
        return util.evaluate(value)
    }
    static __throwCannotInstantiateError(): never{
        throw new SyntaxError("Cannot Instantiate Class!")
    }
    static __throwUndefinedVariableError(): never{
        throw new ReferenceError("Variable is undefined")
    }
    static __isLastResultVariableEnable = true;
    static __lastResultVariableName = "_";
    static __defaultScope = new Scope()
    static __scope = util.__defaultScope
}

class chemUtil{
    constructor(){
        chemUtil.__throwCannotInstantiateError()
    }
    static getScope(){
        return chemUtil.__scope
    }
    static setScope(scope: Scope){
        chemUtil.__scope = scope
    }
    static evaluateMolarMass(value: string): sfn | undefined{
        const parseFunction = (expression: string) : sfn => {
            return ChemicalExpression.__parseMolarMass(
                expression, sfn.create, sfn.accurate,
                innerParseVariableFunction
            )
        }
        const innerParseVariableFunction = (expression) : sfn => {
            let variableValue = chemUtil.getScope().get(expression)
            //find variable
            if (variableValue === undefined){
                chemUtil.__throwUndefinedVariableError()
            }
            // parse the variable value
            return variableValue
        }
        const parseVariableFunction = (value: string) : string => {
            return value
        }
        const provider = new Provider(chemUtil.getScope())
        const parseTree = Expression.__parseValue(ChemicalExpression.parse(value), parseFunction, parseVariableFunction)

        //@ts-ignore
        return Expression.__evaluateTree<sfn, string>(parseTree, provider)
    }
    static evalMM(value: string): sfn | undefined{
        return chemUtil.evaluateMolarMass(value)
    }
    static __throwUndefinedVariableError(): never{
        throw new ReferenceError("Variable is undefined")
    }
    static __throwCannotInstantiateError(): never{
        throw new SyntaxError("Cannot Instantiate Class!")
    }
    static __defaultScope = new Scope()
    static __scope = chemUtil.__defaultScope
}


console.log(util.evaluate("log10(10)").toString())
// scope : {x : 2.0}

//@ts-ignore
window.sfn = sfn;
//@ts-ignore
window.Expression = Expression;
//@ts-ignore
window.math = math;
//@ts-ignore
window.ChemicalExpression = ChemicalExpression;
//@ts-ignore
window.chemUtil = chemUtil
//@ts-ignore
window.util = util