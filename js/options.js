$(function(){
    var mockup, linksArr = [], linksArrTemp = [], deffs = [], l;
    var $linksContainer = $('#links-container');
    var $savedMsg = $('#saved_msg');

    /**
     *
     */
    $('#add_link').on('click', addHtmlLink);

    /**
     * Save data from form to localStorage
     */
    $('#save_links').on('click', function(){
        deffs = [];
        l = Ladda.create(document.querySelector('#save_links'));
        l.start();

        linksArrTemp = [];

        $linksContainer.find('input[name="link[]"]').each(function() {
            linksArrTemp.push({url: $(this).val(), lastMsg: null, title: ''});
        });

        linksArrTemp.forEach(function(linkTemp, i) {
            linksArr.forEach(function(link) {
                if (linksArrTemp[i].url == link.url) {
                    linksArrTemp[i] = link;
                }
            });

            if (!linksArrTemp[i].lastMsg) {
                deffs[i] = $.Deferred();

                $.ajax({
                    url: linksArrTemp[i].url
                }).done(function( data ) {
                    linksArrTemp[i].title = $(data).find('header.adsPage__header > h1').text();
                    linksArrTemp[i].lastMsg = $(data).find('.ads-list-table > tbody > tr').filter(function() {return +$(this).find('.ads-list-table-title').attr('colspan') !== 3}).first().find('.ads-list-table-favorites > a').data('ad-id');

                    deffs[i].resolve();
                });
            }
        });

        $.when.apply($, deffs).done(function() {
            localStorage['links'] = JSON.stringify(linksArrTemp);
            linksArr = linksArrTemp;

            $savedMsg.show();
            window.setTimeout(function() { $savedMsg.hide(); }, 2000);

            l.stop();
        });
    });

    /**
     * Delete link from form
     */
    function delete_link() {
        $(this).closest('.form-group').remove();
    }

    /**
     * Add html to form with links
     *
     * @param link
     */
    function addHtmlLink(link) {
        mockup = $($('#link_mockup').html());

        mockup.find('.delete-link').on('click', delete_link);

        mockup.find('input[name="link[]"]').val(typeof link == 'string' ? link : '');

        $linksContainer.append(mockup);
    }

    /**
     * Constructor
     */
    var init = function(){
        $('#links_text').text(chrome.i18n.getMessage("links"));
        $('#save_text').text(chrome.i18n.getMessage("save"));
        $('#add_link_text').text(chrome.i18n.getMessage("add_link"));
        $('.link_text').text(chrome.i18n.getMessage("link"));
        $('#saved_text').text(chrome.i18n.getMessage("saved"));

        if (localStorage['links']) {
            linksArr = JSON.parse(localStorage['links']);
        }

        if (linksArr.length) {
            linksArr.forEach(function (link) {
                addHtmlLink(link.url);
            })
        } else {
            addHtmlLink();
        }
    }();
});