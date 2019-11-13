data_map = {
	panels: {
		export: {
			name: 'export',
			title: '匯出圖層',
			title_sub: '',
			content: '',
		},
		bookmark: {
			name: 'bookmark',
			title: '書籤功能',
			title_sub: '測試',
			content: '',
		},
		layer: {
			name: 'layer',
			title: '底圖切換',
			title_sub: '',
			content: '<div id="map-tileLayer-panel">'
			+ '<div class="panel">'
			+ '<div class="panel-body">'
			+ '<div title="Open Street Map" style="background: url(&quot;stylesheets/images/tiles/osm1.png&quot;) no-repeat;"><span>Open Street Map</span></div>'
			// + '<div title="Open Street Cycle Map" style="background: url(&quot;stylesheets/images/tiles/osm2.png&quot;) no-repeat;"><span>Open Street Cycle Map</span></div>'
			+ '<div title="Google地圖" class="active" style="background: url(&quot;stylesheets/images/tiles/gsm.png&quot;) no-repeat;"><span>Google地圖</span></div>'
			// + '<div title="Google衛星地圖" style="background: url(&quot;stylesheets/images/tiles/gim.png&quot;) no-repeat;"><span>Google衛星地圖</span></div>'
			+ '<div title="通用版電子地圖" style="background: url(&quot;stylesheets/images/tiles/nlsc1.png&quot;) no-repeat;"><span>通用版電子地圖</span></div>'
			// + '<div title="通用版電子地圖正射影像" style="background: url(&quot;stylesheets/images/tiles/nlsc4.png&quot;) no-repeat;"><span>通用版電子地圖正射影像</span></div>'
			// + '<div title="國土利用調查成果圖" style="background: url(&quot;stylesheets/images/tiles/nlsc3.png&quot;) no-repeat;"><span>國土利用調查成果圖</span></div>'
			+ '</div>'
			+ '</div>'
			+ '</div>',
		},
		import: {
			name: 'import',
			title: '匯入圖層',
			title_sub: '匯入外部圖層',
			content: '<div id="map-import-panel">'
			+ '<div class="panel">'
			+ '<div class="panel-body">'
			+ '<span>登革熱疫情趨勢<input type="checkbox" checked data-toggle="toggle" data-style="ios"></span>'
			+ '</div>'
			+ '</div>'
			+ '</div>',
		},
		draw: {
			name: 'draw',
			title: '手繪圖層',
			title_sub: '測試',
			content: '',
		},
		animation: {
			name: 'animation',
			title: '動畫輪播',
			title_sub: '測試',
			content: '',
		},
		list: {
			name: 'list',
			title: '清單',
			title_sub: '測試',
			content: '',
		},
		legend: {
			name: 'legend',
			title: '圖例及圖層工具',
			title_sub: '',
			content: '',
		},
	}
};

var tabs = $('.tabs > li');

tabs.on("click", function(){
	tabs.removeClass('active');
	$(this).addClass('active');
	if ($(this).hasClass('active')) {
		// $("#bottom-panels").slideToggle();
	}
});

// 地圖控制元件
var mymap = L.map('mapid', {zoomControl:false }).setView([23.643290, 120.822847], 8);

L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
}).addTo(mymap);

$("#btn-map-zoomin").click(function(a,b){
	mymap.zoomIn();
});

$("#btn-map-zoomout").click(function(a,b){
	mymap.zoomOut();
});

$("#btn-map-locate").click(function(a,b){
	if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position){
        	mymap.setView([position.coords.latitude, position.coords.longitude], 18);
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
});

// 長出右邊按鈕
var btn_function = ['export', 'bookmark', 'layer', 'import', 'draw', 'list', 'animation', 'legend'];

function ui_check_tools() {
	for (var x = 0; x < btn_function.length; x++) {
		if ($('#map-panels-' + btn_function[x]).is(':visible')) {
			$('#map-tools-' + btn_function[x]).parent().addClass('active');
			// #1565C0
		} else {
			$('#map-tools-' + btn_function[x]).parent().removeClass('active');
		}
	}
}

for (var x = 0; x < btn_function.length; x++) {
	$('#map-tools-' + btn_function[x]).attr('target_tool', 'map-panels-' + btn_function[x]);
	$('#map-tools-' + btn_function[x]).attr('panel', btn_function[x]);
	$('#map-tools-' + btn_function[x]).click(function(a,b){
		var str_panelName = $(this).attr('target_tool');
		var str_panel = $(this).attr('panel');
		if ($('#' + str_panelName).length) {
			$('#' + str_panelName).show();
		} else {
			var panel = $('<div></div>');
			panel.attr('id', str_panelName);
			panel.attr('class', 'ibox float-e-margins map-panels');
			panel.append(
				'<div class="ibox-title">'
				+ '<h5>' + data_map.panels[str_panel].title
				+ '<small class="m-l-sm">' + data_map.panels[str_panel].title_sub + '</small>'
				+ '</h5>'
				+ '<div class="ibox-tools">'
				+ '<a class="collapse-link">'
				+ '<i class="fa fa-chevron-up"></i>'
				+ '</a>'
				+ '<a class="close-link">'
				+ '<i class="fa fa-times"></i>'
				+ '</a>'
				+ '</div>'
				+ '</div>'
				+ '<div class="ibox-content" >'
				+ data_map.panels[str_panel].content
				+ '</div>');

			panel.appendTo($('#map-panels'));
			$('.collapse-link').on('click', function () {
		        var ibox = $(this).closest('div.ibox');
		        var button = $(this).find('i');
		        var content = ibox.children('.ibox-content');
		        content.slideToggle(200);
		        button.toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
		        ibox.toggleClass('').toggleClass('border-bottom');
		        setTimeout(function () {
		            ibox.resize();
		            ibox.find('[id^=map-]').resize();
		        }, 50);
		    });

		    // Close ibox function
		    $('.close-link').on('click', function () {
		        var content = $(this).closest('div.ibox');
		        content.remove();
		        ui_check_tools();
		    });
		}
		ui_check_tools();


         // $("#sparkline2").sparkline([24, 43, 43, 55, 44, 62, 44, 72], {
         //     type: 'line',
         //     width: '100%',
         //     height: '60',
         //     lineColor: '#1ab394',
         //     fillColor: "#ffffff"
         // });
	});
}

function ui_target_panel_import() {
	$.ajax({
		url: '/api/dengue_ks',
		dataType: 'json'
	});
	// http://localhost/api/dengue_ks
}