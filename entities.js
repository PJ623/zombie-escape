class Entity {
    // May not really need spawnPosition thanks to Area.create()
    constructor(spawnPosition) {
        this.key;
        this.position = spawnPosition;
    }

    setPosition(vector) {
        this.position = vector;
    }

    attack(entity) {
        entity.isDead = true;
    }
}

class Person extends Entity {
    constructor(spawnPosition) {
        super(spawnPosition);
        this.previousPosition = null;
        this.hasMoved = false;
        this.isDead = false;
    }

    move(x, y) {
        let newPosition;
        if (arguments[0] instanceof Vector) {
            newPosition = this.position.add(arguments[0]);
        } else {
            newPosition = this.position.add(new Vector(x, y));
        }
        this.position = newPosition;
    }
}

class Wall extends Entity {
    constructor(spawnPosition) {
        super(spawnPosition);
    }
}

class Enemy extends Person {
    constructor(spawnPosition) {
        super(spawnPosition);
    }
}

class Player extends Person {
    constructor(spawnPosition) {
        super(spawnPosition);
    }
}