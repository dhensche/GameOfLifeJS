/**
 * Create a canvas object and then call gameOFLife on this object. This will create a default object. Options for
 * creation are:
 *
 * xCount: The number of cells in the x-direction (20)
 * yCount: The number of cells in the y-direction (20)
 * cellSize: The height and width of each cell in pixels (20)
 * cellPadding: The number of pixels between each cell (2)
 * delay: How long until the next generation is calculated in milliseconds (250)
 * liveColor: The color of the living cells
 * deadColor: The color of the dead cells
 *
 * Functions are:
 * init: This is the creator
 * run: will start the game (or continue the game if you have previously stopped it)
 * stop: will stop the game
 * clear: will clear the board and restart the generations to zero
 * generation: will provide you the current generation
 *
 * -- all other functions are internal
 *
 * Events fired:
 *
 * generation: This event is fired with an extra parameter (the current generation) whenever a new generation is created.
 * To bind to this event use the following:
 *
 *      $(game_of_life_object).bind('generation', function(e, gen) {
 *          alert(gen);// will alert the current generation
 *      });
 */
(function($) {
    var gol_methods = {
        init: function(values) {
            this.clearCanvas();

            if (!this.data('gol')) values = gol_methods._saveOptions.call(this, values);
            values.lifeMap = gol_methods._draw.call(this);
            values.generation = 0;

            if (!this.data('events') || !this.data('events').click)
                this.bind('click.GOL', function(e) {
                    gol_methods._toggleLivingCell.call($(this), e);
                });
        },
        run: function() {
            var that = this,
                values = this.data('gol');
            values.intervalId =
                setInterval(function() {
                    var lifeMap = values.lifeMap,
                        neighbors = [], livingNeighbors,
                        newLifeMap = [];
                    lifeMap[-1] = [];
                    lifeMap[lifeMap.length] = [];
                    for (var x = 0; x < lifeMap.length; x++) {
                        newLifeMap[x] = [];
                        for (var y = 0; y < lifeMap[x].length; y++) {
                            neighbors = [lifeMap[x - 1][y - 1], lifeMap[x][y - 1], lifeMap[x + 1][y - 1], lifeMap[x - 1][y],
                                lifeMap[x + 1][y], lifeMap[x - 1][y + 1], lifeMap[x][y + 1], lifeMap[x + 1][y + 1]];
                            livingNeighbors = 0;
                            $.each(neighbors, function(i, v) {
                                livingNeighbors += v ? 1 : 0;
                            });
                            if (lifeMap[x][y]) {
                                newLifeMap[x][y] = livingNeighbors === 2 || livingNeighbors === 3;
                            } else {
                                newLifeMap[x][y] = livingNeighbors === 3;
                            }
                        }
                    }
                    gol_methods._update.call(that, newLifeMap);
                    values.lifeMap = newLifeMap;
                    values.generation++;
                    that.trigger('generation', values.generation);

                }, values.delay);
        },
        _update: function(newLifeMap) {
            var values = this.data('gol'),
                cellSize = values.cellSize,
                cellPadding = values.cellPadding,
                liveColor = values.liveColor,
                deadColor = values.deadColor,
                lifeMap = values.lifeMap || [];
            for (var x = 0; x < lifeMap.length; x++) {
                for (var y = 0; y < lifeMap[x].length; y++) {
                    if (lifeMap[x][y] != newLifeMap[x][y]) {
                        this.drawRect({
                                fillStyle: newLifeMap[x][y] ? liveColor : deadColor,
                                x: x * cellSize, y: y * cellSize,
                                width: cellSize - cellPadding,
                                height: cellSize - cellPadding,
                                fromCenter: false
                            });
                    }
                }
            }

        },
        _toggleLivingCell: function(e) {
            var values = this.data('gol'),
                cellSize = values.cellSize,
                cellPadding = values.cellPadding,
                liveColor = values.liveColor,
                deadColor = values.deadColor,
                lifeMap = values.lifeMap;
            var offset = this.offset();
            var relX = e.pageX - offset.left;
            var relY = e.pageY - offset.top;
            relX = Math.floor(relX / cellSize);
            relY = Math.floor(relY / cellSize);

            this.drawRect({
                    fillStyle: lifeMap[relX][relY] ? deadColor : liveColor,
                    x: relX * cellSize, y: relY * cellSize,
                    width: cellSize - cellPadding,
                    height: cellSize - cellPadding,
                    fromCenter: false
                });

            lifeMap[relX][relY] = !lifeMap[relX][relY];
        },
        clear: function() {
            var values = this.data('gol');
            values.lifeMap = null;
            values.lifeMap = gol_methods._draw.call(this);
            gol_methods.stop.call(this);
            values.generation = 0;
            this.trigger('generation', [0]);
        },
        _draw: function() {
            var values = this.data('gol');
            if (!values) return;

            var xCount = values.xCount,
                yCount = values.yCount,
                cellSize = values.cellSize,
                cellPadding = values.cellPadding,
                liveColor = values.liveColor,
                deadColor = values.deadColor,
                lifeMap = values.lifeMap || [];
            this.prop('width', xCount * cellSize);
            this.prop('height', yCount * cellSize);
            for (var i = 0; i < xCount; i++) {
                lifeMap[i] = lifeMap[i] || [];
                for (var j = 0; j < yCount; j++) {
                    this.drawRect({
                            fillStyle: lifeMap[i][j] ? liveColor : deadColor,
                            x: cellSize * i, y: cellSize * j,
                            width: cellSize - cellPadding,
                            height: cellSize - cellPadding,
                            fromCenter: false
                        });
                    lifeMap[i][j] = lifeMap[i][j] || false;
                }
            }

            return lifeMap;
        },
        stop: function() {
            clearInterval(this.data('gol').intervalId);
            this.data('gol').intervalId = null;
        },
        _saveOptions: function(options) {
            var userOptions = $.extend(true, {
                    xCount: 20,
                    yCount: 20,
                    cellSize: 20,
                    cellPadding: 2,
                    delay: 250,
                    liveColor: '#C00',
                    deadColor: '#0CC'
                }, gol_methods._convertValues(options));
            this.data('gol', userOptions);
            return userOptions;
        },
        _convertValues : function(options) {
            $.each(options, function(i, v) {
                if (!!parseInt(v, 10))
                    options[i] = parseInt(v, 10);
            });
            return options;
        },
        generation: function() {
            return this.data('gol').generation;
        }
    };

    $.fn.gameOfLife = function(method) {
        if (this.length < 1) return false;
        var args = arguments;
        return this.each(function() {
            var $this = $(this),
                options = $this.data('gol');
            if (options && options.intervalId) gol_methods.stop.call($this);

            if (typeof method === 'string' && method.charAt(0) != '_' && gol_methods[method]) {
                if (!options)
                    gol_methods.init.call($this, gol_methods._saveOptions.call($this, Array.prototype.slice.call(args, 1)));
                else
                    gol_methods[method].call($this, Array.prototype.slice.call(args, 1));
            }
            else if (typeof method === 'object' || !method)
                gol_methods.init.call($this, gol_methods._saveOptions.call($this, method));
            else
                $.error('Method ' + method + ' does not exist in the Game of Life');
        });
    }
})(jQuery);