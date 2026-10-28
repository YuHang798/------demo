<template>
  <!--
    第二层「地理卡片」的内容。
    这个组件会被渲染两次：左门一次、右门一次，两扇门各裁掉一半，
    合起来才是完整的一整层。所以里面的内容必须完全一致（改一处就等于两处都改）。
  -->
  <div class="geo-stage">
    <div class="geo-bg"></div>
    <div class="geo-grid"></div>

    <div class="lab tl"><b>Collection</b><span>作品集 · 2026 春</span></div>
    <div class="lab tr"><b>Vector</b><span>全部由矢量图层绘制</span></div>
    <div class="lab bl"><b>Next</b><span>继续滚动 · 进入登录</span></div>
    <div class="lab br"><b>Layer Group</b><span>每张卡 = 一个图层组</span></div>

    <div class="geo-center">
      <div class="geo-eyebrow"><i></i>Geography Cards</div>
      <div class="geo-h2">一纸山河，<br /><span>四方风物</span></div>
      <p class="geo-p">海岸、沙丘、戈壁与雪山。<br />每一张，都是一次图层渲染与交互的练习。</p>
    </div>
  </div>
</template>

<style scoped>
.geo-stage {
  position: absolute;
  inset: 0;
}

.geo-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(58% 52% at 50% 44%, rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0) 72%),
    radial-gradient(38% 34% at 8% 14%, rgba(99, 102, 241, 0.13), transparent 70%),
    radial-gradient(38% 34% at 92% 86%, rgba(34, 211, 238, 0.12), transparent 70%),
    linear-gradient(166deg, #eef2ff, #e7edfa 52%, #eaf1fb);
}

.geo-grid {
  position: absolute;
  inset: 0;
  opacity: 0.5;
  background-image:
    linear-gradient(rgba(99, 102, 241, 0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(99, 102, 241, 0.07) 1px, transparent 1px);
  background-size: 76px 76px;
  -webkit-mask-image: radial-gradient(64% 58% at 50% 48%, #000 20%, transparent 100%);
  mask-image: radial-gradient(64% 58% at 50% 48%, #000 20%, transparent 100%);
}

/* 中间文案：--cin 由父组件 welcome.vue 每帧写入 */
.geo-center {
  position: absolute;
  left: 50%;
  top: 50%;
  width: min(400px, 30vw);
  text-align: center;
  z-index: 3;
  opacity: var(--cin, 0);
  transform: translate(-50%, -50%) scale(calc(0.94 + 0.06 * var(--cin, 0)));
}

.geo-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  letter-spacing: 0.28em;
  color: #6b78a8;
  text-transform: uppercase;
  padding: 7px 15px;
  border-radius: 999px;
  border: 1px solid rgba(99, 102, 241, 0.22);
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.geo-eyebrow i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #6366f1;
  box-shadow: 0 0 8px #6366f1;
  font-style: normal;
}

.geo-h2 {
  margin-top: 22px;
  font-size: clamp(24px, 2.7vw, 40px);
  line-height: 1.18;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #1b2440;
}

.geo-h2 span {
  background: linear-gradient(100deg, #4f46e5, #6366f1 45%, #22a8c9);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.geo-p {
  margin-top: 16px;
  font-size: 13px;
  line-height: 1.95;
  color: #5c6884;
}

/* 四角小字：--lab 由父组件每帧写入 */
.lab {
  position: absolute;
  z-index: 2;
  opacity: var(--lab, 0);
}

.lab b {
  display: block;
  font-size: 10px;
  letter-spacing: 0.26em;
  color: #8e9ab8;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 5px;
}

.lab span {
  font-size: 12px;
  color: #4a5674;
  font-weight: 500;
}

.lab.tl {
  left: 56px;
  top: 54px;
}

.lab.tr {
  right: 56px;
  top: 54px;
  text-align: right;
}

.lab.bl {
  left: 56px;
  bottom: 54px;
}

.lab.br {
  right: 56px;
  bottom: 54px;
  text-align: right;
}

@media (max-width: 1180px) {

  .lab.tl,
  .lab.bl {
    left: 30px;
  }

  .lab.tr,
  .lab.br {
    right: 30px;
  }
}

@media (max-width: 900px) {
  .lab {
    display: none;
  }

  .geo-center {
    width: 72vw;
  }
}
</style>
