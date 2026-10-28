/**
 * 滚动进度引擎（无依赖）
 * ------------------------------------------------------------------
 * 把「容器已经滚了百分之几」换算成 0~1 的进度 p，并带惯性平滑。
 *
 * 用法：
 *   const handle = createScrollProgress(scrollerEl, (p) => { ... })
 *   onBeforeUnmount(() => handle.destroy())
 */
/** 夹在 0~1 之间 */
export function clamp01(v: number): number {
    return v < 0 ? 0 : v > 1 ? 1 : v
}
/** 两端慢、中间快 */
export function easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}
/** 起步快、收尾慢（最常用） */
export function easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3)
}
/** 把 p 里 [a, b] 这一段单独拉回 0~1，用来做"某一段动效" */
export function seg(p: number, a: number, b: number): number {
    return clamp01((p - a) / (b - a))
}
/**
 * 惯性系数：每 1/60 秒吃掉剩余差值的 7.5%。
 * 数值越小越"滑"，越大越"跟手"。0 = 关闭惯性，0.3 = 非常黏。
 */
export const DEFAULT_SMOOTH = 0.075
export interface ScrollProgressOptions {
    smooth?: number
}
export interface ScrollProgressHandle {
    destroy(): void
    refresh(): void
    jumpTo(v: number): void
}
export function createScrollProgress(
    scroller: HTMLElement,
    onProgress: (p: number) => void,
    opts: ScrollProgressOptions = {},
): ScrollProgressHandle {
    const smooth = typeof opts.smooth === 'number' ? opts.smooth : DEFAULT_SMOOTH
    let raf = 0
    let last = 0
    let target = 0 // 真实滚动位置对应的进度
    let current = 0 // 实际渲染用的进度（滞后于 target，这就是惯性）
    function readTarget(): void {
        const total = scroller.offsetHeight - window.innerHeight
        const top = scroller.getBoundingClientRect().top
        target = total > 0 ? clamp01(-top / total) : 0
    }
    function frame(ts: number): void {
        let dt: number
        if (!last) {
            last = ts
            dt = 16.667 // 刚被唤醒的这一帧按标准帧长算，避免"卡一下"
        } else {
            dt = Math.min(64, ts - last) // 从后台切回来时不要一步跳完
            last = ts
        }
        readTarget() // 先读布局，再写样式，避免每帧强制回流
        if (smooth <= 0) {
            current = target
        } else {
            // 帧率无关的指数趋近：120Hz 屏和 60Hz 屏手感一致
            const k = 1 - Math.pow(1 - smooth, dt / 16.667)
            current += (target - current) * k
            if (Math.abs(target - current) < 0.0002) current = target // 收尾吸附
        }
        onProgress(current)
        if (current === target) {
            raf = 0
            last = 0
        } else {
            raf = requestAnimationFrame(frame)
        }
    }
    function request(): void {
        if (!raf) raf = requestAnimationFrame(frame)
    }
    window.addEventListener('scroll', request, { passive: true })
    window.addEventListener('resize', request)
    // 首屏：直接把 current 对齐到 target，避免刚进页面就"滑一下"
    readTarget()
    current = target
    onProgress(current)
    return {
        destroy() {
            window.removeEventListener('scroll', request)
            window.removeEventListener('resize', request)
            if (raf) cancelAnimationFrame(raf)
            raf = 0
        },
        refresh() {
            readTarget()
            request()
        },
        jumpTo(v: number) {
            target = current = clamp01(v)
            onProgress(current)
        },
    }
}
/** 调试用：地址栏加 ?p=0.62 可以把画面定格在某个进度，方便截图核对 */
export function forcedProgress(): number | null {
    const m = /[?&]p=([\d.]+)/.exec(location.search)
    const v = m?.[1]
    return v ? clamp01(parseFloat(v)) : null
}
/** 绑定滚动并驱动 render(p)；若地址栏带 ?p=，则只渲染一次定格画面 */
export function bind(
    scroller: HTMLElement,
    render: (p: number) => void,
    opts?: ScrollProgressOptions,
): ScrollProgressHandle {
    const forced = forcedProgress()
    if (forced !== null) {
        render(forced)
        return { destroy() { }, refresh() { }, jumpTo() { } }
    }
    return createScrollProgress(scroller, render, opts)
}
