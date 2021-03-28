import SignificantNumber from "./SignificantNumber"
import Scope from "./Scope"

export default class Calculator{
    private scope: Scope<SignificantNumber>
    constructor(scope: Scope<SignificantNumber>){
        this.scope = scope
    }

    plus(x: SignificantNumber, y: SignificantNumber){
        return x.plus(y)
    }
    minus(x: SignificantNumber, y: SignificantNumber){
        return x.minus(y)
    }
    multiply(x: SignificantNumber, y: SignificantNumber){
        return x.multiply(y)
    }
    divide(x: SignificantNumber, y: SignificantNumber){
        return x.divide(y)
    }
    power(x: SignificantNumber, y: SignificantNumber){
        return x.power(y)
    }
    mod(x: SignificantNumber, y: SignificantNumber){
        return x.mod(y)
    }
    unaryPlus(x: SignificantNumber){
        return x
    }
    unaryMinus(x: SignificantNumber){
        return x.negate()
    }
    log(x: SignificantNumber, y: SignificantNumber){
        return x.log(y)
    }
    lg(x: SignificantNumber){
        return x.lg()
    }
    ln(x: SignificantNumber){
        return x.ln()
    }
    log10(x: SignificantNumber){
        return x.log10()
    }
    logE(x: SignificantNumber){
        return x.logE()
    }
    exp(x: SignificantNumber){
        return x.exp()
    }
    exp10(x: SignificantNumber){
        return x.exp10()
    }
    reciprocal(x: SignificantNumber){
        return x.reciprocal()
    }
    sin(x: SignificantNumber){
        return x.sin()
    }
    cos(x: SignificantNumber){
        return x.cos()
    }
    tan(x: SignificantNumber){
        return x.tan()
    }
    cot(x: SignificantNumber){
        return x.cot()
    }
    sec(x: SignificantNumber){
        return x.sec()
    }
    csc(x: SignificantNumber){
        return x.csc()
    }
    sqrt(x: SignificantNumber){
        return x.sqrt()
    }
    cbrt(x: SignificantNumber){
        return x.cbrt()
    }
    nrt(x: SignificantNumber, n: SignificantNumber){
        return x.nrt(n)
    }
    exact(x: SignificantNumber){
        return x.toAccurate()
    }
    assign(identifier: string, value: SignificantNumber){
        this.scope.set(identifier, value)
        return value
    }
    declare(identifier: string): string{
        return identifier
    }
    plusAssign(identifier: string, value: SignificantNumber){
        return this.assign(identifier, this.scope.get(identifier).plus(value))
    }
    minusAssign(identifier: string, value: SignificantNumber){
        return this.assign(identifier, this.scope.get(identifier).minus(value))
    }
    multiplyAssign(identifier: string, value: SignificantNumber){
        return this.assign(identifier, this.scope.get(identifier).multiply(value))
    }
    divideAssign(identifier: string, value: SignificantNumber){
        return this.assign(identifier, this.scope.get(identifier).divide(value))
    }
    powerAssign(identifier: string, value: SignificantNumber){
        return this.assign(identifier, this.scope.get(identifier).power(value))
    }
    modAssign(identifier: string, value: SignificantNumber){
        return this.assign(identifier, this.scope.get(identifier).mod(value))
    }
}