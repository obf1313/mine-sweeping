/** 配置 */
const config = {
  /** 雷数量 */
  mineNum: 80,
  /** 行数 */
  lineNum: 30,
  /** 列数 */
  columnNum: 20
}
/** 雷区 */
let mines = []
const container = document.getElementById('container')
/** 游戏是否结束 */
let isGameOver = false
/**
 * 随机生成雷的位置
 * @param {*} mineNum 
 * @param {*} lineNum 
 * @param {*} columnNum 
 */
function getMinePosition(mineNum, lineNum, columnNum) {
  // 初始化数组
  const mines = new Array(lineNum).fill(false).map(_ => new Array(columnNum).fill(false))
  while (mineNum > 0) {
    const x = Math.floor(Math.random() * lineNum)
    const y = Math.floor(Math.random() * columnNum)
    if (!mines[x][y]) {
      mines[x][y] = true
      mineNum--
    }
  }
  getNum(mines, lineNum, columnNum)
  return mines
}

/**
 * 根据雷获取数字区域
 * @param {*} mines 
 */
function getNum(mines, lineNum, columnNum) {
  for (let i = 0; i < lineNum; i++) {
    for (let j = 0; j < columnNum; j++) {
      const iStart = i === 0 ? 0 : i - 1
      const iEnd = i === (lineNum - 1) ? (lineNum - 1) : i + 1
      const jStart = j === 0 ? 0 : j - 1
      const jEnd = j === (columnNum - 1) ? (columnNum - 1) : j + 1
      // 非雷
      if (mines[i][j] === false) {
        let mineNum = 0
        for (let x = iStart; x <= iEnd; x++) {
          for (let y = jStart; y <= jEnd; y++) {
            // 不是当前元素，且为雷
            if (mines[x][y] === true) {
              mineNum++
            }
          }
        }
        mines[i][j] = mineNum
      }
    }
  }
}

/**
 * 渲染网格
 * @param {*} mineNum 
 * @param {*} lineNum 
 * @param {*} columnNum 
 */
function renderArea(mineNum, lineNum, columnNum) {
  mines = getMinePosition(mineNum, lineNum, columnNum)
  for (let i = 0; i < lineNum; i++) {
    const row = document.createElement('div')
    row.className = 'row'
    for (let j = 0; j < columnNum; j++) {
      const element = document.createElement('div')
      element.classList.add('item')
      element.id = `${i}-${j}`
      row.appendChild(element)
    }
    container.appendChild(row)
  }
}

/**
 * 点击某个格子
 * @param {*} id 
 */
function onItemClick(id) {
  const i = id.split('-')[0]
  const j = id.split('-').pop()
  const element = document.getElementById(id)
  if (typeof mines[i][j] === 'boolean' && mines[i][j]) {
    // 点到雷，游戏结束
    isGameOver = true
    done()
  } else if (mines[i][j] > 0) {
    element.innerText = mines[i][j]
  } else {
    element.classList.add('empty')
  }
}

/**
 * 游戏结束
 */
function done() {
  for (let i = 0; i < mines.length; i++) {
    for (let j = 0; j < mines[i].length; j++) {
      const element = document.getElementById(`${i}-${j}`)
      if (typeof mines[i][j] === 'boolean' && mines[i][j]) {
        element.classList.add('mine')
      } else if (mines[i][j] > 0) {
        element.innerText = mines[i][j]
      } else {
        element.classList.add('empty')
      }
    }
  }
}

// 渲染雷区
renderArea(config.mineNum, config.lineNum, config.columnNum)
// 监听事件
container.addEventListener('click', function (e) {
  if (!isGameOver) {
    const id = e.target.id
    onItemClick(id)
  }
})