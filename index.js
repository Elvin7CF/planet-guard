const canvas = document.querySelector('canvas');

const c = canvas.getContext('2d'); // context

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const scoreEl = document.getElementById('scoreEl');
const startGameBtn = document.getElementById('startGameBtn');
const modalEl = document.getElementById('modalEl');
const bigScoreEl = document.getElementById('bigScoreEl');
const scoreModal = document.getElementById('scoreModal');

// 设置背景音乐
const bgm = new Audio(`sounds/space.mp3`);
bgm.volume = 0.5;

class Player {
  // 玩家
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }

  draw() {
    // 用canvas画圆
    c.beginPath();
    c.arc(this.x, this.y, this.radius, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }
}

class Projectile {
  // 发射导弹
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  draw() {
    // 用canvas画圆
    c.beginPath();
    c.arc(this.x, this.y, this.radius, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }

  // 更新导弹位置，自身位置加速度，也是导弹动画核心
  update() {
    this.draw();
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}

class Enemy {
  // 发射导弹
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  draw() {
    // 用canvas画圆
    c.beginPath();
    c.arc(this.x, this.y, this.radius, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }

  // 更新导弹位置，自身位置加速度，也是导弹动画核心
  update() {
    this.draw();
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}
const friction = 0.99; // 移动时的摩擦系数
class Particle {
  // 粒子
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1; // 透明度
  }

  draw() {
    c.save();
    c.globalAlpha = this.alpha;
    c.beginPath();
    c.arc(this.x, this.y, this.radius, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
    c.restore()
  }

  // 更新导弹位置，自身位置加速度，也是导弹动画核心
  
  update() {
    this.draw();
    this.x += this.velocity.x * friction;
    this.y += this.velocity.y * friction;
    this.alpha -= 0.01;
  }
}

const x = canvas.width / 2;
const y = canvas.height / 2;

let player;
let projectiles;
let enemies;
let particles;

// 初始化游戏
function init() {
  player = new Player(x, y, 10, '#fff'); // 创建玩家实例
  projectiles = []; // 存放导弹
  enemies = []; // 存放敌人
  particles = []; // 存放粒子
  score = 0;
}

function spawnEnemy() {
  setInterval(()=> {
    const radius = Math.random() * 30 + 10; // 敌人半径
    let x;
    let y;

    if(Math.random() > 0.5) {
      // 设置敌人随机产生，让他们只在canvas的边缘产生
      x = Math.random() > 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() > 0.5 ? 0 - radius : canvas.height + radius;
    }

    // 设置敌人颜色为随机色
    const color = `hsl(${Math.random()*360}, 70%, 50%)`;

    const angle = Math.atan2(
      canvas.height / 2 - y,
      canvas.width / 2 - x 
    )

    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle) 
    }

    enemies.push(new Enemy(x, y, radius, color, velocity));
  }, 1000)
} 

window.addEventListener('click', (e) => {

  playSound('shot');
  // 计算点击位置与玩家位置的角度
  const angle = Math.atan2(
    e.clientY - canvas.height / 2,
    e.clientX - canvas.width / 2  
  )

  // 根据角度，计算导弹速度
  const velocity = {
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5 
  }

  projectiles.push(new Projectile(
    canvas.width / 2,
    canvas.height / 2,
    4,
    '#fff',
    velocity
  ))

})


let animateID;
let score = 0;
function animate() {
  // 执行一个动画，让浏览器下次重绘时回调函数
  animateID = requestAnimationFrame(animate);
  c.fillStyle = 'rgba(0, 0, 0, 0.12)'; // 最后一个系数是阴影值
  // 每次画完就消失,清除画布
  c.fillRect(0, 0, canvas.width, canvas.height);
  player.draw();
  scoreEl.innerHTML = score; // 更新分数

  // 更新粒子绘制
  particles.forEach((particle, index) => {
    if(particle.alpha < 0) {
      particles.splice(index, 1);
    }else {
      particle.update();
    }
  })

  // 遍历并执行每一个导弹实例
  projectiles.forEach( (projectile, index) => {
    projectile.update();

    // 清除超出屏幕范围的导弹
    if( projectile.x + projectile.radius < 0 ||
        projectile.x - projectile.radius > canvas.width ||
        projectile.y + projectile.radius < 0 ||
        projectile.y - projectile.radius > canvas.width 
        ) {
      setTimeout(()=> {
        projectiles.splice(index, 1);
      }, 0)
    }
  })

  enemies.forEach( (enemy, eIndex) => {
    // 根据速度变化，更新敌人位置
    enemy.update();
    
    // 计算玩家与敌人的相对距离
    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    // 玩家与敌人碰撞，游戏结束
    if(dist < player.radius + enemy.radius - 0.5) {
      cancelAnimationFrame(animateID);
      bgm.pause(); // 关闭bgm
      playSound('gameover');
      document.body.classList.add("gameover")
      setTimeout(()=>{
        document.body.classList.remove("gameover")
        modalEl.style.display = 'flex'; // 显示得分面板
        bigScoreEl.innerHTML = score; 
      }, 200);

    }

    projectiles.forEach((projectile, pIndex) => {

      // 计算导弹与敌人的相对距离
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
     
      if(dist < enemy.radius + projectile.radius + 1) {

        //生成粒子效果q
        for(let i = 0; i < enemy.radius; i++) {
          particles.push(new Particle(
            projectile.x,
            projectile.y,
            Math.random() * 2,
            enemy.color,
            { // 随机生成[-0.5, 0.5]的数让粒子向不同方向弹出，后面随机生成发射速度
              x: (Math.random() - 0.5) * (Math.random() * 6), 
              y: (Math.random() - 0.5) * (Math.random() * 6)
            }
          ))
        }

        // 播放爆炸声
        playSound('fireworks');

        // 击中后，若秋半径大于10，则缩小球体积
        if(enemy.radius - 15 > 10) {
          score += 10;
          // 用gsap库，让缩减动画更平滑
          gsap.to(enemy, {
            radius: enemy.radius - 15
          })
          // 播放声音
          // playSound('shrink');
          // enemy.radius -= 20;
          setTimeout(()=>{
            projectiles.splice(pIndex, 1);
          }, 0);
        } else {
          score += 25;
          setTimeout(()=> {
            enemies.splice(eIndex, 1);
            projectiles.splice(pIndex, 1);
          }, 0)
        }
      }
      
    })
  })

}

startGameBtn.addEventListener('click', (e)=>{
  bgm.play(); // 播放BGM
  init();
  modalEl.style.display = 'none';
  scoreModal.style.display = 'block';
  animate();
  spawnEnemy();// 产生敌人
})

//产生声音
function playSound(soundName) {
  var sound = new Audio(`sounds/${soundName}.mp3`);
  sound.play();
}


