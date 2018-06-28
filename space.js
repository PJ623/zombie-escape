class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(vector) {
        return new Vector(this.x + vector.x, this.y + vector.y);
    }

    toString() {
        return "(" + this.x + ", " + this.y + ")";
    }
}

class Space {
    constructor() {
        this.key// = "&nbsp;";
    }
}

class Goal extends Space{
    constructor(){
        super();
        this.position;
        //this.key// = "G";
    }
}

class Area {
    constructor() {
        this.length = null;
        this.width = null;
        this.layout = [];
        this.legend = {
            "#": function () {
                return new Wall();
            },
            "0": function () {
                return new Enemy();
            },
            "O": function () {
                return new Player();
            },
            "X": function () {
                return new Goal();
            },
            " ": function () {
                return new Space();
            }//,
            //"G": new Goal // Think of way to implement Goal.
        }

        // Using the legend, the following sets an appropriate .key property for each object used in the game.
        for (let item in this.legend) {
            if (this.legend[item]() instanceof Wall) {
                Wall.prototype.key = item;
            } else if (this.legend[item]() instanceof Enemy) {
                Enemy.prototype.key = item;
            } else if (this.legend[item]() instanceof Player) {
                Player.prototype.key = item;
            } else if (this.legend[item]() instanceof Goal){
                Goal.prototype.key = "&nbsp;"; // Instead of "G"
            } else {
                if(item == " "){
                    Space.prototype.key = "&nbsp;";
                }
            }
        }
    }

    // This class is able to generate a map from a user-made strings.
    // map determines the length and width of the Area.
    /* eg map = 
        [
            #####,
            #P E#,
            #####
        ]
    */
    create(map, legend) {

        // Accept custom legends. Use the default legend if no legend is specified.
        if (legend) {
            this.legend = legend;
        }

        // Reset the layout incase a layout already exists.
        this.layout = [];

        // Chart Area.layout and determine Area's width and length.
        // Length measures the x-axis, while width measures the y-axis.
        let tile;
        for (let y = 0; y < map.length; y++) {
            this.layout.push(new Array(map[y].length));
            for (let x = 0; x < map[y].length; x++) {
                tile = this.legend[map[y][x]]();
                this.insert(x, y, tile);
                if (tile instanceof Entity) {
                    tile.setPosition(new Vector(x, y));
                } else if (tile instanceof Goal){
                    tile.position = new Vector(x,y); // Make setPosition()?
                }
                tile = null;
                this.length = x + 1;
            }
            this.width = y + 1;
        }

        console.log(this.layout);
    }

    // Can take a Vector instead of two coordinates. Can also take Entity and use Entity's .position property.
    // Returns false if coordinates are invalid.
    get(x, y) {
        if (arguments[0] instanceof Entity) {
            if (arguments[0].position.y >= this.layout.length || arguments[0].position.x >= this.layout[arguments[0].position.y].length) {
                return false;
            }
            return this.layout[arguments[0].position.y][arguments[0].position.x];
        } else if (arguments[0] instanceof Vector) {
            if (arguments[0].y >= this.layout.length || arguments[0].x >= this.layout[arguments[0].y].length) {
                return false;
            }
            return this.layout[arguments[0].y][arguments[0].x];
        } else {
            if (y >= this.layout.length || x >= this.layout[y].length) {
                return false;
            }
            return this.layout[y][x];
        }
    }

    // Can take a Vector instead of two coordinates. Can also take Entity and use Entity's .position property.
    delete(x, y) {
        if (this.get(x, y)) {
            if (arguments[0] instanceof Entity) {
                this.layout[arguments[0].position.y][arguments[0].position.x] = new Space();
            } else if (arguments[0] instanceof Vector) {
                this.layout[arguments[0].y][arguments[0].x] = new Space();
            } else {
                this.layout[y][x] = new Space();
            }
        }
        return false;
    }

    // Can take a Vector instead of two coordinates. Can also take Entity and use Entity's .position property.
    insert(x, y, entity) {
        if (arguments[0] instanceof Entity) {
            this.layout[arguments[0].position.y][arguments[0].position.x] = arguments[0];
        } else if (arguments.length == 2 && arguments[0] instanceof Vector && arguments[1] instanceof Entity) {
            this.layout[arguments[0].y][arguments[0].x] = arguments[1];
        } else {
            this.layout[y][x] = entity;
        }
    }

    toString() {
        let str = "";
        let tile;
        for (let y = 0; y < this.layout.length; y++) {
            for (let x = 0; x < this.layout[y].length; x++) {
                tile = this.get(x, y);
                if (tile instanceof Entity) {
                    str += tile.key;
                } else if (tile instanceof Space) {
                    str += tile.key;
                }
            }
            str += "<br>";
        }
        return str;
    }
}