import * as React from "react";
import { useState, useRef, forwardRef, useEffect, createRef } from "react";
import ReactDOM from "react-dom";
import { util, chemUtil, Scope } from "./lib/sfn"
import { ThemeProvider, Container, createMuiTheme, CssBaseline, makeStyles, Box, Grid, TextField, InputAdornment, IconButton, Paper, useTheme, Typography } from "@material-ui/core"
import { blue, green } from "@material-ui/core/colors"
import KeyboardReturnIcon from '@material-ui/icons/KeyboardReturn';
import ScienceIcon from './components/scienceIcon'
import ScienceFilledIcon from "./components/scienceIconFilled"
import detector from "detector"

function main(){
    const container = document.querySelector("#container")
    console.log(detector)

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
console.log(AppTheme)
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
        width : "calc(10% + 240px)"
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
let globalScope = new Scope();
util.setScope(globalScope);
chemUtil.setScope(globalScope);

function App(props){
    const classes = useAppStyle()
    const theme = useTheme();
    const [list, setList] = useState([]);
    const [value, setValue] = useState("");
    const [scope, setScope] = useState([]);
    const [isChemistryHandler, setIsChemistryHandler] = useState(false)
    const [focusedElementIndexPair, setFocusedElementIndexPair]
        : [focusedElementIndexPair: [number, boolean], setFocusedElementIndexPair : Function] = useState([-1, false])
    console.log(list.length, focusedElementIndexPair)

    function handleKeyPress(event: React.KeyboardEvent){
        if (event.code === "Enter" || event.key === "Enter"){
            if (focusedElementIndexPair[0] === list.length){
                calculate()
            } else {
                if (focusedElementIndexPair[0] > -1){
                    if (list[focusedElementIndexPair[0]] !== undefined){
                        let addedValue = list[focusedElementIndexPair[0]].content

                        setValue((prevValue) => prevValue + addedValue)
                        setFocusedElementIndexPair([list.length, false])
                    }
                }
            }
        }
    }
    function handleKeyDown(event: React.KeyboardEvent){
        if (event.code === "ArrowUp" || event.code === "ArrowDown"){
            if (event.code === "ArrowUp"){
                setFocusedElementIndexPair((prevFocusedElementIndexPair) => [
                    Math.max(prevFocusedElementIndexPair[0] - 1, 0)
                , true])
            } else if (event.code === "ArrowDown"){
                setFocusedElementIndexPair((prevFocusedElementIndexPair) => [
                    Math.min(prevFocusedElementIndexPair[0] + 1, list.length - 1)
                , true])
            }
            event.stopPropagation()
        } else if (event.ctrlKey || event.key === "Ctrl") {
            if (event.altKey || event.key === "Alt"){
                setIsChemistryHandler((prevIsChemistryHandler) => !prevIsChemistryHandler)

                event.stopPropagation()
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
            if (list[id] !== undefined){
                let addedValue = list[id].content
                setValue((prevValue) => prevValue + addedValue)
            }
        }
    }
    function calculate(){
        if (value === ""){
            return
        }
        let output;
        try{
            if (isChemistryHandler){
                output = chemUtil.evaluateMolarMass(value).toString()
            } else {
                output = util.evaluate(value).toString()
            }
        } catch (e){
            output = e.toString()
        }
        setList([...list, {
            //@ts-ignore
            content : value,
            type : "input",
            ref : createRef(),
            id : id
        }, {
            content : output,
            type : "output",
            ref : createRef(),
            id : id + 1
        }])
        id += 2;
        setScope(globalScope.getAsArray())
        setValue("")
    }
    function onCalculateClick(){
        calculate()
    }
    function onToggleHandler(){
        setIsChemistryHandler((prevIsChemistryHandler) => !prevIsChemistryHandler)
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
        if (focusedElementIndexPair[1]){
            if (focusedElementIndexPair[0] > -1){
                if (list[focusedElementIndexPair[0]] !== undefined){
                    let lastElement = list[focusedElementIndexPair[0]].ref.current
                    if (lastElement !== undefined){
                        if (detector.device.name === "vivo"){
                            lastElement.scrollIntoView(false)
                        } else {
                            lastElement.scrollIntoView({ behavior : "smooth", block: "end", inline: "nearest" })
                        }
                    }
                }
            }
        }
    }, [focusedElementIndexPair])

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
                        onChange = { (event) => { setValue(event.target.value) } }
                        value = { value }
                        fullWidth size = "medium"/>
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
    hoverPrimary : {
        backgroundColor : theme.palette.primary.main
    },
    hoverSecondary : {
        backgroundColor : theme.palette.secondary.main
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
    const color = (isInput)
        ? (focused) ? theme.palette.primary.contrastText : theme.palette.primary.main
        : (focused) ? theme.palette.secondary.contrastText : theme.palette.secondary.main

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
                     ${(isInput) ? classes.paperPrimary : classes.paperSecondary}
                     ${(focused)
                        ? (isInput) ? classes.hoverPrimary : classes.hoverSecondary
                        : ""}` }>
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