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
        this.settings = $.extend({}, this.defaults, (options ? options : {}));
        this.$playerInfoBox = $('#player-'+ this.settings.id +'-info');
        this.$nameBox = this.$playerInfoBox.find('.player-name');
        this.$typeBox = this.$playerInfoBox.find('.player-type');
        this.$scoreBox = this.$playerInfoBox.find('.player-score');

        this.updateBoard();
    };
    window.GatoPlayer.prototype = {
        updateBoard : function(){
            var self = this;
            self.$nameBox.text( self.settings.name );
            self.$typeBox.text( self.settings.type );
            self.$scoreBox.text( self.settings.score );
        },
        play : function( game ){
            var self = this;
            self.enemy = this.getEnemy( game.players );

            self.decideAction( self.getSituation() );
        },
        getSituation : function(){
            var self = this,
                currentPlayerId = self.settings.id,
                enemyid = self.enemy.settings.id,
                i,
                contra = 1,
                leftDiagSelector = [],
                rightDiagSelector = [],
                tempOwnedLength,
                $ownedLeftDiag,
                $ownedRightDiag,
                $ownedRow,
                $ownedCol;

            for( i = 3; i >= 1; i--, contra++ ){
                $ownedRow = $('.rowbox[data-row="'+ i +'"] [data-owner]');
                $ownedCol = $('.block[data-col="'+ i +'"][data-owner]');

                //almost row
                if( $ownedRow.length === 2 ){
                    //casi ganando la fila, se devvulve un objeto con la situacion
                    if( $('.rowbox[data-row="'+ i +'"] [data-owner="player-'+ currentPlayerId +'"]').length === 2 ){
                        return {
                            status : 'winning',
                            type : 'row'
                        };
                    }
                    // casi perdiendo una fila, se devuelve respuesta para poder bloquear
                    else if( $('.rowbox[data-row="'+ i +'"] [data-owner="player-'+ enemyid +'"]').length === 2 ){
                        return {
                            status : 'loosing',
                            type : 'row'
                        };
                    }
                }

                //almost col
                else if( $ownedCol.length === 2 ){
                    //casi ganando la columna, se devvulve un objeto con la situacion
                    if( $('.block[data-col="'+ i +'"][data-owner="player-'+ currentPlayerId +'"]').length === 2 ){
                        return {
                            status : 'winning',
                            type : 'col'
                        };
                    }
                    // casi perdiendo una columan, se devuelve respuesta para poder bloquear
                    else if( $('.block[data-col="'+ i +'"][data-owner="player-'+ enemyid +'"]').length === 2 ){
                        return {
                            status : 'loosing',
                            type : 'col'
                        };
                    }
                }

                leftDiagSelector.push('.block[data-col="'+ i +'"][data-row="'+ i +'"]');
                rightDiagSelector.push('.block[data-col="'+ contra +'"][data-row="'+ i +'"]');
            }

            //esto no esta funcionando, en caso de diag solo devuelve status neutral.
            $ownedLeftDiag = $( leftDiagSelector.join(', ') );
            $ownedRightDiag = $( leftDiagSelector.join(', ') );

            //leftDiag
            tempOwnedLength = $ownedLeftDiag.filter(function( item ){ return $(item).attr('data-owner'); }).length;
            if( tempOwnedLength === 2 ){
                // casi ganando left diag
                if( $ownedLeftDiag.filter(function( item ){ return $(item).attr('data-owner') === 'player-'+ currentPlayerId; }).length === 2 ){
                    return {
                        status : 'winning',
                        type : 'leftDiag'
                    };
                }
                
                // casi perdiendo left diag
                else if( $ownedLeftDiag.filter(function( item ){ return $(item).attr('data-owner') === 'player-'+ enemyid; }).length === 2 ){
                    return {
                        status : 'loosing',
                        type : 'leftDiag'
                    };
                }
            }

            //RightDiag
            tempOwnedLength = $ownedRightDiag.filter(function( item ){ return $(item).attr('data-owner'); }).length;
            if( tempOwnedLength === 2 ){
                // casi ganando right diag
                if( $ownedRightDiag.filter(function( item ){ return $(item).attr('data-owner') === 'player-'+ currentPlayerId; }).length === 2 ){
                    return {
                        status : 'winning',
                        type : 'rightDiag'
                    };
                }
                
                // casi perdiendo right diag
                else if( $ownedRightDiag.filter(function( item ){ return $(item).attr('data-owner') === 'player-'+ enemyid; }).length === 2 ){
                    return {
                        status : 'loosing',
                        type : 'rightDiag'
                    };
                }
            }

            // si no esta ganando ni perdiendo nada se devuelve un estado neutral
            return { status : 'neutral' };
        },
        decideAction : function( situation ){
            var self = this;

            log(situation);

            switch( situation.status ){
                case 'winning' :
                    // make winning move
                    break;
                case 'loosing' : 
                    // blocking enemy
                    break;
                default :
                    // random play
                    break;
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
        resetGame : function(){},
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
                .each(function(index, elem){ $(elem).attr('data-index', index); })
                .on('mouseup.gato touchend.gato MSPointerUp.gato interaction.gato', { game : self }, this.handleInteraction);
        },
        isWinner : function(){
            var self = this,
                currentPlayerId = self.currentPlayer.settings.id,
                i,
                contra = 1,
                leftDiagSelector = [],
                rightDiagSelector = [];

            for( i = 3; i >= 1; i--, contra++ ){
                if( $('.rowbox[data-row="'+ i +'"] [data-owner="player-'+ currentPlayerId +'"]').length === 3 ){ return true; }
                else if( $('.block[data-col="'+ i +'"][data-owner="player-'+ currentPlayerId +'"]').length === 3 ){ return true; }

                leftDiagSelector.push('.block[data-col="'+ i +'"][data-row="'+ i +'"][data-owner="player-'+ currentPlayerId +'"]');
                rightDiagSelector.push('.block[data-col="'+ contra +'"][data-row="'+ i +'"][data-owner="player-'+ currentPlayerId +'"]');
            }
            return $( leftDiagSelector.join(', ') ).length === 3 || $( rightDiagSelector.join(', ') ).length === 3;
        },
        winGame : function(){
            alert('winner player '+ this.currentPlayer.settings.name);
        },
        endTurn : function(){
            var self = this;

            if( self.isWinner() ){ return self.winGame(); }

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

            if( ! $block.attr('data-owner') ){
                $block
                    .addClass('selected player-'+ game.currentPlayer.settings.id)
                    .attr('data-owner', 'player-'+ game.currentPlayer.settings.id);
                game.endTurn();
            }
        }
    };

    $(window).load(function(){ var gatoGame = new window.GatoGame(); });


}( this, document, jQuery ));