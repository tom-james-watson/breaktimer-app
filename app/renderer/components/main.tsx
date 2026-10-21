import { Toaster } from "@/components/ui/sonner";
import Break from "./break";
import Settings from "./settings";
import Sounds from "./sounds";
import Statistics from "./statistics/statistics";

export default function Main() {
  const params = new URLSearchParams(location.search);
  const page = params.get("page");

  return (
    <>
      {page === "settings" && <Settings />}
      {page === "statistics" && <Statistics />}
      {page === "sounds" && <Sounds />}
      {page === "break" && <Break />}
      <Toaster />
    </>
  );
}
