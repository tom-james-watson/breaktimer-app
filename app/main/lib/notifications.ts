import {Notification, Event} from 'electron'

export function showNotification(title: string, body: string, onClick?: (e: Event) => void) {
  const notification = new Notification({
    title,
    body,
    icon: 'app/main/icon.png'
  })

  // Ensure notification doesn't stay open longer than 10 secs
  setTimeout(() => {
    notification.close()
  }, 10000)

  if (onClick) {
    notification.on('click', onClick)
  }

  notification.show()
}
