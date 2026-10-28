import { ElNotification, type NotificationParams, type MessageType, ElMessageBox } from "element-plus";
import nprogress from 'nprogress'

// 消息提示
export function toast(
    title: string,
    message: string,
    type: MessageType,
    dangerouslyUseHTMLString = true,
    duration = 3000
) {
    const options: NotificationParams = {
        title,
        message,
        type,
        dangerouslyUseHTMLString,
        duration
    };
    ElNotification(options);
}


export function showModel(title: string, message: string, type: 'success' | 'error' | 'info' | 'warning') {
    return ElMessageBox.confirm(
        message,
        title,
        {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type,
        }
    )
}

// 弹出输入框
export function showPrompt(tip: string, value = '') {
    return ElMessageBox.prompt(tip, '', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        inputValue: value
    })
}

// 加载进度条
export function showFullLoading() {
    nprogress.start()
}

// 消除进度条
export function hideFullLoading() {
    nprogress.done()
}