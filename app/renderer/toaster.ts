import {Position, Toaster, Intent} from "@blueprintjs/core"

const AppToaster: Toaster = Toaster.create({
  position: Position.TOP,
}) as Toaster

export function toast(message: string, intent: Intent = Intent.NONE) {
  AppToaster.show({message, intent})
}
