class Game {
    constructor(fps) {
        this.area;
        this.player;
        this.maxPlayers = 1;
        this.hasEnded;
        this.canvas;
        this.scoreboard;
        this.messageBox;
        this.movementMap = {
            "w": new Vector(0, -1),
            "a": new Vector(-1, 0),
            "s": new Vector(0, 1),
            "d": new Vector(1, 0),
            " ": new Vector(0, 0)
        }
        this.currentMove = null;
        this.animatedGame;
        if (fps) {
            this.fps = (1000 / fps);
        } else {
            this.fps = 1000;
        }
        this.enemies = [];
        //this.turns;
        this.goal;
        this.goalReached = false;
        this.levelsCompleted = 0;
        this.maps = [];
    }

    // Used to bind HTML elements to the game. You can pass either element IDs or the elements themselves.
    bindElements(canvas, messageBox, scoreboard) {
        let elements = ["canvas", "messageBox", "scoreboard"];

        for (let i = 0; i < arguments.length; i++) {
            if (typeof arguments[i] == "string") {
                this[elements[i]] = document.getElementById(arguments[i]);
            } else {
                this[elements[i]] = arguments[i];
            }
        }

        document.addEventListener("keypress", (event) => {
            if (event.key == "w" || event.key == "a" || event.key == "s" || event.key == "d" || event.key == " ") {
                if (this.player != null && !this.hasEnded) {
                    console.log("hasEnded:", this.hasEnded);
                    this.currentMove = this.movementMap[event.key];
                    this.turn();
                } else {
                    this.end();
                    // Chance to restart
                }
            } else if(event.key == 'r' && this.hasEnded){
                this.levelsCompleted = 0;
                this.messageBox.innerHTML = "";
                this.play(this.maps);
            }
        });
    }

    // Function used to find Player so that the Player can be bound to Game.player.
    findPlayer() {
        let tile;
        for (let y = 0; y < this.area.layout.length; y++) {
            for (let x = 0; x < this.area.layout[y].length; x++) {
                tile = this.area.get(x, y);
                if (tile instanceof Player) {
                    return tile;
                }
            }
        }
        return false;
    }

    // Function used to find Goal so that the Player can be bound to Game.goal.
    findGoal() {
        let tile;
        for (let y = 0; y < this.area.layout.length; y++) {
            for (let x = 0; x < this.area.layout[y].length; x++) {
                tile = this.area.get(x, y);
                if (tile instanceof Goal) {
                    console.log(tile.key, "found at", tile.position.toString());
                    return tile;
                }
            }
        }
    }

    findEnemies() {
        let tile;
        let enemies = [];

        for (let y = 0; y < this.area.layout.length; y++) {
            for (let x = 0; x < this.area.layout[y].length; x++) {
                tile = this.area.get(x, y);
                if (tile instanceof Enemy) {
                    enemies.push(tile);
                }
            }
        }
        return enemies;
    }

    render(str) {
        this.canvas.innerHTML = str;
    }

    play(maps, legend) {
        this.hasEnded = false;
        this.area = new Area();
        this.maps = maps;
        this.area.create(this.maps[this.levelsCompleted], legend);
        this.player = this.findPlayer();
        this.enemies = this.findEnemies();
        this.goal = this.findGoal();
        this.goalReached = false;
        this.scoreboard.innerHTML = this.levelsCompleted.toString() + "/" + this.maps.length.toString();
        this.render(this.area.toString());
    }

    // Function for random Enemy behavior.
    randomize(options) {
        let arr = [];
        for (let option in options) {
            arr.push(options[option]);
        }
        return arr[Math.floor(Math.random() * arr.length)];
    }

    // Can modularize some parts here. Really, sorry for the mess!
    turn() {
        if (this.currentMove.toString() != new Vector(0, 0).toString()) {
            if (this.validateMove(this.player, this.currentMove)) {
                this.area.delete(this.player);
                this.player.move(this.currentMove);
                this.area.insert(this.player);

                // Check if the player has reached the goal.
                if (this.goal.position.toString() == this.player.position.toString()) {
                    console.log("You reached the goal!");

                    this.levelsCompleted++;

                    if (this.levelsCompleted != this.maps.length) {
                        this.play(this.maps);
                        // If player has completed all the levels, declare game finished!
                    } else {
                        this.hasEnded = true;
                    }
                }

                // If Player can't move,  Player may be right next to an enemy. Try an attack.
                // Maybe have player shoot
            } else if (this.validateAttack(this.player, this.currentMove)) {
                let areaOfEffect = this.player.position.add(this.currentMove);
                let entity = this.area.get(areaOfEffect);
                this.player.attack(entity);
                if (entity.isDead) {
                    this.area.delete(entity);
                }
            }
        }

        // Update enemies list incase an enemy has already died.
        this.enemies = this.findEnemies();

        // Enemy's turn to move.
        if (!this.hasEnded) {
            let action;
            for (let i = 0; i < this.enemies.length; i++) {
                // Maybe look before moving. Completely random behavior isn't all that fun.
                action = this.randomize(this.movementMap);
                if (action.toString() != new Vector(0, 0).toString()) {
                    if (this.validateMove(this.enemies[i], action)) {
                        this.area.delete(this.enemies[i]);
                        this.enemies[i].move(action);
                        this.area.insert(this.enemies[i]);

                        // Hmmm... instead maybe have enemy attack in all four directions
                    } else if (this.validateAttack(this.enemies[i], action)) {
                        let areaOfEffect = this.enemies[i].position.add(action);
                        let entity = this.area.get(areaOfEffect);

                        if (entity instanceof Enemy == false) {
                            this.enemies[i].attack(entity);
                        }
                        if (entity.isDead) {
                            this.area.delete(entity);
                            this.area.delete(this.enemies[i]);
                            this.enemies[i].move(action);
                            this.area.insert(this.enemies[i]);
                        }
                    }
                }
            }
        }

        this.currentMove = null;

        if (this.player.isDead) {
            this.hasEnded = true;
        }

        if (this.hasEnded) {
            this.end();
        }

        this.render(this.area.toString());
        this.scoreboard.innerHTML = this.levelsCompleted.toString() + "/" + this.maps.length.toString();
    }

    validateMove(entity, vector) {
        let destination = this.area.get(entity.position.add(vector));
        if (vector != null && destination instanceof Space) {
            return true;
        }
        return false;
    }

    validateAttack(entity, vector) {
        let areaOfEffect = this.area.get(entity.position.add(vector));
        if (vector != null && areaOfEffect instanceof Person) {
            return true;
        }
        return false;
    }

    end() {
        if (this.player.isDead) {
            this.messageBox.innerHTML = "You DIED! Press 'r' to play again.";
        } else {
            this.messageBox.innerHTML = "You ESCAPED! Congratulations! <br> Press 'r' to play again.";
        }
    }
}