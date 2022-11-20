/** 配置 */
const config = {
  /** 雷数量 */
  mineNum: 100,
  /** 行数 */
  lineNum: 30,
  /** 列数 */
  columnNum: 20,
}
/** 雷区 */
let mines = []
const container = document.getElementById('container')
/** 游戏是否结束 */
let isGameOver = false
/** 是否打开调试模式：调试模式会显示所有雷的位置 */
let isDebug = true
/** 是否打开缓存，方便调试 */
let isStore = true

/**
 * 点击调试模式按钮
 */
function onDebugClick() {
  const debugEl = document.getElementById('debug-mode')
  isDebug = !isDebug
  debugEl.innerText = isDebug ? '调试模式已开启' : '调试模式已关闭'
  renderArea(config.mineNum, config.lineNum, config.columnNum)
}
/**
 * 重新开始游戏
 */
function restart() {
  renderArea(config.mineNum, config.lineNum, config.columnNum)
}
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
  if (isStore) {
    localStorage.setItem('mines', JSON.stringify(mines))
  }
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
      const iEnd = i === lineNum - 1 ? lineNum - 1 : i + 1
      const jStart = j === 0 ? 0 : j - 1
      const jEnd = j === columnNum - 1 ? columnNum - 1 : j + 1
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
  container.innerHTML = ''
  // 如果未开启缓存
  if (isStore) {
    mines = JSON.parse(localStorage.getItem('mines')) || getMinePosition(mineNum, lineNum, columnNum)
  } else {
    mines = getMinePosition(mineNum, lineNum, columnNum)
  }
  for (let i = 0; i < lineNum; i++) {
    const row = document.createElement('div')
    row.className = 'row'
    for (let j = 0; j < columnNum; j++) {
      const element = document.createElement('div')
      element.classList.add('item')
      element.id = `${i}-${j}`
      // 开启调试模式显示雷的位置
      if (isDebug) {
        if (typeof mines[i][j] === 'boolean' && mines[i][j]) {
          element.classList.add('mine')
        }
      }
      row.appendChild(element)
    }
    container.appendChild(row)
  }
}

/**
 * 检查周围是否被标了旗子，且旗子数目等于单击格子的数字
 * 如果是，则打开周围格子
 * 如果周围的格子里有雷且该雷不是标的旗子，则游戏结束
 * @param {*} i
 * @param {*} j
 * @returns boolean
 */
function checkRound(i, j) {
  // 格子中数字
  const num = mines[i][j]
  // 旗子数量
  let flagNum = 0
  for (let row = i - 1; row < i + 2; row++) {
    for (let column = j - 1; column < j + 2; column++) {
      const element = document.getElementById(`${row}-${column}`)
      if (element.classList.contains('flag')) {
        flagNum++
      }
    }
  }
  if (flagNum === num) {
    for (let row = i - 1; row < i + 2; row++) {
      for (let column = j - 1; column < j + 2; column++) {
        const element = document.getElementById(`${row}-${column}`)
        if (!element.classList.contains('flag')) {
          if (typeof mines[row][column] === 'boolean' && mines[row][column]) {
            done(row, column)
          } else {
            renderCell(row, column)
          }
        }
      }
    }
  }
  return num === flagNum
}

/**
 * 左键点击某个格子
 * @param {*} id
 */
function onLeftClick(id) {
  const i = Number(id.split('-')[0])
  const j = Number(id.split('-').pop())
  const element = document.getElementById(id)
  // 如果被标了旗子，则不能点击
  if (element.classList.contains('flag')) {
    return
  }
  if (typeof mines[i][j] === 'boolean' && mines[i][j]) {
    // 点到雷，游戏结束
    isGameOver = true
    done(i, j)
  } else if (mines[i][j] > 0) {
    if (!checkRound(i, j)) {
      element.style.backgroundImage = `url(./images/${mines[i][j]}.gif)`
    }
  } else {
    onClickEmpty(i, j)
  }
}

/**
 * 右键点击某个格子
 * @param {*} id
 */
function onRightClick(id) {
  const element = document.getElementById(id)
  // 全都标旗子
  if (element.classList.contains('flag')) {
    element.classList.remove('flag')
  } else {
    element.classList.add('flag')
  }
}

/**
 * 渲染格子
 * @param {*} i
 * @param {*} j
 * @param {*} isMineClick
 */
function renderCell(i, j, isMineClick) {
  const element = document.getElementById(`${i}-${j}`)
  if (typeof mines[i][j] === 'boolean' && mines[i][j]) {
    if (isMineClick) {
      element.classList.add('click-mine')
    } else {
      element.classList.add('mine')
    }
  } else if (mines[i][j] > 0) {
    element.style.backgroundImage = `url(./images/${mines[i][j]}.gif)`
  } else {
    element.classList.add('empty')
    // onClickEmpty(i, j)
  }
}

/**
 * 游戏结束
 */
function done(row, column) {
  for (let i = 0; i < mines.length; i++) {
    for (let j = 0; j < mines[i].length; j++) {
      renderCell(i, j, row === i && column === j)
    }
  }
}

/**
 * 点击空格子，将附近所有空格子点开
 * @param {*} x
 * @param {*} y
 */
function onClickEmpty(x, y) {
  // 所有横向
  let j = y
  let i = x
  while (mines[i][j] === 0 && i > 0) {
    i--
  }
  const iMin = i
  i = x
  while (mines[i][j] === 0 && i < config.lineNum - 1) {
    i++
  }
  const iMax = i
  for (let indexI = iMin; indexI <= iMax; indexI++) {
    while (mines[indexI][j] === 0 && j > 0) {
      j--
    }
    const jMin = j
    j = y
    while (mines[indexI][j] === 0 && j < config.columnNum - 1) {
      j++
    }
    const jMax = j
    j = y
    for (let indexJ = jMin; indexJ <= jMax; indexJ++) {
      renderCell(indexI, indexJ)
    }
  }
}
// 监听左键点击事件
container.addEventListener('click', function (e) {
  const id = e.target.id
  if (!isGameOver && id) {
    onLeftClick(id)
  }
})
// 监听右键点击事件
window.oncontextmenu = function (e) {
  e.preventDefault()
  const id = e.target.id
  if (!isGameOver && id) {
    onRightClick(id)
  }
}
// 渲染雷区
renderArea(config.mineNum, config.lineNum, config.columnNum)
