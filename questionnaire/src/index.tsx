import * as React from 'react';
import ReactDOM from "react-dom";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { Container, createMuiTheme, CssBaseline, ThemeProvider, Button, Card, CardContent, CardHeader, Typography, Box, Grid, FormControl, FormLabel, FormControlLabel, Radio, RadioGroup, TableFooter, CardActions, useTheme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { red } from "@material-ui/core/colors"
import { useState, useEffect } from "react";

function main(){
    let container = document.querySelector("#container");
    ReactDOM.render(<App />, container);
}

const APP_THEME = createMuiTheme({
    palette : {
        primary : {
            main : red[900]
        }
    }
})

const USE_TABLE_STYLE = makeStyles({
    tableContainer : {
        "width" : "80%",
        "margin" : "2rem 10%"
    },
    tableHead : {
        "fontWeight" : 700
    },
})

const USE_CATEGORY_STYLE = makeStyles({
    categoryLeft : {
        "alignSelf" : "flex-start"
    },
    categoryRight : {
        "alignSelf" : "flex-end"
    },
    lessLineHeight : {
        "lineHeight" : "initial"
    }
})

const USE_APP_STYLE = makeStyles((theme) => ({
    container : {
        "padding" : theme.spacing(4, 4)
    }
}))

const USE_SELECTION_STYLE = makeStyles((theme) => ({
    radioLabel : {
        userSelect : "none"
    },
    selectionQuestion : {
        userSelect : "none"
    },
    button : {
        marginLeft : "auto"
    }
}))

const TEST_DATA = {
    "bindGroups" : [
        ["male", "female"],
        ["career", "family"]
    ],
    "groups" : {
        "male" : ["Male1", "Male2", "Male3", "Male4", "Male5", "Male6", "Male7"],
        "female" : ["Female1", "Female2", "Female3", "Female4", "Female5", "Female6", "Female7"],
        "career" : ["Career1", "Career2", "Career3", "Career4", "Career5", "Career6", "Career7"],
        "family" : ["Family1", "Family2", "Family3", "Family4", "Family5", "Family6", "Family7"]
    }
} as const;

const TEST_TIMES = [20, 20, 20, 40, 28, 20, 40] as const;
const TEST_PROCESS = generateProcess();
const TEST_ITERATOR = nextQuestion();
const TEST_SELECTION_DATA = [
    {
        question : "你认为家庭与男性和女性有多大联系?",
        values : [
            "与男性有强烈联系",
            "与男性有中等联系",
            "与男性有一点联系",
            "男性女性联系一样",
            "与女性有一点联系",
            "与女性有中等联系",
            "与女性有强烈联系",
        ]
    },
    {
        question : "你认为事业与男性和女性有多大联系?",
        values : [
            "与男性有强烈联系",
            "与男性有中等联系",
            "与男性有一点联系",
            "男性女性联系一样",
            "与女性有一点联系",
            "与女性有中等联系",
            "与女性有强烈联系",
        ]
    },
    {
        question : "家庭对你有多重要?",
        values : [
            "极其重要",
            "非常重要",
            "比较重要",
            "不太重要",
            "很不重要",
        ]
    },
    {
        question : "学业对你有多重要?",
        values : [
            "极其重要",
            "非常重要",
            "比较重要",
            "不太重要",
            "很不重要",
        ]
    },
    {
        question : "你的姓氏是什么样的?",
        values : [
            "我父母使用相同姓氏，我也使用这个姓氏",
            "我父母使用不同姓氏，我用我父亲的姓氏",
            "我父母使用不同姓氏，我用我母亲的姓氏",
        ]
    },
    {
        question : "在你小时候，谁是你最主要的照顾者?",
        values : [
            "生母或养母",
            "生父或养父",
            "继母",
            "继父",
            "其他亲属",
            "其他",
        ]
    },
    {
        question : "在你小时候，这个人是否需要外出工作?",
        values : [
            "需要",
            "不需要"
        ]
    },
    {
        question : "你出生的时候的生理性别是什么?",
        values : [
            "男性",
            "女性"
        ]
    },
    {
        question : "你自我认同的性别是什么?",
        values : [
            "男性",
            "女性",
            "变性 (变完以后是男性)",
            "变性 (变完以后是女性)",
            "中性 / 不确定",
            "其他"
        ]
    }
] as const;
const SELECTION_ITERATOR = nextSelection();
const TEST_TRANSLATE = {
    "male" : "男性",
    "female" : "女性",
    "family" : "家庭",
    "career" : "事业",
    "Male1" : "男人",
    "Male2" : "他",
    "Male3" : "男生",
    "Male4" : "先生",
    "Male5" : "他的",
    "Male6" : "丈夫",
    "Male7" : "男",
    "Female1" : "女人",
    "Female2" : "她",
    "Female3" : "女生",
    "Female4" : "女士",
    "Female5" : "她的",
    "Female6" : "妻子",
    "Female7" : "女",
    "Family1" : "婚姻",
    "Family2" : "孩子",
    "Family3" : "化妆品",
    "Family4" : "家务",
    "Family5" : "发型",
    "Family6" : "手工",
    "Family7" : "厨房",
    "Career1" : "规划",
    "Career2" : "领导",
    "Career3" : "运动",
    "Career4" : "科学",
    "Career5" : "实验",
    "Career6" : "演讲",
    "Career7" : "编程"
} as const;

const TEST_RESULTS :{
    groups: readonly (string | [string, string])[];
    results: any[];
}[] = Array.from(Array(7), () => ({
    groups : [],
    results : []
}));

const SELECTION_RESULTS : number[] = [];

function generateProcess(){
    let { bindGroups } = TEST_DATA

    // randomly choose the order of the gender and career
    let firstPick = intRandom(0, 1)
    let secondPick = firstPick === 0 ? 1 : 0

    let firstGroup : FirstTwoGroups = bindGroups[firstPick]
    let secondGroup : FirstTwoGroups = bindGroups[secondPick]
    let fifthGroup : FifthGroup;
    let careerGroup : FifthGroup;

    if (bernoulliRandom(0.5)){
        if (firstGroup[0] !== "male"){
            // first group need to be reversed
            firstGroup = [firstGroup[1], firstGroup[0]]
        } else if (secondGroup[0] !== "male"){
            // second group need to be reversed.
            secondGroup = [secondGroup[1], secondGroup[0]]
        }
    }


    if (firstGroup[0] !== "male"){
        fifthGroup = [firstGroup[1], firstGroup[0]] as FifthGroup
        careerGroup = [...firstGroup]
    } else if (secondGroup[0] !== "male"){
        fifthGroup = [secondGroup[1], secondGroup[0]] as FifthGroup
        careerGroup = [...secondGroup]
    }

    let questionList : QuestionList = [];
    let groupList : GroupList = [];

    console.log(firstGroup, secondGroup, fifthGroup)

    questionList[0] = randomPickAndShuffle(TEST_TIMES[0], firstGroup)
    questionList[1] = randomPickAndShuffle(TEST_TIMES[1], secondGroup)
    questionList[2] = doubleRandomPickAndShuffle(TEST_TIMES[2], ["male", "female"], careerGroup)
    questionList[3] = doubleRandomPickAndShuffle(TEST_TIMES[3], ["male", "female"], careerGroup)
    questionList[4] = randomPickAndShuffle(TEST_TIMES[4], fifthGroup)
    questionList[5] = doubleRandomPickAndShuffle(TEST_TIMES[5], ["male", "female"], fifthGroup)
    questionList[6] = doubleRandomPickAndShuffle(TEST_TIMES[6], ["male", "female"], fifthGroup)

    groupList[0] = firstGroup;
    groupList[1] = secondGroup;
    groupList[2] = [["male", careerGroup[0]], ["female", careerGroup[1]]]
    groupList[3] = [["male", careerGroup[0]], ["female", careerGroup[1]]]
    groupList[4] = fifthGroup;
    groupList[5] = [["male", fifthGroup[0]], ["female", fifthGroup[1]]]
    groupList[6] = [["male", fifthGroup[0]], ["female", fifthGroup[1]]]

    return {
        questions : questionList,
        groups : groupList
    }
}

function *nextQuestion(){
    let currentGroupNumber = 0;
    let currentQuestionNumber = 0;
    let showInstruction = true;

    while (true){
        console.log("runned")

        if (showInstruction){
            yield {
                group : TEST_PROCESS["groups"][currentGroupNumber],
                question: TEST_PROCESS["questions"][currentGroupNumber][currentQuestionNumber],
                showInstruction,
                currentGroupNumber
            }
            showInstruction = false;
        }
        yield {
            group : TEST_PROCESS["groups"][currentGroupNumber],
            question: TEST_PROCESS["questions"][currentGroupNumber][currentQuestionNumber],
            showInstruction,
            currentGroupNumber
        }

        currentQuestionNumber += 1;

        if (currentQuestionNumber > TEST_TIMES[currentGroupNumber] - 1){
            currentGroupNumber += 1;
            currentQuestionNumber = 0
            showInstruction = true
        }
        if (currentGroupNumber > TEST_TIMES.length - 1){
            break
        }
    }

    return 0
}

function *nextSelection(){
    for (let selection of TEST_SELECTION_DATA){
        yield selection;
    }

    return 0;
}

function doubleRandomPickAndShuffle<
    FirstType extends TestCatagories,
    SecondType extends TestCatagories,
    ThirdType extends TestCatagories,
    FourthType extends TestCatagories,>
    (times: number, [firstType, secondType] : readonly [FirstType, SecondType],
     [thirdType, fourthType] : readonly [ThirdType, FourthType]){

    console.log(firstType, secondType, thirdType, fourthType)

    let firstGroupList = randomPickAndShuffle(Math.floor(times / 2), [firstType, secondType])
    let secondGroupList = randomPickAndShuffle(Math.floor(times / 2), [thirdType, fourthType])

    let returnList : {
        value: TypeWord<FirstType | SecondType | ThirdType | FourthType>,
        answer: "left" | "right",
        group: FirstType | SecondType | ThirdType | FourthType
    }[] = [];
    for (let i = 0; i < firstGroupList.length; i ++){
        returnList.push(firstGroupList[i], secondGroupList[i])
    }

    return returnList;
}

function randomPickAndShuffle<FirstType extends TestCatagories, SecondType extends TestCatagories>
    (times : number, [firstType, secondType] : readonly [FirstType, SecondType]){
    let eachPickTimes = Math.floor(times / 2);
    let returnList : {value: TypeWord<FirstType | SecondType>, answer: "left" | "right", group: FirstType | SecondType}[] = []

    for (let i = 0; i < eachPickTimes; i ++){
        let firstTypePick = randomPick<TypeWord<FirstType>>(TEST_DATA["groups"][firstType])
        let secondTypePick = randomPick<TypeWord<SecondType>>(TEST_DATA["groups"][secondType])

        returnList.push({
            value: firstTypePick,
            group: firstType,
            answer: "left"
        }, {
            value: secondTypePick,
            group: secondType,
            answer: "right"
        })
    }

    return shuffle(returnList);
}

function shuffle<Type>(_array: readonly Type[]): Type[]{
    let array = [..._array];

    for (let i = 0; i < array.length - 1; i ++){
        let swapIndex = intRandom(i + 1, array.length - 1)

        let temp = array[swapIndex];
        array[swapIndex] = array[i];
        array[i] = temp;
    }

    return array;
}

function randomPick<Type>(array: readonly Type[]): Type{
    return array[intRandom(0, array.length - 1)]
}

function bernoulliRandom(probability: number){
    return Math.random() < probability
}

function intRandom(min: number, max: number){
    return min + Math.floor(Math.random() * (max - min + 1))
}

function CategoriesElement({ value, index } : { value: string | [string, string], index: number }){
    const CLASSES = USE_CATEGORY_STYLE()

    return (<Grid item className = {
        index === 0 ? CLASSES.categoryLeft : CLASSES.categoryRight
    }>
        {
            typeof value === "string"
                ? (<Box color = { value === "male" || value === "female" ? "blue" : "green" }>
                    <Typography variant = "h6">
                        <b>{ TEST_TRANSLATE[value] }</b>
                    </Typography>
                </Box>)
                : (<>
                    <Box color = { value[0] === "male" || value[0] === "female" ? "blue" : "green" } component = "span" paddingRight = { 0.75 }>
                        <Typography variant = "h6" component = "span">
                            <b>{ TEST_TRANSLATE[value[0]] }</b>
                        </Typography>
                    </Box>
                    <Box color = { value[1] === "male" || value[1] === "female" ? "blue" : "green" } component = "span">
                        <Typography variant = "h6" component = "span">
                            <b>{ TEST_TRANSLATE[value[1]] }</b>
                        </Typography>
                    </Box>
                </>)
        }

        <Box textAlign = "center">{
            index === 0
                ? <Typography>请按<b>E</b></Typography>
                : <Typography>请按<b>I</b></Typography>
        }</Box>
    </Grid>)
}

function triggerDownload(content, filename) {
    // 创建隐藏的可下载链接
    var eleLink = document.createElement('a');
    eleLink.download = filename;
    eleLink.style.display = 'none';
    // 字符内容转变成blob地址
    var blob = new Blob([content]);
    eleLink.href = URL.createObjectURL(blob);
    // 触发点击
    document.body.appendChild(eleLink);
    eleLink.click();
    // 然后移除
    document.body.removeChild(eleLink);
};

function App(){
    function onStartTest(){
        setTestState("ongoing")
    }

    function onNextTest(){
        setTestState("selection")
    }

    function onEndTest(){
        setTestState("result")
    }

    const CLASSES = USE_APP_STYLE();
    let [testState, setTestState] = useState<TestState>("initial");


    let displayElement;

    if (testState === "initial"){
        displayElement = (<InitialPage onStartTest = { onStartTest }/>)
    } else if (testState === "ongoing"){
        displayElement = (<OnGoingPage onEndTest = { onNextTest } />)
    } else if (testState === "selection"){
        displayElement = (<SelectionPage onEndTest = { onEndTest }/>)
    } else if (testState === "result"){
        displayElement = (<ResultPage />)
    }

    return (<ThemeProvider theme = {APP_THEME}>
        <CssBaseline />
        <Container maxWidth = "sm" className = { CLASSES.container }>{
            displayElement
        }</Container>
    </ThemeProvider>)
}

function InitialPage({ onStartTest }){
    const TABLE_CLASSES = USE_TABLE_STYLE()
    return (<>
        <Typography paragraph>
            欢迎!在这项测试中，你将完成一项隐性联想测试(IAT)。这个测试被分为两部分。
        </Typography>
        <Typography paragraph>
            在第一部分中，你将使用键盘上的<b>E</b>键和<b>I</b>键来把以下词语分组。这是四个组和它们包括的词语：
        </Typography>
        <TableContainer className = { TABLE_CLASSES.tableContainer }>
            <Table size = "small">
                <TableHead>
                    <TableRow>
                        <TableCell className = { TABLE_CLASSES.tableHead }>类别</TableCell>
                        <TableCell className = { TABLE_CLASSES.tableHead }>词语</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>{
                    Object.keys(TEST_DATA.groups).map((value, index) => {
                        return (<TableRow key = { index }>
                            <TableCell component="th" scope="row">{
                                TEST_TRANSLATE[value]
                            }</TableCell>
                            <TableCell>{
                                TEST_DATA.groups[value].map((value) => TEST_TRANSLATE[value]).join(", ")
                            }</TableCell>
                        </TableRow>)
                    })
                }</TableBody>
            </Table>
        </TableContainer>
        <Typography paragraph>
            第一部分有包含7个子部分，每个子部分的指示都有所变化，请注意区分！
        </Typography>
        <Typography paragraph>
            第二部分包含一些关于态度和观点的问题。
            这项测试一共需要大约10分钟。感谢你的参与!
        </Typography>
        <Button color = "primary" variant = "contained" disableElevation onClick = { onStartTest }>
            开始第一部分的测试
        </Button>
    </>)
}

function SelectionPage({ onEndTest }){
    const [selection, setSelection] = useState(() => {
        return SELECTION_ITERATOR.next()
    })
    const [value, setValue] = useState(-1);
    const CLASSES = USE_SELECTION_STYLE()
    const THEME = useTheme()

    function handleChange(event){
        setValue(Number(event.target.value))
    }

    function handleSelect(){

        if (selection.done){
            onEndTest()
        } else {
            if (value >= 0){
                SELECTION_RESULTS.push(value)
                setValue(-1)
                setSelection(SELECTION_ITERATOR.next())
            }
        }

    }

    let selectionInfos = selection.value as Exclude<typeof selection.value, number>

    let cardContent;

    if (selection.done){
        cardContent = (<Box textAlign = "center" padding = { 2 }><Typography>
            测试已完成。
            <Button onClick = { handleSelect } color = "primary" variant = "contained" disableElevation>显示结果</Button>
        </Typography></Box>)
    } else {
        cardContent = (<>
            <CardContent><Box padding = { THEME.spacing(1, 2, 0) } marginBottom = { -1.5 }>
                <Grid container direction = "column">
                    <FormControl component="fieldset">
                        <Typography paragraph className = { CLASSES.selectionQuestion }>
                            <Box component = "span" fontWeight = "bold" fontSize = "1.15rem">{ selectionInfos.question }</Box>
                        </Typography>
                        <RadioGroup onChange = { handleChange } value = { value }>{
                            selectionInfos.values.map((value: string, index : number) => {
                                return (<FormControlLabel
                                            className = { CLASSES.radioLabel }
                                            value = { index } key = { index }
                                            control = { <Radio color = "primary" /> } label = { value } />)
                            })
                        }</RadioGroup>
                    </FormControl>
                </Grid>
            </Box></CardContent>
            <CardActions><Box padding = { THEME.spacing(0, 2, 2) } marginLeft = "auto">
                <Button onClick = { handleSelect } color = "primary" variant = "contained" disableElevation>下一题</Button>
            </Box></CardActions>
        </>)
    }

    return <Card variant = "outlined">
        { cardContent }
    </Card>
}

function OnGoingPage({ onEndTest }){
    const [questionAndGroup, setQuestionAndGroup] = useState(() => {
        //console.log("initiate call")
        return TEST_ITERATOR.next()
    })
    const [isError, setIsError] = useState(false)

    let startTime = new Date().getTime()
    let questionInfos = questionAndGroup.value as Exclude<typeof questionAndGroup.value, number>

    useEffect(() => {
        let update = (event) => {
            let code = event.code;

            if (!questionAndGroup.done){
                if (questionInfos.showInstruction){

                    if (code === "Space"){
                        setQuestionAndGroup(() => {
                            console.log("update call")
                            return TEST_ITERATOR.next()
                        })
                    } else {
                        console.log("NO CHANGE")
                    }
                } else {
                    if (code === "KeyE" && questionInfos.question.answer === "left" ||
                    code === "KeyI" && questionInfos.question.answer === "right"){

                        setQuestionAndGroup(() => {

                            console.log(new Date().getTime() - startTime)

                            TEST_RESULTS[questionInfos.currentGroupNumber].groups = questionInfos.group;
                            TEST_RESULTS[questionInfos.currentGroupNumber].results.push({
                                question : questionInfos.question.value,
                                time : new Date().getTime() - startTime,
                                isError : isError
                            })

                            setIsError(false)
                            return TEST_ITERATOR.next()
                        })
                    } else {
                        if (code === "KeyI" && questionInfos.question.answer === "left" ||
                        code === "KeyE" && questionInfos.question.answer === "right"){
                            setIsError(true)
                            console.log("ERROR")
                        } else {
                            console.log("MISTYPE")
                        }
                    }
                }
            } else {
                if (code === "Space"){
                    onEndTest()
                }
            }

            console.log(event);
        }

        document.addEventListener("keydown", update)

        return () => {
            document.removeEventListener("keydown", update)
        }
    })

    let cardContent;

    if (questionAndGroup.done){
        cardContent = <Box textAlign = "center" padding = { 2 } paddingBottom = { 1 }>
            <Typography>
                第一部分已完成。 <br />
                请按下空格键以开始第二部分测试。
            </Typography>
        </Box>
    } else {

        let instructionContent;
        if (questionInfos.showInstruction){
            if (questionInfos.currentGroupNumber === 0){
                instructionContent = (
                    <Box textAlign = "center">
                        <Typography>
                            左手按<b>E</b>，右手按<b>I</b>。 <br />
                            <b>E</b>代表<Box color = {
                                    questionInfos.group[0] === "male"
                                        ? "blue"
                                        : "green"
                                    }
                                    component = "span">
                                <b>{ TEST_TRANSLATE[questionInfos.group[0] as FirstTwoGroups[number]] }</b>
                            </Box>，
                            <b>I</b>代表<Box color = {
                                    questionInfos.group[1] === "female"
                                        ? "blue"
                                        : "green"
                                    }
                                    component = "span">
                                <b>{ TEST_TRANSLATE[questionInfos.group[1] as FirstTwoGroups[number]] }</b>
                            </Box>。 <br />
                            每次词语只会出现一次。<br />
                            如果你选错了，会看到一个红色的❌。<br />
                            按另一个选项测试会继续。<br />
                            请尽可能快地完成测试。<br />
                            按下空格键以开始这个部分的测试。
                        </Typography>
                    </Box>
                )
            } else if (questionInfos.currentGroupNumber === 1){
                instructionContent = (
                    <Box textAlign = "center">
                        <Typography>
                            <b>E</b>代表<Box color = {
                                    questionInfos.group[0] === "male"
                                        ? "blue"
                                        : "green"
                                    }
                                    component = "span">
                                <b>{ TEST_TRANSLATE[questionInfos.group[0] as FirstTwoGroups[number]] }</b>
                            </Box>，
                            <b>I</b>代表<Box color = {
                                    questionInfos.group[1] === "female"
                                        ? "blue"
                                        : "green"
                                    }
                                    component = "span">
                                <b>{ TEST_TRANSLATE[questionInfos.group[1] as FirstTwoGroups[number]] }</b>
                            </Box>。 <br />
                            请尽可能快地完成测试。<br />
                            按下空格键以开始这个部分的测试。
                        </Typography>
                    </Box>
                )
            } else if (questionInfos.currentGroupNumber === 2 || questionInfos.currentGroupNumber === 5){
                instructionContent = (<Box textAlign = "center">
                    <Typography>
                        <b>E</b>代表<Box color = {
                                questionInfos.group[0][0] === "male" || questionInfos.group[0][0] === "female"
                                    ? "blue"
                                    : "green"
                                }
                                component = "span">
                            <b>{ TEST_TRANSLATE[questionInfos.group[0][0]] }</b>
                        </Box> 和 <Box color = {
                                questionInfos.group[0][1] === "male" || questionInfos.group[0][1] === "female"
                                    ? "blue"
                                    : "green"
                                }
                                component = "span">
                            <b>{ TEST_TRANSLATE[questionInfos.group[0][1]] }</b>
                        </Box>，
                        <b>I</b>代表<Box color = {
                                questionInfos.group[1][0] === "male" || questionInfos.group[1][0] === "female"
                                    ? "blue"
                                    : "green"
                                }
                                component = "span">
                            <b>{ TEST_TRANSLATE[questionInfos.group[1][0]] }</b>
                        </Box> 和 <Box color = {
                                questionInfos.group[1][1] === "male" || questionInfos.group[1][1] === "female"
                                    ? "blue"
                                    : "green"
                                }
                                component = "span">
                            <b>{ TEST_TRANSLATE[questionInfos.group[1][1]] }</b>
                        </Box>。 <br />
                        请尽可能快地完成测试。<br />
                        按下空格键以开始这个部分的测试。
                    </Typography>
                </Box>)
            } else if (questionInfos.currentGroupNumber === 3 || questionInfos.currentGroupNumber === 6){
                instructionContent = (<Box textAlign = "center">
                    <Typography>
                        这和上一部分是一样的。 <br />
                        <b>E</b>代表<Box color = {
                                questionInfos.group[0][0] === "male" || questionInfos.group[0][0] === "female"
                                    ? "blue"
                                    : "green"
                                }
                                component = "span">
                            <b>{ TEST_TRANSLATE[questionInfos.group[0][0]] }</b>
                        </Box> 和 <Box color = {
                                questionInfos.group[0][1] === "male" || questionInfos.group[0][1] === "female"
                                    ? "blue"
                                    : "green"
                                }
                                component = "span">
                            <b>{ TEST_TRANSLATE[questionInfos.group[0][1]] }</b>
                        </Box>，
                        <b>I</b>代表<Box color = {
                                questionInfos.group[1][0] === "male" || questionInfos.group[1][0] === "female"
                                    ? "blue"
                                    : "green"
                                }
                                component = "span">
                            <b>{ TEST_TRANSLATE[questionInfos.group[1][0]] }</b>
                        </Box> 和 <Box color = {
                                questionInfos.group[1][1] === "male" || questionInfos.group[1][1] === "female"
                                    ? "blue"
                                    : "green"
                                }
                                component = "span">
                            <b>{ TEST_TRANSLATE[questionInfos.group[1][1]] }</b>
                        </Box>。 <br />
                        请尽可能快地完成测试。<br />
                        按下空格键以开始这个部分的测试。
                    </Typography>
                </Box>)
            } else if (questionInfos.currentGroupNumber === 4){
                instructionContent = (<Box textAlign = "center">
                    <Typography>
                        <b>注意！分组位置变了！</b> <br />
                        <b>E</b>代表<Box color = {
                                questionInfos.group[0] === "male"
                                    ? "blue"
                                    : "green"
                                }
                                component = "span">
                            <b>{ TEST_TRANSLATE[questionInfos.group[0] as FirstTwoGroups[number]] }</b>
                        </Box>，
                        <b>I</b>代表<Box color = {
                                questionInfos.group[1] === "female"
                                    ? "blue"
                                    : "green"
                                }
                                component = "span">
                            <b>{ TEST_TRANSLATE[questionInfos.group[1] as FirstTwoGroups[number]] }</b>
                        </Box>。 <br />
                        请尽可能快地完成测试。<br />
                        按下空格键以开始这个部分的测试。
                    </Typography>
                </Box>)
            }
        }


        cardContent = (<Box paddingX = { 0.5 }>
            <Grid container justify = "space-between">{
                questionInfos.group.map((value, index) => {
                    return <CategoriesElement key = { index } value = { value } index = { index } />
                })
            }</Grid>
            <Box paddingTop = { 3 } textAlign = "center">{
                questionInfos.showInstruction
                    ? instructionContent
                    : ( <Box color = {
                                questionInfos.question.group === "male" || questionInfos.question.group === "female"
                                    ? "blue"
                                    : "green"
                            }>
                            <Typography variant = "h6">
                                <b>{ TEST_TRANSLATE[questionInfos.question.value] }</b>
                            </Typography>
                        </Box>)
            }</Box>{
                isError
                    ? (<Box textAlign = "center" paddingTop = { 2 }>
                        <Typography variant = "h5">
                            ❌
                        </Typography>
                    </Box>)
                    : ""
            }
        </Box>)
    }

    return (<Card variant = "outlined">
        <CardContent>{
            cardContent
        }</CardContent>
    </Card>)
}

function ResultPage(){

    function downloadData(){
        let jsonObject = {
            firstPart : TEST_RESULTS.map((value) => {
                return {
                    groups : value.groups.map((group) => {
                        return typeof group === "string"
                            ? TEST_TRANSLATE[group]
                            : [TEST_TRANSLATE[group[0]],TEST_TRANSLATE[group[1]]]
                    }),
                    results : value.results.map((result) => {
                        return {
                            question : TEST_TRANSLATE[result.question],
                            time : result.time,
                            isError : result.isError
                        }
                    })
                }
            }),
            secondPart : SELECTION_RESULTS.map((selection, index) => {
                return {
                    question : TEST_SELECTION_DATA[index].question,
                    answer : TEST_SELECTION_DATA[index].values[selection]
                }
            })
        }

        triggerDownload(JSON.stringify(jsonObject), "questionnaire.json")
    }

    return (<TableContainer>
        <Typography variant = "h6" component = "div"><Box padding = { 1.5 } fontWeight = "700" textAlign = "center">第一部分</Box></Typography>
        <Table size = "small">
            <TableHead>
                <TableRow>
                    <TableCell><Typography variant = "subtitle1"><b>选项</b></Typography></TableCell>
                    <TableCell><Typography variant = "subtitle1"><b>花费时间</b></Typography></TableCell>
                    <TableCell><Typography variant = "subtitle1"><b>是否错误</b></Typography></TableCell>
                </TableRow>
            </TableHead>
            <TableBody>{
                TEST_RESULTS.map((value, index) => {

                    let resultList = value.results.map((result, resultIndex) => {
                        return <TableRow key = { `${index}_${resultIndex}`}>
                            <TableCell>{
                                TEST_TRANSLATE[result.question]
                            }</TableCell>
                            <TableCell>{
                                result.time / 1000
                            }</TableCell>
                            <TableCell>{
                                result.isError ? "是" : "否"
                            }</TableCell>
                        </TableRow>
                    })

                    resultList.unshift(<TableRow key = { index }>
                        <TableCell>{ value.groups.map((group, groupIndex) => {
                            return typeof group === "string"
                                ? (<Box key = { groupIndex } color = { group === "male" || group === "female" ? "blue" : "green" } component = "span" paddingRight = { 0.75 }>
                                    <Typography variant = "subtitle1" component = "span">
                                        <b>{ TEST_TRANSLATE[group] }</b>
                                    </Typography>
                                </Box>)
                                : (<React.Fragment key = { groupIndex } >
                                    <Box color = { group[0] === "male" || group[0] === "female" ? "blue" : "green" } component = "span" paddingRight = { 0.5 }>
                                        <Typography variant = "subtitle1" component = "span">
                                            <b>{ TEST_TRANSLATE[group[0]] }</b>
                                        </Typography>
                                    </Box>
                                    <Box component = "span" paddingRight = { 0.5 }>
                                        <Typography variant = "subtitle1" component = "span">
                                            <b>+</b>
                                        </Typography>
                                    </Box>
                                    <Box color = { group[1] === "male" || group[1] === "female" ? "blue" : "green" } component = "span" paddingRight = { 1 }>
                                        <Typography variant = "subtitle1" component = "span">
                                            <b>{ TEST_TRANSLATE[group[1]] }</b>
                                        </Typography>
                                    </Box>
                                </React.Fragment>)
                        }) } </TableCell>
                        <TableCell>{
                            value.results.reduce((prev, curr) => {
                                return { time : prev.time + curr.time }
                            }).time / 1000
                        }</TableCell>
                        <TableCell>N/A</TableCell>
                    </TableRow>)

                    return resultList
                })
            }</TableBody>
        </Table>
        <Typography variant = "h6" component = "div"><Box padding = { 1.5 } paddingTop = { 7 } fontWeight = "700" textAlign = "center">第二部分</Box></Typography>
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell><Typography variant = "subtitle1"><b>问题</b></Typography></TableCell>
                    <TableCell><Typography variant = "subtitle1"><b>选项</b></Typography></TableCell>
                </TableRow>
            </TableHead>
            <TableBody>{
                SELECTION_RESULTS.map((value, index) => {
                    return (<TableRow key = { index }>
                        <TableCell>{ TEST_SELECTION_DATA[index].question }</TableCell>
                        <TableCell>{ TEST_SELECTION_DATA[index].values[value] }</TableCell>
                    </TableRow>)
                })
            }</TableBody>
        </Table>
        <Box padding = { 2 } paddingTop = { 5 }>
            <Grid container justify = "center">
                <Grid item>
                    <Button size = "large" disableElevation variant = "contained" color = "primary" onClick = { downloadData }>下载测试数据</Button>
                </Grid>
            </Grid>
        </Box>
    </TableContainer>)
}

window.onload = () => {
    main()
}

//@ts-ignore
window.generateProcess = generateProcess
//@ts-ignore
window.nextQuestion = nextQuestion;

type TestState = "initial" | "ongoing" | "selection" | "result"
type TestCatagories = "male" | "female" | "career" | "family"
type TypeWord<Type extends TestCatagories> = typeof TEST_DATA["groups"][Type][number]
type FirstTwoGroups = readonly ["male", "female"] | readonly ["career", "family"] | readonly ["family", "career"]
type FifthGroup = readonly ["career", "family"] | readonly ["family", "career"]
type QuestionList = {
    value: typeof TEST_DATA["groups"][TestCatagories][number],
    answer: "left" | "right",
    group : TestCatagories
}[][]

type GroupList = [
    [FirstTwoGroups[0], FirstTwoGroups[0]],
    [FirstTwoGroups[1], FirstTwoGroups[1]]
][] | FirstTwoGroups[]