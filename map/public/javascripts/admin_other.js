$('#btn_match_address').click(function() {
    query_match_address();
});

$('#btn_query_land').click(function() {
    query_query_land();
});

$('#btn_minimal_xy').click(function() {
    query_minimal_xy();
});

$('#input_match_address').keypress(function(e) {
    // enter event
    if (e.which != 13) {
        return;
    }
    query_match_address();
});

$('#input_query_land').keypress(function(e) {
    // enter event
    if (e.which != 13) {
        return;
    }
    query_query_land();
});

$('#input_minimal_xy').keypress(function(e) {
    // enter event
    if (e.which != 13) {
        return;
    }
    query_minimal_xy();
});

function query_query_land() {
    $("#modal_loading").modal("show");
    console.log($('#input_query_land').val());
    var values = $('#input_query_land').val().split(',');
    $.ajax({
        url: encodeURI("/data/nlsc_query_land?city=" + values[0] + "&sec=" + values[1] + "&no=" + values[2]),
        async: true,
        dataType: "json",
        type: "POST",
        data: {},
    }).done(function(json) {
        $("#modal_loading").modal("hide");
        var divResult = $('#div_query_land');
        if (divResult.html().length > 0) {
            divResult.html('');
        }
        var result = json.LISERVICERSGMSG.RESPONSE;
        var html = '';
        html = '<p>搜尋結果：(' + result.length + '筆)';
        for (var x = 0; x < result.length; x++) {
            html += '<hr>' +
                '<p>座標X：' + result[x].LONGITUDE +
                '<p>座標Y：' + result[x].LATITUDE;
        }
        divResult.html(html);
    });
}

function query_match_address() {
    $("#modal_loading").modal("show");
    console.log($('#input_match_address').val());
    var address = $('#input_match_address').val();
    $.ajax({
        url: encodeURI("/data/tgos_match_address?address=" + address),
        async: true,
        dataType: "json",
        type: "POST",
        data: {},
    }).done(function(json) {
        $("#modal_loading").modal("hide");
        var divResult = $('#div_match_address');
        if (divResult.html().length > 0) {
            divResult.html('');
        }
        var result = json.AddressList;
        var html = '';
        html = '<p>搜尋結果：(' + result.length + '筆)';
        for (var x = 0; x < result.length; x++) {
            html += '<hr>' +
                '<p>完整地址：' + result[x].FULL_ADDR +
                '<p>座標X：' + result[x].X +
                '<p>座標Y：' + result[x].Y;
        }
        divResult.html(html);
    });
}

function query_minimal_xy() {
    $("#modal_loading").modal("show");
    console.log($('#input_minimal_xy').val());
    var matches = $('#input_minimal_xy').val().split(',');
    $.ajax({
        url: encodeURI("/data/moi_minimal_xy?match_x=" + matches[0] + "&match_y=" + matches[1]),
        async: true,
        dataType: "json",
        type: "POST",
        data: {},
    }).done(function(json) {
        $("#modal_loading").modal("hide");
        var divResult = $('#div_minimal_xy');
        if (divResult.html().length > 0) {
            divResult.html('');
        }
        var result = json.MatchResultList.MatchResult;
        var html = '';
        html = '<p>搜尋結果：(' + result.length + '筆)';
        for (var x = 0; x < result.length; x++) {
            html += '<hr>' +
                '<p>縣市：' + result[x].COUNTY +
                '<p>鄉鎮市區：' + result[x].Town +
                '<p>里別：' + result[x].Village +
                '<p><i class="fa fa-map-marker" aria-hidden="true"></i>一級發布區：' + result[x].CODE1;
        }
        divResult.html(html);
    });

}