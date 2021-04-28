import * as React from "react";
import { useState, useRef, forwardRef, useEffect, createRef } from "react";
import ReactDOM from "react-dom";
import Util from "./lib/Util"
import Scope from  "./lib/Scope"
import Expression from "./lib/ExpressionV4"
import ChemicalExpression from "./lib/ChemicalExpressionV2"
import SignificantNumber from "./lib/SignificantNumber"
import { ThemeProvider, Container, createMuiTheme, CssBaseline, makeStyles, Box, Grid, TextField, InputAdornment, IconButton, Paper, useTheme, Typography } from "@material-ui/core"
import { blue, green, red } from "@material-ui/core/colors"
import KeyboardReturnIcon from '@material-ui/icons/KeyboardReturn';
import ScienceIcon from './components/scienceIcon'
import ScienceFilledIcon from "./components/scienceIconFilled"
import ExplicitIcon from '@material-ui/icons/Explicit';
import detector from "detector"

//@ts-ignore
window.Expression = Expression
//@ts-ignore
window.chemicalExpression = ChemicalExpression
//@ts-ignore
window.Scope = Scope;


function main(){
    const container = document.querySelector("#container")

    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);

    window.addEventListener('resize', () => {
        // We execute the same script as before
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    });

    ReactDOM.render(<ThemeProvider theme = { AppTheme }><App/></ThemeProvider>, container)
}
const AppTheme = createMuiTheme({
    palette : {
        primary : {
            main : blue[700]
        },
        secondary : {
            main : green[700]
        }
    },
    overrides : {
        MuiCssBaseline: {
            '@global' : {
                body : {
                    fontSize : "1rem",
                    minWidth : 300,
                    position : "absolute",
                    top : 0,
                    left : 0,
                    right : 0
                },
                '::-webkit-scrollbar' : {
                    display : "none"
                }
            }
        }
    }
})
const useAppStyle = makeStyles((theme) => ({
    container : {
        height : "calc(var(--vh) * 100)",
        maxWidth : "-webkit-fill-available"
    },
    gridContainer : {
        height : "100%",
    },
    mainContent : {
        [theme.breakpoints.down(600)] : {
            width : "100%"
        },
        width : "calc(90% - 240px)",
        height : "100%"
    },
    variableContent : {
        [theme.breakpoints.down(600)] : {
            display : "none"
        },
        width : "calc(10% + 240px)",
        height : "100%",
        overflow : "scroll"
    },
    textField : {
        width : "100%"
    },
    input : {
        paddingRight : theme.spacing(1)
    },
    resultContent : {
        alignSelf : "flex-start",
        width : "100%",
        height : "calc(100% - 56px)",
        overflowY : "scroll",
        overflowX : "hidden",
        padding : theme.spacing(1)
    },
    variablePaper : {
        padding : theme.spacing(1, 1.5, 1),
        borderColor : theme.palette.primary.main,
        borderWidth : 2
    },
    exactString : {
        width : "100%",
        textOverflow : "ellipsis",
        overflow: "hidden",
        whiteSpace: "nowrap",
        display: "inline-block"
    }
}))

let id = 0;
const globalScope = new Scope<SignificantNumber>();
const util = new Util(globalScope)

util.enableResultRecording()
util.enableScopeRecording()

function App(props){
    const classes = useAppStyle()
    const theme = useTheme();
    const [list, setList] = useState([]);
    const [value, setValue] = useState("");
    const [scope, setScope] = useState([]);
    const [isExact, setIsExact] = useState(false);
    const [isChemistryHandler, setIsChemistryHandler] = useState(false)
    const [focusedElementIndexPair, setFocusedElementIndexPair]
        : [focusedElementIndexPair: [number, boolean], setFocusedElementIndexPair : Function] = useState([-1, false])
    const inputRef = useRef(null);
    const [inputCursor, setInputCursor] = useState([0])


    function handleKeyPress(event: React.KeyboardEvent){
        if (event.code === "Enter" || event.key === "Enter"){
            if (focusedElementIndexPair[0] === list.length){
                calculate()
            } else {
                if (focusedElementIndexPair[0] > -1){
                    if (list[focusedElementIndexPair[0]] !== undefined){
                        let addedValue = (isExact) ? list[focusedElementIndexPair[0]].exactContent : list[focusedElementIndexPair[0]].content

                        let nextSelection;

                        setValue((prevValue) => {
                            let beforeValue = prevValue.substring(0, inputRef.current.selectionStart)
                            let afterValue = prevValue.substring(inputRef.current.selectionEnd)

                            nextSelection = beforeValue.length + addedValue.length

                            setInputCursor(nextSelection)

                            let nextValue = beforeValue + addedValue + afterValue

                            return nextValue
                        })

                        setFocusedElementIndexPair([list.length, false])
                        //inputRef.current.focus()
                    }
                }
            }
        }
    }
    function handleKeyDown(event: React.KeyboardEvent){
        if (event.code === "ArrowUp" || event.code === "ArrowDown"){

            setFocusedElementIndexPair((prevFocusedElementIndexPair) => {
                let step = (event.code === "ArrowUp") ? -1 : 1;
                let delta = 1

                while (true){
                    let index = prevFocusedElementIndexPair[0] + delta * step
                    if (index < 0 || index > list.length - 1){
                        return prevFocusedElementIndexPair
                    } else {
                        if (list[index].type !== "error"){
                            return [index, true]
                        }
                    }
                    delta += 1
                }
            })

            event.stopPropagation()
            event.preventDefault()
        } else if (event.ctrlKey || event.key === "Ctrl") {
            if (event.altKey || event.key === "Alt"){
                if (event.code === "KeyC" || event.key === "c" || event.key === "C"){
                    setIsChemistryHandler((prevIsChemistryHandler) => !prevIsChemistryHandler)

                    event.stopPropagation()
                    event.preventDefault()
                } else if (event.code === "KeyE" || event.key === "e" || event.key === "E"){
                    setIsExact((prevIsExact) => !prevIsExact)

                    event.stopPropagation()
                    event.preventDefault()
                }
            }
        }

    }
    function onMouseEnter(id){
        setFocusedElementIndexPair([id, false])
    }
    function onMouseLeave(id){
        setFocusedElementIndexPair([list.length, false])
    }
    function onExpressionClick(id){
        if (id !== -1){
            if (list[id] !== undefined && list[id].type !== "error"){

                let addedValue : string = (isExact) ? list[id].exactContent : list[id].content

                let nextSelection;

                setValue((prevValue) => {
                    let beforeValue = prevValue.substring(0, inputRef.current.selectionStart)
                    let afterValue = prevValue.substring(inputRef.current.selectionEnd)

                    nextSelection = beforeValue.length + addedValue.length

                    setInputCursor(nextSelection)

                    let nextValue = beforeValue + addedValue + afterValue

                    return nextValue
                })

                inputRef.current.focus()
            }
        }
    }
    function calculate(){
        if (value === ""){
            return
        }
        let output;
        let isError;
        let resultVariables;
        let orderedVariables;
        try{
            if (isChemistryHandler){
                [output, resultVariables, orderedVariables] = util.evaluateAtomicMass(value)
            } else {
                [output, resultVariables, orderedVariables] = util.evaluate(value)
            }
            isError = false;
        } catch (e){
            output = e
            resultVariables = ""
            isError = true;
        }
        setList([...list, {
            //@ts-ignore
            content : value,
            exactContent : value,
            type : "input",
            ref : createRef(),
            id : id
        }, {
            content : output.toString(),
            exactContent : resultVariables.toString(),
            type : (isError) ? "error" : "output",
            ref : createRef(),
            id : id + 1
        }])
        id += 2;

        if (!isError){
            let globalScopeObject = globalScope.toObject()
            let orderedScopeArray = []
            let filteredScopeArray = []


            if (globalScopeObject["ans"] !== undefined){
                orderedScopeArray.push(["ans", globalScopeObject["ans"]])
            } else {
                // couldn't happen
            }

            for (let identifier of orderedVariables){
                if (identifier === "ans"){
                    continue
                }
                if (globalScopeObject[identifier] !== undefined){
                    orderedScopeArray.push([identifier, globalScopeObject[identifier]])
                } else {
                    // couldn't happen
                }
            }

            orderedScopeArray.forEach(([identifier, value]) => {
                if (identifier.substring(0, 4) !== "ans_"){
                    filteredScopeArray.push([identifier, value])
                }
            })
            setScope(filteredScopeArray)
        } else {
            // we do nothing.
            // because there is an error.
        }
        setValue("")
    }
    function onCalculateClick(){
        calculate()
    }
    function onToggleHandler(){
        setIsChemistryHandler((prevIsChemistryHandler) => !prevIsChemistryHandler)
    }
    function onToggleIsExact(){
        setIsExact((prevIsExact) => !prevIsExact)
    }
    useEffect(() => {
        if (list.length > 0){
            if (list[list.length - 1] !== undefined){
                let lastElement = list[list.length - 1].ref.current
                if (lastElement !== undefined){
                    if (detector.device.name === "vivo"){
                        lastElement.scrollIntoView(false)
                    } else {
                        lastElement.scrollIntoView({ behavior : "smooth", block: "end", inline: "nearest" })
                    }
                }
            }
        }
        setFocusedElementIndexPair([list.length, false])
    }, [list])
    useEffect(() => {
        if (focusedElementIndexPair[1] && focusedElementIndexPair[0] > -1 && list[focusedElementIndexPair[0]] !== undefined){
            let lastElement = list[focusedElementIndexPair[0]].ref.current
            if (lastElement !== undefined){
                if (detector.device.name === "vivo"){
                    lastElement.scrollIntoView(false)
                } else {
                    lastElement.scrollIntoView({ behavior : "smooth", block: "end", inline: "nearest" })
                }
            }
        }
    }, [focusedElementIndexPair])
    useEffect(() => {
        console.log(inputRef.current.value, inputCursor)
        inputRef.current.selectionStart = inputCursor
        inputRef.current.selectionEnd = inputCursor
        inputRef.current.focus()
    }, [inputCursor])

    return (<>
        <CssBaseline />
        <Container maxWidth = "md" className = { classes.container }><Grid container className = { classes.gridContainer}>
            <Grid item container wrap = "wrap" alignItems = "flex-end" className = { classes.mainContent }>
                <Grid item className = { classes.resultContent }>{
                    list.map((information, index) => {
                        return (<ResultContentWithRef
                            content = { information.content }
                            type = { information.type }
                            ref = { information.ref }
                            id = { information.id }
                            focused = { index === focusedElementIndexPair[0] }
                            onMouseEnter = { onMouseEnter }
                            onMouseLeave = { onMouseLeave }
                            onClick = { onExpressionClick }
                            key = { information.id } />)
                    })
                }</Grid>
                <Grid item className = { classes.textField }>
                    <TextField
                        label = "Expressions"
                        variant = "filled"
                        InputProps = {{
                            endAdornment : <InputAdornment position = "end">
                                <IconButton onClick = { onToggleIsExact } color = {
                                    isExact ? "primary" : "default"
                                }>
                                    <ExplicitIcon />
                                </IconButton>
                                <IconButton onClick = { onToggleHandler } color = {
                                    isChemistryHandler ? "primary" : "default"
                                }>{
                                    isChemistryHandler
                                        ? (<ScienceFilledIcon />)
                                        : (<ScienceIcon />)
                                }</IconButton>
                                <IconButton onClick = { onCalculateClick }>
                                    <KeyboardReturnIcon />
                                </IconButton>
                            </InputAdornment>,
                            classes : {
                                root : classes.input
                            }
                        }}
                        onKeyDownCapture = { handleKeyDown }
                        onKeyPressCapture = { handleKeyPress }
                        onChange = { (event) => { console.log("onChange");setValue(event.target.value) } }
                        value = { value }
                        fullWidth size = "medium"
                        inputRef = { inputRef } />
                </Grid>
            </Grid>
            <Grid item sm = { false } className = { classes.variableContent }>
                <Box padding = { 1 }>{
                    scope.map((value) => {
                        return (<Box padding = { 1 } key = { value[0] }>
                            <Paper variant = "outlined" className = { classes.variablePaper }>
                                <Typography variant = "h6">
                                    <Box fontWeight = { 700 } color = { theme.palette.primary.main }>
                                        { `${value[0]}` }
                                    </Box>
                                </Typography>
                                <Typography>
                                    <Box fontWeight = { 700 } color = { theme.palette.secondary.main } component = "span">
                                        &nbsp;&nbsp;&nbsp;&nbsp;{  `Rounded String : ${value[1].toString()}` }
                                    </Box>
                                </Typography>
                                <Typography>
                                    <Box fontWeight = { 700 }
                                        color = { theme.palette.secondary.main }
                                        component = "span"
                                        className = { classes.exactString }>
                                        &nbsp;&nbsp;&nbsp;&nbsp;{ `Exact String : ${value[1].toExactString()}` }
                                    </Box>
                                </Typography>
                            </Paper>
                        </Box>)
                    })
                }</Box>
            </Grid>
        </Grid></Container>
    </>)
}

const useResultContentTheme = makeStyles((theme) => ({
    paper : {
        transition : "all 0.3s"
    },
    paperPrimary : {
        borderWidth : 2,
        borderColor : theme.palette.primary.main
    },
    paperSecondary : {
        borderWidth : 2,
        borderColor : theme.palette.secondary.main
    },
    paperError : {
        borderWidth : 2,
        borderColor : red[700]
    },
    hoverPrimary : {
        backgroundColor : theme.palette.primary.main
    },
    hoverSecondary : {
        backgroundColor : theme.palette.secondary.main
    },
    hoverError : {
        backgroundColor : red[700]
    },
    expression : {
        userSelect : "none",
        transition : "all 0.3s",
        lineBreak : "anywhere"
    }
}))

const ResultContentWithRef = forwardRef((props : {content: string, type: string, id : number, onMouseEnter: Function, onMouseLeave:Function, onClick:Function, focused : boolean}, ref) => (
    <ResultContent { ...props } forwardedRef = { ref }></ResultContent>
))

function ResultContent({ content , type , focused, onMouseEnter, onMouseLeave, onClick, id, forwardedRef } :
    { content : string, type : string, focused: boolean, id : number, onClick: Function
      onMouseEnter: Function, onMouseLeave: Function, forwardedRef : React.Ref<any> }){
    const theme = useTheme()
    const classes = useResultContentTheme()

    const isInput = type === "input"
    const justify = isInput ? "flex-end" : "flex-start"

    let color;

    if (type === "input"){
        color = (focused) ? theme.palette.primary.contrastText : theme.palette.primary.main
    } else if (type === "output"){
        color = (focused) ? theme.palette.secondary.contrastText : theme.palette.secondary.main
    } else {
        color = (focused) ? theme.palette.secondary.contrastText : red[700]
    }

    let className;

    if (type === "input"){
        className = `${classes.paperPrimary}`
    } else if (type === "output"){
        className = `${classes.paperSecondary}`
    } else {
        className = `${classes.paperError}`
    }

    if (focused){
        if (type === "input"){
            className += ` ${classes.hoverPrimary}`
        } else if (type === "output"){
            className += ` ${classes.hoverSecondary}`
        } else {
            className += ` ${classes.hoverError}`
        }
    }

    function handleMouseEnter(){
        onMouseEnter(id)
    }
    function handleMouseLeave(){
        onMouseLeave(id)
    }
    function handleClick(){
        onClick(id)
    }

    //@ts-ignore
    return (<Box padding = { 1 } ref = { forwardedRef } >
        <Grid container justify = { justify }><Grid>
            <Paper variant = "outlined"
                onMouseEnter = { handleMouseEnter }
                onMouseLeave = { handleMouseLeave }
                onClick = { handleClick }
                className = {
                    `${ classes.paper }
                     ${ className }`
                    }>
                <Box marginY = { 1 }
                    marginX = { 1.5 }
                    color = { color }
                    className = { classes.expression }>
                   { content.toString().substring(0, 200) }
                </Box>
            </Paper>
        </Grid></Grid>
    </Box>)
}

window.onload = main