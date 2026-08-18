import { CalendarCustomDays } from "./modules/CalenderHistoric/CalenderHistorico";
import { Header } from "./modules/Header/Header";

export default function Home() {
  return (
    <div className="flex flex-col h-full w-full">
      <Header />
      <CalendarCustomDays />
    </div>
  );
}
