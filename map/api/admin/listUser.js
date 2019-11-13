var session = require('express-session');
var pg = require('pg');
var config = require("../../config");
var connectionString = config.postgres;

var checkList_permission=function (req,res){
    var userType=req.session.permission;
    var user_org_id=req.session.org_id;
    var user_org_name=req.session.org_name;
    var user_org_level=req.session.org_level;
    switch (userType){
        case 3:
        list_all_user(req,res)
        break
        case 2:
        check_city_list(req,res,userType,user_org_id,user_org_name,user_org_level)
        break
        case 1:
        break
    }

}

var list_all_user=function (req,res){
    //管理者可以檢查所有人
    var strSql = 'SELECT * FROM users;';
    sql_list_user(req,res,strSql);
}


var list_user_by_user_TYPE_ID=function (req,res,userType,user_org_id){
    //單位為疾病管制署的決策管理人員 where條件為同單位下的一般使用者 或是 其他所有單位的人
    var strSql = 'SELECT * '+
                 'FROM  users left OUTER JOIN user_organization on users."ORGANIZATION_ID"=user_organization."ORGANIZATION_ID" '+
                 'where ( users."ORGANIZATION_ID"=\''+user_org_id+'\' and "USER_TYPE_ID" < \''+userType+'\') '+
                   ' or (users."ORGANIZATION_ID">\'1\' and "ORGANIZATION_LEVEL">=\'2\')'+
                   'or users."USER_ID"=\''+req.session.userid+'\';';
    sql_list_user(req,res,strSql);
}


var sql_list_user=function (req,res,sql_string_2){
    var pgString = connectionString + config.db.cdczonegis;
    var pgClient = new pg.Client(pgString);
    pgClient.connect();
    pgClient.query(sql_string_2, function(err, row) {
        pgClient.end();
        if (err) {
            res.send([]);
        } else {
            if (row.rowCount > 0) {
                res.send(row.rows);
            } else {
                res.send([]);
            }
        }
        console.log(row.rows)
     })
}


//userType,user_org_id,user_org_name,user_org_level
function check_city_list(req,res,userType,user_org_id,user_org_name,user_org_level){
    var sql_string='select "ORGANIZATION_ID","CITY","DIST","ORGANIZATION_LEVEL" from user_organization where "ORGANIZATION_NAME"=$1;';
    var sql_value=[user_org_name];
    var pgString = connectionString + config.db.cdczonegis;
    var pgClient = new pg.Client(pgString);
    pgClient.connect();
    pgClient.query(sql_string,sql_value, function(err, row) {
        
        var result=row.rows[0];
        if(result.ORGANIZATION_ID==0||result.ORGANIZATION_ID==1){
            list_user_by_user_TYPE_ID(req,res,userType,user_org_id)
            //list_all_user(req,res)
        }else{
            result.CITY=result.CITY.split(",");
            var sql_string_2=""
            var where_str="";
            switch (result.ORGANIZATION_LEVEL){
                case 2://有多個CITY
                for (var i=0;i<result.CITY.length;i++ ){
                    where_str=where_str+"or user_organization.\"CITY\"='"+result.CITY[i]+"'";
                }
                where_str=where_str.replace(/or/," ");
                // ("ORGANIZATION_ID"=\''+user_org_id+'\' and USER_TYPE_ID" < \''+userType+'\') '
                where_str=' where ( users."ORGANIZATION_ID"=\''+user_org_id+'\' and "USER_TYPE_ID" < \''+userType+'\') or ( '+where_str
                sql_string_2='select users.*, user_organization."ORGANIZATION_LEVEL",user_organization."DIST",user_organization."CITY"'+ 
                             'from users left OUTER JOIN user_organization on users."ORGANIZATION_ID"=user_organization."ORGANIZATION_ID"' +
                              where_str + " ) and user_organization.\"ORGANIZATION_LEVEL\">=2 or users.\"USER_ID\"='"+req.session.userid+"';";
                console.log(sql_string_2)
                sql_list_user(req,res,sql_string_2)
                break
                case 3:
                where_str='( users."ORGANIZATION_ID"=\''+user_org_id+'\' and "USER_TYPE_ID" < \''+userType+'\') '+
                       'or ( user_organization."CITY"=\''+result.CITY[0]+'\' and user_organization."ORGANIZATION_LEVEL">3 )'+
                       'or ( users."USER_ID"=\''+req.session.userid+'\') ;';
                sql_string_2='select users.*, user_organization."ORGANIZATION_LEVEL",user_organization."DIST",user_organization."CITY"'+ 
                             'from users left OUTER JOIN user_organization on users."ORGANIZATION_ID"=user_organization."ORGANIZATION_ID"' + 
                             'where '+where_str;
                console.log(sql_string_2)
                sql_list_user(req,res,sql_string_2)
                
                break
                case 4:
                where_str='( users."ORGANIZATION_ID"=\''+user_org_id+'\' and "USER_TYPE_ID" < \''+userType+'\') '+
                       //'or ( user_organization."DIST"=\''+result.DIST+'\' and user_organization."ORGANIZATION_LEVEL"=4 and  )'+
                       'or ( users."USER_ID"=\''+req.session.userid+'\') ;';
                sql_string_2='select users.*, user_organization."ORGANIZATION_LEVEL",user_organization."DIST",user_organization."CITY"'+ 
                             'from users left OUTER JOIN user_organization on users."ORGANIZATION_ID"=user_organization."ORGANIZATION_ID"' + 
                             'where '+where_str;
                console.log(sql_string_2)
                sql_list_user(req,res,sql_string_2)
                break
            }
        }


    })
}

module.exports = { checkList_permission,list_all_user,list_user_by_user_TYPE_ID,sql_list_user,check_city_list};