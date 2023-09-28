const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 1024
canvas.height = 576

c.fillRect(0, 0, canvas.width, canvas.height)

const gravity = 0.7

const background = new Sprite({
  position: {
    x: 0,
    y: 0 
  },
  imageSrc: './img/background2.png'
})

const shop = new Sprite({
  position: {
    x: 600,
    y: 225
  },
  imageSrc: './img/shop.png',
  scale: 2.75,
  framesMax: 6
})

const player = new Fighter({
  position: {
    x: 0,
    y: 0
  },
  velocity: {
    x: 0,
    y: 0 
  },
  offset: {
    x: 0,
    y: 0
  },
  imageSrc: './img/Hiraku/Idle.png', 
  framesMax: 8,
  scale: 2.5,
  offset: {
    x: 215,
    y: 156
  },
  sprites: {
    idle: {
      imageSrc: './img/Hiraku/Idle.png', 
      framesMax: 8
    },
    run: {
      imageSrc: './img/Hiraku/Run.png', 
      framesMax: 8
    },
    jump: {
      imageSrc: './img/Hiraku/Jump.png', 
      framesMax: 2
    },
    fall: {
      imageSrc: './img/Hiraku/Fall.png', 
      framesMax: 2
    },
    attack1: {
      imageSrc: './img/Hiraku/Attack1.png', 
      framesMax: 6
    }
  },
  attackBox: {
    offset: {
      x: 105,
      y: 40
    },
    width: 153,
    height: 50
    }
})

const enemy = new Fighter({
    position: {
      x: 400,
      y: 100
    },
    velocity: {
      x: 0,
      y: 0 
    },
    colour: 'blue',
    offset: {
      x: -50,
      y: 0
    },
    imageSrc: './img/Shoji/Idle.png', 
  framesMax: 4,
  scale: 2.5,
  offset: {
    x: 215,
    y: 170
  },
  sprites: {
    idle: {
      imageSrc: './img/Shoji/Idle.png', 
      framesMax: 4
    },
    run: {
      imageSrc: './img/Shoji/Run.png', 
      framesMax: 8
    },
    jump: {
      imageSrc: './img/Shoji/Jump.png', 
      framesMax: 2
    },
    fall: {
      imageSrc: './img/Shoji/Fall.png', 
      framesMax: 2
    },
    attack1: {
      imageSrc: './img/Shoji/Attack1.png', 
      framesMax: 4
    }
  },
  attackBox: {
    offset: {
      x: -150,
      y: 50
    },
    width: 165,
    height: 50
    }
  })

console.log(player)

const key = {
  a: {
    pressed: false 
  },
  d: {
    pressed: false 
  },
  ArrowRight: {
    pressed: false
  },
  ArrowLeft: {
    pressed: false
  }
}

decreaseTimer()

function animate() {
  window.requestAnimationFrame(animate)
  c.fillStyle = 'black'
  c.fillRect(0, 0, canvas.width, canvas.height)
  background.update()
  shop.update()
  player.update()
  enemy.update()

  player.velocity.x = 0
  enemy.velocity.x = 0

  // player movement

  if (key.a.pressed &&  player.lastKey === 'a') {
    player.velocity.x = -5
    player.switchSprite('run')
  } else if (key.d.pressed && player.lastKey === 'd') {
    player.velocity.x = 5
    player.switchSprite('run')
  } else {
    player.switchSprite('idle')
  }

// jumping 
  if (player.velocity.y < 0) {
   player.switchSprite('jump')
  } else if (player.velocity.y > 0 ) {
    player.switchSprite('fall')
  }

  // Enemy movement 
  if (key.ArrowLeft.pressed &&  enemy.lastKey === 'ArrowLeft') {
    enemy.velocity.x = -5
    enemy.switchSprite('run')
  } else if (key.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
    enemy.velocity.x = 5
    enemy.switchSprite('run')
  } else {
    enemy.switchSprite('idle')
  }

  // jumping 
  if (enemy.velocity.y < 0) {
    enemy.switchSprite('jump')
   } else if (enemy.velocity.y > 0 ) {
     enemy.switchSprite('fall')
   }

  // detect for collision 
  if (
    rectangularCollision({
      rectangle1: player,
      rectangle2: enemy 
    }) &&
    player.isAttacking && player.framesCurrent === 4
  ) {
    player.isAttacking = false
    enemy.health -= 10
    document.querySelector('#enemyHealth').style.width = enemy.health + '%'
  }

  // if player misses
  if (player.isAttacking && player.framesCurrent === 4) {
    player.isAttacking = false
  }

  if (
    rectangularCollision({
      rectangle1: enemy,
      rectangle2: player 
    }) &&
    enemy.isAttacking && enemy.framesCurrent === 2
  ) {
    enemy.isAttacking = false
    player.health -= 5
    document.querySelector('#playerHealth').style.width = player.health + '%'
  }

    // if player misses
    if (enemy.isAttacking && enemy.framesCurrent === 2) {
     enemy.isAttacking = false
    }

  // end game based on health 
  if (enemy.health <= 0 || player.health <= 0) {
    determineWinner({ player, enemy, timerId })
  }
}

animate()
 
window.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'd':
      key.d.pressed = true
      player.lastKey = 'd' 
      break
    case 'a':
      key.a.pressed = true
      player.lastKey = 'a'
      break
    case 'w':
      player.velocity.y = -20
      break
    case ' ':
      player.attack()
      break

    case 'ArrowRight':
      key.ArrowRight.pressed = true
      enemy.lastKey = 'ArrowRight'  
      break
    case 'ArrowLeft':
      key.ArrowLeft.pressed = true
      enemy.lastKey = 'ArrowLeft'
      break
    case 'ArrowUp':
      enemy.velocity.y = -20
      break
    case 'ArrowDown':
      enemy.attack()
      break
  }
})

window.addEventListener('keyup', (event) => {
  switch (event.key) {
    case 'd':
      key.d.pressed = false
      break
    case 'a':
      key.a.pressed = false  
      break
  }

  // enemy keys
  switch (event.key) {
    case 'ArrowRight':
      key.ArrowRight.pressed = false
      break
    case 'ArrowLeft':
      key.ArrowLeft.pressed = false  
      break
  }
})
