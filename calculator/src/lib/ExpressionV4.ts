import Stack from "./Stack"

class Expression{
    public static parseString(value: string){
        if (value === undefined){
            return []
        }
        // the current depth of the bracket
        let bracketDepth = 0;
        // bracket tree
        let bracketTree = new Stack<["normal"] | ["functional", number, number, string]>();
        // current group type
        let currentGroupType : GroupType = "initial";
        // how many negate detected, only when groupType = "negate"
        let negateTimes = 0;

        // make next group break;
        let nextBreak = false;

        let valueList = new Stack<[string, OriginalExpressionType]>();

        let expressionList = [valueList];

        for (let index = 0; index < value.length; index ++){
            const char = value[index];

            // brackets
            if (char === "("){

                Expression.checkNegateTimesError(currentGroupType, negateTimes)

                switch (currentGroupType){
                    case "exponentialIndicator":
                        Expression.throwUnexpectedEndOfExponentialIndicator("(", index)
                        break;
                    case "dotIndicator":
                        Expression.throwUnexpectedEndOfDotIndicator("(", index)
                        break;
                    case "exponentialNegateIndicator":
                        Expression.throwUnexpectedEndOfExponentialNegateIndicator("(", index)
                        break;
                    case "variable":
                        // there must be something in it. so this operation is safe.
                        const [currentExpression, currentExpressionType] = valueList.pop();

                        // see if it's a variable or not.
                        if (Expression.isFunction(currentExpression)){
                            valueList.push([currentExpression + "(", "functionWithBracket"])
                            // the sub-expression will be parameters of a function.
                            currentGroupType = "functionalLeftBracket"


                            bracketTree.push(["functional", 0, Expression.getFunctionParameterCount(currentExpression as FunctionName), currentExpression]);

                        } else {
                            // implicit multiplication
                            valueList.push([currentExpression, currentExpressionType])
                            valueList.push(["*", "operator"])
                            valueList.push(["(", "leftBracket"])
                            // the sub-expression will be a new start.
                            currentGroupType = "initial"

                            bracketTree.push(["normal"])
                        }
                        break;
                    case "numberPlain":
                    case "numberWithDot":
                    case "numberWithExponential":
                    case "rightBracket":
                        // implicit multiplications
                        valueList.push(["*", "operator"])
                        valueList.push(["(", "leftBracket"])
                        // the sub-expression will be a new start.
                        currentGroupType = "initial"
                        bracketTree.push(["normal"])
                        break;
                    case "initial":
                    case "functionalLeftBracket":
                    case "negate":
                    case "separator":
                    case "operatorCanAssign":
                    case "operatorCannotAssign":
                        // no implicit multiplications.
                        valueList.push(["(", "leftBracket"])
                        // the sub-expression will be a new start.
                        currentGroupType = "initial"
                        bracketTree.push(["normal"])
                        break;
                    default:
                        Expression.throwUnexpectedGroupType(currentGroupType)
                }

                // bracket depth + 1;
                bracketDepth += 1;
                // no matter what, set negate times to 0.
                negateTimes = 0;
                // make sure nextBreak is false;
                nextBreak = false;

            } else if (char === ")"){

                // if depth === 0; throw error.
                if (bracketDepth === 0){
                    Expression.throwMissingLeftBracket(index)
                } else {

                    Expression.checkNegateTimesError(currentGroupType, negateTimes)

                    switch (currentGroupType){
                        case "initial":
                            Expression.throwMissingExpressionBetweenBrackets(index)
                            break;
                        case "negate":
                            Expression.throwUnexpectedEndOfNegateIndicator(char, index)
                            break;
                        case "dotIndicator":
                            Expression.throwUnexpectedEndOfDotIndicator(char, index)
                            break;
                        case "exponentialIndicator":
                            Expression.throwUnexpectedEndOfExponentialIndicator(char, index)
                            break;
                        case "exponentialNegateIndicator":
                            Expression.throwUnexpectedEndOfExponentialNegateIndicator(char, index)
                            break;
                        case "separator":
                            Expression.throwMissingExpressionBetweenSeparatorAndRightBracket(index)
                            break;
                        case "operatorCanAssign":
                        case "operatorCannotAssign":
                            Expression.throwMissingRightOperand(valueList.pop()[0], index);
                            break;
                        case "numberPlain":
                        case "numberWithDot":
                        case "numberWithExponential":
                        case "variable":
                        case "rightBracket":
                            valueList.push([")", "rightBracket"])
                            bracketTree.pop()
                            break;
                        case "functionalLeftBracket":
                            const [, parameterCount, expectedParameterCount, functionName] = bracketTree.pop()

                            if (expectedParameterCount === parameterCount + 1){
                                valueList.push([")", "rightBracket"])
                            } else {
                                Expression.throwInvalidNumberOfParameter(functionName, expectedParameterCount, parameterCount)
                            }

                            break;
                        default:
                            Expression.throwUnexpectedGroupType(currentGroupType)
                    }

                    currentGroupType = "rightBracket";
                    bracketDepth -= 1;
                    // no matter what, set negate times to 0.
                    negateTimes = 0;
                    // make sure nextBreak is false;
                    nextBreak = false;
                }

            } else if (char === "*" || char === "/" || char === "^" || char === "%"){

                // empty space is ignored
                Expression.checkNegateTimesError(currentGroupType, negateTimes)

                switch (currentGroupType){
                    case "initial":
                        if (valueList.isEmpty()){
                            Expression.throwMissingLeftOperandAtStartOfLine(char, index)
                        } else {
                            Expression.throwMissingLeftOperandAfterLeftNormalBracket(char, index)
                        }
                        break;
                    case "functionalLeftBracket":
                        Expression.throwMissingLeftOperandAfterFunctionalLeftBracket(char, index)
                        break;
                    case "separator":
                        Expression.throwMissingLeftOperandAfterSeparator(char, index);
                        break;
                    case "operatorCanAssign":
                    case "operatorCannotAssign":
                        Expression.throwMissingOperandBetweenTwoOperators(valueList.pop()[0], char, index)
                        break;
                    case "negate":
                        Expression.throwUnexpectedEndOfNegateOperators(char, index);
                        break;
                    case "exponentialIndicator":
                        Expression.throwUnexpectedEndOfExponentialIndicator(char, index);
                        break;
                    case "exponentialNegateIndicator":
                        Expression.throwUnexpectedEndOfExponentialNegateIndicator(char, index)
                        break;
                    case "dotIndicator":
                        Expression.throwUnexpectedEndOfDotIndicator(char, index)
                        break;
                    case "numberPlain":
                    case "numberWithDot":
                    case "numberWithExponential":
                    case "rightBracket":
                        valueList.push([char, "operator"])

                        currentGroupType = "operatorCannotAssign";
                        // no matter what, set negate times to 0.
                        negateTimes = 0;
                        // make sure nextBreak is false;
                        nextBreak = false;

                        break;
                    case "variable":
                        valueList.push([char, "operator"])

                        currentGroupType = "operatorCanAssign";
                        // no matter what, set negate times to 0.
                        negateTimes = 0;
                        // make sure nextBreak is false;
                        nextBreak = false;

                        break;
                    default:
                        Expression.throwUnexpectedGroupType(currentGroupType)
                }


            } else if (char === "+" || char === "-"){

                // empty space is ignored
                Expression.checkNegateTimesError(currentGroupType, negateTimes)

                switch (currentGroupType){
                    // unary "+" is treated as negate
                    // though it has no use in result.
                    case "initial":
                    case "separator":
                    case "functionalLeftBracket":
                    case "operatorCanAssign":
                    case "operatorCannotAssign":
                        currentGroupType = "negate"
                        negateTimes += (char === "-") ? 1 : 0
                        // need to push manually
                        valueList.push([negateTimes % 2 === 0 ? "@+" : "@-", "operator"])
                        // make sure nextBreak is false;
                        nextBreak = false;
                        break;
                    case "negate":

                        if (nextBreak){
                            Expression.throwUnexpectedSpaceBetweenUnaryOperators(index)
                        }

                        currentGroupType = "negate"
                        negateTimes += (char === "-") ? 1 : 0
                        // overwrite the last elements;
                        valueList.pop()
                        valueList.push([negateTimes % 2 === 0 ? "@+" : "@-", "operator"])
                        // make sure nextBreak is false;
                        nextBreak = false;
                        break;
                    case "numberPlain":
                    case "numberWithDot":
                    case "numberWithExponential":
                    case "rightBracket":
                        valueList.push([char, "operator"])

                        currentGroupType = "operatorCannotAssign";
                        // make sure negateTimes is 0;
                        negateTimes = 0
                        // make sure nextBreak is false;
                        nextBreak = false;
                        break;
                    case "variable":
                        valueList.push([char, "operator"])

                        currentGroupType = "operatorCanAssign";
                        // make sure negateTimes is 0;
                        negateTimes = 0
                        // make sure nextBreak is false;
                        nextBreak = false;
                        break;
                    case "exponentialIndicator":

                        if (nextBreak){
                            Expression.throwUnexpectedSpaceBetweenExponentialIndicatorAndUnaryOperator(index)
                        }

                        const [currentExpression] = valueList.pop()

                        valueList.push([currentExpression + char, "number"]);

                        currentGroupType = "exponentialNegateIndicator";
                        negateTimes = 0;
                        nextBreak = false;

                        break;
                    case "exponentialNegateIndicator":
                        Expression.throwExcessExponentialNegateIndicatorForNumber(char, index);
                        break;
                    case "dotIndicator":
                        Expression.throwUnexpectedEndOfDotIndicator(char, index)
                        break;
                    default:
                        Expression.throwUnexpectedGroupType(currentGroupType)
                }
            } else if (char === " "){
                // technically, empty could be added as needed;
                // but empty could ignored accordingly;
                Expression.checkNegateTimesError(currentGroupType, negateTimes)

                switch (currentGroupType){
                    case "initial":
                    case "functionalLeftBracket":
                    case "separator":
                    case "rightBracket":
                        // ignored;
                        break;
                    case "operatorCanAssign":
                    case "operatorCannotAssign":
                    case "numberPlain":
                    case "numberWithDot":
                    case "numberWithExponential":
                    case "variable":
                    case "exponentialIndicator":
                    case "dotIndicator":
                    case "exponentialNegateIndicator":
                        // record the break, for it might bring error.
                        nextBreak = true;
                        negateTimes = 0
                        break;
                    case "negate":
                        nextBreak = true;
                        // record the break, retain negateTimes to expose error.
                        break;
                    default:
                        Expression.throwUnexpectedGroupType(currentGroupType)
                }

            } else if (char === "="){

                Expression.checkNegateTimesError(currentGroupType, negateTimes)

                switch (currentGroupType){
                    case "initial":
                    case "functionalLeftBracket":
                    case "separator":
                        Expression.throwMissingIdentifier(index)
                        break;
                    case "negate":
                        Expression.throwUnexpectedNegateOperatorBeforeAssignmentOperator(index)
                        break;
                    case "operatorCannotAssign":
                        Expression.throwUnexpectedOperatorBeforeAssignmentOperator(valueList.pop()[0], index)
                        break;
                    case "operatorCanAssign":
                        if (nextBreak){
                            Expression.throwUnexpectedSpaceBetweenCommonOperatorAndAssignmentOperator(index)
                        }

                        const [prevOperatorExpression] = valueList.pop()
                        const [prevVariableExpression] = valueList.pop()

                        if (Expression.isFunction(prevVariableExpression)){
                            Expression.throwInvalidFunctionNameIdentifier(prevVariableExpression, index)
                        }

                        valueList.push([prevVariableExpression, "identifier"])
                        valueList.push([prevOperatorExpression + "=", "composedAssign"])

                        currentGroupType = "operatorCannotAssign";
                        negateTimes = 0;
                        nextBreak = false;
                        break;

                    case "rightBracket":
                    case "numberPlain":
                    case "numberWithDot":
                    case "numberWithExponential":
                        Expression.throwInvalidIdentifier(index)
                        break;
                    case "variable":
                        // check if "="
                        let [variableExpression] = valueList.pop()

                        if (Expression.isFunction(variableExpression)){
                            Expression.throwInvalidFunctionNameIdentifier(variableExpression, index)
                        }

                        // this is a normal "="
                        valueList.push([variableExpression, "identifier"])
                        valueList.push(["=", "assign"]);

                        currentGroupType = "operatorCannotAssign";
                        negateTimes = 0;
                        nextBreak = false;

                        break;
                    case "exponentialIndicator":
                        Expression.throwUnexpectedEndOfExponentialIndicator(char, index)
                        break;
                    case "dotIndicator":
                        Expression.throwUnexpectedEndOfDotIndicator(char, index)
                        break;
                    case "exponentialNegateIndicator":
                        Expression.throwExcessExponentialNegateIndicatorForNumber(char, index)
                        break;
                    default:
                        Expression.throwUnexpectedGroupType(currentGroupType)
                }
            } else if (Expression.isCharVariable(char)){

                Expression.checkNegateTimesError(currentGroupType, negateTimes)

                switch (currentGroupType){
                    case "initial":
                    case "functionalLeftBracket":
                    case "separator":
                    case "operatorCanAssign":
                    case "operatorCannotAssign":
                    case "rightBracket":
                    case "negate":
                        // start of new variable.
                        valueList.push([char, "variable"])
                        // variable
                        currentGroupType = "variable";
                        negateTimes = 0;
                        nextBreak = false;

                        break;
                    case "variable":
                        // continue of the variable
                        if (nextBreak){
                            Expression.throwMissingOperatorForTwoVariables(index)
                        }

                        valueList.push([valueList.pop()[0] + char, "variable"]);

                        // variable;
                        currentGroupType = "variable";
                        negateTimes = 0;
                        nextBreak = false;

                        break;
                    case "numberPlain":
                    case "numberWithDot":
                        if (char === "E" || char === "e"){
                            if (nextBreak){
                                Expression.throwUnexpectedSpaceBetweenNumberAndExponentialIndicator(index)
                            }

                            // for sake of simplicity, turn it into "e"
                            valueList.push([valueList.pop()[0] + "e", "number"]);

                            currentGroupType = "exponentialIndicator"
                            negateTimes = 0;
                            nextBreak = false;
                        } else {
                            if (nextBreak){
                                Expression.throwMissingOperatorForNumberAndVariable(index)
                            } else {
                                Expression.throwUnexpectedCharacterForNumber(char, index)
                            }
                        }
                        break;
                    case "numberWithExponential":
                        Expression.throwUnexpectedCharacterForNumber(char, index)
                        break;
                    case "exponentialIndicator":
                        Expression.throwUnexpectedEndOfExponentialIndicator(char, index)
                        break;
                    case "dotIndicator":
                        Expression.throwUnexpectedEndOfDotIndicator(char, index)
                        break;
                    case "exponentialNegateIndicator":
                        Expression.throwExcessExponentialNegateIndicatorForNumber(char, index)
                        break;
                    default:
                        Expression.throwUnexpectedGroupType(currentGroupType)
                }
            } else if (Expression.isCharNumber(char)){
                // \d*[.]\d+[e|E][+-]\d+
                Expression.checkNegateTimesError(currentGroupType, negateTimes)

                switch (currentGroupType){
                    case "initial":
                    case "separator":
                    case "functionalLeftBracket":
                    case "operatorCanAssign":
                    case "operatorCannotAssign":
                        // start of new number.
                        valueList.push([char, "number"])
                        // variable
                        currentGroupType = "numberPlain";
                        negateTimes = 0;
                        nextBreak = false;

                        break;
                    case "negate":

                        // the negation could be incorporate into number
                        let negationString : string;
                        if (valueList.pop()[0] === "@-"){
                            negationString = "-"
                        } else {
                            negationString = "";
                        }

                        valueList.push([negationString + char, "number"])

                        currentGroupType = "numberPlain";
                        negateTimes = 0;
                        nextBreak = false;

                        break;
                    case "numberPlain":
                    case "numberWithDot":
                    case "numberWithExponential":
                    case "variable":
                        // it will retain the current groupType
                        if (nextBreak){
                            Expression.throwMissingOperatorForVariableAndNumber(index)
                        }

                        valueList.push([valueList.pop()[0] + char, (currentGroupType === "variable") ? "variable" : "number"]);

                        currentGroupType = currentGroupType;
                        negateTimes = 0;
                        nextBreak = false;

                        break;

                    case "rightBracket":
                        // implicit multiplication
                        // start of new variable.
                        valueList.push(["*", "operator"])
                        valueList.push([char, "number"])
                        // variable
                        currentGroupType = "numberPlain";
                        negateTimes = 0;
                        nextBreak = false;

                        break;
                    case "exponentialIndicator":
                    case "dotIndicator":
                    case "exponentialNegateIndicator":

                        if (nextBreak){
                            Expression.throwUnexpectedSpaceBetweenDotIndicatorAndNumber(index)
                        }

                        valueList.push([valueList.pop()[0] + char, "number"]);

                        if (currentGroupType === "dotIndicator"){
                            currentGroupType = "numberWithDot"
                        } else if (currentGroupType === "exponentialIndicator" || currentGroupType === "exponentialNegateIndicator"){
                            currentGroupType = "numberWithExponential"
                        }
                        negateTimes = 0;
                        nextBreak = false;

                        break;
                    default:
                        Expression.throwUnexpectedGroupType(currentGroupType)
                }
            } else if (char === "."){

                Expression.checkNegateTimesError(currentGroupType, negateTimes)

                switch (currentGroupType){
                    case "initial":
                    case "separator":
                    case "functionalLeftBracket":
                    case "operatorCanAssign":
                    case "operatorCannotAssign":
                    case "negate":
                        // start of new variable.
                        valueList.push(["0.", "number"])
                        // variable
                        currentGroupType = "dotIndicator";
                        negateTimes = 0;
                        nextBreak = false;

                        break;
                    case "numberPlain":
                        // it will retain the current groupType
                        if (nextBreak){
                            Expression.throwUnexpectedSpaceBetweenNumberAndDotIndicator(index)
                        }

                        valueList.push([valueList.pop()[0] + char, "number"]);

                        currentGroupType = "dotIndicator";
                        negateTimes = 0;
                        nextBreak = false;

                        break;

                    case "rightBracket":
                        // implicit multiplication
                        // start of new variable.
                        valueList.push(["*", "operator"])
                        valueList.push(["0.", "number"])
                        // variable
                        currentGroupType = "dotIndicator";
                        negateTimes = 0;
                        nextBreak = false;

                        break;


                    case "numberWithDot":
                        Expression.throwExcessDotIndicatorForNumber(index)
                        break;
                    case "numberWithExponential":
                        Expression.throwInvalidDotIndicatorAfterExponentialIndicator(index)
                        break;
                    case "variable":
                        Expression.throwInvalidDotIndicatorForVariable(index)
                        break;
                    case "exponentialIndicator":
                        Expression.throwUnexpectedEndOfExponentialIndicator(char, index)
                        break;
                    case "dotIndicator":
                        Expression.throwUnexpectedEndOfDotIndicator(char, index)
                        break;
                    case "exponentialNegateIndicator":
                        Expression.throwExcessExponentialNegateIndicatorForNumber(char, index)
                        break;
                    default:
                        Expression.throwUnexpectedGroupType(currentGroupType)
                }
            } else if (char === ","){

                Expression.checkNegateTimesError(currentGroupType, negateTimes)

                switch (currentGroupType){
                    case "initial":
                    case "dotIndicator":
                    case "exponentialIndicator":
                    case "separator":
                    case "operatorCanAssign":
                    case "operatorCannotAssign":
                    case "negate":
                    case "functionalLeftBracket":
                    case "exponentialNegateIndicator":
                        Expression.throwIncompleteExpressionBeforeSeparator(valueList.pop()[0], index);
                        break;
                    case "numberPlain":
                    case "numberWithDot":
                    case "numberWithExponential":
                    case "rightBracket":
                    case "variable":
                        if (bracketDepth === 0){
                            // this is another expression.
                            // check if current expression is valid
                            // and restore the expression to initial state
                            Expression.checkExpressionError(bracketDepth, currentGroupType)

                            valueList = new Stack<[string, OriginalExpressionType]>();
                            expressionList.push(valueList)

                            bracketDepth = 0;
                            // current group type
                            currentGroupType = "initial";
                            // how many negate detected, only when groupType = "negate"
                            negateTimes = 0;

                            nextBreak = false;
                        } else {
                            // just a separator
                            let [bracketScopeType, bracketScopeParameterCount, bracketScopeExpectedParameterCount, bracketScopeFunctionName] = bracketTree.pop()

                            if (bracketScopeType === "functional"){
                                valueList.push([",", "separator"])

                                bracketTree.push([bracketScopeType, bracketScopeParameterCount + 1, bracketScopeExpectedParameterCount, bracketScopeFunctionName])

                                currentGroupType = "separator";
                                negateTimes = 0;
                                nextBreak = false;

                            } else {
                                Expression.throwInvalidSeparator(index)
                            }
                        }
                        break;
                    default:
                        Expression.throwUnexpectedGroupType(currentGroupType)
                }
            } else {
                Expression.throwInvalidCharacter(char, index)
            }
        }

        Expression.checkExpressionError(bracketDepth, currentGroupType)

        return expressionList
    }
    public static parseExpression(expressionList: Stack<[string, OriginalExpressionType]>[]){
        let returnList : [string, ExpressionType][][] = [];

        for (let values of expressionList){
            let valueList = values.toArray();
            let result : [string, ExpressionType][] = [];
            let stack = new Stack<[string, StackExpressionType]>();

            let flattenValueList : ([string, SimplifiedExpressionType])[] = []

            valueList.forEach(([expression, expressionType], index) => {
                if (expressionType === "composedAssign"){
                    // the index !== 0, guaranteed by previous checker
                    flattenValueList.push(["=", "assign"]);
                    flattenValueList.push([valueList[index - 1][0], "variable"])
                    flattenValueList.push([expression[0], "operator"]);
                } else if (expressionType === "separator"){
                    // ignored
                } else {

                    flattenValueList.push([expression, expressionType])

                }
            })

            for (let [expression, expressionType] of flattenValueList){


                if (expressionType === "number" || expressionType === "variable" || expressionType === "identifier"){
                    result.push([expression, expressionType])
                } else {
                    while (true){

                        if (expressionType === "assign"){
                            result.push(["@=", "operator"])
                        }

                        if (stack.isEmpty()){
                            if (expressionType !== "rightBracket"){
                                stack.push([expression, expressionType])
                            } else {
                                // this won't happen because it's was guaranteed by previous check.
                            }
                            break;
                        }

                        // same as expression[expression.length - 1] === "("
                        if (expressionType === "leftBracket" || expressionType === "functionWithBracket"){
                            stack.push([expression, expressionType])
                            break;
                        }

                        const [operatorExpression, operatorType] = stack.pop()

                        // same as expression === ")"
                        if (expressionType === "rightBracket"){
                            // same as operatorExpression[operatorExpression.length - 1] === "("
                            if (operatorType === "leftBracket" || operatorType === "functionWithBracket"){
                                if (operatorType === "functionWithBracket"){
                                    result.push([operatorExpression.substring(0, operatorExpression.length - 1), "function"])
                                }
                            } else {
                                result.push([operatorExpression, (operatorType === "assign") ? "operator" : operatorType])
                                continue
                            }

                            break;
                        }

                        // same as operatorExpression[operatorExpression.length - 1] === "("
                        if (operatorType === "leftBracket" || operatorType === "functionWithBracket"){
                            stack.push([operatorExpression, operatorType])
                            stack.push([expression, expressionType])
                            break;
                        }

                        if (Expression.getOperatorPriority(expression as Operator) <= Expression.getOperatorPriority(operatorExpression as Operator)){
                            result.push([operatorExpression, operatorType === "assign" ? "operator" : operatorType])
                            continue
                        }

                        stack.push([operatorExpression, operatorType])
                        stack.push([expression, expressionType]);
                        break;
                    }
                }
            }

            while (!stack.isEmpty()){
                const [operatorExpression, operatorType] = stack.pop()

                if (!(operatorType === "functionWithBracket" || operatorType === "leftBracket")){
                    result.push([operatorExpression, (operatorType) === "assign" ? "operator" : operatorType])
                } else {
                    // this guaranteed by previous check to not happen
                }

            }

            returnList.push(result)
        }

        return returnList
    }
    public static parseValue<T>(expressionList: [string, ExpressionType][][], parseFunction : (value: string, type : ExpressionType) => [(T | string), "operand"] | [FunctionName, "function"]){
        return expressionList.map((valueList) =>
            valueList.map(([expression, expressionType]) => parseFunction(expression, expressionType))
        )
    }
    public static defaultParseFunction<T>(parser : (value: string, type : SimpleExpressionType) => T): (value: string, type : ExpressionType) => [(T | string), "operand"] | [FunctionName, "function"]{
        return (value: string, type : ExpressionType) => {
            if (type === "function"){
                return [value as FunctionName, "function"];
            } else if (type === "identifier") {
                return [value, "operand"]
            } else if (type === "operator"){
                return [Expression.getFunctionNameFromOperator(value as Operator), "function"]
            } else {
                return [parser(value, type), "operand"]
            }
        }
    }
    public static evaluateTree<T>(expressionList : ([(T | string), "operand"] | [FunctionName, "function"])[][], calculator: Calculator<T>){
        return expressionList.map((valueList) => {
            let stack = new Stack<T|string>()

            valueList.forEach((value) => {
                if (value[1] === "operand"){
                    stack.push(value[0])
                } else {

                    let count = Expression.getFunctionParameterCount(value[0])

                    let operands : (string | T)[] = []
                    for (let i = 0; i < count; i ++){
                        // guaranteed to have proper value by previous check.
                        let operand = stack.pop()
                        if (operand !== undefined){
                            operands[count - i - 1] = operand
                        }
                    }

                    if (Expression.isAssignmentFunction(value[0])){
                        stack.push(calculator[value[0] as AssignmentFunctionName](operands[0] as string, operands[1] as T))
                    } else if (value[0] === "declare"){
                        stack.push(calculator[value[0]](operands[0] as string))
                    } else {
                        stack.push(calculator[value[0]](...operands as T[]))
                    }
                }
            })

            return stack.pop() as T
        })
    }
    private static isCharVariable(char: string): boolean{
        let charCode = char.charCodeAt(0);

        return (charCode > 64 && charCode < 91 || charCode > 96 && charCode < 123 || charCode === 36 || charCode === 95)
    }
    private static isCharNumber(char: string): boolean{
        let charCode = char.charCodeAt(0);

        return (charCode > 47 && charCode < 58)
    }
    private static isVariable(value: string): boolean{
        if (value === undefined){
            return false;
        } else {
            for (let i = 0; i < value.length; i ++){
                let char = value[i]
                if (i === 0){
                    if (!Expression.isCharVariable(char)){
                        return false
                    }
                } else {
                    if (!Expression.isCharVariable(char) && !Expression.isCharNumber(char)){
                        return false
                    }
                }
            }
            return true
        }
    }
    private static isNumber(value: string): boolean{
        if (value === undefined){
            return false
        } else {
            let currentState : NumberType = "initial"

            for (let i = 0; i < value.length; i++){
                const char = value[i]
                if (char === "."){
                    switch (currentState){
                        case "dotIndicator":
                        case "numberWithDot":
                        case "numberWithExponential":
                        case "exponentialIndicator":
                        case "exponentialNegateIndicator":
                        case "negateIndicator":
                            return false;
                        case "initial":
                        case "numberPlain":
                            currentState = "dotIndicator"
                            break;
                    }
                } else if (char === "e" || char === "E"){
                    switch (currentState){
                        case "initial":
                        case "numberWithExponential":
                        case "exponentialIndicator":
                        case "dotIndicator":
                        case "exponentialNegateIndicator":
                        case "negateIndicator":
                            return false;
                        case "numberWithDot":
                        case "numberPlain":
                            currentState = "exponentialIndicator"
                            break;
                    }
                } else if (char === "+" || char === "-"){
                    switch (currentState){
                        case "initial":
                            currentState = "negateIndicator";
                            break
                        case "exponentialIndicator":
                            currentState = "exponentialNegateIndicator";
                            break;
                        case "dotIndicator":
                        case "exponentialNegateIndicator":
                        case "numberPlain":
                        case "numberWithDot":
                        case "numberWithExponential":
                        case "negateIndicator":
                            return false;

                    }
                } else if (Expression.isCharNumber(char)){

                    switch (currentState){
                        case "initial":
                        case "negateIndicator":
                            currentState = "numberPlain"
                            break;
                        case "exponentialIndicator":
                        case "exponentialNegateIndicator":
                            currentState = "numberWithExponential"
                            break;
                        case "dotIndicator":
                            currentState = "numberWithDot"
                            break;
                        case "numberPlain":
                        case "numberWithDot":
                        case "numberWithExponential":
                            currentState = currentState
                            break;
                    }
                } else {
                    return false;
                }
            }

            return true
        }
    }
    private static isOperator(value: string){
        return (Expression.operator as ReadonlyArray<string>).includes(value)
    }
    private static checkExpressionError(depth: number, currentGroupType: GroupType): never | void{
        if (depth !== 0){
            Expression.throwMissingRightBracket(depth)
        } else {
            switch (currentGroupType){
                case "initial":
                    // no left bracket, no right bracket
                    // nothing, okay.
                    break;
                case "numberPlain":
                case "numberWithDot":
                case "numberWithExponential":
                case "rightBracket":
                case "variable":
                    break;
                case "operatorCanAssign":
                case "operatorCannotAssign":
                case "dotIndicator":
                case "exponentialIndicator":
                case "functionalLeftBracket":
                case "exponentialNegateIndicator":
                case "separator":
                case "negate":
                    Expression.throwIncompleteExpression()
                    break;
                default:
                    Expression.throwUnexpectedGroupType(currentGroupType)
            }
        }
    }
    private static checkNegateTimesError(currentGroupType: GroupType, negateTimes : number){
        if (currentGroupType === "negate"){
            if (negateTimes === 0){
                //Expression.throwNegateWithZeroNegateTimes()
            }
        } else {
            if (negateTimes !== 0){
                Expression.throwNotNegateWithNonZeroTimes()
            }
        }
    }
    private static throwNonComposedOperatorHasComposedAssignType(value: string){
        throw new SyntaxError(`Non composed operator '${value}' has composedAssign type, show only in dev`)
    }
    private static throwInvalidCharacter(value: string, index: number){
        throw new ReferenceError(`Invalid Character ${value} at ${index}`)
    }
    private static throwInvalidSeparator(index: number){
        throw new SyntaxError(`Invalid separator ',' at ${index}, separator could only be used at root expression or as separation between function parameters`)
    }
    private static throwMissingExpressionBetweenSeparatorAndRightBracket(index: number){
        throw new SyntaxError(`Missing expression between ',' and ')' at ${index}`)
    }
    private static throwUnexpectedEndOfDotIndicator(value: string, index : number){
        throw new SyntaxError(`Unexpected '${value}' at ${index} after '.'`)
    }
    private static throwUnexpectedEndOfExponentialIndicator(value: string, index : number){
        throw new SyntaxError(`Unexpected '${value}' at ${index} after 'E' or 'e'`)
    }
    private static throwUnexpectedEndOfNegateIndicator(value: string, index: number){
        throw new SyntaxError(`Unexpected '${value}' at ${index} after unary operator '+' or '-'`)
    }
    private static throwUnexpectedEndOfExponentialNegateIndicator(value: string, index: number){
        throw new SyntaxError(`Unexpected '${value}' at ${index} after "e+" or "e-" or "E+" or "E-"`)
    }
    private static throwUnexpectedEndOfNegateOperators(value: string, index: number){
        throw new SyntaxError(`Unexpected '${value}' at ${index} after "+" or "-"`)
    }
    private static throwUnexpectedGroupType(groupType: string){
        throw new SyntaxError(`Unexpected Group Type ${groupType}, this shown only in dev mode`)
    }
    private static throwUnexpectedNegateOperatorBeforeAssignmentOperator(index: number){
        throw new SyntaxError(`Unexpected unary "+" or "-" operator before '=' at ${index}`)
    }
    private static throwUnexpectedOperatorBeforeAssignmentOperator(operator: string, index: number){
        throw new SyntaxError(`Unexpected operator "${operator}" before "=" at ${index}`)
    }
    private static throwUnexpectedCharacterForNumber(value: string, index: number){
        throw new SyntaxError(`Unexpected Character ${value} at ${index} for number`)
    }
    private static throwMissingLeftBracket(index: number){
        throw new SyntaxError(`Missing '(' for ')' at ${index}`)
    }
    private static throwMissingRightBracket(counts: number){
        throw new SyntaxError(`Missing ${counts} ')' for '('`)
    }
    private static throwMissingExpressionBetweenBrackets(index: number){
        throw new SyntaxError(`Missing expression between '(' and ')', detected when meets ')' at ${index}`)
    }
    private static throwIncompleteExpressionBetweenBrackets(index: number){
        throw new SyntaxError(`Invalid expression between '(' and ')', detected when meets ')' at ${index}`)
    }
    private static throwMissingLeftOperand(operator: string, index: number){
        throw new SyntaxError(`Missing left operand for "${operator}" at ${index}`)
    }
    private static throwMissingLeftOperandAtStartOfLine(operator: string, index: number){
        throw new SyntaxError(`Missing left operand for "${operator}" at ${index}, the beginning of the expression`)
    }
    private static throwMissingLeftOperandAfterLeftNormalBracket(operator: string, index: number){
        throw new SyntaxError(`Missing left operand for "${operator}" at ${index}, the beginning of a nonfunctional '('`)
    }
    private static throwMissingLeftOperandAfterFunctionalLeftBracket(operator: string, index: number){
        throw new SyntaxError(`Missing left operand for "${operator}" at ${index}, the beginning of a functional '('`)
    }
    private static throwMissingLeftOperandAfterSeparator(operator: string, index: number){
        throw new SyntaxError(`Missing left operand for "${operator}" at ${index}, after ','`)
    }
    private static throwMissingOperandBetweenTwoOperators(prevOperator: string, operator: string, index: number){
        throw new SyntaxError(`Missing left operand between "${prevOperator}" and "${operator}" at ${index}`)
    }
    private static throwMissingRightOperand(operator: string, index: number){
        throw new SyntaxError(`Missing right operand for "${operator}" at ${index}`)
    }
    private static throwMissingIdentifier(index: number){
        throw new SyntaxError(`Missing identifier for "=" at ${index}`)
    }
    private static throwInvalidIdentifier(index: number){
        throw new SyntaxError(`Invalid identifier for "=" at ${index}`)
    }
    private static throwExcessDotIndicatorForNumber(index: number){
        throw new SyntaxError(`Excess "." at ${index} for number`)
    }
    private static throwExcessExponentialNegateIndicatorForNumber(value: string, index: number){
        throw new SyntaxError(`Excess ${value} at ${index} for number`)
    }
    private static throwInvalidDotIndicatorAfterExponentialIndicator(index: number){
        throw new SyntaxError(`Invalid "." at ${index} after "E" or "e" for number `)
    }
    private static throwInvalidDotIndicatorForVariable(index: number){
        throw new SyntaxError(`Invalid "." at ${index} for variable`)
    }
    private static throwIncompleteExpressionBeforeSeparator(value: string, index: number){
        throw new SyntaxError(`Incomplete expression "${value}" before "," at ${index}`)
    }
    private static throwIncompleteExpression(){
        throw new SyntaxError("Incomplete expression")
    }
    private static throwUnexpectedSpaceBetweenUnaryOperators(index: number){
        throw new SyntaxError(`Unexpected Separation between one unary operator "+" or "-" and other unary operator "+" or "-" at ${index}`)
    }
    private static throwUnexpectedSpaceBetweenExponentialIndicatorAndUnaryOperator(index: number){
        throw new SyntaxError(`Unexpected Separation between exponential indicator "E" or "e" and an unary operator "+" or "-" at ${index}`)
    }
    private static throwUnexpectedSpaceBetweenCommonOperatorAndAssignmentOperator(index: number){
        throw new SyntaxError(`Unexpected Separation between "=" and an operator at ${index}`)
    }
    private static throwMissingOperatorForTwoVariables(index: number){
        throw new SyntaxError(`Missing operator for two variables at ${index}`)
    }
    private static throwUnexpectedSpaceBetweenNumberAndExponentialIndicator(index: number){
        throw new SyntaxError(`Unexpected Separation between number and a exponential indicator "E" or "e" at ${index}`)
    }
    private static throwMissingOperatorForNumberAndVariable(index: number){
        throw new SyntaxError(`Missing operator for number and variable at ${index}`)
    }
    private static throwMissingOperatorForVariableAndNumber(index: number){
        throw new SyntaxError(`Missing operator for variable and number at ${index}`)
    }
    private static throwUnexpectedSpaceBetweenDotIndicatorAndNumber(index: number){
        throw new SyntaxError(`Unexpected Separation between "." and a number at ${index}`)
    }
    private static throwUnexpectedSpaceBetweenNumberAndDotIndicator(index: number){
        throw new SyntaxError(`Unexpected Separation between a number and "." at ${index}`)
    }
    private static throwInvalidFunctionNameIdentifier(variable: string, index: number){
        throw new SyntaxError(`Invalid Identifier, identifier cannot be the name of function ('${variable}' at ${index}).`)
    }
    private static throwInvalidOperator(operator: string){
        throw new SyntaxError(`Invalid Operator '${operator}', this happens due to a bug`)
    }
    private static throwInvalidNumberOfParameter(functionNames : string, expectedParameterCount : number, parameterCount : number){
        throw new SyntaxError(`Invalid number of parameters. '${functionNames}' expects ${expectedParameterCount}, but gets ${parameterCount} in actual.`)
    }
    private static throwNegateWithZeroNegateTimes(){
        throw new SyntaxError("Negate with zero negation times")
    }
    private static throwNotNegateWithNonZeroTimes(){
        throw new SyntaxError("Not negate with non-zero negation times")
    }

    /*private static getFunctionNames() : FunctionName {
        return [...Expression.primitiveFunctionNames ,...Expression.additionalFunctionNames] as FunctionName
    }*/
    private static isFunction(functionName: string | FunctionName) : boolean{
        return (Expression.primitiveFunctionNames.includes(functionName) ||
            Expression.additionalFunctionNames.includes(functionName))
    }
    private static isAssignmentFunction(functionName: FunctionName) : boolean{
        return (Expression.assignmentFunctionNames.includes(functionName))
    }
    private static getOperatorPriority(operator: Operator){
        let priority = Expression.operatorPriority[operator]
        if (priority === undefined){
            Expression.throwInvalidOperator(operator)
        } else {
            return priority
        }
    }
    private static getFunctionNameFromOperator(operator: Operator): FunctionName{
        let functionName = Expression.operatorFunctionMapping[operator]
        if (functionName === undefined){
            Expression.throwInvalidOperator(operator)
        } else {
            return functionName
        }
    }
    private static getFunctionParameterCount(functionName: FunctionName): number{
        let parameterCount = Expression.functionParameterCounts[functionName]
        if (parameterCount === undefined){
            Expression.throwInvalidOperator(functionName)
        } else {
            return parameterCount
        }
    }
    private static additionalFunctionNames = [
        "log", "lg", "ln", "log10", "logE", "exp", "exp10",
        "sin", "cos", "tan", "cot", "sec", "csc",
        "sqrt", "reciprocal", "cbrt", "nrt", "exact"
    ] as AdditionalFunctionNameList
    private static primitiveFunctionNames = [
        "plus", "minus", "multiply", "divide", "power", "mod",
        "minusAssign", "plusAssign", "multiplyAssign", "divideAssign",
        "powerAssign", "modAssign", "unaryMinus", "unaryPlus",
        "assign", "declare", "reciprocal"
    ] as PrimitiveFunctionNameList
    private static assignmentFunctionNames = [
        "assign", "minusAssign", "plusAssign",
        "multiplyAssign", "divideAssign",
        "powerAssign", "modAssign"
    ] as AssignmentFunctionNameList

    private static functionParameterCounts : FunctionParameterCounts = {
        "log" : 2,
        "lg" : 1,
        "ln" : 1,
        "log10" : 1,
        "logE" : 1,
        "exp" : 1,
        "exp10" : 1,
        "reciprocal" : 1,
        "sin" : 1,
        "cos" : 1,
        "tan" : 1,
        "cot" : 1,
        "sec" : 1,
        "csc" : 1,
        "sqrt" : 1,
        "cbrt" : 1,
        "nrt" : 2,
        "exact" : 1,
        "plus" : 2,
        "minus" : 2,
        "multiply" : 2,
        "divide" : 2,
        "power" : 2,
        "mod" : 2,
        "minusAssign" : 2,
        "plusAssign" : 2,
        "multiplyAssign" : 2,
        "divideAssign" : 2,
        "powerAssign" : 2,
        "modAssign" : 2,
        "unaryMinus" : 1,
        "unaryPlus" : 1,
        "assign" : 2,
        "declare" : 1
    }
    private static operator : OperatorList = ["=", "+", "-", "*", "/", "%", "^", "@-", "@+", "@="]
    private static operatorPriority : OperatorPriority = {
        "=" : 0,
        "+" : 1,
        "-" : 1,
        "*" : 2,
        "/" : 2,
        "%" : 2,
        "^" : 3,
        "@-" : 4,
        "@+" : 4,
        "@=" : 5,
    }
    private static operatorFunctionMapping : OperatorFunctionMapping = {
        "=" : "assign",
        "+" : "plus",
        "-" : "minus",
        "*" : "multiply",
        "/" : "divide",
        "^" : "power",
        "%" : "mod",
        "@-" : "unaryMinus",
        "@+" : "unaryPlus",
        "@=" : "declare"
    }
}


type GroupType = "initial" | "numberPlain" | "numberWithDot" | "numberWithExponential" | "variable" | "operatorCannotAssign" | "operatorCanAssign" |
"negate" | "rightBracket" | "exponentialIndicator" | "dotIndicator" | "exponentialNegateIndicator" |  "functionalLeftBracket" | "separator"
type NumberType = "initial" | "numberPlain" | "numberWithDot" | "numberWithExponential" | "dotIndicator" | "exponentialIndicator" | "exponentialNegateIndicator" | "negateIndicator"
type OriginalExpressionType = "variable" | "number" | "operator" | "composedAssign" | "identifier" | "functionWithBracket" | "leftBracket" | "rightBracket" | "separator" | "assign"
type SimplifiedExpressionType = "variable" | "number" | "operator" | "identifier" | "functionWithBracket" | "leftBracket" | "rightBracket" | "assign"
type StackExpressionType = "operator" | "functionWithBracket" | "leftBracket" | "assign"
type ExpressionType = "variable" | "operator" | "number" | "identifier" | "function"
type ValueType = "function" | "operand"
declare global {
    type SimpleExpressionType = "variable" | "number"
}


type Calculator<T> = {
    [index in Exclude<FunctionName, "assign | declare">]: (...operands: T[]) => T;
} & {
    [index in AssignmentFunctionName] : (identifier: string, operand: T) => T;
} & {
    "declare": (identifier: string) => string;
};

type AssignmentFunctionNameData = ["assign" | "plusAssign" | "minusAssign" | "multiplyAssign" | "divideAssign" | "powerAssign" | "modAssign"]

interface AssignmentFunctionNameList extends Array<string>{
    [index: number]: (AssignmentFunctionNameData)[number]
    includes<U>(x: U & ((string & U) extends never ? never : unknown)): boolean;
}

type AssignmentFunctionName = AssignmentFunctionNameList[number]


type PrimitiveFunctionNameData = ["plus", "minus", "multiply", "divide", "power", "mod",
"minusAssign", "plusAssign", "multiplyAssign", "divideAssign",
"powerAssign", "modAssign", "unaryMinus", "unaryPlus",
"assign", "declare"]

type AdditionalFunctionNameData = [
    "log", "lg", "ln", "log10", "logE", "exp", "exp10",
    "sin", "cos", "tan", "cot", "sec", "csc",
    "sqrt", "reciprocal", "cbrt", "nrt", "exact"
]

interface PrimitiveFunctionNameList extends Array<string>{
    [index: number]: (PrimitiveFunctionNameData)[number]
    includes<U>(x: U & ((string & U) extends never ? never : unknown)): boolean;
}

type PrimitiveFunctionName = PrimitiveFunctionNameList[number]

interface AdditionalFunctionNameList extends Array<string>{
    [index: number]: (AdditionalFunctionNameData)[number]
    includes<U>(x: U & ((string & U) extends never ? never : unknown)): boolean;
}

type AdditionalFunctionName = AdditionalFunctionNameList[number]

interface FunctionNameList extends Array<string>{
    [index : number]: (PrimitiveFunctionName | AdditionalFunctionName)
    includes<U>(x: U & ((string & U) extends never ? never : unknown)): boolean;
}

type FunctionName = (PrimitiveFunctionName | AdditionalFunctionName)

type FunctionParameterCounts = {
    [index in FunctionName] : number
}

type OperatorPriority = {
    [index in Operator] : number
}

type OperatorList = ["=", "+", "-", "*", "/", "%", "^", "@-", "@+", "@="]

type OperatorFunctionMapping = {
    [index in Operator] : FunctionName
}

type Operator = OperatorList[number]

export default Expression