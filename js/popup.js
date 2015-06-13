$(function(){
    var linksArr = [];
    var $linksContainer = $('#links-container');

    $('#refresh').on('click', function(){
        var deffs = [];
        var l = Ladda.create(document.querySelector('#refresh'));
        l.start();

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
                    renderLinks();
                }

                deffs[i].resolve();
            });
        });

        $.when.apply($, deffs).done(function() {
            recheckBadgeText();
            l.stop();
        });
    });

    $('#settingsButton').on('click', function() {
        var win = window.open(chrome.extension.getURL('options.html'), '_blank');
        win.focus();
    });

    function renderLinks() {
        $linksContainer.html('');

        if (localStorage['links']) {
            linksArr = JSON.parse(localStorage['links']);
        }

        if (linksArr.length) {
            linksArr.forEach(function (link, i) {
                $linksContainer.append(
                    $('<li/>')
                        .addClass('list-group-item')
                        .html(
                        $('<a/>')
                            .text(link.title)
                            .attr('href', link.url)
                            .attr('target', '_blank')
                            .on('click', function() {
                                linksArr[i].hasNew = false;
                                localStorage['links'] = JSON.stringify(linksArr);
                                renderLinks();
                                recheckBadgeText();
                            })
                    )
                        .prepend(
                        $('<span/>')
                            .addClass('badge' + (link.hasNew ? ' active' : ''))
                            .text(link.hasNew ? 'new' : '-')
                    )
                );
            });
        }
    }

    /**
     *
     */
    function recheckBadgeText() {
        var badgeText = 0;

        linksArr.forEach(function(link, i) {
            if (linksArr[i].hasNew) {
                badgeText++;
            }
        });

        chrome.browserAction.setBadgeText({text: badgeText ? badgeText.toString() : ''});
    }

    /**
     * Constructor
     */
    var init = function() {
        renderLinks();
    }();
});

document.addEventListener("DOMContentLoaded", function () {
    var blurTimerId = window.setInterval(function() {
        if (document.activeElement != document.body) {
            document.activeElement.blur();
        }
    }, 100);
    window.setTimeout(function() {
        window.clearInterval(blurTimerId);
    }, 1000);
});