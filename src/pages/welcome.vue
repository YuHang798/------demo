<template>
  <!--
    滚动式首页 → 地理卡片 → 登录页
    ------------------------------------------------------------------
    整个页面只有一屏（.sticky 100vh），靠外面那个 440vh 高的 .scroller
    制造滚动距离；进度 p 从 0 走到 1，五个图层按各自的区间做动效。

      z1  .login-layer   登录页（原封不动嵌入你原来的 login.vue）
      z2  .reveal-veil   白雾，开轨时从中间变薄，让登录页"浮"出来
      z3  .geo-layer     第二层：两扇门，合起来是一整层
      z4  .cards-layer   四张卡单独一层，所以门推开时它不会被带走
      z5  .hero-layer    首页，用 mask 在正中开一个圆孔
  -->
  <div ref="rootEl" class="welcome-root">
    <!-- 顶部进度条 -->
    <div ref="barEl" class="bar"></div>

    <div ref="scrollerEl" class="scroller">
      <div class="sticky">
        <!-- ================= z1 登录页 ================= -->
        <div ref="loginEl" class="login-layer" :class="{ 'is-ready': ready }">
          <Login />
          <div class="login-seam"></div>
        </div>

        <!-- ================= z2 雾化过渡层 ================= -->
        <div ref="veilEl" class="reveal-veil"></div>

        <!-- ================= z3 第二层：两扇门 ================= -->
        <div ref="geoEl" class="geo-layer">
          <div class="door left">
            <div class="fill"><GeoStage /></div>
          </div>
          <div class="door right">
            <div class="fill"><GeoStage /></div>
          </div>
        </div>

        <!-- ================= z4 卡牌独立层 ================= -->
        <div ref="cardsEl" class="cards-layer">
          <article class="pcard pc1">
            <img class="photo" src="/images/cards/c1.jpg" alt="海岸" />
            <div class="glow"></div>
            <div class="pip tl">01<em>≈</em></div>
            <div class="cap"><b>海岸潮汐</b><i>矢量描边 + 缓冲区</i></div>
          </article>
          <article class="pcard pc2">
            <img class="photo" src="/images/cards/c2.jpg" alt="沙丘" />
            <div class="glow"></div>
            <div class="pip tl">02<em>◇</em></div>
            <div class="cap"><b>沙丘波纹</b><i>栅格晕渲 + 光照</i></div>
          </article>
          <article class="pcard pc3 mirror">
            <img class="photo" src="/images/cards/c3.jpg" alt="戈壁" />
            <div class="glow"></div>
            <div class="pip tl">03<em>◮</em></div>
            <div class="cap"><b>戈壁地脉</b><i>坡度分级 + 色带</i></div>
          </article>
          <article class="pcard pc4 mirror">
            <img class="photo" src="/images/cards/c4.jpg" alt="雪山" />
            <div class="glow"></div>
            <div class="pip tl">04<em>▲</em></div>
            <div class="cap"><b>雪线之上</b><i>等高线 + 雪线叠加</i></div>
          </article>
        </div>

        <!-- ================= z5 首页 ================= -->
        <div ref="heroEl" class="hero-layer">
          <div class="hero-contour"></div>
          <div class="hero-contour2"></div>
          <div class="ap-ring"></div>
          <canvas ref="fxEl" class="hero-fx"></canvas>

          <div class="hero-top">
            <div class="brand"><b>O</b>OPENLAYERS<em>· 作品集</em></div>
            <div class="top-tag">模块化 · 后台管理</div>
          </div>

          <div class="hero-inner">
            <div class="eyebrow"><i></i>OpenLayers · 模块化作品展示</div>
            <h1>把每一层地图<br /><span>都做得更认真一点</span></h1>
            <p class="sub">
              图层、样式、交互与作品管理，都在同一个后台里。向下滚动，先看看这颗星球被折叠成的四张卡片。
            </p>
            <div class="stats">
              <div><b>12</b><i>Layers</i></div>
              <u></u>
              <div><b>04</b><i>Cards</i></div>
              <u></u>
              <div><b>03</b><i>Basemaps</i></div>
            </div>
          </div>

          <div class="hint">
            <div class="mouse"></div>
            <span>向下滚动</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 右下角：阶段指示 + 跳过动画 -->
    <div class="stage">
      <i></i><span>{{ stageName }}</span>
      <button v-show="!ready" class="skip" @click="skipToLogin">直接登录</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import Login from '@/pages/login.vue'
import GeoStage from '@/components/GeoStage.vue'
import {
  bind,
  easeInOutCubic,
  easeOutCubic,
  seg,
  type ScrollProgressHandle,
} from '@/composables/scrollProgress'

/* 你原来的登录页原样放进来，一行都不用改 */

const rootEl = ref<HTMLElement | null>(null)
const scrollerEl = ref<HTMLElement | null>(null)
const heroEl = ref<HTMLElement | null>(null)
const geoEl = ref<HTMLElement | null>(null)
const cardsEl = ref<HTMLElement | null>(null)
const veilEl = ref<HTMLElement | null>(null)
const loginEl = ref<HTMLElement | null>(null)
const barEl = ref<HTMLElement | null>(null)

const ready = ref(false) // 登录表单是否已经可以点
const stageName = ref('01 · 首页')

// 当前滚动进度（0→1）。mouse 特效用它判断第一层是否已经退场
let heroProgress = 0

// 引擎句柄放 shallowRef，避免被 Vue 深层代理
const handle = shallowRef<ScrollProgressHandle | null>(null)

/* 每帧被调用。用 setProperty 写 CSS 变量，
   全程不触发 Vue 响应式，所以滚动是纯合成层动画，很省。 */
function render(p: number) {
  heroProgress = p // 给鼠标特效用：>0.5 时画布不再绘制
  barEl.value?.style.setProperty('width', (p * 100).toFixed(2) + '%')

  /* ---------- 第一层 → 第二层：遮罩开孔 ---------- */
  const open = easeOutCubic(seg(p, 0.02, 0.26)) // 先把孔开到刚好框住中间文案
  const flood = Math.pow(seg(p, 0.26, 0.58), 1.7) // 再一口气铺满整屏
  heroEl.value?.style.setProperty('--r', (open * 24 + flood * 190).toFixed(2) + 'vmax')
  heroEl.value?.style.setProperty('--f', (open * 8 + flood * 26).toFixed(2) + 'vmax')
  heroEl.value?.style.setProperty('--ringop', (0.95 * open * (1 - flood)).toFixed(3))
  heroEl.value?.style.setProperty('--h', easeInOutCubic(seg(p, 0.1, 0.42)).toFixed(4))

  /* ---------- 第二层：四张卡扇开 ---------- */
  cardsEl.value?.style.setProperty('--fan', easeOutCubic(seg(p, 0.3, 0.6)).toFixed(4))
  cardsEl.value?.style.setProperty('--pop', easeInOutCubic(seg(p, 0.6, 0.72)).toFixed(4))

  /* ---------- 第二层 → 登录：先"化"，再开轨 ----------
     这两段必须重叠：卡化到一半时门缝里已经能看见登录页，
     中间才不会出现"什么都没有"的空白帧。 */
  cardsEl.value?.style.setProperty('--out', easeInOutCubic(seg(p, 0.64, 0.8)).toFixed(4))

  const door = easeInOutCubic(seg(p, 0.68, 0.93))
  geoEl.value?.style.setProperty('--open', door.toFixed(4))
  // 中缝羽化：用 0.45 次幂，让门"刚一裂开"就已经是软边，
  // 而不是先给你一条硬竖线、开到最后才勉强糊一下。
  geoEl.value?.style.setProperty('--edge', (Math.pow(door, 0.45) * 48).toFixed(2) + '%')
  // 门本身的淡出：从 0.72 就开始化，一路化到 0，中缝跟着一起散掉
  geoEl.value?.style.setProperty('--fade', easeInOutCubic(seg(p, 0.72, 0.96)).toFixed(4))

  /* ---------- 白雾散开，登录页浮现 ---------- */
  const rev = easeInOutCubic(seg(p, 0.74, 0.97))
  veilEl.value?.style.setProperty('--rev', rev.toFixed(4))
  loginEl.value?.style.setProperty('--rev', rev.toFixed(4))

  /* ---------- 中间文案与四角小字 ----------
     必须在开轨之前彻底消失，否则两扇门一分开，
     文字会被中缝劈成两半。 */
  const fade = 1 - easeInOutCubic(seg(p, 0.64, 0.725))
  geoEl.value?.style.setProperty('--cin', (easeOutCubic(seg(p, 0.18, 0.34)) * fade).toFixed(4))
  geoEl.value?.style.setProperty('--lab', (easeOutCubic(seg(p, 0.56, 0.7)) * fade).toFixed(4))

  /* ---------- 阶段指示 + 表单可点 ---------- */
  const name = p < 0.28 ? '01 · 首页' : p < 0.72 ? '02 · 地理卡片' : '03 · 登录'
  if (name !== stageName.value) stageName.value = name

  // 只有滑到最底部，登录表单才接管鼠标事件
  const nextReady = p > 0.92
  if (nextReady !== ready.value) ready.value = nextReady
}

/** 跳过动画：直接滚到底 */
function skipToLogin() {
  const el = scrollerEl.value
  if (!el) return
  window.scrollTo({ top: el.offsetHeight - window.innerHeight, behavior: 'smooth' })
}

/* ================================================================
   鼠标粒子 + 水波纹（只作用于第一层）
   —— 手写 canvas，零依赖。参考了 GitHub 上几类实现思路：
      · 粒子跟随 / 排布：particles-js 系的 mouse interaction
        https://github.com/joseba-mirena/particles-js
      · 移动涟漪：cursor-ripple 的扩散环
        https://github.com/iamanduru/cursor-ripple
      · 水波质感：water-ripple-horizon
        https://github.com/wentallout/water-ripple-horizon
   没直接引库：一是要跟首页的蓝白淡色调严丝合缝，
   二是不想为了首页一层装饰给项目背一个依赖。
   返回一个 stop()，组件卸载时调用，顺手把监听和 rAF 都清掉。
   ================================================================ */
const fxEl = ref<HTMLCanvasElement | null>(null)
let fxStop: (() => void) | null = null

interface FxParticle {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  a: number
  ph: number
  cyan: boolean
}
interface FxRipple {
  x: number
  y: number
  r: number
  life: number
  grow: number
}

function startHeroFx(canvas: HTMLCanvasElement): () => void {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    canvas.style.display = 'none'
    return () => {}
  }
  const context = canvas.getContext('2d')
  if (!context) return () => {}
  // 显式标成非空类型，不然嵌套函数里 TS 会把 narrowing 丢掉，
  // 一路报 TS18047 "'ctx' is possibly 'null'"
  const ctx: CanvasRenderingContext2D = context

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  let W = 0
  let H = 0
  let T = 0
  let raf = 0
  let alive = true

  let particles: FxParticle[] = []
  let ripples: FxRipple[] = []
  const ptr = { x: -9999, y: -9999, on: false }
  let lastRX = -9999
  let lastRY = -9999

  /* 预渲染光点贴图 —— 比每帧 createRadialGradient 快一个数量级 */
  function makeSprite(rgb: string): HTMLCanvasElement {
    const s = document.createElement('canvas')
    s.width = 64
    s.height = 64
    const c = s.getContext('2d')
    if (c) {
      const g = c.createRadialGradient(32, 32, 0, 32, 32, 32)
      g.addColorStop(0, 'rgba(' + rgb + ',1)')
      g.addColorStop(0.32, 'rgba(' + rgb + ',0.55)')
      g.addColorStop(1, 'rgba(' + rgb + ',0)')
      c.fillStyle = g
      c.fillRect(0, 0, 64, 64)
    }
    return s
  }
  const spIndigo = makeSprite('99,102,241')
  const spCyan = makeSprite('34,182,207')

  function seed() {
    const n = Math.round(Math.min(118, Math.max(46, (W * H) / 15000)))
    particles = []
    for (let i = 0; i < n; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        r: 0.7 + Math.random() * 1.9,
        a: 0.1 + Math.random() * 0.3,
        ph: Math.random() * 6.283,
        cyan: Math.random() < 0.34,
      })
    }
  }

  function resize() {
    const r = canvas.getBoundingClientRect()
    W = Math.max(1, r.width)
    H = Math.max(1, r.height)
    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(H * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    seed()
  }

  function addRipple(x: number, y: number, strong: boolean) {
    ripples.push({ x, y, r: strong ? 5 : 2, life: 1, grow: strong ? 2.6 : 1.6 })
    if (ripples.length > 24) ripples.shift()
  }

  function onMove(e: MouseEvent) {
    const b = canvas.getBoundingClientRect()
    const x = e.clientX - b.left
    const y = e.clientY - b.top
    if (x < 0 || y < 0 || x > W || y > H) return
    ptr.x = x
    ptr.y = y
    ptr.on = true
    const dx = x - lastRX
    const dy = y - lastRY
    if (lastRX < -9000 || dx * dx + dy * dy > 784) {
      // 每移动 28px 落一个涟漪
      addRipple(x, y, false)
      lastRX = x
      lastRY = y
    }
  }

  function onOut() {
    ptr.on = false
    ptr.x = -9999
    ptr.y = -9999
  }

  function onClick(e: MouseEvent) {
    if (heroProgress > 0.24) return
    const b = canvas.getBoundingClientRect()
    const x = e.clientX - b.left
    const y = e.clientY - b.top
    if (x < 0 || y < 0 || x > W || y > H) return
    addRipple(x, y, true)
    addRipple(x, y, true)
  }

  const R_PULL = 150
  const R_PUSH = 96

  function frame() {
    if (!alive) return
    raf = requestAnimationFrame(frame)
    if (!W) return

    // 第一层已经退场：清干净、不再消耗 CPU
    if (heroProgress > 0.5) {
      ctx.clearRect(0, 0, W, H)
      return
    }
    const vis = 1 - heroProgress / 0.5
    if (vis <= 0.02) {
      ctx.clearRect(0, 0, W, H)
      return
    }

    T += 0.016
    ctx.clearRect(0, 0, W, H)
    ctx.globalCompositeOperation = 'source-over'

    /* ---- 1. 跟随光晕 ---- */
    if (ptr.on) {
      const g = ctx.createRadialGradient(ptr.x, ptr.y, 0, ptr.x, ptr.y, 230)
      g.addColorStop(0, 'rgba(99,102,241,0.16)')
      g.addColorStop(0.4, 'rgba(34,182,207,0.075)')
      g.addColorStop(1, 'rgba(99,102,241,0)')
      ctx.fillStyle = g
      ctx.fillRect(ptr.x - 230, ptr.y - 230, 460, 460)
    }

    /* ---- 2. 水波纹 ---- */
    for (let j = ripples.length - 1; j >= 0; j--) {
      const rp = ripples[j]
      if (!rp) continue
      if (rp.grow > 0) {
        // grow=0 的是截图用的定格波纹
        rp.r += rp.grow * (1 + (1 - rp.life) * 1.2)
        rp.life -= 0.016 / 1.05 // 约 1 秒
      }
      if (rp.life <= 0) {
        ripples.splice(j, 1)
        continue
      }
      const al = rp.life * rp.life * 0.4 * vis
      ctx.beginPath()
      ctx.arc(rp.x, rp.y, rp.r, 0, 6.2832)
      ctx.strokeStyle = 'rgba(99,102,241,' + al.toFixed(3) + ')'
      ctx.lineWidth = 1.1 + rp.life * 1.5
      ctx.stroke()
      if (rp.life > 0.55) {
        // 内圈补一道青色，更像水
        ctx.beginPath()
        ctx.arc(rp.x, rp.y, rp.r * 0.72, 0, 6.2832)
        ctx.strokeStyle = 'rgba(34,182,207,' + (al * 0.7).toFixed(3) + ')'
        ctx.lineWidth = 0.9
        ctx.stroke()
      }
    }

    /* ---- 3. 粒子 ---- */
    for (const q of particles) {
      // 缓慢游走 + 一点正弦呼吸
      q.x += q.vx + Math.sin(T * 0.7 + q.ph) * 0.1
      q.y += q.vy + Math.cos(T * 0.62 + q.ph) * 0.1

      let boost = 0
      if (ptr.on) {
        const dx = q.x - ptr.x
        const dy = q.y - ptr.y
        const d2 = dx * dx + dy * dy
        if (d2 < R_PULL * R_PULL && d2 > 0.01) {
          const d = Math.sqrt(d2)
          const f = 1 - d / R_PULL
          // 近处轻轻推开，远处微微吸过来 —— 有"被搅动"的手感
          const dir = d < R_PUSH ? 1 : -0.42
          q.x += (dx / d) * f * dir * 1.15
          q.y += (dy / d) * f * dir * 1.15
          boost = f * f
        }
      }

      // 边界回绕
      if (q.x < -12) q.x = W + 12
      else if (q.x > W + 12) q.x = -12
      if (q.y < -12) q.y = H + 12
      else if (q.y > H + 12) q.y = -12

      const alpha = (q.a + boost * 0.7) * vis
      if (alpha <= 0.004) continue
      const r = q.r * (1 + boost * 0.9)
      const size = r * 8
      ctx.globalAlpha = Math.min(0.92, alpha)
      ctx.drawImage(q.cyan ? spCyan : spIndigo, q.x - size / 2, q.y - size / 2, size, size)
    }
    ctx.globalAlpha = 1
  }

  let rt = 0
  function onResize() {
    clearTimeout(rt)
    rt = window.setTimeout(resize, 140)
  }

  window.addEventListener('mousemove', onMove, { passive: true })
  window.addEventListener('mouseout', onOut, { passive: true })
  window.addEventListener('click', onClick, { passive: true })
  window.addEventListener('resize', onResize, { passive: true })

  resize()

  /* 调试用：地址栏加 &mx=720&my=450，就把"鼠标"钉在某个位置并撒一圈定格波纹，
     方便截图核对效果（正常访问不会触发）。 */
  const dmx = /[?&]mx=(-?[\d.]+)/.exec(location.search)
  const dmy = /[?&]my=(-?[\d.]+)/.exec(location.search)
  if (dmx && dmy) {
    ptr.x = parseFloat(dmx[1] ?? '0')
    ptr.y = parseFloat(dmy[1] ?? '0')
    ptr.on = true
    ripples = [
      { x: ptr.x, y: ptr.y, r: 16, life: 0.98, grow: 0 },
      { x: ptr.x, y: ptr.y, r: 54, life: 0.66, grow: 0 },
      { x: ptr.x, y: ptr.y, r: 104, life: 0.34, grow: 0 },
    ]
  }

  raf = requestAnimationFrame(frame)

  return () => {
    alive = false
    cancelAnimationFrame(raf)
    clearTimeout(rt)
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseout', onOut)
    window.removeEventListener('click', onClick)
    window.removeEventListener('resize', onResize)
  }
}

onMounted(async () => {
  // 从别的页面跳进来时，先把滚动位置归零，否则一进来就是动画中段
  window.scrollTo(0, 0)
  await nextTick() // 等布局稳定再测量高度，否则 offsetHeight 是 0
  const el = scrollerEl.value
  if (!el) return
  handle.value = bind(el, render)

  // 鼠标粒子 / 水波纹
  if (fxEl.value) fxStop = startHeroFx(fxEl.value)
})

onBeforeUnmount(() => {
  handle.value?.destroy()
  handle.value = null
  fxStop?.()
  fxStop = null
  // 离开时把滚动位置归零，避免登录成功后后台首页"继承"这段长滚动
  window.scrollTo(0, 0)
})
</script>

<style scoped>
.welcome-root {
  --indigo: #6366f1;
  --scroll-length: 440vh; /* 滚动总长度，越大越"慢" */
  position: relative;
  color: #1e293b;
  font-family: 'Inter', 'HarmonyOS Sans SC', 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* 顶部进度条 */
.bar {
  position: fixed;
  top: 0;
  left: 0;
  height: 2px;
  width: 0;
  z-index: 99;
  background: linear-gradient(90deg, #818cf8, #22d3ee);
  box-shadow: 0 0 10px rgba(99, 102, 241, 0.55);
}

/* ============ 滚动骨架 ============ */
.scroller {
  height: var(--scroll-length);
  position: relative;
}
.sticky {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
  background: #fbfcff;
}

/* ================================================================
   z1 登录页：只负责"从雾里浮出来"，样式全交给 login.vue 自己
   ================================================================ */
.login-layer {
  position: absolute;
  inset: 0;
  z-index: 1;
  --rev: 0;
  opacity: calc(0.78 + 0.22 * var(--rev));
  transform: scale(calc(1.04 - 0.04 * var(--rev)));
  will-change: opacity, transform;
  pointer-events: none;
}
/* 滑到底才允许点表单，避免在半路上误触 */
.login-layer.is-ready {
  pointer-events: auto;
}

/* login.vue 自己那条 66.67% 的"图 / 白"分栏边是硬的，
   过渡期间在这条边上盖一层白渐变把它糊开；--rev=1 时完全透明，
   所以最终呈现的登录页和原来一模一样。 */
.login-seam {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 59%;
  width: 15%;
  z-index: 12;
  pointer-events: none;
  background: linear-gradient(to right, rgba(255, 255, 255, 0), #fff 55%, #fff 100%);
  opacity: calc((1 - var(--rev)) * 0.96);
}

/* ================================================================
   z2 雾化层：压在登录页之上、门之下
   ================================================================ */
.reveal-veil {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  --rev: 0;
  background:
    radial-gradient(
      70% 62% at 50% 50%,
      rgba(255, 255, 255, 0.96),
      rgba(255, 255, 255, 0.72) 55%,
      rgba(238, 242, 251, 0.42) 100%
    ),
    linear-gradient(168deg, #fbfcff, #eef3ff);
  opacity: calc(0.92 * (1 - var(--rev)));
  will-change: opacity;
}

/* ================================================================
   z3 第二层：两扇门
   ================================================================ */
.geo-layer {
  position: absolute;
  inset: 0;
  z-index: 3;
  --cin: 0;
  --lab: 0;
  --open: 0;
  --fade: 0;
  /* 中缝羽化宽度（相对门宽的百分比），由 JS 写。
     注意只声明在 .geo-layer 上靠继承，别在 .door 上再声明一次，
     否则会盖掉父级传下来的值。 */
  --edge: 0%;
  pointer-events: none;
}
.door {
  position: absolute;
  top: 0;
  height: 100%;
  width: 50.2%; /* 比 50% 多一点，两扇合起来才没有缝 */
  overflow: hidden;
  will-change: transform, opacity, mask-image;
  /* 整扇门一路淡到 0，和卡牌的"化雾"用同一种语言 */
  opacity: calc(1 - var(--fade));
  -webkit-mask-image: linear-gradient(to left, transparent 0, #000 var(--edge, 0%));
  mask-image: linear-gradient(to left, transparent 0, #000 var(--edge, 0%));
}
.door.left {
  left: 0;
  transform: translateX(calc(-101% * var(--open)));
}
.door.right {
  right: 0;
  transform: translateX(calc(101% * var(--open)));
  /* 右门的内侧边在左边，羽化方向相反 */
  -webkit-mask-image: linear-gradient(to right, transparent 0, #000 var(--edge, 0%));
  mask-image: linear-gradient(to right, transparent 0, #000 var(--edge, 0%));
}
/* 每扇门里都放一整屏内容，只是被裁掉一半 —— 合起来才是完整的一层 */
.door .fill {
  position: absolute;
  top: 0;
  height: 100%;
  width: 199.2%;
}
.door.left .fill {
  left: 0;
}
.door.right .fill {
  right: 0;
}

/* ================================================================
   z4 卡牌独立层：不放在门里，所以门推开时它留在原地自己"化"成雾
   ================================================================ */
.cards-layer {
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: none;
  --fan: 0;
  --pop: 0;
  --out: 0;
  --cw: clamp(140px, 14.6vw, 215px);
}

.pcard {
  --tx: 0vw;
  --ty: 0px;
  --rot: 0deg;
  --accent: #33507f;
  position: absolute;
  left: 50%;
  top: 50%;
  width: var(--cw);
  aspect-ratio: 5 / 7; /* 扑克牌比例 */
  border-radius: 16px;
  overflow: hidden;
  background: #fff;
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow:
    0 26px 54px -26px rgba(30, 41, 59, 0.5),
    0 3px 10px rgba(30, 41, 59, 0.07);
  transform: translate(calc(-50% + var(--tx) * var(--fan)), calc(-50% + var(--ty) * var(--fan)))
    rotate(calc(var(--rot) * var(--fan) * (1 - 0.32 * var(--pop))))
    scale(calc(0.74 + 0.26 * var(--fan) + 0.015 * var(--pop) + 0.06 * var(--out)));
  /* 开轨时卡牌自己化掉，而不是跟着门被推出画面 */
  opacity: calc(min(1, var(--fan) * 2.4) * (1 - var(--out)));
  filter: blur(calc(5px * var(--out)));
  will-change: transform, opacity, filter;
}

.pcard .photo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  object-position: center;
}
.pcard .glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.16),
      rgba(255, 255, 255, 0) 30%,
      rgba(255, 255, 255, 0) 56%,
      rgba(255, 255, 255, 0.72) 100%
    ),
    radial-gradient(120% 80% at 50% 0%, rgba(255, 255, 255, 0.18), transparent 60%);
}
/* 底部毛玻璃信息栏 */
.pcard .cap {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 11px 13px 12px;
  background: linear-gradient(to top, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.62));
  -webkit-backdrop-filter: blur(14px) saturate(150%);
  backdrop-filter: blur(14px) saturate(150%);
  border-top: 1px solid rgba(255, 255, 255, 0.9);
}
.pcard .cap b {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: #22304f;
  letter-spacing: 0.02em;
}
.pcard .cap i {
  display: block;
  margin-top: 3px;
  font-style: normal;
  font-size: 10px;
  color: #78859f;
  letter-spacing: 0.02em;
}
/* 左上角编号徽章 */
.pcard .pip {
  position: absolute;
  font-weight: 800;
  line-height: 1;
  color: var(--accent);
  font-size: 11px;
  letter-spacing: 0.02em;
  padding: 5px 8px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.82);
  -webkit-backdrop-filter: blur(10px) saturate(160%);
  backdrop-filter: blur(10px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 12px -6px rgba(30, 41, 59, 0.45);
}
.pcard .pip em {
  display: inline-block;
  font-style: normal;
  font-size: 9px;
  margin-left: 5px;
  opacity: 0.8;
}
.pcard .pip.tl {
  left: 11px;
  top: 10px;
}
/* 右侧两张卡做镜像：编号移到右上、文字右对齐 */
.pcard.mirror .pip.tl {
  left: auto;
  right: 11px;
}
.pcard.mirror .cap {
  text-align: right;
}

/* 四张卡的位置与倾斜 */
.pc1 {
  --tx: -35.5vw;
  --ty: -92px;
  --rot: -7deg;
  --accent: #2f4f86;
}
.pc2 {
  --tx: -21.5vw;
  --ty: 112px;
  --rot: -4deg;
  --accent: #8a5620;
}
.pc3 {
  --tx: 35.5vw;
  --ty: -92px;
  --rot: 7deg;
  --accent: #9c4a26;
}
.pc4 {
  --tx: 21.5vw;
  --ty: 112px;
  --rot: 4deg;
  --accent: #2c6b4f;
}

/* ================================================================
   z5 首页：用 mask 在正中开一个圆孔
   ================================================================ */
.hero-layer {
  position: absolute;
  inset: 0;
  z-index: 5;
  --r: 0vmax;
  --f: 0vmax;
  --h: 0;
  --ringop: 0;
  background:
    radial-gradient(58% 50% at 50% 30%, rgba(99, 102, 241, 0.11), transparent 70%),
    radial-gradient(44% 40% at 86% 80%, rgba(34, 211, 238, 0.11), transparent 72%),
    linear-gradient(168deg, #ffffff, #f9fbff 52%, #f0f4ff);
  -webkit-mask-image: radial-gradient(
    circle at 50% 50%,
    transparent calc(var(--r) - var(--f)),
    transparent var(--r),
    #000 calc(var(--r) + var(--f))
  );
  mask-image: radial-gradient(
    circle at 50% 50%,
    transparent calc(var(--r) - var(--f)),
    transparent var(--r),
    #000 calc(var(--r) + var(--f))
  );
  pointer-events: none;
  will-change: mask-image;
}

/* 鼠标粒子 / 水波纹画布 —— 压在装饰层之上、文字之下（不挡阅读），
   只跟第一层同生共死：随 --h 一起淡出，滚过首页后不再绘制 */
.hero-fx {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: calc(1 - var(--h));
  will-change: opacity;
}

/* 等高线装饰 */
.hero-contour {
  position: absolute;
  inset: 0;
  background-image: repeating-radial-gradient(
    circle at 82% 20%,
    rgba(99, 102, 241, 0.13) 0 1px,
    transparent 1px 52px
  );
  -webkit-mask-image: radial-gradient(66% 66% at 82% 20%, #000, transparent 80%);
  mask-image: radial-gradient(66% 66% at 82% 20%, #000, transparent 80%);
  opacity: 0.6;
}
.hero-contour2 {
  position: absolute;
  inset: 0;
  background-image: repeating-radial-gradient(
    circle at 12% 84%,
    rgba(34, 211, 238, 0.16) 0 1px,
    transparent 1px 64px
  );
  -webkit-mask-image: radial-gradient(58% 58% at 12% 84%, #000, transparent 80%);
  mask-image: radial-gradient(58% 58% at 12% 84%, #000, transparent 80%);
  opacity: 0.55;
}

/* 孔口光环 */
.ap-ring {
  position: absolute;
  left: 50%;
  top: 50%;
  width: calc(var(--r) * 2);
  height: calc(var(--r) * 2);
  transform: translate(-50%, -50%);
  border-radius: 50%;
  box-shadow:
    0 0 0 1px rgba(99, 102, 241, 0.3),
    0 0 70px 10px rgba(99, 102, 241, 0.22),
    0 0 140px 30px rgba(34, 211, 238, 0.1);
  opacity: var(--ringop);
}

.hero-top {
  position: absolute;
  top: 34px;
  left: 44px;
  right: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transform: translateY(calc(-30px * var(--h)));
  opacity: calc(1 - var(--h));
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  letter-spacing: 0.16em;
  color: #3b4763;
  font-weight: 600;
}
.brand b {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 9px;
  background: linear-gradient(140deg, #6366f1, #8b5cf6);
  color: #fff;
  font-size: 13px;
  box-shadow: 0 8px 18px -6px rgba(99, 102, 241, 0.9);
}
.brand em {
  font-style: normal;
  color: #8e9ab8;
  font-weight: 500;
  letter-spacing: 0.1em;
}
.top-tag {
  font-size: 11px;
  letter-spacing: 0.2em;
  color: #8e9ab8;
  text-transform: uppercase;
  padding: 7px 14px;
  border-radius: 999px;
  border: 1px solid rgba(99, 102, 241, 0.16);
  background: rgba(255, 255, 255, 0.7);
}

.hero-inner {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0 24px;
  transform: scale(calc(1 + 0.08 * var(--h))) translateY(calc(-30px * var(--h)));
  filter: blur(calc(8px * var(--h)));
  opacity: calc(1 - var(--h));
  will-change: transform, opacity;
}
.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  letter-spacing: 0.3em;
  color: #5b6790;
  text-transform: uppercase;
  padding: 8px 16px;
  border-radius: 999px;
  border: 1px solid rgba(99, 102, 241, 0.18);
  background: rgba(255, 255, 255, 0.72);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  box-shadow: 0 10px 24px -18px rgba(30, 41, 59, 0.6);
}
.eyebrow i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22b6cf;
  box-shadow: 0 0 10px #22b6cf;
  font-style: normal;
}
.hero-inner h1 {
  margin-top: 28px;
  font-size: clamp(36px, 5.6vw, 76px);
  line-height: 1.07;
  font-weight: 800;
  letter-spacing: -0.025em;
  color: #141c33;
}
.hero-inner h1 span {
  background: linear-gradient(100deg, #4f46e5 4%, #6366f1 38%, #22a8c9 96%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.sub {
  margin-top: 24px;
  max-width: 600px;
  color: #5c6884;
  font-size: 15px;
  line-height: 1.9;
}

.stats {
  margin-top: 38px;
  display: flex;
  align-items: center;
  gap: 34px;
}
.stats div {
  text-align: center;
}
.stats b {
  display: block;
  font-size: 22px;
  font-weight: 800;
  color: #243157;
  letter-spacing: -0.02em;
}
.stats i {
  display: block;
  margin-top: 4px;
  font-style: normal;
  font-size: 11px;
  letter-spacing: 0.18em;
  color: #95a1b8;
  text-transform: uppercase;
}
.stats u {
  display: block;
  width: 1px;
  height: 26px;
  background: rgba(30, 41, 59, 0.12);
  text-decoration: none;
}

.hint {
  position: absolute;
  bottom: 44px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 9px;
  color: #93a0b8;
  font-size: 11px;
  letter-spacing: 0.24em;
  opacity: calc(1 - var(--h));
}
.mouse {
  width: 21px;
  height: 32px;
  border: 1px solid rgba(30, 41, 59, 0.22);
  border-radius: 11px;
  position: relative;
}
.mouse::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 7px;
  width: 3px;
  height: 7px;
  margin-left: -1.5px;
  border-radius: 2px;
  background: #6366f1;
  animation: wheel 1.7s ease-in-out infinite;
}
@keyframes wheel {
  0% {
    opacity: 0;
    transform: translateY(0);
  }
  30% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(11px);
  }
}

/* ============ 右下角阶段指示 ============ */
.stage {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 99;
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 11px;
  letter-spacing: 0.14em;
  color: #5b6790;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid rgba(99, 102, 241, 0.18);
  background: rgba(255, 255, 255, 0.82);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  box-shadow: 0 12px 30px -18px rgba(30, 41, 59, 0.7);
}
.stage i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #6366f1;
  box-shadow: 0 0 8px rgba(99, 102, 241, 0.9);
  font-style: normal;
}
.skip {
  margin-left: 6px;
  padding: 3px 10px;
  border-radius: 999px;
  border: 1px solid rgba(99, 102, 241, 0.28);
  background: rgba(255, 255, 255, 0.9);
  color: #4f46e5;
  font-size: 11px;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: background 0.2s;
}
.skip:hover {
  background: #eef2ff;
}

/* ============ 窄屏适配 ============ */
@media (max-width: 1180px) {
  .pc1 {
    --tx: -34vw;
  }
  .pc2 {
    --tx: -21vw;
  }
  .pc3 {
    --tx: 34vw;
  }
  .pc4 {
    --tx: 21vw;
  }
}

@media (max-width: 900px) {
  .hero-top {
    top: 22px;
    left: 20px;
    right: 20px;
  }
  .hero-inner h1 {
    font-size: clamp(28px, 8vw, 40px);
  }
  .sub {
    font-size: 13px;
    max-width: 86vw;
  }
  .stats {
    gap: 20px;
  }
  .stage {
    right: 12px;
    bottom: 12px;
  }
}

@media (max-width: 720px) {
  .cards-layer {
    --cw: clamp(92px, 26vw, 130px);
  }
  .pc1 {
    --tx: -26vw;
    --ty: -70px;
  }
  .pc2 {
    --tx: -16vw;
    --ty: 96px;
  }
  .pc3 {
    --tx: 26vw;
    --ty: -70px;
  }
  .pc4 {
    --tx: 16vw;
    --ty: 96px;
  }
  .pcard .cap b {
    font-size: 11px;
  }
  .pcard .cap i {
    display: none;
  }
}

/* 尊重"减少动态效果"的系统设置 */
@media (prefers-reduced-motion: reduce) {
  .mouse::after {
    animation: none;
  }
}
</style>
