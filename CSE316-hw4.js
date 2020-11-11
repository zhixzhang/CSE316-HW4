var mysql=require("mysql");
var con=mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "qqQ12138",
    database: "hw4_database"
});

const express=require("express");
const app=express();
const url=require('url');
//const { SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS } = require("constants");

app.get("/",(req, res) => {
    writeSearch(req,res);
});

app.get("/schedule",  (req, res) => {
    writeSchedule(req, res);
});

port = process.env.PORT || 3000;
app.listen(port, ()=>{
    console.log("server started");
});

function writeSearch (req, res){
    res.writeHead(200, {"content-Type":"text/html"});
    let query =url.parse(req.url, true).query;
    let search = query.search ? query.search : "";
    let filter = query.filter ? query.filter : "";
    let html=
`<!DOCTYPE html>
<html lang="en">
<head>
    <title> Spring 2021 CSE Class Find</title>
</head>
<body>
    <h1> Spring 2021 CSE Class Find </h1><br>
    <form method="get" action="/">
        <input type="text" name="search" value="">
        <b>in</b>
        <select name="filter">
            <option value="allFields">All Fields</option>
            <option value="courseName">Course Title</option>
            <option value="courseNum">Course Num</option>
            <option value="instructor">Instructor</option>
            <option value="day">Day</option>
            <option value="time">Time</option>
        </select>
        <input type="submit" value="Submit">
        <br>
        Example searches: 316, fodor, 2:30 PM, MW
    </form>
    <br><br>
`;
let sql="SELECT * FROM cse_courses;";

//sql to search all columns
if (filter == "allFields")
    sql=`SELECT * FROM cse_courses
    WHERE Subj   Like '%`+search+`%' OR
        CRS  Like '%`+search+`%' OR
        Title   Like '%`+search+`%' OR
        Cmp   Like '%`+search+`%' OR
        Sctn   Like '%`+search+`%' OR
        DAYS   Like '%`+search+`%' OR
        START_Time   Like '%`+search+`%' OR
        END_Time   Like '%`+search+`%' OR
        Mtg_Start_Date   Like '%`+search+`%' OR
        Mtg_End_Date    Like '%`+search+`%' OR
        Duration   Like '%`+search+`%' OR
        Instruction   Like '%`+search+`%' OR
        Building   Like '%`+search+`%' OR
        Room   Like '%`+search+`%' OR
        Instr_Name   Like '%`+search+`%' OR
        Enrollment_Capacity   Like '%`+search+`%' OR
        Waitlist_Capacity  Like '%`+search+`%' OR
        Cmbnd_Descr   Like '%`+search+`%' OR
        Cmbnd_Enr   Like '%`+search+`%';
        `;
    // sql to search course numbers
    else if (filter == "courseNum")
        sql = `SELECT * FROM cse_courses
            WHERE CRS Like '%`+search+`%';`;

    // sql to search course names
    else if (filter == "courseName")
        sql = `SELECT * FROM cse_courses
            WHERE Title LIKE '%`+search+`%';`;    
    // sql to search instructors
    else if (filter == "instructor")
        sql = `SELECT * FROM cse_courses
            WHERE Instr_Name LIKE '%`+search+`%';`;  
    // sql to search days
    else if (filter == "day")
        sql = `SELECT * FROM cse_courses
            WHERE DAYS LIKE '%`+search+`%';`;

    else if (filter == "time")
        sql = `SELECT * FROM cse_courses
            WHERE START_Time LIKE '%`+search+`%' OR
                    END_Time LIKE '%`+search+`%,;`;

    con.query(sql, function(err, result){
        if (err) throw err;
        for (let item of result){
            html+=`
            <button tpye="button" class="toggle"> CSE ` +item.CRS+` - `+item.Title+` - `+item.Cmp
            +` - Section ` + item.Section+`</button>
            <pre>
            Days: `+item.DAYS+ `
            Start Time: `+item.START_Time+`
            End Time: `+item.END_Time+`
            Duration: `+item.Duration+`
            Instruction Mode: `+item.Instruction+`
            Building: `+item.Building+`
            Room: `+item.Room+`
            Instructor: `+item.Instr_Name+`
            Enrollment Cap: `+item.Enrl_Capacity+`
            Wait Cap: `+item.Waitlist_Capacity+`
            Combined Description: `+item.Cmbnd_Descr+`
            Combined Enrollment: `+item.Cmbnd_Enr+`<form action="/schedule" method="get">
            <button name="add" value="`+item.id+`"> Add Class </button></form></pre>`;
        }
        res.write(html+"\n\n</body>\n</html>");
        res.end();
    });
};
function writeSchedule(req,res){
    let query=url.parse(req.url, true).query;
    let addQuery=`INSERT INTO saved SELECT * FROM cse_courses WHERE cse_courses.id="`+query.add+`";`
    
    let html=`
<!DOCTYPE html>
<html>
<head>
    <title> Schedule </title>
    <style type=text/css>
        table, tr, th, td{
            border: 1px solid black;
            height: 50px;
            vertical-align: bottom;
            padding: 15px;
            text-align: left;
        }
    </style>
</head>
<body>
    <h1> Schedule </h1><br>
    <a href="/"><b>Return to Search</b></a>
    <br><br>
    <table>
        <tr>
            <th> Mon </th>
            <th> Tue </th>
            <th> Wed </th>
            <th> Thu </th>
            <th> Fri </th>
        </tr>
        <tr>
            <td> Mon </td>
            <td> Tue </td>
            <td> Wed </td>
            <td> Thu </td>
            <td> Fri </td>
        </tr>
    </table>
</body>
</html>`;

con.query(addQuery, function(err, result){
    if (err) console.log(err);
    con.query(constructSQLDayCommand("M"), function(err, result){
        if (err) throw err;
        html=html.replace("<td> Mon </td>", getDay(result, "MON"));
        con.query(constructSQLDayCommand("TU"), function(err, result){
            if (err) throw err;
            html=html.replace("<td> Tue </td>", getDay(result, "TUE"));
            con.query(constructSQLDayCommand("W"), function(err, result){
                if (err) throw err;
                html=html.replace("<td> Wed </td>", getDay(result, "WED"));
                con.query(constructSQLDayCommand("TH"), function(err, result){
                    if (err) throw err;
                    html=html.replace("<td> Thu </td>", getDay(result, "THU"));
                    con.query(constructSQLDayCommand("F"), function(err, result){
                        if (err) throw err;
                        html=html.replace("<td> Fri </td>", getDay(result, "FRI"));
                        res.write(html+"\n\n</body>\n</html>");
                    });
                });
            });
        });
    });
});
}
function getDay(SQLResult, tableHeader){
    let retStr="<td>";
    for (let item of SQLResult){
        retStr+= "\n   <b> " + item.START_Time+" - "+
        item.END_Time+" <br><br>"+item.Subj+" "+item.CRS+"-"+
        item.Sctn+"</b> <p>"+
        item.Title+"<br><br>"+item.Instr_Name+"<br><br>"+"<br/><br/>";
    }
    return retStr + "</td>";
}
function constructSQLDayCommand(search){
    var sql=`SELECT * FROM saved
            WHERE Days          LIKE '%`+search+`%'
            ORDER BY START_Time;`;
    return sql;
};