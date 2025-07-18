import { Position, OverlayToaster, Intent, Toaster } from "@blueprintjs/core";

let AppToaster: Toaster;

// Initialize the toaster
OverlayToaster.create({
  position: Position.BOTTOM,
}).then((toaster) => {
  AppToaster = toaster;
});

export function toast(message: string, intent: Intent = Intent.NONE) {
  AppToaster?.show({ message, intent });
}
