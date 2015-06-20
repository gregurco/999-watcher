/**
 * Recheck array of links and set the count of new positions to Badge
 */
function recheckBadgeText() {
    var badgeText = 0;
    var linksArr = [];

    if (localStorage['links']) {
        linksArr = JSON.parse(localStorage['links']);
    }

    linksArr.forEach(function(link, i) {
        if (linksArr[i].hasNew) {
            badgeText++;
        }
    });

    chrome.browserAction.setBadgeText({text: badgeText ? badgeText.toString() : ''});
}

/**
 * Request new data from 999.md
 */
function refreshData() {
    var deffs = [];
    var linksArr = [];

    if (localStorage['links']) {
        linksArr = JSON.parse(localStorage['links']);
    }

    linksArr.forEach(function(link, i) {
        deffs[i] = $.Deferred();

        $.ajax({
            url: link.url
        }).done(function( data ) {
            var lastMsg = $(data).find('.ads-list-table > tbody > tr').filter(function() {return +$(this).find('.ads-list-table-title').attr('colspan') !== 3}).first().find('.ads-list-table-favorites > a').data('ad-id');

            if (link.lastMsg != lastMsg) {
                linksArr[i].lastMsg = lastMsg;
                linksArr[i].hasNew = true;

                localStorage['links'] = JSON.stringify(linksArr);
            }

            deffs[i].resolve();
        });
    });

    $.when.apply($, deffs).done(function() {
        recheckBadgeText();
    });
}

chrome.alarms.create("checkBadgeText", {'periodInMinutes': 1});
chrome.alarms.create("refreshData", {'periodInMinutes': 1});

chrome.alarms.onAlarm.addListener(function(alarm) {
    switch (alarm.name) {
        case "checkBadgeText":
            recheckBadgeText();
            break;
        case "refreshData":
            refreshData();
            break;
    }
});