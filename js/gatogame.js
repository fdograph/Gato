(function( window, document, $ ){
    // console log polyfill
    window.log=function(){log.history=log.history||[];log.history.push(arguments);if(this.console){console.log(Array.prototype.slice.call(arguments))}};

    // primero definimos y seteamos el objeto Player
    window.GatoPlayer = function( options ){
        this.defaults = {
            id : 1,
            name : 'Mr. Roboto',
            type : 'robot',
            score : 0
        };
        this.settings = $.extend({}, this.defaults, (options || {}));
        this.$playerInfoBox = $('#player-'+ this.settings.id +'-info');
        this.$nameBox = this.$playerInfoBox.find('.player-name');
        this.$typeBox = this.$playerInfoBox.find('.player-type');
        this.$scoreBox = this.$playerInfoBox.find('.player-score');

        this.update();
    };
    window.GatoPlayer.prototype = {
        update : function(){
            var self = this;
            self.$nameBox.text( self.settings.name );
            self.$typeBox.text( self.settings.type );
            self.$scoreBox.text( self.settings.score );
        },
        play : function( game ){
            var self = this;
            self.game = game;
            self.enemy = this.getEnemy( game.players );
            self.decideAction( self.getSituation() );
        },
        getSituation : function(){
            var self = this,
                combs = self.game.winningConditions,
                winCombsNum = self.game.winningConditions.length,
                winning = false,
                loosing = false,
                $results,
                selectionString = [],
                counter,
                innerConunt,
                enemyMatch,
                myMatch;

            for( counter = 0; counter < winCombsNum; counter++ ){
                for( innerConunt = 0; innerConunt < combs[counter].length; innerConunt++ ){
                    selectionString.push('.selected[data-index="'+ combs[counter][innerConunt] +'"]');
                }
                
                $results = $( selectionString.join(', ') );
                myMatch = $results.filter('[data-owner="player-'+ self.settings.id +'"]').length;
                enemyMatch = $results.filter('[data-owner="player-'+ self.enemy.settings.id +'"]').length;
                selectionString = [];

                if( myMatch === 2 && enemyMatch === 0 ){ winning = combs[counter]; }
                else if( enemyMatch === 2 && myMatch === 0 ){ loosing = combs[counter]; }
            }

            if( winning ){ return { status : 'winning', comb : winning }; }
            else if( loosing ){ return { status : 'loosing', comb : loosing }; }

            return { status : 'neutral' };
        },
        decideAction : function( situation ){
            var self = this,
                $allBlocks = $('.block:not(.selected)'),
                i,
                $target;
            if( situation.status === 'winning' || situation.status === 'loosing' ){
                for( i = 0; i < situation.comb.length; i++ ){
                    $target = $allBlocks.filter('[data-index="'+ situation.comb[i] +'"]');
                    if( $target.length ){
                        return self.makeMove( $target );
                        break;
                    }
                }
            }
            else {
                return self.makeMove( $allBlocks.eq( Math.floor(Math.random() * $allBlocks.length) ) );
            }
        },
        makeMove : function( $block ){
            var self = this;
            if( ! $block.attr('data-owner') ){
                $block
                .addClass('selected player-'+ self.settings.id)
                .attr('data-owner', 'player-'+ self.settings.id);
            }
        },
        getEnemy : function( players ){
            var selfid = this.settings.id,
                enemy = players.filter(function(p){ return p.settings.id !== selfid; });
            return enemy[0];
        }
    };

    // construimos el objeto para el juego
    window.GatoGame = function(){ this.setupGame(); };
    window.GatoGame.prototype = {
        winningConditions : [[1,2,3], [4,5,6], [7,8,9], [1,4,7], [2,5,8], [3,6,9], [1,5,9], [7,5,3]],
        resetGame : function(){
            $('.block').removeAttr('data-owner').removeClass('selected player-1 player-2');
            this.currentPlayer = this.players[0];
        },
        setupGame : function(){
            var self = this,
                newPlayerName = localStorage.getItem('playerName');

            if( ! newPlayerName ){
                newPlayerName = prompt('Ingresa tu nombre');
                localStorage.setItem('playerName', newPlayerName);
            }

            // se crea el array de jugadores
            self.players = [ (new window.GatoPlayer({ id : 1, name : newPlayerName, type : 'human' })), (new window.GatoPlayer({ id : 2 })) ];
            self.currentPlayer = self.players[0];

            $('.block')
                .each(function(index, elem){ $(elem).attr('data-index', index + 1); })
                .on('mouseup.gato touchend.gato MSPointerUp.gato interaction.gato', { game : self }, this.handleInteraction);
        },
        isWinner : function(){
            var self = this,
                currentPlayerId = self.currentPlayer.settings.id,
                winningConditions = self.winningConditions,
                selectionString = [],
                $results,
                i,
                innerConunt;
            for( i = 0; i < winningConditions.length; i++ ){
                for( innerConunt = 0; innerConunt < winningConditions[i].length; innerConunt++ ){
                    selectionString.push('[data-index="'+ winningConditions[i][innerConunt] +'"]');
                }
                
                $results = $( selectionString.join(', ') );
                selectionString = [];
                
                if( $results.filter('[data-owner="player-'+ currentPlayerId +'"]').length === 3 ){ return true; }
            }
            return false;
        },
        isDraw : function(){
            return $('.block').length === $('.block.selected').length;
        },
        winGame : function(){
            alert('winner player '+ this.currentPlayer.settings.name);
            this.currentPlayer.settings.score += 1;
            this.currentPlayer.update();
            this.resetGame();
        },
        endTurn : function(){
            var self = this;

            if( self.isWinner() ){ return self.winGame(); }
            else if( self.isDraw() ){ return self.resetGame(); }

            self.currentPlayer = self.currentPlayer.settings.id === 1 ? self.players[1] : self.players[0];

            if( self.currentPlayer.settings.type === 'robot' ){ 
                self.currentPlayer.play( self ); 
                self.endTurn();
            }
        },
        handleInteraction : function( event ){
            event.preventDefault();

            var game = event.data.game,
                $block = $(this),
                hasOwner = $block.attr('data-owner');

            if( ! hasOwner ){
                $block
                    .addClass('selected player-'+ game.currentPlayer.settings.id)
                    .attr('data-owner', 'player-'+ game.currentPlayer.settings.id);
                game.endTurn();
            }
        }
    };

    $(window).load(function(){ var gatoGame = new window.GatoGame(); });


}( this, document, jQuery ));