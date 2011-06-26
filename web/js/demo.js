$(function() {
    //init placeholders
    $('[placeholder]').placeholder();

    var $canvas = $('canvas#testC'),
        form = $('form#canvasChooser'),
        run = function() {
            $canvas.gameOfLife('run');
        };

    form.validationEngine('attach');
    form.submit(function() {
        $canvas.gameOfLife($(this).serializeObject());
        return false;
    });

    $canvas.bind('generation', function(e, gen) {
        $('span#gen').text(gen);
    });

    $('input#clear').click(function() {
        $canvas.gameOfLife('clear');
    });

    $('input#run').click(function() {
        $canvas.gameOfLife('run');
    });

    $('input#stop').click(function() {
        $canvas.gameOfLife('stop');
    })
});

(function($) {
    $.fn.serializeObject = function() {
        var arr = this.serializeArray(),
            obj = {};

        $.each(arr, function(i, elem) {
            if (elem.value)
                obj[elem.name] = elem.value;
        });
        return obj;
    };
})(jQuery);