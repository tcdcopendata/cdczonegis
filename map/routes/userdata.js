var express = require('express');
var fs = require('fs');
var spawn  = require('child_process').spawn;
var pg = require("pg");
var path = require("path");
var router = express.Router();
var formidable = require('formidable');
var rimraf = require('rimraf');
var json2csv = require('json2csv');
var streams = require('memory-streams');
var langZhtw = require('../public/language/map/zh-tw');
var langEn = require('../public/language/map/en');
var connectString = require("../config").postgres;
//bookmark-寫入PG
router.post("/bookmark_data", function(req, res, next) {
		data = req.body;
		username = req.session.username;
		if(username){
		connectPostgres('cdczonegis',`INSERT INTO public.bookmark("user",name,layer,year,bbox) VALUES('${username}','${data.name}','${data.layer}','${data.year}','${data.bbox}');`, '',
	    function (result) {
			res.end();
		});}else{res.end('false');}
});

//刪除bookmark-PG
router.post("/delbmlist", function(req, res, next) {
	data = req.body;
	username = req.session.username;
	connectPostgres('cdczonegis',`DELETE FROM public.bookmark where "user" = '${username}' and name = '${data.name}' and bbox = '${data.bbox}' and year = '${data.year}';`, '',
	function (result) {
		res.end();
	});
});
//bookmark列表
router.get("/bmlist", function(req, res, next) {
		username = req.session.username;
		connectPostgres('cdczonegis',`SELECT name,layer,year,bbox FROM public.bookmark WHERE "user" = '${username}' `, '',
			function(result) {
				data = result.rows;
				res.writeHead(200, {
					'Content-Type': 'application/json; charset=utf-8'
				});
				res.end(JSON.stringify({
					data: data
				}), 'utf-8');
			});
});
//框選列表
router.post("/datalist", function(req, res, next) {
	var final=[];
	bbox = req.body.bbox.split(',');
	bboxstring="";
	for(var i=0;i<bbox.length;i+=2){
		if(i==0){bboxstring=`(${bbox[i]},${bbox[i+1]})`}
		else{bboxstring=bboxstring+`,(${bbox[i]},${bbox[i+1]})`}
	}
	if(bbox.length==4){bboxstring = `box'(${bboxstring})'`}
	else{bboxstring = `polygon'(${bboxstring})'`}
  //connectPostgres('cdczonegis',`SELECT bucket_id FROM public.bucket where box'((${bbox[0]},${bbox[1]}),(${bbox[2]},${bbox[3]}))' @> "position" ;`, '',
	connectPostgres('cdczonegis',`SELECT bucket_id FROM public.bucket where ${bboxstring} @> "position" ;`, '',
	function (result) {
		var id='';
		result.rows.forEach(function(e){
			if(id==''){id="'"+e.bucket_id+"'"}
			else{id+=",'"+e.bucket_id+"'"}
		})
		if(id=='')id="'"+1+"'";
		connectPostgres('cdczonegis',`SELECT bucket_id, country, town, investigate_date
		FROM public.bucket_record where investigate_date in(select max(investigate_date) As investigate_date from public.bucket_record group by bucket_id) and bucket_id in (${id});`, '',
		function(result) {
			var data = result.rows;
			final.push(data);
			connectPostgres('cdczonegis',`SELECT "REPORT", "RESIDENCE_COUNTY_NAME", "RESIDENCE_TOWN_NAME", "GENDER_DESC", "SICK_DATE", "SICK_AGE"
			FROM public.dws_report_dengue_gis
			where ${bboxstring} @> point ("LON", "LAT") ;`, '',
		  //where box'((${bbox[0]},${bbox[1]}),(${bbox[2]},${bbox[3]}))' @> point ("LON", "LAT") ;`, '',
			function(result) {
				var data = result.rows;
				final.push(data);
				res.writeHead(200, {
					'Content-Type': 'application/json; charset=utf-8'
				});
				res.end(JSON.stringify({
					data: final
				}), 'utf-8');
			});
		});		
	});
});
//時間軸資料抓取
router.post("/bar_data", function(req, res, next) {
	data = req.body;
	if(data.yeartwo == 12){data.yeartwo = `12-31`}
	else{data.yeartwo = `${Number(data.yeartwo)+1}-1`}
	connectPostgres('cdczonegis',`SELECT "SICK_DATE","LON", "LAT"
	FROM public.dws_report_dengue_gis where "SICK_DATE" >= '2017-${data.yearone}-1' and "SICK_DATE" < '2017-${data.yeartwo}' order by "SICK_DATE";`, '',
		function(result) {
			data = result.rows;
			res.writeHead(200, {
				'Content-Type': 'application/json; charset=utf-8'
			});
			res.end(JSON.stringify({
				data: data
			}), 'utf-8');
		});
});

//錄影功能
router.post("/record", function (req, res, next) {
	var form = new formidable.IncomingForm();
	//解formdata大小
	form.maxFieldsSize = 200 * 1024 * 1024;
	form.parse(req, function (err, fields, files) {
		var time = new Date().getTime();
		var path = `./recordImg/${time}`;
		var outpath = `${path}/video.mp4`;
		if (!fs.existsSync(path)) {
			fs.mkdirSync(path);
		}
		var tem = [];
		for (var o in fields) {
			var base64Data = fields[o].replace(/^data:image\/png;base64,/, "");
			tem.push(filePromise(`${path}/${o}.png`, base64Data, "base64"));
		}
		Promise.all(tem).then(function (val) {
			var ffmpeg = `-r 1 -i ${path}/%d.png -b:v 1024k -vcodec libx264 -filter:v scale=w=1920:h=trunc(ow/a/2)*2 -f mp4 -pix_fmt yuv420p -y ${outpath}`;
			var ls = spawn('ffmpeg', ffmpeg.split(' '));

			// ls.stdout.on("data", data => {
			// 	console.log("data", data.toString())
			// });

			// ls.stderr.on('data', (data) => {
			// 	console.log("error", data.toString())
			// });

			ls.on('close', (code) => {
			console.log(`child process exited with code ${code}`);
				var v = fs.readFile(outpath, "base64", function (err, data) {
					rimraf(path, function (val) {
						console.error(val)
					})
					res.send(data);
				});
			});
		});
	});
});

//產圖表資料
router.get("/getSickDate", function(req, res, next){

	var this_year = parseInt(req.query.year),
		last_year = this_year - 1,
		next_year = this_year + 1;

	var first_day_week = req.query.first_day_week;
	var last_day_week = req.query.last_day_week;
	var type = req.query.type;

	var con_first_week_52or53 = `( date_part('year',"SICK_DATE") =  ${this_year} AND date_part('week',"SICK_DATE") =  ${first_day_week} AND date_part('month',"SICK_DATE") = 1)`;
	 
	var con_last_week_1 = `( date_part('year',"SICK_DATE") =  ${this_year} AND date_part('week',"SICK_DATE") =  ${last_day_week} AND date_part('month',"SICK_DATE") = 12 )`;

	var con_whole_week = ` ( date_part('year',"SICK_DATE") =  ${this_year} AND  date_part('week',"SICK_DATE") BETWEEN 2 AND 51 ) OR 
						   ( date_part('year',"SICK_DATE") =  ${this_year} AND  date_part('week',"SICK_DATE") = 1 AND date_part('month',"SICK_DATE") = 1) OR
						   ( date_part('year',"SICK_DATE") =  ${this_year} AND  date_part('week',"SICK_DATE") = 52 AND date_part('month',"SICK_DATE") = 12) OR
						   ( date_part('year',"SICK_DATE") =  ${this_year} AND  date_part('week',"SICK_DATE") = 53 AND date_part('month',"SICK_DATE") = 12)` ;

	var final_results = [];

	if(first_day_week == 52 && last_day_week == 1)
	{	
		var conList = [con_first_week_52or53, con_last_week_1,	con_whole_week];
		var results = getqueryResult(conList);

		Promise.all(results).then(function(data){

				data.forEach((ele,ind)=>{
					if(ele != null)
					{
						if(ind == 0)
						{
							ele[0]['week'] = 1;
							final_results.push(ele[0]);
						}
						else if(ind == 1)
						{
							ele[0]['week'] = 54;
							final_results.push(ele[0]);
						
						}
						else if(ind == 2)
						{
							ele.forEach((e,i)=>{
								ele[i]['week'] = ele[i]['week'] + 1;
								final_results.push(ele[i]);
							})
						}
					}
				}) 

				return final_results;
			}
		).then(function(){
			if(type == "CSV_file")
			{
				sendCSV(final_results, res)
				return;
			}

			res.writeHead(200, {
				'Content-Type': 'application/json; charset=utf-8'
			});
			res.end(JSON.stringify(final_results));
		})
	}
	else if((first_day_week == 52 || first_day_week == 53) && last_day_week == 52)
	{
		var conList =[con_first_week_52or53, con_whole_week];
		var results = getqueryResult(conList);
		
		Promise.all(results).then(function(data){
			
				data.forEach((ele,ind)=>{
					if(ele != null)
					{
						if(ind == 0)
						{
							ele[0]['week'] = 1;
							final_results.push(ele[0]);
						}
						else if(ind == 1 )
						{
							ele.forEach((e,i)=>{
								ele[i]['week'] = ele[i]['week'] + 1;
								final_results.push(ele[i]);
							})
						}
					}
				}) 

				return final_results;
			}
		).then(function(){
			if(type == "CSV_file")
			{
				sendCSV(final_results, res)
				return;
			}

			res.writeHead(200, {
				'Content-Type': 'application/json; charset=utf-8'
			});
			res.end(JSON.stringify(final_results));
		})
	}
	else if(first_day_week == 1 && last_day_week == 1)
	{
		var conList =[con_last_week_1, con_whole_week];
		var results = getqueryResult(conList);

		Promise.all(results).then(function(data){

				data.forEach((ele,ind)=>{
					if(ele != null)
					{
						if(ind == 0)
						{
							ele[0]['week'] = 53;
							final_results.push(ele[0]);
						}
						else if(ind == 1)
						{
							ele.forEach((e,i)=>{
								final_results.push(ele[i]);
							})
						}
					}
				}) 
			
				return final_results;
			}
		).then(function(){
			if(type == "CSV_file")
			{
				sendCSV(final_results, res)
				return;
			}

			res.writeHead(200, {
				'Content-Type': 'application/json; charset=utf-8'
			});
			res.end(JSON.stringify(final_results));
		})
	}
	else if(first_day_week == 1 && (last_day_week == 52 || last_day_week == 53))
	{
		var conList =[con_whole_week];
		var results = getqueryResult(conList);
		
		Promise.all(results).then(function(data){

				data.forEach((ele,ind)=>{
					if(ele != null)
					{
						if(ind == 0)
						{
							ele.forEach((e,i)=>{
								final_results.push(ele[i]);
							})
						}
					}
				}) 

				return final_results;
			}
		).then(function(){
			if(type == "CSV_file")
			{
				sendCSV(final_results, res)
				return;
			}

			res.writeHead(200, {
				'Content-Type': 'application/json; charset=utf-8'
			});
			res.end(JSON.stringify(final_results));
		})
	}

	function getqueryResult(){
		
	   return conList.map(function(conString) {
			   var queryString = getqueryString(conString);
	
			   return new Promise(function (resolve, reject) {
				   connectPostgres('cdczonegis', queryString , '',
					   function(result) {
						   if(result.rowCount != 0)
								resolve(result.rows);
						   else
						   		resolve(null);
					   }
				   );
			   })
	   })
	}
	
	function getqueryString(conString){
		
	   var queryString = `SELECT count(*),EXTRACT(week FROM "SICK_DATE") "week"
						  FROM public.dws_report_dengue_gis 
						  WHERE ${conString}
						  GROUP BY "week"
						  ORDER BY "week" ASC;`
	
	   return queryString
	}
})

router.get("/getControlLocation", function(req, res, next){
	
	var this_year = parseInt(req.query.year),
		last_year = this_year - 1,
		next_year = this_year + 1;

	var first_day_week = req.query.first_day_week;
	var last_day_week = req.query.last_day_week;
	var type = req.query.type;

	var con_first_week_52or53 = `( date_part('year',"Case_Date") =  ${this_year} AND date_part('week',"Case_Date") =  ${first_day_week} AND date_part('month',"Case_Date") = 1)`;
		
	var con_last_week_1 = `( date_part('year',"Case_Date") =  ${this_year} AND date_part('week',"Case_Date") =  ${last_day_week} AND date_part('month',"Case_Date") = 12 )`;

	var con_whole_week = ` ( date_part('year',"Case_Date") =  ${this_year} AND  date_part('week',"Case_Date") BETWEEN 2 AND 51 ) OR 
							( date_part('year',"Case_Date") =  ${this_year} AND  date_part('week',"Case_Date") = 1 AND date_part('month',"Case_Date") = 1) OR
							( date_part('year',"Case_Date") =  ${this_year} AND  date_part('week',"Case_Date") = 52 AND date_part('month',"Case_Date") = 12) OR
							( date_part('year',"Case_Date") =  ${this_year} AND  date_part('week',"Case_Date") = 53 AND date_part('month',"Case_Date") = 12)` ;

	var final_results = [];

	if(first_day_week == 52 && last_day_week == 1)
	{	
		var conList = [con_first_week_52or53, con_last_week_1,	con_whole_week];
		var results = getqueryResult(conList);

		Promise.all(results).then(function(data){

				data.forEach((ele,ind)=>{
					if(ele != null)
					{
						if(ind == 0)
						{
							ele[0]['week'] = 1;
							final_results.push(ele[0]);
						}
						else if(ind == 1)
						{
							ele[0]['week'] = 54;
							final_results.push(ele[0]);
						
						}
						else if(ind == 2)
						{
							ele.forEach((e,i)=>{
								ele[i]['week'] = ele[i]['week'] + 1;
								final_results.push(ele[i]);
							})
						}
					}
				}) 

				return final_results;
			}
		).then(function(){
			if(type == "CSV_file")
			{
				sendCSV(final_results, res);
				return;
			}

			res.writeHead(200, {
				'Content-Type': 'application/json; charset=utf-8'
			});
			res.end(JSON.stringify(final_results));
		})
	}
	else if((first_day_week == 52 || first_day_week == 53) && last_day_week == 52)
	{
		var conList =[con_first_week_52or53, con_whole_week];
		var results = getqueryResult(conList);
		
		Promise.all(results).then(function(data){
			
				data.forEach((ele,ind)=>{
					if(ele != null)
					{
						if(ind == 0)
						{
							ele[0]['week'] = 1;
							final_results.push(ele[0]);
						}
						else if(ind == 1 )
						{
							ele.forEach((e,i)=>{
								ele[i]['week'] = ele[i]['week'] + 1;
								final_results.push(ele[i]);
							})
						}
					}
				}) 

				return final_results;
			}
		).then(function(){
			if(type == "CSV_file")
			{
				sendCSV(final_results, res)
				return;
			}

			res.writeHead(200, {
				'Content-Type': 'application/json; charset=utf-8'
			});
			res.end(JSON.stringify(final_results));
		})
	}
	else if(first_day_week == 1 && last_day_week == 1)
	{
		var conList =[con_last_week_1, con_whole_week];
		var results = getqueryResult(conList);

		Promise.all(results).then(function(data){

				data.forEach((ele,ind)=>{
					if(ele != null)
					{
						if(ind == 0)
						{
							ele[0]['week'] = 53;
							final_results.push(ele[0]);
						}
						else if(ind == 1)
						{
							ele.forEach((e,i)=>{
								final_results.push(ele[i]);
							})
						}
					}
				}) 
			
				return final_results;
			}
		).then(function(){
			if(type == "CSV_file")
			{
				sendCSV(final_results, res)
				return;
			}

			res.writeHead(200, {
				'Content-Type': 'application/json; charset=utf-8'
			});
			res.end(JSON.stringify(final_results));
		})
	}
	else if(first_day_week == 1 && (last_day_week == 52 || last_day_week == 53))
	{
		var conList =[con_whole_week];
		var results = getqueryResult(conList);
		
		Promise.all(results).then(function(data){

				data.forEach((ele,ind)=>{
					if(ele != null)
					{
						if(ind == 0)
						{
							ele.forEach((e,i)=>{
								final_results.push(ele[i]);
							})
						}
					}
				}) 

				return final_results;
			}
		).then(function(){
			if(type == "CSV_file")
			{
				sendCSV(final_results, res)
				return;
			}

			res.writeHead(200, {
				'Content-Type': 'application/json; charset=utf-8'
			});
			res.end(JSON.stringify(final_results));
		})
	}

	function getqueryResult(){
		
		return conList.map(function(conString) {
				var queryString = getqueryString(conString);
	
				return new Promise(function (resolve, reject) {
					connectPostgres('cdczonegis', queryString , '',
						function(result) {
							if(result.rowCount != 0)
								resolve(result.rows);
							else
								resolve(null);
						}
					);
				})
		})
	}
	
	function getqueryString(conString){
		
		var queryString = `SELECT count(*),EXTRACT(week FROM "Case_Date") "week"
							FROM public.icp_mosquito_breeding
							WHERE ${conString}
							GROUP BY "week"
							ORDER BY "week" ASC;`
	
		return queryString
	}
})

router.get("/getBucket", function(req, res, next){
	
	var this_year = parseInt(req.query.year),
		last_year = this_year - 1,
		next_year = this_year + 1;

	var first_day_week = req.query.first_day_week;
	var last_day_week = req.query.last_day_week;
	var type = req.query.type;

	var con_first_week_52or53 = `( date_part('year',"investigate_date") =  ${this_year} AND date_part('week',"investigate_date") =  ${first_day_week} AND date_part('month',"investigate_date") = 1)`;
		
	var con_last_week_1 = `( date_part('year',"investigate_date") =  ${this_year} AND date_part('week',"investigate_date") =  ${last_day_week} AND date_part('month',"investigate_date") = 12 )`;

	var con_whole_week = ` ( date_part('year',"investigate_date") =  ${this_year} AND  date_part('week',"investigate_date") BETWEEN 2 AND 51 ) OR 
							( date_part('year',"investigate_date") =  ${this_year} AND  date_part('week',"investigate_date") = 1 AND date_part('month',"investigate_date") = 1) OR
							( date_part('year',"investigate_date") =  ${this_year} AND  date_part('week',"investigate_date") = 52 AND date_part('month',"investigate_date") = 12) OR
							( date_part('year',"investigate_date") =  ${this_year} AND  date_part('week',"investigate_date") = 53 AND date_part('month',"investigate_date") = 12)` ;

	var final_results = [];

	if(first_day_week == 52 && last_day_week == 1)
	{	
		var conList = [con_first_week_52or53, con_last_week_1,	con_whole_week];
		var results = getqueryResult(conList);

		Promise.all(results).then(function(data){

				data.forEach((ele,ind)=>{
					if(ele != null)
					{
						if(ind == 0)
						{
							ele[0]['week'] = 1;
							final_results.push(ele[0]);
						}
						else if(ind == 1)
						{
							ele[0]['week'] = 54;
							final_results.push(ele[0]);
						
						}
						else if(ind == 2)
						{
							ele.forEach((e,i)=>{
								ele[i]['week'] = ele[i]['week'] + 1;
								final_results.push(ele[i]);
							})
						}
					}
				}) 

				return final_results;
			}
		).then(function(){
			if(type == "CSV_file")
			{
				sendCSV(final_results, res);
				return;
			}

			res.writeHead(200, {
				'Content-Type': 'application/json; charset=utf-8'
			});
			res.end(JSON.stringify(final_results));
		})
	}
	else if((first_day_week == 52 || first_day_week == 53) && last_day_week == 52)
	{
		var conList =[con_first_week_52or53, con_whole_week];
		var results = getqueryResult(conList);
		
		Promise.all(results).then(function(data){
			
				data.forEach((ele,ind)=>{
					if(ele != null)
					{
						if(ind == 0)
						{
							ele[0]['week'] = 1;
							final_results.push(ele[0]);
						}
						else if(ind == 1 )
						{
							ele.forEach((e,i)=>{
								ele[i]['week'] = ele[i]['week'] + 1;
								final_results.push(ele[i]);
							})
						}
					}
				}) 

				return final_results;
			}
		).then(function(){
			if(type == "CSV_file")
			{
				sendCSV(final_results, res)
				return;
			}

			res.writeHead(200, {
				'Content-Type': 'application/json; charset=utf-8'
			});
			res.end(JSON.stringify(final_results));
		})
	}
	else if(first_day_week == 1 && last_day_week == 1)
	{
		var conList =[con_last_week_1, con_whole_week];
		var results = getqueryResult(conList);

		Promise.all(results).then(function(data){

				data.forEach((ele,ind)=>{
					if(ele != null)
					{
						if(ind == 0)
						{
							ele[0]['week'] = 53;
							final_results.push(ele[0]);
						}
						else if(ind == 1)
						{
							ele.forEach((e,i)=>{
								final_results.push(ele[i]);
							})
						}
					}
				}) 
			
				return final_results;
			}
		).then(function(){
			if(type == "CSV_file")
			{
				sendCSV(final_results, res)
				return;
			}

			res.writeHead(200, {
				'Content-Type': 'application/json; charset=utf-8'
			});
			res.end(JSON.stringify(final_results));
		})
	}
	else if(first_day_week == 1 && (last_day_week == 52 || last_day_week == 53))
	{
		var conList =[con_whole_week];
		var results = getqueryResult(conList);
		
		Promise.all(results).then(function(data){

				data.forEach((ele,ind)=>{
					if(ele != null)
					{
						if(ind == 0)
						{
							ele.forEach((e,i)=>{
								final_results.push(ele[i]);
							})
						}
					}
				}) 

				return final_results;
			}
		).then(function(){
			if(type == "CSV_file")
			{
				sendCSV(final_results, res)
				return;
			}

			res.writeHead(200, {
				'Content-Type': 'application/json; charset=utf-8'
			});
			res.end(JSON.stringify(final_results));
		})
	}

	function getqueryResult(){
		
		return conList.map(function(conString) {
				var queryString = getqueryString(conString);
	
				return new Promise(function (resolve, reject) {
					connectPostgres('cdczonegis', queryString , '',
						function(result) {
							if(result.rowCount != 0)
								resolve(result.rows);
							else
								resolve(null);
						}
					);
				})
		})
	}
	
	function getqueryString(conString){
		
		var queryString = `SELECT count(*),EXTRACT(week FROM "investigate_date") "week"
							FROM public.bucket_record
							WHERE ${conString}
							GROUP BY "week"
							ORDER BY "week" ASC;`
	
		return queryString
	}
})

function connectPostgres(db, queryString, params, success, error) {
	var client = new pg.Client(connectString+db);
	client.connect(function(err) {
		if (err) {
			client.end();
			//return console.error('could not connect to postgres', err);
			error();
		} else {
			var params2 = (params) ? params : [];
			client.query(queryString, params2, function(err, result) {
				client.end();
				if (err) {
					//return console.error('error running query', err);
					//error();
					console.log(err)
				} else {
					success(result);
					//console.log(result);
				}
				// client.end();
			});
		}
	});
}

function filePromise(path, data, encoding) {
  return new Promise(function(resolve, reject) {
    fs.writeFile(path, data, encoding, function(err) {
      if (err) {
        reject(err);
      } else {
		  console.log(path)
        resolve(path);
      }
    });
  });
}

function sendCSV(final_results, res) {

	var fields = ['week', 'count'];

	var csv = json2csv({
		data: final_results,
		fields: fields
	});

	res.send(csv)
}

module.exports = router;