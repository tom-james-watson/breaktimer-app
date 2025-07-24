import path from "path";
import { Notification, Event } from "electron";

export function showNotification(
  title: string,
  body: string,
  onClick?: (e: Event) => void,
  forceClose = true,
): void {
  let imgPath;
  if (process.platform !== "darwin") {
    imgPath =
      process.env.NODE_ENV === "development"
        ? "resources/tray/icon.png"
        : path.join(process.resourcesPath, "app/resources/tray/icon.png");
  }

  const notification = new Notification({
    title,
    body,
    icon: imgPath,
    silent: process.platform !== "win32",
  });

  if (forceClose && process.platform !== "darwin") {
    // Ensure notification doesn't stay open longer than 10 secs
    setTimeout(() => {
      notification.close();
    }, 5000);
  }

  if (onClick) {
    notification.on("click", onClick);
  }

  notification.show();
}
