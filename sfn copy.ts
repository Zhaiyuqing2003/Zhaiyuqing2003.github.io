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
    static add(x: sfn, y: sfn){
        return x.add(y)
    }
    static subtract(x: sfn, y: sfn){
        return x.subtract(y)
    }
    static multiply(x: sfn, y: sfn){
        return x.multiply(y)
    }
    static divide(x: sfn, y: sfn){
        return x.divide(y)
    }
    static log(x: sfn, base: sfn){
        return x.log(base)
    }
    static log10(x: sfn){
        return x.log10()
    }
    static exponential(base: sfn, exponent: sfn){
        return base.exponential(exponent)
    }
    static negate(x: sfn){
        return x.negate()
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

class util{
    constructor(){
        util.__throwCannotInstantiateError()
    }

    static evaluate(value: string): sfn | undefined{
        const parseFunction = (value: string) : sfn => {
            if (value[0] === "$"){
                // accurate number
                return sfn.accurate(value.substring(1))
            } else {
                return sfn.create(value)
            }
        }

        return Expression.__evaluateTree(Expression.__parseValue(Expression.__parse(value), parseFunction), sfn)
    }
    static __throwCannotInstantiateError(): never{
        throw new SyntaxError("Cannot Instantiate Class!")
    }
}

class chemUtil{
    constructor(){
        chemUtil.__throwCannotInstantiateError()
    }
    static evaluateMolarMass(value: string): sfn | undefined{
        const parseFunction = (value: string) : sfn => {
            return ChemicalExpression.__parseMolarMass(value, sfn.create, sfn.accurate)
        }

        return Expression.__evaluateTree(Expression.__parseValue(ChemicalExpression.parse(value), parseFunction), sfn)
    }
    static __throwCannotInstantiateError(): never{
        throw new SyntaxError("Cannot Instantiate Class!")
    }
}


console.log(chemUtil.evaluateMolarMass("Mg(NO3)2").toString())
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