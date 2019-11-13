function dropbox_checkAuth() {
	"use strict";
	var args = dropbox_getUrlQueryArgs();
	if(!args.access_token && !args.error) {
		return false;
	} else {
		return true;
	}
}

function dropbox_getToken() {
	"use strict";
	var args = dropbox_getUrlQueryArgs();
	if (!args.access_token) {
		return null;
	} else {
		return args.access_token;
	}
}


function dropbox_authorize(success, failed, folderName) {
	"use strict";
	var args = dropbox_getUrlQueryArgs();
	var userData;
	if(!args.access_token && !args.error) {
		window.location.replace(dropbox_getAuthUrl());
	}
	else {
		if(args.error){
			window.close();
			return;
		}
		$.ajax({url: "https://api.dropbox.com/1/metadata/dropbox", async: true, headers:{Authorization: "Bearer " + encodeURIComponent(args.access_token)}})
		.done(function(data){
			userData = data;
			if (folderName)
				dropbox_getDropboxMetaDataWithFolder(userData, folderName, args.access_token, success, failed);
			else
				dropbox_getDropboxMetaData(userData, args.access_token, success, failed);
		}).fail(function(error){
			userData = error;
			if (folderName)
				dropbox_getDropboxMetaDataWithFolder(userData, folderName, args.access_token, success, failed);
			else
				dropbox_getDropboxMetaData(userData, args.access_token, success, failed);
		});
	}
}

function dropbox_getAuthUrl(){
	"use strict";
	var client_id = "";
	var response_type = "token";
	var redirect_uri = "https://dl.dropboxusercontent.com/u/8955785/DropboxCore/geologicmap.html";
	// var redirect_uri = "https://dl.dropboxusercontent.com/u/8955785/DropboxCore/index_dropbox.html";
	var auth_url = "https://www.dropbox.com/1/oauth2/authorize";
	auth_url += "?client_id=" + client_id;
	auth_url += "&response_type=" + response_type;
	auth_url += "&redirect_uri=" + redirect_uri;

	return auth_url;
}

function dropbox_getUrlQueryArgs() {
	"use strict";
	var args = {};
	var hash;
	var hashes = window.location.href.slice(window.location.href.indexOf("#") + 1).split("&");
	for(var i = 0; i < hashes.length; i++)
	{
		hash = hashes[i].split("=");
		args[hash[0]] = hash[1];
	}

    // 2016.08.02 add by CCS 
    // check localStorage
	if (!args.access_token) {
	    if (window.localStorage.GD_Auth_Dropbox) {
	        args.access_token = window.localStorage.GD_Auth_Dropbox;
	    }
	}

	return args;
}

function dropbox_redirectBack(args, sourceUrl) {
	"use strict";
	var url_redirect = "";
	if (sourceUrl && sourceUrl.length > 0)
		url_redirect = sourceUrl;
	if(!args.access_token && !args.error){
		var url = url_redirect + "#" + window.location.href.slice(window.location.href.indexOf("#") + 1);
		window.location.replace(url);
	}
	else{
		var url_back = url_redirect + "#" + window.location.href.slice(window.location.href.indexOf("#") + 1);
		window.location.replace(url_back);
	}
}

function dropbox_getDropboxMetaDataWithFolder(userData, folderName, token, success, failed) {
	"use strict";
	if(userData){
		var folder_name = folderName;
		var folder_obj;
		userData = JSON.parse(userData.responseText);

		for (var i = 0; i < userData.contents.length; i++) {
			var obj = userData.contents[i];
			if (obj.path.slice(1) == folder_name) {
				folder_obj = obj;
			}
		}

		if (folder_obj) {
			$.ajax({url: "https://api.dropbox.com/1/metadata/dropbox/" + encodeURIComponent(folder_name), async: true, headers:{Authorization: "Bearer " + encodeURIComponent(token)}})
			.done(function(data){
				if (data && success) {
					var result = dropbox_parseDropboxData(data, token);
					if (result)
						success(result);
				}
			}).fail(function(error){
				if (error && success) {
					var result = dropbox_parseDropboxData(error, token);
					if (result)
						success(result);
				}
			});
		} else {
			if (failed) {
				var result_json = {};
				result_json.message = '';
				failed(result_json);
			}
		}
	}
}

function dropbox_getDropboxMetaData(userData, token, success, failed) {
	dropbox_getDropboxMetaDataWithFolder(userData, "GeologyCompass", token, success, failed);
}

function dropbox_getFolderData(data, callback) {
	"use strict";
	$.ajax({url: "https://api.dropbox.com/1/metadata/dropbox/" + encodeURIComponent(data.name), async: true, headers:{Authorization: "Bearer " + encodeURIComponent(dropbox_getToken())}})
	.done(function(data){
		if (data && callback) {
			var result = dropbox_parseDropboxData(data, dropbox_getToken());
			if (result)
				callback(result);
		}
	}).fail(function(error){
		if (error && callback) {
			var result = dropbox_parseDropboxData(error, dropbox_getToken());
			if (result)
				callback(result);
		}
	});
}

function dropbox_getFolderDataByUrl(url, callback) {
	"use strict";
	$.ajax({url: url, async: true, headers:{Authorization: "Bearer " + encodeURIComponent(dropbox_getToken())}})
	.done(function(data){
		if (data && callback) {
			var result = dropbox_parseDropboxData(data, dropbox_getToken());
			if (result)
				callback(result);
		}
	}).fail(function(error){
		if (error && callback) {
			var result = dropbox_parseDropboxData(error, dropbox_getToken());
			if (result)
				callback(result);
		}
	});
}

function dropbox_parseDropboxData(data, token) {
	"use strict";
	var result_json;
	if (data) {
		result_json = {};
		data = JSON.parse(data.responseText);
		var result_data = [];
		for (var i = 0; i < data.contents.length; i++) {
			var obj = data.contents[i];
			var obj_json = {};
			obj_json.name = obj.path.slice(1);
			if (obj.is_dir) {
				obj_json.type = "folder";
				obj_json.url = "https://api-content.dropbox.com/1/metadata/dropbox/" + encodeURIComponent(obj.path.slice(1));
			}
			else {
				obj_json.type = "file";
				obj_json.url = "https://api-content.dropbox.com/1/files/dropbox/" + encodeURIComponent(obj.path.slice(1)) + "?access_token=" + token;
				if (obj.thumb_exists) {
					obj_json.thumbnails = "https://api-content.dropbox.com/1/thumbnails/dropbox/" + encodeURIComponent(obj.path.slice(1)) + "?access_token=" + token;
				}
			}
			result_data.push(obj_json);
		}
		result_json.data = result_data;
	}
	return result_json;
}

function dropbox_putData(data, pathname, token, callback) {
	"use strict";
	var result_json;
	var url_file = "https://api-content.dropbox.com/1/files_put/auto/" + pathname + "?access_token=" + token + "&overwrite=true";

	$.ajax({
		type: "PUT",
		url: url_file,
		enctype: 'multipart/form-data',
		data: data,
	}).done(function(res_data){
		if (res_data && callback) {
			var obj = JSON.parse(res_data.responseText);
			callback(obj);
		}
	}).fail(function(error){
		if (error && callback) {
			var obj = JSON.parse(error.responseText);
			callback(obj);
		}
	});
}

function parseReferrerUrl() {
	var oldURL = document.referrer;
	return oldURL;
}