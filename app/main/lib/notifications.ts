import path from 'path'
import {Notification, Event} from 'electron'

export function showNotification(title: string, body: string, onClick?: (e: Event) => void) {
  const imgPath = process.env.NODE_ENV === 'development' ?
    'app/main/icon.png' :
    path.join(process.resourcesPath, 'icon.png')

  const notification = new Notification({
    title,
    body,
    icon: imgPath
  })

  // Ensure notification doesn't stay open longer than 10 secs
  setTimeout(() => {
    notification.close()
  }, 5000)

  if (onClick) {
    notification.on('click', onClick)
  }

  notification.show()
}
