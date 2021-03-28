import { all, create, BigNumber } from "mathjs"

const math = create(all);

math.config({
    number : "BigNumber"
})

class SignificantNumber{
    private value: BigNumber
    private SD : number
    private DP : number
    private isAccurate : boolean

    constructor(val: string | BigNumber, settings : Settings = { isAccurate : false }){

        const value = (typeof val !== "string")
            ? val.valueOf()
            : val

        const parsedInformation = SignificantNumber.parseValue(value)
        const { plainValue } = parsedInformation

        if (settings.isAccurate){

            this.SD = Infinity;
            this.DP = Infinity;
            this.isAccurate = true;

        } else {

            const { SD, DP } = SignificantNumber.determineParameters(parsedInformation, settings)

            this.SD = SD
            this.DP = DP
            this.isAccurate = false;

        }

        if (typeof val === "string"){
            this.value = math.evaluate(plainValue)
        } else {
            this.value = val
        }
    }

    public plus(x: SignificantNumber){

        const isAccurate = this.isAccurate && x.isAccurate
        const value = this.value.plus(x.value);

        if (!isAccurate){
            const DP = Math.min(this.DP, x.DP);
            return new SignificantNumber(value, { DP, isAccurate : false })
        } else {
            return new SignificantNumber(value, { isAccurate : true })
        }

    }

    public minus(x : SignificantNumber){
        const isAccurate = this.isAccurate && x.isAccurate
        const value = this.value.minus(x.value);

        if (!isAccurate){
            const DP = Math.min(this.DP, x.DP);
            return new SignificantNumber(value, { DP, isAccurate : false })
        } else {
            return new SignificantNumber(value, { isAccurate : true })
        }
    }

    public multiply(x: SignificantNumber){
        const isAccurate = this.isAccurate && x.isAccurate
        const value = this.value.mul(x.value);

        if (!isAccurate){
            const SD = Math.min(this.SD, x.SD);
            return new SignificantNumber(value, { SD, isAccurate : false })
        } else {
            return new SignificantNumber(value, { isAccurate : true })
        }
    }

    public divide(x: SignificantNumber){
        const isAccurate = this.isAccurate && x.isAccurate
        const value = this.value.div(x.value);

        if (!isAccurate){
            const SD = Math.min(this.SD, x.SD);
            return new SignificantNumber(value, { SD, isAccurate : false })
        } else {
            return new SignificantNumber(value, { isAccurate : true })
        }
    }

    public reciprocal(){
        return SignificantNumber.ONE.divide(this)
    }

    public sin(){
        const isAccurate = this.isAccurate
        const value = this.value.sin()

        if (isAccurate){
            return new SignificantNumber(value, { isAccurate : true })
        } else {
            return new SignificantNumber(value, { SD : this.SD , isAccurate : false })
        }
    }

    public cos(){
        const isAccurate = this.isAccurate
        const value = this.value.cos()

        if (isAccurate){
            return new SignificantNumber(value, { isAccurate : true })
        } else {
            return new SignificantNumber(value, { SD : this.SD , isAccurate : false })
        }
    }

    public tan(){
        const isAccurate = this.isAccurate
        const value = this.value.tan()

        if (isAccurate){
            return new SignificantNumber(value, { isAccurate : true })
        } else {
            return new SignificantNumber(value, { SD : this.SD , isAccurate : false })
        }
    }

    public cot(){
        return this.tan().reciprocal()
    }

    public sec(){
        return this.cos().reciprocal()
    }

    public csc(){
        return this.sin().reciprocal()
    }


    public log(base: SignificantNumber){
        const isAccurate = this.isAccurate
        const value = this.value.log(base.value)

        if (isAccurate){
            return new SignificantNumber(value, { isAccurate : true })
        } else {
            return new SignificantNumber(value, { SD : this.SD , isAccurate : false })
        }
    }

    public log10(){
        const isAccurate = this.isAccurate
        const value = this.value.log()

        if (isAccurate){
            return new SignificantNumber(value, { isAccurate : true })
        } else {
            return new SignificantNumber(value, { DP : this.SD , isAccurate : false })
        }
    }

    public lg(){
        return this.log10()
    }

    public logE(){
        return this.log(SignificantNumber.E)
    }

    public ln(){
        return this.logE()
    }

    public power(exponent: SignificantNumber){
        const isAccurate = exponent.isAccurate
        const value = this.value.toPower(exponent.value)

        if (isAccurate){
            return new SignificantNumber(value, { isAccurate : true })
        } else {
            return new SignificantNumber(value, { SD : this.SD, isAccurate : false })
        }
    }

    public exponentialE(){
        return SignificantNumber.E.power(this)
    }

    public exp(){
        return this.exponentialE()
    }

    public exponential10(){
        const isAccurate = this.isAccurate
        const value = SignificantNumber.TEN.value.toPower(this.value)

        if (isAccurate){
            return new SignificantNumber(value, { isAccurate : true })
        } else {
            return new SignificantNumber(value, { SD : this.DP , isAccurate : false })
        }
    }

    public exp10(){
        return this.exponential10()
    }

    public negate(){
        const isAccurate = this.isAccurate
        const value = this.value.negated()

        if (isAccurate){
            return new SignificantNumber(value, { isAccurate : true })
        } else {
            return new SignificantNumber(value, { SD : this.SD, isAccurate : false })
        }
    }

    public mod(x: SignificantNumber){
        const isAccurate = this.isAccurate
        const value = this.value.mod(x.value)

        if (isAccurate){
            return new SignificantNumber(value, { isAccurate : true })
        } else {
            return new SignificantNumber(value, { DP : this.DP, isAccurate : false })
        }
    }

    public sqrt(){
        const isAccurate = this.isAccurate
        const value = this.value.sqrt()

        if (isAccurate){
            return new SignificantNumber(value, { isAccurate : true })
        } else {
            return new SignificantNumber(value, { SD : this.SD, isAccurate : false })
        }
    }

    public cbrt(){
        const isAccurate = this.isAccurate
        const value = this.value.cbrt()

        if (isAccurate){
            return new SignificantNumber(value, { isAccurate : true })
        } else {
            return new SignificantNumber(value, { SD : this.SD, isAccurate : false })
        }
    }

    public nrt(n: SignificantNumber){
        const isAccurate = this.isAccurate
        const value = this.value.toPower(SignificantNumber.ONE.value.div(n.value))

        if (isAccurate){
            return new SignificantNumber(value, { isAccurate : true })
        } else {
            return new SignificantNumber(value, { SD : this.SD, isAccurate : false })
        }
    }

    public toAccurate(){
        return SignificantNumber.accurate(this.value)
    }

    toString(){
        return this.toRoundedString()
    }
    toRoundedString(){
        if (this.SD === 0){
            return "0";
        } else {
            return this.value.toPrecision(Math.min(this.SD, SignificantNumber.MAXIMUM_STRING_SD));
        }
    }
    toExactString(){
        return this.value.toString()
    }
    toPrecision(SD: number){
        return this.value.toPrecision(SD)
    }
    toExponential(DP : number){
        return this.value.toExponential(DP)
    }
    toFixed(DP : number){
        return this.value.toFixed(DP)
    }

    public static clone(x: SignificantNumber){
        return new SignificantNumber(x.value, { SD : x.SD, isAccurate : x.isAccurate })
    }

    public static create(value: string | BigNumber){
        return new SignificantNumber(value, { isAccurate : false })
    }

    public static accurate(value: string | BigNumber){
        return new SignificantNumber(value, { isAccurate : true })
    }

    public static e(){
        return SignificantNumber.clone(SignificantNumber.E)
    }

    public static pi(){
        return SignificantNumber.clone(SignificantNumber.PI)
    }

    private static parseValue(value: string) : ParseInformation{

        let currentNumberType : NumberGroup = "initial"
        let parsedInformation : ParseInformation = {
            "plainValue" : "",
            "integerSignificantLength" : 0,
            "fractionSignificantLength" : 0,
            "fractionLength" : 0,
            "exponentialPart" : ""
        }

        let isIntegerStartSignificant = false;
        let isFractionStartSignificant = false;

        for (let index = 0; index < value.length; index ++){
            const char = value[index]

            if (char === "-" || char === "+"){
                switch (currentNumberType){
                    case "number":
                    case "numberWithDot":
                    case "numberWithExponential":
                        SignificantNumber.throwInvalidNegateOperatorAfterNumber(index);
                        break;
                    case "negateIndicator":
                    case "exponentialNegateIndicator":
                        SignificantNumber.throwDuplicatedNegateOperator(index);
                        break;
                    case "dotIndicator":
                        SignificantNumber.throwInvalidNegateIndicatorAfterDotIndicator(index);
                        break;
                    case "initial":
                        currentNumberType = "negateIndicator";
                        break;
                    case "exponentialIndicator":
                        currentNumberType = "exponentialNegateIndicator"

                        parsedInformation.exponentialPart += char
                        break;
                    default:
                        SignificantNumber.throwInvalidNumberType(currentNumberType)
                }


            } else if (char === "e" || char === "E"){
                switch (currentNumberType){
                    case "initial":
                        SignificantNumber.throwInvalidExponentialIndicatorAtBeginning();
                        break;
                    case "numberWithExponential":
                    case "exponentialNegateIndicator":
                        SignificantNumber.throwDuplicatedExponentialOperator(index);
                        break;
                    case "negateIndicator":
                        SignificantNumber.throwInvalidExponentialOperatorAfterNegateIndicator(index);
                        break;
                    case "dotIndicator":
                        SignificantNumber.throwInvalidExponentialIndicatorAfterDotIndicator(index);
                        break;
                    case "number":
                    case "numberWithDot":
                        currentNumberType = "exponentialIndicator"
                        break;
                    case "exponentialIndicator":
                        currentNumberType = "exponentialNegateIndicator"
                        break;
                    default:
                        SignificantNumber.throwInvalidNumberType(currentNumberType)
                }


            } else if (char === "."){
                switch (currentNumberType){
                    case "initial":
                    case "number":
                        currentNumberType = "dotIndicator"
                        break;
                    case "numberWithDot":
                    case "dotIndicator":
                        SignificantNumber.throwDuplicateDotIndicator(index);
                        break;
                    case "numberWithExponential":
                    case "exponentialIndicator":
                        SignificantNumber.throwInvalidDotIndicatorAfterExponentialIndicator(index);
                        break;
                    case "exponentialNegateIndicator":
                    case "negateIndicator":
                        SignificantNumber.throwInvalidDotIndicatorAfterNegateIndicator(index);
                        break;
                    default:
                        SignificantNumber.throwInvalidNumberType(currentNumberType)
                }

            } else if (SignificantNumber.isCharNumber(char)){
                // update the could count status

                switch (currentNumberType){
                    case "initial":
                    case "negateIndicator":
                    case "number":
                        currentNumberType = "number"

                        isIntegerStartSignificant = char !== "0" || isIntegerStartSignificant

                        if (isIntegerStartSignificant){
                            parsedInformation.integerSignificantLength += 1;
                        }

                        break;
                    case "numberWithDot":
                    case "dotIndicator":
                        // dealWithDot
                        currentNumberType = "numberWithDot"

                        isFractionStartSignificant = char !== "0" || isFractionStartSignificant

                        if (isFractionStartSignificant){
                            parsedInformation.fractionSignificantLength += 1;
                        }

                        parsedInformation.fractionLength += 1;

                        break;
                    case "numberWithExponential":
                    case "exponentialIndicator":
                    case "exponentialNegateIndicator":
                        currentNumberType = "numberWithExponential";

                        parsedInformation.exponentialPart = parsedInformation.exponentialPart + char
                        break;
                }
            } else {
                SignificantNumber.throwInvalidCharacter(char, index)
            }

            parsedInformation.plainValue += char;
        }

        return parsedInformation

    }
    private static determineParameters(parsedInformation: ParseInformation, { SD, DP } : SignificantPair = {}){

        let calculatedSD = 0;
        let calculatedDP = 0;

        const exponentialNumber = Number(parsedInformation.exponentialPart)

        const fractionLength = parsedInformation.fractionLength
        const integerSignificantLength = parsedInformation.integerSignificantLength
        const fractionSignificantLength = parsedInformation.fractionSignificantLength

        const precalculatedSD = (integerSignificantLength === 0)
            ? fractionSignificantLength
            : integerSignificantLength + fractionLength

        const precalculatedDP = Math.max(fractionLength - exponentialNumber, 0)


        if (SD === undefined && DP === undefined){

            calculatedDP = precalculatedDP;
            calculatedSD = precalculatedSD;

        } else if (SD === undefined && DP !== undefined){

            const requiredDP = DP;
            const originalDP = precalculatedDP;
            const originalSD = precalculatedSD;

            if (originalDP === requiredDP){
                // do nothing, no limitation
                calculatedSD = originalSD
            } else if (originalDP < requiredDP){
                if (originalSD === 0){
                    calculatedSD = 0
                } else {
                    calculatedSD = originalSD + (requiredDP - originalDP)
                }
            } else if (originalDP > requiredDP){
                const stripedDP = originalDP - requiredDP;

                if (fractionSignificantLength > stripedDP){
                    // fractionSignificantLength > 1
                    calculatedSD = originalSD - stripedDP
                } else if (stripedDP >= fractionSignificantLength){
                    if (integerSignificantLength === 0){
                        calculatedSD = 0
                    } else {
                        calculatedSD = Math.max(originalSD - stripedDP, 0)
                    }
                }
            }

            calculatedDP = requiredDP;

        } else if (SD !== undefined && DP === undefined){

            const requiredSD = SD;
            const originalSD = precalculatedSD;
            const originalDP = precalculatedDP;


            if (originalSD === requiredSD){
                // do nothing
                calculatedDP = originalDP;
            } else if (originalSD < requiredSD){

                const modifiedFractionLength = fractionLength + (requiredSD - originalSD)
                calculatedDP = Math.max(modifiedFractionLength - exponentialNumber, 0)

            } else if (originalSD > requiredSD){

                const modifiedFractionLength = Math.max(fractionLength - (originalSD - requiredSD), 0)
                calculatedDP = Math.max(modifiedFractionLength - exponentialNumber, 0)
            }

            calculatedSD = requiredSD

        } else {
            SignificantNumber.throwInvalidDoubleSignificantNumberSettings()
        }

        return {
            DP : calculatedDP,
            SD : calculatedSD
        }
    }
    private static isCharNumber(char: string): boolean{
        const charCode = char.charCodeAt(0);

        return (charCode > 47 && charCode < 58)
    }

    private static throwInvalidNegateOperatorAfterNumber(index : number) : never{
        throw new SyntaxError(`Invalid '+' or '-' after a number at ${index}`)
    }
    private static throwDuplicatedNegateOperator(index: number) : never{
        throw new SyntaxError(`Duplicate '+' or '-' at ${index}`)
    }
    private static throwInvalidNegateIndicatorAfterDotIndicator(index: number) : never{
        throw new SyntaxError(`Invalid '+' or '-' after a '.' at ${index}`)
    }
    private static throwInvalidNumberType(type: string) : never{
        throw new SyntaxError(`Invalid Number Type '${type}', only shown in dev`)
    }
    private static throwInvalidExponentialIndicatorAtBeginning() : never{
        throw new SyntaxError(`Invalid 'e' or 'E' at the beginning of the number`)
    }
    private static throwDuplicatedExponentialOperator(index: number) : never{
        throw new SyntaxError(`Duplicate 'e' or 'E' at ${index}`)
    }
    private static throwInvalidExponentialOperatorAfterNegateIndicator(index: number) : never{
        throw new SyntaxError(`Invalid 'e' or 'E' after '+' or '-' at ${index}`)
    }
    private static throwInvalidExponentialIndicatorAfterDotIndicator(index: number) : never{
        throw new SyntaxError(`Invalid 'e' or 'E' after '.' at ${index}`)
    }
    private static throwDuplicateDotIndicator(index: number) : never{
        throw new SyntaxError(`Duplicate '.' at ${index}`)
    }
    private static throwInvalidDotIndicatorAfterExponentialIndicator(index: number) : never{
        throw new SyntaxError(`Invalid '.' after 'e' or 'E' at ${index}`)
    }
    private static throwInvalidDotIndicatorAfterNegateIndicator(index: number) : never{
        throw new SyntaxError(`Invalid '.' after '-' or '+' at ${index}`)
    }
    private static throwInvalidCharacter(char: string, index: number) : never{
        throw new SyntaxError(`Invalid '${char} at ${index}'`)
    }
    private static throwInvalidDoubleSignificantNumberSettings() : never{
        throw new SyntaxError(`Cannot provide both DP and SD as the setting for SignificantNumber`)
    }

    private static E = SignificantNumber.accurate(math.e.toString())
    private static PI = SignificantNumber.accurate(math.pi.toString())
    private static TEN = SignificantNumber.accurate("10")
    private static ONE = SignificantNumber.accurate("1")
    private static MAXIMUM_STRING_SD = 64;
}


type NumberGroup = ("initial" | "number" | "numberWithDot" | "numberWithExponential" |
"negateIndicator" | "dotIndicator" | "exponentialIndicator" | "exponentialNegateIndicator")

type SignificantPair = {
    SD ?: undefined
    DP ?: undefined
} | {
    SD ?: number
    DP ?: undefined
} | {
    SD ?: undefined
    DP ?: number
}

type Settings = SignificantPair & {
    isAccurate : boolean
}

type ParseInformation = {
    plainValue : string
    integerSignificantLength : number,
    fractionSignificantLength : number,
    fractionLength : number,
    exponentialPart : string
}

export default SignificantNumber
